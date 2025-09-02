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
            content: 'You are a business consultant AI that generates personalized business suggestions based on user profile analysis. Respond with ONLY a single JSON object and nothing else. The object MUST have key "suggestions" as an array with exactly 3 items. Do NOT include prose, markdown, or code fences.'
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
      // Extract candidate JSON from content (handles code fences and mixed text)
      const candidate = this.extractJsonCandidate(content);
      if (!candidate) {
        const err: Error & { code?: string; meta?: unknown } = new Error('No JSON found in response');
        err.code = 'parsing_error';
        err.meta = { contentSnippet: content.slice(0, 300) };
        throw err;
      }

      // Sanitize common LLM JSON issues (trailing commas, smart quotes, BOM)
      const sanitized = this.sanitizeJson(candidate);

      // Parse JSON
      const parsed = JSON.parse(sanitized);

      if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
        const err: Error & { code?: string; meta?: unknown } = new Error('Invalid response format: missing suggestions array');
        err.code = 'validation_error';
        err.meta = { keys: Object.keys(parsed || {}), jsonSnippet: sanitized.slice(0, 300) };
        throw err;
      }

      const mapped = parsed.suggestions.map((suggestion: Record<string, unknown>, index: number) => {
        const rawId = (suggestion as any).id;
        const rawScore = (suggestion as any).viabilityScore;
        const numericScore = typeof rawScore === 'number'
          ? rawScore
          : parseFloat(String(rawScore ?? ''));
        const clamped = isFinite(numericScore) ? Math.min(95, Math.max(60, numericScore)) : 75;

        const rawFeatures = (suggestion as any).keyFeatures;
        const keyFeatures = Array.isArray(rawFeatures)
          ? rawFeatures.map(String)
          : rawFeatures
          ? [String(rawFeatures)]
          : [];

        const estCost = (suggestion as any).estimatedStartupCost;
        const metadata = (suggestion as any).metadata;

        return {
          id: rawId || `suggestion-${Date.now()}-${index}`,
          title: (suggestion as any).title || 'Untitled Business',
          description: (suggestion as any).description || 'No description provided',
          category: (suggestion as any).category || 'General',
          viabilityScore: clamped,
          keyFeatures,
          targetMarket: (suggestion as any).targetMarket || 'General market',
          estimatedStartupCost: typeof estCost === 'string' ? estCost : String(estCost ?? 'Not specified'),
          metadata: typeof metadata === 'object' && metadata !== null ? metadata : {}
        };
      });

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

  private extractJsonCandidate(content: string): string | null {
    // 1) Remove code fences and prefer fenced JSON if present
    const fenced = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenced && fenced[1]) {
      return fenced[1].trim();
    }

    // 2) Collect balanced JSON object blocks via brace matching
    const blocks: string[] = [];
    let depth = 0;
    let start = -1;
    for (let i = 0; i < content.length; i++) {
      const ch = content[i];
      if (ch === '{') {
        if (depth === 0) start = i;
        depth++;
      } else if (ch === '}') {
        if (depth > 0) depth--;
        if (depth === 0 && start >= 0) {
          blocks.push(content.slice(start, i + 1));
          start = -1;
        }
      }
    }

    // Prefer block that contains a suggestions array
    const preferred = blocks.find(b => /"suggestions"\s*:\s*\[/.test(b));
    if (preferred) return preferred.trim();

    // Fallback to the largest block if any
    if (blocks.length > 0) {
      return blocks.sort((a, b) => b.length - a.length)[0].trim();
    }
    return null;
  }

  private sanitizeJson(jsonStr: string): string {
    let s = jsonStr;
    // Normalize smart quotes
    s = s.replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'");
    // Remove BOM if present
    s = s.replace(/^\uFEFF/, '');
    // Remove trailing commas before closing brackets/braces (run twice to be safe)
    const trailingComma = /,\s*(\}|\])/g;
    for (let i = 0; i < 2; i++) {
      s = s.replace(trailingComma, '$1');
    }
    // Remove stray code fence ticks if they slipped in
    s = s.replace(/```/g, '');
    return s.trim();
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