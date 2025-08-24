import { OpenRouterClient } from '@/lib/openrouter/client';
import { BusinessSuggestion } from '@/components/chatbox/types';
import { ImplementationPlan } from '@/features/implementation-plan/types';
import { 
  MarketingStrategy, 
  SalesChannel, 
  PricingStrategy, 
  ImplementationAlignment,
  ToolRecommendation,
  MarketingAnalysisResponse 
} from '../types';
import { 
  validateMarketingAnalysisResponse, 
  sanitizeInput, 
  validateApiKey, 
  validateModel 
} from '../utils/validation';

export class GoToMarketService {
  private client: OpenRouterClient;
  private cacheManager?: any; // Will integrate with existing cache manager

  constructor(apiKey: string, cacheManager?: any) {
    this.client = new OpenRouterClient(apiKey);
    this.cacheManager = cacheManager;
  }

  async generateMarketingStrategies(
    suggestion: BusinessSuggestion,
    model: string,
    implementationPlan?: ImplementationPlan
  ): Promise<MarketingStrategy[]> {
    if (!validateApiKey(this.client.apiKey) || !validateModel(model)) {
      throw new Error('Invalid API key or model');
    }

    const cacheKey = `marketing-strategies-${suggestion.id}-${implementationPlan?.meta.ideaId || 'no-plan'}`;
    
    // Check cache first
    if (this.cacheManager) {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) return cached;
    }

    const prompt = this.buildMarketingStrategiesPrompt(suggestion, implementationPlan);
    
    try {
      const response = await this.client.chat({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a marketing strategy expert. Generate comprehensive, actionable marketing strategies in valid JSON format. Focus on practical, implementable tactics with realistic cost estimates and timelines.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const content = response?.choices?.[0]?.message?.content || '';
      const strategies = this.parseMarketingStrategiesResponse(content);
      
      // Cache the result
      if (this.cacheManager) {
        await this.cacheManager.set(cacheKey, strategies, 3600); // 1 hour cache
      }

      return strategies;
    } catch (error) {
      console.error('Failed to generate marketing strategies:', error);
      throw new Error('Failed to generate marketing strategies. Please try again.');
    }
  }

  async generateSalesChannelRecommendations(
    suggestion: BusinessSuggestion,
    model: string
  ): Promise<SalesChannel[]> {
    if (!validateApiKey(this.client.apiKey) || !validateModel(model)) {
      throw new Error('Invalid API key or model');
    }

    const cacheKey = `sales-channels-${suggestion.id}`;
    
    // Check cache first
    if (this.cacheManager) {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) return cached;
    }

    const prompt = this.buildSalesChannelsPrompt(suggestion);
    
    try {
      const response = await this.client.chat({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a sales channel expert. Generate practical sales channel recommendations with detailed implementation steps, cost structures, and suitability scores. Respond in valid JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      const content = response?.choices?.[0]?.message?.content || '';
      const channels = this.parseSalesChannelsResponse(content);
      
      // Cache the result
      if (this.cacheManager) {
        await this.cacheManager.set(cacheKey, channels, 3600); // 1 hour cache
      }

      return channels;
    } catch (error) {
      console.error('Failed to generate sales channels:', error);
      throw new Error('Failed to generate sales channel recommendations. Please try again.');
    }
  }

  async generatePricingStrategies(
    suggestion: BusinessSuggestion,
    model: string
  ): Promise<PricingStrategy[]> {
    if (!validateApiKey(this.client.apiKey) || !validateModel(model)) {
      throw new Error('Invalid API key or model');
    }

    const cacheKey = `pricing-strategies-${suggestion.id}`;
    
    // Check cache first
    if (this.cacheManager) {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) return cached;
    }

    const prompt = this.buildPricingStrategiesPrompt(suggestion);
    
    try {
      const response = await this.client.chat({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a pricing strategy expert. Generate comprehensive pricing strategies with multiple models, competitive analysis, and market fit scores. Respond in valid JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      const content = response?.choices?.[0]?.message?.content || '';
      const strategies = this.parsePricingStrategiesResponse(content);
      
      // Cache the result
      if (this.cacheManager) {
        await this.cacheManager.set(cacheKey, strategies, 3600); // 1 hour cache
      }

      return strategies;
    } catch (error) {
      console.error('Failed to generate pricing strategies:', error);
      throw new Error('Failed to generate pricing strategies. Please try again.');
    }
  }

  async alignWithImplementationPlan(
    marketingStrategies: MarketingStrategy[],
    implementationPlan: ImplementationPlan
  ): Promise<ImplementationAlignment> {
    const alignedPhases = implementationPlan.phases.map(phase => ({
      phaseId: phase.id,
      phaseName: phase.name,
      marketingActivities: this.getRelevantMarketingActivities(phase.name, marketingStrategies),
      milestones: phase.milestones.map(m => m.title)
    }));

    const timeline = implementationPlan.phases.map(phase => ({
      phase: phase.name,
      marketingStart: phase.duration ? `Start of ${phase.name}` : 'TBD',
      marketingEnd: phase.duration ? `End of ${phase.name}` : 'TBD',
      dependencies: phase.objectives
    }));

    return {
      alignedPhases,
      timeline
    };
  }

  private buildMarketingStrategiesPrompt(
    suggestion: BusinessSuggestion,
    implementationPlan?: ImplementationPlan
  ): string {
    const sanitizedTitle = sanitizeInput(suggestion.title);
    const sanitizedDescription = sanitizeInput(suggestion.description);
    const sanitizedCategory = sanitizeInput(suggestion.category);
    const sanitizedTargetMarket = sanitizeInput(suggestion.targetMarket);
    const sanitizedFeatures = suggestion.keyFeatures.map(f => sanitizeInput(f)).join(', ');

    let prompt = `Generate 4 comprehensive marketing strategies for this business:

Business Details:
- Title: ${sanitizedTitle}
- Category: ${sanitizedCategory}
- Description: ${sanitizedDescription}
- Target Market: ${sanitizedTargetMarket}
- Key Features: ${sanitizedFeatures}
- Startup Cost: ${suggestion.estimatedStartupCost}`;

    if (implementationPlan) {
      prompt += `\n\nImplementation Context:
- Current Phase: ${implementationPlan.phases[0]?.name || 'Planning'}
- Timeline: ${implementationPlan.meta.createdAt}
- Goals: ${implementationPlan.overview.goals.join(', ')}`;
    }

    prompt += `

Generate exactly 4 marketing strategies:
1. Digital Marketing (SEO, SEM, Social Media)
2. Content Marketing (Blog, Video, Podcasts)
3. Partnership Marketing (Affiliates, Collaborations)
4. Traditional Marketing (PR, Events, Print)

For each strategy, provide:
- Specific tactics (3-5 actionable items)
- Estimated costs (realistic budget ranges)
- Timeframes (implementation timeline)
- Expected ROI (percentage or description)
- Implementation difficulty (low/medium/high)
- Priority score (1-10)

Respond with valid JSON in this exact format:
{
  "strategies": [
    {
      "type": "digital",
      "title": "Digital Marketing Strategy",
      "description": "Comprehensive digital presence...",
      "tactics": [
        {
          "name": "SEO Optimization",
          "description": "Optimize website for search engines",
          "estimatedCost": "$500-1000/month",
          "timeframe": "3-6 months",
          "difficulty": "medium"
        }
      ],
      "estimatedCost": "$2000-5000/month",
      "timeframe": "3-6 months",
      "expectedROI": "200-300%",
      "difficulty": "medium",
      "priority": 9
    }
  ]
}`;

    return prompt;
  }

  private buildSalesChannelsPrompt(suggestion: BusinessSuggestion): string {
    const sanitizedTitle = sanitizeInput(suggestion.title);
    const sanitizedCategory = sanitizeInput(suggestion.category);
    const sanitizedTargetMarket = sanitizeInput(suggestion.targetMarket);

    return `Generate 3-4 sales channel recommendations for this business:

Business: ${sanitizedTitle}
Category: ${sanitizedCategory}
Target Market: ${sanitizedTargetMarket}
Startup Cost: ${suggestion.estimatedStartupCost}

For each sales channel, provide:
- Implementation steps (3-5 detailed steps)
- Cost structure (setup, monthly, commission)
- Expected reach and timeline
- Suitability score (0-100)
- Pros and cons

Respond with valid JSON in this format:
{
  "channels": [
    {
      "name": "Direct Online Sales",
      "type": "direct",
      "description": "Sell directly through company website",
      "implementation": [
        {
          "title": "Set up e-commerce platform",
          "description": "Choose and configure online store",
          "estimatedTime": "2-4 weeks"
        }
      ],
      "costStructure": {
        "setup": "$1000-3000",
        "monthly": "$100-300",
        "commission": "2-3%"
      },
      "expectedReach": "Global audience",
      "timeToImplement": "4-8 weeks",
      "suitabilityScore": 85,
      "pros": ["Direct customer relationship", "Higher margins"],
      "cons": ["Requires marketing investment", "Customer acquisition costs"]
    }
  ]
}`;
  }

  private buildPricingStrategiesPrompt(suggestion: BusinessSuggestion): string {
    const sanitizedTitle = sanitizeInput(suggestion.title);
    const sanitizedCategory = sanitizeInput(suggestion.category);

    return `Generate 3 pricing strategies for this business:

Business: ${sanitizedTitle}
Category: ${sanitizedCategory}
Target Market: ${suggestion.targetMarket}
Estimated Startup Cost: ${suggestion.estimatedStartupCost}

Generate pricing strategies for:
1. Freemium model
2. Subscription model
3. One-time purchase or tiered model

For each strategy, provide:
- Multiple price points with features
- Pros and cons
- Market fit score (0-100)
- Competitive positioning
- Target segments

Respond with valid JSON in this format:
{
  "pricing": [
    {
      "model": "freemium",
      "title": "Freemium Pricing",
      "description": "Free basic version with premium upgrades",
      "pricePoints": [
        {
          "tier": "Free",
          "price": "$0",
          "features": ["Basic features", "Limited usage"],
          "targetSegment": "Trial users"
        }
      ],
      "pros": ["Low barrier to entry", "Viral growth potential"],
      "cons": ["High conversion requirements", "Support costs"],
      "marketFit": 75,
      "competitivePosition": "Competitive advantage through free tier",
      "recommendedFor": ["SaaS products", "Mobile apps"]
    }
  ]
}`;
  }

  private parseMarketingStrategiesResponse(content: string): MarketingStrategy[] {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');

      const parsed = JSON.parse(jsonMatch[0]);
      const validation = validateMarketingAnalysisResponse({ strategies: parsed.strategies || [] });
      
      if (!validation.isValid) {
        console.warn('Invalid marketing strategies response:', validation.errors);
        return this.getFallbackMarketingStrategies();
      }

      return parsed.strategies.map((strategy: any, index: number) => ({
        id: `strategy-${Date.now()}-${index}`,
        ...strategy,
        completed: false
      }));
    } catch (error) {
      console.error('Failed to parse marketing strategies:', error);
      return this.getFallbackMarketingStrategies();
    }
  }

  private parseSalesChannelsResponse(content: string): SalesChannel[] {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');

      const parsed = JSON.parse(jsonMatch[0]);
      
      return (parsed.channels || []).map((channel: any, index: number) => ({
        id: `channel-${Date.now()}-${index}`,
        ...channel
      }));
    } catch (error) {
      console.error('Failed to parse sales channels:', error);
      return this.getFallbackSalesChannels();
    }
  }

  private parsePricingStrategiesResponse(content: string): PricingStrategy[] {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');

      const parsed = JSON.parse(jsonMatch[0]);
      
      return (parsed.pricing || []).map((pricing: any, index: number) => ({
        id: `pricing-${Date.now()}-${index}`,
        ...pricing
      }));
    } catch (error) {
      console.error('Failed to parse pricing strategies:', error);
      return this.getFallbackPricingStrategies();
    }
  }

  private getRelevantMarketingActivities(phaseName: string, strategies: MarketingStrategy[]): string[] {
    const phase = phaseName.toLowerCase();
    const activities: string[] = [];

    if (phase.includes('planning') || phase.includes('research')) {
      activities.push('Market research', 'Competitor analysis', 'Brand development');
    }
    
    if (phase.includes('development') || phase.includes('build')) {
      activities.push('Content creation', 'Website development', 'SEO setup');
    }
    
    if (phase.includes('launch') || phase.includes('marketing')) {
      activities.push('Campaign launch', 'PR outreach', 'Social media activation');
    }
    
    if (phase.includes('growth') || phase.includes('scale')) {
      activities.push('Performance optimization', 'Partnership development', 'Expansion campaigns');
    }

    return activities.length > 0 ? activities : ['General marketing activities'];
  }

  private getFallbackMarketingStrategies(): MarketingStrategy[] {
    return [
      {
        id: `fallback-digital-${Date.now()}`,
        type: 'digital',
        title: 'Digital Marketing Strategy',
        description: 'Comprehensive digital marketing approach including SEO, social media, and online advertising.',
        tactics: [
          {
            id: 'seo-1',
            name: 'Search Engine Optimization',
            description: 'Optimize website and content for search engines',
            estimatedCost: '$500-1000/month',
            timeframe: '3-6 months',
            difficulty: 'medium'
          }
        ],
        estimatedCost: '$2000-5000/month',
        timeframe: '3-6 months',
        expectedROI: '200-300%',
        difficulty: 'medium',
        priority: 9,
        completed: false
      }
    ];
  }

  private getFallbackSalesChannels(): SalesChannel[] {
    return [
      {
        id: `fallback-direct-${Date.now()}`,
        name: 'Direct Online Sales',
        type: 'direct',
        description: 'Sell directly through your own website and online platforms.',
        implementation: [
          {
            id: 'setup-1',
            title: 'Set up e-commerce platform',
            description: 'Choose and configure an online store solution',
            estimatedTime: '2-4 weeks'
          }
        ],
        costStructure: {
          setup: '$1000-3000',
          monthly: '$100-300',
          commission: '2-3%'
        },
        expectedReach: 'Global online audience',
        timeToImplement: '4-8 weeks',
        suitabilityScore: 80,
        pros: ['Direct customer relationships', 'Higher profit margins'],
        cons: ['Requires marketing investment', 'Customer acquisition costs']
      }
    ];
  }

  private getFallbackPricingStrategies(): PricingStrategy[] {
    return [
      {
        id: `fallback-tiered-${Date.now()}`,
        model: 'tiered',
        title: 'Tiered Pricing Strategy',
        description: 'Multiple pricing tiers to serve different customer segments.',
        pricePoints: [
          {
            tier: 'Basic',
            price: '$29/month',
            features: ['Core features', 'Email support'],
            targetSegment: 'Small businesses'
          }
        ],
        pros: ['Appeals to different budgets', 'Upselling opportunities'],
        cons: ['Complex to manage', 'Feature differentiation challenges'],
        marketFit: 75,
        competitivePosition: 'Competitive with market standards',
        recommendedFor: ['SaaS products', 'Service businesses']
      }
    ];
  }
}