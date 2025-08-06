import { AnalysisConfig } from '../types';
import { validateSystemPrompt } from '../../../lib/chatbox/utils/system-prompt-utils';

/**
 * Validation utilities for chatbox controls
 */

/**
 * Validate OpenRouter API key format - using same pattern as working quiz
 */
export const validateApiKey = (apiKey: string): { isValid: boolean; error?: string } => {
  if (!apiKey) {
    return { isValid: false, error: 'API key is required' };
  }
  
  if (apiKey.length < 10) {
    return { isValid: false, error: 'API key is too short' };
  }
  
  // Use the same pattern as the working quiz validation
  const openRouterPattern = /^sk-or-v1-[a-f0-9]{32,}$/;
  if (!openRouterPattern.test(apiKey)) {
    return { isValid: false, error: 'Please enter a valid OpenRouter API key (sk-or-v1-...)' };
  }
  
  return { isValid: true };
};

/**
 * Validate model selection
 */
export const validateModel = (model: string, availableModels: string[]): { isValid: boolean; error?: string } => {
  if (!model) {
    return { isValid: false, error: 'Please select a model' };
  }
  
  if (!availableModels.includes(model)) {
    return { isValid: false, error: 'Selected model is not available' };
  }
  
  return { isValid: true };
};

/**
 * Validate complete analysis configuration
 */
export const validateAnalysisConfig = (
  config: AnalysisConfig, 
  availableModels: string[]
): { isValid: boolean; errors: Record<string, string>; warnings: Record<string, string> } => {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};
  
  // Validate API key
  const apiKeyValidation = validateApiKey(config.apiKey);
  if (!apiKeyValidation.isValid) {
    errors.apiKey = apiKeyValidation.error!;
  }
  
  // Validate model
  const modelValidation = validateModel(config.model, availableModels);
  if (!modelValidation.isValid) {
    errors.model = modelValidation.error!;
  }
  
  // Validate temperature
  if (config.temperature !== undefined) {
    if (config.temperature < 0 || config.temperature > 2) {
      errors.temperature = 'Temperature must be between 0 and 2';
    }
  }
  
  // Validate max tokens
  if (config.maxTokens !== undefined) {
    if (config.maxTokens < 1 || config.maxTokens > 4000) {
      errors.maxTokens = 'Max tokens must be between 1 and 4000';
    }
  }
  
  // Validate system prompt if present
  if (config.customPrompt) {
    const systemPromptValidation = validateSystemPrompt(config.customPrompt);
    if (!systemPromptValidation.isValid) {
      errors.customPrompt = systemPromptValidation.errors[0] || 'Invalid system prompt';
    } else if (systemPromptValidation.warnings.length > 0) {
      warnings.customPrompt = systemPromptValidation.warnings[0];
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings
  };
};

/**
 * Get user-friendly error messages
 */
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

/**
 * Check if API key appears to be a test/demo key
 */
export const isTestApiKey = (apiKey: string): boolean => {
  const testPatterns = [
    /test/i,
    /demo/i,
    /example/i,
    /placeholder/i,
    /sk-or-v1-0+/,
    /sk-or-v1-1+/
  ];
  
  return testPatterns.some(pattern => pattern.test(apiKey));
};

/**
 * Sanitize API key for logging (show only first/last few characters)
 */
export const sanitizeApiKey = (apiKey: string): string => {
  if (!apiKey || apiKey.length < 10) {
    return '[invalid]';
  }
  
  const start = apiKey.substring(0, 8);
  const end = apiKey.substring(apiKey.length - 4);
  const middle = '*'.repeat(Math.max(0, apiKey.length - 12));
  
  return `${start}${middle}${end}`;
};