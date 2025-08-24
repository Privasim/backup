import { StrategyProcessor } from '../services/StrategyProcessor';

describe('StrategyProcessor', () => {
  describe('processAIResponse', () => {
    it('should process valid JSON response correctly', () => {
      const mockResponse = JSON.stringify({
        marketingStrategies: [
          {
            type: 'digital',
            title: 'Social Media Marketing',
            description: 'Engage customers on social platforms',
            tactics: [
              {
                name: 'Facebook Ads',
                description: 'Targeted advertising',
                estimatedCost: '$1,000',
                timeframe: '4 weeks',
                difficulty: 'medium'
              }
            ],
            budget: {
              min: '$2,000',
              max: '$5,000',
              currency: 'USD'
            },
            timeline: '3 months',
            expectedROI: '300%',
            difficulty: 'medium'
          }
        ],
        salesChannels: [
          {
            name: 'Direct Sales',
            type: 'direct',
            description: 'Direct customer acquisition',
            implementationSteps: [
              {
                title: 'Setup CRM',
                description: 'Configure customer management',
                estimatedTime: '2 weeks'
              }
            ],
            costStructure: {
              setup: '$1,000',
              monthly: '$200'
            },
            expectedReach: '100 customers/month',
            suitabilityScore: 85
          }
        ],
        pricingStrategies: [
          {
            model: 'tiered',
            title: 'Tiered Pricing',
            description: 'Multiple pricing tiers',
            pricePoints: [
              {
                tier: 'Basic',
                price: '$29/month',
                features: ['Feature 1', 'Feature 2'],
                targetSegment: 'Small businesses'
              }
            ],
            marketFit: 90,
            competitiveAnalysis: 'Competitive with market leaders'
          }
        ],
        distributionPlans: [
          {
            channel: 'Online',
            strategy: 'Digital distribution',
            timeline: '6 months',
            resources: ['Website', 'Marketing team'],
            expectedOutcome: 'Increased online presence'
          }
        ],
        implementationTimeline: [
          {
            phase: 'Phase 1',
            startDate: 'Month 1',
            endDate: 'Month 3',
            activities: ['Setup infrastructure'],
            milestones: ['Platform ready']
          }
        ],
        toolRecommendations: [
          {
            name: 'HubSpot',
            category: 'CRM',
            relevanceScore: 95,
            implementationPriority: 'high',
            costEstimate: '$50/month',
            integrationComplexity: 'moderate',
            recommendedFor: ['Lead management']
          }
        ]
      });

      const result = StrategyProcessor.processAIResponse(mockResponse);

      expect(result).toBeDefined();
      expect(result.id).toMatch(/^gtm-\d+$/);
      expect(result.marketingStrategies).toHaveLength(1);
      expect(result.salesChannels).toHaveLength(1);
      expect(result.pricingStrategies).toHaveLength(1);
      expect(result.distributionPlans).toHaveLength(1);
      expect(result.implementationTimeline).toHaveLength(1);
      expect(result.toolRecommendations).toHaveLength(1);

      // Check marketing strategy processing
      const marketingStrategy = result.marketingStrategies[0];
      expect(marketingStrategy.id).toBe('marketing-1');
      expect(marketingStrategy.title).toBe('Social Media Marketing');
      expect(marketingStrategy.completed).toBe(false);
      expect(marketingStrategy.tactics).toHaveLength(1);
      expect(marketingStrategy.tactics[0].id).toBe('tactic-1-1');

      // Check sales channel processing
      const salesChannel = result.salesChannels[0];
      expect(salesChannel.id).toBe('sales-1');
      expect(salesChannel.name).toBe('Direct Sales');
      expect(salesChannel.completed).toBe(false);
      expect(salesChannel.implementationSteps).toHaveLength(1);
      expect(salesChannel.implementationSteps[0].id).toBe('step-1-1');

      // Check pricing strategy processing
      const pricingStrategy = result.pricingStrategies[0];
      expect(pricingStrategy.id).toBe('pricing-1');
      expect(pricingStrategy.title).toBe('Tiered Pricing');
      expect(pricingStrategy.completed).toBe(false);
    });

    it('should handle JSON with markdown code blocks', () => {
      const responseWithMarkdown = `
Here's your strategy:

\`\`\`json
{
  "marketingStrategies": [
    {
      "type": "digital",
      "title": "Test Strategy",
      "description": "Test description",
      "tactics": [],
      "budget": {"min": "$1000", "max": "$2000", "currency": "USD"},
      "timeline": "3 months",
      "expectedROI": "200%",
      "difficulty": "low"
    }
  ],
  "salesChannels": [],
  "pricingStrategies": []
}
\`\`\`

That's your strategy!
      `;

      const result = StrategyProcessor.processAIResponse(responseWithMarkdown);

      expect(result).toBeDefined();
      expect(result.marketingStrategies).toHaveLength(1);
      expect(result.marketingStrategies[0].title).toBe('Test Strategy');
    });

    it('should handle empty or minimal responses', () => {
      const minimalResponse = JSON.stringify({
        marketingStrategies: [],
        salesChannels: [],
        pricingStrategies: []
      });

      const result = StrategyProcessor.processAIResponse(minimalResponse);

      expect(result).toBeDefined();
      expect(result.marketingStrategies).toHaveLength(0);
      expect(result.salesChannels).toHaveLength(0);
      expect(result.pricingStrategies).toHaveLength(0);
      expect(result.distributionPlans).toHaveLength(0);
      expect(result.implementationTimeline).toHaveLength(0);
      expect(result.toolRecommendations).toHaveLength(0);
    });

    it('should throw error for invalid JSON', () => {
      const invalidResponse = 'This is not valid JSON';

      expect(() => {
        StrategyProcessor.processAIResponse(invalidResponse);
      }).toThrow('Failed to process AI response');
    });

    it('should apply default values for missing fields', () => {
      const incompleteResponse = JSON.stringify({
        marketingStrategies: [
          {
            // Missing most fields
            title: 'Incomplete Strategy'
          }
        ],
        salesChannels: [
          {
            // Missing most fields
            name: 'Incomplete Channel'
          }
        ],
        pricingStrategies: [
          {
            // Missing most fields
            title: 'Incomplete Pricing'
          }
        ]
      });

      const result = StrategyProcessor.processAIResponse(incompleteResponse);

      // Check that defaults are applied
      const marketing = result.marketingStrategies[0];
      expect(marketing.type).toBe('digital'); // Default
      expect(marketing.description).toBe(''); // Default
      expect(marketing.difficulty).toBe('medium'); // Default
      expect(marketing.completed).toBe(false); // Default

      const sales = result.salesChannels[0];
      expect(sales.type).toBe('online'); // Default
      expect(sales.suitabilityScore).toBe(75); // Default
      expect(sales.completed).toBe(false); // Default

      const pricing = result.pricingStrategies[0];
      expect(pricing.model).toBe('tiered'); // Default
      expect(pricing.marketFit).toBe(80); // Default
      expect(pricing.completed).toBe(false); // Default
    });
  });

  describe('validateStrategies', () => {
    it('should validate complete strategies successfully', () => {
      const validStrategies = {
        id: 'test-id',
        businessContext: {
          businessIdea: 'Test Business',
          targetMarket: 'Test Market',
          valueProposition: 'Test Value',
          implementationPhases: [],
          goals: [],
          constraints: []
        },
        marketingStrategies: [
          {
            id: 'marketing-1',
            type: 'digital' as const,
            title: 'Digital Marketing',
            description: 'Test description',
            tactics: [],
            budget: { min: '$1000', max: '$2000', currency: 'USD' },
            timeline: '3 months',
            expectedROI: '200%',
            difficulty: 'medium' as const,
            completed: false
          }
        ],
        salesChannels: [
          {
            id: 'sales-1',
            name: 'Direct Sales',
            type: 'direct' as const,
            description: 'Test description',
            implementationSteps: [],
            costStructure: { setup: '$1000', monthly: '$100' },
            expectedReach: '100/month',
            suitabilityScore: 85,
            completed: false
          }
        ],
        pricingStrategies: [
          {
            id: 'pricing-1',
            model: 'tiered' as const,
            title: 'Tiered Pricing',
            description: 'Test description',
            pricePoints: [],
            marketFit: 90,
            competitiveAnalysis: 'Test analysis',
            completed: false
          }
        ],
        distributionPlans: [],
        implementationTimeline: [],
        toolRecommendations: [],
        generatedAt: '2024-01-01T00:00:00Z',
        version: '1.0'
      };

      const result = StrategyProcessor.validateStrategies(validStrategies);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should identify validation errors', () => {
      const invalidStrategies = {
        id: '', // Missing ID
        businessContext: null as any, // Missing business context
        marketingStrategies: [
          {
            id: 'marketing-1',
            type: 'invalid-type' as any, // Invalid type
            title: '', // Missing title
            description: 'Test',
            tactics: [],
            budget: { min: '$1000', max: '$2000', currency: 'USD' },
            timeline: '3 months',
            expectedROI: '200%',
            difficulty: 'medium' as const,
            completed: false
          }
        ],
        salesChannels: [],
        pricingStrategies: [],
        distributionPlans: [],
        implementationTimeline: [],
        toolRecommendations: [],
        generatedAt: '2024-01-01T00:00:00Z',
        version: '1.0'
      };

      const result = StrategyProcessor.validateStrategies(invalidStrategies);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain('Strategy ID is required');
      expect(result.errors).toContain('Business context is required');
      expect(result.errors).toContain('Marketing strategy 1 missing title');
      expect(result.errors).toContain('Marketing strategy 1 has invalid type');
    });
  });
});