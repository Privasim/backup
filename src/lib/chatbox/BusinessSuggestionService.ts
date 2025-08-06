'use client';

import { AnalysisConfig, AnalysisResult, BusinessSuggestion } from '@/components/chatbox/types';
import { ProfileFormData } from '@/app/businessidea/types/profile.types';
import { OpenRouterClient } from '@/lib/openrouter/client';
import { chatboxDebug } from '@/app/businessidea/utils/logStore';

export class BusinessSuggestionService {
  private static instance: BusinessSuggestionService;

  static getInstance(): BusinessSuggestionService {
    if (!BusinessSuggestionService.instance) {
      BusinessSuggestionService.instance = new BusinessSuggestionService();
    }
    return BusinessSuggestionService.instance;
  }

  async generateSuggestions(
    config: AnalysisConfig,
    analysisResult: AnalysisResult,
    profileData?: ProfileFormData
  ): Promise<BusinessSuggestion[]> {
    chatboxDebug.info('business-suggestion', 'Starting business suggestion generation', {
      hasAnalysisResult: !!analysisResult,
      hasProfileData: !!profileData,
      model: config.model
    });

    try {
      const prompt = this.buildBusinessSuggestionPrompt(analysisResult, profileData);
      
      // Create OpenRouter client instance
      const client = new OpenRouterClient(config.apiKey);
      
      const response = await client.chat({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: 'You are a business consultant AI that generates personalized business suggestions based on user profile analysis. Always respond with valid JSON containing exactly 3 business suggestions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 1200
      });

      // Extract content from OpenRouter response
      const content = response?.choices?.[0]?.message?.content || '';
      const suggestions = this.parseBusinessSuggestions(content);
      
      chatboxDebug.success('business-suggestion', 'Business suggestions generated successfully', {
        count: suggestions.length
      });

      return suggestions;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      chatboxDebug.error('business-suggestion', 'Failed to generate business suggestions', error);
      throw new Error(`Business suggestion generation failed: ${errorMessage}`);
    }
  }

  private buildBusinessSuggestionPrompt(
    analysisResult: AnalysisResult,
    profileData?: ProfileFormData
  ): string {
    // Use dynamic import to avoid require()
    const BusinessSuggestionPrompts = require('./prompts/BusinessSuggestionPrompts').BusinessSuggestionPrompts;
    return BusinessSuggestionPrompts.buildBusinessSuggestionPrompt(analysisResult, profileData);
  }

  private parseBusinessSuggestions(content: string): BusinessSuggestion[] {
    try {
      // Clean the content to extract JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
        throw new Error('Invalid response format: missing suggestions array');
      }

      return parsed.suggestions.map((suggestion: Record<string, unknown>, index: number) => ({
        id: suggestion.id || `suggestion-${Date.now()}-${index}`,
        title: suggestion.title || 'Untitled Business',
        description: suggestion.description || 'No description provided',
        category: suggestion.category || 'General',
        viabilityScore: Math.min(95, Math.max(60, suggestion.viabilityScore || 75)),
        keyFeatures: Array.isArray(suggestion.keyFeatures) ? suggestion.keyFeatures : [],
        targetMarket: suggestion.targetMarket || 'General market',
        estimatedStartupCost: suggestion.estimatedStartupCost || 'Not specified',
        metadata: suggestion.metadata || {}
      }));
    } catch (error) {
      chatboxDebug.error('business-suggestion', 'Failed to parse business suggestions', error);
      
      // Return fallback suggestions
      return this.getFallbackSuggestions();
    }
  }

  private getFallbackSuggestions(): BusinessSuggestion[] {
    return [
      {
        id: `fallback-1-${Date.now()}`,
        title: 'Consulting Service',
        description: 'Leverage your expertise to provide consulting services in your field of experience.',
        category: 'Professional Services',
        viabilityScore: 80,
        keyFeatures: ['Low startup cost', 'Flexible schedule', 'High profit margins'],
        targetMarket: 'Small to medium businesses',
        estimatedStartupCost: '$1,000 - $5,000',
        metadata: {
          timeToMarket: '1-2 months',
          skillsRequired: ['Domain expertise', 'Communication'],
          marketSize: 'Large'
        }
      },
      {
        id: `fallback-2-${Date.now()}`,
        title: 'Online Course Creation',
        description: 'Create and sell online courses based on your skills and knowledge.',
        category: 'Education Technology',
        viabilityScore: 75,
        keyFeatures: ['Scalable income', 'Passive revenue', 'Global reach'],
        targetMarket: 'Professionals seeking skill development',
        estimatedStartupCost: '$2,000 - $10,000',
        metadata: {
          timeToMarket: '2-4 months',
          skillsRequired: ['Teaching', 'Content creation', 'Marketing'],
          marketSize: 'Large'
        }
      },
      {
        id: `fallback-3-${Date.now()}`,
        title: 'Digital Service Business',
        description: 'Offer digital services such as design, development, or marketing to businesses.',
        category: 'Digital Services',
        viabilityScore: 85,
        keyFeatures: ['Remote work', 'Recurring revenue', 'High demand'],
        targetMarket: 'Small businesses and startups',
        estimatedStartupCost: '$3,000 - $15,000',
        metadata: {
          timeToMarket: '1-3 months',
          skillsRequired: ['Technical skills', 'Client management'],
          marketSize: 'Very Large'
        }
      }
    ];
  }

  validateSuggestion(suggestion: Record<string, unknown>): boolean {
    return (
      suggestion &&
      typeof suggestion.title === 'string' &&
      typeof suggestion.description === 'string' &&
      typeof suggestion.category === 'string' &&
      typeof suggestion.viabilityScore === 'number' &&
      Array.isArray(suggestion.keyFeatures) &&
      typeof suggestion.targetMarket === 'string' &&
      typeof suggestion.estimatedStartupCost === 'string'
    );
  }
}

export const businessSuggestionService = BusinessSuggestionService.getInstance();