import { renderHook, act } from '@testing-library/react';
import { useArtifactGeneration, getCacheStats, clearCache } from '../useArtifactGeneration';

// Mock dependencies
jest.mock('@/components/chatbox/ChatboxProvider', () => ({
  useChatbox: () => ({
    config: {
      apiKey: 'test-api-key',
      model: 'test-model'
    }
  })
}));

jest.mock('@/lib/openrouter', () => ({
  OpenRouterClient: jest.fn().mockImplementation(() => ({
    chat: jest.fn().mockResolvedValue({
      choices: [{
        message: {
          content: `function WireframeComponent() {
            const [count, setCount] = React.useState(0);
            return React.createElement('button', {
              onClick: () => setCount(count + 1)
            }, 'Count: ' + count);
          }
          ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(WireframeComponent));`
        }
      }]
    })
  }))
}));

jest.mock('../utils/transpile', () => ({
  transpileTsxToJs: jest.fn().mockResolvedValue({
    ok: true,
    js: 'compiled code'
  })
}));

describe('Wireframe Caching System', () => {
  beforeEach(() => {
    clearCache();
    jest.clearAllMocks();
  });

  describe('Cache key generation', () => {
    it('should generate consistent cache keys for same prompt and model', () => {
      const { result } = renderHook(() => useArtifactGeneration());
      
      const stats1 = result.current.getCacheStats();
      const initialSize = stats1.size;
      
      // Generate same wireframe twice
      act(() => {
        result.current.generateFromPrompt('Create a button');
      });
      
      // Wait for first generation to complete and cache
      setTimeout(() => {
        act(() => {
          result.current.generateFromPrompt('Create a button');
        });
        
        // Second call should hit cache
        expect(result.current.cacheHit).toBe(true);
      }, 100);
    });

    it('should generate different cache keys for different prompts', () => {
      const { result } = renderHook(() => useArtifactGeneration());
      
      act(() => {
        result.current.generateFromPrompt('Create a button');
      });
      
      setTimeout(() => {
        act(() => {
          result.current.generateFromPrompt('Create a form');
        });
        
        // Different prompt should not hit cache
        expect(result.current.cacheHit).toBe(false);
      }, 100);
    });

    it('should generate different cache keys for different models', () => {
      // Mock different model
      jest.doMock('@/components/chatbox/ChatboxProvider', () => ({
        useChatbox: () => ({
          config: {
            apiKey: 'test-api-key',
            model: 'different-model'
          }
        })
      }));

      const { result } = renderHook(() => useArtifactGeneration());
      
      act(() => {
        result.current.generateFromPrompt('Create a button');
      });
      
      // Should not hit cache with different model
      expect(result.current.cacheHit).toBe(false);
    });

    it('should normalize prompts for consistent caching', () => {
      const { result } = renderHook(() => useArtifactGeneration());
      
      const prompts = [
        'Create a button',
        'create a button',
        'CREATE A BUTTON',
        '  Create a button  ',
        'Create a button\n'
      ];
      
      // First prompt should miss cache
      act(() => {
        result.current.generateFromPrompt(prompts[0]);
      });
      
      setTimeout(() => {
        // All variations should hit cache due to normalization
        prompts.slice(1).forEach(prompt => {
          act(() => {
            result.current.generateFromPrompt(prompt);
          });
          expect(result.current.cacheHit).toBe(true);
        });
      }, 100);
    });
  });

  describe('Cache storage and retrieval', () => {
    it('should store successful wireframe results in cache', async () => {
      const { result } = renderHook(() => useArtifactGeneration());
      
      await act(async () => {
        await result.current.generateFromPrompt('Create a counter');
      });
      
      const stats = result.current.getCacheStats();
      expect(stats.size).toBe(1);
      expect(stats.entries[0].key).toContain('Create a counter');
      expect(stats.entries[0].model).toBe('test-model');
      expect(stats.entries[0].hitCount).toBe(0);
    });

    it('should not cache static wireframes', async () => {
      // Mock static wireframe response
      jest.doMock('@/lib/openrouter', () => ({
        OpenRouterClient: jest.fn().mockImplementation(() => ({
          chat: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: `function WireframeComponent() {
                  return React.createElement('div', {}, 'Static content');
                }`
              }
            }]
          }))
        }))
      }))
    }))
  }))
}));

      const { result } = renderHook(() => useArtifactGeneration());
      
      await act(async () => {
        await result.current.generateFromPrompt('Create static content');
      });
      
      const stats = result.current.getCacheStats();
      expect(stats.size).toBe(0); // Should not cache static wireframes
    });

    it('should retrieve cached results correctly', async () => {
      const { result } = renderHook(() => useArtifactGeneration());
      
      // First generation
      await act(async () => {
        await result.current.generateFromPrompt('Create a toggle');
      });
      
      const firstCode = result.current.code;
      expect(result.current.cacheHit).toBe(false);
      
      // Second generation should hit cache
      await act(async () => {
        await result.current.generateFromPrompt('Create a toggle');
      });
      
      expect(result.current.cacheHit).toBe(true);
      expect(result.current.code).toBe(firstCode);
    });

    it('should update hit count on cache access', async () => {
      const { result } = renderHook(() => useArtifactGeneration());
      
      await act(async () => {
        await result.current.generateFromPrompt('Create a slider');
      });
      
      let stats = result.current.getCacheStats();
      expect(stats.entries[0].hitCount).toBe(0);
      
      // Access cache multiple times
      await act(async () => {
        await result.current.generateFromPrompt('Create a slider');
      });
      
      await act(async () => {
        await result.current.generateFromPrompt('Create a slider');
      });
      
      stats = result.current.getCacheStats();
      expect(stats.entries[0].hitCount).toBe(2);
    });
  });

  describe('Cache eviction and LRU behavior', () => {
    it('should implement LRU eviction when cache is full', async () => {
      const { result } = renderHook(() => useArtifactGeneration());
      
      // Fill cache beyond max size (50 entries)
      const prompts = Array.from({ length: 52 }, (_, i) => `Create component ${i}`);
      
      for (const prompt of prompts) {
        await act(async () => {
          await result.current.generateFromPrompt(prompt);
        });
      }
      
      const stats = result.current.getCacheStats();
      expect(stats.size).toBeLessThanOrEqual(50); // Should not exceed max size
      
      // First entries should be evicted
      const keys = stats.entries.map(entry => entry.key);
      expect(keys.some(key => key.includes('Create component 0'))).toBe(false);
      expect(keys.some(key => key.includes('Create component 51'))).toBe(true);
    });

    it('should move accessed entries to end of LRU queue', async () => {
      const { result } = renderHook(() => useArtifactGeneration());
      
      // Create multiple cache entries
      await act(async () => {
        await result.current.generateFromPrompt('First component');
      });
      
      await act(async () => {
        await result.current.generateFromPrompt('Second component');
      });
      
      await act(async () => {
        await result.current.generateFromPrompt('Third component');
      });
      
      // Access first component again
      await act(async () => {
        await result.current.generateFromPrompt('First component');
      });
      
      const stats = result.current.getCacheStats();
      const lastEntry = stats.entries[stats.entries.length - 1];
      expect(lastEntry.key).toContain('First component');
      expect(lastEntry.hitCount).toBe(1);
    });

    it('should handle cache eviction gracefully', async () => {
      const { result } = renderHook(() => useArtifactGeneration());
      
      // Fill cache to capacity
      for (let i = 0; i < 50; i++) {
        await act(async () => {
          await result.current.generateFromPrompt(`Component ${i}`);
        });
      }
      
      let stats = result.current.getCacheStats();
      expect(stats.size).toBe(50);
      
      // Add one more to trigger eviction
      await act(async () => {
        await result.current.generateFromPrompt('New component');
      });
      
      stats = result.current.getCacheStats();
      expect(stats.size).toBe(50); // Should still be at max
      
      // Oldest entry should be evicted
      const keys = stats.entries.map(entry => entry.key);
      expect(keys.some(key => key.includes('Component 0'))).toBe(false);
      expect(keys.some(key => key.includes('New component'))).toBe(true);
    });
  });

  describe('Cache statistics and monitoring', () => {
    it('should provide accurate cache statistics', async () => {
      const { result } = renderHook(() => useArtifactGeneration());
      
      const initialStats = result.current.getCacheStats();
      expect(initialStats.size).toBe(0);
      expect(initialStats.maxSize).toBe(50);
      expect(initialStats.entries).toEqual([]);
      
      await act(async () => {
        await result.current.generateFromPrompt('Test component');
      });
      
      const updatedStats = result.current.getCacheStats();
      expect(updatedStats.size).toBe(1);
      expect(updatedStats.entries).toHaveLength(1);
      expect(updatedStats.entries[0]).toMatchObject({
        key: expect.stringContaining('Test component'),
        model: 'test-model',
        hitCount: 0,
        interactivityLevel: expect.any(String),
        timestamp: expect.any(Number)
      });
    });

    it('should track cache entry metadata correctly', async () => {
      const { result } = renderHook(() => useArtifactGeneration());
      
      const beforeTime = Date.now();
      
      await act(async () => {
        await result.current.generateFromPrompt('Metadata test');
      });
      
      const afterTime = Date.now();
      const stats = result.current.getCacheStats();
      const entry = stats.entries[0];
      
      expect(entry.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(entry.timestamp).toBeLessThanOrEqual(afterTime);
      expect(entry.model).toBe('test-model');
      expect(entry.hitCount).toBe(0);
      expect(['interactive', 'partial', 'static']).toContain(entry.interactivityLevel);
    });

    it('should truncate long cache keys in statistics', async () => {
      const { result } = renderHook(() => useArtifactGeneration());
      
      const longPrompt = 'Create a very long component description that exceeds the normal key length limit for display purposes in the cache statistics';
      
      await act(async () => {
        await result.current.generateFromPrompt(longPrompt);
      });
      
      const stats = result.current.getCacheStats();
      const entry = stats.entries[0];
      
      expect(entry.key.length).toBeLessThanOrEqual(53); // 50 chars + '...'
      expect(entry.key).toContain('...');
    });
  });

  describe('Cache clearing and management', () => {
    it('should clear cache completely', async () => {
      const { result } = renderHook(() => useArtifactGeneration());
      
      // Add some entries
      await act(async () => {
        await result.current.generateFromPrompt('Component 1');
      });
      
      await act(async () => {
        await result.current.generateFromPrompt('Component 2');
      });
      
      let stats = result.current.getCacheStats();
      expect(stats.size).toBe(2);
      
      // Clear cache
      act(() => {
        result.current.clearCache();
      });
      
      stats = result.current.getCacheStats();
      expect(stats.size).toBe(0);
      expect(stats.entries).toEqual([]);
    });

    it('should clear cache for specific prompt during regeneration', async () => {
      const { result } = renderHook(() => useArtifactGeneration());
      
      await act(async () => {
        await result.current.generateFromPrompt('Test regeneration');
      });
      
      expect(result.current.cacheHit).toBe(false);
      
      // Second call should hit cache
      await act(async () => {
        await result.current.generateFromPrompt('Test regeneration');
      });
      
      expect(result.current.cacheHit).toBe(true);
      
      // Regenerate with enhancements should clear cache for this prompt
      await act(async () => {
        await result.current.regenerateWithEnhancements();
      });
      
      expect(result.current.cacheHit).toBe(false);
    });

    it('should handle cache operations thread-safely', async () => {
      const { result } = renderHook(() => useArtifactGeneration());
      
      // Simulate concurrent cache operations
      const promises = Array.from({ length: 10 }, (_, i) =>
        act(async () => {
          await result.current.generateFromPrompt(`Concurrent ${i}`);
        })
      );
      
      await Promise.all(promises);
      
      const stats = result.current.getCacheStats();
      expect(stats.size).toBe(10);
      expect(stats.entries).toHaveLength(10);
      
      // All entries should have unique keys
      const keys = stats.entries.map(entry => entry.key);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });
  });

  describe('Cache integration with retry logic', () => {
    it('should not cache results from failed retries', async () => {
      // Mock static wireframe that will trigger retries
      jest.doMock('@/lib/openrouter', () => ({
        OpenRouterClient: jest.fn().mockImplementation(() => ({
          chat: jest.fn()
            .mockResolvedValueOnce({
              choices: [{
                message: {
                  content: `function WireframeComponent() {
                    return React.createElement('div', {}, 'Static');
                  }`
                }
              }]
            })
            .mockResolvedValueOnce({
              choices: [{
                message: {
                  content: `function WireframeComponent() {
                    const [count, setCount] = React.useState(0);
                    return React.createElement('button', {
                      onClick: () => setCount(count + 1)
                    }, count);
                  }`
                }
              }]
            })
        }))
      }));

      const { result } = renderHook(() => useArtifactGeneration());
      
      await act(async () => {
        await result.current.generateFromPrompt('Create interactive component');
      });
      
      // Should cache the final successful result, not the static retry attempts
      const stats = result.current.getCacheStats();
      expect(stats.size).toBe(1);
      expect(stats.entries[0].interactivityLevel).not.toBe('static');
    });

    it('should cache auto-repaired results', async () => {
      // Mock static wireframe that will be auto-repaired
      jest.doMock('@/lib/openrouter', () => ({
        OpenRouterClient: jest.fn().mockImplementation(() => ({
          chat: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: `function WireframeComponent() {
                  return React.createElement('button', {}, 'Static Button');
                }`
              }
            }]
          })
        }))
      }));

      const { result } = renderHook(() => useArtifactGeneration());
      
      await act(async () => {
        await result.current.generateFromPrompt('Create button');
      });
      
      // Should cache the auto-repaired result
      const stats = result.current.getCacheStats();
      expect(stats.size).toBe(1);
      
      // Cached result should be the enhanced version
      await act(async () => {
        await result.current.generateFromPrompt('Create button');
      });
      
      expect(result.current.cacheHit).toBe(true);
      expect(result.current.code).toContain('React.useState');
    });
  });
});