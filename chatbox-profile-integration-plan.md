# OpenRouter Profile Analysis Integration Plan (Chatbox-Centered)

This plan wires the new User Profile flow to the Chatbox analysis pipeline while keeping `src/components/chatbox/ChatboxControls.tsx` as the master LLM controls. It reuses the existing provider architecture, trigger component, and profile integration service with minimal and type-safe changes.

## Goals
- Enable AI profile analysis from the new tab-based profile flow.
- Use Chatbox as the single orchestration layer for config, validation, and analysis start.
- Maintain premium minimalist UX and robust error handling.
- Keep the implementation minimal, consistent, and type-safe.

## Current Architecture (summary)
- `src/components/chatbox/ChatboxControls.tsx`: Master controls (model, key, prompt, storage). Calls `useChatbox().startAnalysis()`.
- `src/components/chatbox/ProfileAnalysisTrigger.tsx`: Reusable trigger for profile analysis; uses `useProfileIntegration()`.
- `src/components/chatbox/hooks/useProfileIntegration.ts`: Bridges profile -> chatbox; transforms data, checks readiness, opens chatbox, calls `startAnalysis(useStreaming, data)`.
- `src/components/chatbox/services/ProfileIntegrationService.ts`: Transforms `ProfileFormData`, readiness gating, optional auto-trigger/change-detection.
- `src/components/chatbox/ChatboxProvider.tsx`: Context for state, messages, storage, provider registry, and `startAnalysis`.
- `src/lib/chatbox/initialization.ts` + `src/lib/chatbox/AnalysisService.ts`: Provider registry and default provider setup.
- `src/lib/chatbox/ProfileAnalysisProvider.ts`: Concrete provider using OpenRouter (streaming + non-streaming).

## Constraints and UX
- Chatbox controls remain the source of truth for API key/model validation.
- Profile analysis may be triggered from: (a) ChatboxControls Analyze tab, (b) the new Profile `ReviewStep` via `ProfileAnalysisTrigger`.
- Minimalist UI: compact components, subtle states, accessible labels. 
- Error handling via ChatboxErrorBoundary, retry, and clear diagnostics.

---

## Implementation Phases and Tasks

### Phase 1 — Contracts alignment (foundational)
- Update `startAnalysis` context signature to accept optional args used by `useProfileIntegration`.
  - Signature: `startAnalysis(useStreaming?: boolean, data?: any): Promise<void>`
  - Backward compatible: callers without args still work (defaults apply).
- Ensure the implementation routes `data` to the active provider and streams via chunk handler.

### Phase 2 — New Profile flow wiring
- Inject `ProfileAnalysisTrigger` into the new profile `ReviewStep` UI.
- Push current profile state into Chatbox (`setProfileData(profile)`) on save/commit in the tab controller to keep ChatboxControls in sync.

### Phase 3 — Controls coherence and validation (optional polish)
- If profile exists but is not ready, show a small hint in Analyze tab using `ProfileIntegrationService.getAnalysisStatus(profileData)`.
- Preserve existing key/model validation flows.

### Phase 4 — Provider + initialization checks
- Verify provider registration in `initialization.ts` and streaming path in `ProfileAnalysisProvider.ts`.

### Phase 5 — Errors, logging, and resilience
- Respect disabled states while analyzing.
- Leverage existing error boundary, retry, and logging (`chatboxDebug`) for readiness and trigger events.

---

## File-by-File Changes

Note: No new files are required. We only modify and reuse existing ones.

### 1) Update Chatbox context signature and implementation
- File: `src/components/chatbox/ChatboxProvider.tsx`
  - Change in `ChatboxContextType`:
    - From: `startAnalysis: () => Promise<void>`
    - To: `startAnalysis: (useStreaming?: boolean, data?: any) => Promise<void>`
  - Ensure the inner `startAnalysis` function signature matches and forwards `(useStreaming, data)` to the selected provider.
  - Keep existing call sites working (default `useStreaming = true`; `data` optional).

### 2) Harden provider type usage and streaming toggle
- File: `src/lib/chatbox/ProfileAnalysisProvider.ts`
  - Replace unsafe field access on `ProfileFormData`/experience entries (e.g., `current`, `endDate`, `currentRole`) with safe reads or use the already-robust mapping in `ProfileIntegrationService.transformProfileData`.
  - Ensure provider accepts a payload compatible with `ProfileAnalysisData` produced by `ProfileIntegrationService`.
  - Confirm compatibility with `OpenRouterClient` for both streaming and non-streaming paths.
  - Align with existing `ProviderConfig` shape (remove unsupported keys like `analyzeStreaming` if present).

### 3) Add analysis trigger to the new profile Review step
- File: `src/app/businessidea/tabs/user-profile/steps/ReviewStep.tsx`
  - Import: `import { ProfileAnalysisTrigger } from '@/components/chatbox/ProfileAnalysisTrigger';`
  - Render below the summary (choose variant):
    - Example: `<ProfileAnalysisTrigger profileData={profile} variant="card" size="md" />`.
  - The trigger already handles readiness + status via `useProfileIntegration`.

### 4) Sync profile state to Chatbox on save/commit
- File: `src/app/businessidea/tabs/user-profile/UserProfileTab.tsx` (or the central form controller where save occurs)
  - Import: `const { setProfileData } = useChatbox();`
  - On save/commit: `setProfileData(profile);`
  - On reset: optionally `setProfileData(null as any)` to clear.

### 5) Optional Analyze tab hint (no logic changes)
- File: `src/components/chatbox/ChatboxControls.tsx`
  - If `profileData` is present, call `profileIntegrationService.getAnalysisStatus(profileData)` and surface a small, non-intrusive note listing `missing` fields when not ready. Keep this purely presentational.

---

## Data Flow (end-to-end)
1. User completes new Profile tab and saves.
2. `UserProfileTab.tsx` calls `setProfileData(profile)` into Chatbox context.
3. In Review step, user clicks `ProfileAnalysisTrigger`.
4. `ProfileAnalysisTrigger` → `useProfileIntegration`:
   - Transforms data via `ProfileIntegrationService.transformProfileData`.
   - Optionally clears messages and opens chatbox.
   - Calls `startAnalysis(useStreaming = true, analysisData)`.
5. `ChatboxProvider.startAnalysis` forwards config + data to the selected provider.
6. `ProfileAnalysisProvider` invokes `OpenRouterClient` (streaming or not), emitting chunks rendered in `ChatboxPanel`.
7. Errors are handled by existing boundaries and retry mechanisms.

---

## Validation Gates
- __API key/model__: validated in `ChatboxControls.tsx` and enforced before provider invocation.
- __Readiness__: `ProfileIntegrationService.getAnalysisStatus(profile)` must be ready; `ProfileAnalysisTrigger` disables otherwise and shows what’s missing.
- __Streaming__: default on; provider must gracefully fallback to non-streaming on failure.

---

## Error Handling
- Use `ChatboxErrorBoundary` and message-level errors in `ChatboxPanel`.
- Provide retry via `retryAnalysis`.
- Log readiness and trigger events via `chatboxDebug` for diagnostics.

---

## Testing Plan
- __Unit__:
  - `ChatboxProvider`: starting with `(true, data)` triggers provider; guards on missing key/model.
  - `ProfileIntegrationService`: transform + readiness paths for varied profiles.
  - `ProfileAnalysisProvider`: streaming and non-streaming branches.
- __Integration__:
  - `ReviewStep`: clicking `ProfileAnalysisTrigger` routes to `ChatboxProvider.startAnalysis`.
  - `ChatboxControls`: Analyze tab starts analysis with and without preloaded profile data.
- __Manual__:
  - Fill new Profile tab → save → Analyze Profile → observe streaming, errors, retry.

---

## Rollout Checklist
- __A__ Update `ChatboxProvider` signature and forward args.
- __B__ Harden `ProfileAnalysisProvider` types and config.
- __C__ Inject `ProfileAnalysisTrigger` in new `ReviewStep`.
- __D__ Call `setProfileData(profile)` on save.
- __E__ Verify provider registration and streaming.
- __F__ Optional: Analyze tab readiness hint.

---

## Files to Modify (complete list)
- `src/components/chatbox/ChatboxProvider.tsx` — update `startAnalysis` signature and implementation.
- `src/lib/chatbox/ProfileAnalysisProvider.ts` — type-safe mapping; align provider config; ensure streaming path.
- `src/app/businessidea/tabs/user-profile/steps/ReviewStep.tsx` — render `ProfileAnalysisTrigger`.
- `src/app/businessidea/tabs/user-profile/UserProfileTab.tsx` — call `setProfileData(profile)` on save/commit.
- (Optional) `src/components/chatbox/ChatboxControls.tsx` — present readiness hint if profile incomplete.

## Files Already Providing Required Functionality (no changes expected)
- `src/components/chatbox/ProfileAnalysisTrigger.tsx` — generic trigger and UI states.
- `src/components/chatbox/hooks/useProfileIntegration.ts` — calls `startAnalysis(useStreaming, data)` and bridges the flow.
- `src/components/chatbox/services/ProfileIntegrationService.ts` — transformation + readiness gating.
- `src/lib/chatbox/AnalysisService.ts`, `src/lib/chatbox/initialization.ts` — provider registry and default setup.

---

## Notes & Alignment with Preferences
- Premium minimalist UI preserved: compact spacing, slate palette, subtle shadows.
- No business logic changes in the profile forms; only integration and presentation.
- Error handling leverages existing boundaries, retry, and storage logging.
