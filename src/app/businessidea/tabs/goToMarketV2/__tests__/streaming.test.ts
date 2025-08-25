import { GoToMarketTextService } from '../services/goToMarketTextService';
import { ImplementationContext } from '../types';

describe('GoToMarketV2 Streaming', () => {
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
  
  it('should call onChunk callback for each chunk when streaming', async () => {
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
    
    // Create a mock onChunk callback
    const onChunkMock = jest.fn();
    
    // Generate strategy with streaming
    await service.generateStrategy(mockContext, onChunkMock, mockIdeaId);
    
    // Verify onChunk was called
    expect(onChunkMock).toHaveBeenCalled();
  });
  
  it('should simulate streaming from cache when cached content exists', async () => {
    // Pre-cache a strategy
    const cachedContent = '# Cached Strategy\n\nThis is cached content.';
    
    // Mock the storage function
    jest.mock('../storage', () => ({
      loadCachedStrategy: jest.fn().mockReturnValue(cachedContent),
      saveCachedStrategy: jest.fn(),
      saveError: jest.fn()
    }));
    
    // Create a mock onChunk callback
    const onChunkMock = jest.fn();
    
    // Generate strategy with streaming
    await service.generateStrategy(mockContext, onChunkMock, mockIdeaId);
    
    // Verify onChunk was called with cached content
    expect(onChunkMock).toHaveBeenCalled();
  });
});
