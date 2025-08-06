/**
 * Utilities for system prompt validation and management
 */

export interface SystemPromptValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  characterCount: number;
  wordCount: number;
}

/**
 * System prompt configuration
 */
export interface SystemPromptConfig {
  enabled: boolean;
  prompt: string;
  templateId?: string;
  isCustom: boolean;
  lastModified: string;
  perModelPrompts?: Record<string, string>;
  lastUsedPrompt?: string;
}

/**
 * Constants for validation
 */
export const SYSTEM_PROMPT_LIMITS = {
  MAX_CHARACTERS: 2000,
  MAX_WORDS: 400,
  MIN_CHARACTERS: 10,
  RECOMMENDED_MAX_CHARACTERS: 1500
} as const;

/**
 * Validate system prompt content
 */
export const validateSystemPrompt = (prompt: string): SystemPromptValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const characterCount = prompt.length;
  const wordCount = prompt.trim().split(/\s+/).filter(word => word.length > 0).length;
  
  // Character count validation
  if (characterCount < SYSTEM_PROMPT_LIMITS.MIN_CHARACTERS) {
    errors.push(`Prompt must be at least ${SYSTEM_PROMPT_LIMITS.MIN_CHARACTERS} characters long`);
  }
  
  if (characterCount > SYSTEM_PROMPT_LIMITS.MAX_CHARACTERS) {
    errors.push(`Prompt exceeds maximum length of ${SYSTEM_PROMPT_LIMITS.MAX_CHARACTERS} characters`);
  }
  
  if (characterCount > SYSTEM_PROMPT_LIMITS.RECOMMENDED_MAX_CHARACTERS) {
    warnings.push(`Prompt is longer than recommended ${SYSTEM_PROMPT_LIMITS.RECOMMENDED_MAX_CHARACTERS} characters`);
  }
  
  // Word count validation
  if (wordCount > SYSTEM_PROMPT_LIMITS.MAX_WORDS) {
    warnings.push(`Prompt has ${wordCount} words, consider keeping under ${SYSTEM_PROMPT_LIMITS.MAX_WORDS} words`);
  }
  
  // Content validation
  const lowercasePrompt = prompt.toLowerCase();
  
  // Check for potentially harmful content patterns
  const harmfulPatterns = [
    'ignore previous instructions',
    'disregard',
    'forget everything',
    'act as if',
    'pretend to be'
  ];
  
  for (const pattern of harmfulPatterns) {
    if (lowercasePrompt.includes(pattern)) {
      warnings.push('Prompt contains potentially problematic instructions');
      break;
    }
  }
  
  // Check for empty or whitespace-only content
  if (!prompt.trim()) {
    errors.push('Prompt cannot be empty');
  }
  
  // Check for basic structure
  if (prompt.trim() && !prompt.includes('You are')) {
    warnings.push('Consider starting with "You are..." for clearer role definition');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    characterCount,
    wordCount
  };
};

/**
 * Sanitize system prompt content
 */
export const sanitizeSystemPrompt = (prompt: string): string => {
  // Remove excessive whitespace
  let sanitized = prompt.replace(/\s+/g, ' ').trim();
  
  // Remove potentially harmful patterns (basic sanitization)
  const harmfulPatterns = [
    /ignore\s+previous\s+instructions/gi,
    /disregard\s+everything/gi,
    /forget\s+everything/gi
  ];
  
  for (const pattern of harmfulPatterns) {
    sanitized = sanitized.replace(pattern, '');
  }
  
  return sanitized.trim();
};

/**
 * Generate system prompt preview
 */
export const generateSystemPromptPreview = (prompt: string, maxLength: number = 150): string => {
  const sanitized = sanitizeSystemPrompt(prompt);
  
  if (sanitized.length <= maxLength) {
    return sanitized;
  }
  
  return sanitized.substring(0, maxLength - 3) + '...';
};

/**
 * Check if prompt is a template or custom
 */
export const isTemplatePrompt = (prompt: string, templateId?: string): boolean => {
  if (!templateId) return false;
  
  // Import templates to check
  const { getSystemPromptTemplate } = require('../prompts/SystemPromptTemplates');
  const template = getSystemPromptTemplate(templateId);
  
  return template ? template.prompt === prompt : false;
};

/**
 * Create default system prompt config
 */
export const createDefaultSystemPromptConfig = (): SystemPromptConfig => ({
  enabled: false,
  prompt: '',
  templateId: undefined,
  isCustom: false,
  lastModified: new Date().toISOString(),
  perModelPrompts: {},
  lastUsedPrompt: undefined
});

/**
 * Format character count display
 */
export const formatCharacterCount = (count: number, max: number): string => {
  const percentage = (count / max) * 100;
  
  if (percentage >= 100) {
    return `${count}/${max} (limit exceeded)`;
  } else if (percentage >= 80) {
    return `${count}/${max} (${Math.round(percentage)}%)`;
  } else {
    return `${count}/${max}`;
  }
};

/**
 * Get validation status color
 */
export const getValidationStatusColor = (validation: SystemPromptValidationResult): string => {
  if (!validation.isValid) {
    return 'text-red-600';
  } else if (validation.warnings.length > 0) {
    return 'text-yellow-600';
  } else {
    return 'text-green-600';
  }
};

/**
 * Get character count color
 */
export const getCharacterCountColor = (count: number, max: number): string => {
  const percentage = (count / max) * 100;
  
  if (percentage >= 100) {
    return 'text-red-600';
  } else if (percentage >= 80) {
    return 'text-yellow-600';
  } else {
    return 'text-gray-600';
  }
};