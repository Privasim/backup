import { AnalysisConfig, ChatboxPreferences, ChatboxStorage } from '../types';
import { SecureStorage } from './secure-storage';
import { SystemPromptConfig, createDefaultSystemPromptConfig } from '../../../lib/chatbox/utils/system-prompt-utils';

const SETTINGS_STORAGE_KEY = 'chatbox-settings';
const API_KEYS_STORAGE_KEY = 'chatbox-api-keys';
const LEGACY_API_KEYS_STORAGE_KEY = 'chatbox-api-keys';
const SYSTEM_PROMPTS_STORAGE_KEY = 'chatbox-system-prompts';

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
  static loadApiKeys(): Record<string, string> {
    try {
      // Try secure storage first
      const secureStored = SecureStorage.getItem(API_KEYS_STORAGE_KEY);
      if (secureStored) {
        return JSON.parse(secureStored);
      }
      
      // Fallback to legacy storage for migration
      const legacyStored = localStorage.getItem(LEGACY_API_KEYS_STORAGE_KEY);
      if (legacyStored && !secureStored) {
        const keys = JSON.parse(legacyStored);
        // Migrate to secure storage
        this.saveApiKeyBatch(keys);
        // Clean up legacy storage
        localStorage.removeItem(LEGACY_API_KEYS_STORAGE_KEY);
        return keys;
      }
      
      return {};
    } catch (error) {
      console.warn('Failed to load API keys:', error);
      return {};
    }
  }

  /**
   * Save API key for a specific model/provider
   */
  static saveApiKey(service: string, key: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const keys = this.loadApiKeys();
      keys[service] = key;
      SecureStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(keys));
    } catch (error) {
      console.error('Failed to save API key:', error);
    }
  }

  /**
   * Get API key for a specific model
   */
  static getApiKey(model: string): string | undefined {
    const keys = this.loadApiKeys();
    return keys[model];
  }

  /**
   * Remove API key for a specific model
   */
  static removeApiKey(service: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const keys = this.loadApiKeys();
      delete keys[service];
      SecureStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(keys));
    } catch (error) {
      console.error('Failed to remove API key:', error);
    }
  }

  /**
   * Save multiple API keys at once (batch operation)
   */
  static saveApiKeyBatch(keys: Record<string, string>): void {
    if (typeof window === 'undefined') return;
    
    try {
      SecureStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(keys));
    } catch (error) {
      console.error('Failed to save API keys:', error);
    }
  }

  /**
   * Get all stored API keys
   */
  static getApiKeys(): Record<string, string> {
    return this.loadApiKeys();
  }

  /**
   * Clear all stored data
   */
  static clearAll(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
      localStorage.removeItem(API_KEYS_STORAGE_KEY);
      localStorage.removeItem(SYSTEM_PROMPTS_STORAGE_KEY);
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
   * Get system prompt configuration
   */
  static getSystemPromptConfig(): SystemPromptConfig {
    if (typeof window === 'undefined') return createDefaultSystemPromptConfig();
    
    try {
      const stored = localStorage.getItem(SYSTEM_PROMPTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...createDefaultSystemPromptConfig(), ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load system prompt config:', error);
    }
    
    return createDefaultSystemPromptConfig();
  }

  /**
   * Save system prompt configuration
   */
  static saveSystemPromptConfig(config: Partial<SystemPromptConfig>): void {
    if (typeof window === 'undefined') return;
    
    try {
      const current = this.getSystemPromptConfig();
      const updated = { 
        ...current, 
        ...config, 
        lastModified: new Date().toISOString() 
      };
      localStorage.setItem(SYSTEM_PROMPTS_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save system prompt config:', error);
    }
  }

  /**
   * Get system prompt for a specific model
   */
  static getSystemPromptForModel(model: string): string | undefined {
    const config = this.getSystemPromptConfig();
    
    // Check if per-model prompts are enabled and available
    if (config.perModelPrompts && config.perModelPrompts[model]) {
      return config.perModelPrompts[model];
    }
    
    // Return global prompt if enabled
    return config.enabled ? config.prompt : undefined;
  }

  /**
   * Save system prompt for a specific model
   */
  static saveSystemPromptForModel(model: string, prompt: string): void {
    const config = this.getSystemPromptConfig();
    const perModelPrompts = config.perModelPrompts || {};
    
    perModelPrompts[model] = prompt;
    
    this.saveSystemPromptConfig({
      perModelPrompts,
      lastUsedPrompt: prompt
    });
  }

  /**
   * Clear system prompt for a specific model
   */
  static clearSystemPromptForModel(model: string): void {
    const config = this.getSystemPromptConfig();
    if (config.perModelPrompts && config.perModelPrompts[model]) {
      delete config.perModelPrompts[model];
      this.saveSystemPromptConfig({ perModelPrompts: config.perModelPrompts });
    }
  }

  /**
   * Get all per-model system prompts
   */
  static getAllModelPrompts(): Record<string, string> {
    const config = this.getSystemPromptConfig();
    return config.perModelPrompts || {};
  }

  /**
   * Clear all system prompt data
   */
  static clearSystemPrompts(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(SYSTEM_PROMPTS_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear system prompts:', error);
    }
  }

  /**
   * Migrate existing custom prompts from AnalysisConfig
   */
  static migrateCustomPrompts(configs: AnalysisConfig[]): void {
    try {
      const systemPromptConfig = this.getSystemPromptConfig();
      let hasChanges = false;

      for (const config of configs) {
        if (config.customPrompt && config.model) {
          // Migrate to per-model prompts
          if (!systemPromptConfig.perModelPrompts) {
            systemPromptConfig.perModelPrompts = {};
          }
          
          if (!systemPromptConfig.perModelPrompts[config.model]) {
            systemPromptConfig.perModelPrompts[config.model] = config.customPrompt;
            hasChanges = true;
          }
        }
      }

      if (hasChanges) {
        this.saveSystemPromptConfig(systemPromptConfig);
        console.log('Successfully migrated custom prompts to system prompt storage');
      }
    } catch (error) {
      console.error('Failed to migrate custom prompts:', error);
    }
  }

  /**
   * Get storage usage information
   */
  static getStorageInfo(): { 
    preferencesSize: number; 
    apiKeysSize: number; 
    systemPromptsSize: number;
    totalSize: number;
    keyCount: number;
    promptCount: number;
  } {
    if (typeof window === 'undefined') {
      return { preferencesSize: 0, apiKeysSize: 0, systemPromptsSize: 0, totalSize: 0, keyCount: 0, promptCount: 0 };
    }
    
    try {
      const preferences = localStorage.getItem(SETTINGS_STORAGE_KEY) || '';
      const apiKeys = localStorage.getItem(API_KEYS_STORAGE_KEY) || '';
      const systemPrompts = localStorage.getItem(SYSTEM_PROMPTS_STORAGE_KEY) || '';
      const keys = this.getApiKeys();
      const prompts = this.getAllModelPrompts();
      
      return {
        preferencesSize: preferences.length,
        apiKeysSize: apiKeys.length,
        systemPromptsSize: systemPrompts.length,
        totalSize: preferences.length + apiKeys.length + systemPrompts.length,
        keyCount: Object.keys(keys).length,
        promptCount: Object.keys(prompts).length
      };
    } catch (error) {
      return { preferencesSize: 0, apiKeysSize: 0, systemPromptsSize: 0, totalSize: 0, keyCount: 0, promptCount: 0 };
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
  
  // System prompt methods
  const getSystemPromptConfig = () => ChatboxSettingsManager.getSystemPromptConfig();
  const saveSystemPromptConfig = (config: Partial<SystemPromptConfig>) => 
    ChatboxSettingsManager.saveSystemPromptConfig(config);
  const getSystemPromptForModel = (model: string) => 
    ChatboxSettingsManager.getSystemPromptForModel(model);
  const saveSystemPromptForModel = (model: string, prompt: string) => 
    ChatboxSettingsManager.saveSystemPromptForModel(model, prompt);
  const clearSystemPromptForModel = (model: string) => 
    ChatboxSettingsManager.clearSystemPromptForModel(model);
  const getAllModelPrompts = () => ChatboxSettingsManager.getAllModelPrompts();
  const clearSystemPrompts = () => ChatboxSettingsManager.clearSystemPrompts();
  
  return {
    getPreferences,
    savePreferences,
    getApiKey,
    saveApiKey,
    getLastConfig,
    saveLastConfig,
    getSystemPromptConfig,
    saveSystemPromptConfig,
    getSystemPromptForModel,
    saveSystemPromptForModel,
    clearSystemPromptForModel,
    getAllModelPrompts,
    clearSystemPrompts,
    clearAll: ChatboxSettingsManager.clearAll,
    getStorageInfo: ChatboxSettingsManager.getStorageInfo
  };
};

/**
 * Migration utility to move from old settings format to new storage manager
 */
export const migrateToNewStorage = async () => {
  try {
    const { storageManager } = await import('./storage-manager');
    const migrationResult = await storageManager.migrate();
    
    if (migrationResult.success) {
      console.log(`Successfully migrated ${migrationResult.migratedItems} items to new storage format`);
    } else {
      console.warn('Storage migration had errors:', migrationResult.errors);
    }
    
    return migrationResult;
  } catch (error) {
    console.error('Failed to migrate storage:', error);
    return { success: false, migratedItems: 0, errors: [String(error)] };
  }
};