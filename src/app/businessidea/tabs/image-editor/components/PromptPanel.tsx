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
    <div className="card-base p-6">
      <div className="mb-4">
        <label htmlFor="prompt-input" className="text-label block mb-2 text-primary">
          Image Prompt
        </label>
        <div className={`relative ${isFocused ? 'focus-visible' : ''}`}>
          <textarea
            id="prompt-input"
            rows={3}
            className="input-base focus-ring w-full"
            placeholder="Describe the image you want to generate..."
            value={prompt}
            onChange={handlePromptChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
            aria-label="Image prompt"
          />
          <div className="absolute bottom-3 right-3 flex items-center">
            <span className={`text-body-sm ${promptLength > maxLength * 0.8 ? 'text-warning-600' : 'text-secondary'}`}>
              {promptLength}/{maxLength}
            </span>
          </div>
        </div>
        {disabled && !isGenerating && (
          <p className="mt-2 text-body-sm text-warning-600">
            Please add and validate your API key before generating images.
          </p>
        )}
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isButtonDisabled}
          className={`btn-base ${isButtonDisabled ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed' : 'btn-primary'}`}
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
