# Job Risk Analysis Tab — Placeholder Data Visualizations Plan

## Objective
- Create a highly visual, modern, minimalist dashboard in `src/app/businessidea/tabs/job-risk/JobRiskAnalysisTab.tsx` to communicate: “Your job is already at risk” and “Industries are already cutting jobs due to AI.”
- Build pure frontend placeholders now, designed for seamless future integration with:
  - `src/app/businessidea/tabs/user-profile/` (selected occupation, skills)
  - `src/lib/research/service/` (risk, industry, task data)
  - `src/components/research/` (existing charts)

## Scope
- Implement a card-based layout with multiple visualization cards.
- Use D3 and minimalist React components (no new heavy diagram libraries).
- Reuse `RiskComparisonChart` and `IndustryExposureChart` from `src/components/research/`.
- Provide placeholder data via local mocks; do not call services yet.
- Include a non-functional `ControlsPanel` to showcase intended filters.

## Non‑Goals
- No backend/service calls yet.
- No data persistence, no analytics, no auth.

## Messaging
- Urgency-forward copy and visuals that imply present displacement:
  - “AI automation is already reducing roles across sectors.”
  - “Your role shows elevated automation risk now.”
  - “Risk is intensifying across the next cycles.”

## Existing Assets
- `src/components/research/RiskComparisonChart.tsx`
- `src/components/research/IndustryExposureChart.tsx`
- Optional: `src/components/unified/ResearchTransparencyPanel.tsx`
- `d3` and Tailwind CSS available.

## Deliverables
- Composed tab with the visuals below, responsive and accessible.
- Placeholder data contracts that mirror future service outputs.
- Skeleton/empty states and clear legends/tooltips.

## Layout
- Header: Overview gauge + risk label + percentile + short urgent summary.
- Grid (2 columns desktop, stacked on mobile):
  1) Risk vs Benchmark | Industry Exposure
  2) Task Automation Heatmap | Risk Trajectory
  3) Risk Distribution (similar roles) | Career Pathways Graph
- Footer: ControlsPanel and optional ResearchTransparencyPanel (collapsed by default).

## Files to Create (job-risk/)
- `components/OverviewRiskGaugeCard.tsx`
- `components/TaskAutomationHeatmapCard.tsx`
- `components/RiskTrajectoryCard.tsx`
- `components/RiskDistributionCard.tsx`
- `components/CareerPathwaysGraphCard.tsx`
- `components/ControlsPanel.tsx`
- `components/types.ts`
- `components/mock.ts`
- `components/mappers.ts`
- `components/palette.ts`

## Component Definitions (placeholders)
- OverviewRiskGaugeCard
  - Semi-circular D3 gauge showing risk score, severity color, and label.
  - Props: `occupationName`, `riskScore (0–1)`, `riskLevel`, `percentile`.

- RiskVsBenchmarkCard (reuse)
  - Wrap `src/components/research/RiskComparisonChart.tsx` in a card.
  - Props: `{ userRisk, benchmarkRisk, occupation, percentile }`.

- IndustryExposureCard (reuse)
  - Wrap `src/components/research/IndustryExposureChart.tsx` in a card.
  - Props: supports `limit`, `showEmployment`.

- TaskAutomationHeatmapCard
  - D3 heatmap of `{ taskCluster, automationProb }`.
  - Shows clusters most likely automated now.

- RiskTrajectoryCard
  - D3 line/area with confidence band; timeline of risk `{ t, risk, lower, upper }`.

- RiskDistributionCard
  - D3 histogram of similar roles; mark user’s risk with a vertical line.

- CareerPathwaysGraphCard
  - Minimal D3 force graph; nodes are occupations (colored by risk), edges by skill similarity (placeholder data).

- ControlsPanel
  - Non-functional filters: time horizon, scenario, industry multi-select, toggles for overlays.

## Placeholder Data Contracts
- Occupation (gauge)
  - `occupationName: string`
  - `socCode?: string`
  - `riskScore: number (0–1)`
  - `riskLevel: 'low'|'medium'|'high'|'very_high'`
  - `percentile: number`

- Risk vs Benchmark
  - `userRisk: number (0–1)`
  - `benchmarkRisk: number (0–1)`
  - `occupation: string`
  - `percentile: number`

- Industry Exposure (list or matrix)
  - `industry: string`
  - `naicsCode: string`
  - `exposureScore: number (0–1)`
  - `employment: string`
  - `share: string`

- Task Automation Heatmap
  - `taskCluster: string`
  - `automationProb: number (0–1)`

- Risk Trajectory
  - `t: number (0–1)`
  - `risk: number (0–1)`
  - `lower: number (0–1)`
  - `upper: number (0–1)`

- Risk Distribution (similar roles)
  - `label: string`
  - `riskScore: number (0–1)`

- Career Pathways Graph
  - Node: `id: string`, `label: string`, `riskScore: number (0–1)`
  - Edge: `source: string`, `target: string`, `weight: number (0–1)`

## Mapping (future integration)
- From `src/lib/research/service/`:
  - `getOccupationRiskWithFallback()` → gauge props.
  - `getIndustryData()` → industry card props.
  - `getTaskAutomationData()` → heatmap props.
  - `getTopRiskOccupations()` / search → distribution and pathways inputs.
- `components/mappers.ts`: pure functions to convert service shapes to component props.

## Visual & UX Guidelines
- Palette: neutral slate for base; severity colors — very high (red-500), high (orange-500), medium (amber-500), low (green-500).
- Spacing: 8px grid; consistent paddings; rounded corners; subtle shadows.
- Typography: clean hierarchy; concise labels; truncate with tooltip.
- Interactions: gentle enter animations; hover highlights; focus rings.
- Accessibility: aria-labels for charts; visible legends; keyboard focus on interactive graph nodes; color-blind-safe contrasts.

## States
- Loading: skeleton placeholders in each card.
- Empty: “Connect your profile to see personalized risk.”
- Error slot reserved in each card (display later when service integrates).

## Copy (examples)
- Header badge: “AI Impact: Immediate.”
- Overview subtitle: “Your role faces elevated automation risk now.”
- Industry subtitle: “Widespread reductions across sectors.”
- Trajectory subtitle: “Risk intensifies across the next cycles.”

## Step-by-Step Checklist
- [ ] Create folder: `src/app/businessidea/tabs/job-risk/components/`
- [ ] Add utility files: `types.ts`, `mock.ts`, `mappers.ts`, `palette.ts`
- [ ] Build `OverviewRiskGaugeCard` (D3 gauge, placeholder props)
- [ ] Integrate `RiskComparisonChart` in a card wrapper
- [ ] Integrate `IndustryExposureChart` in a card wrapper
- [ ] Build `TaskAutomationHeatmapCard` (D3 heatmap)
- [ ] Build `RiskTrajectoryCard` (D3 line/area with band)
- [ ] Build `RiskDistributionCard` (D3 histogram + user marker)
- [ ] Build `CareerPathwaysGraphCard` (D3 force layout)
- [ ] Build `ControlsPanel` (non-functional UI)
- [ ] Compose `JobRiskAnalysisTab.tsx` with header + 3-row grid + footer
- [ ] Add skeleton and empty states to every card
- [ ] Add aria-labels, legends, and focus handling
- [ ] Wire cards with `mock.ts` data for visual completeness
- [ ] Add placeholders for mappers (no service calls yet)
- [ ] Optional: render `ResearchTransparencyPanel` collapsed at bottom

## Acceptance Criteria
- Dashboard presents urgent risk messaging visually and textually.
- All cards render with placeholder data and consistent styling.
- Components accept props that mirror future service outputs.
- Responsive two-column layout (desktop) with mobile stacking.
- Accessibility basics: labels, legends, focus states, color contrast.
