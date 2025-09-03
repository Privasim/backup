'use client';

import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface ConfigPanelProps {
  apiKey: string;
  model: string;
  availableModels: string[];
  isValidating: boolean;
  validationError: string | null;
  onApiKeyChange: (apiKey: string) => void;
  onValidateKey: () => Promise<boolean>;
  onPersistToggle: (enabled: boolean) => void;
  onRemoveKey: () => void;
  onModelChange?: (model: string) => void;
}

export default function ConfigPanel({
  apiKey,
  model,
  availableModels,
  isValidating,
  validationError,
  onApiKeyChange,
  onValidateKey,
  onPersistToggle,
  onRemoveKey,
  onModelChange
}: ConfigPanelProps) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [isPersisted, setIsPersisted] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'none' | 'valid' | 'invalid'>('none');

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onApiKeyChange(e.target.value);
    // Reset validation status when key changes
    setValidationStatus('none');
  };

  const handleValidateClick = async () => {
    try {
      const isValid = await onValidateKey();
      setValidationStatus(isValid ? 'valid' : 'invalid');
    } catch (error) {
      setValidationStatus('invalid');
    }
  };

  const handlePersistToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const shouldPersist = e.target.checked;
    setIsPersisted(shouldPersist);
    onPersistToggle(shouldPersist);
  };

  const handleRemoveKey = () => {
    onRemoveKey();
    setValidationStatus('none');
    setIsPersisted(false);
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onModelChange) {
      onModelChange(e.target.value);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-md p-4 mb-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">API Configuration</h3>
      
      <div className="space-y-4">
        {/* API Key Input */}
        <div>
          <label htmlFor="api-key" className="block text-xs font-medium text-gray-700 mb-1">
            OpenRouter API Key
          </label>
          <div className="relative rounded-md shadow-sm">
            <input
              type={showApiKey ? 'text' : 'password'}
              id="api-key"
              className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter your OpenRouter API key"
              value={apiKey}
              onChange={handleApiKeyChange}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? (
                <EyeSlashIcon className="h-4 w-4 text-gray-400" />
              ) : (
                <EyeIcon className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          
          {/* Validation Status */}
          {validationStatus === 'valid' && (
            <p className="mt-1 text-xs text-green-600">API key is valid</p>
          )}
          {validationStatus === 'invalid' && (
            <p className="mt-1 text-xs text-red-600">
              {validationError || 'API key is invalid'}
            </p>
          )}
        </div>

        {/* Model Selection */}
        <div>
          <label htmlFor="model-select" className="block text-xs font-medium text-gray-700 mb-1">
            Image Model
          </label>
          <select
            id="model-select"
            className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={model}
            onChange={handleModelChange}
          >
            {availableModels.map((modelOption) => (
              <option key={modelOption} value={modelOption}>
                {modelOption}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              type="button"
              className={`inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-md shadow-sm text-white ${
                isValidating || !apiKey
                  ? 'bg-indigo-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
              onClick={handleValidateClick}
              disabled={isValidating || !apiKey}
            >
              {isValidating ? 'Validating...' : 'Validate Key'}
            </button>
            
            <button
              type="button"
              className="ml-3 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={handleRemoveKey}
              disabled={!apiKey}
            >
              Remove Key
            </button>
          </div>
          
          <div className="flex items-center">
            <input
              id="persist-key"
              name="persist-key"
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              checked={isPersisted}
              onChange={handlePersistToggle}
            />
            <label htmlFor="persist-key" className="ml-2 block text-xs text-gray-700">
              Remember API key
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
