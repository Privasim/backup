# Job Risk + Profile Analysis Integration — Task

## Objective
Deliver a minimal, robust integration that wires user profile context into Job-Risk data and enables research-backed profile analysis via Chatbox, while enforcing defaults and preserving UX boundaries.

## Scope
- Implement profile-aware data fetching for Job-Risk.
- Add a dedicated Chatbox profile-analysis executor.
- Centralize readiness gating via the profile-analysis adapter facade.
- Enforce defaults (24-month velocity, 5 skill clusters) and sticky insights on desktop only.
- Add focused tests and structured logging.

## Non-Goals
- Changes to API key or model-selection UX in `ChatboxControls.tsx` or `UIPromptBox`.
- Visualization redesigns or new state management libraries.

## Design Decisions (Optimal + Minimal)
- Profile signature for caching: `role|industry|location|skillsHash`.
  - `skillsHash` is a stable hash over sorted skill IDs/levels; omit if no skills.
- Readiness threshold: 80% completion; `autoTrigger: false`.
- Sticky insights: desktop-only (`lg:` breakpoint). `position: sticky; top: 1rem`.
- Gate network calls by readiness; return safe defaults otherwise.

## Implementation Checklist

1) Enforce Job-Risk Defaults
- [ ] `src/app/businessidea/tabs/job-risk/hooks/useJobRiskData.ts`
  - Enforce 24-month velocity window.
  - Initialize clusters to [Cognitive Routine, Analytical, Creative, Social, Manual Routine].
- [ ] `src/app/businessidea/tabs/job-risk/components/InsightsPanel.tsx`
  - Make sticky on desktop only (`position: sticky; top: 1rem`).

2) Wire Profile → Job-Risk
- [ ] `src/app/businessidea/tabs/job-risk/hooks/useJobRiskData.ts`
  - Read profile from context/store.
  - Use adapter `getReadiness(profile)`; if unready, return safe defaults and skip fetch.
  - Call `ResearchDataService` with role/industry/location (+skills if present).
  - Return typed shape with loading/error states.
- [ ] `src/app/businessidea/tabs/job-risk/data-adapters/research-adapter.ts`
  - Map service responses to chart contracts: `CutSeriesPoint[]`, `SkillImpact[]` (5 clusters), `ForecastPoint[]`, `GlobalKPI`, `VizInsight[]`, `InsightsBundle`.

3) Chatbox Profile Analysis Executor
- [ ] `src/components/chatbox/ChatboxProvider.tsx`
  - In `startAnalysis()`, handle `type === 'profile'` explicitly.
  - Normalize data via `src/lib/profile-analysis/index.ts: toAnalysisData()`.
  - Compute `profileSignature`; check cache via `useCacheManager`.
  - On cache hit: append cached structured messages and exit.
  - On miss: call `ResearchAssessmentIntegration`, append structured messages (summary, benchmark deltas, top risks, recommended actions, confidence), cache result.
  - Friendly error handling; preserve session stability.

4) UX Gating and Statuses
- [ ] `src/components/chatbox/hooks/useProfileIntegration.ts`
  - Ensure `getReadiness()` drives trigger availability.
- [ ] `src/components/chatbox/ProfileAnalysisTrigger.tsx`
  - Align disabled/loading/success states with readiness and chatbox status.
- [ ] `src/app/businessidea/tabs/user-profile/steps/ReviewStep.tsx`
  - Use `getReadiness()` to surface missing fields and reasons; wire trigger via `useProfileIntegration`.
  - Treat this file as canonical for gating.

5) JobRiskAnalysisTab Layout
- [ ] `src/app/businessidea/tabs/job-risk/JobRiskAnalysisTab.tsx`
  - Ensure layout supports sticky insights on desktop (grid with sidebar) and normal flow on mobile.
  - Pass hook outputs to charts and `InsightsPanel`.

6) Tests
- [ ] `src/app/businessidea/tabs/job-risk/__tests__/useJobRiskData.test.ts`
  - Enforces 24-month window; no calls when unready; safe defaults on errors.
- [ ] `src/components/chatbox/__tests__/profileAnalysisExecutor.test.ts`
  - Cache miss→call→messages→cache; cache hit avoids call; failure path handled.
- [ ] `src/lib/research/service/__tests__/assessment-mapping.test.ts`
  - Stable mapping of `ResearchAssessmentIntegration` outputs to structured messages.

7) Structured Logging (low-noise)
- [ ] Add logs with tags:
  - `jobrisk.useJobRiskData.fetch.start|success|error`
  - `jobrisk.useJobRiskData.gated.unready`
  - `chatbox.profileAnalysis.start|cached|success|error`
  - `chatbox.profileAnalysis.cache.write|read`
- [ ] Include masked `profileSignature` and `analysisType` only; avoid PII.

## File-by-File Summary of Changes
- `src/app/businessidea/tabs/job-risk/hooks/useJobRiskData.ts`
  - Read profile context, readiness gate, call `ResearchDataService`, map via adapter, enforce defaults, robust states.
- `src/app/businessidea/tabs/job-risk/data-adapters/research-adapter.ts`
  - Implement mapping utilities to local chart contracts; ensure 5-cluster normalization.
- `src/app/businessidea/tabs/job-risk/components/InsightsPanel.tsx`
  - Desktop-only sticky with safe `top` offset.
- `src/app/businessidea/tabs/job-risk/JobRiskAnalysisTab.tsx`
  - Layout grid + sticky; pass-through data.
- `src/components/chatbox/ChatboxProvider.tsx`
  - Profile analysis executor path, `toAnalysisData`, signature cache, structured message posting, error handling.
- `src/components/chatbox/hooks/useProfileIntegration.ts`
  - Ensure gating/trigger aligns with adapter readiness.
- `src/app/businessidea/tabs/user-profile/steps/ReviewStep.tsx`
  - Canonical readiness surfacing and trigger wiring.

## Data Contracts
- Adapter facade: `src/lib/profile-analysis/index.ts`
  - `toAnalysisData(input) → ProfileAnalysisData`
  - `getReadiness(input) → { ready, completionLevel, missing, requirements }`
- Job-Risk outputs:
  - `CutSeriesPoint[]`, `SkillImpact[]` (5 clusters), `ForecastPoint[]`, `GlobalKPI`, `VizInsight[]`, `InsightsBundle`
- Chatbox structured messages:
  - summary, benchmark deltas, top risks, recommended actions, confidence

## Acceptance Criteria
- Job-Risk tab enforces 24-month velocity and 5 named clusters; insights sticky on desktop only.
- `useJobRiskData` consumes profile context, gates by readiness, and fetches via `ResearchDataService`.
- Chatbox executes profile analysis through `ResearchAssessmentIntegration`; messages are structured and cached by signature.
- Readiness gating is centralized and consistent across trigger and review step.
- Tests cover gating, mapping, executor paths, and error resilience.
- Structured logs aid debugging without PII or noise.
- No changes to API key or model selection UX.

## Risks & Mitigations
- Duplicate ReviewStep: designate `tabs/user-profile/steps/ReviewStep.tsx` as canonical.
- Partial profiles: strict gating; safe default returns.
- Cluster drift: hardcode/normalize to 5 clusters; deterministic aggregation.
- Cache key mismatch: centralize signature computation; stable skill sorting/hashing.
- Sticky overlap: test at `lg` and adjust `top`/padding if needed.

## References
- Detailed plan: `c:/Users/fecajilig/Desktop/backup/job-risk-profile-integration-implementation-plan.md`
- Visualization spec: `src/app/businessidea/tabs/job-risk/job-risk-visualization-spec.md`
- Adapter facade: `src/lib/profile-analysis/index.ts`
