'use client';

import React, { useState } from 'react';
import { PricingStrategy } from '../types';
import { PricingStrategyCard } from './PricingStrategyCard';
import { 
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  CalculatorIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface PricingStrategySectionProps {
  strategies: PricingStrategy[];
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
  className?: string;
}

export function PricingStrategySection({
  strategies,
  isLoading = false,
  error,
  onRetry,
  className = ''
}: PricingStrategySectionProps) {
  const [showCalculator, setShowCalculator] = useState(false);

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
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-gray-200 rounded" />
            <div className="h-20 bg-gray-200 rounded" />
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
        Failed to Load Pricing Strategies
      </h3>
      <p className="text-gray-600 mb-4 max-w-md mx-auto">
        {error || 'There was an error generating your pricing strategies. Please try again.'}
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
        <CurrencyDollarIcon className="w-6 h-6 text-blue-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No Pricing Strategies Available
      </h3>
      <p className="text-gray-600 max-w-md mx-auto">
        Select a business idea above to generate AI-powered pricing strategy recommendations.
      </p>
    </div>
  );

  // Simple pricing calculator
  const PricingCalculator = () => {
    const [monthlyUsers, setMonthlyUsers] = useState(1000);
    const [avgRevenuePerUser, setAvgRevenuePerUser] = useState(10);
    const [churnRate, setChurnRate] = useState(5);

    const monthlyRevenue = monthlyUsers * avgRevenuePerUser;
    const annualRevenue = monthlyRevenue * 12;
    const customerLifetime = churnRate > 0 ? 1 / (churnRate / 100) : 0;
    const lifetimeValue = avgRevenuePerUser * customerLifetime;

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <CalculatorIcon className="w-5 h-5 mr-2" />
            Pricing Calculator
          </h3>
          <button
            onClick={() => setShowCalculator(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Users
              </label>
              <input
                type="number"
                value={monthlyUsers}
                onChange={(e) => setMonthlyUsers(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Average Revenue Per User ($)
              </label>
              <input
                type="number"
                value={avgRevenuePerUser}
                onChange={(e) => setAvgRevenuePerUser(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Churn Rate (%)
              </label>
              <input
                type="number"
                value={churnRate}
                onChange={(e) => setChurnRate(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-600">Monthly Revenue</div>
              <div className="text-2xl font-bold text-blue-900">
                ${monthlyRevenue.toLocaleString()}
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-600">Annual Revenue</div>
              <div className="text-2xl font-bold text-green-900">
                ${annualRevenue.toLocaleString()}
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-purple-600">Customer Lifetime Value</div>
              <div className="text-2xl font-bold text-purple-900">
                ${lifetimeValue.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">💡 Insights</h4>
          <div className="text-sm text-gray-700 space-y-1">
            {lifetimeValue > avgRevenuePerUser * 10 && (
              <p>• Strong customer lifetime value suggests subscription model viability</p>
            )}
            {churnRate > 10 && (
              <p>• High churn rate - consider improving retention or one-time pricing</p>
            )}
            {monthlyRevenue > 50000 && (
              <p>• Strong revenue potential - consider premium tiers or enterprise pricing</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Calculate stats
  const avgMarketFit = strategies.length > 0 
    ? Math.round(strategies.reduce((sum, s) => sum + s.marketFit, 0) / strategies.length)
    : 0;
  
  const bestStrategy = strategies.length > 0 
    ? strategies.reduce((best, current) => 
        current.marketFit > best.marketFit ? current : best
      )
    : null;

  const modelDistribution = strategies.reduce((acc, strategy) => {
    acc[strategy.model] = (acc[strategy.model] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className={className}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <CurrencyDollarIcon className="w-6 h-6 mr-2 text-blue-600" />
            Pricing Strategies
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            AI-generated pricing models tailored to your business
          </p>
        </div>

        {strategies.length > 0 && !showCalculator && (
          <button
            onClick={() => setShowCalculator(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <CalculatorIcon className="w-4 h-4 mr-2" />
            Pricing Calculator
          </button>
        )}
      </div>

      {/* Pricing Calculator */}
      {showCalculator && (
        <div className="mb-6">
          <PricingCalculator />
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState />
      ) : strategies.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center">
                <ChartBarIcon className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <div className="text-sm text-blue-600">Avg Market Fit</div>
                  <div className="text-xl font-bold text-blue-900">{avgMarketFit}%</div>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center">
                <CurrencyDollarIcon className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <div className="text-sm text-green-600">Total Models</div>
                  <div className="text-xl font-bold text-green-900">{strategies.length}</div>
                </div>
              </div>
            </div>
            
            {bestStrategy && (
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center">
                  <div className="text-lg mr-2">
                    {bestStrategy.model === 'freemium' ? '🆓' : 
                     bestStrategy.model === 'subscription' ? '🔄' : 
                     bestStrategy.model === 'one-time' ? '💰' : 
                     bestStrategy.model === 'tiered' ? '📊' : '📈'}
                  </div>
                  <div>
                    <div className="text-sm text-purple-600">Best Fit</div>
                    <div className="text-sm font-bold text-purple-900 capitalize">
                      {bestStrategy.model.replace('-', ' ')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center">
                <div className="text-lg mr-2">📊</div>
                <div>
                  <div className="text-sm text-orange-600">Most Common</div>
                  <div className="text-sm font-bold text-orange-900 capitalize">
                    {Object.entries(modelDistribution).sort(([,a], [,b]) => b - a)[0]?.[0]?.replace('-', ' ') || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Strategy Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {strategies.map((strategy) => (
              <PricingStrategyCard
                key={strategy.id}
                strategy={strategy}
              />
            ))}
          </div>

          {/* Pricing Recommendations */}
          {strategies.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                💰 Pricing Recommendations
              </h3>
              
              <div className="space-y-3">
                {bestStrategy && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-1">
                      Recommended: {bestStrategy.title}
                    </h4>
                    <p className="text-sm text-green-800">
                      This pricing model has the highest market fit score ({bestStrategy.marketFit}%) 
                      and aligns well with your business type and target market.
                    </p>
                  </div>
                )}
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-1">
                    Testing Strategy
                  </h4>
                  <p className="text-sm text-blue-800">
                    Consider A/B testing different pricing models with small customer segments 
                    to validate assumptions before full implementation.
                  </p>
                </div>
                
                {strategies.some(s => s.model === 'freemium') && (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-1">
                      Freemium Considerations
                    </h4>
                    <p className="text-sm text-purple-800">
                      If implementing freemium, ensure your free tier provides real value 
                      while creating clear incentives to upgrade to paid plans.
                    </p>
                  </div>
                )}
                
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-1">
                    Pricing Psychology
                  </h4>
                  <p className="text-sm text-yellow-800">
                    Consider psychological pricing principles like charm pricing ($9.99 vs $10) 
                    and anchoring effects when setting your final prices.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}