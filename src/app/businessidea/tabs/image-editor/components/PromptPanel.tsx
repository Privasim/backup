'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { enhancePrompt } from '@/components/chatbox/ChatboxControls';
import { TemplateSettings, applyTemplate, isTemplated, stripTemplate } from '../utils/promptTemplate';

interface PromptPanelProps {
  prompt: string;
  isGenerating: boolean;
  onPromptChange: (prompt: string) => void;
  onGenerate: () => void;
  disabled: boolean;
  autoImproveTriggerId?: string;
  templateSettings: TemplateSettings;
}

export default function PromptPanel({
  prompt,
  isGenerating,
  onPromptChange,
  onGenerate,
  disabled,
  autoImproveTriggerId,
  templateSettings
}: PromptPanelProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [improveError, setImproveError] = useState<string | null>(null);
  const lastProcessedTriggerId = useRef<string | undefined>(undefined);
  
  const maxLength = 3000;
  const promptLength = prompt.length;
  const isPromptEmpty = prompt.trim().length === 0;
  const isButtonDisabled = disabled || isGenerating || isPromptEmpty;
  const isImproveButtonDisabled = disabled || isGenerating || isImproving || isPromptEmpty;

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
  
  const handleImprovePrompt = async () => {
    if (isImproveButtonDisabled) return;
    
    setIsImproving(true);
    setImproveError(null);
    
    try {
      const result = await enhancePrompt(prompt, {
        tone: 'neutral',
        detail: 'rich',
        length: 'medium'
      });
      
      const improved = (result.improved || '').trim();

      // Apply device/hand template based on settings and avoid duplication
      const keywordTemplated = /iphone\s*1[56]\s*pro/i.test(improved) || /dynamic\s*island/i.test(improved);
      const alreadyTemplated = isTemplated(improved) || keywordTemplated;
      const composed = templateSettings.enabled && !alreadyTemplated
        ? applyTemplate(improved, templateSettings)
        : improved;

      const finalText = composed.slice(0, maxLength);
      onPromptChange(finalText);
    } catch (error) {
      setImproveError(error instanceof Error ? error.message : 'Failed to improve prompt');
    } finally {
      setIsImproving(false);
    }
  };

  // Auto-run improve once when a new trigger id is received and conditions are safe
  useEffect(() => {
    if (!autoImproveTriggerId) return;
    if (lastProcessedTriggerId.current === autoImproveTriggerId) return;
    if (disabled || isGenerating || isImproving) return;
    if (isFocused) return; // do not override user typing
    if (isPromptEmpty) return;

    lastProcessedTriggerId.current = autoImproveTriggerId;
    void handleImprovePrompt();
  }, [autoImproveTriggerId, disabled, isGenerating, isImproving, isFocused, isPromptEmpty]);

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
          {isTemplated(prompt) && (
            <div className="mt-1 flex items-center gap-1">
              <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 text-[10px]">
                Templated framing applied
              </span>
              <button
                type="button"
                className="text-[10px] text-blue-700 hover:underline"
                onClick={() => onPromptChange(stripTemplate(prompt).slice(0, maxLength))}
                aria-label="Remove templated framing"
              >
                Remove framing
              </button>
            </div>
          )}
          {disabled && !isGenerating && (
            <p className="mt-1 text-[10px] text-warning-600">
              Please add and validate your API key
            </p>
          )}
          {improveError && (
            <p className="mt-1 text-[10px] text-warning-600">
              {improveError}
            </p>
          )}
        </div>
      </div>
      <div className="flex justify-between items-center">  
        <button
          type="button"
          onClick={handleImprovePrompt}
          disabled={isImproveButtonDisabled}
          aria-busy={isImproving}
          className={`inline-flex items-center px-3 py-1.5 border text-xs font-medium rounded shadow-sm ${
            isImproveButtonDisabled
              ? 'bg-gray-100 text-gray-400 border-gray-200'
              : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
          }`}
        >
          {isImproving ? (
            <>
              <svg className="animate-spin -ml-0.5 mr-1.5 h-3 w-3 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Improving...
            </>
          ) : (
            <>
              <SparklesIcon className="-ml-0.5 mr-1.5 h-3.5 w-3.5" />
              Improve
            </>
          )}
        </button>
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
