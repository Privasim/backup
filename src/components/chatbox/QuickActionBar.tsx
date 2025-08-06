'use client';

import React from 'react';
import { useChatbox } from './ChatboxProvider';
import { SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

interface QuickActionBarProps {
  className?: string;
}

export const QuickActionBar: React.FC<QuickActionBarProps> = ({ className = '' }) => {
  const { 
    status, 
    currentAnalysis, 
    businessSuggestions, 
    generateBusinessSuggestions 
  } = useChatbox();

  // Only show if analysis is completed and we haven't generated suggestions yet
  const shouldShow = status === 'completed' && 
                    currentAnalysis && 
                    businessSuggestions.suggestionStatus === 'idle';

  const isGenerating = businessSuggestions.suggestionStatus === 'generating';
  const hasError = businessSuggestions.suggestionStatus === 'error';

  if (!shouldShow && !isGenerating && !hasError) {
    return null;
  }

  const handleGenerateSuggestions = async () => {
    try {
      await generateBusinessSuggestions();
    } catch (error) {
      console.error('Failed to generate business suggestions:', error);
    }
  };

  return (
    <div className={`mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <SparklesIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Ready for Business Ideas?
            </h3>
            <p className="text-xs text-gray-600">
              Get personalized business suggestions based on your analysis
            </p>
          </div>
        </div>
        
        <button
          onClick={handleGenerateSuggestions}
          disabled={isGenerating}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
            ${isGenerating
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] shadow-sm'
            }
          `}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <span>Get Business Ideas</span>
              <ArrowRightIcon className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
      
      {hasError && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <div className="w-4 h-4 text-red-500 mt-0.5">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-red-800">Generation Failed</h4>
              <p className="text-xs text-red-700 mt-1">
                {businessSuggestions.suggestionError || 'Failed to generate business suggestions'}
              </p>
              <button
                onClick={handleGenerateSuggestions}
                className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActionBar;