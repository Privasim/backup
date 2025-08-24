'use client';

import React, { useState } from 'react';
import { PricingStrategy } from '../types';
import { 
  ChevronDownIcon, 
  ChevronUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  StarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface PricingStrategyCardProps {
  strategy: PricingStrategy;
  className?: string;
}

const modelIcons = {
  freemium: '🆓',
  subscription: '🔄',
  'one-time': '💰',
  tiered: '📊',
  'usage-based': '📈'
};

const modelColors = {
  freemium: 'from-green-50 to-emerald-50 border-green-200',
  subscription: 'from-blue-50 to-cyan-50 border-blue-200',
  'one-time': 'from-purple-50 to-violet-50 border-purple-200',
  tiered: 'from-orange-50 to-amber-50 border-orange-200',
  'usage-based': 'from-pink-50 to-rose-50 border-pink-200'
};

export function PricingStrategyCard({ 
  strategy, 
  className = '' 
}: PricingStrategyCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPricePoints, setShowPricePoints] = useState(false);

  const modelColor = modelColors[strategy.model] || modelColors.tiered;
  
  const getMarketFitColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  const getMarketFitLabel = (score: number) => {
    if (score >= 80) return 'Excellent Fit';
    if (score >= 60) return 'Good Fit';
    return 'Moderate Fit';
  };

  return (
    <div className={`bg-gradient-to-br ${modelColor} rounded-xl border p-6 transition-all hover:shadow-md ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">
            {modelIcons[strategy.model]}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {strategy.title}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs px-2 py-1 bg-white bg-opacity-60 text-gray-700 rounded-full capitalize">
                {strategy.model.replace('-', ' ')} Model
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getMarketFitColor(strategy.marketFit)}`}>
            <StarIcon className="w-4 h-4" />
            <span>{strategy.marketFit}%</span>
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {getMarketFitLabel(strategy.marketFit)}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-700 mb-4 leading-relaxed">
        {strategy.description}
      </p>

      {/* Competitive Position */}
      <div className="bg-white bg-opacity-60 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
          <ChartBarIcon className="w-4 h-4 mr-1" />
          Market Position
        </h4>
        <p className="text-sm text-gray-700">{strategy.competitivePosition}</p>
      </div>

      {/* Price Points */}
      <div className="mb-4">
        <button
          onClick={() => setShowPricePoints(!showPricePoints)}
          className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors mb-3"
        >
          <CurrencyDollarIcon className="w-4 h-4" />
          <span>Price Points ({strategy.pricePoints.length})</span>
          {showPricePoints ? (
            <ChevronUpIcon className="w-4 h-4" />
          ) : (
            <ChevronDownIcon className="w-4 h-4" />
          )}
        </button>

        {showPricePoints && (
          <div className="space-y-3">
            {strategy.pricePoints.map((point, index) => (
              <div key={index} className="bg-white bg-opacity-60 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-medium text-gray-900">{point.tier}</h5>
                  <span className="text-lg font-bold text-gray-900">{point.price}</span>
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  <UserGroupIcon className="w-3 h-3 inline mr-1" />
                  Target: {point.targetSegment}
                </div>
                <div className="space-y-1">
                  {point.features.map((feature, fIndex) => (
                    <div key={fIndex} className="text-xs text-gray-700 flex items-start">
                      <CheckCircleIcon className="w-3 h-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pros and Cons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
            <CheckCircleIcon className="w-4 h-4 text-green-500 mr-1" />
            Advantages
          </h4>
          <ul className="space-y-1">
            {strategy.pros.map((pro, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                {pro}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
            <XCircleIcon className="w-4 h-4 text-red-500 mr-1" />
            Challenges
          </h4>
          <ul className="space-y-1">
            {strategy.cons.map((con, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                {con}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommended For */}
      {strategy.recommendedFor && strategy.recommendedFor.length > 0 && (
        <div className="bg-white bg-opacity-60 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            💡 Best For
          </h4>
          <div className="flex flex-wrap gap-2">
            {strategy.recommendedFor.map((recommendation, index) => (
              <span 
                key={index}
                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full"
              >
                {recommendation}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Expand/Collapse for additional details */}
      <div className="mt-4 pt-4 border-t border-white border-opacity-60">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUpIcon className="w-4 h-4" />
              <span>Show Less Details</span>
            </>
          ) : (
            <>
              <ChevronDownIcon className="w-4 h-4" />
              <span>Show More Details</span>
            </>
          )}
        </button>

        {isExpanded && (
          <div className="mt-3 space-y-3">
            <div className="bg-white bg-opacity-60 rounded-lg p-3">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Implementation Tips</h5>
              <div className="text-sm text-gray-700 space-y-1">
                {strategy.model === 'freemium' && (
                  <p>• Focus on creating clear value differentiation between free and paid tiers</p>
                )}
                {strategy.model === 'subscription' && (
                  <p>• Ensure strong customer retention and continuous value delivery</p>
                )}
                {strategy.model === 'tiered' && (
                  <p>• Design tiers to encourage natural progression and upselling</p>
                )}
                {strategy.model === 'one-time' && (
                  <p>• Consider add-ons or complementary products for recurring revenue</p>
                )}
                {strategy.model === 'usage-based' && (
                  <p>• Implement clear usage tracking and transparent billing</p>
                )}
              </div>
            </div>

            <div className="bg-white bg-opacity-60 rounded-lg p-3">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Success Metrics</h5>
              <div className="text-sm text-gray-700 space-y-1">
                <p>• Customer Acquisition Cost (CAC)</p>
                <p>• Customer Lifetime Value (CLV)</p>
                <p>• Conversion rates between tiers</p>
                <p>• Monthly/Annual Recurring Revenue</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}