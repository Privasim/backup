import { 
  AnalysisProvider, 
  AnalysisConfig, 
  AnalysisResult, 
  AnalysisType 
} from '@/components/chatbox/types';
import { ProfileFormData } from '@/app/businessidea/types/profile.types';

/**
 * Main analysis service that coordinates between different providers
 */
export class AnalysisService {
  private providers = new Map<string, AnalysisProvider>();
  private defaultProvider?: AnalysisProvider;

  /**
   * Register an analysis provider
   */
  registerProvider(provider: AnalysisProvider, isDefault = false): void {
    this.providers.set(provider.id, provider);
    
    if (isDefault || !this.defaultProvider) {
      this.defaultProvider = provider;
    }
  }

  /**
   * Get a provider by ID
   */
  getProvider(providerId: string): AnalysisProvider | undefined {
    return this.providers.get(providerId);
  }

  /**
   * Get all registered providers
   */
  getAllProviders(): AnalysisProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Find the best provider for a given model
   */
  findProviderForModel(model: string): AnalysisProvider | undefined {
    // First, try to find a provider that explicitly supports this model
    for (const provider of this.providers.values()) {
      if (provider.supportedModels.includes(model)) {
        return provider;
      }
    }

    // Fallback to default provider if it supports the model
    if (this.defaultProvider?.supportedModels.includes(model)) {
      return this.defaultProvider;
    }

    return undefined;
  }

  /**
   * Validate analysis configuration
   */
  validateConfig(config: AnalysisConfig): { isValid: boolean; error?: string } {
    if (!config.apiKey) {
      return { isValid: false, error: 'API key is required' };
    }

    if (!config.model) {
      return { isValid: false, error: 'Model selection is required' };
    }

    const provider = this.findProviderForModel(config.model);
    if (!provider) {
      return { isValid: false, error: `No provider found for model: ${config.model}` };
    }

    if (!provider.validateConfig(config)) {
      return { isValid: false, error: 'Invalid configuration for selected provider' };
    }

    return { isValid: true };
  }

  /**
   * Perform analysis using the appropriate provider
   */
  async analyze(config: AnalysisConfig, data: any): Promise<AnalysisResult> {
    // Validate configuration
    const validation = this.validateConfig(config);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Find appropriate provider
    const provider = this.findProviderForModel(config.model);
    if (!provider) {
      throw new Error(`No provider available for model: ${config.model}`);
    }

    try {
      // Perform the analysis
      const result = await provider.analyze(config, data);
      
      // Ensure result has required fields
      return {
        ...result,
        id: result.id || `analysis-${Date.now()}`,
        timestamp: result.timestamp || new Date().toISOString(),
        type: config.type,
        model: config.model
      };
    } catch (error) {
      // Create error result
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      
      return {
        id: `error-${Date.now()}`,
        type: config.type,
        status: 'error',
        content: '',
        timestamp: new Date().toISOString(),
        model: config.model,
        error: errorMessage
      };
    }
  }

  /**
   * Get supported models across all providers
   */
  getSupportedModels(): string[] {
    const models = new Set<string>();
    
    for (const provider of this.providers.values()) {
      provider.supportedModels.forEach(model => models.add(model));
    }
    
    return Array.from(models);
  }

  /**
   * Get providers that support a specific analysis type
   */
  getProvidersForAnalysisType(analysisType: AnalysisType): AnalysisProvider[] {
    return this.getAllProviders().filter(provider => {
      // For now, assume all providers support all analysis types
      // This can be extended in the future with provider-specific capabilities
      return true;
    });
  }

  /**
   * Clear all providers (useful for testing)
   */
  clearProviders(): void {
    this.providers.clear();
    this.defaultProvider = undefined;
  }
}

// Global instance
export const analysisService = new AnalysisService();