'use client';

import React, { useState } from 'react';
import { useChatbox } from '@/components/chatbox/ChatboxProvider';
import { useBusinessSuggestion } from '@/contexts';
import { useImplementationPlanContext } from '@/features/implementation-plan/ImplementationPlanProvider';
import SuggestionCard from '@/components/business/SuggestionCard';
import BusinessPlanSettings from '@/components/business/BusinessPlanSettings';
import { SparklesIcon, LightBulbIcon, CogIcon } from '@heroicons/react/24/outline';

export default function BusinessPlanContent() {
  const { createPlanConversation, openChatbox } = useChatbox();
  const { suggestions, isGenerating, error: suggestionError, generateSuggestions } = useBusinessSuggestion();
  const implementationPlanContext = useImplementationPlanContext();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const isLoading = isGenerating;
  const hasError = !!suggestionError;
  const hasSuggestions = suggestions.length > 0;
  const lengthPreset = implementationPlanContext?.settings?.lengthPreset || 'long';

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="p-4 bg-blue-50 rounded-full mb-4">
        <LightBulbIcon className="h-12 w-12 text-blue-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Ready for Business Ideas?
      </h3>
      <p className="text-gray-600 mb-4 max-w-md">
        Complete your profile analysis in the chatbox to get personalized business suggestions tailored to your skills and experience.
      </p>
      <div className="flex items-center space-x-2 text-sm text-blue-600">
        <SparklesIcon className="h-4 w-4" />
        <span>AI-powered suggestions coming soon</span>
      </div>
    </div>
  );

  // Error state component
  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="p-4 bg-red-50 rounded-full mb-4">
        <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Generation Failed
      </h3>
      <p className="text-gray-600 mb-4 max-w-md">
        {suggestionError || 'Failed to generate business suggestions. Please try again.'}
      </p>
      <p className="text-sm text-gray-500">
        You can retry using the business suggestion selector
      </p>
    </div>
  );

  const handleGenerateSuggestions = () => {
    generateSuggestions();
  };

  return (
    <div className="space-y-4">
      {/* Main card */}
      <div className="rounded-2xl bg-white/90 p-3 shadow-sm backdrop-blur border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white text-lg">📋</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Business Plan</h2>
              <p className="text-xs text-gray-600">
                {hasSuggestions 
                  ? 'AI-generated business suggestions based on your profile'
                  : 'Strategic planning and business opportunities'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {hasSuggestions && (
              <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <SparklesIcon className="h-3 w-3" />
                <span>AI Generated</span>
              </div>
            )}
            
            {/* Generate Button */}
            <button
              onClick={handleGenerateSuggestions}
              disabled={isGenerating}
              className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 disabled:opacity-50 transition-colors"
            >
              {isGenerating ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1" />
                  Generating...
                </>
              ) : (
                'Generate New'
              )}
            </button>
            
            {/* Settings Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title="Business Plan Settings"
            >
              <CogIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Content area */}
        <div className="flex flex-col gap-3 h-[calc(100vh-240px)] overflow-y-auto">
          {isLoading && (
            <div className="space-y-4">
              <LoadingSkeleton />
              <LoadingSkeleton />
              <LoadingSkeleton />
            </div>
          )}
          
          {hasError && <ErrorState />}
          
          {!isLoading && !hasError && !hasSuggestions && <EmptyState />}
          
          {hasSuggestions && suggestions.map((suggestion) => (
            <div key={suggestion.id} className="w-full">
              <SuggestionCard
                suggestion={suggestion}
                onCreatePlan={(suggestion, _lengthPreset, visualizationType) => {
                  createPlanConversation(suggestion, lengthPreset);
                  openChatbox();
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Settings Modal */}
      <BusinessPlanSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
