import { renderHook, act } from '@testing-library/react';
import { useStrategyPersistence } from '../hooks/useStrategyPersistence';
import { GoToMarketStrategies, ContentLength } from '../types';

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

describe('Enhanced Import Functionality', () => {
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
    marketingStrategies: [
      {
        id: 'marketing-1',
        type: 'digital',
        title: 'Digital Marketing',
        description: 'Online marketing strategy',
        tactics: [],
        budget: { min: '$1000', max: '$5000', currency: 'USD' },
        timeline: '3 months',
        expectedROI: '200%',
        difficulty: 'medium',
        completed: false
      }
    ],
    salesChannels: [],
    pricingStrategies: [],
    distributionPlans: [],
    implementationTimeline: [],
    toolRecommendations: [],
    generatedAt: new Date().toISOString(),
    version: '2.0'
  };

  describe('Enhanced format import', () => {
    it('should import enhanced format with both JSON and markdown data', async () => {
      const { result } = renderHook(() => useStrategyPersistence());
      
      const enhancedData = {
        version: '2.0',
        strategies: {
          'test-key': {
            strategies: mockStrategies,
            timestamp: Date.now(),
            contextHash: 'test-hash',
            format: 'json'
          }
        },
        markdownCache: {
          'test-key': {
            markdown: '# Test Strategy\nTest content',
            timestamp: Date.now(),
            contentLength: 'standard' as ContentLength,
            contextHash: 'test-hash'
          }
        },
        exportedAt: new Date().toISOString()
      };

      let success: boolean;
      await act(async () => {
        success = result.current.importCache(JSON.stringify(enhancedData));
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(success!).toBe(true);
      const stats = result.current.getCacheStats();
      expect(stats.totalEntries).toBeGreaterThan(0);
    });

    it('should convert JSON entries to markdown during import', async () => {
      const { result } = renderHook(() => useStrategyPersistence());
      
      const enhancedData = {
        version: '2.0',
        strategies: {
          'json-entry': {
            strategies: mockStrategies,
            timestamp: Date.now(),
            contextHash: 'test-hash',
            format: 'json'
          }
        },
        markdownCache: {},
        exportedAt: new Date().toISOString()
      };

      let success: boolean;
      await act(async () => {
        success = result.current.importCache(JSON.stringify(enhancedData));
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(success!).toBe(true);
      
      // Should have converted JSON to markdown
      const stats = result.current.getCacheStats();
      expect(stats.markdownEntries).toBeGreaterThan(0);
    });

    it('should handle mixed format entries correctly', async () => {
      const { result } = renderHook(() => useStrategyPersistence());
      
      const enhancedData = {
        version: '2.0',
        strategies: {
          'json-entry': {
            strategies: mockStrategies,
            timestamp: Date.now(),
            contextHash: 'test-hash',
            format: 'json'
          },
          'markdown-entry': {
            strategies: mockStrategies,
            timestamp: Date.now(),
            contextHash: 'test-hash-2',
            format: 'markdown',
            rawMarkdown: '# Existing Markdown\nContent here',
            contentLength: 'standard'
          }
        },
        markdownCache: {
          'markdown-entry': {
            markdown: '# Existing Markdown\nContent here',
            timestamp: Date.now(),
            contentLength: 'standard' as ContentLength,
            contextHash: 'test-hash-2'
          }
        },
        exportedAt: new Date().toISOString()
      };

      let success: boolean;
      await act(async () => {
        success = result.current.importCache(JSON.stringify(enhancedData));
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(success!).toBe(true);
      
      const stats = result.current.getCacheStats();
      expect(stats.totalEntries).toBe(2);
      expect(stats.markdownEntries).toBe(2); // Both should be markdown after import
    });

    it('should handle conversion failures gracefully', async () => {
      const { result } = renderHook(() => useStrategyPersistence());
      
      const invalidStrategies = {
        ...mockStrategies,
        id: '', // Invalid - will cause conversion to fail
        businessContext: null
      };

      const enhancedData = {
        version: '2.0',
        strategies: {
          'invalid-entry': {
            strategies: invalidStrategies,
            timestamp: Date.now(),
            contextHash: 'test-hash',
            format: 'json'
          }
        },
        markdownCache: {},
        exportedAt: new Date().toISOString()
      };

      let success: boolean;
      await act(async () => {
        success = result.current.importCache(JSON.stringify(enhancedData));
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(success!).toBe(true); // Should still succeed
      // The conversion should fail but not cause the import to fail
      const stats = result.current.getCacheStats();
      expect(stats.totalEntries).toBeGreaterThan(0);
    });
  });

  describe('Legacy format import with conversion', () => {
    it('should import and convert legacy JSON format', async () => {
      const { result } = renderHook(() => useStrategyPersistence());
      
      const legacyData = {
        'legacy-entry': {
          strategies: mockStrategies,
          timestamp: Date.now(),
          contextHash: 'test-hash'
          // No format field - this is legacy
        }
      };

      let success: boolean;
      await act(async () => {
        success = result.current.importCache(JSON.stringify(legacyData));
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(success!).toBe(true);
      
      // Should have converted to markdown
      const stats = result.current.getCacheStats();
      expect(stats.totalEntries).toBe(1);
      expect(stats.markdownEntries).toBe(1);
    });

    it('should handle invalid legacy entries', async () => {
      const { result } = renderHook(() => useStrategyPersistence());
      
      const invalidLegacyData = {
        'invalid-entry': {
          // Missing required fields
          timestamp: Date.now()
        }
      };

      let success: boolean;
      await act(async () => {
        success = result.current.importCache(JSON.stringify(invalidLegacyData));
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(success!).toBe(true); // Should still succeed
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        'Invalid legacy entry invalid-entry, skipping'
      );
    });

    it('should preserve valid entries when some fail conversion', async () => {
      const { result } = renderHook(() => useStrategyPersistence());
      
      const mixedLegacyData = {
        'valid-entry': {
          strategies: mockStrategies,
          timestamp: Date.now(),
          contextHash: 'test-hash'
        },
        'invalid-entry': {
          strategies: null, // Invalid
          timestamp: Date.now(),
          contextHash: 'test-hash-2'
        }
      };

      let success: boolean;
      await act(async () => {
        success = result.current.importCache(JSON.stringify(mixedLegacyData));
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(success!).toBe(true);
      
      // Should have at least one valid entry
      const stats = result.current.getCacheStats();
      expect(stats.totalEntries).toBeGreaterThan(0);
    });
  });

  describe('Format detection and handling', () => {
    it('should detect and handle unknown formats', async () => {
      const { result } = renderHook(() => useStrategyPersistence());
      
      const unknownFormatData = {
        version: '2.0',
        strategies: {
          'unknown-entry': {
            someUnknownField: 'value',
            timestamp: Date.now(),
            contextHash: 'test-hash'
          }
        },
        markdownCache: {},
        exportedAt: new Date().toISOString()
      };

      let success: boolean;
      await act(async () => {
        success = result.current.importCache(JSON.stringify(unknownFormatData));
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(success!).toBe(true);
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        'Unknown format for entry unknown-entry, skipping'
      );
    });

    it('should handle malformed JSON gracefully', async () => {
      const { result } = renderHook(() => useStrategyPersistence());
      
      const malformedJson = '{ invalid json }';

      const success = result.current.importCache(malformedJson);
      
      expect(success).toBe(false);
      expect(consoleSpy.error).toHaveBeenCalledWith(
        'Failed to import cache:',
        expect.any(Error)
      );
    });
  });

  describe('Migration integration', () => {
    it('should work with migration functionality', async () => {
      const { result } = renderHook(() => useStrategyPersistence());
      
      // First import legacy data
      const legacyData = {
        'legacy-entry': {
          strategies: mockStrategies,
          timestamp: Date.now(),
          contextHash: 'test-hash'
        }
      };

      await act(async () => {
        result.current.importCache(JSON.stringify(legacyData));
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      // Then run migration
      await act(async () => {
        result.current.migrateLegacyCache();
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      const stats = result.current.getCacheStats();
      expect(stats.markdownEntries).toBeGreaterThan(0);
    });
  });
});