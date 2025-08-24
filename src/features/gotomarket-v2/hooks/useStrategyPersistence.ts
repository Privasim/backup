import { useState, useCallback, useEffect } from 'react';
import { GoToMarketStrategies, ContentLength, MarkdownGoToMarketStrategies } from '../types';
import { LegacyStrategyConverter } from '../utils/legacy-converter';

interface StrategyCacheEntry {
  strategies: GoToMarketStrategies;
  timestamp: number;
  contextHash: string;
  contentLength?: ContentLength;
  rawMarkdown?: string;
  format: 'json' | 'markdown';
}

interface StrategyCache {
  [key: string]: StrategyCacheEntry;
}

interface MarkdownCacheEntry {
  markdown: string;
  timestamp: number;
  contentLength: ContentLength;
  contextHash: string;
}

interface UseStrategyPersistenceReturn {
  // Legacy JSON methods
  saveStrategies: (strategies: GoToMarketStrategies, contextId: string) => void;
  loadStrategies: (contextId: string) => GoToMarketStrategies | null;
  
  // Markdown methods
  saveMarkdownStrategies: (strategies: GoToMarketStrategies, rawMarkdown: string, contextId: string, contentLength: ContentLength) => void;
  loadMarkdownStrategies: (contextId: string, contentLength: ContentLength) => { strategies: GoToMarketStrategies; rawMarkdown: string } | null;
  
  // Cache management
  clearStrategies: (contextId?: string, contentLength?: ContentLength) => void;
  getCachedStrategies: () => Array<{ id: string; title: string; timestamp: number; format: 'json' | 'markdown'; contentLength?: ContentLength }>;
  
  // Migration and export
  exportCache: () => string;
  importCache: (data: string) => boolean;
  migrateLegacyCache: () => void;
  
  // Cache invalidation
  invalidateContentLengthCache: (contextId: string, contentLength: ContentLength) => void;
  invalidateAllContentLengthCaches: (contextId: string) => void;
  getCacheStats: () => { totalEntries: number; markdownEntries: number; jsonEntries: number; oldestEntry: number | null };
}

const STORAGE_KEY = 'gotomarket-v2-strategies';
const MARKDOWN_STORAGE_KEY = 'gotomarket-v2-markdown-strategies';
const CACHE_EXPIRY_DAYS = 30;

export const useStrategyPersistence = (): UseStrategyPersistenceReturn => {
  const [cache, setCache] = useState<StrategyCache>({});
  const [markdownCache, setMarkdownCache] = useState<{ [key: string]: MarkdownCacheEntry }>({});

  // Load cache from localStorage on mount
  useEffect(() => {
    try {
      // Load legacy JSON cache
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as StrategyCache;
        const cleaned = cleanExpiredEntries(parsed);
        setCache(cleaned);
        
        if (Object.keys(cleaned).length !== Object.keys(parsed).length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
        }
      }

      // Load markdown cache
      const markdownStored = localStorage.getItem(MARKDOWN_STORAGE_KEY);
      if (markdownStored) {
        const parsed = JSON.parse(markdownStored);
        const cleaned = cleanExpiredMarkdownEntries(parsed);
        setMarkdownCache(cleaned);
        
        if (Object.keys(cleaned).length !== Object.keys(parsed).length) {
          localStorage.setItem(MARKDOWN_STORAGE_KEY, JSON.stringify(cleaned));
        }
      }
    } catch (error) {
      console.error('Failed to load strategies cache:', error);
    }
  }, []);

  // Save cache to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Failed to save strategies cache:', error);
    }
  }, [cache]);

  // Save markdown cache to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(MARKDOWN_STORAGE_KEY, JSON.stringify(markdownCache));
    } catch (error) {
      console.error('Failed to save markdown cache:', error);
    }
  }, [markdownCache]);

  const saveStrategies = useCallback((strategies: GoToMarketStrategies, contextId: string) => {
    const contextHash = generateContextHash(strategies.businessContext);
    
    setCache(prev => ({
      ...prev,
      [contextId]: {
        strategies,
        timestamp: Date.now(),
        contextHash,
        format: 'json'
      }
    }));
  }, []);

  const saveMarkdownStrategies = useCallback((
    strategies: GoToMarketStrategies, 
    rawMarkdown: string, 
    contextId: string, 
    contentLength: ContentLength
  ) => {
    const contextHash = generateContextHash(strategies.businessContext);
    const cacheKey = `${contextId}-${contentLength}`;
    
    // Save to markdown cache
    setMarkdownCache(prev => ({
      ...prev,
      [cacheKey]: {
        markdown: rawMarkdown,
        timestamp: Date.now(),
        contentLength,
        contextHash
      }
    }));

    // Also save to main cache with markdown format
    setCache(prev => ({
      ...prev,
      [cacheKey]: {
        strategies,
        timestamp: Date.now(),
        contextHash,
        contentLength,
        rawMarkdown,
        format: 'markdown'
      }
    }));
  }, []);

  const loadStrategies = useCallback((contextId: string): GoToMarketStrategies | null => {
    const cached = cache[contextId];
    if (!cached) return null;

    if (isExpired(cached.timestamp)) {
      setCache(prev => {
        const updated = { ...prev };
        delete updated[contextId];
        return updated;
      });
      return null;
    }

    return cached.strategies;
  }, [cache]);

  const loadMarkdownStrategies = useCallback((
    contextId: string, 
    contentLength: ContentLength
  ): { strategies: GoToMarketStrategies; rawMarkdown: string } | null => {
    const cacheKey = `${contextId}-${contentLength}`;
    const cached = cache[cacheKey];
    const markdownCached = markdownCache[cacheKey];
    
    if (!cached || !markdownCached) return null;

    if (isExpired(cached.timestamp) || isExpired(markdownCached.timestamp)) {
      // Remove expired entries
      setCache(prev => {
        const updated = { ...prev };
        delete updated[cacheKey];
        return updated;
      });
      setMarkdownCache(prev => {
        const updated = { ...prev };
        delete updated[cacheKey];
        return updated;
      });
      return null;
    }

    return {
      strategies: cached.strategies,
      rawMarkdown: markdownCached.markdown
    };
  }, [cache, markdownCache]);

  const clearStrategies = useCallback((contextId?: string, contentLength?: ContentLength) => {
    if (contextId) {
      if (contentLength) {
        // Clear specific content length cache
        const cacheKey = `${contextId}-${contentLength}`;
        setCache(prev => {
          const updated = { ...prev };
          delete updated[cacheKey];
          return updated;
        });
        setMarkdownCache(prev => {
          const updated = { ...prev };
          delete updated[cacheKey];
          return updated;
        });
      } else {
        // Clear all caches for this context
        setCache(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(key => {
            if (key.startsWith(contextId)) {
              delete updated[key];
            }
          });
          return updated;
        });
        setMarkdownCache(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(key => {
            if (key.startsWith(contextId)) {
              delete updated[key];
            }
          });
          return updated;
        });
      }
    } else {
      // Clear all caches
      setCache({});
      setMarkdownCache({});
    }
  }, []);

  const getCachedStrategies = useCallback(() => {
    return Object.entries(cache).map(([id, data]) => ({
      id,
      title: data.strategies.businessContext.businessIdea,
      timestamp: data.timestamp,
      format: data.format,
      contentLength: data.contentLength
    })).sort((a, b) => b.timestamp - a.timestamp);
  }, [cache]);

  const exportCache = useCallback(() => {
    return JSON.stringify({
      strategies: cache,
      markdownCache: markdownCache,
      exportedAt: new Date().toISOString(),
      version: '2.0'
    }, null, 2);
  }, [cache, markdownCache]);

  const importCache = useCallback((data: string): boolean => {
    try {
      const imported = JSON.parse(data);
      
      // Handle both old and new cache formats
      if (imported.strategies && imported.markdownCache && !imported.version) {
        // New format with separate caches (legacy v2.0)
        setCache(imported.strategies);
        setMarkdownCache(imported.markdownCache);
        return true;
      } else if (imported.version && imported.version === '2.0') {
        // Version 2.0 format - enhanced import
        return importEnhancedFormatInternal(imported);
      } else {
        // Legacy format - assume it's the old StrategyCache
        return importLegacyFormatInternal(imported);
      }
    } catch (error) {
      console.error('Failed to import cache:', error);
      return false;
    }
  }, []);

  const importEnhancedFormatInternal = (imported: any): boolean => {
    try {
      // Validate enhanced format structure
      if (!imported.strategies && !imported.markdownCache) {
        throw new Error('Invalid enhanced format: missing required sections');
      }

      const strategiesCache: StrategyCache = {};
      const markdownCacheData: { [key: string]: MarkdownCacheEntry } = {};

      // Process strategies with format detection and conversion
      if (imported.strategies) {
        Object.entries(imported.strategies).forEach(([key, value]: [string, any]) => {
          const format = LegacyStrategyConverter.detectFormat(value.strategies || value);
          
          if (format === 'json') {
            // Convert JSON to markdown format
            const conversionResult = LegacyStrategyConverter.convertJsonToMarkdown(value.strategies || value);
            if (conversionResult.success && conversionResult.data) {
              strategiesCache[key] = {
                strategies: value.strategies || value,
                timestamp: value.timestamp || Date.now(),
                contextHash: value.contextHash || generateContextHash(value.strategies?.businessContext || {}),
                format: 'markdown',
                rawMarkdown: conversionResult.data.rawMarkdown,
                contentLength: conversionResult.data.metadata.contentLength
              };

              // Add to markdown cache
              markdownCacheData[key] = {
                markdown: conversionResult.data.rawMarkdown,
                timestamp: value.timestamp || Date.now(),
                contentLength: conversionResult.data.metadata.contentLength,
                contextHash: value.contextHash || generateContextHash(value.strategies?.businessContext || {})
              };
            } else {
              // Keep as JSON if conversion fails
              strategiesCache[key] = {
                strategies: value.strategies || value,
                timestamp: value.timestamp || Date.now(),
                contextHash: value.contextHash || generateContextHash(value.strategies?.businessContext || {}),
                format: 'json'
              };
            }
          } else if (format === 'markdown') {
            // Already in markdown format
            strategiesCache[key] = value;
          } else {
            console.warn(`Unknown format for entry ${key}, skipping`);
          }
        });
      }

      // Process existing markdown cache
      if (imported.markdownCache) {
        Object.entries(imported.markdownCache).forEach(([key, value]: [string, any]) => {
          if (value.markdown && value.timestamp && value.contentLength) {
            markdownCacheData[key] = value;
          }
        });
      }

      setCache(strategiesCache);
      setMarkdownCache(markdownCacheData);
      
      return true;
    } catch (error) {
      console.error('Failed to import enhanced format:', error);
      return false;
    }
  };

  const importLegacyFormatInternal = (imported: any): boolean => {
    try {
      const legacyCache = imported as StrategyCache;
      const convertedCache: StrategyCache = {};
      const newMarkdownCache: { [key: string]: MarkdownCacheEntry } = {};

      // Validate and convert legacy entries
      for (const [key, value] of Object.entries(legacyCache)) {
        if (!value.strategies || !value.timestamp || !value.contextHash) {
          console.warn(`Invalid legacy entry ${key}, skipping`);
          continue;
        }

        // Try to convert to markdown format
        try {
          const conversionResult = LegacyStrategyConverter.convertJsonToMarkdown(value.strategies);
          if (conversionResult.success && conversionResult.data) {
            convertedCache[key] = {
              ...value,
              format: 'markdown',
              rawMarkdown: conversionResult.data.rawMarkdown,
              contentLength: conversionResult.data.metadata.contentLength
            };

            newMarkdownCache[key] = {
              markdown: conversionResult.data.rawMarkdown,
              timestamp: value.timestamp,
              contentLength: conversionResult.data.metadata.contentLength,
              contextHash: value.contextHash
            };
          } else {
            // Keep as JSON if conversion fails
            convertedCache[key] = {
              ...value,
              format: 'json'
            };
          }
        } catch (conversionError) {
          console.warn(`Failed to convert legacy entry ${key}:`, conversionError);
          convertedCache[key] = {
            ...value,
            format: 'json'
          };
        }
      }

      setCache(convertedCache);
      setMarkdownCache(newMarkdownCache);
      
      return true;
    } catch (error) {
      console.error('Failed to import legacy format:', error);
      return false;
    }
  };



  const migrateLegacyCache = useCallback(() => {
    let migrationCount = 0;
    
    // Migrate old cache entries to new format
    setCache(prev => {
      const updated = { ...prev };
      Object.entries(updated).forEach(([key, entry]) => {
        // Add format field if missing (legacy entries)
        if (!entry.format) {
          updated[key] = { ...entry, format: 'json' };
          migrationCount++;
        }
        
        // Convert JSON entries to markdown format if they don't have markdown data
        if (entry.format === 'json' && !entry.rawMarkdown) {
          try {
            const conversionResult = LegacyStrategyConverter.convertJsonToMarkdown(entry.strategies);
            
            if (conversionResult.success && conversionResult.data) {
              // Update the cache entry with markdown data
              updated[key] = {
                ...entry,
                format: 'markdown',
                rawMarkdown: conversionResult.data.rawMarkdown,
                contentLength: conversionResult.data.metadata.contentLength
              };
              migrationCount++;
            } else {
              console.warn(`Failed to migrate cache entry ${key}: ${conversionResult.error}`);
              // Try recovery
              try {
                const recovered = LegacyStrategyConverter.recoverFromFailure(entry.strategies, conversionResult.error || 'Unknown error');
                updated[key] = {
                  ...entry,
                  format: 'markdown',
                  rawMarkdown: recovered.rawMarkdown,
                  contentLength: recovered.metadata.contentLength
                };
                migrationCount++;
              } catch (recoveryError) {
                console.error(`Recovery failed for cache entry ${key}:`, recoveryError);
                // Keep as JSON format if both conversion and recovery fail
                updated[key] = { ...entry, format: 'json' };
              }
            }
          } catch (error) {
            console.error(`Failed to migrate cache entry ${key}:`, error);
            // Keep as JSON format if conversion fails
            updated[key] = { ...entry, format: 'json' };
          }
        }
      });
      return updated;
    });
    
    // Update markdown cache for migrated entries
    if (migrationCount > 0) {
      setMarkdownCache(prevMarkdown => {
        const updatedMarkdown = { ...prevMarkdown };
        Object.entries(updated).forEach(([key, entry]) => {
          if (entry.format === 'markdown' && entry.rawMarkdown && !updatedMarkdown[key]) {
            updatedMarkdown[key] = {
              markdown: entry.rawMarkdown,
              timestamp: entry.timestamp,
              contentLength: entry.contentLength || 'standard',
              contextHash: entry.contextHash
            };
          }
        });
        return updatedMarkdown;
      });
      
      console.log(`Successfully migrated ${migrationCount} cache entries to markdown format`);
    }
  }, []);

  const invalidateContentLengthCache = useCallback((contextId: string, contentLength: ContentLength) => {
    const cacheKey = `${contextId}-${contentLength}`;
    setCache(prev => {
      const updated = { ...prev };
      delete updated[cacheKey];
      return updated;
    });
    setMarkdownCache(prev => {
      const updated = { ...prev };
      delete updated[cacheKey];
      return updated;
    });
  }, []);

  const invalidateAllContentLengthCaches = useCallback((contextId: string) => {
    const contentLengths: ContentLength[] = ['brief', 'standard', 'detailed'];
    
    setCache(prev => {
      const updated = { ...prev };
      contentLengths.forEach(length => {
        const cacheKey = `${contextId}-${length}`;
        delete updated[cacheKey];
      });
      return updated;
    });
    
    setMarkdownCache(prev => {
      const updated = { ...prev };
      contentLengths.forEach(length => {
        const cacheKey = `${contextId}-${length}`;
        delete updated[cacheKey];
      });
      return updated;
    });
  }, []);

  const getCacheStats = useCallback(() => {
    const entries = Object.values(cache);
    const markdownEntries = entries.filter(entry => entry.format === 'markdown').length;
    const jsonEntries = entries.filter(entry => entry.format === 'json' || !entry.format).length; // Include legacy entries without format
    const oldestEntry = entries.length > 0 ? Math.min(...entries.map(entry => entry.timestamp)) : null;
    
    return {
      totalEntries: entries.length,
      markdownEntries,
      jsonEntries,
      oldestEntry
    };
  }, [cache]);

  return {
    // Legacy JSON methods
    saveStrategies,
    loadStrategies,
    
    // Markdown methods
    saveMarkdownStrategies,
    loadMarkdownStrategies,
    
    // Cache management
    clearStrategies,
    getCachedStrategies,
    
    // Migration and export
    exportCache,
    importCache,
    migrateLegacyCache,
    
    // Cache invalidation
    invalidateContentLengthCache,
    invalidateAllContentLengthCaches,
    getCacheStats
  };
};

// Helper functions
function generateContextHash(context: any): string {
  const str = JSON.stringify(context);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

function isExpired(timestamp: number): boolean {
  const now = Date.now();
  const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  return now - timestamp > expiryTime;
}

function cleanExpiredEntries(cache: StrategyCache): StrategyCache {
  return Object.entries(cache).reduce((acc, [key, value]) => {
    if (!isExpired(value.timestamp)) {
      acc[key] = value;
    }
    return acc;
  }, {} as StrategyCache);
}

function cleanExpiredMarkdownEntries(cache: { [key: string]: MarkdownCacheEntry }): { [key: string]: MarkdownCacheEntry } {
  return Object.entries(cache).reduce((acc, [key, value]) => {
    if (!isExpired(value.timestamp)) {
      acc[key] = value;
    }
    return acc;
  }, {} as { [key: string]: MarkdownCacheEntry });
}