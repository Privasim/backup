# Data-Driven Insights and Automation Exposure Visualization — Implementation Documentation

This document details the full implementation from text/narrative handling to visualization, including data contracts, adapters, UI rules, accessibility, performance, and testing guidance.


## 1) Problem Analysis

- __Requirements__
  - Render a cohesive “Job Risk Insights” experience using `DataDrivenInsightsModel`.
  - Provide clear, contextual narratives and structured facts for Threat Drivers, Automation Exposure, Skills, Mitigations, and Sources in `DataDrivenInsights`.
  - Visualize task-level automation exposure in a dedicated card with a D3-based bar chart (`AutomationExposureBar`).
  - Add supportive context beneath the chart: narrative-first rule, computed facts (avg/median/p90/counts), filter/truncation notes, optional sources.
  - Include interactive controls: expand/collapse and copy-to-clipboard, with accessible semantics.

- __Constraints__
  - No new dependencies; leverage existing stack (React, Tailwind, lucide-react, D3).
  - Exposure values normalized to 0–100; filtering by `minExposure`, truncation by `topN`.
  - Maintain responsive, modern UI within existing card design language.

- __Assumptions__
  - Insights are provided to components in the `DataDrivenInsightsModel` shape.
  - Clipboard API available for user-triggered copy; failures are non-fatal.

- __Ambiguities__
  - Exact priority/thresholds: aligned to existing rule: high > 70, moderate > 40, else low.
  - Sources rendered locally in the card vs. central list: we show up to 2 locally to avoid clutter.

- __Solution paths__
  - Path A: Implement context locally in `AutomationExposureCard` (chosen).
  - Path B: Add an upstream context slot in `DataDrivenInsights` (deferred to avoid coupling).


## 2) Rationale

- __Narrative-first consistency__: Mirrors `DataDrivenInsights.tsx` behavior — if a narrative exists for a section, prefer it, followed by structured facts.
- __Co-located context__: Keeps meaning near visuals, reducing cognitive load and scroll.
- __Performance__: All derived stats computed in `useMemo` from the displayed data only.
- __Accessibility__: Regions labeled with `aria-labelledby` and keyboard-focusable controls; external links use safe rel/target attributes.


## 3) Implementation Plan (What’s Implemented)

- __Files__
  - `src/components/insights/types.ts`
    - Defines `DataDrivenInsightsModel` and related item interfaces.
  - `src/components/insights/DataDrivenInsights.tsx`
    - Renders Summary, Threat Drivers, Automation Exposure, Skills, Mitigation, and Sources sections.
    - Applies the narrative-first rule per section and uses accessible, consistent card UI.
  - `src/components/visualizations/automation-exposure-card.tsx`
    - Adapts `insights.automationExposure` → bar series (filter ≥ `minExposure`, sort desc, slice `topN`).
    - Renders `AutomationExposureBar` (D3).
    - Adds Context panel: narrative, computed facts (top task, avg, median, p90, counts), filter/truncation notes, optional sources.
    - Provides expand/collapse and copy-to-clipboard, with accessible semantics.
  - `src/components/visualizations/automation-exposure-bar.tsx`
    - D3-based bar chart rendering; styles aligned for contrast and clarity.

- __Data contracts__ (`src/components/insights/types.ts`)
  ```ts
  export interface AutomationExposureItem {
    task: string;
    exposure: number; // 0-100
  }

  export interface DataDrivenInsightsModel {
    summary?: string;
    riskScore?: number; // 0-100
    threatDrivers?: string[];
    automationExposure?: AutomationExposureItem[];
    skillImpacts?: { skill: string; impact: 'high' | 'medium' | 'low'; rationale?: string }[];
    mitigation?: { action: string; priority: 'high' | 'medium' | 'low' }[];
    sources?: { title: string; url?: string }[];
    narratives?: {
      riskNarrative?: string;
      threatNarrative?: string;
      automationNarrative?: string;
      skillsNarrative?: string;
      mitigationNarrative?: string;
      methodologyNote?: string;
      confidenceNote?: string;
      oneLiner?: string;
    };
  }
  ```

- __Adapter: Automation Exposure → Bar Items__
  - Clamp each `exposure` to [0,100].
  - Filter on `minExposure`.
  - Sort desc and slice to `topN`.

- __Context stats (computed from displayed items)__
  - `topTaskLabel`, `topTaskValue`
  - `avg` (rounded), `median` (rounded for even count), `p90` (index `ceil(0.9*n)-1` in ascending sort)
  - `counts` segmented by thresholds: high (>70), moderate (>40), low (≤40)
  - `filteredEligible` = count of full dataset meeting `minExposure`
  - `truncatedFrom` = `filteredEligible` if `> topN`, else 0

- __UI & UX__
  - Card shell: white background, subtle shadow, rounded corners, borders (consistent with design references).
  - Expand/Collapse: default expanded, `aria-expanded` toggling, icons (`ChevronUp/Down`).
  - Copy-to-clipboard: collects narrative + facts + notes into newline-separated text; provides transient “Copied” state.
  - Sources: renders up to 2 items below facts with `ExternalLink` icon and safe link attributes.
  - Color/contrast: chart text high-contrast; subtle separators/borders; readable content on white.

- __Accessibility__
  - Context region uses `role="region"` with `aria-labelledby` referencing a unique heading id (`useId`).
  - Narrative and facts follow reading order; lists use `role="list"`/`role="listitem"`.
  - Buttons are keyboard focusable with visible focus ring; copy/expand actions have clear labels.
  - External links: `target="_blank"`, `rel="noopener noreferrer"`.

- __Error/Loading states__
  - `DataDrivenInsights.tsx`: skeletons for loading; descriptive messages for errors/empty states.
  - `AutomationExposureCard.tsx`: empty state messaging when no exposure data.

- __Configuration knobs__
  - `topN` (default 8), `minExposure` (default 0), `title`, `className` on `AutomationExposureCard`.


## 4) Architecture Diagram (Mermaid)

```mermaid
flowchart TB
  A[DataDrivenInsightsModel] -->|props| B[DataDrivenInsights.tsx]
  B -->|narratives + data| C[Threat/Skills/Mitigation Sections]
  B -->|automationExposure| D[AutomationExposureCard]
  D -->|filter/sort/slice| E[barItems]
  E --> F[AutomationExposureBar (D3 SVG)]
  D -->|useMemo| G[Context Stats]
  G --> H[Narrative + Facts + Notes + Sources]
  H --> I[Expand/Collapse]
  H --> J[Copy-to-Clipboard]
```


## 5) Testing Plan

- __Unit tests__ (`@testing-library/react` + JSDOM)
  - Context rendering:
    - With `narratives.automationNarrative`, narrative appears above facts.
    - Facts list shows correct top task, avg, median (odd/even), p90, counts, total.
  - Filtering/truncation notes:
    - When `minExposure > 0`, show “Filtered by minimum exposure ≥ …”.
    - When eligible > `topN`, show “Showing top N of M eligible tasks.”
  - Interactions:
    - Expand/Collapse toggles details and updates `aria-expanded`.
    - Copy button writes expected text and toggles “Copied” state.
  - A11y:
    - Context region uses `aria-labelledby` with a unique id (`useId`).
    - Links include `rel` and `target` attributes.

- __Visual QA__
  - Verify card spacing, typography, and hover/focus states match design patterns.
  - Validate chart readability, label contrast, and no clipping with long labels.
  - Responsive: ensure layout integrity from mobile to desktop.


## 6) Security & Compliance

- No secrets stored or transmitted; no external network calls added.
- Clipboard writes initiated only by explicit user action; content is local text.
- External links hardened (`rel="noopener noreferrer"`).


## 7) Final Checklist

- __Implemented__
  - Narrative-first rendering across insights sections.
  - Automation Exposure card with D3 bar chart.
  - Context panel under chart with narrative, stats, notes, and sources.
  - Expand/Collapse and Copy-to-Clipboard interactions.
  - Accessible patterns (region labeling, focus styles, link safety).

- __Pending/Recommended__
  - Add unit tests for context panel and interactions.
  - Dark mode contrast audit and adjustments.
  - Documentation cross-link in `docs/` high-level guide if desired.


## 8) Suggested Enhancements (Optional)

- __Dark Mode__: Theme-aware variables for text and subtle backgrounds in context panel.
- __Bar Tooltips__: Per-bar tooltip with task-specific details; align with global context calculations.
- __Export__: Add “Copy as Markdown” or export-to-CSV for the contextual stats.
- __Progressive Disclosure__: Default collapsed on mobile; expanded on desktop.
- __Methodology__: If `narratives.methodologyNote` is present, render below facts for transparency.
