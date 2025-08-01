import { CacheError } from './error-handling';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

export interface CacheConfig {
  defaultTTL?: number; // Time to live in milliseconds
  maxSize?: number;
  enableStats?: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

export class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private config: Required<CacheConfig>;
  private stats = { hits: 0, misses: 0 };

  constructor(config: CacheConfig = {}) {
    this.config = {
      defaultTTL: config.defaultTTL ?? 5 * 60 * 1000, // 5 minutes
      maxSize: config.maxSize ?? 1000,
      enableStats: config.enableStats ?? true,
    };
  }

  set<T>(key: string, data: T, ttl?: number): void {
    try {
      // Clean expired entries if cache is full
      if (this.cache.size >= this.config.maxSize) {
        this.cleanExpired();
        
        // If still full, remove oldest entries
        if (this.cache.size >= this.config.maxSize) {
          this.evictOldest();
        }
      }

      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttl ?? this.config.defaultTTL,
        hits: 0,
      };

      this.cache.set(key, entry);
    } catch (error) {
      throw new CacheError('set', error instanceof Error ? error : undefined);
    }
  }

  get<T>(key: string): T | null {
    try {
      const entry = this.cache.get(key) as CacheEntry<T> | undefined;

      if (!entry) {
        if (this.config.enableStats) {
          this.stats.misses++;
        }
        return null;
      }

      // Check if entry has expired
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        if (this.config.enableStats) {
          this.stats.misses++;
        }
        return null;
      }

      // Update hit count and stats
      entry.hits++;
      if (this.config.enableStats) {
        this.stats.hits++;
      }

      return entry.data;
    } catch (error) {
      throw new CacheError('get', error instanceof Error ? error : undefined);
    }
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    return entry !== undefined && !this.isExpired(entry);
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      hitRate: totalRequests > 0 ? this.stats.hits / totalRequests : 0,
    };
  }

  // Cache with automatic computation
  async getOrCompute<T>(
    key: string,
    computeFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    try {
      const computed = await computeFn();
      this.set(key, computed, ttl);
      return computed;
    } catch (error) {
      throw new CacheError('getOrCompute', error instanceof Error ? error : undefined);
    }
  }

  // Batch operations
  setMany<T>(entries: Array<{ key: string; data: T; ttl?: number }>): void {
    for (const entry of entries) {
      this.set(entry.key, entry.data, entry.ttl);
    }
  }

  getMany<T>(keys: string[]): Array<{ key: string; data: T | null }> {
    return keys.map(key => ({
      key,
      data: this.get<T>(key),
    }));
  }

  deleteMany(keys: string[]): number {
    let deleted = 0;
    for (const key of keys) {
      if (this.delete(key)) {
        deleted++;
      }
    }
    return deleted;
  }

  // Maintenance operations
  cleanExpired(): number {
    let cleaned = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  private evictOldest(): void {
    // Find and remove the oldest entry
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  // Cache key utilities
  static createKey(...parts: (string | number)[]): string {
    return parts.map(part => String(part)).join(':');
  }

  static createSearchKey(query: string, filters: Record<string, any> = {}): string {
    const filterString = Object.entries(filters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
      .join('&');
    
    return `search:${query}:${filterString}`;
  }
}

// Specialized cache for research data
export class ResearchDataCache extends CacheManager {
  constructor() {
    super({
      defaultTTL: 10 * 60 * 1000, // 10 minutes for research data
      maxSize: 500,
      enableStats: true,
    });
  }

  // Specialized methods for research data
  cacheOccupationRisk(occupationId: string, data: any): void {
    this.set(`occupation:risk:${occupationId}`, data);
  }

  getCachedOccupationRisk(occupationId: string): any | null {
    return this.get(`occupation:risk:${occupationId}`);
  }

  cacheSearchResults(query: string, filters: any, results: any): void {
    const key = CacheManager.createSearchKey(query, filters);
    this.set(`search:${key}`, results, 5 * 60 * 1000); // 5 minutes for search results
  }

  getCachedSearchResults(query: string, filters: any): any | null {
    const key = CacheManager.createSearchKey(query, filters);
    return this.get(`search:${key}`);
  }

  cacheVisualizationData(chartType: string, data: any): void {
    this.set(`viz:${chartType}`, data, 15 * 60 * 1000); // 15 minutes for viz data
  }

  getCachedVisualizationData(chartType: string): any | null {
    return this.get(`viz:${chartType}`);
  }

  cacheTableData(tableId: string, data: any): void {
    this.set(`table:${tableId}`, data, 30 * 60 * 1000); // 30 minutes for table data
  }

  getCachedTableData(tableId: string): any | null {
    return this.get(`table:${tableId}`);
  }

  // Invalidate related caches
  invalidateOccupationCaches(): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.startsWith('occupation:') || key.startsWith('search:')) {
        keysToDelete.push(key);
      }
    }

    this.deleteMany(keysToDelete);
  }

  invalidateVisualizationCaches(): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.startsWith('viz:')) {
        keysToDelete.push(key);
      }
    }

    this.deleteMany(keysToDelete);
  }
}