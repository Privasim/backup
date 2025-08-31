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
      chatboxDebug.info('business-suggestion-adapter', 'Generating suggestions with template', {
        businessType,
        hasAnalysisResult: !!analysisResult,
        hasProfileData: !!profileData
      });

      // Get template content based on business type
      let customSystemPrompt: string | undefined;
      
      // If it's a custom template (not one of the default types)
      if (businessType !== 'saas' && businessType !== 'retail' && businessType !== 'course') {
        const template = await getTemplateById(businessType);
        
        if (template) {
          // Create variables object from profile data and analysis
          const variables: Record<string, string> = {
            skills: profileData?.skillset?.technical?.join(', ') || 'Not specified',
            interests: profileData?.skillset?.categories?.map(c => c.name)?.join(', ') || 'Not specified',
            budget: 'Not specified', // No direct budget field in ProfileFormData
            experience: Array.isArray(profileData?.experience) 
              ? profileData.experience.map(e => e.title).join(', ')
              : 'Not specified',
            goals: profileData?.profile?.goal || 'Not specified',
            industry: profileData?.profile?.industry || profileData?.profile?.targetIndustry || 'Not specified',
            market: 'Global', // Default value
            competitors: 'Various', // Default value
            timeline: '3-6 months' // Default value
          };
          
          // Interpolate the template with variables
          customSystemPrompt = interpolateTemplate(template, variables);
        }
      } else {
        // For default types, use the industry-specific prompt
        const industryMap: Record<string, string> = {
          'saas': 'technology',
          'retail': 'retail',
          'course': 'education'
        };
        
        // Import dynamically to avoid circular dependencies
        const { BusinessSuggestionPrompts } = await import('./prompts/BusinessSuggestionPrompts');
        const industryPrompt = BusinessSuggestionPrompts.getIndustrySpecificPrompt(industryMap[businessType]);
        customSystemPrompt = industryPrompt;
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
