export { 
  OpenRouterClient, 
  getWebSearchEnabledModels, 
  getFreeModels, 
  getAvailableModels,
  getModelById,
  type ModelInfo,
  type WebSearchMetadata,
  type FunctionDefinition
} from './client';

export { SearchTracker } from './search-tracker';
export { extractDomain, getDomain } from './utils';