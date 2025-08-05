'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { 
  ChatboxState, 
  ChatboxMessage, 
  AnalysisConfig, 
  AnalysisResult, 
  AnalysisType,
  ChatboxPlugin,
  AnalysisProvider,
  ChatboxContext,
  ChatboxStorage,
  ChatboxPreferences
} from './types';
import { ProfileFormData } from '@/app/businessidea/types/profile.types';

interface ChatboxContextType extends ChatboxState {
  // Core actions
  openChatbox: (analysisType?: AnalysisType) => void;
  closeChatbox: () => void;
  toggleChatbox: () => void;
  
  // Configuration
  updateConfig: (config: Partial<AnalysisConfig>) => void;
  setProfileData: (data: ProfileFormData) => void;
  
  // Messages
  addMessage: (message: Omit<ChatboxMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  
  // Analysis
  startAnalysis: () => Promise<void>;
  retryAnalysis: () => Promise<void>;
  
  // Plugin system
  registerPlugin: (plugin: ChatboxPlugin) => void;
  unregisterPlugin: (pluginId: string) => void;
  getActivePlugins: () => ChatboxPlugin[];
  
  // Provider system
  registerProvider: (provider: AnalysisProvider) => void;
  getProvider: (providerId: string) => AnalysisProvider | undefined;
  
  // Storage
  saveSession: () => void;
  loadSession: () => void;
  clearStorage: () => void;
  
  // State
  profileData?: ProfileFormData;
  plugins: ChatboxPlugin[];
  providers: AnalysisProvider[];
}

const ChatboxContext = createContext<ChatboxContextType | undefined>(undefined);

const STORAGE_KEY = 'chatbox-storage';

const defaultConfig: AnalysisConfig = {
  type: 'profile',
  model: '',
  apiKey: '',
  temperature: 0.7,
  maxTokens: 800
};

const defaultPreferences: ChatboxPreferences = {
  defaultModel: 'qwen/qwen3-coder:free',
  autoSave: true,
  showTimestamps: true,
  theme: 'auto',
  analysisTypes: ['profile']
};

export const ChatboxProvider = ({ children }: { children: ReactNode }) => {
  // Core state
  const [state, setState] = useState<ChatboxState>({
    status: 'idle',
    config: defaultConfig,
    messages: [],
    isVisible: false
  });
  
  // Extended state
  const [profileData, setProfileDataState] = useState<ProfileFormData>();
  const [plugins, setPlugins] = useState<ChatboxPlugin[]>([]);
  const [providers, setProviders] = useState<AnalysisProvider[]>([]);

  // Generate unique ID
  const generateId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Storage utilities
  const getStorage = useCallback((): ChatboxStorage => {
    if (typeof window === 'undefined') return {
      apiKeys: {},
      analysisHistory: [],
      preferences: defaultPreferences
    };
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {
        apiKeys: {},
        analysisHistory: [],
        preferences: defaultPreferences
      };
    } catch {
      return {
        apiKeys: {},
        analysisHistory: [],
        preferences: defaultPreferences
      };
    }
  }, []);

  const setStorage = useCallback((storage: Partial<ChatboxStorage>) => {
    if (typeof window === 'undefined') return;
    
    try {
      const current = getStorage();
      const updated = { ...current, ...storage };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save chatbox storage:', error);
    }
  }, [getStorage]);

  // Core actions
  const openChatbox = useCallback((analysisType: AnalysisType = 'profile') => {
    setState(prev => ({
      ...prev,
      isVisible: true,
      config: { ...prev.config, type: analysisType }
    }));
  }, []);

  const closeChatbox = useCallback(() => {
    setState(prev => ({ ...prev, isVisible: false }));
  }, []);

  const toggleChatbox = useCallback(() => {
    setState(prev => ({ ...prev, isVisible: !prev.isVisible }));
  }, []);

  // Configuration
  const updateConfig = useCallback((configUpdate: Partial<AnalysisConfig>) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, ...configUpdate }
    }));
  }, []);

  const setProfileData = useCallback((data: ProfileFormData) => {
    setProfileDataState(data);
  }, []);

  // Messages
  const addMessage = useCallback((message: Omit<ChatboxMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatboxMessage = {
      ...message,
      id: generateId(),
      timestamp: new Date().toISOString()
    };
    
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));
  }, [generateId]);

  const clearMessages = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      messages: [],
      status: 'idle',
      currentAnalysis: undefined,
      error: undefined
    }));
  }, []);

  // Analysis with streaming support
  const startAnalysis = useCallback(async (useStreaming: boolean = true) => {
    if (!state.config.apiKey || !state.config.model) {
      setState(prev => ({ 
        ...prev, 
        status: 'error', 
        error: 'API key and model are required' 
      }));
      return;
    }

    if (!profileData) {
      setState(prev => ({ 
        ...prev, 
        status: 'error', 
        error: 'Profile data is required for analysis' 
      }));
      return;
    }

    setState(prev => ({ ...prev, status: 'analyzing', error: undefined }));
    
    // Add initial message to show analysis is starting
    const analysisMessageId = generateId();
    const initialMessage: ChatboxMessage = {
      id: analysisMessageId,
      type: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      analysisType: state.config.type
    };
    
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, initialMessage]
    }));
    
    try {
      // Import analysis service dynamically to avoid circular dependencies
      const { analysisService } = await import('@/lib/chatbox/AnalysisService');
      const provider = analysisService.findProviderForModel(state.config.model);
      
      if (!provider) {
        throw new Error(`No provider found for model: ${state.config.model}`);
      }

      let result: any;
      
      if (useStreaming && (provider as any).analyzeStreaming) {
        // Use streaming analysis
        result = await (provider as any).analyzeStreaming(
          state.config, 
          profileData,
          (chunk: string) => {
            // Update the message content in real-time
            setState(prev => ({
              ...prev,
              messages: prev.messages.map(msg => 
                msg.id === analysisMessageId 
                  ? { ...msg, content: msg.content + chunk }
                  : msg
              )
            }));
          }
        );
      } else {
        // Use regular analysis
        result = await analysisService.analyze(state.config, profileData);
        
        // Update message with complete content
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg => 
            msg.id === analysisMessageId 
              ? { ...msg, content: result.content, metadata: result.metadata }
              : msg
          )
        }));
      }
      
      if (result.status === 'error') {
        throw new Error(result.error || 'Analysis failed');
      }
      
      setState(prev => ({
        ...prev,
        status: 'completed',
        currentAnalysis: result
      }));

      // Save to history
      const storage = getStorage();
      setStorage({
        analysisHistory: [...storage.analysisHistory, result]
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      setState(prev => ({ 
        ...prev, 
        status: 'error', 
        error: errorMessage 
      }));
      
      // Update the message to show error
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === analysisMessageId 
            ? { 
                ...msg, 
                type: 'error',
                content: `Analysis failed: ${errorMessage}`
              }
            : msg
        )
      }));
    }
  }, [state.config, profileData, generateId, getStorage, setStorage]);

  const retryAnalysis = useCallback(async () => {
    await startAnalysis();
  }, [startAnalysis]);

  // Plugin system
  const registerPlugin = useCallback(async (plugin: ChatboxPlugin) => {
    try {
      const context: ChatboxContext = {
        profileData,
        messages: state.messages,
        config: state.config,
        addMessage,
        updateConfig,
        triggerAnalysis: startAnalysis
      };
      
      await plugin.initialize(context);
      setPlugins(prev => [...prev.filter(p => p.id !== plugin.id), plugin]);
    } catch (error) {
      console.error(`Failed to register plugin ${plugin.id}:`, error);
    }
  }, [profileData, state.messages, state.config, addMessage, updateConfig, startAnalysis]);

  const unregisterPlugin = useCallback(async (pluginId: string) => {
    const plugin = plugins.find(p => p.id === pluginId);
    if (plugin) {
      try {
        await plugin.cleanup();
      } catch (error) {
        console.error(`Failed to cleanup plugin ${pluginId}:`, error);
      }
    }
    setPlugins(prev => prev.filter(p => p.id !== pluginId));
  }, [plugins]);

  const getActivePlugins = useCallback(() => {
    return plugins.filter(plugin => 
      plugin.analysisTypes.includes(state.config.type)
    );
  }, [plugins, state.config.type]);

  // Provider system
  const registerProvider = useCallback((provider: AnalysisProvider) => {
    setProviders(prev => [...prev.filter(p => p.id !== provider.id), provider]);
  }, []);

  const getProvider = useCallback((providerId: string) => {
    return providers.find(p => p.id === providerId);
  }, [providers]);

  // Storage
  const saveSession = useCallback(() => {
    setStorage({
      lastSession: {
        config: state.config,
        messages: state.messages,
        timestamp: new Date().toISOString()
      }
    });
  }, [state.config, state.messages, setStorage]);

  const loadSession = useCallback(() => {
    const storage = getStorage();
    if (storage.lastSession) {
      setState(prev => ({
        ...prev,
        config: storage.lastSession!.config,
        messages: storage.lastSession!.messages
      }));
    }
  }, [getStorage]);

  const clearStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Auto-save session on changes
  useEffect(() => {
    if (state.messages.length > 0) {
      saveSession();
    }
  }, [state.messages, saveSession]);

  // Load session and settings on mount
  useEffect(() => {
    loadSession();
    
    // Load last used configuration
    const loadSettings = async () => {
      try {
        const { ChatboxSettingsManager } = await import('./utils/settings-utils');
        const lastConfig = ChatboxSettingsManager.getLastConfig();
        
        setState(prev => ({
          ...prev,
          config: { ...prev.config, ...lastConfig }
        }));
      } catch (error) {
        console.error('Failed to load chatbox settings:', error);
      }
    };
    
    loadSettings();
  }, [loadSession]);

  // Initialize analysis services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        const { initializeChatboxServices } = await import('@/lib/chatbox/initialization');
        initializeChatboxServices();
      } catch (error) {
        console.error('Failed to initialize chatbox services:', error);
      }
    };
    
    initializeServices();
  }, []);

  // Auto-save configuration changes
  useEffect(() => {
    if (state.config.apiKey && state.config.model) {
      const saveSettings = async () => {
        try {
          const { ChatboxSettingsManager } = await import('./utils/settings-utils');
          ChatboxSettingsManager.saveLastConfig(state.config);
        } catch (error) {
          console.error('Failed to save chatbox settings:', error);
        }
      };
      
      saveSettings();
    }
  }, [state.config]);

  const contextValue: ChatboxContextType = {
    ...state,
    profileData,
    plugins,
    providers,
    openChatbox,
    closeChatbox,
    toggleChatbox,
    updateConfig,
    setProfileData,
    addMessage,
    clearMessages,
    startAnalysis,
    retryAnalysis,
    registerPlugin,
    unregisterPlugin,
    getActivePlugins,
    registerProvider,
    getProvider,
    saveSession,
    loadSession,
    clearStorage
  };

  return (
    <ChatboxContext.Provider value={contextValue}>
      {children}
    </ChatboxContext.Provider>
  );
};

export const useChatbox = () => {
  const context = useContext(ChatboxContext);
  if (context === undefined) {
    throw new Error('useChatbox must be used within a ChatboxProvider');
  }
  return context;
};