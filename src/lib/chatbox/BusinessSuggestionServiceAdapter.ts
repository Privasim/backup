'use client';

import { businessSuggestionService } from './BusinessSuggestionService';
import { AnalysisConfig, AnalysisResult, BusinessSuggestion } from '@/components/chatbox/types';
import { ProfileFormData } from '@/app/businessidea/types/profile.types';
import { getTemplateById, interpolateTemplate } from '@/services/TemplateService';
import { chatboxDebug } from '@/app/businessidea/utils/logStore';

/**
 * Adapter for BusinessSuggestionService that integrates with the template system
 */
export class BusinessSuggestionServiceAdapter {
  /**
   * Generate business suggestions using the selected template
   */
  async generateSuggestions(
    businessType: string,
    analysisResult: AnalysisResult,
    config: AnalysisConfig,
    profileData?: ProfileFormData
  ): Promise<BusinessSuggestion[]> {
    try {
      const id = businessType.trim().toLowerCase();
      chatboxDebug.info('business-suggestion-adapter', 'Generating suggestions (template-first)', {
        businessType: id,
        hasAnalysisResult: !!analysisResult,
        hasProfileData: !!profileData
      });

      // Template-first resolution for ALL ids
      let customSystemPrompt: string | undefined;
      const template = await getTemplateById(id);
      if (template) {
        const variables: Record<string, string> = {
          skills: profileData?.skillset?.technical?.join(', ') || 'Not specified',
          interests: profileData?.skillset?.categories?.map(c => c.name)?.join(', ') || 'Not specified',
          budget: 'Not specified',
          experience: Array.isArray(profileData?.experience)
            ? profileData.experience.map(e => e.title).join(', ')
            : 'Not specified',
          goals: profileData?.profile?.goal || 'Not specified',
          industry: profileData?.profile?.industry || profileData?.profile?.targetIndustry || 'Not specified',
          market: 'Global',
          competitors: 'Various',
          timeline: '3-6 months'
        };
        customSystemPrompt = interpolateTemplate(template, variables);
      } else {
        // If no template, only default ids may fallback to industry prompt
        const defaultIds = new Set(['saas', 'retail', 'course']);
        if (defaultIds.has(id)) {
          const { BusinessSuggestionPrompts } = await import('./prompts/BusinessSuggestionPrompts');
          const industryMap: Record<string, string> = { saas: 'technology', retail: 'retail', course: 'education' };
          customSystemPrompt = BusinessSuggestionPrompts.getIndustrySpecificPrompt(industryMap[id]);
        } else {
          const err: Error & { code?: string; meta?: unknown } = new Error(`Template not found for id: ${id}`);
          err.code = 'template_error';
          err.meta = { id };
          throw err;
        }
      }
      
      // Call the original service with the custom prompt
      return await businessSuggestionService.generateSuggestions(
        config,
        analysisResult,
        profileData,
        customSystemPrompt
      );
    } catch (error) {
      chatboxDebug.error('business-suggestion-adapter', 'Failed to generate suggestions', error);
      throw error;
    }
  }
}

export const businessSuggestionServiceAdapter = new BusinessSuggestionServiceAdapter();
