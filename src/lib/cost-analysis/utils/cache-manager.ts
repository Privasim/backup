// Multi-level caching for cost analysis data

import { CachedCostData, CacheStats } from '../types';

export class CostAnalysisCacheManager {
  private memoryCache = new Map<string, CachedCostData>();
  private stats: CacheStats = { hits: 0, misses: 0, size: 0, hitRate: 0 };
  private readonly maxMemorySize = 100; // Maximum items in memory cache

  constructor() {
    this.loadFromPersistentStorage();
  }

  async get<T>(key: string): Promise<T | null> {
    // Check memory cache first
    const memoryCached = this.memoryCache.get(key);
    if (memoryCached && this.isValid(memoryCached)) {
      this.stats.hits++;
      this.updateHitRate();
      return memoryCached.data as T;
    }

    // Check persistent storage
    const persistentCached = this.getFromPersistentStorage(key);
    if (persistentCached && this.isValid(persistentCached)) {
      // Move to memory cache for faster access
      this.memoryCache.set(key, persistentCached);
      this.stats.hits++;
      this.updateHitRate();
      return persistentCached.data as T;
    }

    this.stats.misses++;
    this.updateHitRate();
    return null;
  }

  async set<T>(key: string, data: T, ttl: number = 3600000): Promise<void> {
    const cachedData: CachedCostData = {
      data: data as any,
      timestamp: Date.now(),
      ttl,
      key,
    };

    // Store in memory cache
    this.memoryCache.set(key, cachedData);
    this.enforceMemoryLimit();

    // Store in persistent storage
    this.saveToPersistentStorage(key, cachedData);

    this.stats.size = this.memoryCache.size;
  }

  async invalidate(key: string): Promise<void> {
    this.memoryCache.delete(key);
    this.removeFromPersistentStorage(key);
    this.stats.size = this.memoryCache.size;
  }

  async clear(): Promise<void> {
    this.memoryCache.clear();
    this.clearPersistentStorage();
    this.stats = { hits: 0, misses: 0, size: 0, hitRate: 0 };
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  // Generate cache keys
  generateSalaryKey(occupation: string, location: string, experience: string): string {
    return `salary:${occupation}:${location}:${experience}`.toLowerCase().replace(/\s+/g, '_');
  }

  generateAICostKey(model: string, taskType: string): string {
    return `ai_cost:${model}:${taskType}`.toLowerCase().replace(/\s+/g, '_');
  }

  generateAnalysisKey(profile: any): string {
    const profileHash = this.hashProfile(profile);
    return `analysis:${profileHash}`;
  }

  private isValid(cached: CachedCostData): boolean {
    const now = Date.now();
    return (now - cached.timestamp) < cached.ttl;
  }

  private enforceMemoryLimit(): void {
    if (this.memoryCache.size > this.maxMemorySize) {
      // Remove oldest entries
      const entries = Array.from(this.memoryCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, entries.length - this.maxMemorySize);
      toRemove.forEach(([key]) => this.memoryCache.delete(key));
    }
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  private hashProfile(profile: any): string {
    const str = JSON.stringify(profile);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Persistent storage methods (localStorage)
  private loadFromPersistentStorage(): void {
    try {
      const stored = localStorage.getItem('cost_analysis_cache');
      if (stored) {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([key, value]) => {
          const cached = value as CachedCostData;
          if (this.isValid(cached)) {
            this.memoryCache.set(key, cached);
          }
        });
        this.stats.size = this.memoryCache.size;
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
    }
  }

  private getFromPersistentStorage(key: string): CachedCostData | null {
    try {
      const stored = localStorage.getItem('cost_analysis_cache');
      if (stored) {
        const data = JSON.parse(stored);
        return data[key] || null;
      }
    } catch (error) {
      console.warn('Failed to get from localStorage:', error);
    }
    return null;
  }

  private saveToPersistentStorage(key: string, data: CachedCostData): void {
    try {
      const stored = localStorage.getItem('cost_analysis_cache') || '{}';
      const cache = JSON.parse(stored);
      cache[key] = data;
      
      // Limit persistent storage size
      const entries = Object.entries(cache);
      if (entries.length > 200) {
        const sorted = entries.sort((a, b) => 
          (a[1] as CachedCostData).timestamp - (b[1] as CachedCostData).timestamp
        );
        const limited = Object.fromEntries(sorted.slice(-150));
        localStorage.setItem('cost_analysis_cache', JSON.stringify(limited));
      } else {
        localStorage.setItem('cost_analysis_cache', JSON.stringify(cache));
      }
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  private removeFromPersistentStorage(key: string): void {
    try {
      const stored = localStorage.getItem('cost_analysis_cache');
      if (stored) {
        const data = JSON.parse(stored);
        delete data[key];
        localStorage.setItem('cost_analysis_cache', JSON.stringify(data));
      }
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }

  private clearPersistentStorage(): void {
    try {
      localStorage.removeItem('cost_analysis_cache');
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }
}