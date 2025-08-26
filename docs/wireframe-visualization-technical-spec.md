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

Types:
```ts
// File: src/prompts/wireframePrompt.ts
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const extractFirstCodeBlock = (input: string): string => {
  const codeBlockRegex = /```(?:\w+)?\s*([\s\S]*?)```/;
  const match = input.match(codeBlockRegex);
  return match ? match[1].trim() : '';
};

export const DESIGN_SYSTEM_PROMPT = `... long system prompt emphasizing interactivity, accessibility, responsiveness, and single self-contained React component return ...`;

export const INTERACTIVITY_EXAMPLES = `... optional examples (login bypass, counters, forms, progress, etc.) ...`;

const INTERACTIVITY_REQUIREMENTS = [
  'IMPORTANT: Your wireframe MUST include interactive elements!',
  '- Use React hooks (useState, useEffect, etc.) for state management',
  '- Every button MUST have onClick handlers that update state',
  '- Forms MUST have controlled inputs (value + onChange)',
  '- Include visible feedback for user interactions',
  '- Show state changes in the UI (counters, toggles, conditional rendering)'
].join('\n');

export default function CreateWireframePrompt(sys: string, userPrompt: string): ChatMessage[] {
  const enhancedPrompt = `${userPrompt.trim()}\n\n${INTERACTIVITY_REQUIREMENTS}`;
  return [
    { role: 'system', content: sys.trim() },
    { role: 'user', content: enhancedPrompt }
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

Types and Core Logic:
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

export const validateWireframeInteractivity = (code: string): ValidationResult => {
  // Detect via regex patterns for hooks, handlers, and basic component structure.
  // Consider advanced patterns for richer scenarios, but only the basics gate interactivity.
  // Return flags and a `missingPatterns` list suitable for user-facing retries.
  // (Replicate the behavior: state hooks + event handlers + components => interactive)
  return /* implementation per reference */ {} as any;
};

export const createInteractivityFollowupPrompt = (
  originalPrompt: string,
  result: ValidationResult
): string => {
  // Build a user message explaining missing elements; request improvements.
  return /* implementation per reference */ '';
};

export const injectMinimalInteractivity = (code: string): string => {
  // If non-interactive at final retry, inject a minimal useState and onClick handler
  // into the first suitable component and button, preserving imports if needed.
  return /* implementation per reference */ code;
};
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

Public API (standalone abstraction):
```ts
// File: src/services/askAIToGenerateWireFrame.ts
import CreateWireframePrompt, { extractFirstCodeBlock, ChatMessage } from '@/prompts/wireframePrompt';
import { validateWireframeInteractivity, createInteractivityFollowupPrompt, injectMinimalInteractivity } from '@/utils/wireframeValidator';

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

    const messages = CreateWireframePrompt(DESIGN_SYSTEM_PROMPT, userPrompt);
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

Props & Behavior:
```tsx
// File: src/components/WireframeDisplay.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { validateWireframeInteractivity } from '@/utils/wireframeValidator';

export interface WireframeDisplayProps {
  code: string | null;
  onWireframeRendered?: (code: string) => void;
}

export function WireframeDisplay({ code: initialCode, onWireframeRendered }: WireframeDisplayProps) {
  // 1) compile code to runnable HTML (see Section 9 for compiler strategies)
  // 2) write into <iframe sandbox="allow-scripts allow-same-origin">
  // 3) emit interactivity status badge and a `regenerateWithInteractivity` event if not interactive
  // 4) listen for global `resetVisualizations` to clear iframe
  return null; // implement per reference behavior
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

Public API (example):
```tsx
// File: src/components/VisualizationModal.tsx
import React from 'react';

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
}

export function VisualizationModal(props: VisualizationModalProps) {
  // Implement minimal version: input + visualize button, progress bar, error area, and embed <WireframeDisplay /> if you want to colocate it.
  return null;
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

Contract to implement:
```ts
// File: src/utils/compiler.ts
export async function compileTypescript(code: string): Promise<string> {
  // Return full HTML or a JS + mount snippet; reference implementation wrote out a full HTML string.
  // Minimal contract: return a string that can be injected into <body> of the iframe document.
  return '';
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
