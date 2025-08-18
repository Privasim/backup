export interface JobRiskInput {
  occupationCode?: string;
  role?: string;
  jobFunction?: string;
  industry?: string;
  experience?: string;
  skills?: string[];
  education?: string;
  location?: string;
}

export interface RiskInsights {
  riskScore: number; // 0-100
  threatDrivers: string[];
  automationExposure: {
    task: string;
    exposure: number; // 0-100
  }[];
  skillImpacts: {
    skill: string;
    impact: 'high' | 'medium' | 'low';
    rationale?: string;
  }[];
  mitigation: {
    action: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  sources: {
    title: string;
    url?: string;
  }[];
}
