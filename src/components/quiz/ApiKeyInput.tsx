'use client';

import { useState, useEffect } from 'react';

interface ApiKeyInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  touched?: boolean;
  onValidate?: (isValid: boolean) => void;
  model?: string;
  onModelChange?: (model: string) => void;
  modelError?: string;
}

export default function ApiKeyInput({ 
  value, 
  onChange, 
  error, 
  touched,
  onValidate,
  model,
  onModelChange,
  modelError
}: ApiKeyInputProps) {
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  const availableModels = [
    { value: 'qwen/qwen3-coder:free', label: 'Qwen3 Coder (Free)', description: 'Optimized for coding tasks' },
    { value: 'z-ai/glm-4.5-air:free', label: 'GLM 4.5 Air (Free)', description: 'Lightweight for agentic tasks' },
    { value: 'moonshotai/kimi-k2:free', label: 'Kimi K2 (Free)', description: 'Advanced reasoning & code synthesis' }
  ];

  // Basic format validation
  const isValidFormat = (key: string) => {
    return /^sk-or-v1-[a-f0-9]{32,}$/.test(key);
  };

  // Validate API key format on change
  useEffect(() => {
    if (value && value.length > 10) {
      const isValid = isValidFormat(value);
      setValidationStatus(isValid ? 'valid' : 'invalid');
      onValidate?.(isValid);
    } else {
      setValidationStatus('idle');
      onValidate?.(false);
    }
  }, [value, onValidate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value.trim());
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').trim();
    onChange(pastedText);
  };

  const getValidationIcon = () => {
    if (validationStatus === 'valid') {
      return (
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    }
    if (validationStatus === 'invalid' && value) {
      return (
        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
    }
    return null;
  };

  const hasError = touched && error;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-900 mb-2">
          AI Model Selection
          <span className="text-red-500 ml-1">*</span>
        </label>
        <select
          value={model || ''}
          onChange={(e) => onModelChange?.(e.target.value)}
          className={`w-full px-3 py-2.5 border-2 rounded-lg transition-all duration-200 text-sm ${
            modelError && touched
              ? 'border-red-500 ring-2 ring-red-100'
              : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
          } focus:outline-none`}
        >
          <option value="" disabled>Select a model</option>
          {availableModels.map((modelOption) => (
            <option key={modelOption.value} value={modelOption.value}>
              {modelOption.label}
            </option>
          ))}
        </select>
        
        {modelError && touched && (
          <div className="mt-1 flex items-center text-red-600 text-xs">
            <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {modelError}
          </div>
        )}
        
        <div className="mt-1 text-xs text-gray-600">
          {availableModels.find(m => m.value === model)?.description || 'Choose a model for AI analysis'}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-900 mb-2">
          OpenRouter API Key
          <span className="text-red-500 ml-1">*</span>
        </label>
          {getValidationIcon()}
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
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

      {hasError && (
        <div className="mt-1 flex items-center text-red-600 text-xs">
          <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start">
          <svg className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="text-xs text-amber-800">
            <p className="font-medium mb-1">Your API key is stored locally</p>
            <p>Get your free API key from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-amber-700 underline hover:text-amber-900">OpenRouter</a>. It's only used for this analysis and never sent to our servers.</p>
          </div>
        </div>
      </div>
    </div>
  );
}