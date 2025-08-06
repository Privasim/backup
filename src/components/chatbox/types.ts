import { ProfileFormData } from '@/app/businessidea/types/profile.types';

// Core chatbox types
export type ChatboxStatus = 'idle' | 'configuring' | 'analyzing' | 'completed' | 'error';

export type AnalysisType = 'profile' | 'resume' | 'interview' | 'career-planning' | 'business-suggestion';

// Business suggestion types
export interface BusinessSuggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  viabilityScore: number;
  keyFeatures: string[];
  targetMarket: string;
  estimatedStartupCost: string;
  metadata: Record<string, any>;
}

export interface BusinessSuggestionState {
  suggestions: BusinessSuggestion[];
  suggestionStatus: 'idle' | 'generating' | 'completed' | 'error';
  suggestionError?: string;
  lastGeneratedAt?: string;
}

// Plugin system interfaces
export interface ChatboxPlugin {
  id: string;
  name: string;
  version: string;
  analysisTypes: AnalysisType[];
  initialize: (context: ChatboxContext) => Promise<void>;
  cleanup: () => Promise<void>;
  getControls?: () => React.ComponentType<any>;
  processData?: (data: any) => Promise<any>;
}

// Message system
export interface ChatboxMessageData {
  id: string;
  type: 'user' | 'assistant' | 'system' | 'error';
  content: string;
  timestamp: string;
  analysisType?: AnalysisType;
  metadata?: Record<string, any>;
}

// Analysis configuration
export interface AnalysisConfig {
  type: AnalysisType;
  model: string;
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
  customPrompt?: string;
}

// Analysis result
export interface AnalysisResult {
  id: string;
  type: AnalysisType;
  status: 'success' | 'error';
  content: string;
  timestamp: string;
  model: string;
  metadata?: Record<string, any>;
  error?: string;
}

// Chatbox context for plugins
export interface ChatboxContext {
  profileData?: ProfileFormData;
  messages: ChatboxMessageData[];
  config: AnalysisConfig;
  addMessage: (message: Omit<ChatboxMessageData, 'id' | 'timestamp'>) => void;
  updateConfig: (config: Partial<AnalysisConfig>) => void;
  triggerAnalysis: () => Promise<void>;
}

// Storage interfaces
export interface ChatboxStorage {
  apiKeys: Record<string, string>;
  analysisHistory: AnalysisResult[];
  preferences: ChatboxPreferences;
  lastSession?: {
    config: AnalysisConfig;
    messages: ChatboxMessageData[];
    timestamp: string;
  };
}

export interface ChatboxPreferences {
  defaultModel: string;
  autoSave: boolean;
  showTimestamps: boolean;
  theme: 'light' | 'dark' | 'auto';
  analysisTypes: AnalysisType[];
}

// Provider interfaces for extensibility
export interface AnalysisProvider {
  id: string;
  name: string;
  supportedModels: string[];
  analyze: (config: AnalysisConfig, data: any) => Promise<AnalysisResult>;
  validateConfig: (config: AnalysisConfig) => boolean;
  formatPrompt: (data: any, customPrompt?: string) => string;
}

// Event system for plugin communication
export interface ChatboxEvent {
  type: string;
  payload: any;
  timestamp: string;
}

export type ChatboxEventHandler = (event: ChatboxEvent) => void;

// Export utility types
export type ChatboxState = {
  status: ChatboxStatus;
  config: AnalysisConfig;
  messages: ChatboxMessageData[];
  currentAnalysis?: AnalysisResult;
  error?: string;
  isVisible: boolean;
  businessSuggestions: BusinessSuggestionState;
};