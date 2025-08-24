import { LegacyStrategyConverter, ConversionOptions } from '../utils/legacy-converter';
import { GoToMarketStrategies, MarkdownGoToMarketStrategies } from '../types';

describe('LegacyStrategyConverter', () => {
  const mockJsonStrategies: GoToMarketStrategies = {
    id: 'test-strategy-1',
    businessContext: {
      businessIdea: 'AI-powered task management app',
      targetMarket: 'Small to medium businesses',
      valueProposition: 'Increase productivity by 40%',
      implementationPhases: [
        {
          id: 'phase-1',
          name: 'MVP Development',
          objectives: ['Build core features', 'Test with beta users'],
          duration: '3 months'
        }
      ],
      goals: ['Launch MVP', 'Acquire 1000 users'],
      constraints: ['Limited budget', 'Small team']
    },
    marketingStrategies: [
      {
        id: 'marketing-1',
        type: 'digital',
        title: 'Content Marketing Strategy',
        description: 'Create valuable content to attract and engage target audience',
        tactics: [
          {
            id: 'tactic-1',
            name: 'Blog Posts',
            description: 'Weekly blog posts about productivity',
            estimatedCost: '$500/month',
            timeframe: '6 months',
            difficulty: 'medium'
          }
        ],
        budget: { min: '$2000', max: '$5000', currency: 'USD' },
        timeline: '6 months',
        expectedROI: '300%',
        difficulty: 'medium',
        completed: false
      }
    ],
    salesChannels: [
      {
        id: 'sales-1',
        name: 'Direct Online Sales',
        type: 'online',
        description: 'Sell directly through our website',
        implementationSteps: [
          {
            id: 'step-1',
            title: 'Set up payment processing',
            description: 'Integrate Stripe for payments',
            estimatedTime: '2 weeks'
          }
        ],
        costStructure: {
          setup: '$1000',
          monthly: '$200',
          commission: '2.9%'
        },
        expectedReach: '500 customers/month',
        suitabilityScore: 85,
        completed: false
      }
    ],
    pricingStrategies: [
      {
        id: 'pricing-1',
        model: 'subscription',
        title: 'Tiered Subscription Model',
        description: 'Multiple tiers to serve different customer segments',
        pricePoints: [
          {
            tier: 'Basic',
            price: '$9.99/month',
            features: ['Core features', 'Email support'],
            targetSegment: 'Small teams'
          }
        ],
        marketFit: 90,
        competitiveAnalysis: 'Competitive with market leaders',
        completed: false
      }
    ],
    distributionPlans: [
      {
        id: 'dist-1',
        channel: 'App Stores',
        strategy: 'Distribute through iOS and Android app stores',
        timeline: '3 months',
        resources: ['Developer accounts', 'App store optimization'],
        expectedOutcome: 'Reach mobile users'
      }
    ],
    implementationTimeline: [
      {
        phase: 'Phase 1: Development',
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        activities: ['Build MVP', 'Test features'],
        milestones: ['MVP complete', 'Beta testing done']
      }
    ],
    toolRecommendations: [
      {
        id: 'tool-1',
        name: 'Google Analytics',
        category: 'Analytics',
        relevanceScore: 95,
        implementationPriority: 'high',
        costEstimate: 'Free',
        integrationComplexity: 'simple',
        recommendedFor: ['Track user behavior', 'Measure conversions']
      }
    ],
    generatedAt: '2024-01-01T00:00:00Z',
    version: '1.0'
  };

  const incompleteJsonStrategies: GoToMarketStrategies = {
    id: '',
    businessContext: {
      businessIdea: '',
      targetMarket: '',
      valueProposition: '',
      implementationPhases: [],
      goals: [],
      constraints: []
    },
    marketingStrategies: [],
    salesChannels: [],
    pricingStrategies: [],
    distributionPlans: [],
    implementationTimeline: [],
    toolRecommendations: [],
    generatedAt: '',
    version: '1.0'
  };

  describe('convertJsonToMarkdown', () => {
    it('should successfully convert complete JSON strategies to markdown', () => {
      const result = LegacyStrategyConverter.convertJsonToMarkdown(mockJsonStrategies);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.rawMarkdown).toContain('# Marketing Strategy');
      expect(result.data!.rawMarkdown).toContain('# Sales Strategy');
      expect(result.data!.rawMarkdown).toContain('# Pricing Strategy');
      expect(result.data!.sections).toHaveLength(6); // marketing, sales, pricing, distribution, timeline, tools
    });

    it('should handle conversion options correctly', () => {
      const options: ConversionOptions = {
        preserveIds: false,
        defaultContentLength: 'detailed',
        includeMetadata: true,
        validateOutput: true
      };

      const result = LegacyStrategyConverter.convertJsonToMarkdown(mockJsonStrategies, options);
      
      expect(result.success).toBe(true);
      expect(result.data!.id).not.toBe(mockJsonStrategies.id); // New ID generated
      expect(result.data!.metadata.contentLength).toBe('detailed');
    });

    it('should return warnings for incomplete data', () => {
      const result = LegacyStrategyConverter.convertJsonToMarkdown(incompleteJsonStrategies);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid JSON input');
      expect(result.warnings).toBeDefined();
    });

    it('should handle missing business context gracefully', () => {
      const strategiesWithoutContext = {
        ...mockJsonStrategies,
        businessContext: {
          businessIdea: '',
          targetMarket: '',
          valueProposition: '',
          implementationPhases: [],
          goals: [],
          constraints: []
        }
      };

      const result = LegacyStrategyConverter.convertJsonToMarkdown(strategiesWithoutContext);
      
      expect(result.warnings).toContain('Missing business idea');
      expect(result.warnings).toContain('Missing target market');
      expect(result.warnings).toContain('Missing value proposition');
    });

    it('should validate output when requested', () => {
      const options: ConversionOptions = {
        validateOutput: true
      };

      const result = LegacyStrategyConverter.convertJsonToMarkdown(mockJsonStrategies, options);
      
      expect(result.success).toBe(true);
      expect(result.data!.rawMarkdown.length).toBeGreaterThan(50);
      expect(result.data!.metadata.wordCount).toBeGreaterThan(0);
    });
  });

  describe('recoverFromFailure', () => {
    it('should create fallback markdown when conversion fails', () => {
      const recovered = LegacyStrategyConverter.recoverFromFailure(
        mockJsonStrategies, 
        'Test conversion failure'
      );

      expect(recovered.rawMarkdown).toContain('Go-to-Market Strategy');
      expect(recovered.rawMarkdown).toContain('recovered from legacy data');
      expect(recovered.sections).toHaveLength(3); // fallback sections
      expect(recovered.sections[0].type).toBe('marketing');
    });

    it('should handle missing business context in recovery', () => {
      const strategiesWithoutContext = {
        ...mockJsonStrategies,
        businessContext: undefined as any
      };

      const recovered = LegacyStrategyConverter.recoverFromFailure(
        strategiesWithoutContext, 
        'Missing business context'
      );

      expect(recovered.businessContext.businessIdea).toBe('Business idea not available');
      expect(recovered.sections).toHaveLength(3);
    });
  });

  describe('convertMarkdownToJson', () => {
    it('should convert markdown back to JSON format', () => {
      // First convert JSON to markdown
      const markdownResult = LegacyStrategyConverter.convertJsonToMarkdown(mockJsonStrategies);
      expect(markdownResult.success).toBe(true);

      // Then convert back to JSON
      const jsonResult = LegacyStrategyConverter.convertMarkdownToJson(markdownResult.data!);
      
      expect(jsonResult.success).toBe(true);
      expect(jsonResult.data).toBeDefined();
      expect(jsonResult.data!.id).toBe(mockJsonStrategies.id);
      expect(jsonResult.data!.businessContext).toEqual(mockJsonStrategies.businessContext);
      expect(jsonResult.warnings).toContain('Reverse conversion may lose some formatting and detail');
    });

    it('should handle conversion errors gracefully', () => {
      const invalidMarkdown = {
        id: 'test',
        businessContext: mockJsonStrategies.businessContext,
        rawMarkdown: '',
        sections: [],
        metadata: {
          contentLength: 'standard' as const,
          generatedAt: '2024-01-01T00:00:00Z',
          wordCount: 0,
          estimatedReadTime: 0
        }
      };

      const result = LegacyStrategyConverter.convertMarkdownToJson(invalidMarkdown);
      
      expect(result.success).toBe(true); // Should still succeed with empty content
      expect(result.data!.marketingStrategies).toHaveLength(0);
    });
  });

  describe('detectFormat', () => {
    it('should detect markdown format correctly', () => {
      const markdownData = {
        rawMarkdown: '# Test',
        sections: [],
        metadata: { contentLength: 'standard' }
      };

      const format = LegacyStrategyConverter.detectFormat(markdownData);
      expect(format).toBe('markdown');
    });

    it('should detect JSON format correctly', () => {
      const format = LegacyStrategyConverter.detectFormat(mockJsonStrategies);
      expect(format).toBe('json');
    });

    it('should return unknown for invalid format', () => {
      const invalidData = { someField: 'value' };
      const format = LegacyStrategyConverter.detectFormat(invalidData);
      expect(format).toBe('unknown');
    });
  });

  describe('validateConversion', () => {
    it('should validate successful conversion', () => {
      const result = LegacyStrategyConverter.convertJsonToMarkdown(mockJsonStrategies);
      expect(result.success).toBe(true);

      const isValid = LegacyStrategyConverter.validateConversion(mockJsonStrategies, result.data!);
      expect(isValid).toBe(true);
    });

    it('should reject invalid conversion results', () => {
      const invalidMarkdown: MarkdownGoToMarketStrategies = {
        id: '',
        businessContext: mockJsonStrategies.businessContext,
        rawMarkdown: '',
        sections: [],
        metadata: {
          contentLength: 'standard',
          generatedAt: '',
          wordCount: 0,
          estimatedReadTime: 0
        }
      };

      const isValid = LegacyStrategyConverter.validateConversion(mockJsonStrategies, invalidMarkdown);
      expect(isValid).toBe(false);
    });
  });

  describe('legacy compatibility', () => {
    it('should maintain backward compatibility with legacy method', () => {
      const converted = LegacyStrategyConverter.convertJsonToMarkdownLegacy(mockJsonStrategies);
      
      expect(converted.id).toBe(mockJsonStrategies.id);
      expect(converted.rawMarkdown).toContain('# Marketing Strategy');
      expect(converted.sections.length).toBeGreaterThan(0);
    });

    it('should throw error for legacy method when conversion fails', () => {
      expect(() => {
        LegacyStrategyConverter.convertJsonToMarkdownLegacy(incompleteJsonStrategies);
      }).toThrow();
    });
  });
});