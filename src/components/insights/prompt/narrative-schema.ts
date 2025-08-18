// File: src/components/insights/prompt/narrative-schema.ts

export interface GeneratedNarratives {
  summary?: string;
  narratives?: {
    riskNarrative?: string;
    threatNarrative?: string;
    automationNarrative?: string;
    skillsNarrative?: string;
    mitigationNarrative?: string;
    methodologyNote?: string;
    confidenceNote?: string;
    oneLiner?: string;
  };
  mitigation?: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  threatDrivers?: string[];
  skillImpacts?: Array<{
    skill: string;
    impact: 'high' | 'medium' | 'low';
    rationale?: string;
  }>;
  sources?: Array<{
    title: string;
    url?: string;
  }>;
}

export const validateGeneratedNarratives = (input: unknown): { 
  ok: boolean; 
  data?: GeneratedNarratives; 
  error?: string 
} => {
  // Handle null/undefined input
  if (input === null || input === undefined) {
    return { ok: false, error: 'Input is null or undefined' };
  }

  // Handle non-object inputs
  if (typeof input !== 'object') {
    return { ok: false, error: 'Input is not an object' };
  }

  const obj = input as Record<string, unknown>;
  const result: GeneratedNarratives = {};

  // Validate summary if present
  if (obj.summary !== undefined) {
    if (typeof obj.summary === 'string') {
      result.summary = obj.summary;
    } else {
      return { ok: false, error: 'summary must be a string' };
    }
  }

  // Validate narratives object if present
  if (obj.narratives !== undefined) {
    if (typeof obj.narratives === 'object' && obj.narratives !== null) {
      const narratives = obj.narratives as Record<string, unknown>;
      const validatedNarratives: NonNullable<GeneratedNarratives['narratives']> = {};
      
      const narrativeFields = [
        'riskNarrative', 'threatNarrative', 'automationNarrative', 
        'skillsNarrative', 'mitigationNarrative', 'methodologyNote', 
        'confidenceNote', 'oneLiner'
      ];
      
      for (const field of narrativeFields) {
        if (narratives[field] !== undefined) {
          if (typeof narratives[field] === 'string') {
            validatedNarratives[field as keyof typeof validatedNarratives] = narratives[field] as string;
          } else {
            return { ok: false, error: `${field} must be a string` };
          }
        }
      }
      
      result.narratives = validatedNarratives;
    } else {
      return { ok: false, error: 'narratives must be an object' };
    }
  }

  // Validate mitigation array if present
  if (obj.mitigation !== undefined) {
    if (Array.isArray(obj.mitigation)) {
      const validatedMitigation = [];
      for (const item of obj.mitigation) {
        if (typeof item === 'object' && item !== null) {
          const mitigationItem = item as Record<string, unknown>;
          if (typeof mitigationItem.action === 'string' && 
              typeof mitigationItem.priority === 'string' && 
              ['high', 'medium', 'low'].includes(mitigationItem.priority)) {
            validatedMitigation.push({
              action: mitigationItem.action,
              priority: mitigationItem.priority as 'high' | 'medium' | 'low'
            });
          } else {
            return { ok: false, error: 'mitigation items must have valid action and priority' };
          }
        } else {
          return { ok: false, error: 'mitigation array must contain objects' };
        }
      }
      result.mitigation = validatedMitigation;
    } else {
      return { ok: false, error: 'mitigation must be an array' };
    }
  }

  // Validate threatDrivers array if present
  if (obj.threatDrivers !== undefined) {
    if (Array.isArray(obj.threatDrivers)) {
      const validatedThreatDrivers = [];
      for (const driver of obj.threatDrivers) {
        if (typeof driver === 'string') {
          validatedThreatDrivers.push(driver);
        } else {
          return { ok: false, error: 'threatDrivers array must contain strings' };
        }
      }
      result.threatDrivers = validatedThreatDrivers;
    } else {
      return { ok: false, error: 'threatDrivers must be an array' };
    }
  }

  // Validate skillImpacts array if present
  if (obj.skillImpacts !== undefined) {
    if (Array.isArray(obj.skillImpacts)) {
      const validatedSkillImpacts = [];
      for (const skill of obj.skillImpacts) {
        if (typeof skill === 'object' && skill !== null) {
          const skillItem = skill as Record<string, unknown>;
          if (typeof skillItem.skill === 'string' && 
              typeof skillItem.impact === 'string' && 
              ['high', 'medium', 'low'].includes(skillItem.impact)) {
            const validatedSkill: NonNullable<GeneratedNarratives['skillImpacts']>[number] = {
              skill: skillItem.skill,
              impact: skillItem.impact as 'high' | 'medium' | 'low'
            };
            
            if (skillItem.rationale !== undefined) {
              if (typeof skillItem.rationale === 'string') {
                validatedSkill.rationale = skillItem.rationale;
              } else {
                return { ok: false, error: 'skill rationale must be a string' };
              }
            }
            
            validatedSkillImpacts.push(validatedSkill);
          } else {
            return { ok: false, error: 'skillImpacts items must have valid skill and impact' };
          }
        } else {
          return { ok: false, error: 'skillImpacts array must contain objects' };
        }
      }
      result.skillImpacts = validatedSkillImpacts;
    } else {
      return { ok: false, error: 'skillImpacts must be an array' };
    }
  }

  // Validate sources array if present
  if (obj.sources !== undefined) {
    if (Array.isArray(obj.sources)) {
      const validatedSources = [];
      for (const source of obj.sources) {
        if (typeof source === 'object' && source !== null) {
          const sourceItem = source as Record<string, unknown>;
          if (typeof sourceItem.title === 'string') {
            const validatedSource: NonNullable<GeneratedNarratives['sources']>[number] = {
              title: sourceItem.title
            };
            
            if (sourceItem.url !== undefined) {
              if (typeof sourceItem.url === 'string') {
                validatedSource.url = sourceItem.url;
              } else {
                return { ok: false, error: 'source url must be a string' };
              }
            }
            
            validatedSources.push(validatedSource);
          } else {
            return { ok: false, error: 'sources items must have a title' };
          }
        } else {
          return { ok: false, error: 'sources array must contain objects' };
        }
      }
      result.sources = validatedSources;
    } else {
      return { ok: false, error: 'sources must be an array' };
    }
  }

  return { ok: true, data: result };
};
