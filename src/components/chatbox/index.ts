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
// export { default as SkeletonScreen } from './SkeletonScreen'; // TODO: Implement if needed
export { default as ChatboxLayout } from './ChatboxLayout';
export { StorageManagementPanel } from './StorageManagementPanel';
export { default as AnalysisComparison } from './AnalysisComparison';
export { default as AnalysisHistory } from './AnalysisHistory';

// Types
export type {
  ChatboxStatus,
  AnalysisType,
  ChatboxPlugin,
  ChatboxMessageData,
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
  ChatboxStorageManager,
  storageManager
} from './utils/storage-manager';

export { ContentProcessor } from './utils/content-processor';
export { ClipboardUtils } from './utils/clipboard-utils';

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

// Error handling - TODO: Implement error-utils if needed
// export {
//   createChatboxError,
//   parseError,
//   getUserFriendlyMessage,
//   isRetryableError,
//   getRetryDelay,
//   getRecoveryStrategy,
//   logError,
//   createErrorNotification,
//   sanitizeErrorForDisplay
// } from './utils/error-utils';

// export type { ChatboxError } from './utils/error-utils';

// Hooks
export { useStreamingMessage } from './hooks/useStreamingMessage';
// export { useRetryLogic } from './hooks/useRetryLogic'; // TODO: Implement if needed
export { useProfileIntegration } from './hooks/useProfileIntegration';
export { useProfileChangeDetection } from './hooks/useProfileChangeDetection';
export { useStorageManager, useSessionManager, useCacheManager } from './hooks/useStorageManager';