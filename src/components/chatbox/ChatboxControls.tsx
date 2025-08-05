'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  const {
    config,
    status,
    updateConfig,
    startAnalysis,
    profileData
  } = useChatbox();
  
  const { saveApiKey, getApiKey } = useChatboxSettings();

  const [showKey, setShowKey] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [touched, setTouched] = useState(false);
  const [errors, setErrors] = useState<{ apiKey?: string; model?: string }>({});
  const [showStoragePanel, setShowStoragePanel] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  const availableModels = useMemo(() => {
    return getAvailableModels().map(model => {
      const modelInfo = {
        'qwen/qwen3-coder:free': { label: 'Qwen3 Coder (Free)', description: 'Optimized for coding and analysis tasks' },
        'z-ai/glm-4.5-air:free': { label: 'GLM 4.5 Air (Free)', description: 'Lightweight for conversational analysis' },
        'moonshotai/kimi-k2:free': { label: 'Kimi K2 (Free)', description: 'Advanced reasoning & synthesis' }
      };
      
      return {
        value: model,
        ...modelInfo[model as keyof typeof modelInfo] || { label: model, description: 'AI model for analysis' }
      };
    });
  }, []);

  // Validate configuration on change
  useEffect(() => {
    if (touched) {
      const availableModelValues = availableModels.map((m: { value: string }) => m.value);
      const validation = validateAnalysisConfig(config, availableModelValues);
      setErrors(validation.errors);
      
      // Update API key validation status
      if (config.apiKey) {
        const apiKeyValidation = validateApiKey(config.apiKey);
        setValidationStatus(apiKeyValidation.isValid ? 'valid' : 'invalid');
      } else {
        setValidationStatus('idle');
      }
    }
  }, [config, touched, availableModels]);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTouched(true);
    const newApiKey = e.target.value.trim();
    updateConfig({ apiKey: newApiKey });
    
    // Save API key for current model if valid
    if (config.model && validateApiKey(newApiKey).isValid) {
      saveApiKey(config.model, newApiKey);
    }
  };

  const handleApiKeyPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').trim();
    setTouched(true);
    updateConfig({ apiKey: pastedText });
    
    // Save API key for current model if valid
    if (config.model && validateApiKey(pastedText).isValid) {
      saveApiKey(config.model, pastedText);
    }
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTouched(true);
    const newModel = e.target.value;
    
    // Load saved API key for this model
    const savedApiKey = getApiKey(newModel);
    
    updateConfig({ 
      model: newModel,
      apiKey: savedApiKey || config.apiKey || ''
    });
  };

  const handleAnalyze = async () => {
    setTouched(true);
    
    if (!profileData) {
      // This shouldn't happen in normal flow, but good to check
      return;
    }
    
    // Validate configuration
    const availableModelValues = availableModels.map((m: { value: string }) => m.value);
    const validation = validateAnalysisConfig(config, availableModelValues);
    setErrors(validation.errors);
    
    if (validation.isValid) {
      await startAnalysis();
    }
  };

  const getValidationIcon = () => {
    if (validationStatus === 'valid') {
      return (
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    }
    if (validationStatus === 'invalid' && config.apiKey) {
      return (
        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
    }
    return null;
  };

  const canAnalyze = config.apiKey && config.model && validationStatus === 'valid' && profileData && status !== 'analyzing';
  const selectedModel = availableModels.find(m => m.value === config.model);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Model Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          AI Model
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="relative">
          <select
            value={config.model || ''}
            onChange={handleModelChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.model && touched ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="" disabled>Select an AI model</option>
            {availableModels.map((modelOption: { value: string; label: string }) => (
              <option key={modelOption.value} value={modelOption.value}>
                {modelOption.label}
              </option>
            ))}
          </select>
          <CogIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>
        
        {errors.model && touched && (
          <div className="mt-1 flex items-center text-sm text-red-600">
            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.model}
          </div>
        )}
        
        {selectedModel && (
          <div className="mt-1 text-sm text-gray-600">
            {selectedModel.description}
          </div>
        )}
      </div>

      {/* API Key Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          OpenRouter API Key
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={config.apiKey || ''}
            onChange={handleApiKeyChange}
            onPaste={handleApiKeyPaste}
            placeholder="sk-or-v1-..."
            className={`w-full px-3 py-2 pr-20 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.apiKey && touched
                ? 'border-red-300 bg-red-50'
                : validationStatus === 'valid'
                ? 'border-green-300 bg-green-50'
                : 'border-gray-300'
            }`}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
            {getValidationIcon()}
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded"
              tabIndex={-1}
            >
              {showKey ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {errors.apiKey && touched && (
          <div className="mt-1 flex items-center text-sm text-red-600">
            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.apiKey}
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <div className="flex items-start">
          <div className="w-5 h-5 rounded-full bg-amber-600 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">Secure & Private</p>
            <p>Your API key is stored locally and used only for analysis. Get your free key from{' '}
              <a 
                href="https://openrouter.ai/keys" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-medium underline hover:no-underline"
              >
                OpenRouter
              </a>.
            </p>
          </div>
        </div>
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={!canAnalyze}
        className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all ${
          canAnalyze
            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {status === 'analyzing' ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing...
          </>
        ) : (
          <>
            <PlayIcon className="w-4 h-4 mr-2" />
            Analyze Profile
          </>
        )}
      </button>

      {!profileData && (
        <div className="text-center text-sm text-gray-500 py-2">
          Complete your profile to enable analysis
        </div>
      )}

      {/* Additional Actions */}
      <div className="pt-2 border-t border-gray-200 space-y-2">
        <button
          onClick={() => setShowHistoryPanel(true)}
          className="w-full flex items-center justify-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <ClockIcon className="w-4 h-4 mr-2" />
          Analysis History
        </button>
        
        <button
          onClick={() => setShowStoragePanel(true)}
          className="w-full flex items-center justify-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <CircleStackIcon className="w-4 h-4 mr-2" />
          Manage Storage
        </button>
      </div>

      {/* Analysis History Panel */}
      <AnalysisHistory
        isVisible={showHistoryPanel}
        onClose={() => setShowHistoryPanel(false)}
      />

      {/* Storage Management Panel */}
      <StorageManagementPanel
        isVisible={showStoragePanel}
        onClose={() => setShowStoragePanel(false)}
      />
    </div>
  );
};

export default ChatboxControls;