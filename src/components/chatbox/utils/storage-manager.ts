import { 
  ChatboxStorage, 
  AnalysisResult, 
  ChatboxMessageData, 
  AnalysisConfig,
  ChatboxPreferences 
} from '../types';

/**
 * Storage keys for different data types
 */
const STORAGE_KEYS = {
  MAIN: 'chatbox-storage',
  SETTINGS: 'chatbox-settings',
  API_KEYS: 'chatbox-api-keys',
  CACHE: 'chatbox-cache',
  SESSION: 'chatbox-session'
} as const;

/**
 * Storage version for migration handling
 */
const STORAGE_VERSION = '1.0.0';

/**
 * Cache configuration
 */
const CACHE_CONFIG = {
  MAX_ANALYSIS_RESULTS: 50,
  MAX_CACHE_SIZE_MB: 10,
  CACHE_EXPIRY_DAYS: 30,
  SESSION_EXPIRY_HOURS: 24
} as const;

/**
 * Storage item with metadata
 */
interface StorageItem<T = any> {
  data: T;
  timestamp: string;
  version: string;
  size?: number;
}

/**
 * Cache entry for analysis results
 */
interface CacheEntry {
  key: string;
  result: AnalysisResult;
  accessCount: number;
  lastAccessed: string;
  expiresAt: string;
}

/**
 * Session data structure
 */
interface SessionData {
  config: AnalysisConfig;
  messages: ChatboxMessageData[];
  profileDataHash?: string;
  timestamp: string;
  expiresAt: string;
}

/**
 * Comprehensive storage manager for chatbox data
 */
export class ChatboxStorageManager {
  private static instance: ChatboxStorageManager;
  
  private constructor() {}
  
  static getInstance(): ChatboxStorageManager {
    if (!ChatboxStorageManager.instance) {
      ChatboxStorageManager.instance = new ChatboxStorageManager();
    }
    return ChatboxStorageManager.instance;
  }

  /**
   * Check if localStorage is available
   */
  private isStorageAvailable(): boolean {
    try {
      return typeof window !== 'undefined' && 'localStorage' in window;
    } catch {
      return false;
    }
  }

  /**
   * Get storage item with metadata
   */
  private getStorageItem<T>(key: string): StorageItem<T> | null {
    if (!this.isStorageAvailable()) return null;
    
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      const parsed = JSON.parse(item);
      
      // Validate structure
      if (!parsed.data || !parsed.timestamp || !parsed.version) {
        return null;
      }
      
      return parsed;
    } catch (error) {
      console.warn(`Failed to get storage item ${key}:`, error);
      return null;
    }
  }

  /**
   * Set storage item with metadata
   */
  private setStorageItem<T>(key: string, data: T): boolean {
    if (!this.isStorageAvailable()) return false;
    
    try {
      const item: StorageItem<T> = {
        data,
        timestamp: new Date().toISOString(),
        version: STORAGE_VERSION,
        size: JSON.stringify(data).length
      };
      
      localStorage.setItem(key, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error(`Failed to set storage item ${key}:`, error);
      return false;
    }
  }

  /**
   * Generate cache key for analysis results
   */
  private generateCacheKey(config: AnalysisConfig, dataHash: string): string {
    const configHash = this.hashObject({
      model: config.model,
      type: config.type,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      customPrompt: config.customPrompt
    });
    
    return `${config.type}-${configHash}-${dataHash}`;
  }

  /**
   * Simple hash function for objects
   */
  private hashObject(obj: any): string {
    const str = JSON.stringify(obj, Object.keys(obj).sort());
    let hash = 0;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  /**
   * Get cached analysis result
   */
  getCachedAnalysis(config: AnalysisConfig, dataHash: string): AnalysisResult | null {
    const cacheKey = this.generateCacheKey(config, dataHash);
    const cacheItem = this.getStorageItem<Record<string, CacheEntry>>(STORAGE_KEYS.CACHE);
    
    if (!cacheItem?.data[cacheKey]) {
      return null;
    }
    
    const entry = cacheItem.data[cacheKey];
    
    // Check if expired
    if (new Date(entry.expiresAt) < new Date()) {
      this.removeCachedAnalysis(cacheKey);
      return null;
    }
    
    // Update access metadata
    entry.accessCount++;
    entry.lastAccessed = new Date().toISOString();
    
    // Save updated cache
    this.setStorageItem(STORAGE_KEYS.CACHE, cacheItem.data);
    
    return entry.result;
  }

  /**
   * Cache analysis result
   */
  cacheAnalysisResult(config: AnalysisConfig, dataHash: string, result: AnalysisResult): void {
    const cacheKey = this.generateCacheKey(config, dataHash);
    const cacheItem = this.getStorageItem<Record<string, CacheEntry>>(STORAGE_KEYS.CACHE);
    const cache = cacheItem?.data || {};
    
    // Create cache entry
    const entry: CacheEntry = {
      key: cacheKey,
      result,
      accessCount: 1,
      lastAccessed: new Date().toISOString(),
      expiresAt: new Date(Date.now() + CACHE_CONFIG.CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString()
    };
    
    cache[cacheKey] = entry;
    
    // Clean up old entries if needed
    this.cleanupCache(cache);
    
    // Save updated cache
    this.setStorageItem(STORAGE_KEYS.CACHE, cache);
  }

  /**
   * Remove cached analysis result
   */
  private removeCachedAnalysis(cacheKey: string): void {
    const cacheItem = this.getStorageItem<Record<string, CacheEntry>>(STORAGE_KEYS.CACHE);
    if (!cacheItem?.data) return;
    
    delete cacheItem.data[cacheKey];
    this.setStorageItem(STORAGE_KEYS.CACHE, cacheItem.data);
  }

  /**
   * Clean up cache based on size and age limits
   */
  private cleanupCache(cache: Record<string, CacheEntry>): void {
    const entries = Object.values(cache);
    const now = new Date();
    
    // Remove expired entries
    const validEntries = entries.filter(entry => 
      new Date(entry.expiresAt) > now
    );
    
    // If still too many entries, remove least recently used
    if (validEntries.length > CACHE_CONFIG.MAX_ANALYSIS_RESULTS) {
      validEntries.sort((a, b) => 
        new Date(a.lastAccessed).getTime() - new Date(b.lastAccessed).getTime()
      );
      
      const keepEntries = validEntries.slice(-CACHE_CONFIG.MAX_ANALYSIS_RESULTS);
      
      // Rebuild cache with only kept entries
      const newCache: Record<string, CacheEntry> = {};
      keepEntries.forEach(entry => {
        newCache[entry.key] = entry;
      });
      
      // Update the original cache object
      Object.keys(cache).forEach(key => delete cache[key]);
      Object.assign(cache, newCache);
    }
  }

  /**
   * Save session state
   */
  saveSession(config: AnalysisConfig, messages: ChatboxMessageData[], profileDataHash?: string): void {
    const sessionData: SessionData = {
      config,
      messages,
      profileDataHash,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + CACHE_CONFIG.SESSION_EXPIRY_HOURS * 60 * 60 * 1000).toISOString()
    };
    
    this.setStorageItem(STORAGE_KEYS.SESSION, sessionData);
  }

  /**
   * Load session state
   */
  loadSession(): SessionData | null {
    const sessionItem = this.getStorageItem<SessionData>(STORAGE_KEYS.SESSION);
    
    if (!sessionItem?.data) {
      return null;
    }
    
    const session = sessionItem.data;
    
    // Check if expired
    if (new Date(session.expiresAt) < new Date()) {
      this.clearSession();
      return null;
    }
    
    return session;
  }

  /**
   * Clear session state
   */
  clearSession(): void {
    if (!this.isStorageAvailable()) return;
    
    try {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  /**
   * Get analysis history with pagination
   */
  getAnalysisHistory(limit?: number, offset?: number): AnalysisResult[] {
    const storageItem = this.getStorageItem<ChatboxStorage>(STORAGE_KEYS.MAIN);
    const history = storageItem?.data?.analysisHistory || [];
    
    // Sort by timestamp (newest first)
    const sortedHistory = [...history].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    if (limit !== undefined) {
      const start = offset || 0;
      return sortedHistory.slice(start, start + limit);
    }
    
    return sortedHistory;
  }

  /**
   * Add analysis result to history
   */
  addToHistory(result: AnalysisResult): void {
    const storageItem = this.getStorageItem<ChatboxStorage>(STORAGE_KEYS.MAIN);
    const storage = storageItem?.data || {
      apiKeys: {},
      analysisHistory: [],
      preferences: {
        defaultModel: 'qwen/qwen3-coder:free',
        autoSave: true,
        showTimestamps: true,
        theme: 'auto' as const,
        analysisTypes: ['profile' as const]
      }
    };
    
    // Add to history
    storage.analysisHistory.unshift(result);
    
    // Limit history size
    if (storage.analysisHistory.length > CACHE_CONFIG.MAX_ANALYSIS_RESULTS) {
      storage.analysisHistory = storage.analysisHistory.slice(0, CACHE_CONFIG.MAX_ANALYSIS_RESULTS);
    }
    
    this.setStorageItem(STORAGE_KEYS.MAIN, storage);
  }

  /**
   * Clear analysis history
   */
  clearHistory(): void {
    const storageItem = this.getStorageItem<ChatboxStorage>(STORAGE_KEYS.MAIN);
    if (!storageItem?.data) return;
    
    storageItem.data.analysisHistory = [];
    this.setStorageItem(STORAGE_KEYS.MAIN, storageItem.data);
  }

  /**
   * Get storage usage statistics
   */
  getStorageStats(): {
    totalSize: number;
    itemCount: number;
    cacheSize: number;
    historySize: number;
    sessionSize: number;
    breakdown: Record<string, number>;
  } {
    if (!this.isStorageAvailable()) {
      return {
        totalSize: 0,
        itemCount: 0,
        cacheSize: 0,
        historySize: 0,
        sessionSize: 0,
        breakdown: {}
      };
    }
    
    const breakdown: Record<string, number> = {};
    let totalSize = 0;
    let itemCount = 0;
    
    Object.values(STORAGE_KEYS).forEach(key => {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          const size = item.length;
          breakdown[key] = size;
          totalSize += size;
          itemCount++;
        }
      } catch (error) {
        // Ignore errors for individual items
      }
    });
    
    return {
      totalSize,
      itemCount,
      cacheSize: breakdown[STORAGE_KEYS.CACHE] || 0,
      historySize: breakdown[STORAGE_KEYS.MAIN] || 0,
      sessionSize: breakdown[STORAGE_KEYS.SESSION] || 0,
      breakdown
    };
  }

  /**
   * Perform storage cleanup
   */
  cleanup(): {
    removedItems: number;
    freedSpace: number;
    errors: string[];
  } {
    const errors: string[] = [];
    let removedItems = 0;
    let freedSpace = 0;
    
    try {
      // Clean up cache
      const cacheItem = this.getStorageItem<Record<string, CacheEntry>>(STORAGE_KEYS.CACHE);
      if (cacheItem?.data) {
        const originalSize = Object.keys(cacheItem.data).length;
        this.cleanupCache(cacheItem.data);
        const newSize = Object.keys(cacheItem.data).length;
        
        removedItems += originalSize - newSize;
        this.setStorageItem(STORAGE_KEYS.CACHE, cacheItem.data);
      }
      
      // Clean up expired session
      const session = this.loadSession();
      if (!session) {
        const sessionSize = this.getStorageStats().sessionSize;
        this.clearSession();
        freedSpace += sessionSize;
        removedItems++;
      }
      
      // Clean up old history entries
      const storageItem = this.getStorageItem<ChatboxStorage>(STORAGE_KEYS.MAIN);
      if (storageItem?.data?.analysisHistory) {
        const originalLength = storageItem.data.analysisHistory.length;
        
        if (originalLength > CACHE_CONFIG.MAX_ANALYSIS_RESULTS) {
          storageItem.data.analysisHistory = storageItem.data.analysisHistory
            .slice(0, CACHE_CONFIG.MAX_ANALYSIS_RESULTS);
          
          removedItems += originalLength - storageItem.data.analysisHistory.length;
          this.setStorageItem(STORAGE_KEYS.MAIN, storageItem.data);
        }
      }
      
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown cleanup error');
    }
    
    return { removedItems, freedSpace, errors };
  }

  /**
   * Migrate storage data between versions
   */
  migrate(): { success: boolean; migratedItems: number; errors: string[] } {
    const errors: string[] = [];
    let migratedItems = 0;
    
    try {
      // Check if migration is needed
      const mainItem = this.getStorageItem<ChatboxStorage>(STORAGE_KEYS.MAIN);
      
      if (!mainItem) {
        // First time setup - migrate from old storage format if exists
        const legacyData = this.migrateLegacyStorage();
        if (legacyData) {
          migratedItems++;
        }
      } else if (mainItem.version !== STORAGE_VERSION) {
        // Version mismatch - perform version-specific migrations
        migratedItems += this.performVersionMigration(mainItem.version, mainItem.data);
      }
      
      return { success: true, migratedItems, errors };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Migration failed');
      return { success: false, migratedItems, errors };
    }
  }

  /**
   * Migrate from legacy storage format
   */
  private migrateLegacyStorage(): boolean {
    if (!this.isStorageAvailable()) return false;
    
    try {
      // Check for old format data
      const oldSettings = localStorage.getItem('chatbox-settings');
      const oldApiKeys = localStorage.getItem('chatbox-api-keys');
      
      if (oldSettings || oldApiKeys) {
        const storage: ChatboxStorage = {
          apiKeys: oldApiKeys ? JSON.parse(oldApiKeys) : {},
          analysisHistory: [],
          preferences: oldSettings ? JSON.parse(oldSettings) : {
            defaultModel: 'qwen/qwen3-coder:free',
            autoSave: true,
            showTimestamps: true,
            theme: 'auto' as const,
            analysisTypes: ['profile' as const]
          }
        };
        
        this.setStorageItem(STORAGE_KEYS.MAIN, storage);
        
        // Clean up old keys
        localStorage.removeItem('chatbox-settings');
        localStorage.removeItem('chatbox-api-keys');
        
        return true;
      }
    } catch (error) {
      console.warn('Failed to migrate legacy storage:', error);
    }
    
    return false;
  }

  /**
   * Perform version-specific migrations
   */
  private performVersionMigration(fromVersion: string, data: ChatboxStorage): number {
    let migratedItems = 0;
    
    // Add version-specific migration logic here
    // For now, just update the version
    this.setStorageItem(STORAGE_KEYS.MAIN, data);
    migratedItems++;
    
    return migratedItems;
  }

  /**
   * Clear all storage data
   */
  clearAll(): void {
    if (!this.isStorageAvailable()) return;
    
    Object.values(STORAGE_KEYS).forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Failed to remove ${key}:`, error);
      }
    });
  }

  /**
   * Export storage data for backup
   */
  exportData(): string {
    const data: Record<string, any> = {};
    
    Object.values(STORAGE_KEYS).forEach(key => {
      const item = this.getStorageItem(key);
      if (item) {
        data[key] = item;
      }
    });
    
    return JSON.stringify({
      version: STORAGE_VERSION,
      timestamp: new Date().toISOString(),
      data
    }, null, 2);
  }

  /**
   * Import storage data from backup
   */
  importData(jsonData: string): { success: boolean; importedItems: number; errors: string[] } {
    const errors: string[] = [];
    let importedItems = 0;
    
    try {
      const backup = JSON.parse(jsonData);
      
      if (!backup.data || typeof backup.data !== 'object') {
        throw new Error('Invalid backup format');
      }
      
      Object.entries(backup.data).forEach(([key, item]) => {
        try {
          if (Object.values(STORAGE_KEYS).includes(key as any)) {
            localStorage.setItem(key, JSON.stringify(item));
            importedItems++;
          }
        } catch (error) {
          errors.push(`Failed to import ${key}: ${error}`);
        }
      });
      
      return { success: true, importedItems, errors };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Import failed');
      return { success: false, importedItems, errors };
    }
  }
}

// Export singleton instance
export const storageManager = ChatboxStorageManager.getInstance();