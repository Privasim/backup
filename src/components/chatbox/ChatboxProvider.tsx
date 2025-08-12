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
  BusinessSuggestionState
} from './types';
import type { ChatboxContext } from './types';
import { ProfileFormData } from '@/app/businessidea/types/profile.types';
import { useStorageManager } from './hooks/useStorageManager';
import { useCacheManager } from './hooks/useCacheManager';
import { ImplementationPlan } from '@/features/implementation-plan/types';
import { OpenRouterClient } from '@/lib/openrouter/client';

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
      messages: [],
      status: 'idle',
      currentAnalysis: undefined,
      error: undefined
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
      return;
    }

    // Check cache first
    const cachedResult = await cacheManager.getCachedResult(state.config, profileDataHash);
    if (cachedResult) {
      console.log('Using cached analysis result');
      
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

    setState(prev => ({ ...prev, status: 'analyzing', error: undefined }));
    
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
      
      if (!provider) {
        const availableProviders = analysisService.getAllProviders();
        console.error('ChatboxProvider: No provider found for model', {
          model: state.config.model,
          availableProviders: availableProviders.map(p => ({ id: p.id, supportedModels: p.supportedModels }))
        });
        throw new Error(`No provider found for model: ${state.config.model}`);
      }

      let result: any;
      
      if (useStreaming && (provider as any).analyzeStreaming) {
        // Use streaming analysis
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

      try {
        // Cache the result
        await cacheManager.cacheResult(state.config, profileDataHash, result);
        
        // Add to history
        storageManager.addToHistory(result);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Failed to cache or save analysis result:', errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
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
      
      const prompt = `Create a high-level implementation plan outline for this business idea:

**Business Idea:** ${suggestion.title}
**Description:** ${suggestion.description}
**Category:** ${suggestion.category}
**Target Market:** ${suggestion.targetMarket}
**Estimated Startup Cost:** ${suggestion.estimatedStartupCost}
**Key Features:** ${suggestion.keyFeatures.join(', ')}

Please provide a concise outline that includes:
1. A clear title for the implementation plan
2. A brief overview (2-3 sentences)
3. 4-6 key phases of implementation
4. Estimated timeline for completion
5. 3-5 major milestones
6. Key resource requirements

Respond with valid JSON in this format:
{
  "title": "Implementation Plan Title",
  "overview": "Brief overview of the plan...",
  "keyPhases": ["Phase 1: ...", "Phase 2: ...", ...],
  "estimatedTimeline": "6-12 months",
  "majorMilestones": ["Milestone 1", "Milestone 2", ...],
  "resourceRequirements": ["Resource 1", "Resource 2", ...],
  "approvalRequired": true
}`;

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
      
      const prompt = `Based on this approved outline, create a detailed implementation plan in a conversational, easy-to-read format:

**Outline:**
- Title: ${outline.title}
- Overview: ${outline.overview}
- Key Phases: ${outline.keyPhases.join(', ')}
- Timeline: ${outline.estimatedTimeline}
- Milestones: ${outline.majorMilestones.join(', ')}
- Resources: ${outline.resourceRequirements.join(', ')}

Please create a comprehensive, well-formatted implementation plan that includes:

1. **Executive Summary** - Brief overview of the plan
2. **Implementation Phases** - Detailed breakdown of each phase with objectives and timelines
3. **Action Items** - Specific tasks organized by phase
4. **90-Day Quick Start** - Immediate next steps for the first 90 days
5. **Resource Requirements** - Team, tools, and budget needs
6. **Success Metrics** - How to measure progress
7. **Risk Mitigation** - Potential challenges and solutions

Format your response in clear, readable markdown with:
- Headers and subheaders for organization
- Bullet points for lists
- Emojis for visual appeal
- Clear sections that are easy to scan
- Actionable language throughout

Make it conversational and encouraging - this should feel like a helpful guide, not a dry document.`;

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
        const plan = {
          meta: {
            ideaId: `plan-${Date.now()}`,
            title: outline.title,
            category: 'Business',
            version: 'v1',
            createdAt: new Date().toISOString()
          },
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
        const plan = {
          meta: {
            ideaId: `plan-${Date.now()}`,
            title: outline.title,
            category: 'Business',
            version: 'v1',
            createdAt: new Date().toISOString()
          },
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
    generateFullPlan
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