// Main component
export { default as GoToMarketContent } from './components/GoToMarketContent';

// Individual components
export { BusinessSuggestionSelector } from './components/BusinessSuggestionSelector';
export { MarketingStrategySection } from './components/MarketingStrategySection';
export { MarketingStrategyCard } from './components/MarketingStrategyCard';
export { SalesChannelSection } from './components/SalesChannelSection';
export { SalesChannelCard } from './components/SalesChannelCard';
export { PricingStrategySection } from './components/PricingStrategySection';
export { PricingStrategyCard } from './components/PricingStrategyCard';
export { ImplementationTimelineSection } from './components/ImplementationTimelineSection';

// Hooks
export { useGoToMarketData } from './hooks/useGoToMarketData';

// Services
export { GoToMarketService } from './services/GoToMarketService';

// Types
export type {
  GoToMarketStatus,
  MarketingTactic,
  MarketingStrategy,
  ImplementationStep,
  CostStructure,
  SalesChannel,
  PricePoint,
  PricingStrategy,
  ImplementationAlignment,
  ToolRecommendation,
  GoToMarketProgress,
  GoToMarketData,
  GoToMarketSettings,
  MarketingAnalysisResponse,
  ValidationResult
} from './types';

// Utilities
export {
  validateBusinessSuggestion,
  validateMarketingStrategy,
  validateSalesChannel,
  validatePricingStrategy,
  validateMarketingAnalysisResponse,
  sanitizeInput,
  validateApiKey,
  validateModel
} from './utils/validation';