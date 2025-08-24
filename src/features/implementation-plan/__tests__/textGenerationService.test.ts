import { TextGenerationService } from '../textGenerationService';
import { OpenRouterClient } from '@/lib/openrouter/client';

// Mock the OpenRouter client
jest.mock('@/lib/openrouter/client');

describe('TextGenerationService', () => {
  let service: TextGenerationService;
  let mockClient: jest.Mocked<OpenRouterClient>;

  beforeEach(() => {
    mockClient = {
      chat: jest.fn(),
      validateApiKey: jest.fn()
    } as any;
    
    (OpenRouterClient as jest.Mock).mockImplementation(() => mockClient);
    service = new TextGenerationService('test-api-key');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generatePlan', () => {
    const mockSuggestion = {
      id: 'test-id',
      title: 'Test Business',
      description: 'A test business idea',
      category: 'Technology',
      targetMarket: 'Small businesses',
      estimatedStartupCost: '$10,000',
      keyFeatures: ['Feature 1', 'Feature 2']
    };

    const mockSettings = {
      systemPromptOverride: '',
      sources: [],
      lengthPreset: 'long' as const,
      model: 'test-model',
      apiKey: 'test-key'
    };

    it('should generate a plan successfully without streaming', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: '# Test Implementation Plan\n\n## Overview\n\nThis is a test plan.\n\n## Phase 1: Setup\n\n- Task 1\n- Task 2'
          }
        }]
      };

      mockClient.chat.mockResolvedValue(mockResponse);

      const result = await service.generatePlan(mockSuggestion, mockSettings);

      expect(result).toBeDefined();
      expect(result.meta.title).toBe('Test Business');
      expect(result.textContent).toContain('Test Implementation Plan');
      expect(result.phases).toHaveLength(1);
      expect(result.tasks).toHaveLength(2);
    });

    it('should generate a plan successfully with streaming', async () => {
      const chunks = ['# Test Plan\n\n', '## Overview\n\n', 'This is streaming content'];
      let chunkIndex = 0;
      const onChunk = jest.fn();

      mockClient.chat.mockImplementation(async (request, options) => {
        if (options?.stream && options?.onChunk) {
          chunks.forEach(chunk => {
            options.onChunk!(chunk);
          });
        }
        return undefined;
      });

      const result = await service.generatePlan(mockSuggestion, mockSettings, onChunk);

      expect(onChunk).toHaveBeenCalledTimes(3);
      expect(result.textContent).toBe(chunks.join(''));
      expect(result.meta.title).toBe('Test Business');
    });

    it('should throw error when no content is generated', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: ''
          }
        }]
      };

      mockClient.chat.mockResolvedValue(mockResponse);

      await expect(service.generatePlan(mockSuggestion, mockSettings))
        .rejects.toThrow('No content generated from API');
    });

    it('should handle API errors gracefully', async () => {
      mockClient.chat.mockRejectedValue(new Error('API Error'));

      await expect(service.generatePlan(mockSuggestion, mockSettings))
        .rejects.toThrow('API Error');
    });
  });

  describe('content extraction', () => {
    it('should extract sections from markdown content', () => {
      const textContent = `# Implementation Plan

## Overview
This is the overview section.

## Phase 1: Setup
- Task 1
- Task 2

## Resources
- Team member 1
- Budget: $5000`;

      const plan = (service as any).createPlanFromText(textContent, {
        id: 'test',
        title: 'Test',
        description: 'Test',
        keyFeatures: []
      });

      expect(plan.contentSections).toHaveLength(3);
      expect(plan.contentSections[0].type).toBe('overview');
      expect(plan.contentSections[1].type).toBe('phases');
      expect(plan.contentSections[2].type).toBe('resources');
    });

    it('should extract list items correctly', () => {
      const content = `- Item 1
- Item 2
• Item 3
→ Item 4
1. Numbered item`;

      const items = (service as any).extractListItems(content);
      
      expect(items).toHaveLength(5);
      expect(items).toContain('Item 1');
      expect(items).toContain('Item 2');
      expect(items).toContain('Item 3');
      expect(items).toContain('Item 4');
      expect(items).toContain('Numbered item');
    });

    it('should provide fallback data when extraction fails', () => {
      const plan = (service as any).createPlanFromText('No structured content', {
        id: 'test',
        title: 'Test',
        description: 'Test',
        keyFeatures: []
      });

      expect(plan.phases).toHaveLength(1);
      expect(plan.tasks).toHaveLength(1);
      expect(plan.overview.goals).toHaveLength(1);
    });
  });
});