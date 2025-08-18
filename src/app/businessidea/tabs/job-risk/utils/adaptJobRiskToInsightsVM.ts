import { DataDrivenInsightsModel, MitigationItem, SkillImpactItem, AutomationExposureItem } from '@/components/insights/types';
import { JobRiskInput } from '@/types/job-risk';

export function adaptJobRiskToInsightsVM(
  research: any, // outputs from useJobRiskData/useOccupationRisk/useTaskAutomationData
  ai?: { summary?: string; mitigation?: MitigationItem[]; narratives?: any }
): DataDrivenInsightsModel {
  const insights: DataDrivenInsightsModel = {};

  // Map AI summary if provided
  if (ai?.summary) {
    insights.summary = ai.summary;
  }
  
  // Map AI narratives if provided
  if (ai?.narratives) {
    insights.narratives = {
      riskNarrative: ai.narratives.riskNarrative || ai.narratives.summary,
      threatNarrative: ai.narratives.threatNarrative,
      automationNarrative: ai.narratives.automationNarrative,
      skillsNarrative: ai.narratives.skillsNarrative,
      mitigationNarrative: ai.narratives.mitigationNarrative,
      methodologyNote: ai.narratives.methodologyNote,
      confidenceNote: ai.narratives.confidenceNote,
      oneLiner: ai.narratives.oneLiner
    };
  }

  // Map research data
  if (research) {
    // Map risk score from research
    if (research.riskScore !== undefined) {
      insights.riskScore = Math.round(research.riskScore * 100); // Convert 0-1 to 0-100
    }

    // Map threat drivers
    if (research.threatDrivers && Array.isArray(research.threatDrivers)) {
      insights.threatDrivers = research.threatDrivers;
    }

    // Map automation exposure (support both taskAutomation and automationExposure shapes)
    const normalizeExposure = (value: number | undefined): number => {
      const v = typeof value === 'number' && !Number.isNaN(value) ? value : 0;
      // If value is in 0–1, scale to 0–100; if already 0–100, clamp and round
      if (v <= 1) return Math.max(0, Math.min(100, Math.round(v * 100)));
      return Math.max(0, Math.min(100, Math.round(v)));
    };

    if (research.taskAutomation && Array.isArray(research.taskAutomation)) {
      insights.automationExposure = research.taskAutomation.map((task: any): AutomationExposureItem => ({
        task: task.task || task.name || 'Unknown Task',
        exposure: normalizeExposure(task.exposure ?? task.automationRisk)
      }));
    } else if (research.automationExposure && Array.isArray(research.automationExposure)) {
      insights.automationExposure = research.automationExposure.map((item: any): AutomationExposureItem => ({
        task: item.task || item.name || 'Unknown Task',
        exposure: normalizeExposure(item.exposure ?? item.automationRisk)
      }));
    }

    // Map skill impacts
    if (research.skillImpacts && Array.isArray(research.skillImpacts)) {
      insights.skillImpacts = research.skillImpacts.map((skill: any): SkillImpactItem => ({
        skill: skill.skill || skill.name || 'Unknown Skill',
        impact: (skill.impact || skill.riskLevel || 'medium').toLowerCase() as 'high' | 'medium' | 'low',
        rationale: skill.rationale || skill.description
      }));
    }

    // Map mitigation strategies
    if (research.mitigation && Array.isArray(research.mitigation)) {
      insights.mitigation = research.mitigation.map((item: any): MitigationItem => ({
        action: item.action || item.strategy || item.name,
        priority: (item.priority || item.urgency || 'medium').toLowerCase() as 'high' | 'medium' | 'low'
      }));
    } else if (ai?.mitigation) {
      insights.mitigation = ai.mitigation;
    }

    // Map sources
    if (research.sources && Array.isArray(research.sources)) {
      insights.sources = research.sources.map((source: any) => ({
        title: source.title || source.name || 'Research Source',
        url: source.url || source.link
      }));
    }
  }

  // Fallback to AI data if research is not available
  if (!research && ai) {
    insights.summary = ai.summary || 'AI-generated risk analysis';
    insights.mitigation = ai.mitigation;
  }

  return insights;
}

export function deriveOccupationIdentifier(profile: JobRiskInput): string {
  // Prefer explicit occupation code if available
  if (profile.occupationCode) {
    return profile.occupationCode;
  }
  
  // Fallback to normalized role string
  if (profile.role) {
    return profile.role.toLowerCase().replace(/\s+/g, '-');
  }
  
  // Final fallback to job function
  if (profile.jobFunction) {
    return profile.jobFunction.toLowerCase().replace(/\s+/g, '-');
  }
  
  return 'unknown-occupation';
}

export function validateAnalysisConfig(config: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config) {
    errors.push('Configuration is required');
    return { valid: false, errors };
  }
  
  if (!config.model) {
    errors.push('Model selection is required');
  }
  
  if (!config.apiKey) {
    errors.push('API key is required');
  } else if (!/^sk-or-v1-[a-f0-9]{32,}$/.test(config.apiKey)) {
    errors.push('Invalid API key format');
  }
  
  return { valid: errors.length === 0, errors };
}
