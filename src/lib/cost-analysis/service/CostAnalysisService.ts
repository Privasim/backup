// Main service orchestrator for cost analysis

import { SalaryDataService } from './SalaryDataService';
import { AICostService } from './AICostService';
import { LLMAnalysisService } from './LLMAnalysisService';
import { 
  UserProfile, 
  CostAnalysis, 
  CostAnalysisOptions, 
  CostAnalysisError,
  CostComparison 
} from '../types';
import { CostCalculator } from '../utils/cost-calculations';
import { CostAnalysisCacheManager } from '../utils/cache-manager';
import { debugLog } from '@/components/debug/DebugConsole';

export class CostAnalysisService {
  private salaryService: SalaryDataService;
  private aiCostService: AICostService;
  private llmService?: LLMAnalysisService;
  private cache: CostAnalysisCacheManager;

  constructor(apiKeys: { payScale?: string; openRouter?: string } = {}) {
    this.salaryService = new SalaryDataService(apiKeys.payScale);
    this.aiCostService = new AICostService();
    
    if (apiKeys.openRouter) {
      this.llmService = new LLMAnalysisService(apiKeys.openRouter);
    }
    
    this.cache = new CostAnalysisCacheManager();
  }

  // Main analysis method - orchestrates all cost analysis components
  async analyze(
    profile: UserProfile,
    options: Partial<CostAnalysisOptions> = {}
  ): Promise<CostAnalysis | null> {
    const startTime = Date.now();
    
    try {
      debugLog.info('CostAnalysisService', 'Starting comprehensive cost analysis', {
        occupation: profile.occupation,
        location: profile.location,
        experience: profile.experience
      });

      // Set default options
      const analysisOptions: CostAnalysisOptions = {
        useCache: true,
        cacheTTL: 3600000, // 1 hour
        fallbackToEstimates: true,
        includeInsights: true,
        confidenceThreshold: 0.5,
        ...options,
      };

      // Check cache if enabled
      if (analysisOptions.useCache) {
        const cacheKey = this.cache.generateAnalysisKey(profile);
        const cached = await this.cache.get<CostAnalysis>(cacheKey);
        
        if (cached) {
          debugLog.info('CostAnalysisService', 'Using cached analysis result');
          return cached;
        }
      }

      // Step 1: Get salary data
      debugLog.info('CostAnalysisService', 'Fetching salary data...');
      const salaryData = await this.salaryService.getSalaryData(profile);
      
      if (!salaryData) {
        throw new Error('Failed to retrieve salary data');
      }

      // Step 2: Calculate AI costs
      debugLog.info('CostAnalysisService', 'Calculating AI costs...');
      const model = profile.skills.includes('model') ? 
        profile.skills.find(s => s.includes('model')) || 'qwen/qwen3-coder:free' : 
        'qwen/qwen3-coder:free';
        
      const aiCostData = await this.aiCostService.calculateAICosts(profile, model);
      
      if (!aiCostData) {
        throw new Error('Failed to calculate AI costs');
      }

      // Step 3: Generate cost comparison
      debugLog.info('CostAnalysisService', 'Generating cost comparison...');
      const humanCosts = CostCalculator.calculateHumanCost(salaryData, profile);
      const aiCosts = {
        tokenCosts: aiCostData.annualCosts.tokenCosts,
        infrastructure: aiCostData.annualCosts.infrastructureCosts,
        maintenance: aiCostData.annualCosts.maintenanceCosts,
        total: aiCostData.annualCosts.total,
      };
      
      const comparison = CostCalculator.calculateComparison(humanCosts, aiCosts);

      // Step 4: Generate insights (if LLM service available and requested)
      let insights = null;
      if (this.llmService && analysisOptions.includeInsights) {
        debugLog.info('CostAnalysisService', 'Generating LLM insights...');
        insights = await this.llmService.generateAnalysis(profile, salaryData, aiCostData);
      }

      // If no insights generated, create basic insights
      if (!insights) {
        insights = this.generateBasicInsights(profile, salaryData, aiCostData, comparison);
      }

      // Step 5: Build final analysis result
      const analysis: CostAnalysis = {
        profile,
        salaryData,
        aiCostData,
        comparison,
        insights,
        metadata: {
          analysisDate: new Date().toISOString(),
          version: '1.0.0',
          processingTime: Date.now() - startTime,
        },
      };

      // Validate confidence threshold
      const overallConfidence = CostCalculator.calculateConfidence(
        salaryData.confidence,
        aiCostData.confidence
      );

      if (overallConfidence < analysisOptions.confidenceThreshold) {
        debugLog.warn('CostAnalysisService', 'Analysis confidence below threshold', {
          confidence: overallConfidence,
          threshold: analysisOptions.confidenceThreshold
        });
        
        if (!analysisOptions.fallbackToEstimates) {
          throw new Error(`Analysis confidence (${overallConfidence}) below threshold (${analysisOptions.confidenceThreshold})`);
        }
      }

      // Cache the result
      if (analysisOptions.useCache) {
        const cacheKey = this.cache.generateAnalysisKey(profile);
        await this.cache.set(cacheKey, analysis, analysisOptions.cacheTTL);
      }

      debugLog.success('CostAnalysisService', 'Cost analysis completed successfully', {
        humanCost: humanCosts.total,
        aiCost: aiCosts.total,
        savings: comparison.savings.absolute,
        confidence: overallConfidence,
        processingTime: analysis.metadata.processingTime
      });

      return analysis;
    } catch (error) {
      debugLog.error('CostAnalysisService', 'Cost analysis failed', error);
      
      // Return null instead of throwing if fallback is not enabled
      if (!options.fallbackToEstimates) {
        return null;
      }

      // Try to generate a basic analysis with estimated data
      return this.generateFallbackAnalysis(profile, startTime);
    }
  }

  // Quick cost comparison without full analysis
  async quickComparison(profile: UserProfile): Promise<{
    humanCost: number;
    aiCost: number;
    savings: number;
    confidence: number;
  } | null> {
    try {
      const salaryData = await this.salaryService.getSalaryData(profile);
      const aiCostData = await this.aiCostService.calculateAICosts(profile);

      if (!salaryData || !aiCostData) {
        return null;
      }

      const humanCosts = CostCalculator.calculateHumanCost(salaryData, profile);
      const savings = humanCosts.total - aiCostData.annualCosts.total;
      const confidence = CostCalculator.calculateConfidence(
        salaryData.confidence,
        aiCostData.confidence
      );

      return {
        humanCost: humanCosts.total,
        aiCost: aiCostData.annualCosts.total,
        savings,
        confidence,
      };
    } catch (error) {
      debugLog.error('CostAnalysisService', 'Quick comparison failed', error);
      return null;
    }
  }

  // Get multiple scenarios (conservative, moderate, aggressive)
  async getScenarioAnalysis(profile: UserProfile): Promise<{
    conservative: CostAnalysis | null;
    moderate: CostAnalysis | null;
    aggressive: CostAnalysis | null;
  }> {
    const baseAnalysis = await this.analyze(profile);
    
    if (!baseAnalysis) {
      return { conservative: null, moderate: null, aggressive: null };
    }

    // Generate scaling scenarios for AI costs
    const scenarios = this.aiCostService.getScalingScenarios(baseAnalysis.aiCostData);

    const results = {
      conservative: null as CostAnalysis | null,
      moderate: baseAnalysis,
      aggressive: null as CostAnalysis | null,
    };

    // Generate conservative scenario
    if (scenarios.conservative) {
      const conservativeComparison = CostCalculator.calculateComparison(
        CostCalculator.calculateHumanCost(baseAnalysis.salaryData, profile),
        {
          tokenCosts: scenarios.conservative.annualCosts.tokenCosts,
          infrastructure: scenarios.conservative.annualCosts.infrastructureCosts,
          maintenance: scenarios.conservative.annualCosts.maintenanceCosts,
          total: scenarios.conservative.annualCosts.total,
        }
      );

      results.conservative = {
        ...baseAnalysis,
        aiCostData: scenarios.conservative,
        comparison: conservativeComparison,
      };
    }

    // Generate aggressive scenario
    if (scenarios.aggressive) {
      const aggressiveComparison = CostCalculator.calculateComparison(
        CostCalculator.calculateHumanCost(baseAnalysis.salaryData, profile),
        {
          tokenCosts: scenarios.aggressive.annualCosts.tokenCosts,
          infrastructure: scenarios.aggressive.annualCosts.infrastructureCosts,
          maintenance: scenarios.aggressive.annualCosts.maintenanceCosts,
          total: scenarios.aggressive.annualCosts.total,
        }
      );

      results.aggressive = {
        ...baseAnalysis,
        aiCostData: scenarios.aggressive,
        comparison: aggressiveComparison,
      };
    }

    return results;
  }

  private generateBasicInsights(
    profile: UserProfile,
    salaryData: any,
    aiCostData: any,
    comparison: CostComparison
  ) {
    const savings = comparison.savings.absolute;
    const savingsPercentage = comparison.savings.percentage;

    return {
      summary: savings > 0 
        ? `AI automation could save approximately $${Math.abs(savings).toLocaleString()} annually (${Math.abs(savingsPercentage).toFixed(1)}% reduction) for ${profile.occupation} roles.`
        : `AI automation may cost $${Math.abs(savings).toLocaleString()} more annually than human workers, but could provide benefits like scalability and 24/7 availability.`,
      keyFindings: [
        `Human annual cost: ${CostCalculator.formatCurrency(comparison.human.total)}`,
        `AI annual cost: ${CostCalculator.formatCurrency(comparison.ai.total)}`,
        `Potential savings: ${CostCalculator.formatCurrency(savings)}`,
        `Payback period: ${comparison.paybackPeriod === Infinity ? 'N/A' : `${comparison.paybackPeriod} months`}`,
      ],
      recommendations: [
        'Consider starting with a pilot program to test AI effectiveness',
        'Evaluate the quality and accuracy of AI-generated work',
        'Plan for human oversight and quality control processes',
        'Monitor costs and adjust usage patterns as needed',
      ],
      riskFactors: [
        'AI implementation requires upfront investment and training',
        'Quality control and human oversight will still be necessary',
        'Technology costs and capabilities may change over time',
      ],
      assumptions: [
        `${aiCostData.taskEstimation.tasksPerDay} automatable tasks per day`,
        '250 working days per year',
        '30% benefits and overhead for human workers',
        'Stable AI pricing and performance',
      ],
      confidence: CostCalculator.calculateConfidence(salaryData.confidence, aiCostData.confidence),
      sources: [
        salaryData.source === 'bls' ? 'U.S. Bureau of Labor Statistics' : 
        salaryData.source === 'payscale' ? 'PayScale Database' : 'Industry Estimates',
        'OpenRouter API Pricing',
        'Internal Cost Models',
      ],
    };
  }

  private async generateFallbackAnalysis(profile: UserProfile, startTime: number): Promise<CostAnalysis | null> {
    try {
      debugLog.warn('CostAnalysisService', 'Generating fallback analysis with estimated data');
      
      // Use estimated data for fallback
      const estimatedSalary = {
        median: 70000, // Default estimate
        currency: 'USD',
        source: 'estimated' as const,
        confidence: 0.5,
        lastUpdated: new Date().toISOString(),
      };

      const estimatedAICost = {
        modelPricing: {
          promptTokenCost: 0,
          completionTokenCost: 0,
          model: 'qwen/qwen3-coder:free',
        },
        taskEstimation: {
          tokensPerTask: 600,
          tasksPerDay: 10,
          workingDaysPerYear: 250,
        },
        annualCosts: {
          tokenCosts: 0,
          infrastructureCosts: 600,
          maintenanceCosts: 1200,
          total: 1800,
        },
        confidence: 0.5,
      };

      const humanCosts = CostCalculator.calculateHumanCost(estimatedSalary, profile);
      const comparison = CostCalculator.calculateComparison(humanCosts, estimatedAICost.annualCosts);
      const insights = this.generateBasicInsights(profile, estimatedSalary, estimatedAICost, comparison);

      return {
        profile,
        salaryData: estimatedSalary,
        aiCostData: estimatedAICost,
        comparison,
        insights,
        metadata: {
          analysisDate: new Date().toISOString(),
          version: '1.0.0-fallback',
          processingTime: Date.now() - startTime,
        },
      };
    } catch (error) {
      debugLog.error('CostAnalysisService', 'Fallback analysis also failed', error);
      return null;
    }
  }

  // Utility methods
  getCacheStats() {
    return this.cache.getStats();
  }

  async clearCache(): Promise<void> {
    await this.cache.clear();
  }

  async clearAllCaches(): Promise<void> {
    await Promise.all([
      this.cache.clear(),
      this.salaryService.clearCache(),
      this.aiCostService.clearCache(),
    ]);
  }
}