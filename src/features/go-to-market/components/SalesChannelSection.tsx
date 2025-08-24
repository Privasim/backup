'use client';

import React, { useState } from 'react';
import { SalesChannel } from '../types';
import { SalesChannelCard } from './SalesChannelCard';
import { 
  ShoppingBagIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface SalesChannelSectionProps {
  channels: SalesChannel[];
  onToggleComplete?: (channelId: string) => void;
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
  className?: string;
}

export function SalesChannelSection({
  channels,
  onToggleComplete,
  isLoading = false,
  error,
  onRetry,
  className = ''
}: SalesChannelSectionProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'comparison'>('grid');

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-lg" />
              <div>
                <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-24" />
              </div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-20" />
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
        Failed to Load Sales Channels
      </h3>
      <p className="text-gray-600 mb-4 max-w-md mx-auto">
        {error || 'There was an error generating your sales channel recommendations. Please try again.'}
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
        <ShoppingBagIcon className="w-6 h-6 text-blue-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No Sales Channels Available
      </h3>
      <p className="text-gray-600 max-w-md mx-auto">
        Select a business idea above to generate AI-powered sales channel recommendations.
      </p>
    </div>
  );

  // Comparison view
  const ComparisonView = () => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Channel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Suitability
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Setup Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monthly Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time to Implement
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expected Reach
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {channels.map((channel) => (
              <tr key={channel.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-lg mr-3">
                      {channel.type === 'direct' ? '🏪' : 
                       channel.type === 'retail' ? '🛍️' : 
                       channel.type === 'online' ? '💻' : '🤝'}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{channel.name}</div>
                      <div className="text-sm text-gray-500 capitalize">{channel.type}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      channel.suitabilityScore >= 80 ? 'bg-green-100 text-green-800' :
                      channel.suitabilityScore >= 60 ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {channel.suitabilityScore}%
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {channel.costStructure.setup}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {channel.costStructure.monthly}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {channel.timeToImplement}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {channel.expectedReach}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Calculate stats
  const avgSuitability = channels.length > 0 
    ? Math.round(channels.reduce((sum, c) => sum + c.suitabilityScore, 0) / channels.length)
    : 0;
  
  const bestChannel = channels.length > 0 
    ? channels.reduce((best, current) => 
        current.suitabilityScore > best.suitabilityScore ? current : best
      )
    : null;

  return (
    <div className={className}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <ShoppingBagIcon className="w-6 h-6 mr-2 text-blue-600" />
            Sales Channels
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Recommended distribution channels for your business
          </p>
        </div>

        {channels.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
              title="Grid View"
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('comparison')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'comparison' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
              title="Comparison View"
            >
              <ListBulletIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState />
      ) : channels.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center">
                <ChartBarIcon className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <div className="text-sm text-blue-600">Average Suitability</div>
                  <div className="text-xl font-bold text-blue-900">{avgSuitability}%</div>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center">
                <ShoppingBagIcon className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <div className="text-sm text-green-600">Total Channels</div>
                  <div className="text-xl font-bold text-green-900">{channels.length}</div>
                </div>
              </div>
            </div>
            
            {bestChannel && (
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center">
                  <div className="text-lg mr-2">
                    {bestChannel.type === 'direct' ? '🏪' : 
                     bestChannel.type === 'retail' ? '🛍️' : 
                     bestChannel.type === 'online' ? '💻' : '🤝'}
                  </div>
                  <div>
                    <div className="text-sm text-purple-600">Best Match</div>
                    <div className="text-sm font-bold text-purple-900 truncate">
                      {bestChannel.name}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Channel Content */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {channels.map((channel) => (
                <SalesChannelCard
                  key={channel.id}
                  channel={channel}
                  onToggleComplete={onToggleComplete}
                />
              ))}
            </div>
          ) : (
            <ComparisonView />
          )}

          {/* Recommendations */}
          {channels.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                💡 Channel Recommendations
              </h3>
              
              <div className="space-y-3">
                {bestChannel && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-1">
                      Start with {bestChannel.name}
                    </h4>
                    <p className="text-sm text-green-800">
                      This channel has the highest suitability score ({bestChannel.suitabilityScore}%) 
                      for your business and should be your priority for implementation.
                    </p>
                  </div>
                )}
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-1">
                    Multi-Channel Strategy
                  </h4>
                  <p className="text-sm text-blue-800">
                    Consider implementing 2-3 complementary channels to diversify your sales approach 
                    and reduce dependency on a single channel.
                  </p>
                </div>
                
                {channels.some(c => c.costStructure.setup.includes('$0') || c.costStructure.setup.includes('Free')) && (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-1">
                      Low-Cost Options Available
                    </h4>
                    <p className="text-sm text-purple-800">
                      You have channels with minimal setup costs that can help you test the market 
                      before investing in more expensive options.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}