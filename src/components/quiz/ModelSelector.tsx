'use client';

import { useState, useEffect, useRef } from 'react';
import { getAvailableModels, type ModelInfo } from '@/lib/openrouter';

interface ModelSelectorProps {
  value: string;
  onChange: (modelId: string) => void;
  error?: string;
  touched?: boolean;
  webSearchEnabled?: boolean;
  onWebSearchToggle?: (enabled: boolean) => void;
}

export default function ModelSelector({ 
  value, 
  onChange, 
  error, 
  touched, 
  webSearchEnabled = true, 
  onWebSearchToggle 
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const models = getAvailableModels();
  
  const selectedModel = models.find(model => model.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const perplexityModels = models.filter(model => model.provider === 'Perplexity');
  const freeModels = models.filter(model => model.isFree);

  const handleSelect = (modelId: string) => {
    onChange(modelId);
    setIsOpen(false);
  };

  const getModelIcon = (model: ModelInfo) => {
    if (model.supportsWebSearch) return '🔍';
    if (model.isFree) return '🆓';
    return '🤖';
  };

  const hasError = touched && error;

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs font-semibold text-gray-900 mb-2">
        AI Model Selection
        <span className="text-red-500 ml-1">*</span>
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-3 py-2.5 text-left bg-white border-2 rounded-lg transition-all duration-200 text-sm ${
            hasError
              ? 'border-red-500 ring-2 ring-red-100'
              : isOpen 
                ? 'border-blue-500 ring-2 ring-blue-100' 
                : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
          } focus:outline-none`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{selectedModel ? getModelIcon(selectedModel) : '🤖'}</span>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900">
                  {selectedModel?.name || 'Select a model'}
                </div>
                {selectedModel && (
                  <div className="text-xs text-gray-500 truncate">
                    {selectedModel.provider} • {selectedModel.isFree ? 'Free Model' : 'Paid Model'} • {webSearchEnabled ? 'Web Search ON' : 'Web Search OFF'}
                  </div>
                )}
              </div>
            </div>
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} text-gray-400`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
            {/* Perplexity Models Section */}
            <div className="p-2 border-b border-gray-100">
              <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-blue-50 rounded">
                🔍 Perplexity Models (Optimized for Web Search)
              </div>
            </div>
            {perplexityModels.map((model) => (
              <button
                key={model.id}
                type="button"
                onClick={() => handleSelect(model.id)}
                className={`w-full px-3 py-3 text-left transition-colors hover:bg-blue-50 ${
                  value === model.id ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getModelIcon(model)}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{model.name}</div>
                      <div className="text-xs text-gray-500">{model.description}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {model.provider} • {model.contextLength.toLocaleString()} tokens
                      </div>
                    </div>
                  </div>
                  {value === model.id && (
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            ))}

            {/* Free Models Section */}
            <div className="p-2 border-b border-gray-100">
              <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-green-50 rounded">
                🆓 Free Models (Web Search Available)
              </div>
            </div>
            {freeModels.map((model) => (
              <button
                key={model.id}
                type="button"
                onClick={() => handleSelect(model.id)}
                className={`w-full px-3 py-3 text-left transition-colors hover:bg-green-50 ${
                  value === model.id ? 'bg-green-50 text-green-700' : 'text-gray-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getModelIcon(model)}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{model.name}</div>
                      <div className="text-xs text-gray-500">{model.description}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {model.provider} • {model.contextLength.toLocaleString()} tokens
                      </div>
                    </div>
                  </div>
                  {value === model.id && (
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {hasError && (
        <div className="mt-1 flex items-center text-red-600 text-xs">
          <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Web Search Toggle */}
      {onWebSearchToggle && (
        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">Enable Web Search</span>
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <button
              type="button"
              onClick={() => onWebSearchToggle(!webSearchEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                webSearchEnabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  webSearchEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {webSearchEnabled 
              ? 'Web search will provide current market data (additional cost applies)'
              : 'Analysis will use model training data only (no additional cost)'
            }
          </p>
        </div>
      )}

      {/* Model Information */}
      {selectedModel && (
        <div className={`mt-3 p-3 rounded-lg border ${
          webSearchEnabled 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-start">
            <svg className={`w-4 h-4 mr-2 mt-0.5 flex-shrink-0 ${
              webSearchEnabled ? 'text-blue-600' : 'text-gray-600'
            }`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-xs">
              <div className={webSearchEnabled ? 'text-blue-800' : 'text-gray-700'}>
                <p className="font-medium mb-1">
                  {selectedModel.provider} {selectedModel.name}
                </p>
                <p className="mb-2">{selectedModel.description}</p>
                <div className="space-y-1">
                  <p><strong>Context:</strong> {selectedModel.contextLength.toLocaleString()} tokens</p>
                  <p><strong>Base Cost:</strong> {selectedModel.isFree ? 'Free' : 'Paid'}</p>
                  {webSearchEnabled && (
                    <p><strong>Web Search:</strong> Additional cost applies</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}