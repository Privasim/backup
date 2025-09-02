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
    profileData?: ProfileFormData,
    customSystemPrompt?: string
  ): Promise<BusinessSuggestion[]> {
    chatboxDebug.info('business-suggestion', 'Starting business suggestion generation', {
      hasAnalysisResult: !!analysisResult,
      hasProfileData: !!profileData,
      model: config.model
    });

    try {
      // Basic config validation
      if (!config?.apiKey || !config?.model) {
        const err: Error & { code?: string; meta?: unknown } = new Error('API key and model are required');
        err.code = 'config_error';
        err.meta = { hasApiKey: !!config?.apiKey, hasModel: !!config?.model };
        throw err;
      }

      const prompt = this.buildBusinessSuggestionPrompt(analysisResult, profileData, customSystemPrompt);
      
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
      if (!content) {
        const err: Error & { code?: string; meta?: unknown } = new Error('Empty response from model');
        err.code = 'api_error';
        err.meta = { responseSummary: JSON.stringify(response)?.slice(0, 500) };
        throw err;
      }

      const suggestions = this.parseBusinessSuggestions(content);
      // Validate suggestions
      if (!Array.isArray(suggestions) || suggestions.length === 0) {
        const err: Error & { code?: string; meta?: unknown } = new Error('No suggestions returned');
        err.code = 'validation_error';
        err.meta = { contentSnippet: content.slice(0, 500) };
        throw err;
      }
      
      chatboxDebug.success('business-suggestion', 'Business suggestions generated successfully', {
        count: suggestions.length
      });

      return suggestions;
    } catch (error) {
      const errObj = error as Error & { code?: string; meta?: unknown };
      const code = errObj.code || 'api_error';
      const message = errObj.message || 'Business suggestion generation failed';
      chatboxDebug.error('business-suggestion', 'Failed to generate business suggestions', { code, message, meta: errObj.meta });
      const wrapped: Error & { code?: string; meta?: unknown } = new Error(message);
      wrapped.code = code;
      wrapped.meta = errObj.meta;
      throw wrapped;
    }
  }

  private buildBusinessSuggestionPrompt(
    analysisResult: AnalysisResult,
    profileData?: ProfileFormData,
    customSystemPrompt?: string
  ): string {
    // Use dynamic import to avoid require()
    const BusinessSuggestionPrompts = require('./prompts/BusinessSuggestionPrompts').BusinessSuggestionPrompts;
    return BusinessSuggestionPrompts.buildBusinessSuggestionPrompt(analysisResult, profileData, customSystemPrompt);
  }

  private parseBusinessSuggestions(content: string): BusinessSuggestion[] {
    try {
      // Clean the content to extract JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        const err: Error & { code?: string; meta?: unknown } = new Error('No JSON found in response');
        err.code = 'parsing_error';
        err.meta = { contentSnippet: content.slice(0, 200) };
        throw err;
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
        const err: Error & { code?: string; meta?: unknown } = new Error('Invalid response format: missing suggestions array');
        err.code = 'validation_error';
        err.meta = { keys: Object.keys(parsed || {}) };
        throw err;
      }

      const mapped = parsed.suggestions.map((suggestion: Record<string, unknown>, index: number) => ({
        id: (suggestion as any).id || `suggestion-${Date.now()}-${index}`,
        title: (suggestion as any).title || 'Untitled Business',
        description: (suggestion as any).description || 'No description provided',
        category: (suggestion as any).category || 'General',
        viabilityScore: Math.min(95, Math.max(60, Number((suggestion as any).viabilityScore ?? 75))),
        keyFeatures: Array.isArray((suggestion as any).keyFeatures) ? (suggestion as any).keyFeatures : [],
        targetMarket: (suggestion as any).targetMarket || 'General market',
        estimatedStartupCost: (suggestion as any).estimatedStartupCost || 'Not specified',
        metadata: (suggestion as any).metadata || {}
      }));

      // Basic validation on mapped results
      if (!mapped.every(this.validateSuggestion)) {
        const err: Error & { code?: string; meta?: unknown } = new Error('One or more suggestions failed validation');
        err.code = 'validation_error';
        err.meta = { suggestionCount: mapped.length };
        throw err;
      }

      return mapped;
    } catch (error) {
      const errObj = error as Error & { code?: string; meta?: unknown };
      chatboxDebug.error('business-suggestion', 'Failed to parse/validate business suggestions', { message: errObj.message, code: errObj.code, meta: errObj.meta });
      throw errObj;
    }
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