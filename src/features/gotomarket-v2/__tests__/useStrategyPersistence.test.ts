import { renderHook, act } from '@testing-library/react';
import { useStrategyPersistence } from '../hooks/useStrategyPersistence';
import { GoToMarketStrategies, ContentLength } from '../types';
import { LegacyStrategyConverter } from '../utils/legacy-converter';

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

// Mock console methods
const consoleSpy = {
  error: jest.spyOn(console, 'error').mockImplementation(() => {}),
  log: jest.spyOn(console, 'log').mockImplementation(() => {}),
  warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
};

describe('useStrategyPersistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterAll(() => {
    Object.values(consoleSpy).forEach(spy => spy.mockRestore());
  });

  const mockStrategies: GoToMarketStrategies = {
    id: 'test-id',
    businessContext: {
      businessIdea: 'Test Business',
      targetMarket: 'Test Market',
      valueProposition: 'Test Value',
      implementationPhases: [],
      goals: ['Goal 1'],
      constraints: ['Constraint 1']
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

  describe('Markdown caching', () => {
    it('should save and load markdown strategies with content length', () => {
      const { result } = renderHook(() => useStrategyPersistence());
      const rawMarkdown = '# Marketing Strategy\nTest content';
      const contentLength: ContentLength = 'standard';
      const contextId = 'test-context';

      act(() => {
        result.current.saveMarkdownStrategies(mockStrategies, rawMarkdown, contextId, contentLength);
      });

      const loaded = result.current.loadMarkdownStrategies(contextId, contentLength);
      expect(loaded).toEqual({
        strategies: mockStrategies,
        rawMarkdown
      });
    });

    it('should handle different content lengths separately', () => {
      const { result } = renderHook(() => useStrategyPersistence());
      const contextId = 'test-context';
      const briefMarkdown = '# Brief Strategy\nShort content';
      const detailedMarkdown = '# Detailed Strategy\nLong detailed content with more information';

      act(() => {
        result.current.saveMarkdownStrategies(mockStrategies, briefMarkdown, contextId, 'brief');
        result.current.saveMarkdownStrategies(mockStrategies, detailedMarkdown, contextId, 'detailed');
      });

      const briefLoaded = result.current.loadMarkdownStrategies(contextId, 'brief');
      const detailedLoaded = result.current.loadMarkdownStrategies(contextId, 'detailed');
      const standardLoaded = result.current.loadMarkdownStrategies(contextId, 'standard');

      expect(briefLoaded?.rawMarkdown).toBe(briefMarkdown);
      expect(detailedLoaded?.rawMarkdown).toBe(detailedMarkdown);
      expect(standardLoaded).toBeNull();
    });

    it('should invalidate content length cache correctly', () => {
      const { result } = renderHook(() => useStrategyPersistence());
      const contextId = 'test-context';
      const rawMarkdown = '# Test Strategy';

      act(() => {
        result.current.saveMarkdownStrategies(mockStrategies, rawMarkdown, contextId, 'standard');
      });

      expect(result.current.loadMarkdownStrategies(contextId, 'standard')).not.toBeNull();

      act(() => {
        result.current.invalidateContentLengthCache(contextId, 'standard');
      });

      expect(result.current.loadMarkdownStrategies(contextId, 'standard')).toBeNull();
    });

    it('should invalidate all content length caches for a context', () => {
      const { result } = renderHook(() => useStrategyPersistence());
      const contextId = 'test-context';
      const rawMarkdown = '# Test Strategy';

      act(() => {
        result.current.saveMarkdownStrategies(mockStrategies, rawMarkdown, contextId, 'brief');
        result.current.saveMarkdownStrategies(mockStrategies, rawMarkdown, contextId, 'standard');
        result.current.saveMarkdownStrategies(mockStrategies, rawMarkdown, contextId, 'detailed');
      });

      expect(result.current.loadMarkdownStrategies(contextId, 'brief')).not.toBeNull();
      expect(result.current.loadMarkdownStrategies(contextId, 'standard')).not.toBeNull();
      expect(result.current.loadMarkdownStrategies(contextId, 'detailed')).not.toBeNull();

      act(() => {
        result.current.invalidateAllContentLengthCaches(contextId);
      });

      expect(result.current.loadMarkdownStrategies(contextId, 'brief')).toBeNull();
      expect(result.current.loadMarkdownStrategies(contextId, 'standard')).toBeNull();
      expect(result.current.loadMarkdownStrategies(contextId, 'detailed')).toBeNull();
    });
  });

  describe('Cache statistics', () => {
    it('should provide accurate cache statistics', () => {
      const { result } = renderHook(() => useStrategyPersistence());
      const contextId = 'test-context';
      const rawMarkdown = '# Test Strategy';

      // Initially empty
      expect(result.current.getCacheStats()).toEqual({
        totalEntries: 0,
        markdownEntries: 0,
        jsonEntries: 0,
        oldestEntry: null
      });

      act(() => {
        // Add markdown entry
        result.current.saveMarkdownStrategies(mockStrategies, rawMarkdown, contextId, 'standard');
        // Add JSON entry
        result.current.saveStrategies(mockStrategies, 'json-context');
      });

      const stats = result.current.getCacheStats();
      expect(stats.totalEntries).toBe(2);
      expect(stats.markdownEntries).toBe(1);
      expect(stats.jsonEntries).toBe(1);
      expect(stats.oldestEntry).toBeGreaterThan(0);
    });
  });

  describe('Legacy migration', () => {
    it('should migrate legacy cache entries', async () => {
      // Create a fresh hook instance for this test
      const { result } = renderHook(() => useStrategyPersistence());

      // First, manually add a legacy entry (simulating what would be loaded from localStorage)
      act(() => {
        result.current.saveStrategies(mockStrategies, 'legacy-entry');
      });

      // Verify the entry was added as JSON format
      let initialStats = result.current.getCacheStats();
      expect(initialStats.totalEntries).toBe(1);
      expect(initialStats.jsonEntries).toBe(1);
      expect(initialStats.markdownEntries).toBe(0);

      // Now trigger migration
      await act(async () => {
        result.current.migrateLegacyCache();
        // Wait for state updates to complete
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      // Should have converted to markdown format
      const finalStats = result.current.getCacheStats();
      expect(finalStats.totalEntries).toBe(1);
      expect(finalStats.markdownEntries).toBe(1);
      expect(finalStats.jsonEntries).toBe(0);
    });
  });

  describe('Export and import', () => {
    it('should export cache with both strategies and markdown cache', () => {
      const { result } = renderHook(() => useStrategyPersistence());
      const contextId = 'test-context';
      const rawMarkdown = '# Test Strategy';

      act(() => {
        result.current.saveMarkdownStrategies(mockStrategies, rawMarkdown, contextId, 'standard');
      });

      const exported = result.current.exportCache();
      const parsed = JSON.parse(exported);

      expect(parsed).toHaveProperty('strategies');
      expect(parsed).toHaveProperty('markdownCache');
      expect(parsed).toHaveProperty('exportedAt');
      expect(parsed).toHaveProperty('version');
      expect(parsed.version).toBe('2.0');
    });

    it('should import cache successfully', async () => {
      const { result } = renderHook(() => useStrategyPersistence());
      
      // Use the legacy format without version for direct import
      const importData = {
        strategies: {
          'test-key': {
            strategies: mockStrategies,
            timestamp: Date.now(),
            contextHash: 'test-hash',
            format: 'markdown',
            rawMarkdown: '# Test'
          }
        },
        markdownCache: {
          'test-key': {
            markdown: '# Test',
            timestamp: Date.now(),
            contentLength: 'standard' as ContentLength,
            contextHash: 'test-hash'
          }
        },
        exportedAt: new Date().toISOString()
        // No version field - this will be treated as legacy v2.0 format
      };

      let success: boolean;
      await act(async () => {
        success = result.current.importCache(JSON.stringify(importData));
        // Wait for state updates to complete
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(success!).toBe(true);

      const stats = result.current.getCacheStats();
      expect(stats.totalEntries).toBe(1);
      expect(stats.markdownEntries).toBe(1);
    });

    it('should handle legacy import format', async () => {
      const { result } = renderHook(() => useStrategyPersistence());
      
      const legacyImportData = {
        'legacy-key': {
          strategies: mockStrategies,
          timestamp: Date.now(),
          contextHash: 'test-hash'
        }
      };

      let success: boolean;
      await act(async () => {
        success = result.current.importCache(JSON.stringify(legacyImportData));
        // Wait for state updates to complete
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(success!).toBe(true);

      const stats = result.current.getCacheStats();
      expect(stats.totalEntries).toBe(1);
    });
  });

  describe('Error handling', () => {
    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const { result } = renderHook(() => useStrategyPersistence());

      act(() => {
        result.current.saveMarkdownStrategies(mockStrategies, '# Test', 'context', 'standard');
      });

      expect(consoleSpy.error).toHaveBeenCalledWith(
        'Failed to save markdown cache:',
        expect.any(Error)
      );
    });

    it('should handle invalid import data', () => {
      const { result } = renderHook(() => useStrategyPersistence());
      
      const success = result.current.importCache('invalid json');
      expect(success).toBe(false);
      expect(consoleSpy.error).toHaveBeenCalledWith(
        'Failed to import cache:',
        expect.any(Error)
      );
    });
  });
});