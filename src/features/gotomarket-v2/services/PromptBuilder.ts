import { ImplementationPlan } from '@/features/implementation-plan/types';
import { BusinessContext, GenerationOptions } from '../types';

export class PromptBuilder {
  static buildGoToMarketPrompt(
    implementationPlan: ImplementationPlan,
    options: GenerationOptions = {}
  ): string {
    const businessContext = this.extractBusinessContext(implementationPlan);
    const focusAreas = options.focusAreas || ['marketing', 'sales', 'pricing', 'distribution'];
    
    return `You are a go-to-market strategy expert. Based on the following business implementation plan, create a comprehensive go-to-market strategy.

BUSINESS CONTEXT:
- Business Idea: ${businessContext.businessIdea}
- Target Market: ${businessContext.targetMarket}
- Value Proposition: ${businessContext.valueProposition}
- Goals: ${businessContext.goals.join(', ')}

IMPLEMENTATION PHASES:
${businessContext.implementationPhases.map(phase => 
  `- ${phase.name}: ${phase.objectives.join(', ')}`
).join('\n')}

FOCUS AREAS: ${focusAreas.join(', ')}
BUDGET RANGE: ${options.budgetRange || 'medium'}
TIMEFRAME: ${options.timeframe || 'short-term'}

Please provide a detailed go-to-market strategy in JSON format with the following structure:

{
  "marketingStrategies": [
    {
      "type": "digital|content|social|traditional",
      "title": "Strategy Name",
      "description": "Detailed description",
      "tactics": [
        {
          "name": "Tactic Name",
          "description": "Tactic description",
          "estimatedCost": "$X,XXX",
          "timeframe": "X weeks/months",
          "difficulty": "low|medium|high"
        }
      ],
      "budget": {
        "min": "$X,XXX",
        "max": "$X,XXX",
        "currency": "USD"
      },
      "timeline": "X months",
      "expectedROI": "X%",
      "difficulty": "low|medium|high"
    }
  ],
  "salesChannels": [
    {
      "name": "Channel Name",
      "type": "direct|retail|online|partner",
      "description": "Channel description",
      "implementationSteps": [
        {
          "title": "Step Title",
          "description": "Step description",
          "estimatedTime": "X weeks"
        }
      ],
      "costStructure": {
        "setup": "$X,XXX",
        "monthly": "$XXX",
        "commission": "X%"
      },
      "expectedReach": "X customers/month",
      "suitabilityScore": 85
    }
  ],
  "pricingStrategies": [
    {
      "model": "freemium|subscription|one-time|tiered",
      "title": "Pricing Model Name",
      "description": "Pricing description",
      "pricePoints": [
        {
          "tier": "Basic|Pro|Enterprise",
          "price": "$XX/month",
          "features": ["Feature 1", "Feature 2"],
          "targetSegment": "Target audience"
        }
      ],
      "marketFit": 90,
      "competitiveAnalysis": "Analysis text"
    }
  ],
  "distributionPlans": [
    {
      "channel": "Distribution channel",
      "strategy": "Distribution strategy",
      "timeline": "X months",
      "resources": ["Resource 1", "Resource 2"],
      "expectedOutcome": "Expected result"
    }
  ],
  "implementationTimeline": [
    {
      "phase": "Phase 1",
      "startDate": "Month 1",
      "endDate": "Month 3",
      "activities": ["Activity 1", "Activity 2"],
      "milestones": ["Milestone 1", "Milestone 2"]
    }
  ],
  "toolRecommendations": [
    {
      "name": "Tool Name",
      "category": "Marketing|Sales|Analytics",
      "relevanceScore": 85,
      "implementationPriority": "high|medium|low",
      "costEstimate": "$XX/month",
      "integrationComplexity": "simple|moderate|complex",
      "recommendedFor": ["Use case 1", "Use case 2"]
    }
  ]
}

Ensure all strategies are:
1. Specific to the business context
2. Actionable with clear next steps
3. Budget-conscious based on the specified range
4. Aligned with the implementation timeline
5. Realistic and achievable

${options.customPrompt ? `\nADDITIONAL REQUIREMENTS:\n${options.customPrompt}` : ''}`;
  }

  static buildMarketingPrompt(context: BusinessContext): string {
    return `Create detailed marketing strategies for: ${context.businessIdea}
Target Market: ${context.targetMarket}
Value Proposition: ${context.valueProposition}

Focus on digital marketing, content marketing, and customer acquisition strategies.`;
  }

  static buildSalesPrompt(context: BusinessContext): string {
    return `Create sales channel strategies for: ${context.businessIdea}
Target Market: ${context.targetMarket}

Focus on direct sales, online sales, and partnership channels.`;
  }

  static buildPricingPrompt(context: BusinessContext): string {
    return `Create pricing strategies for: ${context.businessIdea}
Target Market: ${context.targetMarket}
Value Proposition: ${context.valueProposition}

Consider freemium, subscription, and tiered pricing models.`;
  }

  private static extractBusinessContext(plan: ImplementationPlan): BusinessContext {
    return {
      businessIdea: plan.meta.title || 'Business Implementation Plan',
      targetMarket: this.extractTargetMarket(plan),
      valueProposition: this.extractValueProposition(plan),
      implementationPhases: plan.phases.map(phase => ({
        id: phase.id,
        name: phase.name,
        objectives: phase.objectives || [],
        duration: phase.duration
      })),
      goals: plan.overview.goals || [],
      constraints: this.extractConstraints(plan)
    };
  }

  private static extractTargetMarket(plan: ImplementationPlan): string {
    // Extract target market from plan content
    const textContent = plan.textContent || '';
    const marketKeywords = ['target market', 'audience', 'customers', 'users'];
    
    for (const keyword of marketKeywords) {
      const regex = new RegExp(`${keyword}[^.]*`, 'i');
      const match = textContent.match(regex);
      if (match) {
        return match[0].substring(0, 200);
      }
    }
    
    return 'General market';
  }

  private static extractValueProposition(plan: ImplementationPlan): string {
    // Extract value proposition from plan content
    const textContent = plan.textContent || '';
    const valueKeywords = ['value proposition', 'unique selling', 'benefits', 'solves'];
    
    for (const keyword of valueKeywords) {
      const regex = new RegExp(`${keyword}[^.]*`, 'i');
      const match = textContent.match(regex);
      if (match) {
        return match[0].substring(0, 200);
      }
    }
    
    return 'Innovative solution';
  }

  private static extractConstraints(plan: ImplementationPlan): string[] {
    // Extract constraints from plan content
    const constraints: string[] = [];
    const textContent = plan.textContent || '';
    
    if (textContent.includes('budget')) constraints.push('Budget limitations');
    if (textContent.includes('time')) constraints.push('Time constraints');
    if (textContent.includes('resource')) constraints.push('Resource limitations');
    
    return constraints;
  }
}