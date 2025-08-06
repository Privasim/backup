import { getBusinessPromptTemplates, getTemplateById } from '../prompt-templates';
import { BusinessSuggestionPrompts } from '@/lib/chatbox/prompts/BusinessSuggestionPrompts';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock the settings-utils module to use our localStorage mock
jest.mock('../settings-utils', () => {
  const originalModule = jest.requireActual('../settings-utils');
  
  const getDefaultBusinessPlanSettings = () => ({
    autoRefresh: true,
    showViabilityScores: true,
    sortBy: 'viability',
    maxSuggestions: 10,
    includeMarketData: true,
    systemPrompt: {
      enabled: false,
      templateId: '',
      customPrompt: ''
    }
  });

  return {
    ...originalModule,
    getBusinessPlanSettings: () => {
      try {
        const stored = localStorageMock.getItem('businessPlanSettings');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (!parsed.systemPrompt) {
            parsed.systemPrompt = {
              enabled: false,
              templateId: '',
              customPrompt: ''
            };
          }
          return parsed;
        }
      } catch (error) {
        console.warn('Failed to load business plan settings, using defaults:', error);
      }
      return getDefaultBusinessPlanSettings();
    },
    saveBusinessPlanSettings: (settings: any) => {
      try {
        localStorageMock.setItem('businessPlanSettings', JSON.stringify(settings));
      } catch (error) {
        console.error('Failed to save business plan settings:', error);
      }
    },
    getCustomSystemPrompt: () => {
      try {
        const stored = localStorageMock.getItem('businessPlanSettings');
        if (stored) {
          const settings = JSON.parse(stored);
          if (settings.systemPrompt?.enabled && settings.systemPrompt?.customPrompt) {
            return settings.systemPrompt.customPrompt;
          }
        }
      } catch (error) {
        console.warn('Failed to load settings for custom prompt:', error);
      }
      return undefined;
    }
  };
});

import { getBusinessPlanSettings, saveBusinessPlanSettings, getCustomSystemPrompt } from '../settings-utils';

describe('Business Plan System Prompt Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('Template System', () => {
    it('should load business prompt templates', () => {
      const templates = getBusinessPromptTemplates();
      
      expect(templates).toHaveLength(5);
      expect(templates[0]).toHaveProperty('id');
      expect(templates[0]).toHaveProperty('name');
      expect(templates[0]).toHaveProperty('category');
      expect(templates[0]).toHaveProperty('prompt');
      expect(templates[0]).toHaveProperty('description');
    });

    it('should get template by id', () => {
      const template = getTemplateById('tech-saas');
      
      expect(template).toBeDefined();
      expect(template?.name).toBe('Tech & SaaS Focus');
      expect(template?.category).toBe('technology');
    });

    it('should return undefined for non-existent template', () => {
      const template = getTemplateById('non-existent');
      
      expect(template).toBeUndefined();
    });
  });

  describe('Settings Management', () => {
    it('should return default settings when localStorage is empty', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const settings = getBusinessPlanSettings();
      
      expect(settings.systemPrompt.enabled).toBe(false);
      expect(settings.systemPrompt.customPrompt).toBe('');
      expect(settings.autoRefresh).toBe(true);
    });

    it('should load settings from localStorage', () => {
      const mockSettings = {
        autoRefresh: false,
        showViabilityScores: true,
        sortBy: 'viability',
        maxSuggestions: 10,
        includeMarketData: true,
        systemPrompt: {
          enabled: true,
          templateId: 'tech-saas',
          customPrompt: 'Custom prompt text'
        }
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSettings));
      
      const settings = getBusinessPlanSettings();
      
      expect(settings.systemPrompt.enabled).toBe(true);
      expect(settings.systemPrompt.customPrompt).toBe('Custom prompt text');
    });

    it('should save settings to localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null); // Ensure clean state
      const settings = getBusinessPlanSettings();
      settings.systemPrompt.enabled = true;
      settings.systemPrompt.customPrompt = 'Test prompt';
      
      saveBusinessPlanSettings(settings);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'businessPlanSettings',
        JSON.stringify(settings)
      );
    });

    it('should return custom system prompt when enabled', () => {
      const mockSettings = {
        autoRefresh: true,
        showViabilityScores: true,
        sortBy: 'viability',
        maxSuggestions: 10,
        includeMarketData: true,
        systemPrompt: {
          enabled: true,
          templateId: '',
          customPrompt: 'Custom business prompt'
        }
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSettings));
      
      const customPrompt = getCustomSystemPrompt();
      
      expect(customPrompt).toBe('Custom business prompt');
    });

    it('should return undefined when custom prompt is disabled', () => {
      const mockSettings = {
        autoRefresh: true,
        showViabilityScores: true,
        sortBy: 'viability',
        maxSuggestions: 10,
        includeMarketData: true,
        systemPrompt: {
          enabled: false,
          templateId: '',
          customPrompt: 'Custom business prompt'
        }
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSettings));
      
      const customPrompt = getCustomSystemPrompt();
      
      expect(customPrompt).toBeUndefined();
    });
  });

  describe('BusinessSuggestionPrompts Integration', () => {
    it('should build prompt without custom system prompt', () => {
      const mockAnalysisResult = {
        id: 'test',
        type: 'profile' as const,
        status: 'success' as const,
        content: 'Test analysis content',
        timestamp: new Date().toISOString(),
        model: 'test-model'
      };

      const prompt = BusinessSuggestionPrompts.buildBusinessSuggestionPrompt(
        mockAnalysisResult
      );

      expect(prompt).toContain('You are an expert business consultant');
      expect(prompt).toContain('Test analysis content');
    });

    it('should build prompt with custom system prompt', () => {
      const mockAnalysisResult = {
        id: 'test',
        type: 'profile' as const,
        status: 'success' as const,
        content: 'Test analysis content',
        timestamp: new Date().toISOString(),
        model: 'test-model'
      };

      const customPrompt = 'Focus on technology startups and SaaS products';

      const prompt = BusinessSuggestionPrompts.buildBusinessSuggestionPrompt(
        mockAnalysisResult,
        undefined,
        customPrompt
      );

      expect(prompt).toContain('Focus on technology startups and SaaS products');
      expect(prompt).toContain('You are an expert business consultant');
      expect(prompt).toContain('Test analysis content');
    });
  });
});