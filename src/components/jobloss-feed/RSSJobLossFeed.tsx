'use client';

import React, { useState, useEffect } from 'react';
import { useRSSFeedTracker } from '@/hooks/useRSSFeedTracker';
import FeedConfigurationPanel from '@/components/rss-feed/FeedConfigurationPanel';
import ContentFilterControls from '@/components/rss-feed/ContentFilterControls';
import VirtualizedArticleList from '@/components/rss-feed/VirtualizedArticleList';
import { debugLog } from '@/components/debug/DebugConsole';

interface RSSJobLossFeedProps {
  className?: string;
}

export default function RSSJobLossFeed({ className = '' }: RSSJobLossFeedProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfiguration, setShowConfiguration] = useState(false);
  
  const {
    // State
    feedConfig,
    feedStatus,
    articles,
    selectedArticles,
    analysisResults,
    isLoading,
    isAnalyzing,
    error,
    analysisError,
    showRelevantOnly,
    sortBy,
    apiKey,
    isApiKeyValid,
    
    // Actions
    setFeedConfig,
    validateFeedUrl,
    loadArticles,
    toggleArticleSelection,
    selectAllArticles,
    clearSelection,
    analyzeSelected,
    setShowRelevantOnly,
    setSortBy,
    setApiKey,
  } = useRSSFeedTracker();

  // Show configuration panel if no feed is configured
  useEffect(() => {
    if (!feedConfig.url) {
      setShowConfiguration(true);
    }
  }, [feedConfig.url]);

  // Auto-load articles when feed URL is configured (only once per URL change)
  useEffect(() => {
    if (feedConfig.url && feedStatus.status !== 'loading' && articles.length === 0) {
      loadArticles();
    }
  }, [feedConfig.url]); // Only depend on URL change

  const handleConfigChange = (config: any) => {
    setFeedConfig(config);
  };

  const handleRefreshNow = () => {
    loadArticles();
  };

  const handleToggleSelection = (id: string) => {
    toggleArticleSelection(id);
  };

  const handleSelectAll = (select: boolean) => {
    selectAllArticles(select);
  };

  const handleAnalyzeSelected = () => {
    if (!isApiKeyValid) {
      debugLog.error('RSSJobLossFeed', 'API key required for analysis');
      return;
    }
    analyzeSelected();
  };

  // Get analysis results mapped by article ID
  const analysisResultsMap = analysisResults.reduce((acc, result) => {
    acc[result.articleId] = result;
    return acc;
  }, {} as Record<string, any>);

  // Calculate statistics
  const totalJobsAffected = analysisResults.reduce((sum, result) => {
    return sum + (result.jobsAffected || 0);
  }, 0);

  const aiRelatedCount = analysisResults.filter(result => result.isAIRelated).length;
  const automationRelatedCount = analysisResults.filter(result => result.isAutomationRelated).length;
  const companiesAffected = new Set(analysisResults.flatMap(result => result.companies)).size;

  if (isLoading && articles.length === 0) {
    return (
      <div className={`rss-job-loss-feed ${className}`}>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Job Loss Feed</h2>
            <div className="flex items-center space-x-2 text-sm text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Loading RSS feed...</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rss-job-loss-feed ${className}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Job Loss Feed</h2>
              <p className="text-sm text-gray-600 mt-1">
                RSS-powered tracking of AI and automation-related job losses
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowConfiguration(!showConfiguration)}
                className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
              >
                {showConfiguration ? 'Hide Config' : 'Configure'}
              </button>
              
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                {isExpanded ? 'Collapse' : 'Expand'}
              </button>
            </div>
          </div>
        </div>

        {/* Configuration Panel */}
        {showConfiguration && (
          <div className="mb-6">
            <FeedConfigurationPanel
              config={feedConfig}
              status={feedStatus}
              isLoading={isLoading}
              error={error}
              onConfigChange={handleConfigChange}
              onValidateUrl={validateFeedUrl}
              onRefreshNow={handleRefreshNow}
            />
          </div>
        )}

        {/* API Key Input */}
        {feedConfig.url && !isApiKeyValid && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-yellow-900">OpenRouter API Key Required</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Enter your OpenRouter API key to enable AI analysis of RSS articles.
                </p>
                <div className="mt-3">
                  <input
                    type="password"
                    placeholder="sk-or-v1-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full max-w-md px-3 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-red-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Analysis Error Display */}
        {analysisError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-red-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Analysis Error: {analysisError}</span>
            </div>
          </div>
        )}

        {/* Statistics Bar */}
        {articles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-700">
                {totalJobsAffected > 0 ? totalJobsAffected.toLocaleString() : articles.length}
              </div>
              <div className="text-sm text-red-600">
                {totalJobsAffected > 0 ? 'Jobs Affected' : 'Articles Found'}
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-700">
                {aiRelatedCount}
              </div>
              <div className="text-sm text-blue-600">AI-Related</div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-700">
                {automationRelatedCount}
              </div>
              <div className="text-sm text-purple-600">Automation</div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-700">
                {companiesAffected || articles.filter(a => a.isJobLossRelated).length}
              </div>
              <div className="text-sm text-gray-600">
                {companiesAffected > 0 ? 'Companies' : 'Relevant'}
              </div>
            </div>
          </div>
        )}

        {/* Content Filter Controls */}
        {articles.length > 0 && (
          <div className="mb-6">
            <ContentFilterControls
              showRelevantOnly={showRelevantOnly}
              sortBy={sortBy}
              selectedCount={selectedArticles.length}
              totalCount={articles.length}
              onShowRelevantChange={setShowRelevantOnly}
              onSortByChange={setSortBy}
              onAnalyzeSelected={handleAnalyzeSelected}
              onSelectAll={handleSelectAll}
              isAnalyzing={isAnalyzing}
            />
          </div>
        )}

        {/* Articles List */}
        {articles.length > 0 ? (
          <VirtualizedArticleList
            articles={articles}
            analysisResults={analysisResultsMap}
            selectedArticles={selectedArticles}
            onToggleSelection={handleToggleSelection}
            maxHeight={isExpanded ? 'max-h-96' : 'max-h-48'}
            itemHeight={180}
          />
        ) : feedConfig.url ? (
          <div className="text-center py-8 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="font-medium">No articles found</p>
            <p className="text-sm mt-1">Check your RSS feed URL or try refreshing</p>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </div>
            <p className="font-medium">Configure RSS Feed</p>
            <p className="text-sm mt-1">Click "Configure" to set up your RSS feed source</p>
          </div>
        )}

        {/* Footer */}
        {articles.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                Showing {articles.length} articles
                {selectedArticles.length > 0 && ` (${selectedArticles.length} selected)`}
              </span>
              <span>
                Last updated: {feedStatus.lastUpdated?.toLocaleString() || 'Never'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}