/**
 * Integration tests for chatbox analysis completion components
 */

import { renderHook, act } from '@testing-library/react';
import { useCacheManager } from '../hooks/useCacheManager';
import { createProfileAnalyzer } from '@/lib/openrouter/analysis/ProfileAnalyzer';
import { handleAnalysisError, ErrorCategory } from '../utils/error-handler';
import { initializeChatboxSystem, isChatboxSystemInitialized } from '@/lib/chatbox/initialization';

// Mock data
const mockAnalysisConfig = {
  type: 'profile' as const,
  model: 'qwen/qwen3-coder:free',
  apiKey: 'sk-or-v1-test-key',
  temperature: 0.7,
  maxTokens: 800
};

const mockAnalysisResult = {
  id: 'test-analysis-123',
  type: 'profile' as const,
  status: 'success' as const,
  content: 'Test analysis result content',
  timestamp: new Date().toISOString(),
  model: 'qwen/qwen3-coder:free',
  metadata: {
    usage: { prompt_tokens: 100, completion_tokens: 200, total_tokens: 300 }
  }
};

const mockProfileData = {
  profile: {
    profileType: 'professional' as const
  },
  experience: [],
  skillset: {
    technical: ['JavaScript', 'React'],
    soft: ['Communication'],
    languages: ['English'],
    certifications: [],
    categories: [],
    certificationsDetailed: [],
    languageProficiency: []
  },
  metadata: {
    lastModified: new Date().toISOString(),
    version: '1.0.0',
    isDraft: false
  }
};

describe('Chatbox Analysis Completion Integration', () => {
  describe('useCacheManager', () => {
    it('should cache and retrieve analysis results', async () => {
      const { result } = renderHook(() => useCacheManager());
      
      await act(async () => {
        // Cache a result
        await result.current.cacheResult(mockAnalysisConfig, 'test-hash', mockAnalysisResult);
        
        // Retrieve the cached result
        const cached = await result.current.getCachedResult(mockAnalysisConfig, 'test-hash');
        
        expect(cached).toBeTruthy();
        expect(cached?.content).toBe(mockAnalysisResult.content);
        expect(cached?.metadata?.cached).toBe(true);
      });
    });

    it('should return null for cache miss', async () => {
      const { result } = renderHook(() => useCacheManager());
      
      await act(async () => {
        const cached = await result.current.getCachedResult(mockAnalysisConfig, 'non-existent-hash');
        expect(cached).toBeNull();
      });
    });

    it('should provide cache statistics', async () => {
      const { result } = renderHook(() => useCacheManager());
      
      await act(async () => {
        // Add some cached results
        await result.current.cacheResult(mockAnalysisConfig, 'hash1', mockAnalysisResult);
        await result.current.cacheResult(mockAnalysisConfig, 'hash2', mockAnalysisResult);
        
        const stats = result.current.getCacheStats();
        
        expect(stats.totalEntries).toBe(2);
        expect(stats.totalSize).toBeGreaterThan(0);
      });
    });

    it('should clear cache', async () => {
      const { result } = renderHook(() => useCacheManager());
      
      await act(async () => {
        // Add cached result
        await result.current.cacheResult(mockAnalysisConfig, 'test-hash', mockAnalysisResult);
        
        // Verify it exists
        let cached = await result.current.getCachedResult(mockAnalysisConfig, 'test-hash');
        expect(cached).toBeTruthy();
        
        // Clear cache
        await result.current.clearCache();
        
        // Verify it's gone
        cached = await result.current.getCachedResult(mockAnalysisConfig, 'test-hash');
        expect(cached).toBeNull();
      });
    });
  });

  describe('ProfileAnalyzer', () => {
    it('should create analyzer instance', () => {
      const analyzer = createProfileAnalyzer();
      
      expect(analyzer).toBeTruthy();
      expect(typeof analyzer.analyze).toBe('function');
      expect(typeof analyzer.analyzeStreaming).toBe('function');
      expect(typeof analyzer.validateConfig).toBe('function');
    });

    it('should validate configuration correctly', () => {
      const analyzer = createProfileAnalyzer();
      
      // Valid config
      expect(analyzer.validateConfig(mockAnalysisConfig)).toBe(true);
      
      // Invalid configs
      expect(analyzer.validateConfig({ ...mockAnalysisConfig, apiKey: '' })).toBe(false);
      expect(analyzer.validateConfig({ ...mockAnalysisConfig, apiKey: 'invalid-key' })).toBe(false);
      expect(analyzer.validateConfig({ ...mockAnalysisConfig, model: '' })).toBe(false);
      expect(analyzer.validateConfig({ ...mockAnalysisConfig, type: 'invalid' as any })).toBe(false);
    });

    it('should get supported models', () => {
      const analyzer = createProfileAnalyzer();
      const models = analyzer.getSupportedModels();
      
      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);
    });

    it('should get provider info', () => {
      const analyzer = createProfileAnalyzer();
      const info = analyzer.getProviderInfo();
      
      expect(info.id).toBeTruthy();
      expect(info.name).toBeTruthy();
    });

    it('should update and get configuration', () => {
      const analyzer = createProfileAnalyzer();
      
      const originalConfig = analyzer.getConfig();
      expect(originalConfig.enableRetry).toBe(true);
      
      analyzer.updateConfig({ enableRetry: false });
      
      const updatedConfig = analyzer.getConfig();
      expect(updatedConfig.enableRetry).toBe(false);
    });
  });

  describe('Error Handler', () => {
    it('should handle analysis errors with user-friendly messages', () => {
      const error = new Error('API key is invalid');
      const context = {
        component: 'TestComponent',
        action: 'testAction',
        timestamp: new Date().toISOString()
      };
      
      const userError = handleAnalysisError(error, context);
      
      expect(userError.category).toBe(ErrorCategory.API_KEY);
      expect(userError.title).toBe('Invalid API Key');
      expect(userError.actionable).toBe(true);
      expect(userError.retryable).toBe(false);
      expect(userError.suggestedAction).toBeTruthy();
    });

    it('should categorize different error types', () => {
      const { errorHandler } = require('../utils/error-handler');
      
      expect(errorHandler.categorizeError(new Error('network error'))).toBe(ErrorCategory.NETWORK);
      expect(errorHandler.categorizeError(new Error('rate limit exceeded'))).toBe(ErrorCategory.RATE_LIMIT);
      expect(errorHandler.categorizeError(new Error('api key invalid'))).toBe(ErrorCategory.API_KEY);
      expect(errorHandler.categorizeError(new Error('timeout occurred'))).toBe(ErrorCategory.TIMEOUT);
      expect(errorHandler.categorizeError(new Error('unknown error'))).toBe(ErrorCategory.SYSTEM);
    });
  });

  describe('System Initialization', () => {
    beforeEach(() => {
      // Reset system before each test
      const { resetChatboxSystem } = require('@/lib/chatbox/initialization');
      resetChatboxSystem();
    });

    it('should initialize system successfully', async () => {
      expect(isChatboxSystemInitialized()).toBe(false);
      
      await initializeChatboxSystem();
      
      expect(isChatboxSystemInitialized()).toBe(true);
    });

    it('should not initialize twice', async () => {
      await initializeChatboxSystem();
      expect(isChatboxSystemInitialized()).toBe(true);
      
      // Second initialization should not throw
      await expect(initializeChatboxSystem()).resolves.toBeUndefined();
      expect(isChatboxSystemInitialized()).toBe(true);
    });

    it('should initialize with custom configuration', async () => {
      const customConfig = {
        enableAutoAnalysis: false,
        cacheConfig: {
          capacity: 25,
          defaultTTL: 1800000 // 30 minutes
        }
      };
      
      await initializeChatboxSystem(customConfig);
      
      const { getChatboxSystemConfig } = require('@/lib/chatbox/initialization');
      const config = getChatboxSystemConfig();
      
      expect(config.enableAutoAnalysis).toBe(false);
      expect(config.cacheConfig.capacity).toBe(25);
      expect(config.cacheConfig.defaultTTL).toBe(1800000);
    });
  });

  describe('Integration Flow', () => {
    it('should complete full analysis flow with caching', async () => {
      // Initialize system
      await initializeChatboxSystem();
      
      // Create cache manager
      const { result: cacheResult } = renderHook(() => useCacheManager());
      
      await act(async () => {
        // First analysis - should miss cache
        let cached = await cacheResult.current.getCachedResult(mockAnalysisConfig, 'integration-test');
        expect(cached).toBeNull();
        
        // Cache the result
        await cacheResult.current.cacheResult(mockAnalysisConfig, 'integration-test', mockAnalysisResult);
        
        // Second analysis - should hit cache
        cached = await cacheResult.current.getCachedResult(mockAnalysisConfig, 'integration-test');
        expect(cached).toBeTruthy();
        expect(cached?.metadata?.cached).toBe(true);
        
        // Verify cache stats
        const stats = cacheResult.current.getCacheStats();
        expect(stats.totalEntries).toBe(1);
        expect(stats.hitRate).toBeGreaterThan(0);
      });
    });
  });
});

// Mock external dependencies
jest.mock('@/data/mockProfiles', () => ({
  getMockProfile: () => mockProfileData
}));

jest.mock('@/lib/openrouter', () => ({
  getAvailableModels: () => ['qwen/qwen3-coder:free', 'z-ai/glm-4.5-air:free'],
  OpenRouterClient: jest.fn().mockImplementation(() => ({
    chat: jest.fn().mockResolvedValue({
      choices: [{ message: { content: 'Mock analysis result' } }],
      usage: { prompt_tokens: 100, completion_tokens: 200, total_tokens: 300 }
    }),
    validateApiKey: jest.fn().mockResolvedValue(true)
  }))
}));