'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useChatbox } from './ChatboxProvider';
import { getAvailableModels } from '@/lib/openrouter';
import { useChatboxSettings } from './utils/settings-utils';
import { validateApiKey, validateAnalysisConfig } from './utils/validation-utils';
import { PlayIcon, CogIcon, CircleStackIcon, ClockIcon } from '@heroicons/react/24/outline';
import { StorageManagementPanel } from './StorageManagementPanel';
import { AnalysisHistory } from './AnalysisHistory';

interface ChatboxControlsProps {
  className?: string;
}

export const ChatboxControls: React.FC<ChatboxControlsProps> = ({ className = '' }) => {
  const { config, status, updateConfig, startAnalysis, profileData } = useChatbox();
  const { saveApiKey, getApiKey } = useChatboxSettings();

  const [showKey, setShowKey] = useState(false);
  const [validation, setValidation] = useState({ status: 'idle' as 'idle' | 'valid' | 'invalid', errors: {} as Record<string, string> });
  const [showStoragePanel, setShowStoragePanel] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
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
    
    const apiKeyValidation = config.apiKey ? validateApiKey(config.apiKey) : { isValid: false };
    setValidation({
      status: (apiKeyValidation.isValid && result.isValid ? 'valid' : 
              config.apiKey ? 'invalid' : 'idle') as 'idle' | 'valid' | 'invalid',
      errors: result.errors
    });
  }, [config, availableModels]);

  useEffect(() => {
    if (touched) validate();
  }, [touched, validate]);

  const handleApiKeyChange = useCallback((value: string) => {
    setTouched(true);
    const key = value.trim();
    updateConfig({ apiKey: key });
    if (config.model && validateApiKey(key).isValid) saveApiKey(config.model, key);
  }, [config.model, updateConfig, saveApiKey]);

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

  const handleAnalyze = useCallback(async () => {
    setTouched(true);
    validate();
    if (validation.status === 'valid' && profileData) {
      await startAnalysis();
    }
  }, [validation.status, profileData, startAnalysis, validate]);

  const selectedModel = availableModels.find(m => m.value === config.model);
  const canAnalyze = validation.status === 'valid' && profileData && status !== 'analyzing';

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Compact Model Selection */}
      <div>
        <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1.5">
          <span>AI Model</span>
          <span className="text-red-500 text-xs">Required</span>
        </label>
        <div className="relative">
          <select
            value={config.model || ''}
            onChange={(e) => handleModelChange(e.target.value)}
            className={`w-full px-3 py-2 pr-8 text-sm border rounded-lg transition-all duration-200 ${
              validation.errors.model && touched
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
          <CogIcon className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
        
        {selectedModel && (
          <p className="mt-1 text-xs text-gray-500 leading-tight">{selectedModel.description}</p>
        )}
        {validation.errors.model && touched && (
          <p className="mt-1 text-xs text-red-600">{validation.errors.model}</p>
        )}
      </div>

      {/* Compact API Key Input */}
      <div>
        <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1.5">
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
            className={`w-full px-3 py-2 pr-12 text-sm font-mono border rounded-lg transition-all duration-200 ${
              validation.status === 'valid'
                ? 'border-green-300 bg-green-50/30 focus:ring-2 focus:ring-green-500'
                : validation.status === 'invalid' && touched
                ? 'border-red-300 bg-red-50/30 focus:ring-2 focus:ring-red-500'
                : 'border-gray-200 hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            }`}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
            {validation.status === 'valid' && (
              <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {validation.status === 'invalid' && touched && (
              <svg className="w-3.5 h-3.5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showKey ? 'Hide' : 'Show'}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Compact Action Bar */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            canAnalyze
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] shadow-sm'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {status === 'analyzing' ? (
            <>
              <svg className="animate-spin -ml-1 mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing...
            </>
          ) : (
            <>
              <PlayIcon className="w-3.5 h-3.5 mr-1.5" />
              Analyze
            </>
          )}
        </button>

        <div className="flex space-x-1">
          <button
            onClick={() => setShowStoragePanel(true)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Storage"
          >
            <CircleStackIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowHistoryPanel(true)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="History"
          >
            <ClockIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!profileData && (
        <div className="text-center text-sm text-gray-500 py-2">
          Complete your profile to enable analysis
        </div>
      )}

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