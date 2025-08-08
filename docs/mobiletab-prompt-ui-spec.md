# MobileTab Prompt-to-UI/Wireframe Feature Specification

Status: Draft
Owner: Cascade
Last updated: 2025-08-08 08:27 (+08:00)

## Goals
- Provide a new prompt box in `src/app/businessidea/tabs/MobileTab.tsx` that generates a mobile UI/wireframe via OpenRouter.
- Reuse the existing Chatbox OpenRouter infrastructure. Treat `src/components/chatbox/ChatboxControls.tsx` as the masterfile for integration conventions (models, key storage, validation).
- Keep the implementation highly modular, minimal, and performant.
- Enforce file size budget: each new/modified file should stay under ~200 lines.

## Constraints & Non-Goals
- No server components or backend additions.
- No database persistence; use localStorage/SecureStorage as already established.
- No full-blown streaming parser for partial JSON initially (non-streaming first; streaming can be added later).

## High-Level Architecture
- New "Prompt UI" bundle (4 small modules) under `src/app/businessidea/tabs/ui-prompt/`:
  1) `UIPromptBox.tsx` — small UI for prompt input + validation + state display.
  2) `useUIGeneration.ts` — hook to call OpenRouter and manage request lifecycle.
  3) `UIWireframeRenderer.tsx` — tiny, deterministic renderer for a JSON DSL → Tailwind UI.
  4) `types.ts` — minimal UI DSL types to ensure safe rendering.
- `MobileTab.tsx` integrates `UIPromptBox`, displays outputs in its existing card container.
- All OpenRouter access (model list, api key access, validation) follows the same patterns as `ChatboxControls.tsx`:
  - `getAvailableModels()` from `src/lib/openrouter/index.ts`
  - API key + default model via `useChatboxSettings()` from `src/components/chatbox/utils/settings-utils.ts`
  - Validation via `src/components/chatbox/utils/validation-utils.ts`

## Files To Create
1) `src/app/businessidea/tabs/ui-prompt/UIPromptBox.tsx`
   - Purpose: UX for prompt entry, submit, and displaying generation results.
   - Responsibilities:
     - Textarea input + character limits.
     - Validate model/API key via `validateApiKey`, `validateModel`.
     - Call `useUIGeneration()` with the prompt and selected model.
     - Render loading/error states; pass parsed result to `UIWireframeRenderer`.
   - Dependencies:
     - `useUIGeneration`
     - `useChatboxSettings` (for api key + model)
     - `validation-utils`
     - `getAvailableModels`
   - Size budget: ≤ 180 lines.

2) `src/app/businessidea/tabs/ui-prompt/useUIGeneration.ts`
   - Purpose: Encapsulate OpenRouter interaction and lifecycle.
   - Responsibilities:
     - Read active model and API key via `useChatboxSettings()`.
     - Fallback read for legacy keys (`openrouter-api-key`, `openrouter-selected-model`) if needed (temporary bridge).
     - Construct strict JSON-only prompt (no markdown) and call `OpenRouterClient.chat()` non-streaming.
     - Parse and validate the JSON DSL into `WireframeScreen` (from `types.ts`).
     - Expose state `{ status: 'idle'|'loading'|'success'|'error', error?: string, result?: WireframeScreen }`.
   - Dependencies:
     - `OpenRouterClient` from `src/lib/openrouter/client.ts`
     - `getAvailableModels`
     - `useChatboxSettings`
     - `validation-utils`
     - `types.ts`
   - Size budget: ≤ 160 lines.

3) `src/app/businessidea/tabs/ui-prompt/UIWireframeRenderer.tsx`
   - Purpose: Safe, deterministic mapping from JSON DSL → Tailwind components (no arbitrary HTML).
   - Responsibilities:
     - Minimal set of nodes: `Screen`, `Header`, `Text`, `Button`, `List`, `Card`, optionally `Form` (subset only).
     - Stateless functional component with memoization where helpful.
     - Graceful fallback for unknown/invalid nodes.
   - Dependencies:
     - `types.ts`
   - Size budget: ≤ 160 lines.

4) `src/app/businessidea/tabs/ui-prompt/types.ts`
   - Purpose: Define the minimal DSL for a mobile screen wireframe.
   - Responsibilities:
     - Provide TypeScript interfaces: `WireframeNode`, `WireframeScreen`, and node-specific props.
   - Size budget: ≤ 60 lines.

## Files To Modify
1) `src/app/businessidea/tabs/MobileTab.tsx`
   - Add the new `UIPromptBox` region (above placeholder text or replacing it) within the existing card.
   - No heavy logic; keep this file small and focused.

2) (Optional bridge; no immediate code change required but recommended for robustness)
   - `src/components/chatbox/utils/settings-utils.ts`
     - Consider adding a migration helper or read fallback from `openrouter-api-key`/`openrouter-selected-model` into `ChatboxSettingsManager`-style storage to unify settings across app.

## Data Flow
1) User types prompt in `UIPromptBox`.
2) `UIPromptBox` pulls `model` and `apiKey` from `useChatboxSettings()`; validates via `validation-utils` and `getAvailableModels()`.
3) `UIPromptBox` calls `useUIGeneration.generate(prompt)`.
4) `useUIGeneration` uses `OpenRouterClient.chat()` non-streaming, expecting strict JSON response.
5) JSON parsed → `WireframeScreen` object.
6) `UIPromptBox` renders `UIWireframeRenderer` with parsed result inside `MobileTab`.

## OpenRouter Prompting Guidelines (Non-Streaming v1)
- Use a system prompt + user prompt enforcing strict JSON-only output.
- Disallow markdown/code fences; require a single JSON object matching our DSL.
- Keep outputs small (wireframe-level, not full code) to ensure fast parsing and display.
- Example target schema (illustrative):
```json
{
  "type": "Screen",
  "props": { "title": "Login" },
  "children": [
    { "type": "Header", "props": { "title": "Welcome" } },
    { "type": "Text", "props": { "value": "Sign in to continue" } },
    { "type": "Form", "props": { "fields": [
      { "type": "TextField", "name": "email", "label": "Email" },
      { "type": "PasswordField", "name": "password", "label": "Password" }
    ]}},
    { "type": "Button", "props": { "label": "Continue", "variant": "primary" } }
  ]
}
```

## Validation & Error Handling
- Preflight checks in `UIPromptBox`:
  - `validateApiKey(apiKey)`, `validateModel(model, getAvailableModels())`.
  - Prompt length limits (e.g., 1–1000 chars).
- Request lifecycle in `useUIGeneration`:
  - `status: 'loading'` during fetch; show spinner.
  - Try/catch for network/parse errors; map to human-readable error via `getErrorMessage`.
  - Validate parsed JSON (node types and required props) before rendering. If invalid, show concise error.
- Logging (optional): use `chatboxDebug` (from `logStore.ts`) with sanitized key info.

## Performance
- Keep components small; memoize renderer where helpful.
- Non-streaming JSON for v1 to avoid partial parse overhead.
- Consider result caching (prompt hash → DSL JSON in localStorage) if needed later.

## Accessibility & UX
- `UIPromptBox`:
  - Label the prompt textarea; announce validation errors.
  - Keyboard-friendly submit; prevent accidental double-submit while loading.
- Renderer:
  - Semantically appropriate elements; readable contrast by default.

## Security & Storage
- API keys sourced via `useChatboxSettings()` (uses `SecureStorage` under the hood).
- Do not log raw keys; use `sanitizeApiKey` if logging is necessary.
- Avoid rendering arbitrary HTML; only map known node types.

## Testing Strategy
- Unit tests:
  - `useUIGeneration`: success, network error, invalid JSON, invalid schema.
  - `UIWireframeRenderer`: node mapping and fallback behavior.
  - `UIPromptBox`: validation and state transitions.
- Integration tests:
  - `MobileTab` with prompt flow end-to-end (mock OpenRouterClient).
- (Optional) Snapshot tests for common wireframes.

## Implementation Sequence (Checklist)
1) Create `types.ts` (DSL).
2) Implement `useUIGeneration.ts` (non-streaming, strict JSON parsing).
3) Implement `UIWireframeRenderer.tsx` (minimal node set).
4) Implement `UIPromptBox.tsx` (UI + validation + state).
5) Integrate into `MobileTab.tsx` (place prompt section within existing card UI).
6) (Optional) Add settings fallback bridge for legacy keys.
7) Tests + QA pass.

## Dependencies to Reuse
- `src/components/chatbox/ChatboxControls.tsx` — master conventions for OpenRouter usage.
- `src/components/chatbox/utils/settings-utils.ts` — `useChatboxSettings()` for keys and default model.
- `src/components/chatbox/utils/validation-utils.ts` — API key/model validation + error helpers.
- `src/lib/openrouter/index.ts` — `getAvailableModels()`.
- `src/lib/openrouter/client.ts` — `OpenRouterClient`.

## Risks & Mitigations
- Inconsistent storage between `MobileSettingsPanel` and Chatbox settings → temporary fallback reads in `useUIGeneration`; plan a follow-up unification/migration.
- LLM returns non-JSON or oversized payloads → strict instructions + length cap + defensive parsing + clear error UI.
- Scope creep in renderer → limit to a small, documented node set; extend iteratively.

## Acceptance Criteria
- A user can input a prompt in `MobileTab` and see a rendered wireframe within the same view.
- Uses the same model and API key that Chatbox uses (via shared settings); no separate configuration required.
- All new/modified files remain ≤ 200 LOC each, are readable, and modular.
- Proper validation, loading, and error states are visible.
- No sensitive data leaks in logs.
