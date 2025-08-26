import { useMemo } from 'react';
import { useImplementationPlan } from '../../../features/implementation-plan/useImplementationPlan';
import { SpecsSettings } from '../types';
import { Task, Risk } from '../../../features/implementation-plan/types';
import { DOC_PROFILES } from '../constants';

interface SpecsDerivations {
  outlinePreview: string[];
  sectionHints: Record<string, string[]>;
  warnings: string[];
  profileInfo: {
    name: string;
    description: string;
    pageTarget: number;
    tokenBudget: number;
  };
}

/**
 * Hook to compute derived information from the implementation plan for specs generation
 * @param settings Current specs settings
 * @returns Derived outline preview, section hints, warnings, and profile information
 */
export function useSpecsDerivations(settings: SpecsSettings): SpecsDerivations {
  const { plan } = useImplementationPlan();
  
  return useMemo(() => {
    // Initialize return values
    const outlinePreview: string[] = [];
    const sectionHints: Record<string, string[]> = {};
    const warnings: string[] = [];
    
    // Get profile information
    const profile = DOC_PROFILES[settings.docProfile];
    const profileInfo = {
      name: profile.name,
      description: profile.description,
      pageTarget: profile.pageTarget,
      tokenBudget: profile.tokenBudget
    };
    
    // If no plan, return empty results with warning
    if (!plan) {
      warnings.push('No implementation plan found. Please generate an implementation plan first.');
      return { outlinePreview, sectionHints, warnings, profileInfo };
    }
    
    // Generate outline preview based on plan structure and settings
    outlinePreview.push(`${profile.name} Outline`);
    
    if (settings.include.requirements && plan.overview?.goals?.length) {
      outlinePreview.push('1. Requirements');
      sectionHints.requirements = plan.overview.goals;
    }
    
    if (settings.include.api && plan.tasks?.length) {
      outlinePreview.push('2. API Endpoints');
      // Extract potential API endpoints from tasks
      const apiTasks = plan.tasks.filter((task: Task) => 
        task.title.toLowerCase().includes('api') || 
        task.description?.toLowerCase().includes('api') ||
        task.title.toLowerCase().includes('endpoint') ||
        task.description?.toLowerCase().includes('endpoint')
      );
      sectionHints.api = apiTasks.map((task: Task) => task.title);
    }
    
    if (settings.include.dataModel && plan.tasks?.length) {
      outlinePreview.push('3. Data Model');
      // Extract data-related tasks
      const dataTasks = plan.tasks.filter((task: Task) => 
        task.title.toLowerCase().includes('data') || 
        task.description?.toLowerCase().includes('data') ||
        task.title.toLowerCase().includes('database') ||
        task.description?.toLowerCase().includes('database')
      );
      sectionHints.dataModel = dataTasks.map((task: Task) => task.title);
    }
    
    if (settings.include.nonFunctional) {
      outlinePreview.push('4. Non-Functional Requirements');
    }
    
    if (settings.include.security) {
      outlinePreview.push('5. Security Considerations');
    }
    
    if (settings.include.risks && plan.risks?.length) {
      outlinePreview.push('6. Risk Mitigation');
      sectionHints.risks = plan.risks.map((risk: Risk) => `${risk.item} (${risk.likelihood} likelihood, ${risk.impact} impact)`);
    }
    
    if (settings.include.acceptance) {
      outlinePreview.push('7. Acceptance Criteria');
    }
    
    if (settings.include.glossary) {
      outlinePreview.push('8. Glossary');
    }
    
    // Add profile-specific warnings
    if (settings.docProfile === 'full-suite' && (!plan.tasks || plan.tasks.length < 5)) {
      warnings.push('Full specification suite selected but implementation plan has few tasks. Generated document may be shorter than expected.');
    }
    
    // Add warnings for missing plan elements
    if (!plan.overview?.goals?.length) {
      warnings.push('Implementation plan has no defined goals. Requirements section may be limited.');
    }
    
    if (!plan.tasks?.length) {
      warnings.push('Implementation plan has no defined tasks. API and Data Model sections may be limited.');
    }
    
    if (!plan.risks?.length) {
      warnings.push('Implementation plan has no defined risks. Risk Mitigation section may be limited.');
    }
    
    // Add token budget warning
    if (settings.tokenBudget && settings.tokenBudget > 4000) {
      warnings.push(`Large token budget (${settings.tokenBudget}) selected. Generation may take longer and consume more API credits.`);
    }
    
    return { outlinePreview, sectionHints, warnings, profileInfo };
  }, [plan, settings]);
}
