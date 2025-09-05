/**
 * Types for the Cost Breakdown Treemap Chart
 */

export interface TreemapNode {
  /** Name of the cost category */
  name: string;
  
  /** Value/cost amount */
  value: number;
  
  /** Automation risk level (0-1) */
  risk?: number;
  
  /** Optional description */
  description?: string;
  
  /** Child nodes for hierarchical structure */
  children?: TreemapNode[];
}

export interface TreemapData {
  /** Root node of the treemap */
  root: TreemapNode;
  
  /** Total human cost */
  humanTotal: number;
  
  /** Total AI cost */
  aiTotal: number;
  
  /** Cost categories metadata */
  categories: {
    [key: string]: {
      label: string;
      description: string;
      riskLevel: number;
    }
  };
}

export interface CostBreakdownTreemapProps {
  /** Human cost configuration */
  humanCosts: {
    salary: number;
    benefits: number;
    training: number;
    management: number;
    infrastructure: number;
    other?: number;
  };
  
  /** AI cost configuration */
  aiCosts: {
    licensing: number;
    implementation: number;
    maintenance: number;
    oversight: number;
    other?: number;
  };
  
  /** Width of the chart (default: 100%) */
  width?: number | string;
  
  /** Height of the chart (default: 400px) */
  height?: number | string;
  
  /** CSS class name */
  className?: string;
}
