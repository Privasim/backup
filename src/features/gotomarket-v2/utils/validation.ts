import { GoToMarketStrategies, ValidationResult, GenerationOptions } from '../types';
import { ImplementationPlan } from '@/features/implementation-plan/types';

export const validateGenerationOptions = (options: GenerationOptions): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate focus areas
  if (options.focusAreas) {
    const validFocusAreas = ['marketing', 'sales', 'pricing', 'distribution'];
    const invalidAreas = options.focusAreas.filter(area => !validFocusAreas.includes(area));
    if (invalidAreas.length > 0) {
      errors.push(`Invalid focus areas: ${invalidAreas.join(', ')}`);
    }
  }

  // Validate budget range
  if (options.budgetRange && !['low', 'medium', 'high'].includes(options.budgetRange)) {
    errors.push('Budget range must be low, medium, or high');
  }

  // Validate timeframe
  if (options.timeframe && !['immediate', 'short-term', 'long-term'].includes(options.timeframe)) {
    errors.push('Timeframe must be immediate, short-term, or long-term');
  }

  // Validate custom prompt length
  if (options.customPrompt && options.customPrompt.length > 1000) {
    warnings.push('Custom prompt is very long and may affect generation quality');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateImplementationPlan = (plan: ImplementationPlan | null): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!plan) {
    errors.push('Implementation plan is required');
    return { isValid: false, errors, warnings };
  }

  // Check essential components
  if (!plan.meta?.title) {
    warnings.push('Implementation plan missing title');
  }

  if (!plan.overview?.goals || plan.overview.goals.length === 0) {
    warnings.push('Implementation plan missing business goals');
  }

  if (!plan.phases || plan.phases.length === 0) {
    errors.push('Implementation plan must have at least one phase');
  }

  if (!plan.textContent || plan.textContent.trim().length < 100) {
    errors.push('Implementation plan content is too brief for strategy generation');
  }

  // Check for business-relevant content
  const textContent = plan.textContent?.toLowerCase() || '';
  const businessKeywords = ['business', 'market', 'customer', 'product', 'service', 'revenue', 'user'];
  const hasBusinessContent = businessKeywords.some(keyword => textContent.includes(keyword));
  
  if (!hasBusinessContent) {
    warnings.push('Implementation plan may not contain sufficient business context');
  }

  // Check for market-related content
  const marketKeywords = ['target', 'audience', 'segment', 'competitor', 'market'];
  const hasMarketContent = marketKeywords.some(keyword => textContent.includes(keyword));
  
  if (!hasMarketContent) {
    warnings.push('Implementation plan may be missing market analysis');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateGoToMarketStrategies = (strategies: GoToMarketStrategies): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate required fields
  if (!strategies.id) {
    errors.push('Strategy ID is required');
  }

  if (!strategies.businessContext) {
    errors.push('Business context is required');
  }

  // Validate business context
  if (strategies.businessContext) {
    if (!strategies.businessContext.businessIdea) {
      errors.push('Business idea is required');
    }

    if (!strategies.businessContext.targetMarket) {
      warnings.push('Target market is missing');
    }

    if (!strategies.businessContext.valueProposition) {
      warnings.push('Value proposition is missing');
    }
  }

  // Validate strategies content
  if (!strategies.marketingStrategies || strategies.marketingStrategies.length === 0) {
    warnings.push('No marketing strategies found');
  }

  if (!strategies.salesChannels || strategies.salesChannels.length === 0) {
    warnings.push('No sales channels found');
  }

  if (!strategies.pricingStrategies || strategies.pricingStrategies.length === 0) {
    warnings.push('No pricing strategies found');
  }

  // Validate individual marketing strategies
  strategies.marketingStrategies?.forEach((strategy, index) => {
    if (!strategy.title) {
      errors.push(`Marketing strategy ${index + 1} missing title`);
    }
    if (!strategy.description) {
      warnings.push(`Marketing strategy ${index + 1} missing description`);
    }
    if (!strategy.type || !['digital', 'content', 'social', 'traditional'].includes(strategy.type)) {
      errors.push(`Marketing strategy ${index + 1} has invalid type`);
    }
  });

  // Validate individual sales channels
  strategies.salesChannels?.forEach((channel, index) => {
    if (!channel.name) {
      errors.push(`Sales channel ${index + 1} missing name`);
    }
    if (!channel.type || !['direct', 'retail', 'online', 'partner'].includes(channel.type)) {
      errors.push(`Sales channel ${index + 1} has invalid type`);
    }
    if (channel.suitabilityScore < 0 || channel.suitabilityScore > 100) {
      errors.push(`Sales channel ${index + 1} has invalid suitability score`);
    }
  });

  // Validate individual pricing strategies
  strategies.pricingStrategies?.forEach((pricing, index) => {
    if (!pricing.title) {
      errors.push(`Pricing strategy ${index + 1} missing title`);
    }
    if (!pricing.model || !['freemium', 'subscription', 'one-time', 'tiered'].includes(pricing.model)) {
      errors.push(`Pricing strategy ${index + 1} has invalid model`);
    }
    if (pricing.marketFit < 0 || pricing.marketFit > 100) {
      errors.push(`Pricing strategy ${index + 1} has invalid market fit score`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateApiConfiguration = (apiKey: string, model: string): ValidationResult => {
  const errors: string[] = [];

  if (!apiKey) {
    errors.push('API key is required');
  } else if (!apiKey.startsWith('sk-or-')) {
    errors.push('Invalid API key format');
  }

  if (!model) {
    errors.push('AI model is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeInput = (input: string): string => {
  // Remove potentially harmful characters and limit length
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .substring(0, 10000) // Limit length
    .trim();
};

export const validateFileImport = (content: string, expectedType: 'json'): ValidationResult => {
  const errors: string[] = [];

  if (!content || content.trim().length === 0) {
    errors.push('File content is empty');
    return { isValid: false, errors };
  }

  if (expectedType === 'json') {
    try {
      const parsed = JSON.parse(content);
      
      // Basic structure validation for GoToMarketStrategies
      if (!parsed.id || !parsed.businessContext) {
        errors.push('Invalid strategy file format');
      }
    } catch (error) {
      errors.push('Invalid JSON format');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};