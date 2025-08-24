// Main exports for the Go-to-Market V2 feature
export { useGoToMarketV2 } from './hooks/useGoToMarketV2';
export { useImplementationContext } from './hooks/useImplementationContext';
export { useStrategyPersistence } from './hooks/useStrategyPersistence';

export { GoToMarketV2Generator } from './components/GoToMarketV2Generator';
export { StrategyDisplay } from './components/StrategyDisplay';
export { MarketingStrategyCard } from './components/MarketingStrategyCard';
export { SalesChannelCard } from './components/SalesChannelCard';
export { PricingStrategyCard } from './components/PricingStrategyCard';
export { ProgressIndicator } from './components/ProgressIndicator';
export { ExportControls } from './components/ExportControls';
export { GoToMarketErrorBoundary } from './components/ErrorBoundary';

export { GoToMarketV2Service } from './services/GoToMarketV2Service';
export { PromptBuilder } from './services/PromptBuilder';
export { StrategyProcessor } from './services/StrategyProcessor';

export { 
  exportToJSON, 
  exportToMarkdown, 
  copyToClipboard, 
  importFromJSON 
} from './utils/export-utils';

export { 
  validateGenerationOptions,
  validateImplementationPlan,
  validateGoToMarketStrategies,
  validateApiConfiguration,
  sanitizeInput,
  validateFileImport
} from './utils/validation';

export {
  calculateOverallProgress,
  getProgressByCategory,
  getStrategySummary,
  filterStrategiesByStatus,
  searchStrategies,
  sortStrategies,
  getNextActionItems,
  estimateTotalBudget,
  generateActionPlan
} from './utils/strategy-helpers';

export type {
  GoToMarketStrategies,
  GoToMarketStatus,
  BusinessContext,
  MarketingStrategy,
  SalesChannel,
  PricingStrategy,
  DistributionPlan,
  TimelinePhase,
  ToolRecommendation,
  GenerationOptions,
  GoToMarketV2State,
  StreamingState,
  ValidationResult,
  MarketingTactic,
  ImplementationStep,
  CostStructure,
  PricePoint,
  BudgetEstimate,
  ImplementationPhase
} from './types';