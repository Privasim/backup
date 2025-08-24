'use client';

import React, { useState } from 'react';
import { BusinessSuggestion } from '@/components/chatbox/types';
import { useChatbox } from '@/components/chatbox/ChatboxProvider';
import { 
  ChevronDownIcon, 
  PlusIcon, 
  LightBulbIcon,
  SparklesIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

interface BusinessSuggestionSelectorProps {
  selectedSuggestion?: BusinessSuggestion;
  availableSuggestions: BusinessSuggestion[];
  onSuggestionSelect: (suggestion: BusinessSuggestion) => void;
  className?: string;
}

export function BusinessSuggestionSelector({
  selectedSuggestion,
  availableSuggestions,
  onSuggestionSelect,
  className = ''
}: BusinessSuggestionSelectorProps) {
  const { generateBusinessSuggestions, businessSuggestions, openChatbox } = useChatbox();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const { suggestionStatus, suggestionError } = businessSuggestions;

  const handleGenerateSuggestions = async () => {
    setIsGenerating(true);
    try {
      await generateBusinessSuggestions();
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestionClick = (suggestion: BusinessSuggestion) => {
    onSuggestionSelect(suggestion);
    setIsDropdownOpen(false);
  };

  // Empty state when no suggestions are available
  if (availableSuggestions.length === 0) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <LightBulbIcon className="w-6 h-6 text-blue-500" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Business Ideas Available
          </h3>
          
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            Generate AI-powered business suggestions based on your profile to get started with go-to-market planning.
          </p>

          {suggestionError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-sm text-red-700">{suggestionError}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleGenerateSuggestions}
              disabled={isGenerating || suggestionStatus === 'generating'}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating || suggestionStatus === 'generating' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  Generate Business Ideas
                </>
              )}
            </button>
            
            <button
              onClick={() => openChatbox()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Open Chatbox
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-gray-700">
          Select Business Idea
        </label>
        
        <button
          onClick={handleGenerateSuggestions}
          disabled={isGenerating || suggestionStatus === 'generating'}
          className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 disabled:opacity-50 transition-colors"
        >
          {isGenerating || suggestionStatus === 'generating' ? (
            <>
              <div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1" />
              Generating...
            </>
          ) : (
            <>
              <SparklesIcon className="inline w-3 h-3 mr-1" />
              Refresh Ideas
            </>
          )}
        </button>
      </div>

      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <div className="flex-1 text-left">
            {selectedSuggestion ? (
              <div>
                <div className="font-medium text-gray-900">
                  {selectedSuggestion.title}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {selectedSuggestion.category} • {selectedSuggestion.targetMarket}
                </div>
              </div>
            ) : (
              <div className="text-gray-500">
                Choose a business idea to analyze...
              </div>
            )}
          </div>
          
          <ChevronDownIcon 
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isDropdownOpen ? 'rotate-180' : ''
            }`} 
          />
        </button>

        {isDropdownOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {availableSuggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                  selectedSuggestion?.id === suggestion.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {suggestion.title}
                    </div>
                    <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {suggestion.description}
                    </div>
                    <div className="flex items-center mt-2 space-x-3">
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                        {suggestion.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {suggestion.targetMarket}
                      </span>
                    </div>
                  </div>
                  
                  <div className="ml-3 flex-shrink-0">
                    <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                      suggestion.viabilityScore >= 85 
                        ? 'bg-green-100 text-green-700'
                        : suggestion.viabilityScore >= 70
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {suggestion.viabilityScore}%
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedSuggestion && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            <strong>Key Features:</strong> {selectedSuggestion.keyFeatures.slice(0, 3).join(', ')}
            {selectedSuggestion.keyFeatures.length > 3 && '...'}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            <strong>Estimated Cost:</strong> {selectedSuggestion.estimatedStartupCost}
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
}