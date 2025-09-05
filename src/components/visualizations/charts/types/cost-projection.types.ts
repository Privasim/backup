/**
 * Types for the Cost Projection Timeline Chart
 */

export interface CostProjectionDataPoint {
  /** Year or time period (e.g., "Year 1", "Year 2") */
  period: string;
  
  /** Human labor cost for this period */
  humanCost: number;
  
  /** AI replacement cost for this period */
  aiCost: number;
  
  /** Cumulative savings (positive) or losses (negative) */
  cumulativeSavings: number;
}

export interface CostProjectionMilestone {
  /** Period when milestone occurs */
  period: string;
  
  /** Type of milestone */
  type: 'break-even' | 'roi-threshold' | 'custom';
  
  /** Label for the milestone */
  label: string;
  
  /** Value associated with milestone */
  value: number;
}

export interface CostProjectionConfig {
  /** Number of years to project */
  years: number;
  
  /** Annual growth rate for human costs (e.g., 0.03 for 3%) */
  humanCostGrowthRate: number;
  
  /** Annual growth rate for AI costs */
  aiCostGrowthRate: number;
  
  /** ROI threshold percentage to mark as milestone */
  roiThreshold: number;
  
  /** Whether to show annotations */
  showAnnotations: boolean;
  
  /** Whether to show the cumulative savings area */
  showCumulativeSavings: boolean;
}

export interface CostProjectionChartProps {
  /** Base human hourly cost */
  humanHourlyCost: number;
  
  /** Base AI hourly cost */
  aiHourlyCost: number;
  
  /** Hours worked per week */
  hoursPerWeek: number;
  
  /** Weeks worked per year */
  weeksPerYear: number;
  
  /** Optional configuration overrides */
  config?: Partial<CostProjectionConfig>;
  
  /** Width of the chart (default: 100%) */
  width?: number | string;
  
  /** Height of the chart (default: 300px) */
  height?: number | string;
  
  /** CSS class name */
  className?: string;
}
