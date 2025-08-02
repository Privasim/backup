// Type exports for cost analysis module

// API Types
export type {
  BLSApiRequest,
  BLSApiResponse,
  BLSOccupationData,
  PayScaleApiRequest,
  PayScaleApiResponse,
  OpenRouterCostRequest,
  OpenRouterCostResponse,
  TaskFrequencyAnalysis,
  AICostBreakdown,
  CostAnalysisContext,
} from './api-types';

// Core Cost Types
export type {
  UserProfile,
  SalaryData,
  AICostData,
  CostComparison,
  CostAnalysisInsights,
  CostAnalysis,
  CostAnalysisError,
  CostAnalysisOptions,
  CostChartData,
  CostChartConfig,
  CachedCostData,
  CacheStats,
} from './cost-types';

// Re-export commonly used types
export type { UserProfile as CostUserProfile } from './cost-types';
export type { SalaryData as CostSalaryData } from './cost-types';
export type { CostAnalysis as CostAnalysisResult } from './cost-types';