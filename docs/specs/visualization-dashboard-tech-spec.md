# Visualization Dashboard — Technical Specification (Mobile Portrait)

Path: `src/app/businessidea/tabs/VisualizationContent.tsx`

Status: Draft v1 (2025-08-22)

Owner: Business Idea – Tabs


1) **Problem Analysis**
- **Goal**
  - Implement a mobile/portrait Metrics Dashboard in `VisualizationContent.tsx` that visually mirrors the provided screenshot in light mode.
  - Show KPI stat cards and vertically stacked chart cards (donut, line, bar) with filter controls.
  - Integrate with other tabs (`FinancialsContent.tsx`, `ListTab.tsx`, `TabNavigation.tsx`) and enable chat-based explanations via `ChatboxControls.tsx`.
  - Be Supabase/backend integration ready: typed data contracts, normalized schema, RPCs, and RLS plan.
- **Functional requirements**
  - KPI row: [Total Spend, Total Impressions, Viewable Impressions, Total Sales] with current values and delta % vs compare period.
  - Charts (portrait stacking):
    - Contextual distribution (donut/pie) with legend.
    - Device Type distribution (small donut/pie).
    - Impressions time series (line with per-point values, optional band/markers).
    - Spend by Channel (bar chart with export action).
    - Resonance score by Creative (small donut or radial gauge).
  - Filters: Time range (Last 7d, 30d, 12w), Compare to (Previous period | None). Optional Segment selector.
  - Chat integration: “Explain/Compare/Export” from any card; pass precise chart context to `ChatboxControls`.
  - Error/empty states; loading skeletons per card.
- **Non-functional requirements**
  - Mobile performance: small payloads; lazy-load heavy charts; minimize re-renders via memoized selectors.
  - Accessibility: proper roles, labels, color contrast; ARIA for filter controls.
  - Styling: light mode, modern, Tailwind utility classes consistent with existing tabs.
- **Assumptions**
  - KPI metric keys exist or will be computed from available sources; workbook values (from `FinancialsContent`) can enrich KPIs where applicable.
  - Supabase client lives at `src/lib/supabase/client.ts` (dynamic import-compatible) similar to pattern in `financials/persistence.ts`.
  - Existing visualization primitives in `src/components/visualization/*` and research charts can be reused; no new chart dependency initially.
- **Dependencies**
  - `ChatboxControls.tsx` and `useChatbox()` provider.
  - `TabContext` for active tab.
  - Potential future `src/lib/supabase/client.ts` implementation.
- **Ambiguities / Need confirmation**
  - Exact enumerations for dimensions: Contextual categories (Food, Tech, Shopping, etc.), Device types, Channels, Creatives.
  - Precise KPI definitions/units and comparison baselines.
  - Whether realtime updates are required.
- **Solution paths**
  - A) Reuse internal D3/TSX components + new lightweight wrappers for KPI/Donut/Bar/Line.
    - Pros: zero new deps; cohesive styling; low risk.
    - Cons: write small wrappers.
  - B) Introduce Recharts.
    - Pros: rapid assembly.
    - Cons: new dep; bundle size; styling mismatch.
  - C) Inline SVG micro-charts for KPI sparklines.
    - Pros: tiny; fast.
    - Cons: more custom code.

2) **Rationale**
- Prefer Path A (+C for micro-sparkline) to avoid new dependencies and preserve the codebase’s visualization style (`src/lib/visualization/d3-base.ts`, existing charts like `RiskHeatmap`, `SkillRadarChart`).
- Centralize state with `DashboardProvider` for filters, datasets, and selection to minimize prop drilling and enable chat integration.
- Use server-side pre-aggregations (Supabase RPCs/views) to keep mobile payloads small and responsive.

3) **Implementation Plan**
- **Files to create**
  - `src/app/businessidea/tabs/visualization/DashboardContext.tsx`
    - Provides `DashboardProvider` and `useDashboard()` for dashboard state, actions, and datasets.
  - `src/app/businessidea/tabs/visualization/metrics-types.ts`
    - Strong types for KPI, time series, breakdowns, filters, and chat payload.
  - `src/app/businessidea/tabs/visualization/metrics-selectors.ts`
    - Pure data transformations (delta calculations, rollups, top-N, formatting helpers).
  - `src/app/businessidea/tabs/visualization/useDashboardData.ts`
    - Data fetching hook (Supabase RPCs) + fallbacks; merges Financials workbook/Plan KPIs when configured.
  - `src/app/businessidea/tabs/visualization/chat-bridge.ts`
    - Builds `ChartContextPayload` consumed by `ChatboxControls` actions.
  - UI wrappers under `src/components/dashboard/`
    - `KpiCard`, `DonutCard`, `LineCard`, `BarCard`, `FilterBar` (mobile-optimized wrappers around existing visualization primitives or inline SVG when needed).
- **Files to modify**
  - `src/app/businessidea/tabs/VisualizationContent.tsx`
    - Replace placeholder with provider + filter bar + vertical stack of cards. Wire `onExplain/onCompare/onExport` via `chat-bridge`.
  - `src/components/chatbox/ChatboxControls.tsx`
    - Optional: read active `ChartContextPayload` and provide one-click “Explain this chart”.
  - `src/app/businessidea/tabs/financials/persistence.ts`
    - No change required; used as reference for dynamic import pattern.
- **Component/function signatures and data contracts (copy-paste ready)**
  - `metrics-types.ts` (signatures only)
    - Interfaces
      - `interface DashboardFilters { timeRange: '7d'|'30d'|'12w'; compareTo: 'prev'|'none'; segment?: string | null; }`
      - `interface MetricKPI { key: 'total_spend'|'total_impressions'|'viewable_impressions'|'total_sales'; value: number; deltaAbs: number; deltaPct: number; asOf: string; unit: 'currency'|'count'; }`
      - `interface TimeSeriesPoint { ts: string; value: number; }`
      - `interface DimensionBreakdown { metric: string; dimension: 'contextual'|'device'|'channel'|'creative'; category: string; value: number; }`
      - `interface ChartContextPayload { metric: string; filters: DashboardFilters; visibleWindow?: { start: string; end: string; }; highlights?: Record<string, number>; topCategories?: { category: string; value: number; }[]; lastPoints?: TimeSeriesPoint[]; }`
  - `DashboardContext.tsx` (public API)
    - `function DashboardProvider(props: { userId: string; children: React.ReactNode }): JSX.Element`
    - `function useDashboard(): { state: DashboardState; actions: DashboardActions }`
    - `interface DashboardState { filters: DashboardFilters; kpis: MetricKPI[]; series: Record<string, TimeSeriesPoint[]>; breakdowns: Record<string, DimensionBreakdown[]>; activeCardId: string | null; loading: boolean; error: string | null; }`
    - `interface DashboardActions { setFilters(f: Partial<DashboardFilters>): void; setActiveCard(id: string | null): void; refresh(): Promise<void>; exportSnapshot(): Promise<void>; }`
  - `useDashboardData.ts`
    - `function useDashboardData(userId: string, filters: DashboardFilters): { kpis: MetricKPI[]; series: Record<string, TimeSeriesPoint[]>; breakdowns: Record<string, DimensionBreakdown[]>; loading: boolean; error: string | null; }`
  - `metrics-selectors.ts`
    - `function computeDelta(current: number, prev: number): { deltaAbs: number; deltaPct: number }`
    - `function rollupSeries(points: TimeSeriesPoint[], granularity: 'day'|'week'|'month'): TimeSeriesPoint[]`
    - `function topN(items: DimensionBreakdown[], n: number): DimensionBreakdown[]`
  - `chat-bridge.ts`
    - `function buildChartContext(args: { cardId: string; metric: string; filters: DashboardFilters; series?: TimeSeriesPoint[]; breakdown?: DimensionBreakdown[]; kpi?: MetricKPI; }): ChartContextPayload`
- **Execution flow & integration points**
  - `VisualizationContent.tsx` wraps content in `DashboardProvider` and renders `FilterBar` and card stack.
  - Cards retrieve data via `useDashboard()` and subscribe to dataset IDs.
  - Card actions call `buildChartContext()` and pass payload to `useChatbox().startAnalysis()` appended to the user/system prompt.
  - `FinancialsContent` (optional enrichment): derive `total_spend`/`total_sales` via a tiny adapter and publish into dashboard on provider mount when enabled.
- **Performance**
  - Query Supabase pre-aggregations, not raw events.
  - IntersectionObserver to lazy-mount heavy charts.
  - Memoize selectors; pause re-computation when data unchanged.
  - Bounded arrays for timeseries (N points per range).
- **Error handling**
  - Centralized error string in `DashboardState`.
  - Per-card skeletons; inline retry on fetch error.
  - No console noise in production.
- **Maintainability**
  - Types-first design; selectors pure and tested.
  - UI wrappers isolate visual polish from data shape.

4) **Architecture Diagram (Mermaid)**
```mermaid
flowchart TD
  VC[VisualizationContent.tsx]\n(sticky FilterBar + vertical cards) --> DP
  subgraph Dashboard Layer
    DP[DashboardProvider] --> FD[useDashboardData]
    FD --> SEL[metrics-selectors.ts]
  end
  FD -->|RPC/View calls| SB[(Supabase)]
  DP --> KPI[KpiCard]
  DP --> D1[DonutCard: Contextual]
  DP --> LN[LineCard: Impressions]
  DP --> BR[BarCard: Spend by Channel]
  DP --> D2[DonutCard: Device/Resonance]
  VC --> CB[ChatboxControls.tsx]
  VC --> BRG[chat-bridge.ts]
  BRG --> CB
  FC[FinancialsContent.tsx] -. optional metrics .-> DP
  LT[ListTab.tsx] -. KPI ordering/goals .-> DP
```

5) **Testing Plan**
- Unit
  - `metrics-selectors.ts`: delta math, rollups, top-N, empty inputs, NaN guards.
  - `chat-bridge.ts`: payload correctness given filters and datasets.
- Integration
  - Render `VisualizationContent` with provider and mock RPC layer; assert loading → data → charts, filter changes trigger new queries, and `Explain` passes the correct payload to `useChatbox().startAnalysis`.
  - Validate mobile layout: cards stack vertically, spacing, sticky filter bar.
- Contract
  - Validate Supabase RPC return shapes against `metrics-types.ts`.
- Acceptance criteria
  - Matches screenshot layout in light mode.
  - KPI values + deltas visible; charts render with legends/labels.
  - Filters persist and are applied across cards.
  - Chat integration works from any card.
  - Empty/error states handled.

6) **Security & Compliance**
- Supabase RLS: enable on all metric tables/views; `user_id = auth.uid()` policies for SELECT/INSERT/UPDATE.
- No secrets in client; if anon key used, restrict policies to read-only and per-user rows.
- Data minimization: aggregated metrics only (no PII). Category names are non-sensitive enumerations.
- Rate limiting: throttle export endpoints; debounce client fetches.

7) **Final Checklist**
- Confirm enumerations for dimensions and KPI formulas/units.
- Approve Supabase schema + RPC names.
- Implement `DashboardContext` + `useDashboardData`.
- Build mobile card wrappers and wire actions.
- Add tests and run CI.
- QA on mobile viewport; verify accessibility and performance.

8) **Suggested Enhancements (Optional)**
- Realtime: Supabase Realtime subscriptions for time series.
- Snapshots: Save/load `metric_snapshots` for historical comparisons.
- Annotations: Allow chat-generated insights to pin to charts.

---

## UI/UX Spec (Light Mode, Mobile Portrait)
- **Container**: `max-w-sm mx-auto p-3 space-y-3`.
- **Header/FilterBar**: sticky top with rounded pill selectors; subtle shadow.
- **KPI Row**: horizontal scroll on XS, otherwise wrapped; each card `rounded-xl`, soft gradient background per metric, big value, tiny sparkline, delta chip.
- **Cards**: `rounded-2xl bg-white border border-slate-200/60 shadow-sm` with inner padding; headers with icon, title, right-aligned period chip.
- **Color Palette**: pastel indigo/blue/purple/teal accents consistent with existing `FinancialsContent` gradients; ensure WCAG AA contrast for text.
- **Interactions**: hover (desktop) + tap ripples (mobile), export button only on bar chart.

## Data Model & Supabase Contracts
- **Tables**
  - `metric_kpis(user_id uuid, metric_key text, current_value numeric, delta_value numeric, delta_pct numeric, as_of timestamptz, unit text, meta_json jsonb, primary key(user_id, metric_key))`
  - `metric_timeseries(id bigserial, user_id uuid, metric_key text, ts timestamptz, value numeric, meta_json jsonb, primary key(id), index (user_id, metric_key, ts))`
  - `metric_breakdowns(id bigserial, user_id uuid, metric_key text, dimension_key text, category text, value numeric, as_of timestamptz, meta_json jsonb, primary key(id), index (user_id, metric_key, dimension_key, as_of))`
  - `metric_snapshots(id bigserial, user_id uuid, snapshot_json jsonb, created_at timestamptz default now(), primary key(id), index(user_id, created_at))`
- **RPCs (expected shapes)**
  - `kpis_for_timerange(user_id uuid, time_range text) returns setof record(metric_key text, current_value numeric, delta_value numeric, delta_pct numeric, as_of timestamptz, unit text)`
  - `timeseries_for_metric(user_id uuid, metric_key text, time_range text, rollup text) returns setof record(ts timestamptz, value numeric)`
  - `breakdown_for_metric(user_id uuid, metric_key text, dimension_key text, time_range text, top_n int) returns setof record(category text, value numeric)`
- **RLS**
  - Enable RLS; policies enforce `user_id = auth.uid()` for all CRUD; views inherit.

## Layout Mapping (Screenshot → Cards)
1. KPI row (4 chips): Total Spend, Total Impressions, Viewable Impressions, Total Sales.
2. Card A (donut): Contextual distribution + legend.
3. Card B (donut): Device type distribution.
4. Card C (line): Impressions measurement over selected range.
5. Card D (bar): Spend by channel with Export button.
6. Card E (donut/radial): Resonance score by creative.

## Chat Integration Contract
- `ChartContextPayload` assembled by `chat-bridge.ts` includes:
  - `metric`, `filters`, `visibleWindow`, `topCategories`, `lastPoints`, and `highlights`.
- `ChatboxControls` receives payload and calls `startAnalysis()` with augmented system/user prompt to explain/compare metrics.

