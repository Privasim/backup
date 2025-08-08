# MobileTab Prompt-to-UI/Wireframe Feature — Implementation Summary

This document summarizes the full implementation, integrations, and follow-up fixes for the MobileTab prompt UI feature that generates mobile wireframes via OpenRouter and renders them inline.

## Scope and Objectives
- Provide a minimal, modular prompt box on `MobileTab` that:
  - Lets users select an LLM model locally.
  - Sends prompts to OpenRouter using the API key managed by ChatboxControls.
  - Receives JSON-only wireframe output and renders it.
  - Adds robust validation, error handling, and debuggability via a central Debug Panel.
- Keep files small (≤ 200 LOC per new file) and changes localized.

## Files Created

- `src/app/businessidea/tabs/ui-prompt/types.ts`
  - Defines the minimal JSON DSL for wireframes.
  - Key types: `WireframeNode`, `WireframeScreen`, node variants (`container`, `text`, `button`, `input`, etc.).
  - Purpose: Standardize the contract between the LLM and front-end renderer.

- `src/app/businessidea/tabs/ui-prompt/useUIGeneration.ts`
  - React hook orchestrating prompt → OpenRouter → JSON parse → validation → result.
  - Integrates with Chatbox settings via `useChatboxSettings()` to read API keys and model list (API key stays in ChatboxControls).
  - Validations: API key, model id, prompt length; structured error messages via `getErrorMessage`.
  - Logging (added later): emits detailed request/response/parse/validation logs to a global store under category `ui-prompt`.

- `src/app/businessidea/tabs/ui-prompt/UIWireframeRenderer.tsx`
  - Stateless renderer that converts the JSON DSL into Tailwind-styled UI.
  - Safe fallbacks for unknown nodes to avoid runtime crashes.

- `src/app/businessidea/tabs/ui-prompt/UIPromptBox.tsx`
  - Prompt input UI, model selector (local-only persistence: `ui-prompt:selected-model`), Submit and Clear.
  - Integrates with `useUIGeneration()` to trigger generation and display states.
  - Styling update (later): increased input contrast with `text-gray-800` and `placeholder:text-gray-400`.

- `docs/mobiletab-prompt-ui-spec.md` (spec authored earlier)
  - Detailed system design and integration plan, treating `ChatboxControls.tsx` as OpenRouter master file.

## Files Modified

- `src/app/businessidea/tabs/MobileTab.tsx`
  - Integrated `UIPromptBox` into the Mobile view; replaced placeholder UI.
  - Preserved `MobileSettingsTrigger` / `MobileSettingsPanel` usage.

- `src/app/businessidea/components/DebugPanel.tsx`
  - Added simple tab bar (All / Chatbox / UI Prompt) to quickly filter logs by category.
  - Works with existing text, level, and category filters.
  - Copiable and clearable log list retained; auto-scroll preserved.

- `src/app/businessidea/utils/logStore.ts`
  - Central logging store and helpers (`chatboxDebug.{info,warn,error,debug,success}`).
  - Fixed `subscribe()` cleanup to return `void` (instead of a boolean), resolving a React effect cleanup type error.
  - Capacity-limited to 1000 most recent logs.

- `src/app/businessidea/tabs/ui-prompt/useUIGeneration.ts` (instrumentation pass)
  - Added granular logs under category `ui-prompt`:
    - Start of generation (model, prompt length).
    - API key validation failure (no key content logged).
    - Model validation failure.
    - Short prompt warning.
    - Request dispatch (model, temperature, max tokens; never API key).
    - Response receipt (choice count + `contentPreview` snippet, capped).
    - Non-JSON response error with `contentPreview` for debugging.
    - Wireframe schema validation failures (stringified preview, capped).
    - Success and general failure terminal messages.

- `src/app/businessidea/tabs/ui-prompt/UIPromptBox.tsx` (UX contrast pass)
  - Made the textarea input color darker for legibility: `text-gray-800` and `placeholder:text-gray-400`.

## Integration Details

- API keys remain managed by ChatboxControls (`ChatboxSettingsManager` via `SecureStorage`).
- Model selection is local to `UIPromptBox` and persisted in `localStorage`.
- `useUIGeneration` constructs the system and user prompts; expects JSON-only output.
- `UIWireframeRenderer` performs strict but forgiving rendering with fallbacks.

## Validation & Error Handling
- __API key__: ensures presence and basic validity; no secrets logged.
- __Model__: verifies selected model is in available list.
- __Prompt__: enforces minimal input length to avoid trivial/non-deterministic outputs.
- __Response__: parses JSON; if non-JSON, throws a user-facing error and logs `contentPreview`.
- __Schema__: validates wireframe structure before rendering; logs a compact preview on failure.

## Debugging & Observability
- Category-based logs available in `DebugPanel`:
  - Choose the “UI Prompt” tab to focus on prompt flow logs.
  - Use text/level/category filters, copy all, and clear functions as needed.
- `contentPreview` is truncated to keep logs readable and avoid excessive payload sizes.
- No API keys are logged; only metadata and safe snippets are recorded.

## UI/UX Notes
- The prompt textarea now uses darker text and a mid-grey placeholder to address low-contrast readability concerns.
- DebugPanel includes tabs for quick context-specific filtering.

## How To Test
1. Open the Business Idea Mobile tab UI and ensure `UIPromptBox` is visible.
2. Select a model and input a prompt with sufficient length.
3. Generate UI:
   - On success: a wireframe renders in the Mobile tab; DebugPanel shows success logs.
   - On failure (e.g., non-JSON), debug panel logs include `contentPreview` to diagnose why the model returned non-JSON.
4. Use DebugPanel tabs → “UI Prompt” to view only relevant logs. Try Copy All / Clear.

## Known Issues / Considerations
- Non-JSON responses can still occur for certain models; we mitigate via system prompt + error messages + logs.
- You may optionally add a UI hint in `UIPromptBox` linking to `DebugPanel` when errors occur.
- Optionally filter the model list to only those with configured keys; currently we prefer flexibility.

## Future Enhancements
- Optional: Display token usage/costs in logs if provided by OpenRouter responses.
- Optional: Local result caching or diff-based re-rendering for faster UX.
- Optional: Improved renderer components library (e.g., inputs with validation, lists, icons).

## Change Log (Chronological)
- Created wireframe DSL: `ui-prompt/types.ts`.
- Implemented API orchestration: `ui-prompt/useUIGeneration.ts`.
- Implemented renderer: `ui-prompt/UIWireframeRenderer.tsx`.
- Implemented UI prompt box with local model selection: `ui-prompt/UIPromptBox.tsx`.
- Integrated into `MobileTab.tsx`.
- Authored spec: `docs/mobiletab-prompt-ui-spec.md`.
- Added detailed logging in `useUIGeneration.ts` → category `ui-prompt`.
- Added tabs to DebugPanel: All / Chatbox / UI Prompt.
- Fixed `logStore.subscribe()` cleanup type.
- Increased prompt textarea contrast.

## File Index (Created/Modified)
- Created:
  - `src/app/businessidea/tabs/ui-prompt/types.ts`
  - `src/app/businessidea/tabs/ui-prompt/useUIGeneration.ts`
  - `src/app/businessidea/tabs/ui-prompt/UIWireframeRenderer.tsx`
  - `src/app/businessidea/tabs/ui-prompt/UIPromptBox.tsx`
  - `docs/mobiletab-prompt-ui-spec.md`
- Modified:
  - `src/app/businessidea/tabs/MobileTab.tsx`
  - `src/app/businessidea/components/DebugPanel.tsx`
  - `src/app/businessidea/utils/logStore.ts`
  - `src/app/businessidea/tabs/ui-prompt/useUIGeneration.ts` (instrumented)
  - `src/app/businessidea/tabs/ui-prompt/UIPromptBox.tsx` (contrast)
