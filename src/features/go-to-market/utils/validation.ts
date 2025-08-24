import { 
  MarketingStrategy, 
  SalesChannel, 
  PricingStrategy, 
  ValidationResult,
  MarketingAnalysisResponse 
} from '../types';
import { BusinessSuggestion } from '@/components/chatbox/types';

export function validateBusinessSuggestion(suggestion: BusinessSuggestion): ValidationResult {
  const errors: string[] = [];

  if (!suggestion.id) errors.push('Business suggestion must have an ID');
  if (!suggestion.title?.trim()) errors.push('Business suggestion must have a title');
  if (!suggestion.description?.trim()) errors.push('Business suggestion must have a description');
  if (!suggestion.category?.trim()) errors.push('Business suggestion must have a category');
  if (!suggestion.targetMarket?.trim()) errors.push('Business suggestion must have a target market');
  if (!Array.isArray(suggestion.keyFeatures) || suggestion.keyFeatures.length === 0) {
    errors.push('Business suggestion must have key features');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateMarketingStrategy(strategy: Partial<MarketingStrategy>): ValidationResult {
  const errors: string[] = [];

  if (!strategy.title?.trim()) errors.push('Marketing strategy must have a title');
  if (!strategy.description?.trim()) errors.push('Marketing strategy must have a description');
  if (!strategy.type || !['digital', 'content', 'partnership', 'traditional'].includes(strategy.type)) {
    errors.push('Marketing strategy must have a valid type');
  }
  if (!strategy.estimatedCost?.trim()) errors.push('Marketing strategy must have estimated cost');
  if (!strategy.timeframe?.trim()) errors.push('Marketing strategy must have timeframe');
  if (!strategy.difficulty || !['low', 'medium', 'high'].includes(strategy.difficulty)) {
    errors.push('Marketing strategy must have valid difficulty level');
  }
  if (!Array.isArray(strategy.tactics) || strategy.tactics.length === 0) {
    errors.push('Marketing strategy must have tactics');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateSalesChannel(channel: Partial<SalesChannel>): ValidationResult {
  const errors: string[] = [];

  if (!channel.name?.trim()) errors.push('Sales channel must have a name');
  if (!channel.description?.trim()) errors.push('Sales channel must have a description');
  if (!channel.type || !['direct', 'retail', 'online', 'partner'].includes(channel.type)) {
    errors.push('Sales channel must have a valid type');
  }
  if (!channel.expectedReach?.trim()) errors.push('Sales channel must have expected reach');
  if (!channel.timeToImplement?.trim()) errors.push('Sales channel must have implementation time');
  if (typeof channel.suitabilityScore !== 'number' || channel.suitabilityScore < 0 || channel.suitabilityScore > 100) {
    errors.push('Sales channel must have valid suitability score (0-100)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validatePricingStrategy(pricing: Partial<PricingStrategy>): ValidationResult {
  const errors: string[] = [];

  if (!pricing.title?.trim()) errors.push('Pricing strategy must have a title');
  if (!pricing.description?.trim()) errors.push('Pricing strategy must have a description');
  if (!pricing.model || !['freemium', 'subscription', 'one-time', 'tiered', 'usage-based'].includes(pricing.model)) {
    errors.push('Pricing strategy must have a valid model');
  }
  if (typeof pricing.marketFit !== 'number' || pricing.marketFit < 0 || pricing.marketFit > 100) {
    errors.push('Pricing strategy must have valid market fit score (0-100)');
  }
  if (!Array.isArray(pricing.pricePoints) || pricing.pricePoints.length === 0) {
    errors.push('Pricing strategy must have price points');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateMarketingAnalysisResponse(response: any): ValidationResult {
  const errors: string[] = [];

  if (!response || typeof response !== 'object') {
    errors.push('Response must be a valid object');
    return { isValid: false, errors };
  }

  // Validate strategies array
  if (!Array.isArray(response.strategies)) {
    errors.push('Response must contain strategies array');
  } else {
    response.strategies.forEach((strategy: any, index: number) => {
      const validation = validateMarketingStrategy(strategy);
      if (!validation.isValid) {
        errors.push(`Strategy ${index + 1}: ${validation.errors.join(', ')}`);
      }
    });
  }

  // Validate channels array
  if (!Array.isArray(response.channels)) {
    errors.push('Response must contain channels array');
  } else {
    response.channels.forEach((channel: any, index: number) => {
      const validation = validateSalesChannel(channel);
      if (!validation.isValid) {
        errors.push(`Channel ${index + 1}: ${validation.errors.join(', ')}`);
      }
    });
  }

  // Validate pricing array
  if (!Array.isArray(response.pricing)) {
    errors.push('Response must contain pricing array');
  } else {
    response.pricing.forEach((pricing: any, index: number) => {
      const validation = validatePricingStrategy(pricing);
      if (!validation.isValid) {
        errors.push(`Pricing ${index + 1}: ${validation.errors.join(', ')}`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
    .substring(0, 10000); // Limit length
}

export function validateApiKey(apiKey: string): boolean {
  return typeof apiKey === 'string' && apiKey.trim().length > 0;
}

export function validateModel(model: string): boolean {
  return typeof model === 'string' && model.trim().length > 0;
}