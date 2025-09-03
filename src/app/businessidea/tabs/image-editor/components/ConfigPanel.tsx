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
    <div className="p-5">
      <h3 className="text-subheading text-primary mb-4">API Configuration</h3>
      
      <div className="space-y-4 md:grid md:grid-cols-3 md:gap-6 md:space-y-0">
        {/* API Key Input */}
        <div className="md:col-span-2">
          <label htmlFor="api-key" className="text-label block mb-2 text-primary">
            OpenRouter API Key
          </label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              id="api-key"
              className="input-base focus-ring w-full"
              placeholder="Enter your OpenRouter API key"
              value={apiKey}
              onChange={handleApiKeyChange}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 focus-ring-inset"
              onClick={() => setShowApiKey(!showApiKey)}
              aria-label={showApiKey ? "Hide API key" : "Show API key"}
            >
              {showApiKey ? (
                <EyeSlashIcon className="h-4 w-4 text-neutral-400" />
              ) : (
                <EyeIcon className="h-4 w-4 text-neutral-400" />
              )}
            </button>
          </div>
          
          {/* Validation Status */}
          {validationStatus === 'valid' && (
            <p className="mt-2 text-body-sm text-success-600">API key is valid</p>
          )}
          {validationStatus === 'invalid' && (
            <p className="mt-2 text-body-sm text-error-600">
              {validationError || 'API key is invalid'}
            </p>
          )}
        </div>

        {/* Model Selection */}
        <div>
          <label htmlFor="model-select" className="text-label block mb-2 text-primary">
            Image Model
          </label>
          <select
            id="model-select"
            className="select-base focus-ring w-full"
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
        <div className="md:col-span-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className={`btn-base ${isValidating || !apiKey ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed' : 'btn-primary'}`}
              onClick={handleValidateClick}
              disabled={isValidating || !apiKey}
            >
              {isValidating ? 'Validating...' : 'Validate Key'}
            </button>
            
            <button
              type="button"
              className="btn-secondary focus-ring"
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
              className="checkbox-base"
              checked={isPersisted}
              onChange={handlePersistToggle}
            />
            <label htmlFor="persist-key" className="ml-2 text-body-sm text-secondary">
              Remember API key
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
