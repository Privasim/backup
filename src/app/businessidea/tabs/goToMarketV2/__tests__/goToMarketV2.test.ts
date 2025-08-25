import { GoToMarketTextService } from '../services/goToMarketTextService';
import { ImplementationContext } from '../types';
import * as storage from '../storage';

describe('GoToMarketV2 Caching', () => {
  let service: GoToMarketTextService;
  const mockApiKey = 'test-api-key';
  const mockIdeaId = 'test-idea-123';
  
  const mockContext: ImplementationContext = {
    title: 'Test Business',
    overview: 'Test business overview',
    phases: [
      {
        id: 'phase-1',
        name: 'Phase 1',
        objectives: 'Test objectives',
        duration: '1 month'
      }
    ],
    tasks: [
      {
        id: 'task-1',
        phaseId: 'phase-1',
        title: 'Test Task',
        description: 'Test task description'
      }
    ]
  };
  
  beforeEach(() => {
    service = new GoToMarketTextService(mockApiKey);
    // Clear any existing cached data
    localStorage.clear();
  });
  
  afterEach(() => {
    // Clear mocks
    jest.restoreAllMocks();
  });
  
  it('should cache strategy content with ideaId', async () => {
    // Mock the API call to return a specific response
    const mockResponse = {
      choices: [{
        message: {
          content: '# Test Strategy\n\nThis is a test strategy content.'
        }
      }]
    };
    
    // Mock the OpenRouterClient
    (service as any).client.chat = jest.fn().mockResolvedValue(mockResponse);
    
    // Generate strategy
    const result = await service.generateStrategy(mockContext, undefined, mockIdeaId);
    
    // Verify API was called
    expect((service as any).client.chat).toHaveBeenCalled();
    
    // Verify content is returned
    expect(result).toContain('Test Strategy');
    
    // Verify content is cached
    const cached = storage.loadCachedStrategy(mockIdeaId, mockContext);
    expect(cached).toContain('Test Strategy');
  });
  
  it('should load strategy from cache when available', async () => {
    // Pre-cache a strategy
    const cachedContent = '# Cached Strategy\n\nThis is cached content.';
    storage.saveCachedStrategy(mockIdeaId, mockContext, cachedContent);
    
    // Mock the API call to verify it's not called
    const mockResponse = {
      choices: [{
        message: {
          content: '# New Strategy\n\nThis should not be returned.'
        }
      }]
    };
    
    // Mock the OpenRouterClient
    (service as any).client.chat = jest.fn().mockResolvedValue(mockResponse);
    
    // Generate strategy
    const result = await service.generateStrategy(mockContext, undefined, mockIdeaId);
    
    // Verify API was NOT called
    expect((service as any).client.chat).not.toHaveBeenCalled();
    
    // Verify cached content is returned
    expect(result).toBe(cachedContent);
  });
});
