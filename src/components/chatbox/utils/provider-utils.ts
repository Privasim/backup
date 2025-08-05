import { AnalysisProvider, AnalysisConfig, AnalysisResult } from '../types';

interface ProviderConfig {
  id: string;
  name: string;
  supportedModels: string[];
  analyze: (config: AnalysisConfig, data: any) => Promise<AnalysisResult>;
  validateConfig?: (config: AnalysisConfig) => boolean;
  formatPrompt?: (data: any, customPrompt?: string) => string;
}

/**
 * Utility function to create an analysis provider with default implementations
 */
export const createAnalysisProvider = (config: ProviderConfig): AnalysisProvider => {
  return {
    id: config.id,
    name: config.name,
    supportedModels: config.supportedModels,
    analyze: config.analyze,
    
    validateConfig: config.validateConfig || ((config: AnalysisConfig) => {
      return !!(config.apiKey && config.model && config.supportedModels.includes(config.model));
    }),
    
    formatPrompt: config.formatPrompt || ((data: any, customPrompt?: string) => {
      if (customPrompt) {
        return customPrompt;
      }
      
      // Default prompt formatting
      return `Please analyze the following data and provide insights:\n\n${JSON.stringify(data, null, 2)}`;
    })
  };
};

/**
 * Utility to validate provider configuration
 */
export const validateProvider = (provider: AnalysisProvider): boolean => {
  if (!provider.id || !provider.name) {
    console.error('Provider missing required fields: id, name');
    return false;
  }
  
  if (!Array.isArray(provider.supportedModels) || provider.supportedModels.length === 0) {
    console.error('Provider must specify at least one supported model');
    return false;
  }
  
  if (typeof provider.analyze !== 'function') {
    console.error('Provider must implement analyze method');
    return false;
  }
  
  return true;
};

/**
 * Provider registry for managing multiple analysis providers
 */
export class ProviderRegistry {
  private providers = new Map<string, AnalysisProvider>();
  
  register(provider: AnalysisProvider): boolean {
    if (!validateProvider(provider)) {
      return false;
    }
    
    if (this.providers.has(provider.id)) {
      console.warn(`Provider ${provider.id} is already registered, replacing...`);
    }
    
    this.providers.set(provider.id, provider);
    return true;
  }
  
  unregister(providerId: string): boolean {
    return this.providers.delete(providerId);
  }
  
  get(providerId: string): AnalysisProvider | undefined {
    return this.providers.get(providerId);
  }
  
  getAll(): AnalysisProvider[] {
    return Array.from(this.providers.values());
  }
  
  getByModel(model: string): AnalysisProvider[] {
    return this.getAll().filter(provider => 
      provider.supportedModels.includes(model)
    );
  }
  
  findProviderForModel(model: string): AnalysisProvider | undefined {
    return this.getAll().find(provider => 
      provider.supportedModels.includes(model)
    );
  }
  
  clear(): void {
    this.providers.clear();
  }
}

/**
 * Default error handling for providers
 */
export const handleProviderError = (error: any, providerId: string): AnalysisResult => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  
  return {
    id: `error-${Date.now()}`,
    type: 'profile', // Default type
    status: 'error',
    content: '',
    timestamp: new Date().toISOString(),
    model: 'unknown',
    error: `Provider ${providerId}: ${errorMessage}`
  };
};