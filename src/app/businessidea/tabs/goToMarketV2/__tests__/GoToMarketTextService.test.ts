import { GoToMarketTextService } from '../services/goToMarketTextService';
import { DEFAULT_SETTINGS } from '../types';

// Mock the OpenRouterClient
jest.mock('@/lib/openrouter/client', () => {
  return {
    OpenRouterClient: jest.fn().mockImplementation(() => ({
      chat: jest.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: '# Test Strategy\n\nThis is a test strategy.'
            }
          }
        ]
      })
    }))
  };
});

// Mock the storage functions
jest.mock('../storage', () => ({
  loadCachedStrategy: jest.fn(),
  saveCachedStrategy: jest.fn(),
  saveError: jest.fn()
}));

describe('GoToMarketTextService', () => {
  const mockContext = {
    title: 'Test Business',
    overview: 'Test overview',
    phases: [
      { id: '1', name: 'Phase 1', objectives: ['Objective 1'], duration: '1 month' }
    ],
    tasks: [
      { id: '1', title: 'Task 1', description: 'Task description' }
    ],
    kpis: [
      { id: '1', metric: 'KPI 1', target: 'Target 1' }
    ]
  };

  const mockModel = 'openai/gpt-4o-mini';
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('constructs prompt with default settings', () => {
    const service = new GoToMarketTextService(mockApiKey);
    
    // Access the private method using type assertion
    const prompt = (service as any).constructPrompt(mockContext, DEFAULT_SETTINGS);
    
    // Check that the prompt includes default settings
    expect(prompt).toContain('Include moderate detail in each section');
    expect(prompt).toContain('Focus on the following distribution channels: socialMedia, reddit, email, partnerships, events');
    expect(prompt).toContain('Emphasize a subscription pricing model');
    expect(prompt).toContain('Design the sales strategy around a self-service sales approach');
    expect(prompt).toContain('Include a detailed timeline with specific milestones and dates');
  });

  it('constructs prompt with custom settings', () => {
    const service = new GoToMarketTextService(mockApiKey);
    const customSettings = {
      ...DEFAULT_SETTINGS,
      detailLevel: 1,
      distributionChannels: {
        socialMedia: true,
        reddit: false,
        email: true,
        partnerships: false,
        events: false
      },
      pricingModel: 'freemium' as const,
      salesApproach: 'enterprise' as const,
      includeTimeline: false
    };
    
    // Access the private method using type assertion
    const prompt = (service as any).constructPrompt(mockContext, customSettings);
    
    // Check that the prompt includes custom settings
    expect(prompt).toContain('Keep the strategy very concise and high-level');
    expect(prompt).toContain('Focus on the following distribution channels: socialMedia, email');
    expect(prompt).not.toContain('reddit');
    expect(prompt).toContain('Emphasize a freemium pricing model');
    expect(prompt).toContain('Design the sales strategy around a enterprise sales approach');
    expect(prompt).toContain('Focus on strategy rather than specific timeline details');
    expect(prompt).not.toContain('Timeline and Milestones');
  });
});
