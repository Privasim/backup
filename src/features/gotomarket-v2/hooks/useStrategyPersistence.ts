import { useState, useCallback, useEffect } from 'react';
import { GoToMarketStrategies } from '../types';

interface StrategyCache {
  [key: string]: {
    strategies: GoToMarketStrategies;
    timestamp: number;
    contextHash: string;
  };
}

interface UseStrategyPersistenceReturn {
  saveStrategies: (strategies: GoToMarketStrategies, contextId: string) => void;
  loadStrategies: (contextId: string) => GoToMarketStrategies | null;
  clearStrategies: (contextId?: string) => void;
  getCachedStrategies: () => Array<{ id: string; title: string; timestamp: number }>;
  exportCache: () => string;
  importCache: (data: string) => boolean;
}

const STORAGE_KEY = 'gotomarket-v2-strategies';
const CACHE_EXPIRY_DAYS = 30;

export const useStrategyPersistence = (): UseStrategyPersistenceReturn => {
  const [cache, setCache] = useState<StrategyCache>({});

  // Load cache from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as StrategyCache;
        // Clean expired entries
        const now = Date.now();
        const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
        
        const cleaned = Object.entries(parsed).reduce((acc, [key, value]) => {
          if (now - value.timestamp < expiryTime) {
            acc[key] = value;
          }
          return acc;
        }, {} as StrategyCache);
        
        setCache(cleaned);
        
        // Update localStorage if we cleaned anything
        if (Object.keys(cleaned).length !== Object.keys(parsed).length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
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

  const saveStrategies = useCallback((strategies: GoToMarketStrategies, contextId: string) => {
    const contextHash = generateContextHash(strategies.businessContext);
    
    setCache(prev => ({
      ...prev,
      [contextId]: {
        strategies,
        timestamp: Date.now(),
        contextHash
      }
    }));
  }, []);

  const loadStrategies = useCallback((contextId: string): GoToMarketStrategies | null => {
    const cached = cache[contextId];
    if (!cached) return null;

    // Check if cache is still valid
    const now = Date.now();
    const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    
    if (now - cached.timestamp > expiryTime) {
      // Remove expired entry
      setCache(prev => {
        const updated = { ...prev };
        delete updated[contextId];
        return updated;
      });
      return null;
    }

    return cached.strategies;
  }, [cache]);

  const clearStrategies = useCallback((contextId?: string) => {
    if (contextId) {
      setCache(prev => {
        const updated = { ...prev };
        delete updated[contextId];
        return updated;
      });
    } else {
      setCache({});
    }
  }, []);

  const getCachedStrategies = useCallback(() => {
    return Object.entries(cache).map(([id, data]) => ({
      id,
      title: data.strategies.businessContext.businessIdea,
      timestamp: data.timestamp
    })).sort((a, b) => b.timestamp - a.timestamp);
  }, [cache]);

  const exportCache = useCallback(() => {
    return JSON.stringify(cache, null, 2);
  }, [cache]);

  const importCache = useCallback((data: string): boolean => {
    try {
      const imported = JSON.parse(data) as StrategyCache;
      
      // Validate the imported data structure
      for (const [key, value] of Object.entries(imported)) {
        if (!value.strategies || !value.timestamp || !value.contextHash) {
          throw new Error('Invalid cache format');
        }
      }
      
      setCache(imported);
      return true;
    } catch (error) {
      console.error('Failed to import cache:', error);
      return false;
    }
  }, []);

  return {
    saveStrategies,
    loadStrategies,
    clearStrategies,
    getCachedStrategies,
    exportCache,
    importCache
  };
};

// Helper function to generate a hash for business context
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