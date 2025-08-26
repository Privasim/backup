# Artifact Studio: Path A — Local-Only React Wireframe Sandbox (No External Network Calls)

Status: Proposed
Owner: Engineering
Last Updated: 2025-08-26
Guiding Doc: `docs/wireframe-visualization-technical-spec.md`


1) Problem Analysis

- ■ Requirements
  - Render AI-generated interactive wireframes inside a sandboxed iframe.
  - Generated artifact must be plain JavaScript that directly calls `ReactDOM.createRoot(document.getElementById('root')).render(...)`.
  - No JSX, no imports/exports, no bundlers/transpilers at runtime.
  - No external network calls; use only same-origin, self-hosted assets (React UMD, CSS).
  - Tailwind policy: self-hosted local prebuilt CSS or a minimal utility CSS.
  - Sandbox policy: `sandbox="allow-scripts allow-same-origin"` with strict CSP (`default-src 'none'`), enabling non-null origin checks.

- ■ Constraints
  - Must work with existing `public/vendor/react-umd/` assets:
    - `public/vendor/react-umd/react.production.min.js`
    - `public/vendor/react-umd/react-dom.production.min.js`
  - Local CSS must be served from `public/artifact-styles/` (directory exists, currently empty).
  - Align with existing messaging contracts in `src/app/businessidea/tabs/artifact-studio/utils/sandbox-protocol.ts`.
  - Remove dependency on Babel/Sucrase at runtime (no TSX/JSX compile in the browser).

- ■ Assumptions
  - Same-origin requests to local static files (e.g., `/vendor/...`, `/artifact-styles/...`) are allowed and do not violate “no external network calls”.
  - We can add one local CSS artifact (prebuilt) under `public/artifact-styles/` generated at build-time.
  - Generated code from AI will be JavaScript (not TypeScript/JSX) and respects the render contract and constraints.

- ■ Ambiguities (needs clarification)
  - Should we retire `utils/transpile.ts` immediately or keep it behind a feature flag for legacy inputs?
  - Preferred name for the local CSS artifact (e.g., `tailwind-lite.css` vs `utilities.css`).
  - Maximum allowed size for the local CSS file (target ≤ 50–80 KB gzipped?).

- ■ Solution Paths Considered
  - Path A1 (Chosen): about:blank + `doc.write` HTML
    - Pros: Inherits parent origin with `allow-same-origin` → CSP `'self'` works with local `/vendor/*` and `/artifact-styles/*`.
    - Cons: Uses `document.write` (acceptable for sandbox frame bootstrapping only).
  - Path A2: blob URL iframe HTML
    - Pros: Non-null origin, easy cleanup.
    - Cons: Blob origin ≠ parent origin. CSP `'self'` would not match parent-origin `/vendor/*`; would force inlining or relaxed CSP.


2) Rationale

- Eliminating Babel/JSX removes large runtime deps and class of transpile failures.
- Forcing generated JS to use React UMD globals (`React`, `ReactDOM`) and `createElement` ensures transportability and strict sandboxing.
- CSP `default-src 'none'` with narrowly opened `script-src 'self' 'nonce-...'` and `style-src 'self'` blocks all exfiltration routes while allowing only local assets.
- Using `about:blank` + `allow-same-origin` produces a same-origin iframe document, enabling strict `'self'` loads from `/vendor/*` and `/artifact-styles/*`.


3) Implementation Plan

- ■ Files to Create
  - `public/artifact-styles/tailwind-lite.css`
    - Prebuilt minimal utility CSS (Tailwind subset). Built at compile time via Tailwind CLI with purge of the host app content and a curated safelist for likely classes used by generated wireframes (buttons, forms, grid, flex, spacing, colors, typography, focus rings).
  - `src/app/businessidea/tabs/artifact-studio/utils/sandbox-html.ts`
    - Helper to produce the iframe HTML string, embed CSP meta, link local CSS, load local React UMD, and inject the generated JS with a nonce.
  - `src/app/businessidea/tabs/artifact-studio/components/SandboxFrame.tsx`
    - Reusable component that owns the iframe element, generates a per-render nonce, writes the HTML using `doc.write`, and wires parent↔iframe messaging.

- ■ Files to Modify
  - `src/app/businessidea/tabs/artifact-studio/index.tsx`
    - Replace any Babel/JSX transpile paths with Path A pipeline.
    - Ensure the artifact string passed into the frame is plain JS honoring the render contract.
  - `src/app/businessidea/tabs/artifact-studio/utils/sandbox-protocol.ts`
    - Keep as-is for message types; add notes in spec for strict origin validation.
  - `src/app/businessidea/tabs/artifact-studio/utils/transpile.ts`
    - Mark as deprecated behind a feature flag. Retain only for legacy artifacts if strictly necessary. Add preflight validator for banned tokens even in Path A.

- ■ Files to Delete
  - None (deprecate `transpile.ts`, do not remove until fully migrated).

- ■ Interfaces and Contracts
  - Generated JS contract (from AI):
    - No imports/exports.
    - No JSX; use `React.createElement` only.
    - Must render into `#root`:
      `ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App))`.
    - Include interactivity: `React.useState`, controlled inputs, click/submit handlers, visible state changes, accessibility attributes.
    - No `fetch`, `WebSocket`, `XMLHttpRequest`, timers, or `eval`/`Function`.

  - Parent→Iframe message (unchanged):
    - `{ type: 'load', js: string }`

  - Iframe→Parent messages (unchanged):
    - `{ type: 'ready' }`, `{ type: 'runtime-error', message, stack }`, `{ type: 'runtime-log', data }`

- ■ Implementation Details and Complete Snippets

// File: src/app/businessidea/tabs/artifact-studio/utils/sandbox-html.ts
```ts
export interface SandboxHtmlOptions {
  js: string;               // Generated artifact JS (no JSX/imports)
  reactPath?: string;       // Default: '/vendor/react-umd/react.production.min.js'
  reactDomPath?: string;    // Default: '/vendor/react-umd/react-dom.production.min.js'
  cssPath?: string;         // Default: '/artifact-styles/tailwind-lite.css'
  nonce: string;            // Random per-render nonce
  title?: string;           // Optional document title
}

export function buildSandboxHtml({
  js,
  reactPath = '/vendor/react-umd/react.production.min.js',
  reactDomPath = '/vendor/react-umd/react-dom.production.min.js',
  cssPath = '/artifact-styles/tailwind-lite.css',
  nonce,
  title = 'Artifact Sandbox'
}: SandboxHtmlOptions): string {
  const esc = (s: string) => s.replace(/<\/(script)/gi, '<\\/$1');
  const safeJs = esc(js);

  // CSP:
  // - default-src 'none': block everything by default
  // - script-src 'self' 'nonce-...': allow local UMD scripts + a single inline script with matching nonce
  // - style-src 'self': allow local CSS only
  // - img-src 'self' data:; font-src 'self': safe local assets
  // - connect-src 'none': disable network
  // - frame-ancestors 'none': prevent clickjacking of the sandbox document itself
  const csp = [
    "default-src 'none'",
    "script-src 'self' 'nonce-" + nonce + "'",
    "style-src 'self'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'none'",
    "frame-ancestors 'none'"
  ].join('; ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta http-equiv="Content-Security-Policy" content="${csp}" />
<link rel="stylesheet" href="${cssPath}" />
<title>${title}</title>
<style>html, body, #root { height: 100%; }</style>
</head>
<body class="bg-gray-50">
  <div id="root" class="min-h-screen"></div>
  <script src="${reactPath}" crossorigin></script>
  <script src="${reactDomPath}" crossorigin></script>
  <script nonce="${nonce}">
  (function(){
    try { ${safeJs} }
    catch (e) {
      console.error('Runtime error:', e);
      var pre = document.createElement('pre');
      pre.textContent = 'Runtime error: ' + (e && e.message ? e.message : String(e));
      pre.className = 'm-4 p-3 bg-red-50 text-red-800 rounded border border-red-200 overflow-auto';
      document.body.appendChild(pre);
    }
  })();
  </script>
</body>
</html>`;
}
```

// File: src/app/businessidea/tabs/artifact-studio/components/SandboxFrame.tsx
```tsx
import React, { useEffect, useMemo, useRef } from 'react';
import { buildSandboxHtml } from '../utils/sandbox-html';
import { isValidIframeMessage, isTrustedOrigin, ParentToIframe } from '../utils/sandbox-protocol';

export interface SandboxFrameProps {
  code: string;                  // Generated JS artifact
  expectedOrigin: string;        // window.location.origin of the parent
  onRuntimeError?: (msg: string) => void;
  onReady?: () => void;
}

function randomNonce(): string {
  // 128-bit nonce
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

export function SandboxFrame({ code, expectedOrigin, onRuntimeError, onReady }: SandboxFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const nonce = useMemo(randomNonce, [code]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Same-origin about:blank document
    iframe.src = 'about:blank';
    const doc = iframe.contentDocument;
    if (!doc) return;

    const html = buildSandboxHtml({ js: code, nonce });
    doc.open();
    doc.write(html);
    doc.close();
  }, [code, nonce]);

  useEffect(() => {
    const handler = (ev: MessageEvent) => {
      if (!isTrustedOrigin(ev.origin, expectedOrigin)) return;
      if (!isValidIframeMessage(ev.data)) return;
      if (ev.data.type === 'ready') onReady?.();
      if (ev.data.type === 'runtime-error' && ev.data.message) onRuntimeError?.(ev.data.message);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [expectedOrigin, onReady, onRuntimeError]);

  return (
    <iframe
      ref={iframeRef}
      title="Artifact Sandbox"
      className="w-full h-full"
      sandbox="allow-scripts allow-same-origin"
    />
  );
}
```

- ■ Integration Points
  - In `index.tsx`, replace transpile pipeline with direct pass-through of JS to `SandboxFrame`.
  - Ensure any “Regenerate” action re-prompts the AI but keeps the same rendering contract.
  - Keep `banned token` preflight validation before injecting code.

- ■ Performance
  - No runtime compilation: minimal latency and memory.
  - Lightweight CSS: tree-shaken Tailwind subset to reduce CSS parse cost.
  - One-time React UMD loads per iframe instance; reuse frame when possible.

- ■ Error Handling
  - Inline runtime try/catch in sandbox to surface errors visually.
  - PostMessage `runtime-error` to parent for telemetry.
  - Parent UI displays concise error banner and offers regenerate.

- ■ Maintainability
  - Sandbox HTML generator centralizes CSP and asset paths.
  - Feature-flag legacy transpile path; plan removal after migration.


4) Architecture Diagram (Mermaid)

```mermaid
flowchart TD
  U[User] -->|Prompt| G[AI Generation]
  G -->|JS (no JSX)| P[Parent App]
  P -->|code + nonce| H[buildSandboxHtml]
  H -->|HTML string| F[SandboxFrame]
  F -->|doc.write| I[Sandboxed Iframe]
  I -->|ReactDOM.render to #root| W[Wireframe UI]
  I -->|postMessage runtime-error/ready| P
```


5) Testing Plan

- ■ Unit Tests
  - `buildSandboxHtml` emits a CSP with:
    - `default-src 'none'`, `script-src 'self' 'nonce-...'`, `style-src 'self'`, `connect-src 'none'`.
  - Nonce is 32 hex chars (128-bit) and injected into the inline script tag.
  - HTML contains links to `/vendor/react-umd/...` and `/artifact-styles/...` only.
  - Escaping prevents `</script>` breakouts in generated code.

- ■ Integration Tests
  - Iframe loads successfully under `sandbox="allow-scripts allow-same-origin"`.
  - React UMD globals are present and wireframe renders to `#root`.
  - No network calls beyond same-origin: verify via `fetch`/XHR spies in parent are untouched.
  - Posting `{ type: 'ready' }` triggers `onReady`. Throwing inside wireframe triggers runtime error UI and message to parent.

- ■ Edge Cases
  - AI code missing `ReactDOM.createRoot(...).render(...)`: display actionable error and block injection.
  - AI code contains banned tokens: reject before injection with explicit list.
  - Oversized CSS: ensure load still allowed by CSP and layout remains usable.

- ■ Acceptance Criteria
  - Wireframe renders without any third-party network access.
  - CSP violations do not occur under normal use.
  - Interactivity (state, handlers, controlled inputs) is visibly functional.


6) Security & Compliance

- CSP strictly denies all by default and allows only what’s necessary:
  - `default-src 'none'; script-src 'self' 'nonce-<nonce>'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; frame-ancestors 'none'`.
- Iframe `sandbox` denies top-level navigation and form submission by omission; only `allow-scripts allow-same-origin` are present.
- Robust origin checks in parent `message` handler via `isTrustedOrigin(ev.origin, expectedOrigin)`.
- Generated JS contract forbids network APIs and dynamic code eval.


7) Final Checklist

- Create `public/artifact-styles/tailwind-lite.css` with minimal utility set.
- Implement `utils/sandbox-html.ts` and `components/SandboxFrame.tsx`.
- Replace legacy transpile path in `index.tsx` with Path A pipeline.
- Keep banned-token validation preflight.
- Verify CSP in runtime via DevTools (no violations).
- Add tests for CSP contents, nonce correctness, and messaging.


8) Suggested Enhancements (Optional)

- Add a compact “Interactivity badge” in parent UI summarizing validator results (hooks/handlers/components) for the injected JS.
- Provide a small library of prompt templates that bias towards stateful, accessible wireframes.
- Add a CSS “safe class” registry to nudge AI to prefer available utilities; log unknown classes for analysis.
- Consider an optional “inline CSS” mode that inlines `tailwind-lite.css` into the sandbox HTML to remove even same-origin CSS requests when desired.
