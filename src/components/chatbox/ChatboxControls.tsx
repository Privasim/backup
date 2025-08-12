'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { profileIntegrationService } from './services/ProfileIntegrationService';
import { getAnalysisStatus } from './utils/profile-transformation';

interface ChatboxControlsProps {
  className?: string;
}

type TabType = 'analyze' | 'api' | 'prompt' | 'storage';

export const ChatboxControls: React.FC<ChatboxControlsProps> = ({ className = '' }) => {
  const { config, status, updateConfig, startAnalysis, profileData, useMockData, setProfileData } = useChatbox();
  const { saveApiKey, getApiKey } = useChatboxSettings();

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
      'moonshotai/kimi-k2:free': { label: 'Kimi K2', tag: 'Free', description: 'Advanced reasoning' }
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

  const tabs = [
    { id: 'analyze' as TabType, label: 'Analyze', icon: CommandLineIcon },
    { id: 'api' as TabType, label: 'API', icon: KeyIcon },
    { id: 'prompt' as TabType, label: 'Prompt', icon: DocumentTextIcon },
    { id: 'storage' as TabType, label: 'Storage', icon: WrenchScrewdriverIcon }
  ];

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

export default ChatboxControls;