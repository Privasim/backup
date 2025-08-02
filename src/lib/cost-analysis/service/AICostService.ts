// Service for calculating AI implementation costs

import { AICostData, UserProfile } from '../types';
import { CostCalculator } from '../utils/cost-calculations';
import { CostAnalysisCacheManager } from '../utils/cache-manager';
import { debugLog } from '@/components/debug/DebugConsole';

export class AICostService {
  private cache: CostAnalysisCacheManager;

  constructor() {
    this.cache = new CostAnalysisCacheManager();
  }

  // Calculate comprehensive AI costs for a given profile
  async calculateAICosts(profile: UserProfile, model: string = 'qwen/qwen3-coder:free'): Promise<AICostData | null> {
    try {
      debugLog.info('AICostService', 'Calculating AI costs', {
        occupation: profile.occupation,
        model,
        experience: profile.experience
      });

      // Check cache first
      const cacheKey = this.cache.generateAICostKey(model, profile.occupation);
      const cached = await this.cache.get<AICostData>(cacheKey);
      
      if (cached) {
        debugLog.info('AICostService', 'Using cached AI cost data');
        return cached;
      }

      // Get model pricing
      const modelPricing = CostCalculator.getModelPricing(model);
      
      // Estimate task frequency and complexity
      const taskEstimation = CostCalculator.estimateTaskFrequency(
        profile.occupation,
        profile.experience
      );

      // Calculate annual costs
      const annualCosts = CostCalculator.calculateAICost(
        modelPricing,
        {
          tokensPerTask: taskEstimation.tokensPerTask,
          tasksPerDay: taskEstimation.tasksPerDay,
        }
      );

      // Build comprehensive AI cost data
      const aiCostData: AICostData = {
        modelPricing: {
          promptTokenCost: modelPricing.promptTokenCost,
          completionTokenCost: modelPricing.completionTokenCost,
          model,
        },
        taskEstimation: {
          tokensPerTask: taskEstimation.tokensPerTask,
          tasksPerDay: taskEstimation.tasksPerDay,
          workingDaysPerYear: 250,
        },
        annualCosts: {
          tokenCosts: annualCosts.tokenCosts,
          infrastructureCosts: annualCosts.infrastructure,
          maintenanceCosts: annualCosts.maintenance,
          total: annualCosts.total,
        },
        confidence: this.calculateCostConfidence(profile, taskEstimation.automationPotential),
      };

      // Cache the result
      await this.cache.set(cacheKey, aiCostData, 60 * 60 * 1000); // 1 hour cache

      debugLog.success('AICostService', 'Successfully calculated AI costs', {
        totalAnnualCost: aiCostData.annualCosts.total,
        tokenCosts: aiCostData.annualCosts.tokenCosts,
        confidence: aiCostData.confidence
      });

      return aiCostData;
    } catch (error) {
      debugLog.error('AICostService', 'Error calculating AI costs', error);
      return null;
    }
  }

  // Calculate costs for multiple models for comparison
  async calculateMultiModelCosts(
    profile: UserProfile,
    models: string[]
  ): Promise<Record<string, AICostData>> {
    const results: Record<string, AICostData> = {};

    for (const model of models) {
      const costData = await this.calculateAICosts(profile, model);
      if (costData) {
        results[model] = costData;
      }
    }

    return results;
  }

  // Get detailed cost breakdown for visualization
  async getCostBreakdown(profile: UserProfile, model: string): Promise<{
    daily: { tokenCosts: number; infrastructure: number; total: number };
    monthly: { tokenCosts: number; infrastructure: number; total: number };
    annual: { tokenCosts: number; infrastructure: number; total: number };
  } | null> {
    const aiCostData = await this.calculateAICosts(profile, model);
    if (!aiCostData) return null;

    const dailyTokenCosts = aiCostData.annualCosts.tokenCosts / 250; // Working days
    const dailyInfrastructure = aiCostData.annualCosts.infrastructureCosts / 365; // All days
    
    const monthlyTokenCosts = aiCostData.annualCosts.tokenCosts / 12;
    const monthlyInfrastructure = aiCostData.annualCosts.infrastructureCosts / 12;

    return {
      daily: {
        tokenCosts: Math.round(dailyTokenCosts * 100) / 100,
        infrastructure: Math.round(dailyInfrastructure * 100) / 100,
        total: Math.round((dailyTokenCosts + dailyInfrastructure) * 100) / 100,
      },
      monthly: {
        tokenCosts: Math.round(monthlyTokenCosts),
        infrastructure: Math.round(monthlyInfrastructure),
        total: Math.round(monthlyTokenCosts + monthlyInfrastructure),
      },
      annual: {
        tokenCosts: aiCostData.annualCosts.tokenCosts,
        infrastructure: aiCostData.annualCosts.infrastructureCosts,
        total: aiCostData.annualCosts.total,
      },
    };
  }

  // Estimate ROI timeline based on cost savings
  calculateROITimeline(
    aiCosts: AICostData,
    humanSalaryCost: number,
    implementationCost: number = 10000
  ): {
    monthlyROI: number;
    breakEvenMonths: number;
    yearOneROI: number;
    threeYearROI: number;
  } {
    const monthlySavings = (humanSalaryCost - aiCosts.annualCosts.total) / 12;
    const breakEvenMonths = monthlySavings > 0 ? implementationCost / monthlySavings : Infinity;
    
    const yearOneSavings = (humanSalaryCost - aiCosts.annualCosts.total) - implementationCost;
    const yearOneROI = implementationCost > 0 ? (yearOneSavings / implementationCost) * 100 : 0;
    
    const threeYearSavings = (humanSalaryCost - aiCosts.annualCosts.total) * 3 - implementationCost;
    const threeYearROI = implementationCost > 0 ? (threeYearSavings / implementationCost) * 100 : 0;

    return {
      monthlyROI: Math.round(monthlySavings),
      breakEvenMonths: Math.round(breakEvenMonths * 10) / 10,
      yearOneROI: Math.round(yearOneROI * 10) / 10,
      threeYearROI: Math.round(threeYearROI * 10) / 10,
    };
  }

  // Get scaling factors for different usage scenarios
  getScalingScenarios(baseAICosts: AICostData): {
    conservative: AICostData;
    moderate: AICostData;
    aggressive: AICostData;
  } {
    const createScaledCosts = (multiplier: number): AICostData => ({
      ...baseAICosts,
      taskEstimation: {
        ...baseAICosts.taskEstimation,
        tasksPerDay: Math.round(baseAICosts.taskEstimation.tasksPerDay * multiplier),
      },
      annualCosts: {
        tokenCosts: Math.round(baseAICosts.annualCosts.tokenCosts * multiplier),
        infrastructureCosts: baseAICosts.annualCosts.infrastructureCosts, // Infrastructure doesn't scale linearly
        maintenanceCosts: Math.round(baseAICosts.annualCosts.maintenanceCosts * Math.sqrt(multiplier)),
        total: Math.round(
          (baseAICosts.annualCosts.tokenCosts * multiplier) +
          baseAICosts.annualCosts.infrastructureCosts +
          (baseAICosts.annualCosts.maintenanceCosts * Math.sqrt(multiplier))
        ),
      },
      confidence: baseAICosts.confidence * (1 - (multiplier - 1) * 0.1), // Reduce confidence for extreme scenarios
    });

    return {
      conservative: createScaledCosts(0.7), // 70% of estimated usage
      moderate: baseAICosts, // Base scenario
      aggressive: createScaledCosts(1.5), // 150% of estimated usage
    };
  }

  private calculateCostConfidence(profile: UserProfile, automationPotential: number): number {
    let confidence = 0.8; // Base confidence

    // Adjust based on occupation predictability
    const predictableOccupations = [
      'data-analyst', 'content-writer', 'customer-support', 
      'financial-analyst', 'accountant'
    ];
    
    if (predictableOccupations.some(occ => profile.occupation.toLowerCase().includes(occ))) {
      confidence += 0.1;
    }

    // Adjust based on automation potential
    if (automationPotential > 0.8) {
      confidence += 0.05;
    } else if (automationPotential < 0.5) {
      confidence -= 0.1;
    }

    // Adjust based on experience level (more experienced = more predictable costs)
    if (profile.experience.includes('senior') || profile.experience.includes('lead')) {
      confidence += 0.05;
    } else if (profile.experience.includes('entry') || profile.experience.includes('junior')) {
      confidence -= 0.05;
    }

    return Math.max(0.5, Math.min(0.95, confidence));
  }

  // Get available models with their characteristics
  getAvailableModels(): Array<{
    id: string;
    name: string;
    description: string;
    costLevel: 'free' | 'low' | 'medium' | 'high';
    capabilities: string[];
  }> {
    return [
      {
        id: 'qwen/qwen3-coder:free',
        name: 'Qwen3 Coder (Free)',
        description: 'Optimized for coding tasks, completely free',
        costLevel: 'free',
        capabilities: ['Code Generation', 'Code Review', 'Documentation', 'Debugging'],
      },
      {
        id: 'z-ai/glm-4.5-air:free',
        name: 'GLM 4.5 Air (Free)',
        description: 'Lightweight model for general tasks',
        costLevel: 'free',
        capabilities: ['Text Generation', 'Analysis', 'Summarization', 'Q&A'],
      },
      {
        id: 'moonshotai/kimi-k2:free',
        name: 'Kimi K2 (Free)',
        description: 'Advanced reasoning and code synthesis',
        costLevel: 'free',
        capabilities: ['Complex Reasoning', 'Code Synthesis', 'Problem Solving'],
      },
      {
        id: 'openai/gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: 'Fast and cost-effective for most tasks',
        costLevel: 'low',
        capabilities: ['General Purpose', 'Fast Response', 'Good Quality'],
      },
      {
        id: 'anthropic/claude-3-sonnet',
        name: 'Claude 3 Sonnet',
        description: 'Balanced performance and cost',
        costLevel: 'medium',
        capabilities: ['High Quality', 'Safety', 'Complex Tasks'],
      },
    ];
  }

  // Clear AI cost cache
  async clearCache(): Promise<void> {
    await this.cache.clear();
  }
}