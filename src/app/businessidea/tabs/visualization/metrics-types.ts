/**
 * Dashboard metrics types for the Visualization tab
 */

// Time range options for filtering
export type TimeRange = '7d' | '30d' | '12w';

// Comparison options
export type ComparisonType = 'prev' | 'none';

// Dashboard filter state
export interface DashboardFilters {
  timeRange: TimeRange;
  compareTo: ComparisonType;
  segment?: string | null;
}

// Metric units
export type MetricUnit = 'currency' | 'count' | 'percentage';

// KPI metric keys
export type MetricKey = 'total_spend' | 'total_impressions' | 'viewable_impressions' | 'total_sales';

// KPI data structure
export interface MetricKPI {
  key: MetricKey;
  value: number;
  deltaAbs: number;
  deltaPct: number;
  asOf: string;
  unit: MetricUnit;
  label: string;
  color?: string;
}

// Time series data point
export interface TimeSeriesPoint {
  ts: string;
  value: number;
  label?: string;
}

// Dimension types for breakdowns
export type DimensionType = 'contextual' | 'device' | 'channel' | 'creative';

// Contextual categories
export type ContextualCategory = 'Food' | 'Tech' | 'News' | 'Health' | 'Shopping';

// Device types
export type DeviceType = 'Mobile' | 'Desktop' | 'Tablet';

// Channel types
export type ChannelType = 
  | 'Social' 
  | 'Search' 
  | 'Display' 
  | 'Video' 
  | 'Email' 
  | 'Direct' 
  | 'Affiliate' 
  | 'Referral' 
  | 'Organic' 
  | 'Other';

// Creative types
export type CreativeType = 'Creative A' | 'Creative B' | 'Creative C' | 'Creative D';

// Dimension breakdown data
export interface DimensionBreakdown {
  metric: string;
  dimension: DimensionType;
  category: string;
  value: number;
  percentage?: number;
  color?: string;
}

// Chart context payload for ChatboxControls
export interface ChartContextPayload {
  metric: string;
  filters: DashboardFilters;
  visibleWindow?: { 
    start: string; 
    end: string; 
  };
  highlights?: Record<string, number>;
  topCategories?: { 
    category: string; 
    value: number; 
  }[];
  lastPoints?: TimeSeriesPoint[];
  chartType: 'kpi' | 'donut' | 'line' | 'bar';
  title: string;
}

// Dashboard state
export interface DashboardState {
  filters: DashboardFilters;
  kpis: MetricKPI[];
  series: Record<string, TimeSeriesPoint[]>;
  breakdowns: Record<string, DimensionBreakdown[]>;
  activeCardId: string | null;
  loading: boolean;
  error: string | null;
}

// Dashboard actions
export interface DashboardActions {
  setFilters: (filters: Partial<DashboardFilters>) => void;
  setActiveCard: (id: string | null) => void;
  refresh: () => Promise<void>;
  exportSnapshot: () => Promise<void>;
}

// Card props shared by all dashboard cards
export interface DashboardCardProps {
  title: string;
  subtitle?: string;
  loading?: boolean;
  error?: string | null;
  onExplain?: () => void;
  onCompare?: () => void;
  onExport?: () => void;
}

// KPI card props
export interface KpiCardProps extends DashboardCardProps {
  value: number;
  deltaAbs: number;
  deltaPct: number;
  unit: MetricUnit;
  sparkline?: TimeSeriesPoint[];
  color?: string;
}

// Donut card props
export interface DonutCardProps extends DashboardCardProps {
  data: DimensionBreakdown[];
  dimension: DimensionType;
  showLegend?: boolean;
}

// Line card props
export interface LineCardProps extends DashboardCardProps {
  data: TimeSeriesPoint[];
  unit: MetricUnit;
  color?: string;
  yAxisLabel?: string;
  showMarkers?: boolean;
  showArea?: boolean;
}

// Bar card props
export interface BarCardProps extends DashboardCardProps {
  data: DimensionBreakdown[];
  dimension: DimensionType;
  unit: MetricUnit;
  showValues?: boolean;
}
