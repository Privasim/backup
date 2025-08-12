# Job Risk Analysis Visualizations — Implementation Plan (Placeholder, Integration‑Ready)

This plan defines a modular, minimalist, and urgent-feel visualization suite for `JobRiskAnalysisTab` that communicates “when you’ll be replaced,” not “if.” It is placeholder‑only now, with typed data contracts and mapping stubs planned for seamless integration with:

- `src/app/businessidea/tabs/user-profile/` (selected occupation/profile context)
- `src/lib/research/service/` (risk, industry exposure, task automation, benchmarks)
- `src/components/research/` (existing minimalist charts)

Tone and theme strictly follow: your job is already at risk; all industries are cutting jobs because of AI. Visuals emphasize time-to-impact.

---

## Goals & Non‑Goals

- **[goals]**
  - Communicate time-to-replacement (months), not probability.
  - Build modular, reusable cards with clear contracts for future data.
  - Premium minimalist UI (slate neutrals, amber/red emphasis, subtle shadows, clean type).
  - A11y-compliant, responsive, with subtle animated feedback.
- **[non-goals]**
  - No live service calls yet; no new dependencies; no business logic changes.

---

## Stack Reality & Constraints

- **[available]** `d3`, Tailwind, existing research components.
- **[not installed]** React Flow / ProjectStorm / Reaflow. We will not add diagram libs.
- **[reuse]**
  - `src/components/research/RiskComparisonChart.tsx`
  - `src/components/research/IndustryExposureChart.tsx`

---

## Directory Plan (not created yet)

- `src/app/businessidea/tabs/job-risk/`
  - `JobRiskAnalysisTab.tsx` — orchestration, layout, props wiring
  - `components/`
    - `TimeToReplacementGauge.tsx` — semi-arc countdown gauge
    - `DisplacementTrajectory.tsx` — timeline (line/area) with thresholds
    - `TaskHeatmapTimeline.tsx` — tasks × months heatmap
    - `IndustryCutIndex.tsx` — industry tiles (MVP: wrap `IndustryExposureChart`)
    - `YouVsMarketClock.tsx` — months comparison (MVP: wrap `RiskComparisonChart`)
    - `LayoffTicker.tsx` — AI cut events list (placeholder)
    - `ControlsPanel.tsx` — timeframe/scenario toggles (placeholder)
  - `mock/`
    - `data.ts` — deterministic placeholder datasets
  - `utils/`
    - `mapping.ts` — mapping functions (service → time-based contracts)
    - `colors.ts` — palette tokens & scales
  - `types.ts` — shared interfaces (see Data Contracts)

---

## Visual Components (modular cards)

For each: purpose, placeholder behavior, future data linkage, and tone/copy.

1) **TimeToReplacementGauge**
- **Purpose**: Anchor the narrative with a big countdown (e.g., “14 months”).
- **Placeholder**: Static months with color ramp (amber→red as time shrinks), pulsing badge if < 12 months.
- **Future data**: From `OccupationRisk` via `mapOccupationRiskToTime()`.
- **Copy**: “Replacement window: 14 months”; “Critical window”.

2) **DisplacementTrajectory**
- **Purpose**: Show months to partial vs full displacement over a short horizon.
- **Placeholder**: D3 line/area with threshold bands (Now, 6m, 12m, 24m), markers at inflection.
- **Future data**: Projections derived from research trend or exposure.
- **Copy**: “Trajectory is accelerating; full displacement expected in ~18 months.”

3) **TaskHeatmapTimeline**
- **Purpose**: Identify earliest vulnerable task clusters by months to 50% automation.
- **Placeholder**: Grid of rects (tasks × months bins), hotter color = sooner.
- **Future data**: `getTaskAutomationData()` → `{ cluster, monthsTo50, monthsTo80, currentPct }`.
- **Copy**: “Earliest tasks to be replaced: Routine Reporting (6–9 months).”

4) **IndustryCutIndex**
- **Purpose**: Reinforce that cuts are broad and near-term across industries.
- **Placeholder**: Tile grid ranking industries by `monthsToSignificant`; small sparkline.
- **MVP reuse**: `IndustryExposureChart` labeled as ETA; annotate to emphasize time.
- **Future data**: `getIndustryExposureData()` → map to `{ industry, monthsToSignificant }`.
- **Copy**: “Most industries hit within 12–18 months.”

5) **YouVsMarketClock**
- **Purpose**: Compare your months remaining to benchmark/industry median.
- **Placeholder**: Two-bar/dual-dial with months (not %). Animation on reveal.
- **MVP reuse**: `RiskComparisonChart` with months labels.
- **Future data**: Benchmark from service or `getTopRiskOccupations()`.
- **Copy**: “Your timeline is 4.8 months sooner than peers.”

6) **LayoffTicker**
- **Purpose**: Evidence of “already happening”—AI-driven cut events.
- **Placeholder**: Scrolling list with date, company, industry, count (fake but plausible), optional source chip.
- **Future data**: Hook to research KB / curated feed.
- **Copy**: “2025‑05‑10 • FinServ Co. • 2,300 roles automated.”

7) **ControlsPanel**
- **Purpose**: Scenario controls (Baseline/Aggressive), time horizon (6/12/24m), region filter (disabled initially).
- **Placeholder**: Non-functional toggles updating mock data in memory.
- **Future data**: Feed params to `research/service` queries.

8) **(Optional) EscapeRoutes**
- **Purpose**: Safer transitions ranked by “months gained before displacement.”
- **Placeholder**: Ranked list; defer D3 force graph.
- **Future data**: Skills similarity + occupation timelines.

---

## Data Contracts (integration‑ready, described)

- **OccupationImpact**
  - `occupationId: string`
  - `title: string`
  - `monthsToPartial: number`
  - `monthsToFull: number`
  - `trendPerQuarter: number`
  - `factors: { key: string; weight: number }[]`

- **TaskAutomationForecast[]**
  - `cluster: string`
  - `monthsTo50: number`
  - `monthsTo80: number`
  - `currentPct: number`

- **IndustryDisruptionItem[]**
  - `industry: string`
  - `monthsToSignificant: number`
  - `exposureScore: number`
  - `trend: number`

- **BenchmarkComparison**
  - `occupation: string`
  - `userMonths: number`
  - `benchmarkMonths: number`

- **LayoffEvent[]**
  - `date: string (ISO)`
  - `company: string`
  - `industry: string`
  - `count: number`
  - `note?: string`
  - `sourceUrl?: string`

> Mapping plan keeps “time to impact” primary. Percentages, if present, are supportive only.

---

## Mapping Functions (planned)

- **mapOccupationRiskToTime(OccupationRisk)** → `OccupationImpact`
  - Monotonic transform of `riskScore` + `trend` to months for partial/full.
- **mapIndustryExposureToETA(IndustryExposure[])** → `IndustryDisruptionItem[]`
  - Exposure + trend → monthsToSignificant.
- **mapTasksToHeatmap(TaskData)** → `TaskAutomationForecast[]`
  - Normalize tasks into clusters; compute months bins.
- **deriveBenchmarkMonths(occupationId)** → `BenchmarkComparison`
  - From peer set or industry median.

These live in `src/app/businessidea/tabs/job-risk/utils/mapping.ts` and are pure functions so we can swap mock → live with minimal change.

---

## Theming & Copy Guidelines

- **Palette**
  - Base: slate/charcoal neutrals for surfaces and text.
  - Emphasis: amber/orange/red for near-term impact. Avoid green for positive connotation.
  - Colorblind-safe sequential ramp for timelines/heatmaps.
- **Typography**
  - Clean, compact; 8px spacing grid; strong hierarchy in headings.
- **Copy**
  - Headlines state time (“Replacement window: 14 months”).
  - Annotations emphasize inevitability and acceleration.
  - Avoid “probability,” “chance,” or “might.” Use “expected,” “window,” “already.”

---

## A11y, Interactions & States

- **A11y**: Aria labels on charts, keyboard focus order, text summaries for visuals, sufficient contrast.
- **Interactions**: Subtle fade/scale on entry; hover highlights; pulsing countdown when `< 12m`.
- **States**: Loading skeletons; empty/fallback copy; graceful errors in each card.

---

## Page Layout (responsive)

- **Header strip**: TimeToReplacementGauge + badges (Partial/Full ETA) + last updated timestamp.
- **Two‑column grid** (desktop):
  - Left: YouVsMarketClock, TaskHeatmapTimeline, LayoffTicker.
  - Right: IndustryCutIndex, DisplacementTrajectory, (optional) Risk Factors chips.
- **Mobile**: Stack cards; maintain readable labels; overflow scroll for dense visuals.

---

## Reuse & Integration Hooks

- **Reuse now**: 
  - `RiskComparisonChart` → months labels (MVP for YouVsMarketClock)
  - `IndustryExposureChart` → rank industries with ETA annotations
- **Integration later**:
  - `useJobRiskData()` (inside `hooks/`) obtains occupation from `user-profile` context (stub returns mock initially).
  - Replace mock providers with `research/service` calls; feed through mapping functions.

---

## Mermaid: Data & UI Flow

```mermaid
flowchart LR
  subgraph UserProfile[User Profile Tab]
    UP[Selected Occupation & Context]
  end

  subgraph JobRisk[Job Risk Analysis Tab]
    ORCH[Orchestrator\n(JobRiskAnalysisTab.tsx)]
    CTRL[ControlsPanel\n(scenario/horizon)]

    GAUGE[TimeToReplacementGauge]
    TRAJ[DisplacementTrajectory]
    HEAT[TaskHeatmapTimeline]
    IND[IndustryCutIndex]
    COMP[YouVsMarketClock]
    TICK[LayoffTicker]
  end

  subgraph Service[Research Service]
    RISK[OccupationRisk]
    IND_EXP[Industry Exposure]
    TASKS[Task Automation]
    BENCH[Benchmarks]
  end

  UP --> ORCH
  CTRL --> ORCH

  ORCH -->|mapping.ts| GAUGE
  ORCH -->|mapping.ts| TRAJ
  ORCH -->|mapping.ts| HEAT
  ORCH -->|mapping.ts| IND
  ORCH -->|mapping.ts| COMP
  ORCH --> TICK

  Service -.future.-> ORCH
  RISK --> ORCH
  IND_EXP --> ORCH
  TASKS --> ORCH
  BENCH --> ORCH
```

---

## Implementation Steps (no code yet)

1. **Scaffold contracts & mocks**
   - Define interfaces in `types.ts` (as above, time‑based).
   - Create `mock/data.ts` with deterministic datasets covering diverse scenarios.
   - Write `utils/colors.ts` tokens and sequential ramps (doc only for now).

2. **Build card components (placeholders)**
   - Implement minimal D3/SVG per component with props only.
   - Add skeleton/empty states; aria labels; responsive sizing.

3. **Compose `JobRiskAnalysisTab.tsx`**
   - Arrange header + grid; pass mock props; wire `ControlsPanel` (in‑memory state only).
   - Reuse `RiskComparisonChart` and `IndustryExposureChart` where noted.

4. **Integration stubs**
   - Add `hooks/useJobRiskData.ts` to read user profile (stub now).
   - Add `utils/mapping.ts` with pure function signatures returning time‑based contracts.

5. **Polish**
   - Copywriting pass: ensure “when” messaging, urgent tone.
   - A11y review; micro‑interaction tuning; colorblind audit.

6. **QA**
   - Mobile/desktop layout; legends/labels; empty data behavior; performance sanity.

---

## Acceptance Criteria

- Cards render with placeholder data and skeletons; no runtime errors.
- Headline visuals emphasize months to replacement, not probability.
- Reused charts display time‑to‑impact labels where applicable.
- Components accept props matching planned contracts; mapping utils documented.
- Layout responsive, accessible, with subtle animations; palette matches tone.

---

## Risks & Mitigations

- **No direct months data** from service initially → use deterministic mapping transforms; document assumptions.
- **Library temptation** → stick to D3/SVG; avoid new deps.
- **Overly optimistic color** → enforce amber/red for impact; blue only for neutral annotations.

---

## Milestones & Deliverables

- **M1**: Contracts + mocks + colors documented; component shells designed.
- **M2**: Placeholder cards implemented; tab composed with controls.
- **M3**: Mapping utils + `useJobRiskData` stubs; reused charts adapted.
- **M4**: Polish, a11y, QA; ready to swap mock → service.

---

## Files to Touch (later, during implementation)

- Update: `src/app/businessidea/tabs/job-risk/JobRiskAnalysisTab.tsx` (compose placeholders)
- Add: `src/app/businessidea/tabs/job-risk/components/*`
- Add: `src/app/businessidea/tabs/job-risk/mock/data.ts`
- Add: `src/app/businessidea/tabs/job-risk/utils/{mapping.ts,colors.ts}`
- Add: `src/app/businessidea/tabs/job-risk/types.ts`

> All changes will maintain existing props APIs elsewhere and avoid altering business logic.
