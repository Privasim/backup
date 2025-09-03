'use client';

import React, { useState } from 'react';
import { TemplateSettings } from '../utils/promptTemplate';
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
  // Template framing
  templateSettings: TemplateSettings;
  onTemplateSettingsChange: (settings: TemplateSettings) => void;
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
  onModelChange,
  templateSettings,
  onTemplateSettingsChange
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

  // Template settings handlers
  const handleTemplateEnabled = (e: React.ChangeEvent<HTMLInputElement>) => {
    onTemplateSettingsChange({ ...templateSettings, enabled: e.target.checked });
  };
  const handleDeviceModel = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as TemplateSettings['deviceModel'];
    onTemplateSettingsChange({ ...templateSettings, deviceModel: value });
  };
  const handleAngle = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as TemplateSettings['angle'];
    onTemplateSettingsChange({ ...templateSettings, angle: value });
  };
  const handleBackground = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as TemplateSettings['background'];
    onTemplateSettingsChange({ ...templateSettings, background: value });
  };
  const handleLighting = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as TemplateSettings['lighting'];
    onTemplateSettingsChange({ ...templateSettings, lighting: value });
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

        {/* Template Framing Settings */}
        <div className="mt-2 border-t border-neutral-200 pt-2">
          <h4 className="text-[11px] font-medium text-primary leading-none mb-1">Template Framing</h4>
          <div className="flex items-center mb-1">
            <input
              id="template-enabled"
              name="template-enabled"
              type="checkbox"
              className="h-2 w-2 rounded-sm border-neutral-300 text-primary-600 focus:ring-1 focus:ring-primary-500"
              checked={templateSettings.enabled}
              onChange={handleTemplateEnabled}
            />
            <label htmlFor="template-enabled" className="ml-0.5 text-[9px] text-neutral-600 leading-none">
              Enable device/hand framing
            </label>
          </div>

          <div className={`grid grid-cols-2 gap-1 ${templateSettings.enabled ? '' : 'opacity-50 pointer-events-none'}`}>
            <div>
              <label className="text-[10px] text-gray-600 block mb-0.5">Device</label>
              <select
                id="device-model"
                className="select-base focus-ring w-full text-[11px] h-5 px-1.5 py-0.5"
                value={templateSettings.deviceModel}
                onChange={handleDeviceModel}
              >
                <option value="iphone-16-pro">iPhone 16 Pro</option>
                <option value="iphone-15-pro">iPhone 15 Pro</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-600 block mb-0.5">Angle</label>
              <select
                id="device-angle"
                className="select-base focus-ring w-full text-[11px] h-5 px-1.5 py-0.5"
                value={templateSettings.angle}
                onChange={handleAngle}
              >
                <option value="portrait">Portrait</option>
                <option value="three-quarter">Three-quarter</option>
                <option value="straight-on">Straight-on</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-600 block mb-0.5">Background</label>
              <select
                id="device-background"
                className="select-base focus-ring w-full text-[11px] h-5 px-1.5 py-0.5"
                value={templateSettings.background}
                onChange={handleBackground}
              >
                <option value="outdoor">Outdoor</option>
                <option value="studio">Studio</option>
                <option value="indoor">Indoor</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-600 block mb-0.5">Lighting</label>
              <select
                id="device-lighting"
                className="select-base focus-ring w-full text-[11px] h-5 px-1.5 py-0.5"
                value={templateSettings.lighting}
                onChange={handleLighting}
              >
                <option value="natural">Natural</option>
                <option value="soft-studio">Soft Studio</option>
                <option value="golden-hour">Golden hour</option>
              </select>
            </div>
          </div>
        </div>

        {/* No action buttons here - they've been moved to the API key row */}
      </div>
    </div>
  );
}
