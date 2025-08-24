'use client';

import React from 'react';
import { MarketingStrategy } from '../types';
import { MarketingStrategyCard } from './MarketingStrategyCard';
import { 
  ChartBarIcon,
  ExclamationTriangleIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline';

interface MarketingStrategySectionProps {
  strategies: MarketingStrategy[];
  onToggleComplete: (strategyId: string) => void;
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
  className?: string;
}

export function MarketingStrategySection({
  strategies,
  onToggleComplete,
  isLoading = false,
  error,
  onRetry,
  className = ''
}: MarketingStrategySectionProps) {
  
  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-lg" />
              <div>
                <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-24" />
              </div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-24" />
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-12 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );

  // Error state
  const ErrorState = () => (
    <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
      <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
        <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Failed to Load Marketing Strategies
      </h3>
      <p className="text-gray-600 mb-4 max-w-md mx-auto">
        {error || 'There was an error generating your marketing strategies. Please try again.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <SparklesIcon className="w-4 h-4 mr-2" />
          Retry Generation
        </button>
      )}
    </div>
  );

  // Empty state
  const EmptyState = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
      <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
        <ChartBarIcon className="w-6 h-6 text-blue-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No Marketing Strategies Available
      </h3>
      <p className="text-gray-600 max-w-md mx-auto">
        Select a business idea above to generate AI-powered marketing strategies tailored to your business.
      </p>
    </div>
  );

  // Calculate progress
  const completedStrategies = strategies.filter(s => s.completed).length;
  const progressPercentage = strategies.length > 0 ? Math.round((completedStrategies / strategies.length) * 100) : 0;

  return (
    <div className={className}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <ChartBarIcon className="w-6 h-6 mr-2 text-blue-600" />
            Marketing Strategies
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            AI-generated marketing approaches tailored to your business
          </p>
        </div>

        {strategies.length > 0 && (
          <div className="text-right">
            <div className="text-sm text-gray-600">Progress</div>
            <div className="flex items-center space-x-2">
              <div className="text-lg font-semibold text-gray-900">
                {completedStrategies}/{strategies.length}
              </div>
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="text-sm text-gray-600">
                {progressPercentage}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState />
      ) : strategies.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-6">
          {/* Strategy Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {strategies.map((strategy) => (
              <MarketingStrategyCard
                key={strategy.id}
                strategy={strategy}
                onToggleComplete={onToggleComplete}
              />
            ))}
          </div>

          {/* Summary Stats */}
          {strategies.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Strategy Overview
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {strategies.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Strategies</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {completedStrategies}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {strategies.filter(s => s.difficulty === 'high').length}
                  </div>
                  <div className="text-sm text-gray-600">High Priority</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(strategies.reduce((sum, s) => sum + s.priority, 0) / strategies.length)}
                  </div>
                  <div className="text-sm text-gray-600">Avg Priority</div>
                </div>
              </div>

              {/* Next Steps */}
              {completedStrategies < strategies.length && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Next Steps</h4>
                  <div className="text-sm text-blue-800">
                    {completedStrategies === 0 ? (
                      "Start by implementing your highest priority strategy to build momentum."
                    ) : completedStrategies === 1 ? (
                      "Great progress! Consider implementing a complementary strategy next."
                    ) : (
                      `You're ${progressPercentage}% complete. Keep up the excellent work!`
                    )}
                  </div>
                </div>
              )}

              {/* All Complete */}
              {completedStrategies === strategies.length && strategies.length > 0 && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">🎉 All Strategies Complete!</h4>
                  <div className="text-sm text-green-800">
                    Excellent work! You've implemented all your marketing strategies. 
                    Consider reviewing performance and optimizing based on results.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}