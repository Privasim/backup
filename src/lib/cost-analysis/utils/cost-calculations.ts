// Cost calculation utilities and formulas

import { SalaryData, AICostData, CostComparison, UserProfile } from '../types';

export class CostCalculator {
  
  // Standard assumptions for calculations
  private static readonly ASSUMPTIONS = {
    WORKING_DAYS_PER_YEAR: 250,
    WORKING_HOURS_PER_DAY: 8,
    BENEFITS_MULTIPLIER: 1.3, // 30% benefits on top of salary
    OVERHEAD_MULTIPLIER: 1.2, // 20% overhead costs
    AI_INFRASTRUCTURE_MONTHLY: 50, // Base monthly infrastructure cost
    AI_MAINTENANCE_ANNUAL: 1200, // Annual maintenance cost
  };

  // Calculate total human employment cost
  static calculateHumanCost(salaryData: SalaryData, profile: UserProfile): {
    annualSalary: number;
    benefits: number;
    overhead: number;
    total: number;
  } {
    let baseSalary = salaryData.median;

    // Apply location adjustment if available
    if (salaryData.locationAdjustment) {
      baseSalary *= salaryData.locationAdjustment;
    }

    // Apply experience adjustment if available
    if (salaryData.experienceAdjustment) {
      baseSalary *= salaryData.experienceAdjustment;
    }

    const benefits = baseSalary * (this.ASSUMPTIONS.BENEFITS_MULTIPLIER - 1);
    const salaryWithBenefits = baseSalary + benefits;
    const overhead = salaryWithBenefits * (this.ASSUMPTIONS.OVERHEAD_MULTIPLIER - 1);
    const total = salaryWithBenefits + overhead;

    return {
      annualSalary: Math.round(baseSalary),
      benefits: Math.round(benefits),
      overhead: Math.round(overhead),
      total: Math.round(total),
    };
  }

  // Calculate AI implementation costs
  static calculateAICost(
    modelPricing: { promptTokenCost: number; completionTokenCost: number },
    taskEstimation: { tokensPerTask: number; tasksPerDay: number },
    customInfrastructure?: number
  ): {
    tokenCosts: number;
    infrastructure: number;
    maintenance: number;
    total: number;
  } {
    // Calculate annual token costs
    const dailyTokens = taskEstimation.tokensPerTask * taskEstimation.tasksPerDay;
    const annualTokens = dailyTokens * this.ASSUMPTIONS.WORKING_DAYS_PER_YEAR;
    
    // Assume 70% prompt tokens, 30% completion tokens
    const promptTokens = annualTokens * 0.7;
    const completionTokens = annualTokens * 0.3;
    
    const tokenCosts = Math.round(
      (promptTokens * modelPricing.promptTokenCost) + 
      (completionTokens * modelPricing.completionTokenCost)
    );

    // Infrastructure costs
    const infrastructure = Math.round(
      (customInfrastructure || this.ASSUMPTIONS.AI_INFRASTRUCTURE_MONTHLY) * 12
    );

    // Maintenance costs
    const maintenance = this.ASSUMPTIONS.AI_MAINTENANCE_ANNUAL;

    const total = tokenCosts + infrastructure + maintenance;

    return {
      tokenCosts,
      infrastructure,
      maintenance,
      total,
    };
  }

  // Calculate cost comparison and savings
  static calculateComparison(
    humanCost: ReturnType<typeof CostCalculator.calculateHumanCost>,
    aiCost: ReturnType<typeof CostCalculator.calculateAICost>
  ): CostComparison {
    const savings = {
      absolute: humanCost.total - aiCost.total,
      percentage: ((humanCost.total - aiCost.total) / humanCost.total) * 100,
    };

    // Calculate payback period in months
    const implementationCost = aiCost.infrastructure; // Assume infrastructure is upfront cost
    const monthlySavings = savings.absolute / 12;
    const paybackPeriod = monthlySavings > 0 ? implementationCost / monthlySavings : Infinity;

    return {
      human: humanCost,
      ai: aiCost,
      savings: {
        absolute: Math.round(savings.absolute),
        percentage: Math.round(savings.percentage * 100) / 100,
      },
      paybackPeriod: Math.round(paybackPeriod * 100) / 100,
      confidence: 0.8, // Base confidence, can be adjusted based on data quality
    };
  }

  // Estimate task frequency based on occupation and experience
  static estimateTaskFrequency(occupation: string, experience: string): {
    tasksPerDay: number;
    tokensPerTask: number;
    automationPotential: number;
  } {
    // Base estimates by occupation type
    const occupationEstimates: Record<string, { tasksPerDay: number; tokensPerTask: number }> = {
      'software-developer': { tasksPerDay: 15, tokensPerTask: 800 },
      'data-scientist': { tasksPerDay: 12, tokensPerTask: 1200 },
      'content-writer': { tasksPerDay: 8, tokensPerTask: 1500 },
      'customer-support': { tasksPerDay: 25, tokensPerTask: 400 },
      'marketing-specialist': { tasksPerDay: 10, tokensPerTask: 600 },
      'financial-analyst': { tasksPerDay: 8, tokensPerTask: 1000 },
      'hr-specialist': { tasksPerDay: 12, tokensPerTask: 500 },
      'sales-representative': { tasksPerDay: 20, tokensPerTask: 300 },
    };

    // Get base estimates or use defaults
    const baseEstimate = occupationEstimates[occupation.toLowerCase()] || {
      tasksPerDay: 10,
      tokensPerTask: 600,
    };

    // Adjust based on experience level
    const experienceMultipliers: Record<string, number> = {
      'entry-level': 0.8,
      'junior': 0.9,
      'mid-level': 1.0,
      'senior': 1.2,
      'lead': 1.3,
      'executive': 1.1,
    };

    const experienceMultiplier = experienceMultipliers[experience.toLowerCase()] || 1.0;

    // Calculate automation potential based on task type
    const automationPotentials: Record<string, number> = {
      'software-developer': 0.6,
      'data-scientist': 0.7,
      'content-writer': 0.8,
      'customer-support': 0.9,
      'marketing-specialist': 0.7,
      'financial-analyst': 0.8,
      'hr-specialist': 0.6,
      'sales-representative': 0.4,
    };

    return {
      tasksPerDay: Math.round(baseEstimate.tasksPerDay * experienceMultiplier),
      tokensPerTask: Math.round(baseEstimate.tokensPerTask * experienceMultiplier),
      automationPotential: automationPotentials[occupation.toLowerCase()] || 0.6,
    };
  }

  // Get OpenRouter model pricing
  static getModelPricing(model: string): { promptTokenCost: number; completionTokenCost: number } {
    // Pricing per 1M tokens (as of 2024)
    const modelPricing: Record<string, { prompt: number; completion: number }> = {
      'qwen/qwen3-coder:free': { prompt: 0, completion: 0 },
      'z-ai/glm-4.5-air:free': { prompt: 0, completion: 0 },
      'moonshotai/kimi-k2:free': { prompt: 0, completion: 0 },
      'anthropic/claude-3-opus': { prompt: 15, completion: 75 },
      'anthropic/claude-3-sonnet': { prompt: 3, completion: 15 },
      'openai/gpt-4': { prompt: 30, completion: 60 },
      'openai/gpt-3.5-turbo': { prompt: 0.5, completion: 1.5 },
    };

    const pricing = modelPricing[model] || modelPricing['openai/gpt-3.5-turbo'];
    
    return {
      promptTokenCost: pricing.prompt / 1000000, // Convert to per-token cost
      completionTokenCost: pricing.completion / 1000000,
    };
  }

  // Format currency for display
  static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // Format percentage for display
  static formatPercentage(value: number): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  }

  // Calculate confidence score based on data quality
  static calculateConfidence(
    salaryDataConfidence: number,
    aiCostConfidence: number,
    dataSourceQuality: number = 0.8
  ): number {
    // Weighted average of confidence factors
    const weights = {
      salaryData: 0.4,
      aiCost: 0.3,
      dataSource: 0.3,
    };

    const confidence = 
      (salaryDataConfidence * weights.salaryData) +
      (aiCostConfidence * weights.aiCost) +
      (dataSourceQuality * weights.dataSource);

    return Math.round(confidence * 100) / 100;
  }

  // Validate calculation inputs
  static validateCalculationInputs(
    salaryData: SalaryData,
    taskEstimation: { tokensPerTask: number; tasksPerDay: number }
  ): boolean {
    if (salaryData.median <= 0) {
      throw new Error('Invalid salary data: median must be positive');
    }

    if (taskEstimation.tokensPerTask <= 0) {
      throw new Error('Invalid task estimation: tokens per task must be positive');
    }

    if (taskEstimation.tasksPerDay <= 0) {
      throw new Error('Invalid task estimation: tasks per day must be positive');
    }

    return true;
  }
}