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
  const progressPercentage = (characterCount / maxLength) * 100;

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-slate-700">
            System Prompt
          </label>
          <div className="flex items-center gap-2">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  isAtLimit ? 'bg-red-500' : progressPercentage > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
            <span className={`text-xs font-medium ${isAtLimit ? 'text-red-600' : 'text-slate-500'}`}>
              {characterCount}/{maxLength}
            </span>
          </div>
        </div>
      )}
      
      <div className="relative group">
        <textarea
          value={systemPrompt}
          onChange={handlePromptChange}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full px-4 py-3 text-sm bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400/60 focus:bg-white/80 resize-none transition-all duration-200 placeholder:text-slate-400"
          rows={4}
        />
        
        {showReset && (
          <button
            onClick={handleReset}
            className="absolute top-3 right-3 p-1.5 text-xs bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 hover:text-slate-700 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
            title="Reset to default prompt"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>
      
      {!showLabel && (
        <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
          <span>Configure AI behavior and response patterns</span>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
            <span>{characterCount} chars</span>
          </div>
        </div>
      )}
    </div>
  );
};
