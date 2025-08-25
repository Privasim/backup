const CACHE_PREFIX = 'gtmV2:cache:v1:';
const ERROR_PREFIX = 'gtmV2:error:v1:';

export interface GoToMarketCache {
  strategyContent: string;
  contextHash: string;
  timestamp: number;
  expiresAt: number;
}

export interface GoToMarketError {
  message: string;
  timestamp: number;
  context: string;
}

/**
 * Generate a hash for the implementation context to use as part of cache key
 */
export const contextHash = (context: any): string => {
  try {
    const data = JSON.stringify(context);
    let hash = 0;
    for (let i = 0; i < data.length; i++) hash = ((hash << 5) - hash) + data.charCodeAt(i) | 0;
    return String(hash);
  } catch {
    return '0';
  }
};

/**
 * Save generated strategy to cache
 */
export function saveCachedStrategy(ideaId: string, context: any, strategyContent: string) {
  const hash = contextHash(context);
  const key = `${CACHE_PREFIX}${ideaId}:${hash}`;
  
  const cache: GoToMarketCache = {
    strategyContent,
    contextHash: hash,
    timestamp: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  };
  
  try {
    localStorage.setItem(key, JSON.stringify(cache));
    return true;
  } catch (error) {
    console.warn('Failed to cache go-to-market strategy', error);
    return false;
  }
}

/**
 * Load cached strategy if available and not expired
 */
export function loadCachedStrategy(ideaId: string, context: any): string | null {
  const hash = contextHash(context);
  const key = `${CACHE_PREFIX}${ideaId}:${hash}`;
  
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    
    const cache: GoToMarketCache = JSON.parse(raw);
    
    // Check if cache is expired
    if (Date.now() > cache.expiresAt) {
      // Remove expired cache
      localStorage.removeItem(key);
      return null;
    }
    
    // Check if context hash matches
    if (cache.contextHash !== hash) {
      return null;
    }
    
    return cache.strategyContent;
  } catch (error) {
    console.warn('Failed to load cached go-to-market strategy', error);
    return null;
  }
}

/**
 * Save error for debugging purposes
 */
export function saveError(ideaId: string, context: any, message: string) {
  const hash = contextHash(context);
  const key = `${ERROR_PREFIX}${ideaId}:${hash}:${Date.now()}`;
  
  const error: GoToMarketError = {
    message,
    timestamp: Date.now(),
    context: hash
  };
  
  try {
    localStorage.setItem(key, JSON.stringify(error));
    return true;
  } catch (error) {
    console.warn('Failed to save go-to-market error', error);
    return false;
  }
}

/**
 * Clear all cached strategies for an idea
 */
export function clearCachedStrategies(ideaId: string) {
  try {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${CACHE_PREFIX}${ideaId}:`)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.warn('Failed to clear cached strategies', error);
    return false;
  }
}

/**
 * Clear all errors for an idea
 */
export function clearErrors(ideaId: string) {
  try {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${ERROR_PREFIX}${ideaId}:`)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.warn('Failed to clear errors', error);
    return false;
  }
}
