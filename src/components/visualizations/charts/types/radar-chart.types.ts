/**
 * Types for the Industry Comparison Radar Chart
 */

export interface RadarDataPoint {
  /** Metric name (e.g., "Cost Ratio", "Displacement") */
  metric: string;
  
  /** Value for this metric (normalized to 0-1 scale) */
  value: number;
  
  /** Optional description of what this metric means */
  description?: string;
}

export interface RadarDataSeries {
  /** Name of the data series (e.g., "Your Profile", "Industry Average") */
  name: string;
  
  /** Color for this data series */
  color: string;
  
  /** Data points for this series */
  data: RadarDataPoint[];
}

export interface IndustryComparisonData {
  /** User's profile data */
  userProfile: RadarDataSeries;
  
  /** Industry comparison data */
  industryProfiles: RadarDataSeries[];
  
  /** Metrics metadata for tooltips and descriptions */
  metrics: {
    [key: string]: {
      label: string;
      description: string;
      format: string; // e.g., "percent", "currency", "number"
    }
  };
}

export interface IndustryComparisonRadarProps {
  /** User's profile data */
  userProfile: {
    costRatio: number;
    displacementPercentage: number;
    adoptionRate: number;
    trainingCosts: number;
  };
  
  /** Industry data for comparison */
  industryData?: {
    name: string;
    costRatio: number;
    displacementPercentage: number;
    adoptionRate: number;
    trainingCosts: number;
  }[];
  
  /** Width of the chart (default: 100%) */
  width?: number | string;
  
  /** Height of the chart (default: 300px) */
  height?: number | string;
  
  /** CSS class name */
  className?: string;
}
