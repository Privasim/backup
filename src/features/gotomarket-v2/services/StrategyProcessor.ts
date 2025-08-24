import { GoToMarketStrategies, MarketingStrategy, SalesChannel, PricingStrategy, DistributionPlan, TimelinePhase, ToolRecommendation } from '../types';

export class StrategyProcessor {
  static processAIResponse(rawResponse: string): GoToMarketStrategies {
    try {
      // Clean the response - remove markdown code blocks if present
      const cleanedResponse = this.cleanJsonResponse(rawResponse);
      
      // Parse JSON
      const parsed = JSON.parse(cleanedResponse);
      
      // Validate and transform the response
      return this.transformToGoToMarketStrategies(parsed);
    } catch (error) {
      console.error('Error processing AI response:', error);
      throw new Error('Failed to process AI response. Please try again.');
    }
  }

  private static cleanJsonResponse(response: string): string {
    // Remove markdown code blocks
    let cleaned = response.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Find the first { and last } to extract JSON
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    
    return cleaned.trim();
  }

  private static transformToGoToMarketStrategies(parsed: any): GoToMarketStrategies {
    const id = `gtm-${Date.now()}`;
    const generatedAt = new Date().toISOString();
    
    return {
      id,
      businessContext: {
        businessIdea: parsed.businessContext?.businessIdea || 'Business Plan',
        targetMarket: parsed.businessContext?.targetMarket || 'General Market',
        valueProposition: parsed.businessContext?.valueProposition || 'Value Proposition',
        implementationPhases: parsed.businessContext?.implementationPhases || [],
        goals: parsed.businessContext?.goals || [],
        constraints: parsed.businessContext?.constraints || []
      },
      marketingStrategies: this.processMarketingStrategies(parsed.marketingStrategies || []),
      salesChannels: this.processSalesChannels(parsed.salesChannels || []),
      pricingStrategies: this.processPricingStrategies(parsed.pricingStrategies || []),
      distributionPlans: this.processDistributionPlans(parsed.distributionPlans || []),
      implementationTimeline: this.processImplementationTimeline(parsed.implementationTimeline || []),
      toolRecommendations: this.processToolRecommendations(parsed.toolRecommendations || []),
      generatedAt,
      version: '1.0'
    };
  }

  private static processMarketingStrategies(strategies: any[]): MarketingStrategy[] {
    return strategies.map((strategy, index) => ({
      id: `marketing-${index + 1}`,
      type: strategy.type || 'digital',
      title: strategy.title || 'Marketing Strategy',
      description: strategy.description || '',
      tactics: (strategy.tactics || []).map((tactic: any, tacticIndex: number) => ({
        id: `tactic-${index + 1}-${tacticIndex + 1}`,
        name: tactic.name || 'Marketing Tactic',
        description: tactic.description || '',
        estimatedCost: tactic.estimatedCost || '$1,000',
        timeframe: tactic.timeframe || '4 weeks',
        difficulty: tactic.difficulty || 'medium'
      })),
      budget: {
        min: strategy.budget?.min || '$1,000',
        max: strategy.budget?.max || '$5,000',
        currency: strategy.budget?.currency || 'USD'
      },
      timeline: strategy.timeline || '3 months',
      expectedROI: strategy.expectedROI || '200%',
      difficulty: strategy.difficulty || 'medium',
      completed: false
    }));
  }

  private static processSalesChannels(channels: any[]): SalesChannel[] {
    return channels.map((channel, index) => ({
      id: `sales-${index + 1}`,
      name: channel.name || 'Sales Channel',
      type: channel.type || 'online',
      description: channel.description || '',
      implementationSteps: (channel.implementationSteps || []).map((step: any, stepIndex: number) => ({
        id: `step-${index + 1}-${stepIndex + 1}`,
        title: step.title || 'Implementation Step',
        description: step.description || '',
        estimatedTime: step.estimatedTime || '2 weeks',
        dependencies: step.dependencies || []
      })),
      costStructure: {
        setup: channel.costStructure?.setup || '$500',
        monthly: channel.costStructure?.monthly || '$100',
        commission: channel.costStructure?.commission || '5%',
        notes: channel.costStructure?.notes || ''
      },
      expectedReach: channel.expectedReach || '100 customers/month',
      suitabilityScore: channel.suitabilityScore || 75,
      completed: false
    }));
  }

  private static processPricingStrategies(strategies: any[]): PricingStrategy[] {
    return strategies.map((strategy, index) => ({
      id: `pricing-${index + 1}`,
      model: strategy.model || 'tiered',
      title: strategy.title || 'Pricing Strategy',
      description: strategy.description || '',
      pricePoints: (strategy.pricePoints || []).map((point: any) => ({
        tier: point.tier || 'Basic',
        price: point.price || '$29/month',
        features: point.features || [],
        targetSegment: point.targetSegment || 'Small businesses'
      })),
      marketFit: strategy.marketFit || 80,
      competitiveAnalysis: strategy.competitiveAnalysis || 'Competitive pricing analysis',
      completed: false
    }));
  }

  private static processDistributionPlans(plans: any[]): DistributionPlan[] {
    return plans.map((plan, index) => ({
      id: `distribution-${index + 1}`,
      channel: plan.channel || 'Online Distribution',
      strategy: plan.strategy || 'Distribution strategy',
      timeline: plan.timeline || '6 months',
      resources: plan.resources || [],
      expectedOutcome: plan.expectedOutcome || 'Increased market reach'
    }));
  }

  private static processImplementationTimeline(timeline: any[]): TimelinePhase[] {
    return timeline.map((phase: any) => ({
      phase: phase.phase || 'Phase 1',
      startDate: phase.startDate || 'Month 1',
      endDate: phase.endDate || 'Month 3',
      activities: phase.activities || [],
      milestones: phase.milestones || []
    }));
  }

  private static processToolRecommendations(tools: any[]): ToolRecommendation[] {
    return tools.map((tool, index) => ({
      id: `tool-${index + 1}`,
      name: tool.name || 'Marketing Tool',
      category: tool.category || 'Marketing',
      relevanceScore: tool.relevanceScore || 75,
      implementationPriority: tool.implementationPriority || 'medium',
      costEstimate: tool.costEstimate || '$50/month',
      integrationComplexity: tool.integrationComplexity || 'moderate',
      recommendedFor: tool.recommendedFor || []
    }));
  }

  static validateStrategies(strategies: GoToMarketStrategies): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!strategies.marketingStrategies || strategies.marketingStrategies.length === 0) {
      errors.push('No marketing strategies found');
    }

    if (!strategies.salesChannels || strategies.salesChannels.length === 0) {
      errors.push('No sales channels found');
    }

    if (!strategies.pricingStrategies || strategies.pricingStrategies.length === 0) {
      errors.push('No pricing strategies found');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}