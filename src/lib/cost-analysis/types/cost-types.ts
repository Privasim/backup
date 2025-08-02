// Core cost analysis type definitions

export interface UserProfile {
  occupation: string;
  experience: string;
  location: string;
  industry: string;
  salaryRange: string;
  skills: string[];
}

export interface SalaryData {
  median: number;
  mean?: number;
  percentile25?: number;
  percentile75?: number;
  currency: string;
  source: 'bls' | 'payscale' | 'estimated';
  confidence: number;
  lastUpdated: string;
  locationAdjustment?: number;
  experienceAdjustment?: number;
}

export interface AICostData {
  modelPricing: {
    promptTokenCost: number;
    completionTokenCost: number;
    model: string;
  };
  taskEstimation: {
    tokensPerTask: number;
    tasksPerDay: number;
    workingDaysPerYear: number;
  };
  annualCosts: {
    tokenCosts: number;
    infrastructureCosts: number;
    maintenanceCosts: number;
    total: number;
  };
  confidence: number;
}

export interface CostComparison {
  human: {
    annualSalary: number;
    benefits: number;
    overhead: number;
    total: number;
  };
  ai: {
    tokenCosts: number;
    infrastructure: number;
    maintenance: number;
    total: number;
  };
  savings: {
    absolute: number;
    percentage: number;
  };
  paybackPeriod: number; // months
  confidence: number;
}

export interface CostAnalysisInsights {
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  riskFactors: string[];
  assumptions: string[];
  confidence: number;
  sources: string[];
}

export interface CostAnalysis {
  profile: UserProfile;
  salaryData: SalaryData;
  aiCostData: AICostData;
  comparison: CostComparison;
  insights: CostAnalysisInsights;
  metadata: {
    analysisDate: string;
    version: string;
    processingTime: number;
  };
}

export interface CostAnalysisError {
  type: 'api_error' | 'validation_error' | 'calculation_error' | 'network_error';
  message: string;
  details?: any;
  recoverable: boolean;
  fallbackAvailable: boolean;
}

export interface CostAnalysisOptions {
  useCache: boolean;
  cacheTTL: number;
  fallbackToEstimates: boolean;
  includeInsights: boolean;
  confidenceThreshold: number;
}

// Chart-specific types
export interface CostChartData {
  categories: string[];
  humanCosts: number[];
  aiCosts: number[];
  savings: number[];
  labels: string[];
  colors: {
    human: string;
    ai: string;
    savings: string;
  };
}

export interface CostChartConfig {
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  showTooltips: boolean;
  showLegend: boolean;
  showExportButton: boolean;
  responsive: boolean;
}

// Cache types
export interface CachedCostData {
  data: CostAnalysis;
  timestamp: number;
  ttl: number;
  key: string;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}