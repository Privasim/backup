'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './MobileSettingsPanel.module.css';
import { usePromptStore } from '@/store/usePromptStore';
import { getAvailableModels } from '@/lib/openrouter/client';

interface MobileSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'api' | 'model' | 'prompt';

const MobileSettingsPanel: React.FC<MobileSettingsPanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('api');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [selectedModel, setSelectedModel] = useState('');
  const { systemPrompt, setSystemPrompt, resetPrompt, getDefaultPrompt } = usePromptStore();
  const [models, setModels] = useState<Array<{id: string, name: string, description?: string}>>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);

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

  // Load from localStorage on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openrouter-api-key') || '';
    const savedModel = localStorage.getItem('openrouter-selected-model') || '';
    
    setApiKey(savedApiKey);
    setSelectedModel(savedModel);
    
    if (savedApiKey) {
      validateApiKey(savedApiKey);
    }
    
    if (savedApiKey && savedModel) {
      loadModels(savedApiKey);
    }
  }, []);

  // Validate API key on change
  useEffect(() => {
    if (apiKey) {
      validateApiKey(apiKey);
    } else {
      setValidationStatus('idle');
    }
  }, [apiKey]);

  const validateApiKey = useCallback((key: string) => {
    return /^sk-or-v1-[a-f0-9]{32,}$/.test(key);
  }, []);

  const loadModels = useCallback((apiKey: string) => {
    setLoadingModels(true);
    setModelsError(null);
    // Implement API call to load models
    // For now, just set some dummy data
    setModels([
      { id: 'model1', name: 'Model 1' },
      { id: 'model2', name: 'Model 2' },
    ]);
    setLoadingModels(false);
  }, []);

  const handleApiKeyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const key = e.target.value.trim();
    setApiKey(key);
    localStorage.setItem('openrouter-api-key', key);
  }, []);

  const handleApiKeyPaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').trim();
    setApiKey(pastedText);
    localStorage.setItem('openrouter-api-key', pastedText);
  }, []);

  const handleModelChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const model = e.target.value;
    setSelectedModel(model);
    localStorage.setItem('openrouter-selected-model', model);
  }, []);

  const handlePromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSystemPrompt(e.target.value);
  }, []);

  const handleResetPrompt = useCallback(() => {
    resetPrompt();
  }, []);

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
                  type="text"
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
                  {validationStatus === 'valid' ? (
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : validationStatus === 'invalid' && apiKey ? (
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  ) : null}
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
                  onClick={handleResetPrompt}
                  className={`text-xs text-blue-600 hover:text-blue-800 transition-colors ${styles['hover\:no-underline']}`}
                >
                  Reset to default
                </button>
              </div>
              <textarea
                value={systemPrompt}
                onChange={handlePromptChange}
                className={`w-full px-3 py-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  styles['border-gray-300']
                }`}
                rows={4}
                placeholder="Enter system prompt..."
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
