import { renderHook, act } from '@testing-library/react';
import { useStrategyPersistence } from '../hooks/useStrategyPersistence';
import { useGoToMarketV2 } from '../hooks/useGoToMarketV2';
import { ContentLength } from '../types';

// Mock the service
jest.mock('../services/GoToMarketV2Service', () => ({
  GoToMarketV2Service: {
    generateStrategies: jest.fn().mockResolvedValue({
      strategies: {
        id: 'test-id',
        businessContext: {
          businessIdea: 'Test Business',
          targetMarket: 'Test Market',
          valueProposition: 'Test Value',
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
        generatedAt: new Date().toISOString(),
        version: '2.0'
      },
      rawMarkdown: '# Marketing Strategy\nTest marketing content\n\n# Sales Strategy\nTest sales content'
    })
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Markdown Caching Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should cache markdown strategies with different content lengths', async () => {
    const { result: persistenceResult } = renderHook(() => useStrategyPersistence());
    
    const mockImplementationPlan = {
      id: 'test-plan',
      businessIdea: 'Test Business',
      targetMarket: 'Test Market',
      valueProposition: 'Test Value',
      implementationPhases: [],
      generatedAt: new Date().toISOString(),
      version: '1.0'
    };

    // Test caching with different content lengths
    const contentLengths: ContentLength[] = ['brief', 'standard', 'detailed'];
    
    for (const contentLength of contentLengths) {
      const contextId = `test-context-${contentLength}`;
      const rawMarkdown = `# ${contentLength.toUpperCase()} Strategy\nContent for ${contentLength} length`;
      
      const mockStrategies = {
        id: `test-id-${contentLength}`,
        businessContext: {
          businessIdea: 'Test Business',
          targetMarket: 'Test Market',
          valueProposition: 'Test Value',
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
        generatedAt: new Date().toISOString(),
        version: '2.0'
      };

      // Save with specific content length
      act(() => {
        persistenceResult.current.saveMarkdownStrategies(
          mockStrategies,
          rawMarkdown,
          contextId,
          contentLength
        );
      });

      // Verify it can be loaded with the same content length
      const loaded = persistenceResult.current.loadMarkdownStrategies(contextId, contentLength);
      expect(loaded).not.toBeNull();
      expect(loaded!.rawMarkdown).toBe(rawMarkdown);
      expect(loaded!.strategies.id).toBe(`test-id-${contentLength}`);
    }

    // Verify cache statistics
    const stats = persistenceResult.current.getCacheStats();
    expect(stats.totalEntries).toBe(3);
    expect(stats.markdownEntries).toBe(3);
    expect(stats.jsonEntries).toBe(0);
  });

  it('should handle cache invalidation when content length changes', async () => {
    const { result: persistenceResult } = renderHook(() => useStrategyPersistence());
    
    const contextId = 'test-context';
    const mockStrategies = {
      id: 'test-id',
      businessContext: {
        businessIdea: 'Test Business',
        targetMarket: 'Test Market',
        valueProposition: 'Test Value',
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
      generatedAt: new Date().toISOString(),
      version: '2.0'
    };

    // Save strategies with different content lengths
    act(() => {
      persistenceResult.current.saveMarkdownStrategies(
        mockStrategies,
        '# Brief Strategy',
        contextId,
        'brief'
      );
      persistenceResult.current.saveMarkdownStrategies(
        mockStrategies,
        '# Standard Strategy',
        contextId,
        'standard'
      );
      persistenceResult.current.saveMarkdownStrategies(
        mockStrategies,
        '# Detailed Strategy',
        contextId,
        'detailed'
      );
    });

    // Verify all are cached
    expect(persistenceResult.current.loadMarkdownStrategies(contextId, 'brief')).not.toBeNull();
    expect(persistenceResult.current.loadMarkdownStrategies(contextId, 'standard')).not.toBeNull();
    expect(persistenceResult.current.loadMarkdownStrategies(contextId, 'detailed')).not.toBeNull();

    // Invalidate specific content length
    act(() => {
      persistenceResult.current.invalidateContentLengthCache(contextId, 'standard');
    });

    // Verify only standard was invalidated
    expect(persistenceResult.current.loadMarkdownStrategies(contextId, 'brief')).not.toBeNull();
    expect(persistenceResult.current.loadMarkdownStrategies(contextId, 'standard')).toBeNull();
    expect(persistenceResult.current.loadMarkdownStrategies(contextId, 'detailed')).not.toBeNull();

    // Invalidate all content lengths for context
    act(() => {
      persistenceResult.current.invalidateAllContentLengthCaches(contextId);
    });

    // Verify all are invalidated
    expect(persistenceResult.current.loadMarkdownStrategies(contextId, 'brief')).toBeNull();
    expect(persistenceResult.current.loadMarkdownStrategies(contextId, 'standard')).toBeNull();
    expect(persistenceResult.current.loadMarkdownStrategies(contextId, 'detailed')).toBeNull();
  });

  it('should export and import markdown cache correctly', async () => {
    const { result: persistenceResult } = renderHook(() => useStrategyPersistence());
    
    const mockStrategies = {
      id: 'test-id',
      businessContext: {
        businessIdea: 'Test Business',
        targetMarket: 'Test Market',
        valueProposition: 'Test Value',
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
      generatedAt: new Date().toISOString(),
      version: '2.0'
    };

    // Save some markdown strategies
    act(() => {
      persistenceResult.current.saveMarkdownStrategies(
        mockStrategies,
        '# Test Strategy\nTest content',
        'test-context',
        'standard'
      );
    });

    // Export cache
    const exported = persistenceResult.current.exportCache();
    expect(exported).toBeTruthy();

    const exportedData = JSON.parse(exported);
    expect(exportedData).toHaveProperty('strategies');
    expect(exportedData).toHaveProperty('markdownCache');
    expect(exportedData.version).toBe('2.0');

    // Clear cache
    act(() => {
      persistenceResult.current.clearStrategies();
    });

    // Verify cache is empty
    expect(persistenceResult.current.getCacheStats().totalEntries).toBe(0);

    // Import cache
    let importSuccess: boolean;
    await act(async () => {
      importSuccess = persistenceResult.current.importCache(exported);
      // Wait for state updates
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    
    expect(importSuccess!).toBe(true);

    // Verify data was restored
    const stats = persistenceResult.current.getCacheStats();
    expect(stats.totalEntries).toBeGreaterThan(0); // Should have at least one entry
    // The entry might be converted during import, so just check that we have entries

    const loaded = persistenceResult.current.loadMarkdownStrategies('test-context', 'standard');
    expect(loaded).not.toBeNull();
    expect(loaded!.rawMarkdown).toBe('# Test Strategy\nTest content');
  });
});