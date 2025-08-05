// Core components
export { ChatboxPanel } from './ChatboxPanel';
export { ChatboxProvider, useChatbox } from './ChatboxProvider';
export { default as ChatboxControls } from './ChatboxControls';
export { default as ChatboxMessage } from './ChatboxMessage';
export { default as MessageRenderer } from './MessageRenderer';
export { default as ChatboxProgress } from './ChatboxProgress';
export { default as ChatboxErrorBoundary } from './ChatboxErrorBoundary';
export { default as ChatboxToggle } from './ChatboxToggle';
export { default as ProfileAnalysisTrigger } from './ProfileAnalysisTrigger';
export { default as SkeletonScreen } from './SkeletonScreen';
export { default as ChatboxLayout } from './ChatboxLayout';

// Types
export type {
  ChatboxStatus,
  AnalysisType,
  ChatboxPlugin,
  ChatboxMessage,
  AnalysisConfig,
  AnalysisResult,
  ChatboxContext,
  ChatboxStorage,
  ChatboxPreferences,
  AnalysisProvider,
  ChatboxEvent,
  ChatboxEventHandler,
  ChatboxState
} from './types';

// Utilities
export { 
  createChatboxPlugin, 
  validatePlugin, 
  PluginRegistry 
} from './utils/plugin-utils';

export { 
  createAnalysisProvider, 
  validateProvider, 
  ProviderRegistry,
  handleProviderError 
} from './utils/provider-utils';

export {
  ChatboxSettingsManager,
  useChatboxSettings
} from './utils/settings-utils';

export {
  validateApiKey,
  validateModel,
  validateAnalysisConfig,
  getErrorMessage,
  isTestApiKey,
  sanitizeApiKey
} from './utils/validation-utils';

export {
  createMessage,
  filterMessagesByType,
  filterMessagesByAnalysisType,
  getMessagesInTimeRange,
  getLastMessages,
  searchMessages,
  groupMessagesByAnalysisType,
  getConversationPairs,
  getMessageStatistics,
  exportMessages,
  validateMessage,
  cleanupOldMessages
} from './utils/message-utils';

// Error handling
export {
  createChatboxError,
  parseError,
  getUserFriendlyMessage,
  isRetryableError,
  getRetryDelay,
  getRecoveryStrategy,
  logError,
  createErrorNotification,
  sanitizeErrorForDisplay
} from './utils/error-utils';

export type { ChatboxError } from './utils/error-utils';

// Hooks
export { useStreamingMessage } from './hooks/useStreamingMessage';
export { useRetryLogic } from './hooks/useRetryLogic';
export { useProfileIntegration } from './hooks/useProfileIntegration';
export { useProfileChangeDetection } from './hooks/useProfileChangeDetection';