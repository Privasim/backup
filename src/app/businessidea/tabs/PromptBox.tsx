import React, { useCallback, useEffect } from 'react';
import { usePromptStore } from '@/store/usePromptStore';

interface PromptBoxProps {
  className?: string;
  placeholder?: string;
  maxLength?: number;
  showLabel?: boolean;
  showReset?: boolean;
  onPromptChange?: (prompt: string) => void;
}

export const PromptBox: React.FC<PromptBoxProps> = ({
  className = '',
  placeholder = "Enter system prompt...",
  maxLength = 1000,
  showLabel = true,
  showReset = true,
  onPromptChange,
}) => {
  const { systemPrompt, setSystemPrompt, resetPrompt, getDefaultPrompt } = usePromptStore();

  const handlePromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPrompt = e.target.value;
    if (newPrompt.length <= maxLength) {
      setSystemPrompt(newPrompt);
      onPromptChange?.(newPrompt);
    }
  }, [maxLength, setSystemPrompt, onPromptChange]);

  const handleReset = useCallback(() => {
    resetPrompt();
    onPromptChange?.(getDefaultPrompt());
  }, [resetPrompt, getDefaultPrompt, onPromptChange]);

  const characterCount = systemPrompt.length;
  const isAtLimit = characterCount >= maxLength;

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            System Prompt
          </label>
          <span className={`text-xs ${isAtLimit ? 'text-red-600' : 'text-gray-500'}`}>
            {characterCount}/{maxLength}
          </span>
        </div>
      )}
      
      <div className="relative">
        <textarea
          value={systemPrompt}
          onChange={handlePromptChange}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
        />
        
        {showReset && (
          <button
            onClick={handleReset}
            className="absolute top-2 right-2 p-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
            title="Reset to default prompt"
          >
            Reset
          </button>
        )}
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Define the AI's behavior and response style</span>
      </div>
    </div>
  );
};
