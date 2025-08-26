import { useMemo } from 'react';
import { useImplementationPlan } from '../../../features/implementation-plan/useImplementationPlan';
import { SpecsSettings } from '../types';
import { Task, Risk } from '../../../features/implementation-plan/types';

interface SpecsDerivations {
  outlinePreview: string[];
  sectionHints: Record<string, string[]>;
  warnings: string[];
}

/**
 * Hook to compute derived information from the implementation plan for specs generation
 * @param settings Current specs settings
 * @returns Derived outline preview, section hints, and warnings
 */
export function useSpecsDerivations(settings: SpecsSettings): SpecsDerivations {
  const { plan } = useImplementationPlan();
  
  return useMemo(() => {
    // Initialize return values
    const outlinePreview: string[] = [];
    const sectionHints: Record<string, string[]> = {};
    const warnings: string[] = [];
    
    // If no plan, return empty results with warning
    if (!plan) {
      warnings.push('No implementation plan found. Please generate an implementation plan first.');
      return { outlinePreview, sectionHints, warnings };
    }
    
    // Generate outline preview based on plan structure and settings
    outlinePreview.push('Technical Specification Outline');
    
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
    
    return { outlinePreview, sectionHints, warnings };
  }, [plan, settings]);
}
