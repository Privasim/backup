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
    <div className="p-1.5">
      <div className="flex items-center justify-between mb-0.5">
        <h3 className="text-[11px] font-medium text-primary leading-none">API Configuration</h3>
        <div className="flex items-center">
          <input
            id="persist-key"
            name="persist-key"
            type="checkbox"
            className="h-2 w-2 rounded-sm border-neutral-300 text-primary-600 focus:ring-1 focus:ring-primary-500"
            checked={isPersisted}
            onChange={handlePersistToggle}
          />
          <label htmlFor="persist-key" className="ml-0.5 text-[9px] text-neutral-600 leading-none">
            Remember
          </label>
        </div>
      </div>
      
      <div className="space-y-1.5">
        {/* API Key Input Row */}
        <div className="flex gap-0.5">
          <div className="flex-1">
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                id="api-key"
                className="input-base focus-ring w-full text-[11px] h-5 px-1.5 py-0.5"
                placeholder="OpenRouter API key"
                value={apiKey}
                onChange={handleApiKeyChange}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-1"
                onClick={() => setShowApiKey(!showApiKey)}
                aria-label={showApiKey ? "Hide API key" : "Show API key"}
              >
                {showApiKey ? (
                  <EyeSlashIcon className="h-2.5 w-2.5 text-neutral-400" />
                ) : (
                  <EyeIcon className="h-2.5 w-2.5 text-neutral-400" />
                )}
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              className={`text-[9px] h-5 px-1.5 rounded-sm leading-none ${
                isValidating || !apiKey
                  ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}
              onClick={handleValidateClick}
              disabled={isValidating || !apiKey}
            >
              {isValidating ? '...' : 'Check'}
            </button>
            
            <button
              type="button"
              className="text-[9px] h-5 px-1.5 rounded-sm border border-neutral-300 hover:bg-neutral-50 leading-none"
              onClick={handleRemoveKey}
              disabled={!apiKey}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Validation Status */}
        {validationStatus === 'valid' && (
          <p className="text-[9px] text-success-600 -mt-0.5 leading-none">✓ Valid API key</p>
        )}
        {validationStatus === 'invalid' && (
          <p className="text-[9px] text-error-600 -mt-0.5 leading-none">
            {validationError || 'Invalid API key'}
          </p>
        )}

        {/* Model Selection */}
        <div>
          <select
            id="model-select"
            className="select-base focus-ring w-full text-[11px] h-5 px-1.5 py-0.5"
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

        {/* No action buttons here - they've been moved to the API key row */}
      </div>
    </div>
  );
}
