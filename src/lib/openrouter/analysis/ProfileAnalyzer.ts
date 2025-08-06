/**
 * ProfileAnalyzer - Consistent API wrapper around ProfileAnalysisProvider
 * Provides error handling, retry logic, and streaming support
 */

import { AnalysisConfig, AnalysisResult } from '@/components/chatbox/types';
import { ProfileFormData } from '@/app/businessidea/types/profile.types';
import { createProfileAnalysisProvider } from '@/lib/chatbox/ProfileAnalysisProvider';
import { createComponentErrorHandler, ErrorCategory } from '@/components/chatbox/utils/error-handler';

export interface ProfileAnalyzerConfig {
  enableRetry: boolean;
  maxRetries: number;
  retryDelay: number;
  enableStreaming: boolean;
  timeoutMs: number;
}

const DEFAULT_CONFIG: ProfileAnalyzerConfig = {
  enableRetry: true,
  maxRetries: 3,
  retryDelay: 1000,
  enableStreaming: true,
  timeoutMs: 30000 // 30 seconds
};

/**
 * ProfileAnalyzer class providing consistent API for profile analysis
 */
export class ProfileAnalyzer {
  private provider: any; // AnalysisProvider type
  private errorHandler: ReturnType<typeof createComponentErrorHandler>;
  private config: ProfileAnalyzerConfig;

  constructor(config: Partial<ProfileAnalyzerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.provider = createProfileAnalysisProvider();
    this.errorHandler = createComponentErrorHandler('ProfileAnalyzer');
  }

  /**
   * Validate analysis configuration
   */
  validateConfig(config: AnalysisConfig): boolean {
    try {
      // Check required fields
      if (!config.apiKey || !config.model || !config.type) {
        return false;
      }

      // Validate API key format (OpenRouter keys start with 'sk-or-v1-')
      if (!config.apiKey.startsWith('sk-or-v1-')) {
        return false;
      }

      // Validate analysis type
      if (config.type !== 'profile') {
        return false;
      }

      // Use provider's validation if available
      if (this.provider.validateConfig) {
        return this.provider.validateConfig(config);
      }

      return true;
    } catch (error) {
      console.warn('Config validation error:', error);
      return false;
    }
  }

  /**
   * Perform profile analysis with error handling and retry logic
   */
  async analyze(
    config: AnalysisConfig,
    profileData: ProfileFormData
  ): Promise<AnalysisResult> {
    // Validate configuration
    if (!this.validateConfig(config)) {
      throw new Error('Invalid analysis configuration');
    }

    // Validate profile data
    if (!profileData || !profileData.profile) {
      throw new Error('Invalid profile data provided');
    }

    const operation = async (): Promise<AnalysisResult> => {
      try {
        // Add timeout wrapper
        const analysisPromise = this.provider.analyze(config, profileData);
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Analysis timeout')), this.config.timeoutMs);
        });

        const result = await Promise.race([analysisPromise, timeoutPromise]);

        // Validate result
        if (!result || typeof result !== 'object') {
          throw new Error('Invalid analysis result received');
        }

        if (result.status === 'error') {
          throw new Error(result.error || 'Analysis failed');
        }

        return result;
      } catch (error) {
        // Add context to error
        const contextualError = new Error(
          `Profile analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        (contextualError as any).originalError = error;
        throw contextualError;
      }
    };

    // Execute with retry logic if enabled
    if (this.config.enableRetry) {
      return this.errorHandler.retryOperation(operation, {
        maxAttempts: this.config.maxRetries,
        baseDelay: this.config.retryDelay,
        retryableErrors: [ErrorCategory.NETWORK, ErrorCategory.RATE_LIMIT, ErrorCategory.TIMEOUT],
        onRetry: (attempt, error) => {
          console.debug(`ProfileAnalyzer: Retry attempt ${attempt} for analysis`, error.message);
        }
      });
    } else {
      return operation();
    }
  }

  /**
   * Perform streaming profile analysis with real-time updates
   */
  async analyzeStreaming(
    config: AnalysisConfig,
    profileData: ProfileFormData,
    onChunk: (chunk: string) => void
  ): Promise<AnalysisResult> {
    // Validate configuration
    if (!this.validateConfig(config)) {
      throw new Error('Invalid analysis configuration');
    }

    // Validate profile data
    if (!profileData || !profileData.profile) {
      throw new Error('Invalid profile data provided');
    }

    // Validate chunk callback
    if (typeof onChunk !== 'function') {
      throw new Error('Invalid chunk callback provided');
    }

    const operation = async (): Promise<AnalysisResult> => {
      try {
        // Check if provider supports streaming
        if (this.provider.analyzeStreaming && this.config.enableStreaming) {
          console.debug('Using streaming analysis');
          
          // Add timeout wrapper for streaming
          const streamingPromise = this.provider.analyzeStreaming(config, profileData, onChunk);
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Streaming analysis timeout')), this.config.timeoutMs);
          });

          const result = await Promise.race([streamingPromise, timeoutPromise]);

          if (!result || typeof result !== 'object') {
            throw new Error('Invalid streaming analysis result received');
          }

          if (result.status === 'error') {
            throw new Error(result.error || 'Streaming analysis failed');
          }

          return result;
        } else {
          // Fallback to non-streaming analysis
          console.debug('Falling back to non-streaming analysis');
          
          const result = await this.analyze(config, profileData);
          
          // Simulate streaming by sending the complete content
          if (result.content) {
            onChunk(result.content);
          }
          
          return result;
        }
      } catch (error) {
        // Add context to error
        const contextualError = new Error(
          `Streaming analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        (contextualError as any).originalError = error;
        throw contextualError;
      }
    };

    // Execute with retry logic if enabled
    if (this.config.enableRetry) {
      return this.errorHandler.retryOperation(operation, {
        maxAttempts: this.config.maxRetries,
        baseDelay: this.config.retryDelay,
        retryableErrors: [ErrorCategory.NETWORK, ErrorCategory.RATE_LIMIT, ErrorCategory.TIMEOUT],
        onRetry: (attempt, error) => {
          console.debug(`ProfileAnalyzer: Retry attempt ${attempt} for streaming analysis`, error.message);
        }
      });
    } else {
      return operation();
    }
  }

  /**
   * Get supported models from the underlying provider
   */
  getSupportedModels(): string[] {
    return this.provider.supportedModels || [];
  }

  /**
   * Get provider information
   */
  getProviderInfo(): { id: string; name: string } {
    return {
      id: this.provider.id || 'openrouter-profile',
      name: this.provider.name || 'OpenRouter Profile Analysis'
    };
  }

  /**
   * Update analyzer configuration
   */
  updateConfig(newConfig: Partial<ProfileAnalyzerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): ProfileAnalyzerConfig {
    return { ...this.config };
  }

  /**
   * Test the analyzer with a minimal configuration
   */
  async testConnection(apiKey: string, model: string): Promise<boolean> {
    try {
      const testConfig: AnalysisConfig = {
        type: 'profile',
        model,
        apiKey,
        temperature: 0.1,
        maxTokens: 50
      };

      const testProfileData: ProfileFormData = {
        profile: {
          profileType: 'professional'
        },
        experience: [],
        skillset: {
          technical: ['JavaScript'],
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

      // Disable retry for connection test
      const originalRetryConfig = this.config.enableRetry;
      this.config.enableRetry = false;

      try {
        const result = await this.analyze(testConfig, testProfileData);
        return result.status === 'success';
      } finally {
        // Restore retry configuration
        this.config.enableRetry = originalRetryConfig;
      }
    } catch (error) {
      console.debug('Connection test failed:', error);
      return false;
    }
  }
}

/**
 * Create a new ProfileAnalyzer instance
 */
export const createProfileAnalyzer = (config?: Partial<ProfileAnalyzerConfig>): ProfileAnalyzer => {
  return new ProfileAnalyzer(config);
};

/**
 * Default ProfileAnalyzer instance for convenience
 */
export const profileAnalyzer = createProfileAnalyzer();

export default ProfileAnalyzer;