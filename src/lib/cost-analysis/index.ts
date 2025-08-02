// Main exports for cost analysis module

// Services
export { 
  CostAnalysisService,
  SalaryDataService,
  AICostService,
  LLMAnalysisService 
} from './service';

// Providers
export { 
  BLSProvider,
  PayScaleProvider,
  OpenRouterProvider 
} from './providers';

// Utilities
export { 
  CostAnalysisCacheManager,
  CostDataValidator,
  CostCalculator 
} from './utils';

// Types
export type {
  // Core types
  UserProfile,
  SalaryData,
  AICostData,
  CostComparison,
  CostAnalysisInsights,
  CostAnalysis,
  CostAnalysisError,
  CostAnalysisOptions,
  
  // Chart types
  CostChartData,
  CostChartConfig,
  
  // API types
  BLSApiRequest,
  BLSApiResponse,
  PayScaleApiRequest,
  PayScaleApiResponse,
  OpenRouterCostRequest,
  OpenRouterCostResponse,
  
  // Cache types
  CachedCostData,
  CacheStats,
} from './types';

// Re-export commonly used types with aliases
export type { 
  UserProfile as CostUserProfile,
  CostAnalysis as CostAnalysisResult 
} from './types';