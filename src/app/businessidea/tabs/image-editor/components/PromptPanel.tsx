'use client';

import React, { useState } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface PromptPanelProps {
  prompt: string;
  isGenerating: boolean;
  onPromptChange: (prompt: string) => void;
  onGenerate: () => void;
  disabled: boolean;
}

export default function PromptPanel({
  prompt,
  isGenerating,
  onPromptChange,
  onGenerate,
  disabled
}: PromptPanelProps) {
  const [isFocused, setIsFocused] = useState(false);
  const maxLength = 1000;
  const promptLength = prompt.length;
  const isPromptEmpty = prompt.trim().length === 0;
  const isButtonDisabled = disabled || isGenerating || isPromptEmpty;

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      onPromptChange(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !isButtonDisabled) {
      e.preventDefault();
      onGenerate();
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-md p-4 mb-4">
      <div className="mb-2">
        <label htmlFor="prompt-input" className="block text-sm font-medium text-gray-700 mb-1">
          Image Prompt
        </label>
        <div className={`relative rounded-md shadow-sm ${isFocused ? 'ring-2 ring-indigo-500' : ''}`}>
          <textarea
            id="prompt-input"
            rows={3}
            className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Describe the image you want to generate..."
            value={prompt}
            onChange={handlePromptChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
            aria-label="Image prompt"
          />
          <div className="absolute bottom-2 right-2 flex items-center">
            <span className={`text-xs ${promptLength > maxLength * 0.8 ? 'text-amber-500' : 'text-gray-400'}`}>
              {promptLength}/{maxLength}
            </span>
          </div>
        </div>
        {disabled && !isGenerating && (
          <p className="mt-1 text-xs text-amber-500">
            Please add and validate your API key before generating images.
          </p>
        )}
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isButtonDisabled}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
            isButtonDisabled
              ? 'bg-indigo-300 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          }`}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <PaperAirplaneIcon className="-ml-1 mr-2 h-4 w-4" />
              Generate
            </>
          )}
        </button>
      </div>
    </div>
  );
}
