import { ChatboxStorageManager } from '../storage-manager';
import { AnalysisConfig, AnalysisResult } from '../../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null
  };
})();

// Mock window.localStorage
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('ChatboxStorageManager', () => {
  let storageManager: ChatboxStorageManager;
  
  const mockConfig: AnalysisConfig = {
    type: 'profile',
    model: 'test-model',
    apiKey: 'test-key',
    temperature: 0.7,
    maxTokens: 800
  };
  
  const mockResult: AnalysisResult = {
    id: 'test-result-1',
    type: 'profile',
    status: 'success',
    content: 'Test analysis result',
    timestamp: new Date().toISOString(),
    model: 'test-model'
  };

  beforeEach(() => {
    localStorageMock.clear();
    storageManager = ChatboxStorageManager.getInstance();
  });

  describe('Cache Management', () => {
    it('should cache and retrieve analysis results', () => {
      const dataHash = 'test-hash';
      
      // Cache should be empty initially
      const cachedResult = storageManager.getCachedAnalysis(mockConfig, dataHash);
      expect(cachedResult).toBeNull();
      
      // Cache the result
      storageManager.cacheAnalysisResult(mockConfig, dataHash, mockResult);
      
      // Should retrieve cached result
      const retrievedResult = storageManager.getCachedAnalysis(mockConfig, dataHash);
      expect(retrievedResult).toEqual(mockResult);
    });

    it('should handle cache expiration', () => {
      const dataHash = 'test-hash';
      
      // Cache the result
      storageManager.cacheAnalysisResult(mockConfig, dataHash, mockResult);
      
      // Manually expire the cache entry
      const cacheKey = 'chatbox-cache';
      const cacheData = JSON.parse(localStorageMock.getItem(cacheKey) || '{}');
      const entry = Object.values(cacheData.data)[0] as any;
      entry.expiresAt = new Date(Date.now() - 1000).toISOString(); // Expired 1 second ago
      
      localStorageMock.setItem(cacheKey, JSON.stringify(cacheData));
      
      // Should return null for expired cache
      const retrievedResult = storageManager.getCachedAnalysis(mockConfig, dataHash);
      expect(retrievedResult).toBeNull();
    });
  });

  describe('Session Management', () => {
    it('should save and load session data', () => {
      const messages = [
        {
          id: 'msg-1',
          type: 'user' as const,
          content: 'Test message',
          timestamp: new Date().toISOString()
        }
      ];
      const profileDataHash = 'profile-hash';
      
      // Save session
      storageManager.saveSession(mockConfig, messages, profileDataHash);
      
      // Load session
      const loadedSession = storageManager.loadSession();
      
      expect(loadedSession).toBeTruthy();
      expect(loadedSession?.config).toEqual(mockConfig);
      expect(loadedSession?.messages).toEqual(messages);
      expect(loadedSession?.profileDataHash).toBe(profileDataHash);
    });

    it('should handle session expiration', () => {
      const messages = [
        {
          id: 'msg-1',
          type: 'user' as const,
          content: 'Test message',
          timestamp: new Date().toISOString()
        }
      ];
      
      // Save session
      storageManager.saveSession(mockConfig, messages);
      
      // Manually expire the session
      const sessionKey = 'chatbox-session';
      const sessionData = JSON.parse(localStorageMock.getItem(sessionKey) || '{}');
      sessionData.data.expiresAt = new Date(Date.now() - 1000).toISOString(); // Expired
      
      localStorageMock.setItem(sessionKey, JSON.stringify(sessionData));
      
      // Should return null for expired session
      const loadedSession = storageManager.loadSession();
      expect(loadedSession).toBeNull();
    });

    it('should clear session data', () => {
      const messages = [
        {
          id: 'msg-1',
          type: 'user' as const,
          content: 'Test message',
          timestamp: new Date().toISOString()
        }
      ];
      
      // Save session
      storageManager.saveSession(mockConfig, messages);
      
      // Verify session exists
      expect(storageManager.loadSession()).toBeTruthy();
      
      // Clear session
      storageManager.clearSession();
      
      // Verify session is cleared
      expect(storageManager.loadSession()).toBeNull();
    });
  });

  describe('History Management', () => {
    it('should add and retrieve analysis history', () => {
      // Initially empty
      expect(storageManager.getAnalysisHistory()).toEqual([]);
      
      // Add result to history
      storageManager.addToHistory(mockResult);
      
      // Should retrieve history
      const history = storageManager.getAnalysisHistory();
      expect(history).toHaveLength(1);
      expect(history[0]).toEqual(mockResult);
    });

    it('should handle history pagination', () => {
      // Add multiple results
      for (let i = 0; i < 5; i++) {
        const result = {
          ...mockResult,
          id: `test-result-${i}`,
          timestamp: new Date(Date.now() + i * 1000).toISOString()
        };
        storageManager.addToHistory(result);
      }
      
      // Test pagination
      const page1 = storageManager.getAnalysisHistory(2, 0);
      expect(page1).toHaveLength(2);
      
      const page2 = storageManager.getAnalysisHistory(2, 2);
      expect(page2).toHaveLength(2);
      
      // Should be sorted by timestamp (newest first)
      expect(page1[0].id).toBe('test-result-4');
      expect(page1[1].id).toBe('test-result-3');
    });

    it('should clear analysis history', () => {
      // Add result
      storageManager.addToHistory(mockResult);
      expect(storageManager.getAnalysisHistory()).toHaveLength(1);
      
      // Clear history
      storageManager.clearHistory();
      expect(storageManager.getAnalysisHistory()).toEqual([]);
    });
  });

  describe('Storage Statistics', () => {
    it('should provide storage statistics', () => {
      // Add some data
      storageManager.addToHistory(mockResult);
      storageManager.cacheAnalysisResult(mockConfig, 'test-hash', mockResult);
      
      const stats = storageManager.getStorageStats();
      
      expect(stats.totalSize).toBeGreaterThan(0);
      expect(stats.itemCount).toBeGreaterThan(0);
      expect(stats.breakdown).toBeDefined();
    });
  });

  describe('Cleanup Operations', () => {
    it('should perform cleanup', () => {
      // Add some data
      storageManager.addToHistory(mockResult);
      
      const result = storageManager.cleanup();
      
      expect(result.removedItems).toBeGreaterThanOrEqual(0);
      expect(result.freedSpace).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });

  describe('Migration', () => {
    it('should handle migration', async () => {
      const result = await storageManager.migrate();
      
      expect(result.success).toBe(true);
      expect(result.migratedItems).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });

  describe('Data Export/Import', () => {
    it('should export data', () => {
      // Add some data
      storageManager.addToHistory(mockResult);
      
      const exportedData = storageManager.exportData();
      
      expect(typeof exportedData).toBe('string');
      
      const parsed = JSON.parse(exportedData);
      expect(parsed.version).toBeDefined();
      expect(parsed.timestamp).toBeDefined();
      expect(parsed.data).toBeDefined();
    });

    it('should import data', async () => {
      // Create export data
      storageManager.addToHistory(mockResult);
      const exportedData = storageManager.exportData();
      
      // Clear storage
      storageManager.clearAll();
      expect(storageManager.getAnalysisHistory()).toEqual([]);
      
      // Import data
      const result = await storageManager.importData(exportedData);
      
      expect(result.success).toBe(true);
      expect(result.importedItems).toBeGreaterThan(0);
    });
  });

  describe('Clear All', () => {
    it('should clear all storage data', () => {
      // Add some data
      storageManager.addToHistory(mockResult);
      storageManager.cacheAnalysisResult(mockConfig, 'test-hash', mockResult);
      
      // Verify data exists
      expect(storageManager.getStorageStats().totalSize).toBeGreaterThan(0);
      
      // Clear all
      storageManager.clearAll();
      
      // Verify data is cleared
      expect(storageManager.getStorageStats().totalSize).toBe(0);
      expect(storageManager.getAnalysisHistory()).toEqual([]);
    });
  });
});