'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useChatbox } from '@/components/chatbox/ChatboxProvider';
import { useImplementationPlan } from '@/features/implementation-plan/useImplementationPlan';
import { useGoToMarketData } from '../hooks/useGoToMarketData';
import { GoToMarketService } from '../services/GoToMarketService';
import { BusinessSuggestionSelector } from './BusinessSuggestionSelector';
import { MarketingStrategySection } from './MarketingStrategySection';
import { SalesChannelSection } from './SalesChannelSection';
import { PricingStrategySection } from './PricingStrategySection';
import { ImplementationTimelineSection } from './ImplementationTimelineSection';
import { 
  RocketLaunchIcon,
  CogIcon,
  SparklesIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function GoToMarketContent() {
  const { businessSuggestions, config } = useChatbox();
  const { plan: implementationPlan } = useImplementationPlan();
  const {
    data,
    selectedSuggestion,
    availableSuggestions,
    hasSelectedSuggestion,
    hasContent,
    setSelectedSuggestion,
    markStrategyCompleted,
    markChannelCompleted,
    clearData,
    setLoading,
    setError,
    setSuccess
  } = useGoToMarketData();

  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('marketing');

  // Initialize service
  const [service, setService] = useState<GoToMarketService | null>(null);

  useEffect(() => {
    if (config.apiKey) {
      setService(new GoToMarketService(config.apiKey));
    }
  }, [config.apiKey]);

  // Generate go-to-market content
  const generateContent = useCallback(async () => {
    if (!selectedSuggestion || !service || !config.model) {
      setError('Missing required data for generation');
      return;
    }

    setIsGenerating(true);
    setLoading();

    try {
      const [strategies, channels, pricing] = await Promise.all([
        service.generateMarketingStrategies(selectedSuggestion, config.model, implementationPlan),
        service.generateSalesChannelRecommendations(selectedSuggestion, config.model),
        service.generatePricingStrategies(selectedSuggestion, config.model)
      ]);

      setSuccess(strategies, channels, pricing);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate content';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedSuggestion, service, config.model, implementationPlan, setLoading, setError, setSuccess]);

  // Auto-generate content when suggestion changes
  useEffect(() => {
    if (hasSelectedSuggestion && !hasContent && !isGenerating) {
      generateContent();
    }
  }, [hasSelectedSuggestion, hasContent, isGenerating, generateContent]);

  // Retry generation
  const handleRetry = useCallback(() => {
    generateContent();
  }, [generateContent]);

  // Clear all data
  const handleClear = useCallback(() => {
    clearData();
    setSelectedSuggestion(undefined);
  }, [clearData, setSelectedSuggestion]);

  // Section navigation
  const sections = [
    { id: 'marketing', label: 'Marketing Strategies', icon: '📊' },
    { id: 'channels', label: 'Sales Channels', icon: '🛍️' },
    { id: 'pricing', label: 'Pricing', icon: '💰' },
    { id: 'timeline', label: 'Timeline', icon: '📅' }
  ];

  // Loading state for entire component
  if (data.status === 'loading' || isGenerating) {
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
              <RocketLaunchIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Go-to-Market</h2>
              <p className="text-xs text-gray-600">Generating your marketing strategy...</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600" />
              <span className="text-sm text-gray-600">
                Creating personalized go-to-market strategies...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
              <RocketLaunchIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Go-to-Market</h2>
              <p className="text-xs text-gray-600">
                {hasContent 
                  ? 'AI-powered marketing strategies for your business'
                  : 'Launch successfully with data-driven strategies'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {hasContent && (
              <>
                <button
                  onClick={handleRetry}
                  disabled={isGenerating}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white hover:bg-opacity-60 rounded-lg transition-colors disabled:opacity-50"
                  title="Regenerate Content"
                >
                  <SparklesIcon className="w-5 h-5" />
                </button>
                
                <button
                  onClick={handleClear}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white hover:bg-opacity-60 rounded-lg transition-colors"
                  title="Clear All Data"
                >
                  <CogIcon className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Business Suggestion Selector */}
        <BusinessSuggestionSelector
          selectedSuggestion={selectedSuggestion}
          availableSuggestions={availableSuggestions}
          onSuggestionSelect={setSelectedSuggestion}
        />
      </div>

      {/* Error State */}
      {data.status === 'error' && (
        <div className="bg-white rounded-xl border border-red-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Generation Failed</h3>
              <p className="text-sm text-gray-600">
                {data.error || 'There was an error generating your go-to-market content.'}
              </p>
            </div>
          </div>
          <button
            onClick={handleRetry}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <SparklesIcon className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      )}

      {/* Content Sections */}
      {hasContent && (
        <>
          {/* Section Navigation */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex flex-wrap gap-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === section.id
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{section.icon}</span>
                  <span>{section.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Section Content */}
          <div className="min-h-[400px]">
            {activeSection === 'marketing' && (
              <MarketingStrategySection
                strategies={data.marketingStrategies}
                onToggleComplete={markStrategyCompleted}
                isLoading={data.status === 'loading'}
                error={data.status === 'error' ? data.error : undefined}
                onRetry={handleRetry}
              />
            )}

            {activeSection === 'channels' && (
              <SalesChannelSection
                channels={data.salesChannels}
                onToggleComplete={markChannelCompleted}
                isLoading={data.status === 'loading'}
                error={data.status === 'error' ? data.error : undefined}
                onRetry={handleRetry}
              />
            )}

            {activeSection === 'pricing' && (
              <PricingStrategySection
                strategies={data.pricingStrategies}
                isLoading={data.status === 'loading'}
                error={data.status === 'error' ? data.error : undefined}
                onRetry={handleRetry}
              />
            )}

            {activeSection === 'timeline' && (
              <ImplementationTimelineSection
                implementationPlan={implementationPlan}
                marketingStrategies={data.marketingStrategies}
                alignment={data.implementationAlignment}
              />
            )}
          </div>

          {/* Progress Summary */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📈 Progress Summary
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-2xl font-bold text-blue-600">
                  {data.marketingStrategies.length}
                </div>
                <div className="text-sm text-gray-600">Marketing Strategies</div>
                <div className="text-xs text-gray-500 mt-1">
                  {data.marketingStrategies.filter(s => s.completed).length} completed
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-2xl font-bold text-green-600">
                  {data.salesChannels.length}
                </div>
                <div className="text-sm text-gray-600">Sales Channels</div>
                <div className="text-xs text-gray-500 mt-1">
                  Avg. suitability: {data.salesChannels.length > 0 
                    ? Math.round(data.salesChannels.reduce((sum, c) => sum + c.suitabilityScore, 0) / data.salesChannels.length)
                    : 0}%
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-2xl font-bold text-purple-600">
                  {data.pricingStrategies.length}
                </div>
                <div className="text-sm text-gray-600">Pricing Models</div>
                <div className="text-xs text-gray-500 mt-1">
                  Avg. market fit: {data.pricingStrategies.length > 0 
                    ? Math.round(data.pricingStrategies.reduce((sum, p) => sum + p.marketFit, 0) / data.pricingStrategies.length)
                    : 0}%
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-2xl font-bold text-orange-600">
                  {data.progress.overallProgress}%
                </div>
                <div className="text-sm text-gray-600">Overall Progress</div>
                <div className="text-xs text-gray-500 mt-1">
                  Last updated: {new Date(data.progress.lastUpdated).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">🎯 Recommended Next Steps</h4>
              <div className="text-sm text-blue-800 space-y-1">
                {data.progress.overallProgress === 0 && (
                  <p>• Start by reviewing and implementing your highest priority marketing strategy</p>
                )}
                {data.progress.overallProgress > 0 && data.progress.overallProgress < 50 && (
                  <p>• Continue implementing marketing strategies and consider setting up your first sales channel</p>
                )}
                {data.progress.overallProgress >= 50 && (
                  <p>• Great progress! Focus on optimizing performance and scaling successful strategies</p>
                )}
                <p>• Monitor key metrics and adjust strategies based on performance data</p>
                <p>• Consider A/B testing different approaches to optimize conversion rates</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Empty State - No Business Suggestion */}
      {!hasSelectedSuggestion && availableSuggestions.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
            <RocketLaunchIcon className="w-8 h-8 text-purple-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Ready to Launch Your Business?
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Generate AI-powered business suggestions first, then get comprehensive 
            go-to-market strategies including marketing plans, sales channels, and pricing models.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => businessSuggestions.suggestions.length === 0 && generateContent()}
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <SparklesIcon className="w-5 h-5 mr-2" />
              Get Started
            </button>
          </div>
        </div>
      )}
    </div>
  );
}