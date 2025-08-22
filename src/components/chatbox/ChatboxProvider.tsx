'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { 
  ChatboxState, 
  ChatboxMessageData, 
  AnalysisConfig, 
  AnalysisResult, 
  AnalysisType,
  ChatboxPlugin,
  AnalysisProvider,
  ChatboxStorage,
  ChatboxPreferences,
  BusinessSuggestion,
  BusinessSuggestionState,
  Conversation
} from './types';
import type { ChatboxContext } from './types';
import { ProfileFormData } from '@/app/businessidea/types/profile.types';
import { useStorageManager } from './hooks/useStorageManager';
import { useCacheManager } from './hooks/useCacheManager';
import { ImplementationPlan } from '@/features/implementation-plan/types';
import { OpenRouterClient } from '@/lib/openrouter/client';
import { chatboxDebug } from '@/app/businessidea/utils/logStore';

interface PlanOutline {
  title: string;
  overview: string;
  keyPhases: string[];
  estimatedTimeline: string;
  majorMilestones: string[];
  resourceRequirements: string[];
  approvalRequired: boolean;
}

interface ChatboxContextType extends ChatboxState {
  // Core actions
  openChatbox: (analysisType?: AnalysisType) => void;
  closeChatbox: () => void;
  toggleChatbox: () => void;
  
  // Configuration
  updateConfig: (config: Partial<AnalysisConfig>) => void;
  setProfileData: (data: ProfileFormData) => void;
  
  // Messages
  addMessage: (message: Omit<ChatboxMessageData, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  
  // Analysis
  startAnalysis: (useStreaming?: boolean, data?: any) => Promise<void>;
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
  
  // Mock data functionality
  useMockData: boolean;
  toggleMockData: () => void;
  
  // Business suggestions
  generateBusinessSuggestions: () => Promise<void>;
  clearBusinessSuggestions: () => void;
  
  // Implementation plan methods
  generatePlanOutline: (suggestion: BusinessSuggestion) => Promise<PlanOutline>;
  generateFullPlan: (outline: PlanOutline, onChunk?: (chunk: string) => void) => Promise<ImplementationPlan>;
  
  // Conversations
  openConversation: (id: string) => void;
  createConversation: (title: string) => string;
  addMessageToConversation: (conversationId: string, message: Omit<ChatboxMessageData, 'id' | 'timestamp'>) => string;
  appendToConversationMessage: (conversationId: string, messageId: string, chunk: string) => void;
  createPlanConversation: (suggestion: BusinessSuggestion) => Promise<string>;
}

const ChatboxReactContext = createContext<ChatboxContextType | undefined>(undefined);

const STORAGE_KEY = 'chatbox-storage';

const defaultConfig: AnalysisConfig = {
  type: 'profile',
  model: '',
  apiKey: '',
  temperature: 0.7,
  maxTokens: 800
};

const defaultBusinessSuggestionState = {
  suggestions: [],
  suggestionStatus: 'idle' as const,
  suggestionError: undefined,
  lastGeneratedAt: undefined
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
  const [state, setState] = useState<ChatboxState & { plugins: ChatboxPlugin[]; providers: AnalysisProvider[] }>({
    status: 'idle',
    config: defaultConfig,
    messages: [],
    isVisible: false,
    error: undefined,
    currentAnalysis: undefined,
    businessSuggestions: defaultBusinessSuggestionState,
    conversations: [],
    activeConversationId: undefined,
    plugins: [],
    providers: []
  });

  // Initialize the chatbox system on mount
  useEffect(() => {
    const initializeSystem = async () => {
      try {
        const { initializeChatboxSystem } = await import('@/lib/chatbox/initialization');
        await initializeChatboxSystem();
        console.log('Chatbox system initialized successfully');
      } catch (error) {
        console.error('Failed to initialize chatbox system:', error);
      }
    };

    initializeSystem();
  }, []);
  

  
  // Extended state
  const [profileData, setProfileDataState] = useState<ProfileFormData>();
  const [plugins, setPlugins] = useState<ChatboxPlugin[]>([]);
  const [providers, setProviders] = useState<AnalysisProvider[]>([]);
  const [useMockData, setUseMockData] = useState(process.env.NODE_ENV === 'development');
  
  // Storage hooks
  const storageManager = useStorageManager();
  const cacheManager = useCacheManager();
  
  // Generate profile data hash for caching
  const profileDataHash = profileData ? storageManager.generateDataHash(profileData) : undefined;

  // Generate unique ID
  const generateId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
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



  // Messages
  const addMessage = useCallback((message: Omit<ChatboxMessageData, 'id' | 'timestamp'>) => {
    const newMessage: ChatboxMessageData = {
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
      messages: []
    }));
  }, []);

  // Analysis with streaming support and caching
  const startAnalysis = useCallback(async (useStreaming: boolean = true, data?: any) => {
    console.log('ChatboxProvider: startAnalysis called', {
      hasApiKey: !!state.config.apiKey,
      hasModel: !!state.config.model,
      hasProfileData: !!profileData,
      hasPassedData: !!data,
      useMockData,
      config: state.config
    });

    chatboxDebug.info('backend-analysis', 'startAnalysis called', {
      hasApiKey: !!state.config.apiKey,
      hasModel: !!state.config.model,
      hasProfileData: !!profileData,
      hasPassedData: !!data,
      streaming: !!useStreaming,
      model: state.config.model
    });

    // Use passed data if provided, otherwise fall back to context profileData
    const analysisData = data || profileData;

    if (!state.config.apiKey || !state.config.model) {
      const error = 'API key and model are required';
      console.error('ChatboxProvider: Missing required config', { apiKey: !!state.config.apiKey, model: !!state.config.model });
      setState(prev => ({ 
        ...prev, 
        status: 'error', 
        error 
      }));
      chatboxDebug.error('backend-analysis', 'Missing API key or model', { hasApiKey: !!state.config.apiKey, hasModel: !!state.config.model });
      return;
    }

    // Check cache first
    chatboxDebug.debug('backend-analysis', 'Checking cache for previous analysis result');
    const cachedResult = await cacheManager.getCachedResult(state.config, profileDataHash);
    if (cachedResult) {
      console.log('Using cached analysis result');
      chatboxDebug.success('backend-analysis', 'Using cached analysis result', { cached: true });
      
      // Add cached result as message
      const cachedMessage: ChatboxMessageData = {
        id: generateId(),
        type: 'assistant',
        content: cachedResult.content,
        timestamp: new Date().toISOString(),
        analysisType: state.config.type,
        metadata: { ...cachedResult.metadata, cached: true }
      };
      
      setState(prev => ({
        ...prev,
        status: 'completed',
        currentAnalysis: cachedResult,
        messages: [...prev.messages, cachedMessage]
      }));
      
      return;
    }

    chatboxDebug.debug('backend-analysis', 'Cache miss; proceeding to analysis');

    setState(prev => ({ ...prev, status: 'analyzing', error: undefined }));
    chatboxDebug.info('backend-analysis', 'Analysis started', { streaming: !!useStreaming, model: state.config.model });
    
    // Add initial message to show analysis is starting
    const analysisMessageId = generateId();
    const initialMessage: ChatboxMessageData = {
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
      console.log('ChatboxProvider: Analysis service loaded, looking for provider for model:', state.config.model);
      
      const provider = analysisService.findProviderForModel(state.config.model);
      console.log('ChatboxProvider: Provider found:', !!provider, provider?.id);
      if (provider) {
        chatboxDebug.info('backend-analysis', 'Provider selected', { providerId: provider.id, model: state.config.model });
      }
      
      if (!provider) {
        const availableProviders = analysisService.getAllProviders();
        console.error('ChatboxProvider: No provider found for model', {
          model: state.config.model,
          availableProviders: availableProviders.map(p => ({ id: p.id, supportedModels: p.supportedModels }))
        });
        chatboxDebug.error('backend-analysis', 'No provider found for model', { model: state.config.model });
        throw new Error(`No provider found for model: ${state.config.model}`);
      }

      let result: any;
      
      if (useStreaming && (provider as any).analyzeStreaming) {
        // Use streaming analysis
        chatboxDebug.debug('backend-analysis', 'Streaming analysis started', { providerId: provider.id });
        result = await (provider as any).analyzeStreaming(
          state.config, 
          analysisData,
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
        console.log('ChatboxProvider: Starting regular analysis with profile data:', analysisData);
        chatboxDebug.debug('backend-analysis', 'Regular analysis started', { providerId: provider.id });
        result = await analysisService.analyze(state.config, analysisData);
        console.log('ChatboxProvider: Analysis completed:', result);
        
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
      chatboxDebug.success('backend-analysis', 'Analysis completed', { status: result.status });

      try {
        // Cache the result
        await cacheManager.cacheResult(state.config, profileDataHash, result);
        chatboxDebug.info('backend-analysis', 'Result cached', { model: state.config.model });
        
        // Add to history
        storageManager.addToHistory(result);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Failed to cache or save analysis result:', errorMessage);
        chatboxDebug.warn('backend-analysis', 'Failed to cache or save analysis result', { message: errorMessage });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      chatboxDebug.error('backend-analysis', 'Analysis failed', { message: errorMessage });
      
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
  }, [state.config, profileData, profileDataHash, generateId, cacheManager, storageManager]);

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

  // Storage - using new storage manager
  const saveSession = useCallback(() => {
    storageManager.saveSession(state.config, state.messages, profileDataHash);
  }, [state.config, state.messages, profileDataHash, storageManager]);

  const loadSession = useCallback(() => {
    const session = storageManager.loadSession();
    if (session) {
      setState(prev => ({
        ...prev,
        config: session.config,
        messages: session.messages
      }));
      
      return session;
    }
    return null;
  }, [storageManager]);

  const clearStorage = useCallback(() => {
    storageManager.clearAll();
    setState(prev => ({
      ...prev,
      messages: [],
      status: 'idle',
      error: undefined,
      currentAnalysis: undefined
    }));
  }, [storageManager]);



  const toggleMockData = useCallback(() => {
    setUseMockData(prev => !prev);
  }, []);

  // Business suggestions
  const generateBusinessSuggestions = useCallback(async () => {
    if (!state.currentAnalysis) {
      console.error('No analysis result available for business suggestion generation');
      return;
    }

    setState(prev => ({
      ...prev,
      businessSuggestions: {
        ...prev.businessSuggestions,
        suggestionStatus: 'generating',
        suggestionError: undefined
      }
    }));

    try {
      const { businessSuggestionService } = await import('@/lib/chatbox/BusinessSuggestionService');
      const { businessSuggestionErrorHandler } = await import('./utils/error-handler');
      
      // Get custom system prompt from settings
      const { getCustomSystemPrompt } = await import('@/lib/business/settings-utils');
      const customSystemPrompt = getCustomSystemPrompt();
      
      if (!state.currentAnalysis) {
        throw new Error('No analysis result available');
      }
      
      const suggestions = await businessSuggestionErrorHandler.retryOperation(
        () => businessSuggestionService.generateSuggestions(
          state.config,
          state.currentAnalysis!,
          profileData,
          customSystemPrompt
        ),
        {
          maxAttempts: 2,
          retryableErrors: ['network', 'timeout', 'rate_limit'] as any
        }
      );

      setState(prev => ({
        ...prev,
        businessSuggestions: {
          suggestions,
          suggestionStatus: 'completed',
          suggestionError: undefined,
          lastGeneratedAt: new Date().toISOString()
        }
      }));

      // Cache the suggestions
      try {
        await cacheManager.cacheResult(
          { ...state.config, type: 'business-suggestion' },
          profileDataHash,
          {
            id: `business-suggestions-${Date.now()}`,
            type: 'business-suggestion',
            status: 'success',
            content: JSON.stringify(suggestions),
            timestamp: new Date().toISOString(),
            model: state.config.model,
            metadata: { suggestionCount: suggestions.length }
          }
        );

        // Note: Business suggestions are cached via the cache manager above
      } catch (cacheError) {
        console.warn('Failed to cache business suggestions:', cacheError);
      }

    } catch (error) {
      const { handleBusinessSuggestionError } = await import('./utils/error-handler');
      const userError = handleBusinessSuggestionError(error);
      
      setState(prev => ({
        ...prev,
        businessSuggestions: {
          ...prev.businessSuggestions,
          suggestionStatus: 'error',
          suggestionError: userError.message
        }
      }));
    }
  }, [state.config, state.currentAnalysis, profileData, profileDataHash, cacheManager, storageManager]);

  const clearBusinessSuggestions = useCallback(() => {
    setState(prev => ({
      ...prev,
      businessSuggestions: defaultBusinessSuggestionState
    }));
  }, []);

  // Implementation Plan Methods
  const generatePlanOutline = useCallback(async (suggestion: BusinessSuggestion): Promise<PlanOutline> => {
    if (!state.config.apiKey || !state.config.model) {
      throw new Error('API key and model are required');
    }

    console.log('ChatboxProvider: Starting plan outline generation', {
      suggestionId: suggestion.id,
      suggestionTitle: suggestion.title,
      model: state.config.model
    });

    try {
      const client = new OpenRouterClient(state.config.apiKey);
      
      // REPLACED: verbose outline prompt with streamlined 3–4 line version for concise context
      const prompt = `Provide a concise JSON outline for this idea:
- Include: title, 2–3 sentence overview, 4–6 keyPhases, estimatedTimeline, 3–5 majorMilestones, resourceRequirements, approvalRequired.
- Base it strictly on the fields below (no extra commentary).
- Respond with valid JSON only.

Idea:
title=${suggestion.title}
desc=${suggestion.description}
category=${suggestion.category}
target=${suggestion.targetMarket}
cost=${suggestion.estimatedStartupCost}
features=${suggestion.keyFeatures.join(', ')}`;

      const response = await client.chat({
        model: state.config.model,
        messages: [
          {
            role: 'system',
            content: 'You are a business planning expert. Generate concise, actionable implementation plan outlines. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: state.config.temperature || 0.7,
        max_tokens: 800
      });

      const content = response?.choices?.[0]?.message?.content || '';
      const outline = parseOutlineResponse(content);
      
      console.log('ChatboxProvider: Plan outline generated successfully', {
        title: outline.title,
        phaseCount: outline.keyPhases.length
      });

      return outline;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('ChatboxProvider: Failed to generate plan outline', error);
      throw new Error(`Plan outline generation failed: ${errorMessage}`);
    }
  }, [state.config]);

  const generateFullPlan = useCallback(async (
    outline: PlanOutline,
    onChunk?: (chunk: string) => void
  ): Promise<ImplementationPlan> => {
    if (!state.config.apiKey || !state.config.model) {
      throw new Error('API key and model are required');
    }

    console.log('ChatboxProvider: Starting full plan generation', {
      outlineTitle: outline.title,
      model: state.config.model,
      streaming: !!onChunk
    });

    try {
      const client = new OpenRouterClient(state.config.apiKey);
      
      // REPLACED: verbose full-plan prompt with streamlined version for concise generation
      const prompt = `Create a clear, actionable implementation plan (markdown):
- Cover: executive summary, phases with objectives/timelines, 90-day quick start, resources/budget, KPIs, risks.
- Use concise headers and bullet points; be practical and to the point.
- Base strictly on the outline provided below.

Outline:
- Title: ${outline.title}
- Overview: ${outline.overview}
- Phases: ${outline.keyPhases.join(', ')}
- Timeline: ${outline.estimatedTimeline}
- Milestones: ${outline.majorMilestones.join(', ')}
- Resources: ${outline.resourceRequirements.join(', ')}`;

      if (onChunk) {
        // Streaming generation
        let accumulatedContent = '';
        
        await client.chat({
          model: state.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful business planning expert. Create detailed, actionable implementation plans in clear, conversational markdown format. Be encouraging and practical. Use emojis and clear formatting to make the content engaging and easy to read.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: state.config.temperature || 0.7,
          max_tokens: state.config.maxTokens || 3000
        }, {
          stream: true,
          onChunk: (chunk: string) => {
            accumulatedContent += chunk;
            onChunk(chunk);
          }
        });

        // For streaming, we'll return the raw content formatted for display
        const plan: ImplementationPlan = {
          meta: {
            ideaId: `plan-${Date.now()}`,
            title: outline.title,
            category: 'Business',
            version: 'v1',
            createdAt: new Date().toISOString()
          },
          overview: {
            goals: ['Launch successful business based on the outlined plan'],
            successCriteria: ['Business launch', 'Initial customer acquisition', 'Revenue generation'],
            assumptions: ['Market conditions remain stable', 'Resources are available as planned']
          },
          phases: [
            {
              id: 'phase-1',
              name: 'Implementation Phase',
              objectives: ['Execute the business plan successfully'],
              duration: outline.estimatedTimeline,
              milestones: outline.majorMilestones.map((milestone, index) => ({
                id: `milestone-${index}`,
                title: milestone,
                due: 'As per timeline',
                successCriteria: ['Completion of milestone']
              }))
            }
          ],
          tasks: outline.keyPhases.map((phase, index) => ({
            id: `task-${index}`,
            phaseId: 'phase-1',
            title: phase,
            description: `Complete ${phase}`,
            owner: 'Business owner',
            effort: 'Medium'
          })),
          formattedContent: accumulatedContent,
          rawContent: accumulatedContent
        };
        
        console.log('ChatboxProvider: Full plan generated successfully (streaming)', {
          title: plan.meta.title,
          contentLength: accumulatedContent.length
        });

        return plan;
      } else {
        // Non-streaming generation
        const response = await client.chat({
          model: state.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful business planning expert. Create detailed, actionable implementation plans in clear, conversational markdown format. Be encouraging and practical. Use emojis and clear formatting to make the content engaging and easy to read.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: state.config.temperature || 0.7,
          max_tokens: state.config.maxTokens || 3000
        });

        const content = response?.choices?.[0]?.message?.content || '';
        
        // For non-streaming, we'll also return the raw content
        const plan: ImplementationPlan = {
          meta: {
            ideaId: `plan-${Date.now()}`,
            title: outline.title,
            category: 'Business',
            version: 'v1',
            createdAt: new Date().toISOString()
          },
          overview: {
            goals: ['Launch successful business based on the outlined plan'],
            successCriteria: ['Business launch', 'Initial customer acquisition', 'Revenue generation'],
            assumptions: ['Market conditions remain stable', 'Resources are available as planned']
          },
          phases: [
            {
              id: 'phase-1',
              name: 'Implementation Phase',
              objectives: ['Execute the business plan successfully'],
              duration: outline.estimatedTimeline,
              milestones: outline.majorMilestones.map((milestone, index) => ({
                id: `milestone-${index}`,
                title: milestone,
                due: 'As per timeline',
                successCriteria: ['Completion of milestone']
              }))
            }
          ],
          tasks: outline.keyPhases.map((phase, index) => ({
            id: `task-${index}`,
            phaseId: 'phase-1',
            title: phase,
            description: `Complete ${phase}`,
            owner: 'Business owner',
            effort: 'Medium'
          })),
          formattedContent: content,
          rawContent: content
        };
        
        console.log('ChatboxProvider: Full plan generated successfully', {
          title: plan.meta.title,
          contentLength: content.length
        });

        return plan;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('ChatboxProvider: Failed to generate full plan', error);
      throw new Error(`Full plan generation failed: ${errorMessage}`);
    }
  }, [state.config]);

  // Helper functions for parsing responses
  const parseOutlineResponse = useCallback((content: string): PlanOutline => {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        title: parsed.title || 'Implementation Plan',
        overview: parsed.overview || 'Implementation plan overview',
        keyPhases: Array.isArray(parsed.keyPhases) ? parsed.keyPhases : ['Phase 1: Planning'],
        estimatedTimeline: parsed.estimatedTimeline || '6-12 months',
        majorMilestones: Array.isArray(parsed.majorMilestones) ? parsed.majorMilestones : ['Milestone 1'],
        resourceRequirements: Array.isArray(parsed.resourceRequirements) ? parsed.resourceRequirements : ['Team'],
        approvalRequired: parsed.approvalRequired !== false
      };
    } catch (error) {
      console.error('ChatboxProvider: Failed to parse outline response', error);
      
      // Return fallback outline
      return {
        title: 'Business Implementation Plan',
        overview: 'A comprehensive plan to launch and grow your business idea.',
        keyPhases: [
          'Phase 1: Market Research & Validation',
          'Phase 2: Product Development',
          'Phase 3: Business Setup & Legal',
          'Phase 4: Marketing & Launch',
          'Phase 5: Growth & Scaling'
        ],
        estimatedTimeline: '6-12 months',
        majorMilestones: [
          'Market validation completed',
          'MVP developed and tested',
          'Business legally established',
          'First customers acquired',
          'Revenue targets achieved'
        ],
        resourceRequirements: [
          'Founding team (2-4 people)',
          'Initial funding ($10K-50K)',
          'Development tools and software',
          'Marketing budget',
          'Legal and accounting services'
        ],
        approvalRequired: true
      };
    }
  }, []);

  const parseFullPlanResponse = useCallback((content: string): ImplementationPlan => {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and structure the response according to ImplementationPlan interface
      return {
        meta: {
          ideaId: parsed.meta?.ideaId || `plan-${Date.now()}`,
          title: parsed.meta?.title || 'Implementation Plan',
          category: parsed.meta?.category || 'Business',
          version: parsed.meta?.version || 'v1',
          createdAt: parsed.meta?.createdAt || new Date().toISOString()
        },
        overview: {
          goals: Array.isArray(parsed.overview?.goals) ? parsed.overview.goals : ['Launch successful business'],
          successCriteria: Array.isArray(parsed.overview?.successCriteria) ? parsed.overview.successCriteria : undefined,
          assumptions: Array.isArray(parsed.overview?.assumptions) ? parsed.overview.assumptions : undefined
        },
        phases: Array.isArray(parsed.phases) ? parsed.phases.map((phase: any, index: number) => ({
          id: phase.id || `phase-${index + 1}`,
          name: phase.name || `Phase ${index + 1}`,
          objectives: Array.isArray(phase.objectives) ? phase.objectives : [],
          duration: phase.duration || '1-2 months',
          milestones: Array.isArray(phase.milestones) ? phase.milestones.map((milestone: any, mIndex: number) => ({
            id: milestone.id || `milestone-${index}-${mIndex}`,
            title: milestone.title || `Milestone ${mIndex + 1}`,
            due: milestone.due,
            successCriteria: Array.isArray(milestone.successCriteria) ? milestone.successCriteria : undefined
          })) : []
        })) : [],
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks.map((task: any, index: number) => ({
          id: task.id || `task-${index + 1}`,
          phaseId: task.phaseId,
          title: task.title || `Task ${index + 1}`,
          description: task.description,
          owner: task.owner,
          effort: task.effort,
          dependencies: Array.isArray(task.dependencies) ? task.dependencies : undefined
        })) : [],
        timeline: parsed.timeline ? {
          start: parsed.timeline.start,
          end: parsed.timeline.end,
          milestones: Array.isArray(parsed.timeline.milestones) ? parsed.timeline.milestones : undefined
        } : undefined,
        resources: parsed.resources ? {
          team: Array.isArray(parsed.resources.team) ? parsed.resources.team : undefined,
          vendors: Array.isArray(parsed.resources.vendors) ? parsed.resources.vendors : undefined
        } : undefined,
        budget: parsed.budget ? {
          items: Array.isArray(parsed.budget.items) ? parsed.budget.items : [],
          total: parsed.budget.total,
          assumptions: Array.isArray(parsed.budget.assumptions) ? parsed.budget.assumptions : undefined
        } : undefined,
        risks: Array.isArray(parsed.risks) ? parsed.risks : undefined,
        kpis: Array.isArray(parsed.kpis) ? parsed.kpis : undefined,
        next90Days: parsed.next90Days ? {
          days30: Array.isArray(parsed.next90Days.days30) ? parsed.next90Days.days30 : [],
          days60: Array.isArray(parsed.next90Days.days60) ? parsed.next90Days.days60 : [],
          days90: Array.isArray(parsed.next90Days.days90) ? parsed.next90Days.days90 : []
        } : undefined
      };
    } catch (error) {
      console.error('ChatboxProvider: Failed to parse full plan response', error);
      
      // Return fallback plan
      return {
        meta: {
          ideaId: `fallback-plan-${Date.now()}`,
          title: 'Business Implementation Plan',
          category: 'Business',
          version: 'v1',
          createdAt: new Date().toISOString()
        },
        overview: {
          goals: ['Launch and establish successful business', 'Achieve market validation', 'Generate sustainable revenue']
        },
        phases: [
          {
            id: 'phase-1',
            name: 'Planning & Research',
            objectives: ['Conduct market research', 'Validate business concept', 'Develop business plan'],
            duration: '1-2 months',
            milestones: [
              {
                id: 'milestone-1-1',
                title: 'Market research completed',
                due: undefined,
                successCriteria: ['Target market identified', 'Competitive analysis done']
              }
            ]
          }
        ],
        tasks: [
          {
            id: 'task-1',
            phaseId: 'phase-1',
            title: 'Conduct market research',
            description: 'Research target market, competitors, and industry trends',
            effort: '2-3 weeks'
          }
        ]
      };
    }
  }, []);

  // Conversation management
  const openConversation = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      isVisible: true,
      activeConversationId: id
    }));
  }, []);

  const createConversation = useCallback((title: string) => {
    const id = generateId();
    const conversation: Conversation = {
      id,
      title,
      messages: [],
      unread: 0
    };
    setState(prev => ({
      ...prev,
      conversations: [...prev.conversations, conversation],
      activeConversationId: id,
      isVisible: true
    }));
    return id;
  }, [generateId]);

  const addMessageToConversation = useCallback((conversationId: string, message: Omit<ChatboxMessageData, 'id' | 'timestamp'>) => {
    const msgId = generateId();
    const newMessage: ChatboxMessageData = {
      ...message,
      id: msgId,
      timestamp: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      conversations: prev.conversations.map(c => 
        c.id === conversationId 
          ? { ...c, messages: [...c.messages, newMessage] } 
          : c
      )
    }));
    return msgId;
  }, [generateId]);

  const appendToConversationMessage = useCallback((conversationId: string, messageId: string, chunk: string) => {
    setState(prev => ({
      ...prev,
      conversations: prev.conversations.map(c => {
        if (c.id !== conversationId) return c;
        return {
          ...c,
          messages: c.messages.map(m => 
            m.id === messageId 
              ? { ...m, content: (m.content || '') + chunk } 
              : m
          )
        };
      })
    }));
  }, []);

  const createPlanConversation = useCallback(async (suggestion: BusinessSuggestion) => {
    try {
      setState(prev => ({ ...prev, status: 'analyzing', error: undefined }));
      const outline = await generatePlanOutline(suggestion);
      const convTitle = outline.title || `${suggestion.title} Plan`;
      const conversationId = createConversation(convTitle);
      const messageId = addMessageToConversation(conversationId, {
        type: 'assistant',
        content: '',
        analysisType: 'business-suggestion'
      });
      await generateFullPlan(outline, (chunk: string) => {
        appendToConversationMessage(conversationId, messageId, chunk);
      });
      setState(prev => ({ ...prev, status: 'completed' }));
      return conversationId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ ...prev, status: 'error', error: errorMessage }));
      throw error;
    }
  }, [generatePlanOutline, generateFullPlan, createConversation, addMessageToConversation, appendToConversationMessage]);

  const contextValue = {
    ...state,
    profileData,
    useMockData,
    toggleMockData,
    setProfileData: setProfileDataState,
    openChatbox,
    closeChatbox,
    toggleChatbox,
    addMessage,
    clearMessages,
    updateConfig,
    startAnalysis,
    retryAnalysis,
    registerPlugin,
    unregisterPlugin,
    getActivePlugins,
    registerProvider,
    getProvider,
    saveSession,
    loadSession,
    clearStorage,
    generateBusinessSuggestions,
    clearBusinessSuggestions,
    generatePlanOutline,
    generateFullPlan,
    // Conversation actions
    openConversation,
    createConversation,
    addMessageToConversation,
    appendToConversationMessage,
    createPlanConversation
  };

  return (
    <ChatboxReactContext.Provider value={contextValue}>
      {children}
    </ChatboxReactContext.Provider>
  );
};

export const useChatbox = () => {
  const context = useContext(ChatboxReactContext);
  if (context === undefined) {
    throw new Error('useChatbox must be used within a ChatboxProvider');
  }
  return context;
};