'use client';

import React from 'react';
import { FeedConfig, FeedStatus } from '@/lib/rss/types';
import RSSUrlInput from './RSSUrlInput';
import RefreshIntervalSelector from './RefreshIntervalSelector';
import FeedStatusIndicator from './FeedStatusIndicator';

interface FeedConfigurationPanelProps {
  config: FeedConfig;
  status: FeedStatus;
  isLoading?: boolean;
  error?: string | null;
  onConfigChange: (config: Partial<FeedConfig>) => void;
  onValidateUrl: (url: string) => Promise<boolean>;
  onRefreshNow: () => void;
  className?: string;
}

export default function FeedConfigurationPanel({
  config,
  status,
  isLoading = false,
  error = null,
  onConfigChange,
  onValidateUrl,
  onRefreshNow,
  className = ''
}: FeedConfigurationPanelProps) {
  const handleUrlChange = (url: string) => {
    onConfigChange({ url });
  };

  const handleRefreshIntervalChange = (refreshInterval: number) => {
    onConfigChange({ refreshInterval });
  };

  const handleMaxArticlesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onConfigChange({ maxArticles: parseInt(e.target.value, 10) });
  };

  const handleFilterRelevantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onConfigChange({ filterRelevant: e.target.checked });
  };

  const handleAutoAnalyzeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onConfigChange({ autoAnalyze: e.target.checked });
  };

  const maxArticlesOptions = [25, 50, 100, 200, 500];

  return (
    <div className={`feed-configuration-panel bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">RSS Feed Configuration</h3>
          <p className="text-sm text-gray-600 mt-1">
            Configure your RSS feed source for job loss tracking
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <FeedStatusIndicator status={status} />
          
          {config.url && (
            <button
              onClick={onRefreshNow}
              disabled={isLoading}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Refreshing...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh Now</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* RSS URL Input */}
        <RSSUrlInput
          value={config.url}
          onChange={handleUrlChange}
          onValidate={onValidateUrl}
          isLoading={isLoading}
          error={error}
        />

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Refresh Interval */}
          <RefreshIntervalSelector
            value={config.refreshInterval}
            onChange={handleRefreshIntervalChange}
          />

          {/* Max Articles */}
          <div className="flex flex-col space-y-2">
            <label htmlFor="max-articles" className="text-sm font-medium text-gray-700">
              Maximum Articles
            </label>
            <select
              id="max-articles"
              value={config.maxArticles}
              onChange={handleMaxArticlesChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {maxArticlesOptions.map(option => (
                <option key={option} value={option}>
                  {option} articles
                </option>
              ))}
            </select>
            <div className="text-xs text-gray-500">
              Limit the number of articles to process from the RSS feed
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Processing Options</h4>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={config.filterRelevant}
                onChange={handleFilterRelevantChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Filter job loss content</span>
                <p className="text-xs text-gray-500">
                  Only show articles related to job losses, layoffs, and automation
                </p>
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={config.autoAnalyze}
                onChange={handleAutoAnalyzeChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Auto-analyze relevant articles</span>
                <p className="text-xs text-gray-500">
                  Automatically run AI analysis on filtered articles (requires API key)
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Feed Info */}
        {config.url && status.status === 'healthy' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h5 className="text-sm font-medium text-blue-900">Feed Configuration Active</h5>
                <p className="text-sm text-blue-700 mt-1">
                  Your RSS feed is configured and will refresh every {config.refreshInterval} minutes.
                  {config.filterRelevant && ' Content filtering is enabled.'}
                  {config.autoAnalyze && ' Auto-analysis is enabled.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}