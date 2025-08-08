# Prompt-to-UI Streaming Implementation Plan

This plan describes a minimal, high-performance implementation that lets users type any prompt in `src/app/businessidea/tabs/ui-prompt/UIPromptBox.tsx` and see a generated mobile UI preview in real time within `src/app/businessidea/tabs/MobileTab.tsx`. It integrates with the existing Chatbox/OpenRouter setup and preserves your preferences:

- API key managed via `src/components/chatbox/ChatboxControls.tsx` and `useChatboxSettings()`.
- Model selection local to `UIPromptBox.tsx`, persisted in localStorage.

## Objectives
- Generate a mobile UI wireframe from natural language prompts.
- Stream model output live (“code being generated” UX) with progressive preview.
- Keep architecture lean, resilient, and performant.

## Scope & Constraints
- No disruptive changes to `ChatboxControls.tsx` UX.
- Reuse existing OpenRouter client and Chatbox settings utilities.
- Strict JSON-only output contract for models to enable immediate parsing.

## Architecture Overview
- UIPromptBox triggers generation and shows streaming JSON + controls.
- A lightweight provider shares streaming state with the preview.
- Enhanced hook consumes OpenRouter streaming and incrementally parses JSON into the wireframe schema.

### Components & Files
- `src/app/businessidea/tabs/MobileTab.tsx`
  - Wraps content with new `UIGenerationProvider`.
  - Renders both the prompt area and the live preview side-by-side.
- `src/app/businessidea/tabs/ui-prompt/UIPromptBox.tsx`
  - UI for prompt, model selection, start/stop, streaming console, metrics.
- `src/app/businessidea/tabs/ui-prompt/useUIGeneration.ts`
  - Enhance to support streaming, cancelation, incremental parsing, metrics.
- `src/lib/openrouter/client.ts`
  - Already supports streaming via `onChunk` callback. Optional: accept `AbortSignal` to support cancel.
- `src/components/chatbox/utils/settings-utils.ts`
  - Used to retrieve API key per model and preferences.

## Data Flow
```mermaid
flowchart LR
  subgraph UI[MobileTab UI]
    A[UIPromptBox\n`UIPromptBox.tsx`]
    P[Preview Panel\n(UIWireframeRenderer)]
  end

  subgraph Ctx[UIGenerationProvider (Context)]
    S1[(status,error)]
    S2[(streamText)]
    S3[(parsed: WireframeScreen)]
    S4[(metrics)]
  end

  subgraph Settings[Chatbox Settings]
    CS[useChatboxSettings()]
    M[(defaultModel)]
    K[(API Keys)]
  end

  subgraph API[OpenRouter]
    ORC[OpenRouterClient.chat()]
    ORS[[Streaming SSE]]
  end

  A -- generate(prompt, model) --> S1
  A -- model fallback --> M
  M --> CS
  CS -- getApiKey(model) --> K
  K --> A

  A -- stream request --> ORC
  ORC --> ORS
  ORS -- chunks --> ORC
  ORC -- onChunk(content) --> S2

  S2 -- incremental parse --> S3
  S3 --> P
  S4 --> A
  S1 --> A
```

## Streaming & Parsing Strategy (Minimal + Robust)
- System prompt (strict): “Output strictly a single JSON object only. No markdown or code fences. Use fields: `type`, `props`, `children`. Supported node types: `Screen`, `Header`, `Text`, `Button`, `List`, `Card`, `Form`.”
- Stream handling:
  - Append incoming chunks to `streamText`.
  - Sanitize if model accidentally adds ``` fences or leading/trailing noise.
  - Attempt progressive parsing:
    - Use a simple brace-balance scanner to find the largest balanced JSON region within `streamText`.
    - Try `JSON.parse()` on that region. On success, run `validateWireframe()`; if valid, update `parsed` for live preview.
  - Throttle UI updates (50–100ms) or use `requestAnimationFrame` to avoid re-render storms.
- Completion:
  - On `[DONE]`, do a final parse and validation.
  - If still invalid, perform a single non-streaming retry with a stricter prompt, then surface the result/error.

## Provider Contract (Context)
- state:
  - `status: 'idle' | 'streaming' | 'success' | 'error'`
  - `error?: string`
  - `streamText: string` (raw streamed JSON/text)
  - `parsed?: WireframeScreen` (validated structure used by preview)
  - `metrics: { startedAt, lastChunkAt, tokenCount, bytes }`
- actions:
  - `generate(prompt: string, opts?: { model?: string; temperature?: number; maxTokens?: number })`
  - `cancel()`

## Hook Enhancements: `useUIGeneration`
- Integrate `OpenRouterClient.chat(request, { stream: true, onChunk })`.
- Maintain `streamText`, `parsed`, `status`, `error`, and `metrics`.
- Add cancelation support:
  - Preferred: pass `AbortSignal` to `fetch` in client.
  - Minimal alternative: track `isCancelled` and stop processing new chunks; release reader.
- Validation: reuse `validateApiKey`, `validateModel`, `validateWireframe`.
- Model resolution: prefer `settings.getPreferences()?.defaultModel` → `localStorage('openrouter-selected-model')` → first from `getAvailableModels()`.
- API key resolution: `settings.getApiKey(model)`; if missing, read from localStorage keys `'openrouter-api-key'` and fallback `'openrouter_api_key'`.

## MobileTab Layout
- Two-column card (responsive):
  - Left: `UIPromptBox` (prompt, model select, start/stop, stream console, status/metrics).
  - Right: Preview using `UIWireframeRenderer` bound to `parsed` and skeleton while `status==='streaming'`.

## UX & Accessibility
- Buttons: Generate (primary), Stop (secondary), Clear.
- Live region for streaming status updates (ARIA) for screen readers.
- Syntax-highlighted streaming JSON (read-only). Long outputs: virtualized or capped with expand control.
- Metrics: elapsed time, chunk count, model label.

## Performance Optimizations
- Throttle `setState` on `onChunk`.
- Minimal object allocation in scan/parse; reuse buffers where possible.
- Reasonable `max_tokens` (e.g., 600–800) and low `temperature` (≈0.2).
- Optional Phase 2: move parsing to a Web Worker if main-thread cost becomes noticeable.

## Error Handling & Fallbacks
- Map network/API issues via `getErrorMessage()`; show actionable messages.
- If stream never yields valid JSON, perform one non-streaming retry and show final outcome.
- Keep last stream buffer visible for debugging.

## Telemetry & Logging
- Use `chatboxDebug` with channels `ui-prompt` and `OpenRouter`.
- Log: start/end, chunk counts, parse attempts, errors, retries.

## Security & Storage
- Do not persist prompts by default (toggleable later).
- Never log full API keys. Respect key storage in `useChatboxSettings()`.
- LocalStorage keys used:
  - `ui-prompt:selected-model` (local model preference)
  - Back-compat reads for API key: `openrouter-api-key`, `openrouter_api_key`

## Rollout Steps (Minimal Changes First)
1. Create `UIGenerationProvider` (context) and wrap `MobileTab.tsx` content.
2. Enhance `useUIGeneration` with streaming, cancelation, incremental parsing, throttling, and metrics.
3. Update `UIPromptBox` UI:
   - Add Stop button and streaming console panel.
   - Show status, metrics, and errors.
   - Keep existing model selection + persistence.
4. Update `MobileTab` layout to show live preview side-by-side with prompt.
5. Test:
   - Short/long prompts, cancel mid-stream, invalid JSON cases, non-streaming fallback.
   - Model switching and API key resolution via settings.
6. Optimize logs and minor UI polish.

## Acceptance Criteria
- Entering a prompt and clicking Generate streams JSON live and shows a progressive preview.
- Stop cancels immediately (no more chunks processed) and leaves partial content visible.
- Valid final JSON renders in `UIWireframeRenderer`; invalid output triggers a non-streaming retry once, then clear error messaging.
- Model selected in `UIPromptBox` persists to `localStorage('ui-prompt:selected-model')`.
- API key is read from `useChatboxSettings()` with back-compat keys as fallback.
- Smooth UI: no noticeable jank during typical generations.

## Risks & Mitigations
- Model outputs extra text/fences → strict prompt + sanitizer + retry.
- Frequent re-renders → throttle + rAF batching.
- Cancelation not immediate → add AbortSignal to client or ignore chunks + release reader.
- Large outputs → cap tokens and optionally virtualize streaming console.

## Future Enhancements (Optional)
- Web Worker parsing and JSON schema validation with better diagnostics.
- Export generated UI as JSON or scaffold code.
- History of prompts/results with share links.
