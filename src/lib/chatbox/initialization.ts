/**
 * Initialize chatbox system with default providers and configuration
 */

import { analysisService } from './AnalysisService';
import { createProfileAnalysisProvider } from './ProfileAnalysisProvider';
import { storageManager } from '@/components/chatbox/utils/storage-manager';

export interface InitializationConfig {
  enableAutoAnalysis: boolean;
  cacheConfig: {
    capacity: number;
    defaultTTL: number;
  };
  errorHandling: {
    maxRetries: number;
    baseDelay: number;
  };
  providers: {
    enableProfileAnalysis: boolean;
  };
}

const DEFAULT_CONFIG: InitializationConfig = {
  enableAutoAnalysis: true,
  cacheConfig: {
    capacity: 50,
    defaultTTL: 3600000 // 1 hour
  },
  errorHandling: {
    maxRetries: 3,
    baseDelay: 1000
  },
  providers: {
    enableProfileAnalysis: true
  }
};

class ChatboxInitializer {
  private static initialized = false;
  private static config: InitializationConfig = DEFAULT_CONFIG;

  /**
   * Initialize the chatbox system with providers and configuration
   */
  static async initialize(userConfig: Partial<InitializationConfig> = {}): Promise<void> {
    // Prevent multiple initializations
    if (this.initialized) {
      console.debug('Chatbox system already initialized');
      return;
    }

    try {
      // Merge user configuration with defaults
      this.config = {
        ...DEFAULT_CONFIG,
        ...userConfig,
        cacheConfig: { ...DEFAULT_CONFIG.cacheConfig, ...userConfig.cacheConfig },
        errorHandling: { ...DEFAULT_CONFIG.errorHandling, ...userConfig.errorHandling },
        providers: { ...DEFAULT_CONFIG.providers, ...userConfig.providers }
      };

      console.debug('Initializing chatbox system with config:', this.config);

      // Initialize storage first
      await this.initializeStorage();

      // Register providers
      await this.registerProviders();

      // Configure error handling
      this.configureErrorHandling();

      // Set initialization flag
      this.initialized = true;

      console.log('Chatbox system initialized successfully');
    } catch (error) {
      console.error('Failed to initialize chatbox system:', error);
      throw error;
    }
  }

  /**
   * Initialize storage system
   */
  private static async initializeStorage(): Promise<void> {
    try {
      // Perform storage migration if needed
      const migrationResult = storageManager.migrate();
      
      if (migrationResult.success) {
        console.debug('Chatbox storage initialized successfully');
        
        if (migrationResult.migratedItems > 0) {
          console.debug(`Migrated ${migrationResult.migratedItems} items to new storage format`);
        }
      } else {
        console.warn('Storage migration had issues:', migrationResult.errors);
      }
      
      // Perform initial cleanup if needed
      const stats = storageManager.getStorageStats();
      
      // Auto-cleanup if storage is getting large (>10MB)
      if (stats.totalSize > 10 * 1024 * 1024) {
        console.debug('Performing initial storage cleanup...');
        const cleanupResult = storageManager.cleanup();
        
        if (cleanupResult.removedItems > 0) {
          console.debug(`Cleaned up ${cleanupResult.removedItems} items, freed ${cleanupResult.freedSpace} bytes`);
        }
      }
    } catch (error) {
      console.warn('Storage initialization failed:', error);
      // Don't throw here as storage issues shouldn't prevent system initialization
    }
  }

  /**
   * Register analysis providers with the analysis service
   */
  private static async registerProviders(): Promise<void> {
    try {
      // Register profile analysis provider if enabled
      if (this.config.providers.enableProfileAnalysis) {
        const profileProvider = createProfileAnalysisProvider();
        analysisService.registerProvider(profileProvider, true); // Set as default
        console.debug('Profile analysis provider registered');

        // Configure profile integration service
        const { profileIntegrationService } = await import('@/components/chatbox/services/ProfileIntegrationService');
        profileIntegrationService.configure({
          minProfileCompletion: 80,
          autoTriggerAnalysis: false, // Disable auto-trigger as per task requirements
          enableChangeDetection: true
        });
        console.debug('Profile integration service configured');
      }

      // Future providers can be registered here
      // Example: newsProvider, resumeProvider, etc.

    } catch (error) {
      console.error('Failed to register providers:', error);
      throw error;
    }
  }

  /**
   * Configure global error handling settings
   */
  private static configureErrorHandling(): void {
    try {
      // Set global error handling configuration
      // This could be used by error handlers throughout the system
      if (typeof window !== 'undefined') {
        (window as any).__CHATBOX_ERROR_CONFIG__ = this.config.errorHandling;
      }

      console.debug('Error handling configured');
    } catch (error) {
      console.warn('Failed to configure error handling:', error);
      // Don't throw here as this is not critical
    }
  }

  /**
   * Get current initialization status
   */
  static isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get current configuration
   */
  static getConfig(): InitializationConfig {
    return { ...this.config };
  }

  /**
   * Reset initialization state (useful for testing)
   */
  static reset(): void {
    this.initialized = false;
    this.config = DEFAULT_CONFIG;
    analysisService.clearProviders();
    console.debug('Chatbox system reset');
  }

  /**
   * Reinitialize with new configuration
   */
  static async reinitialize(config: Partial<InitializationConfig> = {}): Promise<void> {
    this.reset();
    await this.initialize(config);
  }
}

/**
 * Initialize the chatbox system (main export)
 */
export const initializeChatboxSystem = (config?: Partial<InitializationConfig>): Promise<void> => {
  return ChatboxInitializer.initialize(config);
};

/**
 * Check if the system is initialized
 */
export const isChatboxSystemInitialized = (): boolean => {
  return ChatboxInitializer.isInitialized();
};

/**
 * Get current system configuration
 */
export const getChatboxSystemConfig = (): InitializationConfig => {
  return ChatboxInitializer.getConfig();
};

/**
 * Reset the system (useful for testing)
 */
export const resetChatboxSystem = (): void => {
  ChatboxInitializer.reset();
};

/**
 * Reinitialize the system with new configuration
 */
export const reinitializeChatboxSystem = (config?: Partial<InitializationConfig>): Promise<void> => {
  return ChatboxInitializer.reinitialize(config);
};

// Legacy exports for backward compatibility
export const initializeChatboxServices = initializeChatboxSystem;

/**
 * Get storage health information
 */
export const getStorageHealth = () => {
  const stats = storageManager.getStorageStats();
  
  const health = {
    status: 'healthy' as 'healthy' | 'warning' | 'critical',
    issues: [] as string[],
    recommendations: [] as string[]
  };
  
  // Check total size
  if (stats.totalSize > 20 * 1024 * 1024) { // 20MB
    health.status = 'critical';
    health.issues.push('Storage usage is very high (>20MB)');
    health.recommendations.push('Consider clearing analysis history or performing cleanup');
  } else if (stats.totalSize > 10 * 1024 * 1024) { // 10MB
    health.status = 'warning';
    health.issues.push('Storage usage is high (>10MB)');
    health.recommendations.push('Consider performing cleanup to optimize storage');
  }
  
  // Check cache size
  if (stats.cacheSize > 5 * 1024 * 1024) { // 5MB
    health.issues.push('Cache size is large (>5MB)');
    health.recommendations.push('Cache cleanup may improve performance');
  }
  
  // Check item count
  if (stats.itemCount > 100) {
    health.issues.push('Large number of stored items');
    health.recommendations.push('Consider clearing old analysis history');
  }
  
  return {
    ...health,
    stats
  };
};

/**
 * Perform maintenance tasks
 */
export const performMaintenance = async () => {
  const results = {
    cleanup: { removedItems: 0, freedSpace: 0, errors: [] as string[] },
    migration: { success: true, migratedItems: 0, errors: [] as string[] }
  };
  
  try {
    // Perform cleanup
    results.cleanup = storageManager.cleanup();
    
    // Perform migration check
    results.migration = storageManager.migrate();
    
    return {
      success: true,
      results
    };
  } catch (error) {
    return {
      success: false,
      error: String(error),
      results
    };
  }
};

// Auto-initialize on module load in browser environment
if (typeof window !== 'undefined') {
  // Use setTimeout to avoid blocking module loading
  setTimeout(() => {
    initializeChatboxSystem().catch(error => {
      console.warn('Auto-initialization failed:', error);
    });
  }, 0);
}