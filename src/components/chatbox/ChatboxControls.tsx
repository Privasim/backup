'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useChatbox } from './ChatboxProvider';
import { getAvailableModels } from '@/lib/openrouter';
import { useChatboxSettings } from './utils/settings-utils';
import { validateAnalysisConfig } from './utils/validation-utils';
import { 
  PlayIcon, 
  CogIcon, 
  CircleStackIcon, 
  ClockIcon,
  CommandLineIcon,
  KeyIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import { StorageManagementPanel } from './StorageManagementPanel';
import { AnalysisHistory } from './AnalysisHistory';
import { SystemPromptSection } from './SystemPromptSection';
import { getMockProfile } from '@/data/mockProfiles';
import { chatboxDebug } from '@/app/businessidea/utils/logStore';
import { AnalysisConfig } from './types';
import { getAnalysisStatus } from './utils/profile-transformation';

// Prompt Enhancer Registry
type EnhancerOptions = {
  tone?: string;
  detail?: 'concise' | 'balanced' | 'rich';
  length?: 'short' | 'medium' | 'long';
};

type EnhancerResult = {
  improved: string;
  meta?: Record<string, unknown>;
};

type EnhancerFunction = (input: string, options?: EnhancerOptions) => Promise<EnhancerResult>;

// Module-level enhancer registry
let currentEnhancer: EnhancerFunction | null = null;
let enhancerRegistrationId: string | null = null;

/**
 * Register a function that can enhance prompts using AI
 * @param enhancer Function that takes input text and options, returns improved text
 * @returns Registration ID that can be used to clear this specific enhancer
 */
export function registerEnhancer(enhancer: EnhancerFunction): string {
  const registrationId = Math.random().toString(36).substring(2, 15);
  currentEnhancer = enhancer;
  enhancerRegistrationId = registrationId;
  return registrationId;
}

/**
 * Clear the registered enhancer
 * @param registrationId Optional ID to only clear if it matches the current registration
 */
export function clearEnhancer(registrationId?: string): void {
  if (!registrationId || registrationId === enhancerRegistrationId) {
    currentEnhancer = null;
    enhancerRegistrationId = null;
  }
}

/**
 * Enhance a prompt using the registered enhancer or fallback to saved settings
 * @param input Original prompt text
 * @param options Optional configuration for enhancement style
 * @returns Promise with improved text and metadata
 */
export async function enhancePrompt(input: string, options?: EnhancerOptions): Promise<EnhancerResult> {
  if (!input || input.trim().length === 0) {
    throw new Error('Cannot enhance empty prompt');
  }
  
  // Use registered enhancer if available
  if (currentEnhancer) {
    return currentEnhancer(input, options);
  }
  
  // Fallback: Try to use saved settings
  try {
    // This uses the existing utilities in ChatboxControls
    const { getApiKey } = await import('./utils/settings-utils');
    const { getAvailableModels } = await import('@/lib/openrouter');
    
    // Get first available model and its saved API key
    const models = getAvailableModels();
    if (!models.length) {
      throw new Error('No AI models available');
    }
    
    const model = models[0];
    const apiKey = getApiKey(model);
    
    if (!apiKey) {
      throw new Error('Please configure your API key in the Chatbox settings');
    }
    
    // Create a one-time enhancer with the saved settings
    return enhancePromptWithOpenRouter(input, apiKey, model, options);
  } catch (error) {
    throw new Error(
      'No prompt enhancer is registered. Please open the Chatbox to configure API settings.'
    );
  }
}

/**
 * Implementation of prompt enhancement using OpenRouter
 */
async function enhancePromptWithOpenRouter(
  input: string,
  apiKey: string,
  model: string,
  options?: EnhancerOptions
): Promise<EnhancerResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
  
  try {
    // Build system prompt for enhancement
    const systemPrompt = `You are an expert at improving image generation prompts. 
    Your task is to enhance the given prompt to create more detailed, vivid, and effective image generation instructions.
    ${options?.tone ? `Use a ${options.tone} tone.` : ''}
    ${options?.detail === 'concise' ? 'Be concise and focused.' : 
      options?.detail === 'rich' ? 'Add rich, vivid details.' : 
      'Use a balanced amount of detail.'}
    ${options?.length === 'short' ? 'Keep the result brief.' : 
      options?.length === 'long' ? 'Create a comprehensive prompt.' : 
      'Use a moderate length.'}
    Respond ONLY with the improved prompt text. Do not include explanations or other text.`;
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Prompt Enhancer'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: input }
        ]
      }),
      signal: controller.signal
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `API error (${response.status}): ${errorData.error?.message || response.statusText}`
      );
    }
    
    const data = await response.json();
    const improved = data.choices?.[0]?.message?.content?.trim() || '';
    
    if (!improved) {
      throw new Error('Received empty response from AI');
    }
    
    // Normalize and enforce length limit
    const normalized = improved
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 1000);
    
    return {
      improved: normalized,
      meta: {
        model: data.model || model,
        tokens: data.usage?.total_tokens
      }
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * External configuration interface for when ChatboxControls is used outside of ChatboxProvider
 */
interface ExternalConfig {
  model?: string;
  apiKey?: string;
}

interface ChatboxControlsProps {
  className?: string;
  mode?: 'full' | 'configOnly';
  visibleTabs?: { api?: boolean; prompt?: boolean; storage?: boolean };
  onValidationChange?: (isValid: boolean) => void;
  
  // New props for external mode
  controlSource?: 'context' | 'external';
  externalConfig?: ExternalConfig;
  onExternalConfigChange?: (update: Partial<ExternalConfig>) => void;
  forceMode?: 'configOnly';
}

type TabType = 'analyze' | 'api' | 'prompt' | 'storage';

/**
 * Main ChatboxControls component that acts as a wrapper to render either the context-driven
 * or external mode version based on controlSource prop
 */
export const ChatboxControls: React.FC<ChatboxControlsProps> = (props) => {
  const { 
    className = '', 
    controlSource = 'context',
    externalConfig,
    onExternalConfigChange,
    forceMode,
    mode,
    visibleTabs,
    onValidationChange 
  } = props;
  
  // If controlSource is 'external', render the external version
  if (controlSource === 'external') {
    return (
      <ChatboxControlsExternalApi
        className={className}
        externalConfig={externalConfig}
        onExternalConfigChange={onExternalConfigChange}
        onValidationChange={onValidationChange}
      />
    );
  }
  
  // Otherwise render the context-driven version
  return (
    <ChatboxControlsContext
      className={className}
      mode={forceMode || mode}
      visibleTabs={visibleTabs}
      onValidationChange={onValidationChange}
    />
  );
};

/**
 * Original ChatboxControls implementation that uses ChatboxProvider context
 * This preserves all existing functionality
 */
const ChatboxControlsContext: React.FC<Omit<ChatboxControlsProps, 'controlSource' | 'externalConfig' | 'onExternalConfigChange' | 'forceMode'>> = ({ 
  className = '', 
  mode, 
  visibleTabs, 
  onValidationChange 
}) => {
  const { config, status, updateConfig, startAnalysis, profileData, useMockData, setProfileData } = useChatbox();
  const { saveApiKey, getApiKey } = useChatboxSettings();
  const enhancerIdRef = useRef<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabType>('analyze');
  const [showKey, setShowKey] = useState(false);
  const [validation, setValidation] = useState({ 
    status: 'idle' as 'idle' | 'valid' | 'invalid', 
    errors: {} as Record<string, string>,
    warnings: {} as Record<string, string>
  });
  const [showStoragePanel, setShowStoragePanel] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [isSystemPromptExpanded, setIsSystemPromptExpanded] = useState(false);
  const [touched, setTouched] = useState(false);

  const availableModels = useMemo(() => {
    const modelInfo = {
      'qwen/qwen3-coder:free': { label: 'Qwen3 Coder', tag: 'Free', description: 'Optimized for coding tasks' },
      'z-ai/glm-4.5-air:free': { label: 'GLM 4.5 Air', tag: 'Free', description: 'Lightweight analysis' },
      'moonshotai/kimi-k2:free': { label: 'Kimi K2', tag: 'Free', description: 'Advanced reasoning' },
      'deepseek/deepseek-chat-v3.1:free': { label: 'DeepSeek Chat v3.1', tag: 'Free', description: 'Advanced reasoning and coding' },
      'openai/gpt-oss-120b:free': { label: 'GPT-OSS 120B', tag: 'Free', description: 'Open source GPT model' },
      'mistralai/mistral-small-3.2-24b-instruct:free': { label: 'Mistral Small 3.2', tag: 'Free', description: 'Efficient small model' }
    };

    return getAvailableModels().map(model => ({
      value: model,
      ...modelInfo[model as keyof typeof modelInfo] || { label: model, tag: 'Model', description: 'AI analysis' }
    }));
  }, []);

  const validate = useCallback(() => {
    const modelValues = availableModels.map(m => m.value);
    const result = validateAnalysisConfig(config, modelValues);

    const apiKeyValidation = config.apiKey ? 
      { isValid: /^sk-or-v1-[a-f0-9]{32,}$/.test(config.apiKey) } : 
      { isValid: false };
    const isValid = apiKeyValidation.isValid && result.isValid;

    chatboxDebug.debug('chatbox:validation', 'Validation check', { 
      isValid, 
      errors: result.errors,
      apiKeyValid: apiKeyValidation.isValid,
      configValid: result.isValid 
    });

    setValidation({
      status: isValid ? 'valid' : 'invalid',
      errors: result.errors,
      warnings: result.warnings || {}
    });

    return isValid;
  }, [config, availableModels]);

  useEffect(() => {
    if (touched) validate();
  }, [touched, validate]);

  // Notify parent of validation changes
  useEffect(() => {
    if (onValidationChange) {
      const isValid = validation.status === 'valid';
      onValidationChange(isValid);
    }
  }, [validation.status, onValidationChange]);

  const handleApiKeyChange = useCallback((value: string) => {
    setTouched(true);
    const key = value.trim();
    updateConfig({ apiKey: key });
    if (config.model && /^sk-or-v1-[a-f0-9]{32,}$/.test(key)) saveApiKey(config.model, key);
  }, [config.model, updateConfig, saveApiKey]);

  const handleConfigUpdate = useCallback((configUpdate: Partial<AnalysisConfig>) => {
    setTouched(true);
    updateConfig(configUpdate);
  }, [updateConfig]);

  const handleApiKeyPaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').trim();
    handleApiKeyChange(pastedText);
  }, [handleApiKeyChange]);

  const handleModelChange = useCallback((model: string) => {
    setTouched(true);
    const savedKey = getApiKey(model);
    updateConfig({ model, apiKey: savedKey || config.apiKey || '' });
  }, [config.apiKey, updateConfig, getApiKey]);

  const selectedModel = availableModels.find(m => m.value === config.model);

  const currentProfileData = useMemo(() => {
    return useMockData ? getMockProfile() : profileData || null;
  }, [useMockData, profileData]);

  useEffect(() => {
    if (useMockData) {
      const mockData = getMockProfile();
      setProfileData(mockData);
    }
  }, [useMockData, setProfileData]);
  
  // Register enhancer when component mounts
  useEffect(() => {
    // Create an enhancer function that uses the current config
    const enhancer = async (input: string, options?: EnhancerOptions): Promise<EnhancerResult> => {
      if (!config.apiKey || !config.model) {
        throw new Error('Please configure API key and model in the Chatbox settings');
      }
      
      chatboxDebug.debug('chatbox:enhancer', 'Enhancing prompt', { 
        inputLength: input.length,
        model: config.model,
        options
      });
      
      try {
        const result = await enhancePromptWithOpenRouter(input, config.apiKey, config.model, options);
        chatboxDebug.success('chatbox:enhancer', 'Prompt enhanced successfully', { 
          resultLength: result.improved.length,
          meta: result.meta
        });
        return result;
      } catch (error) {
        chatboxDebug.error('chatbox:enhancer', 'Prompt enhancement failed', error);
        throw error;
      }
    };
    
    // Register this enhancer
    enhancerIdRef.current = registerEnhancer(enhancer);
    
    // Clean up on unmount
    return () => {
      if (enhancerIdRef.current) {
        clearEnhancer(enhancerIdRef.current);
        enhancerIdRef.current = null;
      }
    };
  }, [config.apiKey, config.model]);

  const handleStartAnalysis = useCallback(async () => {
    if (!validate()) {
      setTouched(true);
      chatboxDebug.warn('chatbox:analysis', 'Analysis blocked - validation failed');
      return;
    }

    chatboxDebug.info('chatbox:analysis', 'Starting analysis', { 
      hasProfileData: !!currentProfileData,
      useMockData,
      model: config.model
    });

    try {
      await saveApiKey(config.model, config.apiKey);
      if (validation.status === 'valid' && currentProfileData) {
        chatboxDebug.debug('chatbox:analysis', 'Starting analysis with profile data', currentProfileData);
        await startAnalysis();
        chatboxDebug.success('chatbox:analysis', 'Analysis started successfully');
      } else {
        chatboxDebug.error('chatbox:analysis', 'Cannot start analysis', {
          validationStatus: validation.status,
          hasProfileData: !!currentProfileData,
          errors: validation.errors
        });
      }
    } catch (error) {
      chatboxDebug.error('chatbox:analysis', 'Analysis failed', error);
      console.error('Analysis failed:', error);
    }
  }, [validation.status, validation.errors, currentProfileData, startAnalysis, validate, config, useMockData]);

  const canAnalyze = validation.status === 'valid' && currentProfileData && status !== 'analyzing';

  const allTabs = [
    { id: 'analyze' as TabType, label: 'Analyze', icon: CommandLineIcon },
    { id: 'api' as TabType, label: 'API', icon: KeyIcon },
    { id: 'prompt' as TabType, label: 'Prompt', icon: DocumentTextIcon },
    { id: 'storage' as TabType, label: 'Storage', icon: WrenchScrewdriverIcon }
  ];

  // Filter tabs based on mode and visibleTabs
  const tabs = useMemo(() => {
    if (mode === 'configOnly') {
      return allTabs.filter(tab => {
        if (tab.id === 'api') return visibleTabs?.api !== false;
        if (tab.id === 'prompt') return visibleTabs?.prompt === true;
        if (tab.id === 'storage') return visibleTabs?.storage === true;
        return false; // Hide analyze tab in configOnly mode
      });
    }
    return allTabs;
  }, [mode, visibleTabs]);

  // Set initial tab based on available tabs
  useEffect(() => {
    if (tabs.length > 0 && !tabs.find(tab => tab.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analyze':
        return (
          <div className="space-y-3">
            {/* Analysis Status */}
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  validation.status === 'valid' ? 'bg-green-500' : 
                  validation.status === 'invalid' ? 'bg-red-500' : 'bg-gray-400'
                }`} />
                <span className="text-xs text-gray-600">
                  {validation.status === 'valid' ? 'Ready' : 
                   validation.status === 'invalid' ? 'Configuration needed' : 'Checking...'}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Profile: {currentProfileData ? '✓' : '✗'} {useMockData ? '(mock)' : ''}
              </div>
            </div>

            {/* Profile Readiness Hint */}
            {currentProfileData && (() => {
              try {
                // Use the new transformation utility for UserProfileData
                const profileStatus = getAnalysisStatus(currentProfileData);
                if (!profileStatus.ready && profileStatus.missing.length > 0) {
                  return (
                    <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="text-xs text-yellow-800">
                        Profile incomplete: {profileStatus.missing.join(', ')}
                      </div>
                      <div className="text-xs text-yellow-600 mt-1">
                        {profileStatus.completionLevel}% complete
                      </div>
                    </div>
                  );
                }
              } catch (error) {
                // Silently handle transformation errors
                return null;
              }
              return null;
            })()}

            {/* Analyze Button */}
            <button
              onClick={handleStartAnalysis}
              disabled={!canAnalyze}
              className={`w-full flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${canAnalyze
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
              {status === 'analyzing' ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <PlayIcon className="w-4 h-4 mr-2" />
                  Start Analysis
                </>
              )}
            </button>

            {/* Custom Prompt Indicator */}
            {config.customPrompt && (
              <div className="flex items-center justify-center">
                <div className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                  Using Custom Prompt
                </div>
              </div>
            )}

            {/* Debug Info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                <div>Validation: {validation.status}</div>
                <div>Profile: {currentProfileData ? '✓' : '✗'} {useMockData ? '(mock)' : '(real)'}</div>
                <div>Status: {status}</div>
                <div>Can Analyze: {canAnalyze ? '✓' : '✗'}</div>
              </div>
            )}
          </div>
        );

      case 'api':
        return (
          <div className="space-y-3">
            {/* Model Selection */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                <span>AI Model</span>
                <span className="text-red-500 text-xs">Required</span>
              </label>
              <div className="relative">
                <select
                  value={config.model || ''}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className={`w-full px-3 py-2 pr-8 text-sm border rounded-lg transition-all duration-200 ${validation.errors.model && touched
                    ? 'border-red-300 bg-red-50/50 focus:ring-2 focus:ring-red-500'
                    : 'border-gray-200 hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                >
                  <option value="" disabled>Choose model...</option>
                  {availableModels.map(model => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </select>
                <CogIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              {selectedModel && (
                <p className="mt-1 text-xs text-gray-500">{selectedModel.description}</p>
              )}
              {validation.errors.model && touched && (
                <p className="mt-1 text-xs text-red-600">{validation.errors.model}</p>
              )}
            </div>

            {/* API Key Input */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                <span>API Key</span>
                <span className="text-red-500 text-xs">Required</span>
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={config.apiKey || ''}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  onPaste={(e) => handleApiKeyPaste(e)}
                  placeholder="sk-or-..."
                  className={`w-full px-3 py-2 pr-12 text-sm font-mono border rounded-lg transition-all duration-200 ${validation.status === 'valid'
                    ? 'border-green-300 bg-green-50/30 focus:ring-2 focus:ring-green-500'
                    : validation.status === 'invalid' && touched
                      ? 'border-red-300 bg-red-50/30 focus:ring-2 focus:ring-red-500'
                      : 'border-gray-200 hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                  {validation.status === 'valid' && (
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {validation.status === 'invalid' && touched && (
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showKey ? 'Hide' : 'Show'}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d={showKey ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z" : "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243"} />
                    </svg>
                  </button>
                </div>
              </div>
              {validation.errors.apiKey && touched && (
                <p className="mt-1 text-xs text-red-600">{validation.errors.apiKey}</p>
              )}
            </div>
          </div>
        );

      case 'prompt':
        return (
          <div className="space-y-3">
            <SystemPromptSection
              config={config}
              onConfigUpdate={handleConfigUpdate}
              isExpanded={isSystemPromptExpanded}
              onToggleExpanded={() => setIsSystemPromptExpanded(!isSystemPromptExpanded)}
            />
          </div>
        );

      case 'storage':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowStoragePanel(true)}
                className="flex items-center justify-center px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <CircleStackIcon className="w-4 h-4 mr-2" />
                Storage
              </button>
              <button
                onClick={() => setShowHistoryPanel(true)}
                className="flex items-center justify-center px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ClockIcon className="w-4 h-4 mr-2" />
                History
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-3 h-3 mr-1" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-3">
        {renderTabContent()}
      </div>

      {/* Modals */}
      {showStoragePanel && (
        <StorageManagementPanel isVisible={showStoragePanel} onClose={() => setShowStoragePanel(false)} />
      )}
      {showHistoryPanel && (
        <AnalysisHistory isVisible={showHistoryPanel} onClose={() => setShowHistoryPanel(false)} />
      )}
    </div>
  );
};

/**
 * External API-only version of ChatboxControls that doesn't depend on ChatboxProvider
 * Used when controlSource='external' is specified
 */
const ChatboxControlsExternalApi: React.FC<{
  className?: string;
  externalConfig?: ExternalConfig;
  onExternalConfigChange?: (update: Partial<ExternalConfig>) => void;
  onValidationChange?: (isValid: boolean) => void;
}> = ({ 
  className = '', 
  externalConfig = { model: '', apiKey: '' },
  onExternalConfigChange,
  onValidationChange 
}) => {
  const { saveApiKey, getApiKey } = useChatboxSettings();
  const enhancerIdRef = useRef<string | null>(null);
  
  const [showKey, setShowKey] = useState(false);
  const [touched, setTouched] = useState(false);
  const [validation, setValidation] = useState({ 
    status: 'idle' as 'idle' | 'valid' | 'invalid', 
    errors: {} as Record<string, string>
  });

  const availableModels = useMemo(() => {
    const modelInfo = {
      'qwen/qwen3-coder:free': { label: 'Qwen3 Coder', tag: 'Free', description: 'Optimized for coding tasks' },
      'z-ai/glm-4.5-air:free': { label: 'GLM 4.5 Air', tag: 'Free', description: 'Lightweight analysis' },
      'moonshotai/kimi-k2:free': { label: 'Kimi K2', tag: 'Free', description: 'Advanced reasoning' },
      'deepseek/deepseek-chat-v3.1:free': { label: 'DeepSeek Chat v3.1', tag: 'Free', description: 'Advanced reasoning and coding' },
      'openai/gpt-oss-120b:free': { label: 'GPT-OSS 120B', tag: 'Free', description: 'Open source GPT model' },
      'mistralai/mistral-small-3.2-24b-instruct:free': { label: 'Mistral Small 3.2', tag: 'Free', description: 'Efficient small model' }
    };

    return getAvailableModels().map(model => ({
      value: model,
      ...modelInfo[model as keyof typeof modelInfo] || { label: model, tag: 'Model', description: 'AI analysis' }
    }));
  }, []);

  const validate = useCallback(() => {
    const modelValues = availableModels.map(m => m.value);
    const errors: Record<string, string> = {};
    
    // Validate model
    if (!externalConfig.model) {
      errors.model = 'Model is required';
    } else if (!modelValues.includes(externalConfig.model)) {
      errors.model = 'Invalid model selected';
    }
    
    // Validate API key
    const apiKeyValidation = externalConfig.apiKey ? 
      { isValid: /^sk-or-v1-[a-f0-9]{32,}$/.test(externalConfig.apiKey) } : 
      { isValid: false };
      
    if (!externalConfig.apiKey) {
      errors.apiKey = 'API key is required';
    } else if (!apiKeyValidation.isValid) {
      errors.apiKey = 'Invalid API key format';
    }
    
    const isValid = Object.keys(errors).length === 0;
    
    setValidation({
      status: isValid ? 'valid' : 'invalid',
      errors
    });
    
    return isValid;
  }, [externalConfig, availableModels]);

  useEffect(() => {
    if (touched) validate();
  }, [touched, validate]);

  // Notify parent of validation changes
  useEffect(() => {
    if (onValidationChange) {
      const isValid = validation.status === 'valid';
      onValidationChange(isValid);
    }
  }, [validation.status, onValidationChange]);

  const handleApiKeyChange = useCallback((value: string) => {
    setTouched(true);
    const key = value.trim();
    
    if (onExternalConfigChange) {
      onExternalConfigChange({ apiKey: key });
    }
    
    if (externalConfig.model && /^sk-or-v1-[a-f0-9]{32,}$/.test(key)) {
      saveApiKey(externalConfig.model, key);
    }
  }, [externalConfig.model, onExternalConfigChange, saveApiKey]);

  const handleApiKeyPaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').trim();
    handleApiKeyChange(pastedText);
  }, [handleApiKeyChange]);

  const handleModelChange = useCallback((model: string) => {
    setTouched(true);
    const savedKey = getApiKey(model);
    
    if (onExternalConfigChange) {
      onExternalConfigChange({ 
        model, 
        apiKey: savedKey || externalConfig.apiKey || '' 
      });
    }
  }, [externalConfig.apiKey, onExternalConfigChange, getApiKey]);

  const selectedModel = availableModels.find(m => m.value === externalConfig.model);
  
  // Register enhancer when component mounts
  useEffect(() => {
    // Create an enhancer function that uses the external config
    const enhancer = async (input: string, options?: EnhancerOptions): Promise<EnhancerResult> => {
      if (!externalConfig.apiKey || !externalConfig.model) {
        throw new Error('Please configure API key and model in the settings');
      }
      
      try {
        return await enhancePromptWithOpenRouter(
          input, 
          externalConfig.apiKey, 
          externalConfig.model, 
          options
        );
      } catch (error) {
        console.error('Prompt enhancement failed:', error);
        throw error;
      }
    };
    
    // Register this enhancer
    enhancerIdRef.current = registerEnhancer(enhancer);
    
    // Clean up on unmount
    return () => {
      if (enhancerIdRef.current) {
        clearEnhancer(enhancerIdRef.current);
        enhancerIdRef.current = null;
      }
    };
  }, [externalConfig.apiKey, externalConfig.model]);

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Tab Navigation - Only API tab */}
      <div className="flex border-b border-gray-200">
        <div className="flex-1 flex items-center justify-center px-3 py-2 text-xs font-medium text-blue-600 border-b-2 border-blue-600 bg-blue-50/50">
          <KeyIcon className="w-3 h-3 mr-1" />
          API
        </div>
      </div>

      {/* API Tab Content */}
      <div className="p-3">
        <div className="space-y-3">
          {/* Model Selection */}
          <div>
            <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
              <span>AI Model</span>
              <span className="text-red-500 text-xs">Required</span>
            </label>
            <div className="relative">
              <select
                value={externalConfig.model || ''}
                onChange={(e) => handleModelChange(e.target.value)}
                className={`w-full px-3 py-2 pr-8 text-sm border rounded-lg transition-all duration-200 ${validation.errors.model && touched
                  ? 'border-red-300 bg-red-50/50 focus:ring-2 focus:ring-red-500'
                  : 'border-gray-200 hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  }`}
              >
                <option value="" disabled>Choose model...</option>
                {availableModels.map(model => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
              <CogIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            {selectedModel && (
              <p className="mt-1 text-xs text-gray-500">{selectedModel.description}</p>
            )}
            {validation.errors.model && touched && (
              <p className="mt-1 text-xs text-red-600">{validation.errors.model}</p>
            )}
          </div>

          {/* API Key Input */}
          <div>
            <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
              <span>API Key</span>
              <span className="text-red-500 text-xs">Required</span>
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={externalConfig.apiKey || ''}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                onPaste={(e) => handleApiKeyPaste(e)}
                placeholder="sk-or-..."
                className={`w-full px-3 py-2 pr-12 text-sm font-mono border rounded-lg transition-all duration-200 ${validation.status === 'valid'
                  ? 'border-green-300 bg-green-50/30 focus:ring-2 focus:ring-green-500'
                  : validation.status === 'invalid' && touched
                    ? 'border-red-300 bg-red-50/30 focus:ring-2 focus:ring-red-500'
                    : 'border-gray-200 hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                {validation.status === 'valid' && (
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {validation.status === 'invalid' && touched && (
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showKey ? 'Hide' : 'Show'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d={showKey ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z" : "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243"} />
                  </svg>
                </button>
              </div>
            </div>
            {validation.errors.apiKey && touched && (
              <p className="mt-1 text-xs text-red-600">{validation.errors.apiKey}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatboxControls;