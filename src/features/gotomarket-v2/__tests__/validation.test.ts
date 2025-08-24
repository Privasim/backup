import { 
  validateGenerationOptions, 
  validateImplementationPlan, 
  validateApiConfiguration,
  sanitizeInput,
  validateFileImport
} from '../utils/validation';
import { ImplementationPlan } from '@/features/implementation-plan/types';

describe('Validation Utils', () => {
  describe('validateGenerationOptions', () => {
    it('should validate correct options', () => {
      const validOptions = {
        focusAreas: ['marketing', 'sales'] as const,
        budgetRange: 'medium' as const,
        timeframe: 'short-term' as const,
        customPrompt: 'Focus on B2B customers'
      };

      const result = validateGenerationOptions(validOptions);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid focus areas', () => {
      const invalidOptions = {
        focusAreas: ['marketing', 'invalid-area'] as any,
        budgetRange: 'medium' as const,
        timeframe: 'short-term' as const
      };

      const result = validateGenerationOptions(invalidOptions);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid focus areas: invalid-area');
    });

    it('should reject invalid budget range', () => {
      const invalidOptions = {
        budgetRange: 'invalid-budget' as any
      };

      const result = validateGenerationOptions(invalidOptions);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Budget range must be low, medium, or high');
    });

    it('should reject invalid timeframe', () => {
      const invalidOptions = {
        timeframe: 'invalid-timeframe' as any
      };

      const result = validateGenerationOptions(invalidOptions);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Timeframe must be immediate, short-term, or long-term');
    });

    it('should warn about very long custom prompts', () => {
      const longPrompt = 'a'.repeat(1001);
      const options = {
        customPrompt: longPrompt
      };

      const result = validateGenerationOptions(options);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Custom prompt is very long and may affect generation quality');
    });
  });

  describe('validateImplementationPlan', () => {
    const validPlan: ImplementationPlan = {
      id: 'test-plan',
      meta: {
        title: 'Test Business Plan',
        category: 'SaaS',
        createdAt: '2024-01-01T00:00:00Z'
      },
      overview: {
        goals: ['Increase revenue', 'Expand market']
      },
      phases: [
        {
          id: 'phase-1',
          name: 'Development',
          objectives: ['Build product']
        }
      ],
      tasks: [],
      kpis: [],
      textContent: 'This is a comprehensive business plan targeting small businesses with innovative products and services for the market.',
      formattedContent: ''
    };

    it('should validate a complete implementation plan', () => {
      const result = validateImplementationPlan(validPlan);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject null plan', () => {
      const result = validateImplementationPlan(null);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Implementation plan is required');
    });

    it('should reject plan without phases', () => {
      const planWithoutPhases = {
        ...validPlan,
        phases: []
      };

      const result = validateImplementationPlan(planWithoutPhases);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Implementation plan must have at least one phase');
    });

    it('should reject plan with insufficient content', () => {
      const planWithBriefContent = {
        ...validPlan,
        textContent: 'Too brief'
      };

      const result = validateImplementationPlan(planWithBriefContent);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Implementation plan content is too brief for strategy generation');
    });

    it('should warn about missing business context', () => {
      const planWithoutBusinessContext = {
        ...validPlan,
        textContent: 'This is a technical implementation without business context or market information.'
      };

      const result = validateImplementationPlan(planWithoutBusinessContext);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Implementation plan may not contain sufficient business context');
    });

    it('should warn about missing market analysis', () => {
      const planWithoutMarketContext = {
        ...validPlan,
        textContent: 'This is a business plan with products and services but no market analysis.'
      };

      const result = validateImplementationPlan(planWithoutMarketContext);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Implementation plan may be missing market analysis');
    });

    it('should warn about missing title and goals', () => {
      const incompleteplan = {
        ...validPlan,
        meta: {
          ...validPlan.meta,
          title: ''
        },
        overview: {
          goals: []
        }
      };

      const result = validateImplementationPlan(incompleteplan);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Implementation plan missing title');
      expect(result.warnings).toContain('Implementation plan missing business goals');
    });
  });

  describe('validateApiConfiguration', () => {
    it('should validate correct API configuration', () => {
      const result = validateApiConfiguration('sk-or-v1-1234567890abcdef', 'gpt-3.5-turbo');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject missing API key', () => {
      const result = validateApiConfiguration('', 'gpt-3.5-turbo');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('API key is required');
    });

    it('should reject invalid API key format', () => {
      const result = validateApiConfiguration('invalid-key', 'gpt-3.5-turbo');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid API key format');
    });

    it('should reject missing model', () => {
      const result = validateApiConfiguration('sk-or-v1-1234567890abcdef', '');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('AI model is required');
    });
  });

  describe('sanitizeInput', () => {
    it('should remove potentially harmful characters', () => {
      const maliciousInput = '<script>alert("xss")</script>Hello<>World';
      const sanitized = sanitizeInput(maliciousInput);

      expect(sanitized).toBe('scriptalert("xss")/scriptHelloWorld');
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
    });

    it('should remove javascript protocol', () => {
      const maliciousInput = 'javascript:alert("xss")';
      const sanitized = sanitizeInput(maliciousInput);

      expect(sanitized).toBe('alert("xss")');
      expect(sanitized).not.toContain('javascript:');
    });

    it('should limit input length', () => {
      const longInput = 'a'.repeat(15000);
      const sanitized = sanitizeInput(longInput);

      expect(sanitized.length).toBe(10000);
    });

    it('should trim whitespace', () => {
      const inputWithWhitespace = '  Hello World  ';
      const sanitized = sanitizeInput(inputWithWhitespace);

      expect(sanitized).toBe('Hello World');
    });
  });

  describe('validateFileImport', () => {
    it('should validate correct JSON content', () => {
      const validJson = JSON.stringify({
        id: 'test-id',
        businessContext: {
          businessIdea: 'Test Business'
        },
        marketingStrategies: []
      });

      const result = validateFileImport(validJson, 'json');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty content', () => {
      const result = validateFileImport('', 'json');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File content is empty');
    });

    it('should reject invalid JSON', () => {
      const invalidJson = '{ invalid json }';

      const result = validateFileImport(invalidJson, 'json');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid JSON format');
    });

    it('should reject JSON without required structure', () => {
      const incompleteJson = JSON.stringify({
        someField: 'value'
        // Missing id and businessContext
      });

      const result = validateFileImport(incompleteJson, 'json');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid strategy file format');
    });
  });
});