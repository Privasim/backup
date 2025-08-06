'use client';

import { useRef, useCallback, useMemo } from 'react';
import { AnalysisConfig, AnalysisResult } from '../types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  size: number; // Estimated size in bytes
}

interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  evictionCount: number;
  oldestEntry: number;
  newestEntry: number;
}

interface CacheConfig {
  capacity: number;
  defaultTTL: number; // milliseconds
  maxSize: number; // bytes
  cleanupInterval: number; // milliseconds
}

class LRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private accessOrder: string[] = [];
  private config: CacheConfig;
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0
  };
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      capacity: 50,
      defaultTTL: 3600000, // 1 hour
      maxSize: 50 * 1024 * 1024, // 50MB
      cleanupInterval: 300000, // 5 minutes
      ...config
    };

    // Start periodic cleanup
    this.startCleanup();
  }

  private startCleanup(): void {
    if (typeof window === 'undefined') return; // Server-side check

    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  private stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    // Find expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    }

    // Remove expired entries
    expiredKeys.forEach(key => {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
    });

    if (expiredKeys.length > 0) {
      console.debug(`Cache cleanup: removed ${expiredKeys.length} expired entries`);
    }
  }

  private estimateSize(data: T): number {
    try {
      return JSON.stringify(data).length * 2; // Rough estimate (UTF-16)
    } catch {
      return 1024; // Default size if serialization fails
    }
  }

  private updateAccessOrder(key: string): void {
    // Remove from current position
    this.removeFromAccessOrder(key);
    // Add to end (most recently used)
    this.accessOrder.push(key);
  }

  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  private evictLRU(): void {
    while (this.cache.size >= this.config.capacity || this.getTotalSize() >= this.config.maxSize) {
      if (this.accessOrder.length === 0) break;

      const lruKey = this.accessOrder[0];
      this.cache.delete(lruKey);
      this.removeFromAccessOrder(lruKey);
      this.stats.evictions++;
    }
  }

  private getTotalSize(): number {
    let totalSize = 0;
    for (const entry of this.cache.values()) {
      totalSize += entry.size;
    }
    return totalSize;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    const now = Date.now();
    
    // Check if expired
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      this.stats.misses++;
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = now;
    this.updateAccessOrder(key);
    this.stats.hits++;

    return entry.data;
  }

  set(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const entryTTL = ttl || this.config.defaultTTL;
    const size = this.estimateSize(data);

    // Remove existing entry if it exists
    if (this.cache.has(key)) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
    }

    // Evict LRU entries if necessary
    this.evictLRU();

    // Add new entry
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      ttl: entryTTL,
      accessCount: 1,
      lastAccessed: now,
      size
    };

    this.cache.set(key, entry);
    this.updateAccessOrder(key);
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.removeFromAccessOrder(key);
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.stats = { hits: 0, misses: 0, evictions: 0 };
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      return false;
    }

    return true;
  }

  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const entries = Array.from(this.cache.values());
    
    return {
      totalEntries: this.cache.size,
      totalSize: this.getTotalSize(),
      hitRate: totalRequests > 0 ? this.stats.hits / totalRequests : 0,
      missRate: totalRequests > 0 ? this.stats.misses / totalRequests : 0,
      evictionCount: this.stats.evictions,
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : 0,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(e => e.timestamp)) : 0
    };
  }

  destroy(): void {
    this.stopCleanup();
    this.clear();
  }
}

/**
 * Generate cache key from analysis config and profile hash
 */
const generateCacheKey = (config: AnalysisConfig, profileHash?: string): string => {
  const keyParts = [
    config.type,
    config.model,
    config.temperature?.toString() || '0.7',
    config.maxTokens?.toString() || '800',
    profileHash || 'no-profile'
  ];
  
  // Create a simple hash of the key parts
  const keyString = keyParts.join('|');
  let hash = 0;
  for (let i = 0; i < keyString.length; i++) {
    const char = keyString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return `analysis_${Math.abs(hash).toString(36)}`;
};

/**
 * Generate profile hash for cache invalidation
 */
const generateProfileHash = (profileData: any): string => {
  if (!profileData) return 'empty';
  
  try {
    // Create a hash based on key profile data
    const hashData = {
      profileType: profileData.profile?.profileType,
      experienceCount: profileData.experience?.length || 0,
      skillsCount: Object.values(profileData.skillset || {}).reduce((total: number, arr: any) => {
        return total + (Array.isArray(arr) ? arr.length : 0);
      }, 0),
      lastModified: profileData.metadata?.lastModified
    };
    
    const hashString = JSON.stringify(hashData);
    let hash = 0;
    for (let i = 0; i < hashString.length; i++) {
      const char = hashString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return `profile_${Math.abs(hash).toString(36)}`;
  } catch {
    return 'invalid';
  }
};

/**
 * Custom hook for managing analysis result cache
 */
export const useCacheManager = (config?: Partial<CacheConfig>) => {
  const cache = useRef<LRUCache<AnalysisResult>>();
  
  // Initialize cache only once
  if (!cache.current) {
    cache.current = new LRUCache<AnalysisResult>(config);
  }

  const getCachedResult = useCallback(async (
    analysisConfig: AnalysisConfig,
    profileHash?: string
  ): Promise<AnalysisResult | null> => {
    if (!cache.current) return null;
    
    const cacheKey = generateCacheKey(analysisConfig, profileHash);
    const result = cache.current.get(cacheKey);
    
    if (result) {
      console.debug('Cache hit for analysis:', cacheKey);
      return result;
    }
    
    console.debug('Cache miss for analysis:', cacheKey);
    return null;
  }, []);

  const cacheResult = useCallback(async (
    analysisConfig: AnalysisConfig,
    profileHash: string | undefined,
    result: AnalysisResult
  ): Promise<void> => {
    if (!cache.current) return;
    
    const cacheKey = generateCacheKey(analysisConfig, profileHash);
    
    // Add cache metadata to result
    const cachedResult: AnalysisResult = {
      ...result,
      metadata: {
        ...result.metadata,
        cached: true,
        cacheKey,
        cachedAt: new Date().toISOString()
      }
    };
    
    cache.current.set(cacheKey, cachedResult);
    console.debug('Cached analysis result:', cacheKey);
  }, []);

  const invalidateCache = useCallback(async (profileHash: string): Promise<void> => {
    if (!cache.current) return;
    
    // Find all cache keys that match the profile hash
    const keysToDelete: string[] = [];
    const stats = cache.current.getStats();
    
    // Since we can't iterate over cache keys directly, we'll use a different approach
    // We'll clear the entire cache if profile hash changes (simpler and safer)
    cache.current.clear();
    
    console.debug('Cache invalidated for profile hash:', profileHash);
  }, []);

  const clearCache = useCallback(async (): Promise<void> => {
    if (!cache.current) return;
    
    cache.current.clear();
    console.debug('Cache cleared');
  }, []);

  const getCacheStats = useCallback((): CacheStats => {
    if (!cache.current) {
      return {
        totalEntries: 0,
        totalSize: 0,
        hitRate: 0,
        missRate: 0,
        evictionCount: 0,
        oldestEntry: 0,
        newestEntry: 0
      };
    }
    
    return cache.current.getStats();
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (cache.current) {
      cache.current.destroy();
      cache.current = undefined;
    }
  }, []);

  // Memoized return object
  const cacheManager = useMemo(() => ({
    getCachedResult,
    cacheResult,
    invalidateCache,
    clearCache,
    getCacheStats,
    cleanup,
    generateProfileHash
  }), [getCachedResult, cacheResult, invalidateCache, clearCache, getCacheStats, cleanup]);

  return cacheManager;
};

export default useCacheManager;