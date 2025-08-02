// Service for LLM-powered cost analysis insights

import { OpenRouterProvider } from '../providers';
import { 
  UserProfile, 
  SalaryData, 
  AICostData, 
  CostAnalysisInsights,
  OpenRouterCostRequest,
  CostAnalysisContext 
} from '../types';
import { debugLog } from '@/components/debug/DebugConsole';

export class LLMAnalysisService {
  private openRouterProvider: OpenRouterProvider;

  constructor(apiKey: string) {
    this.openRouterProvider = new OpenRouterProvider(apiKey);
  }

  // Generate comprehensive cost analysis insights
  async generateAnalysis(
    profile: UserProfile,
    salaryData: SalaryData,
    aiCostData: AICostData
  ): Promise<CostAnalysisInsights | null> {
    try {
      debugLog.info('LLMAnalysisService', 'Generating cost analysis insights', {
        occupation: profile.occupation,
        humanCost: salaryData.median,
        aiCost: aiCostData.annualCosts.total
      });

      // Build context for analysis
      const context = this.buildAnalysisContext(profile, salaryData);

      // Create analysis request
      const request: OpenRouterCostRequest = {
        occupation: profile.occupation,
        industry: profile.industry,
        tasks: this.getTypicalTasks(profile.occupation),
        humanSalary: salaryData.median,
        aiCosts: {
          tokenCosts: {
            promptTokens: Math.round(aiCostData.taskEstimation.tokensPerTask * 0.7 * aiCostData.taskEstimation.tasksPerDay * 250),
            completionTokens: Math.round(aiCostData.taskEstimation.tokensPerTask * 0.3 * aiCostData.taskEstimation.tasksPerDay * 250),
            costPerPromptToken: aiCostData.modelPricing.promptTokenCost,
            costPerCompletionToken: aiCostData.modelPricing.completionTokenCost,
            totalTokenCost: aiCostData.annualCosts.tokenCosts,
          },
          infrastructureCosts: {
            monthly: aiCostData.annualCosts.infrastructureCosts / 12,
            annual: aiCostData.annualCosts.infrastructureCosts,
          },
          totalAnnualCost: aiCostData.annualCosts.total,
        },
        context,
      };

      // Generate analysis using LLM
      const response = await this.openRouterProvider.generateCostAnalysis(request);
      
      if (!response) {
        debugLog.error('LLMAnalysisService', 'Failed to generate analysis from LLM');
        return this.generateFallbackAnalysis(profile, salaryData, aiCostData);
      }

      // Build insights object
      const insights: CostAnalysisInsights = {
        summary: response.analysis,
        keyFindings: response.insights,
        recommendations: response.recommendations,
        riskFactors: this.generateRiskFactors(profile, salaryData, aiCostData),
        assumptions: this.generateAssumptions(profile, aiCostData),
        confidence: Math.min(response.confidence, Math.min(salaryData.confidence, aiCostData.confidence)),
        sources: this.buildSourcesList(salaryData, response.sources),
      };

      debugLog.success('LLMAnalysisService', 'Successfully generated analysis insights', {
        findingsCount: insights.keyFindings.length,
        recommendationsCount: insights.recommendations.length,
        confidence: insights.confidence
      });

      return insights;
    } catch (error) {
      debugLog.error('LLMAnalysisService', 'Error generating analysis insights', error);
      return this.generateFallbackAnalysis(profile, salaryData, aiCostData);
    }
  }

  // Generate task frequency analysis
  async analyzeTaskFrequency(profile: UserProfile): Promise<{
    dailyTasks: number;
    automationPotential: number;
    confidence: number;
  } | null> {
    try {
      const tasks = this.getTypicalTasks(profile.occupation);
      
      return await this.openRouterProvider.estimateTaskFrequency(
        profile.occupation,
        profile.industry,
        tasks
      );
    } catch (error) {
      debugLog.error('LLMAnalysisService', 'Error analyzing task frequency', error);
      return null;
    }
  }

  private buildAnalysisContext(profile: UserProfile, salaryData: SalaryData): CostAnalysisContext {
    return {
      userProfile: {
        experience: profile.experience,
        location: profile.location,
        skills: profile.skills,
      },
      industryData: {
        averageSalary: this.getIndustryAverageSalary(profile.industry),
        growthRate: this.getIndustryGrowthRate(profile.industry),
        automationRisk: this.getAutomationRisk(profile.occupation),
      },
      marketData: {
        demandTrend: this.getMarketDemandTrend(profile.occupation),
        competitionLevel: this.getCompetitionLevel(profile.occupation),
      },
    };
  }

  private getTypicalTasks(occupation: string): string[] {
    const taskMappings: Record<string, string[]> = {
      'software-developer': [
        'Write and review code',
        'Debug applications',
        'Design software architecture',
        'Write technical documentation',
        'Participate in code reviews',
        'Implement new features',
        'Fix bugs and issues',
        'Optimize performance',
      ],
      'data-scientist': [
        'Analyze large datasets',
        'Build predictive models',
        'Create data visualizations',
        'Write analysis reports',
        'Clean and preprocess data',
        'Perform statistical analysis',
        'Present findings to stakeholders',
        'Develop data pipelines',
      ],
      'content-writer': [
        'Research topics and trends',
        'Write articles and blog posts',
        'Edit and proofread content',
        'Optimize content for SEO',
        'Create social media content',
        'Collaborate with marketing teams',
        'Update website content',
        'Develop content strategies',
      ],
      'financial-analyst': [
        'Analyze financial data',
        'Create financial models',
        'Prepare reports and presentations',
        'Monitor market trends',
        'Evaluate investment opportunities',
        'Conduct risk assessments',
        'Update financial forecasts',
        'Support budget planning',
      ],
      'customer-support': [
        'Respond to customer inquiries',
        'Troubleshoot technical issues',
        'Process refunds and returns',
        'Update customer records',
        'Escalate complex issues',
        'Create help documentation',
        'Monitor customer satisfaction',
        'Train new team members',
      ],
    };

    const normalizedOccupation = occupation.toLowerCase().replace(/\s+/g, '-');
    return taskMappings[normalizedOccupation] || [
      'Complete daily work tasks',
      'Communicate with team members',
      'Attend meetings and calls',
      'Review and analyze information',
      'Create reports and documentation',
      'Solve problems and make decisions',
    ];
  }

  private generateRiskFactors(profile: UserProfile, salaryData: SalaryData, aiCostData: AICostData): string[] {
    const risks: string[] = [];

    // Data quality risks
    if (salaryData.confidence < 0.8) {
      risks.push('Salary data has limited reliability - actual costs may vary significantly');
    }

    if (aiCostData.confidence < 0.8) {
      risks.push('AI cost estimates are based on limited data - actual usage may differ');
    }

    // Implementation risks
    risks.push('AI implementation requires significant upfront investment and training');
    risks.push('Human oversight and quality control will still be necessary');

    // Market risks
    if (profile.occupation.includes('creative') || profile.occupation.includes('strategic')) {
      risks.push('Creative and strategic tasks may be difficult to fully automate');
    }

    // Technology risks
    risks.push('AI model pricing and capabilities may change over time');
    risks.push('Integration complexity may increase implementation costs');

    return risks;
  }

  private generateAssumptions(profile: UserProfile, aiCostData: AICostData): string[] {
    return [
      `Estimated ${aiCostData.taskEstimation.tasksPerDay} automatable tasks per day`,
      `${aiCostData.taskEstimation.tokensPerTask} tokens per task on average`,
      '250 working days per year',
      '30% benefits and overhead costs for human workers',
      'AI infrastructure costs remain stable',
      'No major changes in job requirements or technology',
      'Successful AI implementation with minimal downtime',
    ];
  }

  private buildSourcesList(salaryData: SalaryData, llmSources: string[]): string[] {
    const sources = [];

    if (salaryData.source === 'bls') {
      sources.push('U.S. Bureau of Labor Statistics');
    } else if (salaryData.source === 'payscale') {
      sources.push('PayScale Salary Database');
    } else {
      sources.push('Industry Salary Estimates');
    }

    sources.push('OpenRouter API Pricing');
    sources.push(...llmSources);

    return sources;
  }

  private generateFallbackAnalysis(
    profile: UserProfile,
    salaryData: SalaryData,
    aiCostData: AICostData
  ): CostAnalysisInsights {
    const savings = salaryData.median - aiCostData.annualCosts.total;
    const savingsPercentage = (savings / salaryData.median) * 100;

    let summary = '';
    if (savings > 0) {
      summary = `AI automation could potentially save $${savings.toLocaleString()} annually (${savingsPercentage.toFixed(1)}% reduction) compared to human worker costs for ${profile.occupation} roles.`;
    } else {
      summary = `AI automation may cost $${Math.abs(savings).toLocaleString()} more annually than human workers for ${profile.occupation} roles, but could provide other benefits like 24/7 availability and scalability.`;
    }

    return {
      summary,
      keyFindings: [
        `Annual human cost: $${salaryData.median.toLocaleString()}`,
        `Annual AI cost: $${aiCostData.annualCosts.total.toLocaleString()}`,
        `Potential savings: $${savings.toLocaleString()}`,
        `Automation confidence: ${(aiCostData.confidence * 100).toFixed(0)}%`,
      ],
      recommendations: [
        'Consider a pilot program to test AI automation effectiveness',
        'Evaluate the quality and accuracy of AI-generated work',
        'Plan for human oversight and quality control processes',
        'Monitor AI costs and usage patterns closely',
      ],
      riskFactors: this.generateRiskFactors(profile, salaryData, aiCostData),
      assumptions: this.generateAssumptions(profile, aiCostData),
      confidence: 0.7, // Lower confidence for fallback analysis
      sources: this.buildSourcesList(salaryData, ['Fallback Analysis']),
    };
  }

  // Helper methods for context building
  private getIndustryAverageSalary(industry: string): number {
    const averages: Record<string, number> = {
      'technology': 95000,
      'finance': 85000,
      'healthcare': 75000,
      'education': 55000,
      'retail': 45000,
      'manufacturing': 65000,
      'consulting': 90000,
      'media': 60000,
    };

    return averages[industry.toLowerCase()] || 70000;
  }

  private getIndustryGrowthRate(industry: string): number {
    const growthRates: Record<string, number> = {
      'technology': 0.08,
      'finance': 0.03,
      'healthcare': 0.05,
      'education': 0.02,
      'retail': 0.01,
      'manufacturing': 0.02,
      'consulting': 0.06,
      'media': 0.01,
    };

    return growthRates[industry.toLowerCase()] || 0.03;
  }

  private getAutomationRisk(occupation: string): number {
    const risks: Record<string, number> = {
      'software-developer': 0.6,
      'data-scientist': 0.7,
      'content-writer': 0.8,
      'financial-analyst': 0.8,
      'customer-support': 0.9,
      'sales-representative': 0.4,
      'hr-specialist': 0.6,
      'project-manager': 0.3,
    };

    const normalized = occupation.toLowerCase().replace(/\s+/g, '-');
    return risks[normalized] || 0.6;
  }

  private getMarketDemandTrend(occupation: string): 'increasing' | 'stable' | 'decreasing' {
    const trends: Record<string, 'increasing' | 'stable' | 'decreasing'> = {
      'software-developer': 'increasing',
      'data-scientist': 'increasing',
      'content-writer': 'stable',
      'financial-analyst': 'stable',
      'customer-support': 'decreasing',
      'sales-representative': 'stable',
    };

    const normalized = occupation.toLowerCase().replace(/\s+/g, '-');
    return trends[normalized] || 'stable';
  }

  private getCompetitionLevel(occupation: string): 'low' | 'medium' | 'high' {
    const competition: Record<string, 'low' | 'medium' | 'high'> = {
      'software-developer': 'high',
      'data-scientist': 'medium',
      'content-writer': 'high',
      'financial-analyst': 'medium',
      'customer-support': 'low',
      'sales-representative': 'medium',
    };

    const normalized = occupation.toLowerCase().replace(/\s+/g, '-');
    return competition[normalized] || 'medium';
  }
}