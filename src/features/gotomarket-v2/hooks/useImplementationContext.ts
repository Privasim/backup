import { useMemo } from 'react';
import { useImplementationPlan } from '@/features/implementation-plan/useImplementationPlan';
import { ImplementationPlan } from '@/features/implementation-plan/types';
import { ValidationResult } from '../types';

interface ImplementationContextResult {
  implementationPlan: ImplementationPlan | null;
  hasValidContext: boolean;
  contextValidation: ValidationResult;
  contextSummary: string;
  isLoading: boolean;
}

export const useImplementationContext = (): ImplementationContextResult => {
  const { plan, status } = useImplementationPlan();

  const contextValidation = useMemo((): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!plan) {
      errors.push('No implementation plan available');
      return { isValid: false, errors, warnings };
    }

    // Check for essential plan components
    if (!plan.meta?.title) {
      warnings.push('Implementation plan missing title');
    }

    if (!plan.overview?.goals || plan.overview.goals.length === 0) {
      warnings.push('Implementation plan missing business goals');
    }

    if (!plan.phases || plan.phases.length === 0) {
      errors.push('Implementation plan missing phases');
    }

    if (!plan.textContent || plan.textContent.trim().length < 100) {
      errors.push('Implementation plan content is too brief for strategy generation');
    }

    // Check for business-relevant content
    const textContent = plan.textContent?.toLowerCase() || '';
    const businessKeywords = ['business', 'market', 'customer', 'product', 'service', 'revenue'];
    const hasBusinessContent = businessKeywords.some(keyword => textContent.includes(keyword));
    
    if (!hasBusinessContent) {
      warnings.push('Implementation plan may not contain sufficient business context');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [plan]);

  const contextSummary = useMemo((): string => {
    if (!plan) {
      return 'No implementation plan available. Please generate an implementation plan first.';
    }

    const title = plan.meta?.title || 'Untitled Plan';
    const goalCount = plan.overview?.goals?.length || 0;
    const phaseCount = plan.phases?.length || 0;
    const taskCount = plan.tasks?.length || 0;

    return `${title} - ${goalCount} goals, ${phaseCount} phases, ${taskCount} tasks`;
  }, [plan]);

  const hasValidContext = useMemo(() => {
    return contextValidation.isValid && plan !== null;
  }, [contextValidation.isValid, plan]);

  const isLoading = status === 'generating' || status === 'streaming';

  return {
    implementationPlan: plan,
    hasValidContext,
    contextValidation,
    contextSummary,
    isLoading
  };
};

export const validateImplementationPlan = (plan: ImplementationPlan | null): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!plan) {
    errors.push('Implementation plan is required');
    return { isValid: false, errors, warnings };
  }

  // Required fields validation
  if (!plan.meta?.title) {
    warnings.push('Plan title is missing');
  }

  if (!plan.overview?.goals || plan.overview.goals.length === 0) {
    warnings.push('Business goals are missing');
  }

  if (!plan.phases || plan.phases.length === 0) {
    errors.push('Implementation phases are required');
  }

  if (!plan.textContent || plan.textContent.trim().length < 50) {
    errors.push('Plan content is insufficient for strategy generation');
  }

  // Content quality validation
  const textContent = plan.textContent?.toLowerCase() || '';
  const requiredKeywords = ['business', 'market', 'customer'];
  const missingKeywords = requiredKeywords.filter(keyword => !textContent.includes(keyword));
  
  if (missingKeywords.length > 0) {
    warnings.push(`Plan may be missing context about: ${missingKeywords.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const extractBusinessInsights = (plan: ImplementationPlan): {
  businessType: string;
  targetMarket: string;
  keyFeatures: string[];
  competitiveAdvantages: string[];
} => {
  const textContent = plan.textContent?.toLowerCase() || '';
  
  // Extract business type
  let businessType = 'General Business';
  const businessTypes = ['saas', 'e-commerce', 'marketplace', 'mobile app', 'web app', 'service', 'product'];
  for (const type of businessTypes) {
    if (textContent.includes(type)) {
      businessType = type.charAt(0).toUpperCase() + type.slice(1);
      break;
    }
  }

  // Extract target market indicators
  let targetMarket = 'General Market';
  const marketIndicators = ['small business', 'enterprise', 'consumer', 'b2b', 'b2c', 'startup'];
  for (const indicator of marketIndicators) {
    if (textContent.includes(indicator)) {
      targetMarket = indicator.charAt(0).toUpperCase() + indicator.slice(1);
      break;
    }
  }

  // Extract key features from phases and tasks
  const keyFeatures: string[] = [];
  plan.phases?.forEach(phase => {
    if (phase.objectives) {
      keyFeatures.push(...phase.objectives.slice(0, 2)); // Take first 2 objectives per phase
    }
  });

  // Extract competitive advantages from goals
  const competitiveAdvantages = plan.overview?.goals?.slice(0, 3) || [];

  return {
    businessType,
    targetMarket,
    keyFeatures: keyFeatures.slice(0, 5), // Limit to 5 features
    competitiveAdvantages: competitiveAdvantages.slice(0, 3) // Limit to 3 advantages
  };
};