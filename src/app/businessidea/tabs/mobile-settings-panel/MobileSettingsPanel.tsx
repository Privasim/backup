'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './MobileSettingsPanel.module.css';
import { getAvailableModels } from '@/lib/openrouter/client';

interface MobileSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'api' | 'model' | 'prompt';

const MobileSettingsPanel: React.FC<MobileSettingsPanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('api');
  const [apiKey, setApiKey] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [showKey, setShowKey] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
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

  // Load saved settings
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openrouter_api_key') || '';
    const savedModel = localStorage.getItem('openrouter_model') || '';
    const savedPrompt = localStorage.getItem('openrouter_system_prompt') || 'You are a helpful assistant';
    
    setApiKey(savedApiKey);
    setSelectedModel(savedModel);
    setSystemPrompt(savedPrompt);
    
    if (savedApiKey) {
      setValidationStatus(isValidFormat(savedApiKey) ? 'valid' : 'invalid');
    }
  }, []);

  // API key format validation
  const isValidFormat = useCallback((key: string) => {
    return /^sk-or-v1-[a-f0-9]{32,}$/.test(key);
  }, []);

  // Validate API key on change
  useEffect(() => {
    if (apiKey) {
      setValidationStatus(isValidFormat(apiKey) ? 'valid' : 'invalid');
    } else {
      setValidationStatus('idle');
    }
  }, [apiKey, isValidFormat]);

  const handleApiKeyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const key = e.target.value.trim();
    setApiKey(key);
    localStorage.setItem('openrouter_api_key', key);
    setTouched(true);
  }, []);

  const handleApiKeyPaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').trim();
    setApiKey(pastedText);
    localStorage.setItem('openrouter_api_key', pastedText);
    setTouched(true);
  }, []);

  const handleModelChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const model = e.target.value;
    setSelectedModel(model);
    localStorage.setItem('openrouter_model', model);
  }, []);

  const handleSystemPromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const prompt = e.target.value;
    setSystemPrompt(prompt);
    localStorage.setItem('openrouter_system_prompt', prompt);
  }, []);

  const resetSystemPrompt = useCallback(() => {
    const defaultPrompt = 'You are a helpful assistant';
    setSystemPrompt(defaultPrompt);
    localStorage.setItem('openrouter_system_prompt', defaultPrompt);
  }, []);

  const getValidationIcon = () => {
    if (validationStatus === 'valid') {
      return (
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    }
    if (validationStatus === 'invalid' && apiKey) {
      return (
        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
    }
    return null;
  };

  const tabs = [
    { id: 'api' as SettingsTab, label: 'API Key', icon: '🔑' },
    { id: 'model' as SettingsTab, label: 'Model', icon: '🤖' },
    { id: 'prompt' as SettingsTab, label: 'Prompt', icon: '💬' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'api':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                OpenRouter API Key
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={handleApiKeyChange}
                  onPaste={handleApiKeyPaste}
                  placeholder="sk-or-v1-..."
                  className={`w-full px-3 py-2 border rounded-md pr-12 font-mono text-sm ${
                    validationStatus === 'valid' ? 'border-green-500' : 
                    validationStatus === 'invalid' && apiKey ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
                  {getValidationIcon()}
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    aria-label={showKey ? 'Hide API key' : 'Show API key'}
                  >
                    {showKey ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              {validationStatus === 'invalid' && apiKey && (
                <p className="mt-1 text-xs text-red-600">Invalid API key format</p>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Secure & Private</p>
                  <p>Your API key is stored locally in your browser. Get your free key from{' '}
                    <a 
                      href="https://openrouter.ai/keys" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="font-medium text-amber-700 underline hover:no-underline"
                    >
                      OpenRouter
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'model':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                AI Model Selection
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                value={selectedModel}
                onChange={handleModelChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="" disabled>Select an AI model</option>
                {availableModels.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label} {model.tag && `(${model.tag})`}
                  </option>
                ))}
              </select>
              {selectedModel && (
                <p className="mt-1 text-xs text-gray-600">
                  {availableModels.find(m => m.value === selectedModel)?.description}
                </p>
              )}
            </div>
          </div>
        );

      case 'prompt':
        return (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">
                  System Prompt
                </label>
                <button
                  type="button"
                  onClick={resetSystemPrompt}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Reset to Default
                </button>
              </div>
              <textarea
                value={systemPrompt}
                onChange={handleSystemPromptChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
                placeholder="Define the AI's behavior and instructions..."
              />
              <p className="mt-1 text-xs text-gray-500">
                This prompt guides how the AI responds to your queries.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.panelBackdrop} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.panelHeader}>
          <h2>AI Settings</h2>
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>
        
        {/* Tab Navigation */}
        <div className={styles.tabNavigation}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default MobileSettingsPanel;
