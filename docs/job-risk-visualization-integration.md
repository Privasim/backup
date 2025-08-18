# Job Risk Visualization Integration

This document explains how to integrate and use the new data visualization components in the Job Risk Analysis feature.

## Components

### AutomationExposureCard

A ready-to-use card component that displays automation exposure risk data as a horizontal bar chart.

**Props:**
- `insights` (DataDrivenInsightsModel) - The insights data containing automation exposure information
- `title` (string) - The card title (default: "Automation Exposure")
- `topN` (number) - Number of top tasks to display (default: 8)
- `minExposure` (number) - Minimum exposure threshold (default: 0)
- `className` (string) - Additional CSS classes for styling

**Usage:**

```tsx
import { AutomationExposureCard } from '@/components/visualizations';

<AutomationExposureCard 
  insights={insights}
  title="Automation Exposure Risk"
  topN={8}
  minExposure={10}
/>
```

### AutomationExposureBar

A low-level D3-based horizontal bar chart component for displaying categorical data.

**Props:**
- `items` (BarItem[]) - Array of { label: string, value: number } objects
- `width` (number) - Chart width in pixels (default: 640)
- `height` (number) - Chart height in pixels (default: 240)
- `maxBars` (number) - Maximum number of bars to display (default: 8)
- `ariaLabel` (string) - Accessible label for the chart
- `className` (string) - Additional CSS classes for styling

**Usage:**

```tsx
import { AutomationExposureBar } from '@/components/visualizations';

<AutomationExposureBar 
  items={items}
  maxBars={8}
  ariaLabel="Automation exposure by task"
/>
```

## Integration

The components have been integrated into `JobRiskAnalysisTab.tsx` and will automatically display when insights data is available.

## Customization

### Styling

The components use Tailwind CSS classes and follow the existing design system. You can customize the appearance by passing additional CSS classes via the `className` prop.

### Data Filtering

The `AutomationExposureCard` component supports filtering by:
- `topN`: Limits the number of tasks displayed
- `minExposure`: Hides tasks below a certain exposure threshold

## Accessibility

The components follow accessibility best practices:
- Proper ARIA labels
- Keyboard navigable
- Respect for `prefers-reduced-motion`
- Color contrast compliant with WCAG standards

## Performance

- Uses React.memo for efficient rendering
- D3 transitions are disabled when reduced motion is preferred
- Data processing is memoized to prevent unnecessary recalculations
