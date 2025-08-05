import { analysisService } from './AnalysisService';
import { createProfileAnalysisProvider } from './ProfileAnalysisProvider';

/**
 * Initialize chatbox services with default providers
 */
export const initializeChatboxServices = () => {
  // Register the profile analysis provider
  const profileProvider = createProfileAnalysisProvider();
  analysisService.registerProvider(profileProvider, true); // Set as default
  
  console.log('Chatbox services initialized with providers:', {
    profileProvider: profileProvider.name,
    supportedModels: profileProvider.supportedModels
  });
};

/**
 * Get the current service status
 */
export const getChatboxServiceStatus = () => {
  const providers = analysisService.getAllProviders();
  const supportedModels = analysisService.getSupportedModels();
  
  return {
    providersCount: providers.length,
    providers: providers.map(p => ({
      id: p.id,
      name: p.name,
      supportedModels: p.supportedModels
    })),
    supportedModels,
    isInitialized: providers.length > 0
  };
};