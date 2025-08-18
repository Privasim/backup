export interface AutomationExposureItem {
  task: string;
  exposure: number; // 0-100
}

export interface SkillImpactItem {
  skill: string;
  impact: 'high' | 'medium' | 'low';
  rationale?: string;
}

export interface MitigationItem {
  action: string;
  priority: 'high' | 'medium' | 'low';
}

export interface InsightSource {
  title: string;
  url?: string;
}

export interface DataDrivenInsightsModel {
  summary?: string;
  riskScore?: number; // 0-100
  threatDrivers?: string[];
  automationExposure?: AutomationExposureItem[];
  skillImpacts?: SkillImpactItem[];
  mitigation?: MitigationItem[];
  sources?: InsightSource[];
}

export interface ProfileReadiness {
  ready: boolean;
  completionLevel: number; // 0-100
  missing: string[];
  requirements: { minCompletion: number; autoTrigger: boolean };
}

export interface AnalysisConfig {
  model?: string;
  apiKey?: string; // OpenRouter key format: /^sk-or-v1-[a-f0-9]{32,}$/
  customPrompt?: string;
}

export interface DataDrivenInsightsProps {
  insights: DataDrivenInsightsModel;
  loading?: boolean;
  errors?: string[];
  slots?: {
    headerRight?: React.ReactNode;
    footer?: React.ReactNode;
  };
}
