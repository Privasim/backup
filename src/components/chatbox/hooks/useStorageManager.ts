'use client';

import { useCallback, useEffect, useState } from 'react';
import { storageManager } from '../utils/storage-manager';
import { AnalysisResult, AnalysisConfig, ChatboxMessageData } from '../types';

/**
 * Storage statistics interface
 */
interface StorageStats {
  totalSize: number;
  itemCount: number;
  cacheSize: number;
  historySize: number;
  sessionSize: number;
  breakdown: Record<string, number>;
}

/**
 * Cleanup result interface
 */
interface CleanupResult {
  removedItems: number;
  freedSpace: number;
  errors: string[];
}

/**
 * Migration result interface
 */
interface MigrationResult {
  success: boolean;
  migratedItems: number;
  errors: string[];
}

/**
 * Hook for managing chatbox storage operations
 */
export const useStorageManager = () => {
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Refresh storage statistics
   */
  const refreshStats = useCallback(() => {
    const stats = storageManager.getStorageStats();
    setStorageStats(stats);
  }, []);

  /**
   * Get cached analysis result
   */
  const getCachedAnalysis = useCallback((config: AnalysisConfig, dataHash: string) => {
    return storageManager.getCachedAnalysis(config, dataHash);
  }, []);

  /**
   * Cache analysis result
   */
  const cacheAnalysisResult = useCallback((
    config: AnalysisConfig, 
    dataHash: string, 
    result: AnalysisResult
  ) => {
    storageManager.cacheAnalysisResult(config, dataHash, result);
    refreshStats();
  }, [refreshStats]);

  /**
   * Save session state
   */
  const saveSession = useCallback((
    config: AnalysisConfig, 
    messages: ChatboxMessageData[], 
    profileDataHash?: string
  ) => {
    storageManager.saveSession(config, messages, profileDataHash);
    refreshStats();
  }, [refreshStats]);

  /**
   * Load session state
   */
  const loadSession = useCallback(() => {
    return storageManager.loadSession();
  }, []);

  /**
   * Clear session state
   */
  const clearSession = useCallback(() => {
    storageManager.clearSession();
    refreshStats();
  }, [refreshStats]);

  /**
   * Get analysis history with pagination
   */
  const getAnalysisHistory = useCallback((limit?: number, offset?: number) => {
    return storageManager.getAnalysisHistory(limit, offset);
  }, []);

  /**
   * Add analysis result to history
   */
  const addToHistory = useCallback((result: AnalysisResult) => {
    storageManager.addToHistory(result);
    refreshStats();
  }, [refreshStats]);

  /**
   * Clear analysis history
   */
  const clearHistory = useCallback(() => {
    storageManager.clearHistory();
    refreshStats();
  }, [refreshStats]);

  /**
   * Perform storage cleanup
   */
  const cleanup = useCallback(async (): Promise<CleanupResult> => {
    setIsLoading(true);
    
    try {
      const result = storageManager.cleanup();
      refreshStats();
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [refreshStats]);

  /**
   * Migrate storage data
   */
  const migrate = useCallback(async (): Promise<MigrationResult> => {
    setIsLoading(true);
    
    try {
      const result = storageManager.migrate();
      refreshStats();
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [refreshStats]);

  /**
   * Clear all storage data
   */
  const clearAll = useCallback(() => {
    storageManager.clearAll();
    refreshStats();
  }, [refreshStats]);

  /**
   * Export storage data
   */
  const exportData = useCallback(() => {
    return storageManager.exportData();
  }, []);

  /**
   * Import storage data
   */
  const importData = useCallback(async (jsonData: string) => {
    setIsLoading(true);
    
    try {
      const result = storageManager.importData(jsonData);
      refreshStats();
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [refreshStats]);

  /**
   * Generate hash for profile data
   */
  const generateDataHash = useCallback((data: any): string => {
    const str = JSON.stringify(data, Object.keys(data || {}).sort());
    let hash = 0;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }, []);

  /**
   * Check if storage is available
   */
  const isStorageAvailable = useCallback(() => {
    try {
      return typeof window !== 'undefined' && 'localStorage' in window;
    } catch {
      return false;
    }
  }, []);

  /**
   * Get storage quota information (if available)
   */
  const getStorageQuota = useCallback(async () => {
    if (!isStorageAvailable() || !navigator.storage?.estimate) {
      return null;
    }
    
    try {
      const estimate = await navigator.storage.estimate();
      return {
        quota: estimate.quota || 0,
        usage: estimate.usage || 0,
        available: (estimate.quota || 0) - (estimate.usage || 0),
        usagePercentage: estimate.quota ? ((estimate.usage || 0) / estimate.quota) * 100 : 0
      };
    } catch (error) {
      console.warn('Failed to get storage quota:', error);
      return null;
    }
  }, [isStorageAvailable]);

  /**
   * Initialize storage on mount
   */
  useEffect(() => {
    const initializeStorage = async () => {
      // Perform migration if needed
      await migrate();
      
      // Refresh stats
      refreshStats();
    };
    
    initializeStorage();
  }, [migrate, refreshStats]);

  /**
   * Auto-cleanup on mount (if needed)
   */
  useEffect(() => {
    const performAutoCleanup = async () => {
      const stats = storageManager.getStorageStats();
      
      // Auto-cleanup if storage is getting large (>5MB)
      if (stats.totalSize > 5 * 1024 * 1024) {
        console.log('Performing automatic storage cleanup...');
        await cleanup();
      }
    };
    
    performAutoCleanup();
  }, [cleanup]);

  return {
    // Storage operations
    getCachedAnalysis,
    cacheAnalysisResult,
    saveSession,
    loadSession,
    clearSession,
    
    // History operations
    getAnalysisHistory,
    addToHistory,
    clearHistory,
    
    // Maintenance operations
    cleanup,
    migrate,
    clearAll,
    exportData,
    importData,
    
    // Utilities
    generateDataHash,
    isStorageAvailable,
    getStorageQuota,
    refreshStats,
    
    // State
    storageStats,
    isLoading
  };
};

/**
 * Hook for automatic session management
 */
export const useSessionManager = (
  config: AnalysisConfig,
  messages: ChatboxMessageData[],
  profileDataHash?: string,
  autoSave = true
) => {
  const { saveSession, loadSession, clearSession } = useStorageManager();
  const [sessionLoaded, setSessionLoaded] = useState(false);

  /**
   * Load session on mount
   */
  useEffect(() => {
    if (!sessionLoaded) {
      const session = loadSession();
      setSessionLoaded(true);
      
      if (session) {
        console.log('Loaded session from storage:', session.timestamp);
        return session;
      }
    }
  }, [loadSession, sessionLoaded]);

  /**
   * Auto-save session when data changes
   */
  useEffect(() => {
    if (autoSave && sessionLoaded && messages.length > 0) {
      saveSession(config, messages, profileDataHash);
    }
  }, [config, messages, profileDataHash, autoSave, sessionLoaded, saveSession]);

  /**
   * Clear session on unmount or when requested
   */
  const clearCurrentSession = useCallback(() => {
    clearSession();
  }, [clearSession]);

  return {
    clearCurrentSession,
    sessionLoaded
  };
};

/**
 * Hook for cache management with automatic cleanup
 */
export const useCacheManager = () => {
  const { 
    getCachedAnalysis, 
    cacheAnalysisResult, 
    cleanup, 
    storageStats 
  } = useStorageManager();

  /**
   * Get cached result with automatic cleanup check
   */
  const getCachedResult = useCallback(async (
    config: AnalysisConfig, 
    dataHash: string
  ) => {
    const result = getCachedAnalysis(config, dataHash);
    
    // Trigger cleanup if cache is getting large
    if (storageStats && storageStats.cacheSize > 2 * 1024 * 1024) { // 2MB
      setTimeout(() => cleanup(), 0); // Async cleanup
    }
    
    return result;
  }, [getCachedAnalysis, storageStats, cleanup]);

  /**
   * Cache result with size check
   */
  const cacheResult = useCallback((
    config: AnalysisConfig, 
    dataHash: string, 
    result: AnalysisResult
  ) => {
    // Only cache if result is not too large (>100KB)
    const resultSize = JSON.stringify(result).length;
    if (resultSize < 100 * 1024) {
      cacheAnalysisResult(config, dataHash, result);
    }
  }, [cacheAnalysisResult]);

  return {
    getCachedResult,
    cacheResult,
    cleanup
  };
};