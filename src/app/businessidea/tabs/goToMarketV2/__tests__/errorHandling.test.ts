import { GoToMarketTextService } from '../services/goToMarketTextService';
import { ImplementationContext } from '../types';
import * as storage from '../storage';

describe('GoToMarketV2 Error Handling', () => {
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
  
  it('should save error to storage when API call fails', async () => {
    // Mock the API call to throw an error
    const mockError = new Error('API Error');
    (service as any).client.chat = jest.fn().mockRejectedValue(mockError);
    
    // Try to generate strategy
    await expect(service.generateStrategy(mockContext, undefined, mockIdeaId))
      .rejects.toThrow('API Error');
    
    // Verify error is saved to storage
    const errorKey = `gtm-error-${mockIdeaId}`;
    const savedError = localStorage.getItem(errorKey);
    expect(savedError).not.toBeNull();
    expect(savedError).toContain('API Error');
  });
  
  it('should handle network errors gracefully', async () => {
    // Mock the API call to throw a network error
    const networkError = new Error('Network Error');
    (service as any).client.chat = jest.fn().mockRejectedValue(networkError);
    
    // Try to generate strategy
    await expect(service.generateStrategy(mockContext, undefined, mockIdeaId))
      .rejects.toThrow('Network Error');
  });
});
