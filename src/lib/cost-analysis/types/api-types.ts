// External API type definitions for cost analysis

// BLS API Types
export interface BLSApiRequest {
  seriesid: string[];
  startyear?: string;
  endyear?: string;
  catalog?: boolean;
  calculations?: boolean;
  annualaverage?: boolean;
  registrationkey?: string;
}

export interface BLSApiResponse {
  status: string;
  responseTime: number;
  message: string[];
  Results: {
    series: Array<{
      seriesID: string;
      data: Array<{
        year: string;
        period: string;
        periodName: string;
        value: string;
        footnotes: any[];
      }>;
    }>;
  };
}

export interface BLSOccupationData {
  socCode: string;
  title: string;
  medianWage: number;
  meanWage: number;
  employment: number;
  location: string;
  year: number;
}

// PayScale API Types
export interface PayScaleApiRequest {
  job: string;
  location?: string;
  experience?: string;
  education?: string;
  skills?: string[];
}

export interface PayScaleApiResponse {
  status: string;
  data: {
    salary: {
      median: number;
      percentile10: number;
      percentile25: number;
      percentile75: number;
      percentile90: number;
    };
    location_factor: number;
    experience_factor: number;
    confidence: number;
  };
  metadata: {
    sample_size: number;
    last_updated: string;
    currency: string;
  };
}

// OpenRouter Cost Analysis Types
export interface OpenRouterCostRequest {
  occupation: string;
  industry: string;
  tasks: string[];
  humanSalary: number;
  aiCosts: AICostBreakdown;
  context: CostAnalysisContext;
}

export interface OpenRouterCostResponse {
  analysis: string;
  insights: string[];
  recommendations: string[];
  confidence: number;
  sources: string[];
  taskFrequency: TaskFrequencyAnalysis;
}

export interface TaskFrequencyAnalysis {
  dailyTasks: number;
  weeklyTasks: number;
  monthlyTasks: number;
  automationPotential: number;
}

export interface AICostBreakdown {
  tokenCosts: {
    promptTokens: number;
    completionTokens: number;
    costPerPromptToken: number;
    costPerCompletionToken: number;
    totalTokenCost: number;
  };
  infrastructureCosts: {
    monthly: number;
    annual: number;
  };
  totalAnnualCost: number;
}

export interface CostAnalysisContext {
  userProfile: {
    experience: string;
    location: string;
    skills: string[];
  };
  industryData: {
    averageSalary: number;
    growthRate: number;
    automationRisk: number;
  };
  marketData: {
    demandTrend: 'increasing' | 'stable' | 'decreasing';
    competitionLevel: 'low' | 'medium' | 'high';
  };
}