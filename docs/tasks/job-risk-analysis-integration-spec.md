# Job Risk Analysis Integration – Technical Specification

Status: Draft
Owner: Chatbox/BusinessIdea Team
Last updated: 2025-08-18 08:23 (+08:00)
Related files:
- `src/app/businessidea/tabs/user-profile/steps/ReviewStep.tsx`
- `src/app/businessidea/tabs/job-risk/JobRiskAnalysisTab.tsx`
- `src/components/chatbox/ChatboxProvider.tsx`
- `src/components/chatbox/hooks/useProfileIntegration.ts`
- `src/components/chatbox/ChatboxControls.tsx`
- `src/hooks/useResearchData.ts`
- `src/app/businessidea/tabs/job-risk/components/InsightsPanel.tsx`

---

## 1) Problem Analysis

- Requirements
  - Wire the Review tab button (Analyze Job Risk) in `ReviewStep.tsx` to:
    - Persist current profile to Chatbox context via `useChatbox().setProfileData(profile)`.
    - Navigate to the Job Risk tab (`setActiveTab('jobrisk')`).
  - Add a "Generate Insights" button in `JobRiskAnalysisTab.tsx` that:
    - Validates profile readiness via `useProfileIntegration().getAnalysisReadiness(profileData)`.
    - Validates Chatbox config (model + API key) using the same rules as `ChatboxControls.tsx`.
    - Triggers AI analysis using `useChatbox().startAnalysis()` with the persisted `profileData`.
    - Integrates research metrics from `useResearchData.ts` to enrich insights.
  - Provide a reusable, data-driven insights component to display combined research + AI outputs, designed for extensibility.

- Constraints & dependencies
  - Must reuse `ChatboxProvider` APIs: `setProfileData`, `startAnalysis`, `updateConfig`, and `status`.
  - Must reuse `useProfileIntegration` transform/readiness utilities (`toAnalysisData`, `getReadiness`).
  - Must reuse validation and key handling patterns from `ChatboxControls.tsx`.
  - Research requires initializing `initializeResearchService` and using `useOccupationRisk`, `useTaskAutomationData`.

- Ambiguities (to confirm during implementation)
  - Source of occupation identifier for research: prefer explicit code/id if available; fallback to normalized role string.
  - Whether to also open Chatbox UI upon analysis. Default: do not auto-open; leave to existing controls.

- Solution paths
  - Path A (Minimal, incremental): keep `useJobRiskData` and wire buttons + validation; add a thin adapter to the new insights component.
  - Path B (Refactor): introduce `useRiskInsights`/`useDataDrivenRisk` facade to unify research + AI; migrate tab to use it.
  - Decision: implement Path A now, design for easy swap to Path B.

---

## 2) Rationale
- Consistency: reuse `ChatboxControls` validation and key storage to avoid duplicated, divergent logic.
- Reliability: persist profile before navigation to prevent race conditions.
- Extensibility: introduce a reusable `DataDrivenInsights` component with a stable view model and slots.
- Safety: block analysis when readiness or config is invalid; show clear UI states.

---

## 3) Implementation Plan

### 3.1 Files to modify/create

- Modify: `src/app/businessidea/tabs/user-profile/steps/ReviewStep.tsx`
  - Add `useChatbox` and call `setProfileData(data)` before `setActiveTab('jobrisk')` in the Analyze button handler.
  - Keep disabled state based on `getAnalysisReadiness(data).ready`.

- Modify: `src/app/businessidea/tabs/job-risk/JobRiskAnalysisTab.tsx`
  - Import: `useChatbox`, `useProfileIntegration`, `validateAnalysisConfig`, `useChatboxSettings`.
  - Add a top-level "Generate Insights" button with validation and loading states.
  - Reuse `useJobRiskData()` outputs and/or add `useOccupationRisk` / `useTaskAutomationData` for enrichment.

- Create: `src/components/insights/DataDrivenInsights.tsx`
  - Reusable insights renderer (cards layout) for combined research + AI outputs.

- Update (if needed): `src/app/businessidea/tabs/job-risk/components/InsightsPanel.tsx`
  - Adapt current props to pass a stable view model to `DataDrivenInsights`.

- Documentation: `docs/tasks/job-risk-analysis-integration-spec.md` (this file)

### 3.2 Function signatures & data contracts

- Profile readiness (from `useProfileIntegration().getAnalysisReadiness`)
```ts
export interface ProfileReadiness {
  ready: boolean;
  completionLevel: number; // 0-100
  missing: string[];
  requirements: { minCompletion: number; autoTrigger: boolean };
}
```

- Analysis config (subset used by validation in UI)
```ts
export interface AnalysisConfig {
  model?: string;
  apiKey?: string; // OpenRouter key format: /^sk-or-v1-[a-f0-9]{32,}$/
  customPrompt?: string;
  // ...other config fields kept in provider
}
```

- Reusable insights component props
```ts
export interface AutomationExposureItem { task: string; exposure: number; }
export interface SkillImpactItem { skill: string; impact: 'high'|'medium'|'low'; rationale?: string; }
export interface MitigationItem { action: string; priority: 'high'|'medium'|'low'; }
export interface InsightSource { title: string; url?: string; }

export interface DataDrivenInsightsModel {
  summary?: string;
  riskScore?: number; // 0-100
  threatDrivers?: string[];
  automationExposure?: AutomationExposureItem[];
  skillImpacts?: SkillImpactItem[];
  mitigation?: MitigationItem[];
  sources?: InsightSource[];
}

export interface DataDrivenInsightsProps {
  insights: DataDrivenInsightsModel;
  loading?: boolean;
  errors?: string[];
  slots?: { headerRight?: React.ReactNode; footer?: React.ReactNode };
}
```

- Adapter (from research + AI state → view model)
```ts
export function adaptJobRiskToInsightsVM(
  research: any, // outputs from useJobRiskData/useOccupationRisk/useTaskAutomationData
  ai?: { summary?: string; mitigation?: MitigationItem[] }
): DataDrivenInsightsModel { /* map deterministically */ }
```

### 3.3 UI logic – Generate Insights button (JobRiskAnalysisTab)
- Gather inputs:
  - `const { profileData, config, status, startAnalysis } = useChatbox()`
  - `const { getAnalysisReadiness } = useProfileIntegration()`
- Validate readiness:
  - Disable when `!profileData` or `!getAnalysisReadiness(profileData).ready`.
- Validate config:
  - Use `validateAnalysisConfig(config, availableModels)` + API key regex `^sk-or-v1-[a-f0-9]{32,}$`.
- Button states:
  - Enabled when readiness + config valid and `status !== 'analyzing'`.
  - Show spinner when `status === 'analyzing'`.
- On click:
  - Persist key via `useChatboxSettings().saveApiKey(config.model, config.apiKey)`.
  - Call `await startAnalysis()`; provider will use current `profileData`.

### 3.4 Research data enrichment
- Derive `occupationIdentifier` from profile (preferred id/code; fallback normalized role string).
- Hooks:
  - `const { occupationRisk } = useOccupationRisk(occupationIdentifier)`.
  - `const { tasks } = useTaskAutomationData()` (optional list; filter by occupation if API supports).
- Map research outputs to `DataDrivenInsightsModel` via adapter.

### 3.5 Error handling & UX
- Readiness invalid: show small notice listing `missing` fields; button disabled with tooltip/title.
- Config invalid: show inline messages (missing model/api key), mirror `ChatboxControls` patterns.
- Research failures: show non-blocking warning and render AI-only insights.
- Accessibility: `aria-busy` during analysis; semantic button labels.

### 3.6 Performance
- Memoize occupation identifier.
- Avoid re-fetch on tab re-entry by relying on research service cache.
- Do not block AI start on research fetch; they proceed in parallel.

---

## 4) Architecture Diagram (Mermaid)
```mermaid
flowchart TD
  A[ReviewStep: Analyze Job Risk] --> B[ChatboxProvider.setProfileData(profile)]
  B --> C[TabContext.setActiveTab('jobrisk')]
  C --> D[JobRiskAnalysisTab]
  D --> E[useChatbox(): profileData, config, status, startAnalysis]
  D --> F[useJobRiskData()/useOccupationRisk/useTaskAutomationData]
  D --> G[Generate Insights Button]
  G -->|Validate readiness + config| H{Valid?}
  H -- No --> I[Inline Errors / Disabled]
  H -- Yes --> J[startAnalysis()]
  J --> K[AI Results]
  F --> L[Adapter]
  K --> L
  L --> M[DataDrivenInsights]
```

---

## 5) Testing Plan

- Unit tests
  - ReviewStep
    - Clicking Analyze calls `setProfileData(profile)` then `setActiveTab('jobrisk')` (order verified).
    - Disabled state when `readiness.ready === false`.
  - JobRiskAnalysisTab
    - Button disabled when: no profile, readiness false, invalid config, or `status === 'analyzing'`.
    - Valid click calls `startAnalysis()` exactly once; saves API key when present.
    - Error banners/messages appear when readiness/config invalid.
  - DataDrivenInsights
    - Renders sections conditionally; no crashes on missing arrays.
    - Skeletons shown when `loading === true`.

- Integration tests
  - End-to-end: fill profile → Analyze Job Risk → Generate Insights → analysis status transitions → insights render.
  - Research failure path: simulate `initializeResearchService` failure → still render AI-only insights with warning.

- Acceptance criteria
  - Profile persistence and tab navigation are deterministic.
  - Generate Insights respects readiness and config validation.
  - Combined insights render and update when AI completes.
  - No console errors in happy path.

---

## 6) Security & Compliance
- API key handling
  - Use `useChatboxSettings.saveApiKey/getApiKey`; never log API keys.
  - Validate key pattern before enabling analysis.
- Input validation
  - Guard `profileData` and transformation with `getAnalysisReadiness`.
  - Normalize occupation identifier; reject empty identifiers.
- Privacy & logs
  - Avoid logging PII from profile; debug logs off in production.
- Graceful degradation
  - If research unavailable, do not block AI analysis.

---

## 7) Final Checklist
- [ ] `ReviewStep.tsx`: wire `setProfileData` then `setActiveTab('jobrisk')`.
- [ ] `JobRiskAnalysisTab.tsx`: add Generate Insights with validation and loading states.
- [ ] `DataDrivenInsights.tsx`: implement reusable component and adapter mapping.
- [ ] Update `InsightsPanel` to use the new view model.
- [ ] Tests: unit + integration for button-to-insights flow.
- [ ] Verify key handling and config validation parity with `ChatboxControls.tsx`.
- [ ] Docs: keep this spec updated post-implementation.

---

## 8) Suggested Enhancements
- Inline config popover in JobRiskAnalysisTab when config invalid (reduce context switching).
- Persist last insights by profile hash (cache key = stable hash of transformed profile) for instant recall.
- Progressive streaming into `DataDrivenInsights` per section.
- Add small KPIs (risk score, exposure chip) near tab title when research is ready.
