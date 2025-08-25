# Specs Generator Feature — Technical Specification

Status: Draft
Date: 2025-08-25
Owners: Business Idea App Team
Related: `src/app/businessidea/tabs/*`, `src/features/specs-generator/*`, `src/components/chatbox/*`, `src/features/implementation-plan/*`

---

## 1. Overview & Objectives

Introduce a modular “Specs Generator” feature accessible as a new tab within Business Idea tabs. The feature generates concise technical specification documents (Markdown) derived from the existing Implementation Plan context. It supports a dedicated Settings Panel (length presets and system prompt), streaming output by default, and optional actions to copy/download or post to Chatbox upon explicit user action.

Key confirmations (approved):
- Folder path: `src/features/specs-generator/`.
- CTA in `ListTab` to navigate to the new “Specs” tab.
- Streaming enabled by default for generation.
- Generated spec will only be posted to Chatbox when the user clicks an action (no auto-posting).
- The Settings Panel is a separate component from the display/view, yet on the same Specs page.
- No mock data; the generator consumes actual Implementation Plan context.

Non-goals:
- Do not expand Chatbox provider capabilities beyond necessary integrations.
- Do not introduce new external dependencies without justification.

---

## 2. Requirements

Functional requirements:
- Derive spec content from existing Implementation Plan context.
- Provide a Settings Panel with:
  - Spec length options: 5 lines, 10 lines, 15 lines.
  - Custom system prompt field.
  - Extensible layout for future options.
- Stream output by default: live preview updates as chunks arrive.
- Controls to Generate, Cancel (best-effort), Regenerate, Copy, Download, and “Open in Chat”.
- CTA in `ListTab` to navigate to the “Specs” tab without duplicating settings controls.
- If Implementation Plan context is missing, display an actionable error and disable generation.
- If Chatbox API key/model is missing, display an actionable error with a link/CTA to Chatbox settings.

Non-functional requirements:
- Modularity: dedicated feature directory with provider/hook/service/components.
- Extensibility: Settings persist via localStorage (non-sensitive only), schema-versioned.
- Performance: efficient prompt construction, streaming rendering, graceful cancellation.
- Security: never store API keys; use ChatboxProvider state only.
- Accessibility: keyboard navigable controls, ARIA labels, readable contrast.

---

## 3. High-Level Architecture

- New tab: `specs` added to the Business Idea tab system.
- Feature module: `src/features/specs-generator/` with:
  - `types.ts`: data contracts.
  - `service.ts`: prompt builder, LLM invocation (streaming & non-streaming), result assembly.
  - `SpecsGeneratorProvider.tsx`: state management/context, persistence of settings.
  - `useSpecsGenerator.ts`: hook exposing provider state/actions.
  - `components/SpecsSettingsPanel.tsx`: separate settings UI.
  - `components/SpecsContentView.tsx`: view for preview/final output, actions.
- Page composition: `src/app/businessidea/tabs/SpecsContent.tsx` composes settings + view with provider wiring and integration to `useImplementationPlan()` and `useChatbox()`.

---

## 4. Modules and APIs

### 4.1 Data Contracts (`src/features/specs-generator/types.ts`)

```ts
export interface SpecsSettings {
  length: 5 | 10 | 15;
  systemPrompt: string;
  // Future: templateId?: string; audience?: 'dev' | 'pm'; includeSections?: string[];
}

export interface SpecsGenerationRequest {
  planText: string;           // Derived from Implementation Plan context
  settings: SpecsSettings;    // Current settings state
  model: string;              // From Chatbox configuration
  apiKey: string;             // From Chatbox configuration
  streaming?: boolean;        // Default true
}

export interface SpecsGenerationResult {
  markdown: string;           // Final spec in Markdown
  meta: {
    createdAt: string;        // ISO timestamp
    length: number;           // 5|10|15 (lines)
    source: 'plan';
    conversationId?: string;  // Filled when posted to Chatbox via user action
  };
}

export type SpecsStatus = 'idle' | 'generating' | 'streaming' | 'success' | 'error';

export interface SpecsGeneratorState {
  status: SpecsStatus;
  error?: string;
  preview?: string;            // Streaming buffer content
  result?: SpecsGenerationResult;
}

export interface SpecsGeneratorActions {
  setLength: (l: 5 | 10 | 15) => void;
  setSystemPrompt: (v: string) => void;
  updateSettings: (p: Partial<SpecsSettings>) => void;
  generate: (opts?: { streaming?: boolean; connectToConversation?: boolean }) => Promise<void>;
  cancel: () => void;          // Best-effort; may noop if provider lacks abort
  reset: () => void;
}

export interface SpecsGeneratorContextValue {
  state: SpecsGeneratorState;
  settings: SpecsSettings;
  actions: SpecsGeneratorActions;
}
```

### 4.2 Service (`src/features/specs-generator/service.ts`)

Responsibilities:
- Compose an LLM prompt from Implementation Plan text and Settings.
- Invoke LLM via Chatbox configuration and return either streamed preview or a final Markdown.
- Handle token budgeting and length guidance.

Public API (signatures only):
```ts
export function buildPrompt(planText: string, settings: SpecsSettings): string;

export function generateSpecs(
  req: SpecsGenerationRequest,
  onChunk?: (chunk: string) => void
): Promise<SpecsGenerationResult>;
```

Guidelines:
- No API keys stored; use in-memory from Chatbox state.
- Streaming path appends chunks to `onChunk` for live preview.
- Non-streaming path returns full Markdown.
- Apply safety: trim planText, cap prompt size, include explicit line count instructions.

### 4.3 Provider & Hook (`src/features/specs-generator/SpecsGeneratorProvider.tsx`, `useSpecsGenerator.ts`)

Responsibilities:
- Own `SpecsGeneratorState` and `SpecsSettings`.
- Persist `SpecsSettings` to localStorage (namespaced key, versioned schema).
- Wire `useImplementationPlan()` and `useChatbox()` to gather prerequisites.
- Expose `generate()` which validates prerequisites, builds prompt, and calls `service.generateSpecs()` with default streaming.

Context access:
- Implementation Plan context: safely derive a single `planText` string used by prompt builder.
- Chatbox context: obtain `model` and `apiKey`. If missing, error out with actionable message.

### 4.4 UI Components

- `SpecsSettingsPanel.tsx`
  - Separate from content view but rendered on the Specs page.
  - Props: `{ settings, onChangeLength, onChangeSystemPrompt, disabled?: boolean }`.
  - Radio group for 5/10/15; textarea for system prompt.
  - Extensible slot for future advanced settings.

- `SpecsContentView.tsx`
  - Props: `{ status, preview, result, onGenerate, onCancel, onRegenerate, onCopy, onDownload, onOpenInChat, errors? }`.
  - Renders live Markdown preview during streaming; final Markdown on success.
  - Shows errors and disabled states appropriately.

---

## 5. Tab Integration

- `src/app/businessidea/tabs/TabContext.tsx`: add `'specs'` to the valid tab ids.
- `src/app/businessidea/tabs/TabNavigation.tsx`: add icon+label for the "Specs" tab.
- `src/app/businessidea/tabs/TabContainer.tsx`: map `'specs'` to `SpecsContent`.
- `src/app/businessidea/tabs/ListTab.tsx`: add a CTA button (e.g., "Generate Specs") that sets the active tab to `'specs'` using the tab context API.

---

## 6. Page Composition (`src/app/businessidea/tabs/SpecsContent.tsx`)

- Composition:
  1) Header ("Technical Specs").
  2) `SpecsSettingsPanel` (left/top) — separate component.
  3) Actions: Generate (primary), Cancel, Regenerate; secondary: Copy, Download, Open in Chat.
  4) `SpecsContentView` (right/bottom) showing streaming preview or final Markdown.
- Dependencies:
  - `useSpecsGenerator()` for state/settings/actions.
  - `useImplementationPlan()` for plan availability and text extraction.
  - `useChatbox()` for model/apiKey and Chatbox actions (when user clicks “Open in Chat”).
- States:
  - Missing plan → banner with guidance to generate/prepare an implementation plan first.
  - Missing API key/model → banner with guidance to set Chatbox config.

---

## 7. Data Flow

1) User navigates to Specs tab or uses CTA from ListTab.
2) Settings are read from provider (restored from localStorage or defaults).
3) User clicks Generate → validate prerequisites → build prompt.
4) `service.generateSpecs()` called with streaming=true by default.
5) Chunks update `state.preview` → live preview displayed.
6) On stream completion, `state.result` filled with final Markdown.
7) User can `Copy`, `Download`, or `Open in Chat` (explicit action).

---

## 8. Prompt Strategy

- Inputs: `planText`, `systemPrompt`, `length`.
- Tactics:
  - Enforce concise Markdown spec with headings, bullet points, and explicit line targets.
  - Include deterministic instructions for line bounds (5/10/15 lines), acknowledging LLM variability.
  - Trim and normalize planText; include only relevant sections to stay within token limits.
  - Provide safety rails: disallow unrelated content, avoid hallucinations; ask model to state "Insufficient plan context" when applicable.

---

## 9. Error Handling & Empty States

- No Implementation Plan available → disable Generate; show guidance with link to the appropriate tab.
- Missing Chatbox config → disable Generate; show guidance to set key/model in Chatbox settings.
- Network errors / LLM errors → surface concise error; enable Retry.
- Streaming interruptions → show partial preview; allow Regenerate.
- Validation failures (e.g., blank system prompt if required) → inline error messaging.

---

## 10. Persistence

- `SpecsSettings` stored in `localStorage` under a namespaced key, e.g., `specs-generator:v1:settings`.
- Persist on change; restore on mount; schema version to allow future migrations.
- Do not persist any generated content by default (optional future enhancement: history).

---

## 11. Performance Considerations

- Memoize derived `planText` and prompt to avoid recomputation on minor state changes.
- Stream rendering efficiently (append-only buffer) to limit reflows.
- Cap prompt size; truncate `planText` with clear instruction to model if needed.
- Best-effort cancellation; consider AbortController if supported by underlying client.

---

## 12. Security & Compliance

- API keys: never stored by specs feature; only read from ChatboxProvider state at runtime.
- Local persistence: settings only; no sensitive data; versioned and namespaced.
- Sanitization: trim inputs; constrain prompt size; avoid echoing secrets in errors.
- Accessibility: ARIA roles/labels; keyboard navigation for radio groups and buttons.

---

## 13. Testing Strategy

Unit tests:
- `buildPrompt()` — respects line limits, includes system prompt, trims and caps input.
- `generateSpecs()` — invokes LLM client with correct request; covers streaming and non-streaming flows.
- Provider state machine — transitions and persistence of settings.

Integration tests:
- `SpecsContent` rendering with providers; validates disabled states without plan/API key.
- Streaming preview → final result; actions (Copy/Download/Open in Chat on user action only).
- CTA from `ListTab` correctly activates `specs` tab.

Edge cases:
- Large plan text; truncation rules applied.
- Empty/invalid system prompt.
- Intermittent network errors; retries.

---

## 14. Rollout Plan

1) Implement feature module under `src/features/specs-generator/`.
2) Wire new tab in `TabContext`, `TabNavigation`, `TabContainer`.
3) Add CTA in `ListTab` navigating to `specs` tab.
4) Manual verification: with/without plan; with/without Chatbox config; streaming default.
5) Add unit/integration tests.
6) Documentation in `docs/specs/` (this spec).

---

## 15. Future Enhancements

- Template presets (API Spec, Component Spec, Data Contract Spec) selectable in Settings.
- Section toggles (e.g., Constraints, Dependencies, Metrics, Risks) to shape the output.
- History panel with saved specs; export to repository `docs/` folder.
- Bidirectional sync with Chatbox conversations (explicit, opt-in per action).
- Metrics: time-to-generate, token estimates, error rates.

---

## 16. Open Questions (currently resolved per confirmation)

- Folder path accepted (`src/features/specs-generator/`).
- CTA in `ListTab` to navigate to Specs tab: yes.
- Streaming default: yes.
- Post to Chatbox only when user clicks an action: yes.

---

## 17. Appendix — Integration Notes

- `useImplementationPlan()` integration: extract the same text `ListTab` uses for display/copy/download. If multiple representations exist, prefer the user-visible, normalized string. If unavailable, block generation with UI guidance.
- `useChatbox()` integration: read current model and API key; validate presence before generation; provide an action handler to create a conversation and append the generated Markdown only when the user clicks "Open in Chat".
- UI composition: ensure `SpecsSettingsPanel` is a distinct component from the Markdown view within the Specs page layout (maintain separation of concerns while minimizing navigation).
