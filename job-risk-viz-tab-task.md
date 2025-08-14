# Job Risk Visualization Tab — Implementation Task

## 1) Objective
Create a new, highly structured tab beside `src/app/businessidea/tabs/user-profile/` that visualizes job risk for the user’s current profile. The tab must:
- Read profile data captured in `src/app/businessidea/tabs/user-profile/steps/ReviewStep.tsx`.
- Use `src/lib/research/service/research-data-service.ts` and relevant `src/components/research/` patterns to produce analysis and insights.
- Embed `src/components/chatbox/ChatboxControls.tsx` to leverage OpenRouter API (API key and model selection remain managed there).
- Render minimal, modern D3 visualizations showing risk velocity, skills exposure, and short-horizon forecast, with room to expand later.

## 2) Scope
- Start fresh in a new tab folder to avoid conflicts with the existing `job-risk/` work.
- Keep a clean separation between UI components, controller (data orchestration), facade (service composition), and adapters (profile → query).
- Do not modify API key handling in `ChatboxControls`. Use it as-is.

## 3) Guiding Principles
- **Single source of truth for profile**: use `ChatboxProvider`’s `setProfileData` and `profileData`.
- **Composition over changes**: build a job-risk facade that composes `ResearchDataService` outputs without altering core service initially.
- **D3-only charts**: minimal text, accessible, responsive, and fast.
- **Extensibility**: folders and contracts designed to grow (more charts, alternate data sources).

## 4) High-Level Architecture
- **State**
  - Profile: stored centrally in `ChatboxProvider` via `setProfileData(data)`; read via `useChatbox().profileData`.
  - Job-risk: local controller (`useJobRiskController`) handles fetch, transform, loading, and error.
- **Data pipeline**
  1) `ReviewStep.tsx` CTA → `setProfileData(profile)` → navigate to new tab.
  2) New tab reads `profileData` → adapter → `JobRiskQuery`.
  3) Facade (`job-risk-research.ts`) composes `ResearchDataService` calls and shapes visualization data.
  4) D3 components render series/impacts/matrix/forecast. Insights panel shows KPIs and occupation risk summary.
  5) Embedded `ChatboxControls` provides optional AI narrative/augmentation via OpenRouter.

## 5) Folder & File Structure
Create a new folder to prevent clashes and keep the work self-contained:

```
src/app/businessidea/tabs/job-risk-viz/
  JobRiskVizTab.tsx                 # Main tab layout and orchestration
  types.ts                          # Shared types (CutSeries, Impacts, Forecast, Insights, JobRiskQuery)
  styles.css                        # Optional CSS vars/tokens for charts (if not using Tailwind only)
  adapters/
    profile-to-jobrisk.ts           # Normalize UserProfileData → JobRiskQuery
  services/
    job-risk-research.ts            # Facade over ResearchDataService with shaping & caching
  hooks/
    useJobRiskController.ts         # Orchestrates fetch+transform and returns chart-ready props
  components/
    VelocityCutsChart.tsx           # D3 line/area: "cuts over time"
    SkillAutomationChart.tsx        # D3 radial/chord for skill exposure
    ForecastFanChart.tsx            # D3 forecast continuation + band
    InsightsPanel.tsx               # KPIs, occupation risk summary, micro-bullets
    AIAnalysisPanel.tsx             # Collapsible wrapper embedding ChatboxControls
  __docs__/
    readme.md                       # Optional: data flow and contracts
```

## 6) Files to Create
- `src/app/businessidea/tabs/job-risk-viz/JobRiskVizTab.tsx`
- `src/app/businessidea/tabs/job-risk-viz/types.ts`
- `src/app/businessidea/tabs/job-risk-viz/styles.css` (optional)
- `src/app/businessidea/tabs/job-risk-viz/adapters/profile-to-jobrisk.ts`
- `src/app/businessidea/tabs/job-risk-viz/services/job-risk-research.ts`
- `src/app/businessidea/tabs/job-risk-viz/hooks/useJobRiskController.ts`
- `src/app/businessidea/tabs/job-risk-viz/components/VelocityCutsChart.tsx`
- `src/app/businessidea/tabs/job-risk-viz/components/SkillAutomationChart.tsx`
- `src/app/businessidea/tabs/job-risk-viz/components/ForecastFanChart.tsx`
- `src/app/businessidea/tabs/job-risk-viz/components/InsightsPanel.tsx`
- `src/app/businessidea/tabs/job-risk-viz/components/AIAnalysisPanel.tsx`
- `src/app/businessidea/tabs/job-risk-viz/__docs__/readme.md` (optional)

## 7) Files to Modify
- `src/app/businessidea/tabs/user-profile/steps/ReviewStep.tsx`
  - Add an "Analyze Job Risk" CTA that:
    - Calls `useChatbox().setProfileData(profileFormData)`.
    - Navigates/activates the new `job-risk-viz` tab.
- Tabs navigation/registry (wherever tabs are declared; e.g., a tabs index or router under `src/app/businessidea/tabs/`).
  - Register the new `JobRiskVizTab`.
  - Place it to the right of `user-profile` in the navigation order.

## 8) Data Flow (End-to-End)
- **Step 1 — From Review**: `ReviewStep.tsx` button persists profile via `setProfileData` and switches to `job-risk-viz`.
- **Step 2 — Adapter**: In the new tab, `profile-to-jobrisk.ts` maps `UserProfileData` → `JobRiskQuery`:
  - occupationCode or normalized title
  - industry (optional)
  - skills [{ id?, name }]
  - seniority (optional)
- **Step 3 — Facade**: `job-risk-research.ts` composes `ResearchDataService`:
  - `getOccupationRisk(occupationIdentifier)` for risk level/percentile and similars.
  - `getVisualizationConfig('line')` for base series when available.
  - `getAllTables()` / `getTableData(id)` to derive skills impacts/matrix and, if needed, velocity series.
  - Maintain an in-memory cache keyed by a hash of `JobRiskQuery`.
- **Step 4 — Controller**: `useJobRiskController` orchestrates fetch+transform, computes KPIs and micro-bullets, and exposes chart-ready props plus loading and error.
- **Step 5 — Rendering**: D3 charts consume shaped data; `InsightsPanel` shows KPIs and occupation risk summary.
- **Step 6 — Optional AI**: `AIAnalysisPanel` embeds `ChatboxControls` for OpenRouter-powered analysis; results surface in Chatbox messages.

## 9) Data Contracts (Minimal)
- **JobRiskQuery**
  - `occupationCode?` (string) or `occupationTitle?` (string)
  - `industry?` (string)
  - `skills` (array of { id?: string; name: string })
  - `seniority?` (string)
- **Controller Output**
  - `velocity`: { data: CutSeries }
  - `skills`: { impacts: SkillImpacts; matrix: RoleSkillMatrix }
  - `forecast`: { history: CutSeries; forecast: ForecastSeries }
  - `insights`: { global KPIs; bullets for velocity, skills, forecast; occupation summary (level, percentile, similars) }
  - `loading`: boolean
  - `error?`: string

## 10) Research Service Composition
Use `src/lib/research/service/research-data-service.ts` via a facade:
- Prefer consuming `getOccupationRisk()` as the anchor for occupation-level risk.
- Use `getVisualizationConfig('line')` if available for base time-series; otherwise derive from relevant tables via `getAllTables()` / `getTableData()`.
- Derive skill exposure/matrix from available KB tables (e.g., task/skill mappings) when a direct method is not present.
- Keep all shaping/caching in `job-risk-research.ts`; do not modify the core service initially.

## 11) Chatbox / OpenRouter Integration
- Embed `src/components/chatbox/ChatboxControls.tsx` inside `AIAnalysisPanel` (collapsed by default).
- Keep API key and model selection in ChatboxControls (per existing UX and user preference).
- Use `useChatbox().setProfileData()` as the handshake from `ReviewStep.tsx`; the tab may optionally read Chatbox messages later to enrich insights, but not required initially.

## 12) Implementation Steps (No Timeline)
- **Phase A — Scaffolding**
  - Create folder structure and skeleton files under `job-risk-viz/`.
  - Register and render `JobRiskVizTab` in the tabs UI.
- **Phase B — Data Plumbing**
  - Implement `profile-to-jobrisk.ts` adapter.
  - Implement `job-risk-research.ts` facade with caching and composition.
- **Phase C — Controller**
  - Implement `useJobRiskController` (fetch, transform, KPIs, bullets, loading/error).
- **Phase D — D3 Components**
  - Implement minimal but production-quality `VelocityCutsChart`, `SkillAutomationChart`, `ForecastFanChart` with accessibility and responsiveness.
  - Implement `InsightsPanel` and `AIAnalysisPanel` (embed ChatboxControls).
- **Phase E — Review CTA**
  - Add "Analyze Job Risk" button in `ReviewStep.tsx` to persist profile and navigate to the new tab.
- **Phase F — UX Polish**
  - Loading states per chart/panel, concise empty/error states, reduced-motion support.

## 13) Risks & Mitigations
- **Service gaps**: If a direct endpoint isn’t available, the facade derives datasets from KB tables; clearly comment TODOs for future direct endpoints.
- **State drift**: Centralize profile state in `ChatboxProvider` only; the new tab is read-only for profile.
- **API key UX**: Embedding ChatboxControls avoids duplicating API key flows and respects existing preferences.
- **Naming conflicts**: `job-risk-viz/` avoids clashing with the existing `job-risk/` folder.

## 14) Acceptance Criteria
- New `job-risk-viz` tab is registered and reachable from the business idea tabs UI.
- Pressing "Analyze Job Risk" from `user-profile/steps/ReviewStep.tsx` stores profile in `ChatboxProvider` and opens the new tab.
- The tab renders:
  - Velocity cuts over time (line/area)
  - Skills exposure (radial/chord mode)
  - Short-horizon forecast (fan with band)
  - Insights panel with KPIs and occupation risk summary
- `AIAnalysisPanel` embeds `ChatboxControls` (collapsed by default) without altering its behavior.
- All data is obtained via the facade over `ResearchDataService` with local caching; no changes to core service APIs.
