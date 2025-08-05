import { AnalysisConfig, ChatboxPreferences } from '../types';

const SETTINGS_STORAGE_KEY = 'chatbox-settings';
const API_KEYS_STORAGE_KEY = 'chatbox-api-keys';

/**
 * Default preferences
 */
const DEFAULT_PREFERENCES: ChatboxPreferences = {
  defaultModel: 'qwen/qwen3-coder:free',
  autoSave: true,
  showTimestamps: false,
  theme: 'auto',
  analysisTypes: ['profile']
};

/**
 * Settings manager for chatbox configuration
 */
export class ChatboxSettingsManager {
  /**
   * Get stored preferences
   */
  static getPreferences(): ChatboxPreferences {
    if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
    
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_PREFERENCES, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load chatbox preferences:', error);
    }
    
    return DEFAULT_PREFERENCES;
  }

  /**
   * Save preferences
   */
  static savePreferences(preferences: Partial<ChatboxPreferences>): void {
    if (typeof window === 'undefined') return;
    
    try {
      const current = this.getPreferences();
      const updated = { ...current, ...preferences };
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save chatbox preferences:', error);
    }
  }

  /**
   * Get stored API keys (by model)
   */
  static getApiKeys(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    
    try {
      const stored = localStorage.getItem(API_KEYS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('Failed to load API keys:', error);
      return {};
    }
  }

  /**
   * Save API key for a specific model/provider
   */
  static saveApiKey(model: string, apiKey: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const current = this.getApiKeys();
      current[model] = apiKey;
      localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(current));
    } catch (error) {
      console.error('Failed to save API key:', error);
    }
  }

  /**
   * Get API key for a specific model
   */
  static getApiKey(model: string): string | undefined {
    const keys = this.getApiKeys();
    return keys[model];
  }

  /**
   * Remove API key for a specific model
   */
  static removeApiKey(model: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const current = this.getApiKeys();
      delete current[model];
      localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(current));
    } catch (error) {
      console.error('Failed to remove API key:', error);
    }
  }

  /**
   * Clear all stored data
   */
  static clearAll(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
      localStorage.removeItem(API_KEYS_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear chatbox storage:', error);
    }
  }

  /**
   * Get last used configuration
   */
  static getLastConfig(): Partial<AnalysisConfig> {
    const preferences = this.getPreferences();
    const apiKeys = this.getApiKeys();
    
    return {
      model: preferences.defaultModel,
      apiKey: apiKeys[preferences.defaultModel] || '',
      temperature: 0.7,
      maxTokens: 800,
      type: 'profile'
    };
  }

  /**
   * Save configuration as last used
   */
  static saveLastConfig(config: AnalysisConfig): void {
    // Save the model as default preference
    this.savePreferences({ defaultModel: config.model });
    
    // Save the API key for this model
    if (config.apiKey) {
      this.saveApiKey(config.model, config.apiKey);
    }
  }

  /**
   * Get storage usage information
   */
  static getStorageInfo(): { 
    preferencesSize: number; 
    apiKeysSize: number; 
    totalSize: number;
    keyCount: number;
  } {
    if (typeof window === 'undefined') {
      return { preferencesSize: 0, apiKeysSize: 0, totalSize: 0, keyCount: 0 };
    }
    
    try {
      const preferences = localStorage.getItem(SETTINGS_STORAGE_KEY) || '';
      const apiKeys = localStorage.getItem(API_KEYS_STORAGE_KEY) || '';
      const keys = this.getApiKeys();
      
      return {
        preferencesSize: preferences.length,
        apiKeysSize: apiKeys.length,
        totalSize: preferences.length + apiKeys.length,
        keyCount: Object.keys(keys).length
      };
    } catch (error) {
      return { preferencesSize: 0, apiKeysSize: 0, totalSize: 0, keyCount: 0 };
    }
  }
}

/**
 * Hook for using chatbox settings
 */
export const useChatboxSettings = () => {
  const getPreferences = () => ChatboxSettingsManager.getPreferences();
  const savePreferences = (prefs: Partial<ChatboxPreferences>) => 
    ChatboxSettingsManager.savePreferences(prefs);
  
  const getApiKey = (model: string) => ChatboxSettingsManager.getApiKey(model);
  const saveApiKey = (model: string, key: string) => 
    ChatboxSettingsManager.saveApiKey(model, key);
  
  const getLastConfig = () => ChatboxSettingsManager.getLastConfig();
  const saveLastConfig = (config: AnalysisConfig) => 
    ChatboxSettingsManager.saveLastConfig(config);
  
  return {
    getPreferences,
    savePreferences,
    getApiKey,
    saveApiKey,
    getLastConfig,
    saveLastConfig,
    clearAll: ChatboxSettingsManager.clearAll,
    getStorageInfo: ChatboxSettingsManager.getStorageInfo
  };
};