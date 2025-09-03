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
    <div className="space-y-4">
      <div>
        <label htmlFor="prompt-input" className="block text-xs font-medium text-gray-700 mb-1">
          Image Prompt
        </label>
        <div className="relative">
          <div className="relative">
            <textarea
              id="prompt-input"
              rows={2}
              className="input-base w-full text-sm p-2 pr-10 min-h-[60px]"
              placeholder="Describe the image you want to generate..."
              value={prompt}
              onChange={handlePromptChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              disabled={isGenerating || disabled}
              aria-label="Image prompt"
            />
            <div className="absolute bottom-2 right-2 flex items-center">
              <span className={`text-[10px] ${promptLength > maxLength * 0.8 ? 'text-warning-600' : 'text-gray-500'}`}>
                {promptLength}/{maxLength}
              </span>
            </div>
          </div>
          {disabled && !isGenerating && (
            <p className="mt-1 text-[10px] text-warning-600">
              Please add and validate your API key
            </p>
          )}
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isButtonDisabled}
          className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white ${
            isButtonDisabled ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-0.5 mr-1.5 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <PaperAirplaneIcon className="-ml-0.5 mr-1.5 h-3.5 w-3.5" />
              Generate
            </>
          )}
        </button>
      </div>
    </div>
  );
}
