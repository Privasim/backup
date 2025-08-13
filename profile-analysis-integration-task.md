# User Profile Analysis Integration — Minimal Implementation Plan

## Objective
Build a minimal, reusable bridge from the user profile Review step to the Chatbox analysis system so that clicking “Start analysis” in `src/app/businessidea/tabs/user-profile/steps/ReviewStep.tsx` reliably triggers profile analysis via Chatbox while keeping API key management and model selection decoupled for future improvements.

## Scope (Minimal) and Non‑Goals
- Minimal scope:
  - Reuse data from `ReviewStep.tsx` (shape: `UserProfileData`).
  - Validate readiness and trigger analysis through existing Chatbox provider.
  - Keep `ChatboxControls.tsx` unchanged for API key management and validation.
  - Allow model selection to remain in a prompt UI, persisted locally, applied via `updateConfig`.
- Non‑goals:
  - Major refactors of `ChatboxControls.tsx` or Chatbox storage.
  - New providers or UI redesign.

## Current Architecture Summary
- `UserProfileData` is defined in `src/app/businessidea/tabs/user-profile/types.ts`.
- `ProfileFormData` is defined in `src/app/businessidea/types/profile.types.ts`.
- `ProfileAnalysisData` is the normalized payload for the AI provider, created by:
  - `transformUserProfileToAnalysisData(UserProfileData)` in `src/components/chatbox/utils/profile-transformation.ts`.
  - `ProfileIntegrationService.transformProfileData(ProfileFormData)` in `src/components/chatbox/services/ProfileIntegrationService.ts`.
- Trigger path:
  - `ReviewStep.tsx` → `ProfileAnalysisTrigger.tsx` → `useProfileIntegration()` → `ChatboxProvider.startAnalysis()` → `ProfileAnalysisProvider` (OpenRouter) → Chatbox UI.
- `ChatboxControls.tsx` manages API key, model list, and config validation.

## Deliverables
- A minimal adapter facade for reusability (no duplicate logic) that accepts `UserProfileData | ProfileFormData | ProfileAnalysisData` and returns `ProfileAnalysisData` + readiness info.
- ReviewStep readiness gating with concise feedback, using existing utilities.
- Confirmed minimal coupling to `ChatboxControls.tsx` per preference (API key here; model selection in prompt UI persisted locally).
- Documentation and tests.

## Implementation Steps (Minimal)
1) Adapter Facade (thin and reusable)
- Location: `src/lib/profile-analysis/index.ts`
- Exports:
  - `type AnalysisInput = UserProfileData | ProfileFormData | ProfileAnalysisData`
  - `toAnalysisData(input: AnalysisInput): ProfileAnalysisData`
  - `getReadiness(input: AnalysisInput): { ready: boolean; completionLevel: number; missing: string[]; requirements: { minCompletion: number; autoTrigger: boolean } }`
- Internals: delegate to existing functions only.
  - If input is `UserProfileData`, use `transformUserProfileToAnalysisData()` and `getAnalysisStatus()`.
  - If input is `ProfileFormData`, use `ProfileIntegrationService.transformProfileData()` and `getAnalysisStatus()`.
  - If input already matches `ProfileAnalysisData`, return as‑is and derive readiness from `metadata.completionLevel`.

2) ReviewStep Readiness Gating (no new UI components)
- In `src/app/businessidea/tabs/user-profile/steps/ReviewStep.tsx`:
  - Use `useProfileIntegration().getAnalysisReadiness(data)`
  - Disable the “Start analysis” action if `ready === false`.
  - Show a compact list of `missing` fields; keep it inline and actionable (link to step sections if available). Avoid layout changes.
  - Keep actual triggering via `ProfileAnalysisTrigger` which calls `triggerProfileAnalysis(data, { autoOpen: true, clearPrevious: true, useStreaming: true })`.

3) Chatbox Configuration Boundaries (no changes to structure)
- Keep API key management and validation in `src/components/chatbox/ChatboxControls.tsx`.
- Persist model selection in a prompt editor UI (e.g., UIPromptBox). On selection, call `ChatboxProvider.updateConfig({ model })`. Do not push model logic into `ChatboxControls.tsx`.
- Ensure config validation runs before analysis (already implemented in `ChatboxControls.tsx`).

4) Initialization & Service Configuration (optional, minimal)
- In `src/lib/chatbox/initialization.ts` (if not already set):
  - Register `ProfileAnalysisProvider` as default.
  - Configure `profileIntegrationService.configure({ minProfileCompletion: 80, autoTriggerAnalysis: false, enableChangeDetection: true })` to avoid surprise auto‑runs.

5) Documentation
- Add `src/lib/profile-analysis/README.md` documenting:
  - Purpose of the adapter facade.
  - Data shapes and transformation chain.
  - How `ReviewStep` uses readiness and trigger.
  - Boundaries: API key in `ChatboxControls.tsx`, model selection persisted locally in prompt UI.

6) Testing (minimal, targeted)
- Unit:
  - Adapter: type‑guards and selection path; `toAnalysisData()` returns correct shape for each input type.
  - Readiness: `getReadiness()` mirrors utility output; threshold respected.
- Integration:
  - Trigger from `ProfileAnalysisTrigger` with `UserProfileData` streams content to Chatbox.
  - Changing model in prompt UI updates provider config for next analysis.
- Manual QA:
  - Each role flow filled → readiness messages → start analysis → streaming visible.

## Interfaces and Contracts
- `useProfileIntegration()` (existing):
  - `triggerProfileAnalysis(profileData, { autoOpen, clearPrevious, useStreaming }) => Promise<boolean>`
  - `getAnalysisReadiness(profileData) => { ready, completionLevel, missing, requirements }`
- Adapter facade (new):
  - `toAnalysisData(input: AnalysisInput) => ProfileAnalysisData`
  - `getReadiness(input: AnalysisInput) => { ready, completionLevel, missing, requirements }`

## Acceptance Criteria
- ReviewStep shows readiness state and blocks analysis until minimum completeness is met, listing missing items.
- Clicking “Start analysis” from `ReviewStep.tsx` consistently triggers Chatbox analysis with streaming updates.
- API key remains managed solely in `ChatboxControls.tsx`; no major changes to that component.
- Model selection is persisted locally in a prompt UI and applied to Chatbox config without modifying `ChatboxControls.tsx`.
- The adapter facade works with `UserProfileData`, `ProfileFormData`, and already‑normalized `ProfileAnalysisData`.
- Unit and integration tests pass without regressing existing Chatbox and research features.

## Risks & Mitigations
- Dual data shapes (form vs. full profile): handled via single adapter with type‑guards.
- User confusion on readiness: compact, actionable missing‑field list in ReviewStep.
- Config drift (key/model): rely on existing validation before start; clear instructions on where to configure.
