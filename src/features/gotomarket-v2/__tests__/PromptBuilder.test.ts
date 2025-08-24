import { PromptBuilder } from '../services/PromptBuilder';
import { ImplementationPlan } from '@/features/implementation-plan/types';

// Mock implementation plan for testing
const mockImplementationPlan: ImplementationPlan = {
  id: 'test-plan',
  meta: {
    title: 'Test Business Plan',
    category: 'SaaS',
    createdAt: '2024-01-01T00:00:00Z'
  },
  overview: {
    goals: ['Increase revenue', 'Expand market reach', 'Improve customer satisfaction']
  },
  phases: [
    {
      id: 'phase-1',
      name: 'Development Phase',
      objectives: ['Build MVP', 'Test with users'],
      duration: '3 months'
    },
    {
      id: 'phase-2',
      name: 'Launch Phase',
      objectives: ['Go to market', 'Acquire customers'],
      duration: '6 months'
    }
  ],
  tasks: [
    {
      id: 'task-1',
      title: 'Develop core features',
      effort: '2 weeks'
    }
  ],
  kpis: [
    {
      metric: 'Monthly Revenue',
      target: '$10,000'
    }
  ],
  textContent: 'This is a SaaS business targeting small businesses with a focus on productivity tools. The target market includes startups and SMEs looking for efficient solutions.',
  formattedContent: 'Formatted content here'
};

describe('PromptBuilder', () => {
  describe('buildGoToMarketPrompt', () => {
    it('should generate a comprehensive prompt with default options', () => {
      const prompt = PromptBuilder.buildGoToMarketPrompt(mockImplementationPlan);
      
      expect(prompt).toContain('go-to-market strategy expert');
      expect(prompt).toContain('Test Business Plan');
      expect(prompt).toContain('Increase revenue');
      expect(prompt).toContain('Development Phase');
      expect(prompt).toContain('JSON format');
      expect(prompt).toContain('marketingStrategies');
      expect(prompt).toContain('salesChannels');
      expect(prompt).toContain('pricingStrategies');
    });

    it('should include custom options in the prompt', () => {
      const options = {
        focusAreas: ['marketing', 'sales'] as const,
        budgetRange: 'high' as const,
        timeframe: 'long-term' as const,
        customPrompt: 'Focus on enterprise customers'
      };

      const prompt = PromptBuilder.buildGoToMarketPrompt(mockImplementationPlan, options);
      
      expect(prompt).toContain('marketing, sales');
      expect(prompt).toContain('high');
      expect(prompt).toContain('long-term');
      expect(prompt).toContain('Focus on enterprise customers');
    });

    it('should extract business context correctly', () => {
      const prompt = PromptBuilder.buildGoToMarketPrompt(mockImplementationPlan);
      
      // Should extract target market from text content
      expect(prompt).toContain('small businesses');
      
      // Should include goals
      expect(prompt).toContain('Increase revenue, Expand market reach, Improve customer satisfaction');
      
      // Should include phases
      expect(prompt).toContain('Development Phase: Build MVP, Test with users');
      expect(prompt).toContain('Launch Phase: Go to market, Acquire customers');
    });
  });

  describe('buildMarketingPrompt', () => {
    it('should generate marketing-specific prompt', () => {
      const context = {
        businessIdea: 'SaaS Platform',
        targetMarket: 'Small businesses',
        valueProposition: 'Increase productivity',
        implementationPhases: [],
        goals: [],
        constraints: []
      };

      const prompt = PromptBuilder.buildMarketingPrompt(context);
      
      expect(prompt).toContain('marketing strategies');
      expect(prompt).toContain('SaaS Platform');
      expect(prompt).toContain('Small businesses');
      expect(prompt).toContain('Increase productivity');
      expect(prompt).toContain('digital marketing');
      expect(prompt).toContain('content marketing');
    });
  });

  describe('buildSalesPrompt', () => {
    it('should generate sales-specific prompt', () => {
      const context = {
        businessIdea: 'E-commerce Platform',
        targetMarket: 'Online retailers',
        valueProposition: 'Easy setup',
        implementationPhases: [],
        goals: [],
        constraints: []
      };

      const prompt = PromptBuilder.buildSalesPrompt(context);
      
      expect(prompt).toContain('sales channel strategies');
      expect(prompt).toContain('E-commerce Platform');
      expect(prompt).toContain('Online retailers');
      expect(prompt).toContain('direct sales');
      expect(prompt).toContain('online sales');
    });
  });

  describe('buildPricingPrompt', () => {
    it('should generate pricing-specific prompt', () => {
      const context = {
        businessIdea: 'Mobile App',
        targetMarket: 'Consumers',
        valueProposition: 'Convenience',
        implementationPhases: [],
        goals: [],
        constraints: []
      };

      const prompt = PromptBuilder.buildPricingPrompt(context);
      
      expect(prompt).toContain('pricing strategies');
      expect(prompt).toContain('Mobile App');
      expect(prompt).toContain('Consumers');
      expect(prompt).toContain('Convenience');
      expect(prompt).toContain('freemium');
      expect(prompt).toContain('subscription');
    });
  });

  describe('context extraction', () => {
    it('should handle missing or minimal content gracefully', () => {
      const minimalPlan: ImplementationPlan = {
        id: 'minimal',
        meta: {
          title: '',
          category: '',
          createdAt: '2024-01-01T00:00:00Z'
        },
        overview: {
          goals: []
        },
        phases: [],
        tasks: [],
        kpis: [],
        textContent: '',
        formattedContent: ''
      };

      const prompt = PromptBuilder.buildGoToMarketPrompt(minimalPlan);
      
      expect(prompt).toContain('Business Implementation Plan'); // Default title
      expect(prompt).toContain('General market'); // Default target market
      expect(prompt).toContain('Innovative solution'); // Default value proposition
    });

    it('should extract constraints from content', () => {
      const planWithConstraints: ImplementationPlan = {
        ...mockImplementationPlan,
        textContent: 'We have budget constraints and limited time resources for this project.'
      };

      const prompt = PromptBuilder.buildGoToMarketPrompt(planWithConstraints);
      
      // The prompt should be generated successfully even with constraints
      expect(prompt).toContain('go-to-market strategy');
    });
  });
});