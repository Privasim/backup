/**
 * Service for validating prompt templates
 */

import { PromptTemplate, ValidationResult } from './types';

// Constants for validation
const TEMPLATE_LIMITS = {
  NAME_MIN_LENGTH: 3,
  NAME_MAX_LENGTH: 50,
  DESCRIPTION_MIN_LENGTH: 10,
  DESCRIPTION_MAX_LENGTH: 200,
  CONTENT_MIN_LENGTH: 50,
  CONTENT_MAX_LENGTH: 5000,
  TAGS_MAX_COUNT: 10,
  TAG_MIN_LENGTH: 2,
  TAG_MAX_LENGTH: 20
};

// Potentially harmful content patterns
const HARMFUL_PATTERNS = [
  'ignore previous instructions',
  'disregard',
  'forget everything',
  'act as if',
  'pretend to be',
  'bypass',
  'circumvent',
  'ignore all rules'
];

/**
 * Template Validator Service
 * Validates prompt templates for security and format
 */
export class TemplateValidator {
  /**
   * Validate a template
   */
  public validateTemplate(template: Partial<PromptTemplate>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Validate required fields
    if (!template.name) {
      errors.push('Template name is required');
    }
    
    if (!template.description) {
      errors.push('Template description is required');
    }
    
    if (!template.content) {
      errors.push('Template content is required');
    }
    
    if (!template.category) {
      errors.push('Template category is required');
    }
    
    if (!template.tags || !Array.isArray(template.tags)) {
      errors.push('Template tags must be an array');
    }
    
    // If there are missing required fields, return early
    if (errors.length > 0) {
      return { isValid: false, errors, warnings };
    }
    
    // Validate name length
    if (template.name!.length < TEMPLATE_LIMITS.NAME_MIN_LENGTH) {
      errors.push(`Name must be at least ${TEMPLATE_LIMITS.NAME_MIN_LENGTH} characters`);
    }
    
    if (template.name!.length > TEMPLATE_LIMITS.NAME_MAX_LENGTH) {
      errors.push(`Name cannot exceed ${TEMPLATE_LIMITS.NAME_MAX_LENGTH} characters`);
    }
    
    // Validate description length
    if (template.description!.length < TEMPLATE_LIMITS.DESCRIPTION_MIN_LENGTH) {
      errors.push(`Description must be at least ${TEMPLATE_LIMITS.DESCRIPTION_MIN_LENGTH} characters`);
    }
    
    if (template.description!.length > TEMPLATE_LIMITS.DESCRIPTION_MAX_LENGTH) {
      errors.push(`Description cannot exceed ${TEMPLATE_LIMITS.DESCRIPTION_MAX_LENGTH} characters`);
    }
    
    // Validate content length
    if (template.content!.length < TEMPLATE_LIMITS.CONTENT_MIN_LENGTH) {
      errors.push(`Content must be at least ${TEMPLATE_LIMITS.CONTENT_MIN_LENGTH} characters`);
    }
    
    if (template.content!.length > TEMPLATE_LIMITS.CONTENT_MAX_LENGTH) {
      errors.push(`Content cannot exceed ${TEMPLATE_LIMITS.CONTENT_MAX_LENGTH} characters`);
    }
    
    // Validate tags
    if (template.tags!.length > TEMPLATE_LIMITS.TAGS_MAX_COUNT) {
      errors.push(`Cannot have more than ${TEMPLATE_LIMITS.TAGS_MAX_COUNT} tags`);
    }
    
    for (const tag of template.tags!) {
      if (typeof tag !== 'string') {
        errors.push('All tags must be strings');
        break;
      }
      
      if (tag.length < TEMPLATE_LIMITS.TAG_MIN_LENGTH) {
        errors.push(`Tag "${tag}" is too short (minimum ${TEMPLATE_LIMITS.TAG_MIN_LENGTH} characters)`);
      }
      
      if (tag.length > TEMPLATE_LIMITS.TAG_MAX_LENGTH) {
        errors.push(`Tag "${tag}" is too long (maximum ${TEMPLATE_LIMITS.TAG_MAX_LENGTH} characters)`);
      }
    }
    
    // Check for duplicate tags
    const uniqueTags = new Set(template.tags!);
    if (uniqueTags.size !== template.tags!.length) {
      warnings.push('Template contains duplicate tags');
    }
    
    // Check for potentially harmful content
    const contentLower = template.content!.toLowerCase();
    for (const pattern of HARMFUL_PATTERNS) {
      if (contentLower.includes(pattern)) {
        warnings.push('Template contains potentially harmful instructions');
        break;
      }
    }
    
    // Check for common prompt engineering best practices
    if (!contentLower.includes('you are') && !contentLower.includes('your role')) {
      warnings.push('Consider starting with "You are..." for clearer role definition');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Sanitize template content
   */
  public sanitizeContent(content: string): string {
    // Remove excessive whitespace
    let sanitized = content.replace(/\s+/g, ' ').trim();
    
    // Remove potentially harmful patterns
    for (const pattern of HARMFUL_PATTERNS) {
      const regex = new RegExp(pattern, 'gi');
      sanitized = sanitized.replace(regex, '[REMOVED]');
    }
    
    return sanitized;
  }
  
  /**
   * Generate a preview of the template content
   */
  public generateContentPreview(content: string, maxLength: number = 150): string {
    const sanitized = this.sanitizeContent(content);
    
    if (sanitized.length <= maxLength) {
      return sanitized;
    }
    
    return sanitized.substring(0, maxLength - 3) + '...';
  }
}

// Export singleton instance
export const templateValidator = new TemplateValidator();