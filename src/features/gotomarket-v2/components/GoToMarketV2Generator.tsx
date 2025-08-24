'use client';

import React, { useState } from 'react';
import { useGoToMarketV2 } from '../hooks/useGoToMarketV2';
import { ProgressIndicator } from './ProgressIndicator';
import { GenerationOptions } from '../types';
import { PlayIcon, CogIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface GoToMarketV2GeneratorProps {
  className?: string;
}

export const GoToMarketV2Generator: React.FC<GoToMarketV2GeneratorProps> = React.memo(({
  className = ''
}) => {
  const {
    status,
    progress,
    error,
    streamingState,
    generateStrategies,
    cancelGeneration,
    implementationContext,
    hasValidContext,
    canGenerate
  } = useGoToMarketV2();

  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState<GenerationOptions>({
    focusAreas: ['marketing', 'sales', 'pricing'],
    budgetRange: 'medium',
    timeframe: 'short-term'
  });

  const handleGenerate = async () => {
    await generateStrategies(options);
  };

  const handleCancel = () => {
    cancelGeneration();
  };

  const toggleFocusArea = (area: 'marketing' | 'sales' | 'pricing' | 'distribution') => {
    setOptions(prev => ({
      ...prev,
      focusAreas: prev.focusAreas?.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...(prev.focusAreas || []), area]
    }));
  };

  // Show context validation errors
  if (!implementationContext.implementationPlan) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Implementation Plan Required</h3>
              <p className="text-sm text-yellow-700 mt-1">
                To generate go-to-market strategies, you need an implementation plan first. 
                Please go to the <strong>Implementation Plan</strong> tab and generate a plan for your business idea.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!hasValidContext) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Invalid Implementation Plan</h3>
              <div className="text-sm text-red-700 mt-1">
                <p>The current implementation plan has issues:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {implementationContext.contextValidation.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
                {implementationContext.contextValidation.warnings && implementationContext.contextValidation.warnings.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Warnings:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      {implementationContext.contextValidation.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`} role="main" aria-label="Go-to-Market Strategy Generator">
      {/* Context Summary */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-green-800">Ready to Generate</h3>
            <p className="text-sm text-green-700 mt-1">
              {implementationContext.contextSummary}
            </p>
          </div>
        </div>
      </div>

      {/* Generation Options */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">Generation Options</h3>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="flex items-center text-xs text-gray-600 hover:text-gray-800"
          >
            <CogIcon className="w-4 h-4 mr-1" />
            {showOptions ? 'Hide' : 'Show'} Options
          </button>
        </div>

        {showOptions && (
          <div className="space-y-4 border-t border-gray-200 pt-4">
            {/* Focus Areas */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Focus Areas
              </label>
              <div className="flex flex-wrap gap-2">
                {(['marketing', 'sales', 'pricing', 'distribution'] as const).map(area => (
                  <button
                    key={area}
                    onClick={() => toggleFocusArea(area)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      options.focusAreas?.includes(area)
                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {area.charAt(0).toUpperCase() + area.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Range */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Budget Range
              </label>
              <select
                value={options.budgetRange || 'medium'}
                onChange={(e) => setOptions(prev => ({ ...prev, budgetRange: e.target.value as any }))}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low Budget (Bootstrapped)</option>
                <option value="medium">Medium Budget (Funded)</option>
                <option value="high">High Budget (Well-funded)</option>
              </select>
            </div>

            {/* Timeframe */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Timeframe
              </label>
              <select
                value={options.timeframe || 'short-term'}
                onChange={(e) => setOptions(prev => ({ ...prev, timeframe: e.target.value as any }))}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="immediate">Immediate (0-3 months)</option>
                <option value="short-term">Short-term (3-12 months)</option>
                <option value="long-term">Long-term (12+ months)</option>
              </select>
            </div>

            {/* Custom Prompt */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Additional Requirements (Optional)
              </label>
              <textarea
                value={options.customPrompt || ''}
                onChange={(e) => setOptions(prev => ({ ...prev, customPrompt: e.target.value }))}
                placeholder="Any specific requirements or constraints for your go-to-market strategy..."
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
          </div>
        )}
      </div>

      {/* Generation Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            aria-label="Generate comprehensive go-to-market strategy"
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              canGenerate
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <PlayIcon className="w-4 h-4 mr-2" />
            Generate Go-to-Market Strategy
          </button>

          {(status === 'generating' || status === 'streaming') && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      <ProgressIndicator
        status={status}
        progress={progress}
        streamingState={streamingState}
      />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Generation Failed</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={handleGenerate}
                className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});