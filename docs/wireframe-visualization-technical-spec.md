# Wireframe Visualization Technical Specification

Status: Draft
Owner: Engineering
Last Updated: 2025-08-26
Scope: Standalone implementation guide to recreate AI-driven interactive wireframe generation, validation, and visualization pipeline.


## 1. Purpose & Goals

- Provide a complete, implementation-ready specification to rebuild the following pipeline in a new codebase (without access to any existing project context):
  - Prompt construction and AI call orchestration
  - Interactive wireframe validation, repair, and retry loop
  - In-browser compilation and sandboxed visualization of generated code
  - UI shell for user prompt input, progress display, and wireframe rendering
- Emphasize interactive outputs: every generated wireframe should contain state hooks and event handlers (minimum bar), with optional advanced features.


## 2. Non-Goals

- Not implementing “dataflow generation” (separate feature). This spec focuses on wireframe generation only, while exposing extension points for future integration.
- Not prescribing a specific AI model provider; the API is abstract.


## 3. Technology Stack

- Language: TypeScript, React 18+
- Styling: Tailwind CSS (via CDN in iframe for simplicity)
- Build: Your existing toolchain (Vite, Next.js, CRA, etc.). The iframe payload is compiled at runtime.
- Optional UI icons: lucide-react (or inline SVG fallbacks)
- No other mandatory dependencies. Choose your TypeScript/JS transformer for runtime compilation (see Section 9).

### 3.1 Setup & Dependencies

Use this minimal setup to recreate the system from scratch. Host UI (modal + display) uses Tailwind; the iframe also loads Tailwind via CDN.

- Install packages

```bash
npm i react react-dom
npm i -D typescript @types/react @types/react-dom tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

- Tailwind configuration

```js
// File: tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: {} },
  plugins: [],
};
```

- PostCSS configuration

```js
// File: postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- Global stylesheet

```css
/* File: src/styles/globals.css (or src/app/globals.css for Next.js App Router) */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- TypeScript configuration (strict mode)

```json
// File: tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "ES2020"],
    "jsx": "react-jsx",
    "strict": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": "."
  },
  "include": ["src"]
}
```

- Import stylesheet in your app shell
  - Next.js App Router: `src/app/layout.tsx` -> `import "../styles/globals.css";`
  - Next.js Pages Router: `src/pages/_app.tsx` -> `import "../styles/globals.css";`

- Secrets (server-side only)
  - Create `.env.local` with: `OPENAI_API_KEY=sk-...` (do not expose to the client). The example API route below reads this.


## 4. High-Level Architecture

```mermaid
flowchart TD
  A[User] -->|inputs prompt| B[VisualizationModal]
  B -->|construct messages| C[wireframePrompt]
  C -->|ChatMessage[]| D[askAIToGenerateWireFrame]
  D -->|AI call + retries| E[AI Provider (abstract)]
  D -->|validated code| F[WireframeDisplay]
  F -->|validate interactivity| G[wireframeValidator]
  F -->|compile & render| H[Sandboxed Iframe]
  B <-->|events: reset/regenerate| F
```


## 5. Modules & Contracts

This section defines each module to implement, its public API, responsibilities, and integration notes.

### 5.1 wireframePrompt.ts

Responsibilities:
- Provide prompt helpers and code extraction for AI responses.

Exports:
- `extractFirstCodeBlock(input: string): string`
- `DESIGN_SYSTEM_PROMPT: string` (system prompt guiding AI output to be interactive and self-contained)
- `INTERACTIVITY_EXAMPLES: string` (optional illustrative examples incorporated into prompt as needed)
- `CreateWireframePrompt(sys: string, userPrompt: string): ChatMessage[]`

Types and full implementation:
```ts
// File: src/prompts/wireframePrompt.ts
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export function extractFirstCodeBlock(input: string): string {
  const codeBlockRegex = /```(?:\w+)?\s*([\s\S]*?)```/;
  const match = input.match(codeBlockRegex);
  return match ? match[1].trim() : '';
}

const INTERACTIVITY_REQUIREMENTS = [
  'IMPORTANT: Output MUST be a SINGLE JavaScript code block, no prose outside the block.',
  'Use ONLY React UMD globals: React and ReactDOM; NO imports/exports.',
  'NO JSX. Use React.createElement exclusively.',
  'Render to element #root via ReactDOM.createRoot(...).render(...).',
  'Include state via React.useState and visible UI updates.',
  'All buttons must have onClick handlers that change state.',
  'All inputs must be controlled (value + onChange).',
  'Provide responsive layout via Tailwind classes in className.',
  'Accessibility: keyboard-accessible controls, aria-labels where needed.',
  'No network requests; self-contained demo only.',
  'Bypass authentication for any login flows (simulate success inline).'
].join('\n');

export const INTERACTIVITY_EXAMPLES = `
- Examples of interactivity to include when relevant:
  - Counters, toggles, tabs, accordions
  - Controlled forms with validation and inline feedback
  - Progress indicators, simulated loading, status badges
  - Simple graphs using divs/SVG, no external libs
`;

export const DESIGN_SYSTEM_PROMPT = `
You are an expert UI engineer. Produce a self-contained, interactive wireframe.

Constraints:\n${INTERACTIVITY_REQUIREMENTS}

Visual & UX guidance:
- Clean, modern layout using Tailwind utility classes.
- Clear visual feedback on interactions (active states, badges, counters).
- Use semantic HTML elements and aria-* attributes.
- Ensure content scales for mobile and desktop.

Return exactly one JavaScript code block. No commentary.
`.trim();

export function createWireframePrompt(system: string, userPrompt: string): ChatMessage[] {
  const enhanced = `${userPrompt.trim()}\n\n${INTERACTIVITY_REQUIREMENTS}`;
  return [
    { role: 'system', content: system.trim() },
    { role: 'user', content: enhanced }
  ];
}
```

Notes:
- The `DESIGN_SYSTEM_PROMPT` should enforce: state hooks + event handlers, controlled inputs, visible feedback, responsive layout, accessibility basics, and a single self-contained code block.


### 5.2 wireframeValidator.ts

Responsibilities:
- Verify that generated code is “interactive enough”.
- Provide feedback for a retry prompt.
- Attempt minimal auto-repair on last retry.

Exports:
- `validateWireframeInteractivity(code: string): ValidationResult`
- `createInteractivityFollowupPrompt(originalPrompt: string, result: ValidationResult): string`
- `injectMinimalInteractivity(code: string): string`

Types and Core Logic (full):
```ts
// File: src/utils/wireframeValidator.ts
export interface ValidationResult {
  isInteractive: boolean;
  hasStateHooks: boolean;
  hasEventHandlers: boolean;
  hasComponents: boolean;
  hasNetworkGraph: boolean; // optional advanced pattern
  hasTerminalSim: boolean;   // optional advanced pattern
  hasGamification: boolean;  // optional advanced pattern
  hasSimulationControl: boolean; // optional advanced pattern
  missingPatterns: string[];
}

function testRegex(code: string, pattern: RegExp): boolean {
  return pattern.test(code);
}

export function validateWireframeInteractivity(code: string): ValidationResult {
  const hasStateHooks =
    testRegex(code, /\buseState\s*\(/) || testRegex(code, /\bReact\.useState\s*\(/);

  const handlerPatterns = [
    /\bonClick\b\s*[:=]/,
    /\bonChange\b\s*[:=]/,
    /\bonSubmit\b\s*[:=]/,
    /\baddEventListener\s*\(\s*['\"](click|change|submit)/,
  ];
  const hasEventHandlers = handlerPatterns.some((rx) => testRegex(code, rx));

  const hasComponents =
    testRegex(code, /\bfunction\s+[A-Z]\w*\s*\(/) ||
    testRegex(code, /\bconst\s+[A-Z]\w*\s*=\s*\(/) ||
    testRegex(code, /\bReact\.createElement\s*\(/);

  // Optional domain patterns
  const hasNetworkGraph =
    testRegex(code, /\b(graph|node|edge|force|dagre|sankey)\b/i) &&
    testRegex(code, /\bsvg|canvas\b/i);

  const hasTerminalSim =
    testRegex(code, /\bterminal|shell|console\b/i) &&
    testRegex(code, /\bonKeyDown|onKeyUp|onInput\b/);

  const hasGamification =
    testRegex(code, /\bbadge|achievement|level|xp|progress\b/i) &&
    hasEventHandlers;

  const hasSimulationControl =
    testRegex(code, /\bplay|pause|step|speed\b/i) && hasEventHandlers;

  const missingPatterns: string[] = [];
  if (!hasStateHooks) missingPatterns.push('React.useState not detected');
  if (!hasEventHandlers) missingPatterns.push('Event handlers (onClick/onChange/...) not found');
  if (!hasComponents) missingPatterns.push('No React component structure detected');

  const isInteractive = hasStateHooks && hasEventHandlers && hasComponents;

  return {
    isInteractive,
    hasStateHooks,
    hasEventHandlers,
    hasComponents,
    hasNetworkGraph,
    hasTerminalSim,
    hasGamification,
    hasSimulationControl,
    missingPatterns,
  };
}

export function createInteractivityFollowupPrompt(
  originalPrompt: string,
  result: ValidationResult
): string {
  const missing = result.missingPatterns.length
    ? `Missing: ${result.missingPatterns.join(', ')}.`
    : 'Improve interactivity, accessibility, and responsiveness.';
  return `${originalPrompt.trim()}

Please improve the wireframe to be fully interactive:
- Add React.useState and handlers that visibly change UI
- Controls must be keyboard accessible and labeled
- Ensure rendering is via ReactDOM.createRoot(document.getElementById('root')).render(...)
- Use React.createElement only (no JSX)
- Be concise and self-contained

${missing}
`;
}

/**
 * Inject a minimal interactive widget without modifying original component tree.
 * Appends an extra React root onto a floating container. Guarantees presence of
 * useState and onClick, satisfying interactivity gate while remaining unobtrusive.
 */
export function injectMinimalInteractivity(code: string): string {
  const injection = `
;(function () {
  try {
    var inj = document.createElement('div');
    inj.id = 'injected-ui';
    inj.style.position = 'fixed';
    inj.style.bottom = '12px';
    inj.style.right = '12px';
    inj.style.zIndex = '2147483647';
    document.body.appendChild(inj);
    function Injected() {
      const _a = React.useState(0), count = _a[0], setCount = _a[1];
      return React.createElement(
        'button',
        {
          onClick: function () { setCount(count + 1); },
          className: 'px-3 py-2 rounded bg-indigo-600 text-white shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500',
          'aria-label': 'Injected interactivity button'
        },
        'Interactivity OK (', String(count), ')'
      );
    }
    ReactDOM.createRoot(inj).render(React.createElement(Injected));
  } catch (e) {
    console.error('Injection failed', e);
  }
})();`;
  return `${code}\n${injection}`;
}
```

Notes:
- Keep the regex library-free (simple `RegExp`).
- Advanced patterns are optional; the gate is hooks + handlers + component presence.


### 5.3 askAIToGenerateWireFrame.ts

Responsibilities:
- Orchestrate AI call(s) to generate an interactive React wireframe.
- Implement small retry budget using follow-up prompt when validation fails.
- On last attempt, try `injectMinimalInteractivity`.
- Cache successful outputs (keyed by `prompt+model+extension`) to reduce cost/latency.

Public API (standalone abstraction, full):
```ts
// File: src/services/askAIToGenerateWireFrame.ts
import { createWireframePrompt, DESIGN_SYSTEM_PROMPT, extractFirstCodeBlock, ChatMessage } from '../prompts/wireframePrompt';
import { validateWireframeInteractivity, createInteractivityFollowupPrompt, injectMinimalInteractivity } from '../utils/wireframeValidator';

export interface AIClientResult { result: string }
export type AIClient = (
  messages: ChatMessage[],
  modelId: string,
  stream?: boolean,
  modelExtension?: unknown,
  abortSignal?: AbortSignal,
  userSession?: unknown
) => Promise<AIClientResult>;

export interface GenerateWireframeOptions {
  modelId: string;
  modelExtension?: unknown; // provider-specific extensions
  userSession?: unknown;    // auth/session if required by provider
  onPreGenerate?: () => void;
  onAIResponse?: () => void;
  onVerified?: () => void;
  cache?: Map<string, string>;
  maxRetries?: number; // default 2
}

export default async function askAIToGenerateWireFrame(
  prompt: string,
  aiClient: AIClient,
  options: GenerateWireframeOptions
): Promise<string> {
  const {
    modelId,
    modelExtension,
    userSession,
    onPreGenerate,
    onAIResponse,
    onVerified,
    cache,
    maxRetries = 2
  } = options;

  const cacheKey = `${prompt}_${modelId}_${String(modelExtension ?? '')}`;
  if (cache?.has(cacheKey)) {
    const cached = cache.get(cacheKey)!;
    const valid = validateWireframeInteractivity(cached);
    if (valid.isInteractive) {
      onPreGenerate?.();
      onAIResponse?.();
      onVerified?.();
      return cached;
    } else {
      cache.delete(cacheKey);
    }
  }

  onPreGenerate?.();

  let attempt = 0;
  let lastCode = '';
  let lastValidation = null as ReturnType<typeof validateWireframeInteractivity> | null;

  while (attempt < maxRetries) {
    attempt++;
    const userPrompt = attempt === 1 || !lastValidation
      ? prompt
      : createInteractivityFollowupPrompt(prompt, lastValidation);

    const messages = createWireframePrompt(DESIGN_SYSTEM_PROMPT, userPrompt);
    const response = await aiClient(messages, modelId, false, modelExtension, undefined, userSession);

    if (!response?.result) throw new Error('No AI result');

    onAIResponse?.();

    const code = extractFirstCodeBlock(response.result)
      .replace(/```(?:react|tsx|jsx|javascript|js|typescript|ts|html)?\s*|```/g, '')
      .trim();

    if (!code) throw new Error('AI returned no code block');

    lastCode = code;
    lastValidation = validateWireframeInteractivity(code);
    if (lastValidation.isInteractive) break;

    if (attempt === maxRetries) {
      const repaired = injectMinimalInteractivity(code);
      const repairedValidation = validateWireframeInteractivity(repaired);
      if (repairedValidation.isInteractive) {
        lastCode = repaired;
        lastValidation = repairedValidation;
      }
    }
  }

  if (lastValidation?.isInteractive) {
    onVerified?.();
    cache?.set(cacheKey, lastCode);
    return lastCode;
  }

  // Return best-effort code even if not fully interactive to allow UI to show repair/regenerate affordances.
  return lastCode;
}
```

Notes:
- `DESIGN_SYSTEM_PROMPT` referenced above is imported from your prompt module (same file, or re-export).
- The AI client API is abstract; integrate your provider accordingly.


### 5.4 WireframeDisplay.tsx

Responsibilities:
- Receive the generated code (as a string) and render it in a sandboxed iframe.
- Validate interactivity and display status badge with missing elements.
- Provide a “Regenerate with Interactivity” action (emit a custom event) if needed.
- Expose a fullscreen control.

Props & Behavior (full):
```tsx
// File: src/components/WireframeDisplay.tsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { validateWireframeInteractivity } from '../utils/wireframeValidator';
import { compileTypescript } from '../utils/compiler';

export interface WireframeDisplayProps {
  code: string | null;
  onWireframeRendered?: (code: string) => void;
}

type Status = 'interactive' | 'partial' | 'static';

export function WireframeDisplay({ code: initialCode, onWireframeRendered }: WireframeDisplayProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [status, setStatus] = useState<Status>('static');
  const [missing, setMissing] = useState<string[]>([]);
  const codeRef = useRef<string | null>(null);
  codeRef.current = initialCode ?? null;

  const validate = useCallback((src: string) => {
    const result = validateWireframeInteractivity(src);
    if (result.isInteractive) {
      setStatus('interactive');
      setMissing([]);
    } else if (result.hasComponents) {
      setStatus('partial');
      setMissing(result.missingPatterns);
    } else {
      setStatus('static');
      setMissing(result.missingPatterns);
    }
  }, []);

  const writeIframe = useCallback(async (src: string) => {
    const html = await compileTypescript(src);
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
  }, []);

  const renderCode = useCallback(async () => {
    if (!codeRef.current) return;
    const src = codeRef.current;
    validate(src);
    await writeIframe(src);
    onWireframeRendered?.(src);
  }, [validate, writeIframe, onWireframeRendered]);

  useEffect(() => {
    if (!initialCode) return;
    renderCode();
  }, [initialCode, renderCode]);

  useEffect(() => {
    const onReset = () => {
      const iframe = iframeRef.current;
      if (iframe?.contentWindow) {
        iframe.src = 'about:blank';
      }
      setStatus('static');
      setMissing([]);
    };
    window.addEventListener('resetVisualizations', onReset);
    return () => window.removeEventListener('resetVisualizations', onReset);
  }, []);

  const onRegenerate = () => {
    const currentCode = codeRef.current ?? '';
    const ev = new CustomEvent('regenerateWithInteractivity', { detail: { currentCode } });
    window.dispatchEvent(ev);
  };

  const onFullscreen = async () => {
    const el = iframeRef.current?.parentElement;
    if (!el) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await el.requestFullscreen();
    }
  };

  const badge = useMemo(() => {
    const base = 'px-2 py-1 text-xs rounded';
    if (status === 'interactive') return <span className={`${base} bg-green-100 text-green-800 border border-green-200`}>Interactive</span>;
    if (status === 'partial') return <span className={`${base} bg-amber-100 text-amber-800 border border-amber-200`}>Partially Interactive</span>;
    return <span className={`${base} bg-gray-100 text-gray-800 border border-gray-200`}>Static</span>;
  }, [status]);

  return (
    <div className="w-full border rounded-lg bg-white shadow-sm">
      <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          {badge}
          {missing.length > 0 && (
            <div className="text-xs text-gray-600">
              Missing: {missing.join('; ')}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {status !== 'interactive' && (
            <button
              onClick={onRegenerate}
              className="px-2 py-1 text-xs rounded bg-indigo-600 text-white hover:bg-indigo-700"
              aria-label="Regenerate with interactivity"
            >
              Regenerate
            </button>
          )}
          <button
            onClick={onFullscreen}
            className="px-2 py-1 text-xs rounded bg-gray-800 text-white hover:bg-black"
            aria-label="Toggle fullscreen"
          >
            Fullscreen
          </button>
        </div>
      </div>
      <div className="aspect-[16/9] w-full">
        <iframe
          ref={iframeRef}
          title="Wireframe"
          className="w-full h-full"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}
```

Notes:
- Inject Tailwind via CDN inside the iframe `<head>` for convenience.
- Use `sandbox="allow-scripts allow-same-origin"` and do NOT allow `allow-top-navigation` or external network.
- Provide a compact, accessible badge area describing “Interactive / Partially Interactive / Static”.
- Fullscreen: call `containerRef.current?.requestFullscreen()`; add `document.onfullscreenchange` listener.


### 5.5 VisualizationModal.tsx

Responsibilities:
- Shell UI for prompt entry and action button (Visualize).
- Shows progress/status text during asynchronous operations (optional if you track it).
- Emits a `resetVisualizations` event before starting a new generation.
- Receives rendered wireframe callback for further actions.

Public API (full):
```tsx
// File: src/components/VisualizationModal.tsx
import React from 'react';
import { WireframeDisplay } from './WireframeDisplay';

export interface VisualizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  onPromptChange: (value: string) => void;
  onVisualize: (e: React.MouseEvent | React.FormEvent, prompt: string) => Promise<void> | void;
  isLoading?: boolean;
  progress?: number; // 0..100
  statusText?: string;
  errorMessage?: string;
  onError?: (msg: string) => void;
  onWireframeRendered?: (code: string) => void;
  code?: string | null;
}

export function VisualizationModal({
  isOpen,
  onClose,
  prompt,
  onPromptChange,
  onVisualize,
  isLoading,
  progress,
  statusText,
  errorMessage,
  onWireframeRendered,
  code = null,
}: VisualizationModalProps) {
  if (!isOpen) return null;

  const handleVisualize = (e: React.MouseEvent | React.FormEvent) => {
    window.dispatchEvent(new Event('resetVisualizations'));
    return onVisualize(e, prompt);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">AI Wireframe Visualization</h2>
          <button
            onClick={onClose}
            className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
            aria-label="Close modal"
          >
            Close
          </button>
        </div>

        <div className="p-4 grid gap-4 md:grid-cols-3">
          <div className="md:col-span-1 space-y-3">
            <label htmlFor="prompt" className="text-sm font-medium">Prompt</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              className="w-full h-40 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Describe the UI. Example: A dashboard with a togglable sidebar, a filter form, and a live counter..."
            />
            <button
              onClick={handleVisualize}
              disabled={!!isLoading}
              className="w-full px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? 'Generating...' : 'Visualize'}
            </button>
            {typeof progress === 'number' && (
              <div className="w-full">
                <div className="h-2 bg-gray-200 rounded">
                  <div className="h-2 bg-indigo-600 rounded" style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
                </div>
                {statusText && <div className="text-xs text-gray-600 mt-1">{statusText}</div>}
              </div>
            )}
            {errorMessage && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
                {errorMessage}
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <WireframeDisplay code={code ?? null} onWireframeRendered={onWireframeRendered} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

Notes:
- Keep the modal minimal and portable. Avoid project-specific dependencies.
- Before `onVisualize`, dispatch `window.dispatchEvent(new Event('resetVisualizations'))` to clear previous render.


## 6. End-to-End Flow

1) User enters a prompt in `VisualizationModal` and clicks Visualize.
2) Modal calls an app-level handler which uses `askAIToGenerateWireFrame()` with your AI client implementation.
3) The service constructs messages via `CreateWireframePrompt()`, calls AI, extracts the first code block, and validates interactivity.
4) If not interactive, it retries once with a follow-up prompt. On final attempt, applies minimal auto-repair.
5) The verified (or best-effort) code string is passed into `WireframeDisplay` which compiles and renders it in a sandboxed iframe.
6) `WireframeDisplay` shows an interactivity badge. If not interactive, provides a “Regenerate with Interactivity” action by dispatching a bubbling `CustomEvent('regenerateWithInteractivity', { detail: { currentCode } })` which the parent can listen to and re-run generation with an augmented prompt.


## 7. Error Handling & UX

- Network/AI failures: show a concise error banner in the modal; allow retry.
- Missing code block: surface an actionable error ("AI returned no code block").
- Compilation error: show the error and the source code (collapsed by default in production).
- Validation failures: proceed to retry/auto-repair; if still failing, render best-effort and expose regenerate action.


## 8. Security Considerations

- Iframe sandbox: use `sandbox="allow-scripts allow-same-origin"`; do not allow `allow-top-navigation`, `allow-forms`, or `allow-downloads`.
- No external requests inside rendered code. The AI prompt must instruct: no external network fetch; self-contained only.
- Escape and sanitize any UI-rendered strings outside the iframe context (regular React escaping applies).
- Consider CSP headers that restrict the iframe to inline scripts only if possible.


## 9. Runtime Compilation Strategy

The reference uses a `compileTypescript(code: string)` helper. In this standalone implementation you have choices:

- Browser-side: Babel Standalone or Sucrase to transform TSX to JS at runtime.
  - Pros: no server dependency; fully client-side.
  - Cons: bundle size impact; performance for very large code.
- Server-side: `ts.transpileModule` (TypeScript) or esbuild on server, then inject compiled code into iframe.
  - Pros: smaller client; faster compile with esbuild.
  - Cons: requires server endpoint.

Contract to implement (full HTML writer):
```ts
// File: src/utils/compiler.ts
/**
 * Produces a complete HTML document string that:
 * - Loads Tailwind CSS, React, ReactDOM UMD from CDN
 * - Creates a #root container
 * - Executes the provided code inside a safe IIFE
 * The provided code must mount into #root via ReactDOM.createRoot(...).render(...)
 */
export async function compileTypescript(code: string): Promise<string> {
  const esc = (s: string) => s.replace(/<\/script>/gi, '<\\/script>');
  const safeCode = esc(code);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"
/>
<title>Wireframe</title>
<style>
  html, body, #root { height: 100%; }
</style>
<\/head>
<body class="bg-gray-50">
  <div id="root" class="min-h-screen"></div>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin><\/script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin><\/script>
  <script>
  (function () {
    try {
      ${safeCode}
    } catch (e) {
      console.error('Runtime error:', e);
      var err = document.createElement('pre');
      err.textContent = 'Runtime error: ' + (e && e.message ? e.message : String(e));
      err.className = 'm-4 p-3 bg-red-50 text-red-800 rounded border border-red-200 overflow-auto';
      document.body.appendChild(err);
    }
  })();
  <\/script>
<\/body>
<\/html>`;
}
```

Notes:
- We intentionally avoid JSX to eliminate the need for Babel/Sucrase at runtime.
- The CDN UMD builds isolate React to the iframe and keep host dependencies minimal.

### 5.6 Example AI Client Integration (Next.js API Route + Client Adapter)

Server-side route (prevents leaking API key):

```ts
// File: src/app/api/wireframe/route.ts (Next.js App Router)
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { messages, modelId } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return new Response('Missing OPENAI_API_KEY', { status: 500 });

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages,
        temperature: 0.2,
        stream: false,
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      return new Response(`Upstream error ${res.status}: ${t}`, { status: 500 });
    }
    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content ?? '';
    return Response.json({ result: content });
  } catch (e: any) {
    return new Response(`Server error: ${e?.message ?? String(e)}`, { status: 500 });
  }
}
```

Client adapter implementing AIClient:

```ts
// File: src/services/aiClients/httpClient.ts
import type { ChatMessage } from '../../prompts/wireframePrompt';
import type { AIClient, AIClientResult } from '../askAIToGenerateWireFrame';

export const httpAIClient: AIClient = async (
  messages: ChatMessage[],
  modelId: string
): Promise<AIClientResult> => {
  const res = await fetch('/api/wireframe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, modelId }),
  });
  if (!res.ok) throw new Error(`AI route error ${res.status}`);
  const data = await res.json();
  return { result: data.result as string };
};
```

Example integration in a page/component:

```tsx
// File: src/features/wireframe/DemoHarness.tsx
import React, { useCallback, useMemo, useState } from 'react';
import askAIToGenerateWireFrame from '../../services/askAIToGenerateWireFrame';
import { httpAIClient } from '../../services/aiClients/httpClient';
import { VisualizationModal } from '../../components/VisualizationModal';

export function DemoHarness() {
  const [open, setOpen] = useState(true);
  const [prompt, setPrompt] = useState('Create a dashboard with a filter form and a live counter');
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState<string | undefined>(undefined);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [code, setCode] = useState<string | null>(null);
  const cache = useMemo(() => new Map<string, string>(), []);

  const onVisualize = useCallback(async (_e: any, p: string) => {
    setIsLoading(true); setErrorMessage(undefined); setStatusText('Requesting AI...'); setProgress(10);
    try {
      const result = await askAIToGenerateWireFrame(p, httpAIClient, {
        modelId: 'gpt-4o-mini',
        onPreGenerate: () => { setStatusText('Sending prompt...'); setProgress(20); },
        onAIResponse: () => { setStatusText('Validating output...'); setProgress(60); },
        onVerified: () => { setStatusText('Rendering...'); setProgress(85); },
        cache,
        maxRetries: 2,
      });
      setCode(result); setStatusText('Done'); setProgress(100);
    } catch (e: any) {
      setErrorMessage(e?.message ?? String(e));
    } finally {
      setIsLoading(false);
      setTimeout(() => { setProgress(undefined); setStatusText(undefined); }, 800);
    }
  }, [cache]);

  return (
    <VisualizationModal
      isOpen={open}
      onClose={() => setOpen(false)}
      prompt={prompt}
      onPromptChange={setPrompt}
      onVisualize={onVisualize}
      isLoading={isLoading}
      progress={progress}
      statusText={statusText}
      errorMessage={errorMessage}
      onWireframeRendered={(c) => console.log('Rendered', c.slice(0, 80) + '...')}
      code={code}
    />
  );
}
```

Reference injection pattern inside `WireframeDisplay`:
- Compose a minimal HTML document with Tailwind CDN in `<head>` and the compiled markup/script in `<body>`.
- Write document via `doc.open(); doc.write(html); doc.close();` with try/catch.


## 10. Accessibility & Responsiveness

- The generated wireframe should:
  - Use proper ARIA roles for complex widgets
  - Support keyboard navigation in all interactive controls
  - Maintain adequate color contrast (Tailwind utility classes)
  - Be responsive via grid/flex utilities and media queries


## 11. Performance

- Cache interactive outputs using a bounded Map (e.g., capacity = 20). Evict FIFO when full.
- Defer expensive work until needed (only compile when new code arrives).
- Avoid multiple validations per render; cache validation result in component state.


## 12. Testing Strategy

- Unit Tests
  - `wireframePrompt.extractFirstCodeBlock`: parses the first fenced block; handles languages (```tsx, ```js, etc.).
  - `wireframeValidator.validateWireframeInteractivity`: positive and negative cases; edge cases (empty string).
  - `askAIToGenerateWireFrame`: retry path, follow-up prompt, auto-repair fall-through; cache hit path.
- Integration Tests
  - `WireframeDisplay` renders a simple interactive code sample; badge shows “Interactive”.
  - Simulate compilation error; error shown; code preview optionally rendered.
- E2E (optional)
  - Full flow: type prompt, click visualize, receive code, render in iframe, show interactivity badge.


## 13. Extension Points (Optional)

- Model fallback UI: provide a panel to retry with a different modelId.
- Dataflow generation: after wireframe success, offer a button to run a separate pipeline (not in scope here).
- Settings panel: theme/layout/density selectors to append instructions to the prompt.


## 14. File Structure (Suggested)

```
src/
  components/
    VisualizationModal.tsx
    WireframeDisplay.tsx
  prompts/
    wireframePrompt.ts
  services/
    askAIToGenerateWireFrame.ts
  utils/
    wireframeValidator.ts
    compiler.ts
```


## 15. Implementation Checklist

- [ ] Implement `wireframePrompt.ts` (messages, system prompt, extractor)
- [ ] Implement `wireframeValidator.ts` (patterns, follow-up, minimal repair)
- [ ] Implement `askAIToGenerateWireFrame.ts` (AI client abstraction, retries, cache)
- [ ] Implement `compiler.ts` (runtime compile strategy)
- [ ] Implement `WireframeDisplay.tsx` (iframe render, badge, events)
- [ ] Implement `VisualizationModal.tsx` (input, button, progress, reset event)
- [ ] Wire the pieces in your app and test E2E


## 16. Acceptance Criteria

- Given a reasonable UI prompt, the system returns a single, self-contained React code block and renders it in an iframe.
- If the output is not interactive, the system retries with a follow-up prompt and/or auto-repairs minimal interactivity.
- The UI clearly indicates interactivity status and provides a regenerate affordance.
- The solution runs without project-specific dependencies and requires only React, TypeScript, and Tailwind.
