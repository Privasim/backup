export interface AssessmentResult {
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  summary: string;
  factors: {
    automation: number;
    aiReplacement: number;
    skillDemand: number;
    industryGrowth: number;
  };
  keyFindings: string[];
  recommendations: string[];
  sources: string[];
  lastUpdated: string;
}

export interface AssessmentError {
  type: 'validation' | 'api' | 'parsing' | 'network' | 'rate_limit';
  message: string;
  details?: any;
}

export interface AssessmentProgress {
  stage: 'initializing' | 'searching' | 'analyzing' | 'processing' | 'complete' | 'error';
  message: string;
  progress: number; // 0-100
}

export interface AssessmentRequest {
  jobDescription: string;
  experience: string;
  industry: string;
  location: string;
  salaryRange: string;
  skillSet: string[];
  apiKey: string;
  selectedModel: string;
}

export interface ProcessedResponse {
  success: boolean;
  data?: AssessmentResult;
  error?: AssessmentError;
  rawResponse?: string;
}