'use client';

import React, { useState } from 'react';
import { debugLog } from '@/components/debug/DebugConsole';

interface RSSUrlInputProps {
  value: string;
  onChange: (url: string) => void;
  onValidate: (url: string) => Promise<boolean>;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

export default function RSSUrlInput({
  value,
  onChange,
  onValidate,
  isLoading = false,
  error = null,
  className = ''
}: RSSUrlInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isValidating, setIsValidating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  const handleValidate = async () => {
    if (!inputValue.trim()) {
      return;
    }

    try {
      setIsValidating(true);
      debugLog.info('RSSUrlInput', 'Validating RSS feed URL', { url: inputValue });
      
      const isValid = await onValidate(inputValue.trim());
      
      if (isValid) {
        debugLog.success('RSSUrlInput', 'RSS feed URL validation successful');
      } else {
        debugLog.error('RSSUrlInput', 'RSS feed URL validation failed');
      }
    } catch (error) {
      debugLog.error('RSSUrlInput', 'RSS feed URL validation error', { error });
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleValidate();
    }
  };

  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  };

  const showValidateButton = inputValue.trim() && isValidUrl(inputValue.trim());

  return (
    <div className={`rss-url-input ${className}`}>
      <div className="flex flex-col space-y-2">
        <label htmlFor="rss-url" className="text-sm font-medium text-gray-700">
          RSS Feed URL
        </label>
        
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <input
              id="rss-url"
              type="url"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="https://feeds.reuters.com/reuters/businessNews"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300'
              }`}
              disabled={isLoading || isValidating}
            />
            
            {(isLoading || isValidating) && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          {showValidateButton && (
            <button
              onClick={handleValidate}
              disabled={isLoading || isValidating}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors flex items-center space-x-2"
            >
              {isValidating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Validating...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Validate</span>
                </>
              )}
            </button>
          )}
        </div>
        
        {error && (
          <div className="flex items-center space-x-2 text-sm text-red-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        
        <div className="text-xs text-gray-500">
          Enter a valid RSS feed URL (RSS 2.0, Atom 1.0, or RSS 1.0 format)
        </div>
      </div>
    </div>
  );
}