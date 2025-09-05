# Cost Comparison Card Visualization Enhancement Documentation

## Overview
This document provides detailed specifications for implementing enhanced visualizations in the CostComparisonCard component (`src/components/visualizations/cost-comparison-card.tsx`). The implementation will utilize existing backend data from `src/hooks/use-cost-comparison.ts` and emphasize AI's competitive advantages over human labor in terms of cost, efficiency, and capacity.

## Core Philosophy
- **No Mock Data**: All visualizations must be derived from actual user inputs and computed metrics. No hardcoded test data or fictional values.
- **Data-Driven**: Every visual element must map to real calculations from the existing hook.
- **Business Narrative**: Emphasize why businesses choose AI (cost savings, efficiency, capacity) rather than job displacement as a threat.
- **Token Compliance**: Use design tokens exclusively for colors and styling.

## Current Backend Data Structure

### Input Configuration (from user controls)
```typescript
interface CostComparisonConfig {
  humanHourlyCost: number;    // User input: $/hour for human labor
  aiHourlyCost: number;       // User input: $/hour for AI
  hoursPerWeek: number;       // User input: hours/week
  weeksPerYear: number;       // User input: weeks/year
}
```

### Computed Output (from useCostComparison hook)
```typescript
interface CostComparisonData {
  humanCost: number;          // Annual human labor cost
  aiCost: number;             // Annual AI cost
  jobDisplacementCost: number; // Annual savings (humanCost - aiCost)
  jobDisplacementPercentage: number; // (jobDisplacementCost / humanCost) * 100
  costRatio: number;         // (aiCost / humanCost) * 100
}
```

## Derived Metrics for Visualizations

### Locally Computed in Component (memoized)
```typescript
interface DerivedMetrics {
  // Weekly equivalents
  humanWeekly: number;        // humanCost / weeksPerYear
  aiWeekly: number;           // aiCost / weeksPerYear
  displacementWeekly: number; // jobDisplacementCost / weeksPerYear

  // Hourly delta
  deltaHourly: number;        // humanHourlyCost - aiHourlyCost

  // Capacity analysis
  capacityMultiplier: number; // humanCost / aiCost (budget parity)
  humanHours: number;         // (hoursPerWeek * weeksPerYear)
  aiHours: number;            // humanCost / aiHourlyCost (equal budget)

  // Sensitivity analysis (11 points: 0%, 10%, ..., 100%)
  sensitivitySeries: Array<{share: number, displacement: number}>;

  // Operating efficiency
  operatingSpan: number;      // weeksPerYear (annual operating weeks)
  productivityRatio: number;  // aiHours / humanHours (equal budget)
}
```

## Files to Create/Modify

### 1. Core Component Files
**File: `src/components/visualizations/cost-comparison-card.tsx`**
- **Action**: Modify
- **Changes Required**:
  - Add derived metrics computation with `useMemo`
  - Import additional icons from `lucide-react`
  - Add new visualization sections
  - Update header title to "Cost Comparison — AI's Economic Advantage"
  - Ensure all new elements use design tokens

### 2. Hook Enhancement
**File: `src/hooks/use-cost-comparison.ts`**
- **Action**: No changes required
- **Rationale**: Current hook provides sufficient base metrics

### 3. New Visualization Components
**File: `src/components/visualizations/charts/` (new directory)**
- **Action**: Create directory and files
- **Files to Create**:
  - `displacement-gauge.tsx` - Semi-circular gauge component
  - `cost-waterfall.tsx` - Waterfall chart for cost breakdown
  - `cost-share-donut.tsx` - Donut chart for AI cost share
  - `threshold-bullet.tsx` - Bullet chart with thresholds
  - `capacity-comparison.tsx` - Bar chart for equal-budget hours
  - `sensitivity-sparkline.tsx` - Line chart for automation sensitivity
  - `kpi-tiles.tsx` - Compact KPI display tiles

### 4. Utility Files
**File: `src/components/visualizations/utils/chart-helpers.ts`**
- **Action**: Create
- **Purpose**: Pure functions for chart calculations and formatting

### 5. Type Definitions
**File: `src/types/visualization.ts`**
- **Action**: Create/Modify
- **Purpose**: TypeScript interfaces for chart props and data

## Visualization Specifications

### 1. Job Displacement Gauge
**Component**: `DisplacementGauge`
**Data Source**: `jobDisplacementPercentage`
**Type**: Semi-circular radial gauge
**Colors**:
- Background: `.bg-neutral-100`
- Fill: Gradient from `.warning-500` to `.error-600`
- Needle: `.text-error-700`
- Labels: `.text-error-700`
**Accessibility**: `role="progressbar"` with proper ARIA attributes
**Narrative**: "X% of current labor spend is economically displaceable by AI"

### 2. Cost Waterfall Chart
**Component**: `CostWaterfall`
**Data Source**: `humanCost`, `jobDisplacementCost`, `aiCost`
**Type**: Horizontal waterfall with 3 segments
**Colors**:
- Human bar: `.bg-brand-500`
- Displacement segment: `.bg-error-500`
- AI bar: `.bg-neutral-400`
**Layout**: Compact, axis-free with value labels
**Narrative**: "Every $1 in human labor drops by $Y when shifted to AI"

### 3. Cost Share Donut
**Component**: `CostShareDonut`
**Data Source**: `costRatio`
**Type**: Ring/donut chart
**Colors**:
- AI segment: `.fill-error-500`
- Remainder: `.fill-neutral-200`
- Center label: `.text-error-700`
**Narrative**: "AI costs only Z% of human labor for the same operating time"

### 4. Threshold Bullet Chart
**Component**: `ThresholdBullet`
**Data Source**: `jobDisplacementPercentage`
**Type**: Horizontal bullet with bands
**Thresholds**:
- Normal: 0-30% (`.bg-neutral-200`)
- Warning: 30-60% (`.bg-warning-300`)
- Severe: 60-100% (`.bg-error-400`)
**Colors**: Marker uses `.bg-error-700`
**Narrative**: "Current displacement exceeds acceptable threshold by M percentage points"

### 5. Capacity Comparison Bars
**Component**: `CapacityComparison`
**Data Source**: `humanHours`, `aiHours`, `productivityRatio`
**Type**: Side-by-side bar chart
**Colors**:
- Human bar: `.bg-brand-500`
- AI bar: `.bg-error-500`
- Labels: `.text-primary`
**Narrative**: "Same budget buys R× more operating hours with AI"

### 6. Sensitivity Sparkline
**Component**: `SensitivitySparkline`
**Data Source**: `sensitivitySeries` (automation share 0-100%)
**Type**: Mini line chart with area fill
**Colors**:
- Line: `.stroke-error-600`
- Fill: `.fill-error-100`
- Grid: `.stroke-neutral-300`
**Narrative**: "Risk escalates quickly as automation share increases"

### 7. KPI Tiles Row
**Component**: `KpiTiles`
**Data Sources**:
- Annual: `jobDisplacementCost`
- Weekly: `displacementWeekly`
- Hourly: `deltaHourly`
**Layout**: 3-tile horizontal row
**Colors**: Each tile uses appropriate badge/error styling
**Narratives**:
- "Annual at-risk labor spend totals $A"
- "Weekly at-risk spend equals $W"
- "Each hour shifted saves $H"

## Implementation Rules

### Strict Data Rules
1. **No Mock Data**: Never use hardcoded values, fictional scenarios, or test data
2. **Real Calculations**: All visuals must derive from actual user inputs and computed metrics
3. **Transparency**: Clearly label all assumptions (e.g., "assuming equal productivity per hour")
4. **Validation**: Ensure all derived values are mathematically sound

### Design Token Compliance
1. **Color Usage**: Use only token classes (`.text-primary`, `.bg-brand-500`, etc.)
2. **No Raw Colors**: Never use Tailwind utilities like `text-red-500` for brand/primary elements
3. **Consistent Theming**: All charts must support dark/light mode via tokens
4. **Semantic Classes**: Prefer `.text-secondary`, `.bg-hero`, `.badge-*` variants

### Component Architecture
1. **Pure Functions**: Chart helpers must be pure functions
2. **Memoization**: All derived calculations use `useMemo`
3. **Props Interface**: Strict TypeScript interfaces for all chart props
4. **Error Boundaries**: Handle edge cases gracefully

## Layout and Responsive Design

### Card Structure
```
┌─ Cost Comparison — AI's Economic Advantage ──────────────────┐
│ ┌─ Gauge ─┐ ┌─ KPI Tiles ──────────────────────────────┐ │
│ │         │ │ Annual │ Weekly │ Hourly                  │ │
│ └─────────┘ └──────────────────────────────────────────┘ │
│                                                             │
│ ┌─ Waterfall ──────────────────┐ ┌─ Donut ──────────────┐ │
│ │ Human → Displacement → AI   │ │ AI Cost Share        │ │
│ └─────────────────────────────┘ └──────────────────────┘ │
│                                                             │
│ ┌─ Bullet Chart ──────────────────┐ ┌─ Capacity Bars ──┐ │
│ │ Threshold Comparison           │ │ Equal Budget      │ │
│ └─────────────────────────────────┘ └──────────────────┘ │
│                                                             │
│ ┌─ Sensitivity Sparkline ───────────────────────────────┐ │
│ │ Automation Share Impact (0-100%)                      │ │
│ └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Responsive Breakpoints
- **Mobile (< 640px)**: Single column, stacked vertically
- **Tablet (640px - 1024px)**: 2-column grid for chart pairs
- **Desktop (> 1024px)**: Full 2-column layout with optimized spacing

## Implementation Steps

### Phase 1: Foundation
1. Create `src/components/visualizations/charts/` directory
2. Create `src/components/visualizations/utils/chart-helpers.ts`
3. Create `src/types/visualization.ts` with interfaces
4. Add derived metrics computation to `cost-comparison-card.tsx`

### Phase 2: Core Components
1. Implement `DisplacementGauge` component
2. Implement `KpiTiles` component
3. Implement `CostWaterfall` component
4. Implement `CostShareDonut` component

### Phase 3: Advanced Components
1. Implement `ThresholdBullet` component
2. Implement `CapacityComparison` component
3. Implement `SensitivitySparkline` component

### Phase 4: Integration
1. Update `cost-comparison-card.tsx` layout
2. Add responsive grid system
3. Update copy-to-clipboard functionality
4. Add accessibility enhancements

### Phase 5: Testing & Polish
1. Unit tests for derived metrics
2. Integration tests for chart rendering
3. Accessibility testing
4. Performance optimization

## Testing Strategy

### Unit Tests
- Derived metrics calculations
- Chart helper functions
- Component prop validation
- Edge case handling

### Integration Tests
- Visual rendering with real data
- Responsive layout behavior
- Accessibility compliance
- Design token application

### Acceptance Criteria
- All visualizations render without errors
- No mock data used in any component
- Design tokens applied consistently
- Responsive layout works across devices
- Accessibility standards met

## Dependencies & Libraries

### Current Dependencies (No Changes)
- `react` - Core React functionality
- `lucide-react` - Icon components
- Existing UI components from `@/components/ui/`

### No New Dependencies Required
- All visualizations implemented with pure CSS/SVG
- No chart libraries (Recharts, Chart.js, etc.)
- No additional data visualization packages

## Performance Considerations

### Optimization Strategies
1. **Memoization**: All derived calculations use `useMemo`
2. **Component Memoization**: Chart components use `React.memo`
3. **Lazy Loading**: Consider lazy loading chart components if bundle size becomes an issue
4. **Efficient Re-renders**: Proper dependency arrays for all hooks

### Bundle Size Impact
- Pure CSS/SVG approach minimizes bundle size
- No external chart libraries
- Tree-shakeable imports from lucide-react

## Accessibility Requirements

### Chart Accessibility
1. **ARIA Labels**: Descriptive labels for all interactive elements
2. **Screen Reader Support**: Proper role attributes and descriptions
3. **Keyboard Navigation**: Focus management for interactive charts
4. **Color Contrast**: All text meets WCAG contrast requirements
5. **Alternative Text**: Text descriptions for visual information

### Implementation Checklist
- [ ] All charts have proper ARIA attributes
- [ ] Color combinations meet contrast standards
- [ ] Keyboard navigation works for interactive elements
- [ ] Screen reader announcements are clear and helpful
- [ ] Focus indicators are visible and appropriate

## Future Enhancements

### Optional Features (Phase 2)
1. **Interactive Thresholds**: User-configurable threshold values
2. **Time Period Toggle**: Switch between annual/weekly/monthly views
3. **Export Functionality**: Chart export to PNG/PDF
4. **Animation Controls**: Configurable animation preferences
5. **Advanced Sensitivity**: Multi-variable sensitivity analysis

### Data Enhancement Options
1. **Setup Costs**: One-time AI implementation costs
2. **Maintenance Costs**: Ongoing operational expenses
3. **Quality Metrics**: Error rates and accuracy comparisons
4. **Task Throughput**: Tasks per hour comparisons

## Maintenance Guidelines

### Code Organization
- Keep chart components modular and reusable
- Centralize styling in design tokens
- Document all assumptions and calculations
- Use TypeScript strictly for type safety

### Update Procedures
1. Test all changes with real data scenarios
2. Update documentation for any new metrics
3. Validate accessibility after changes
4. Performance test with large datasets

### Version Control
- Commit chart implementations separately
- Tag releases with visualization milestones
- Document breaking changes in upgrade guides

---

## Implementation Readiness Checklist

### Pre-Implementation
- [x] Documentation completed
- [ ] Team review of specifications
- [ ] Design approval for visual layouts
- [ ] Accessibility review completed

### Implementation Prerequisites
- [ ] All existing tests passing
- [ ] Design tokens confirmed
- [ ] Browser compatibility verified
- [ ] Performance baseline established

### Post-Implementation
- [ ] Visual regression tests added
- [ ] Accessibility audit completed
- [ ] Performance benchmarks met
- [ ] Documentation updated with implementation details

This documentation ensures the visualization enhancement is future-ready while maintaining strict adherence to real data usage and design system compliance.
