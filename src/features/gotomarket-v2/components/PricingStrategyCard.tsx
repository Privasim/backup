'use client';

import React, { useState } from 'react';
import { PricingStrategy } from '../types';
import { CheckCircleIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface PricingStrategyCardProps {
  strategy: PricingStrategy;
  onUpdate: (updates: Partial<PricingStrategy>) => void;
  className?: string;
}

export const PricingStrategyCard: React.FC<PricingStrategyCardProps> = ({
  strategy,
  onUpdate,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleComplete = () => {
    onUpdate({ completed: !strategy.completed });
  };

  const getModelIcon = (model: string) => {
    switch (model) {
      case 'freemium': return '🆓';
      case 'subscription': return '🔄';
      case 'one-time': return '💰';
      case 'tiered': return '📊';
      default: return '💳';
    }
  };

  const getMarketFitColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'basic':
      case 'starter':
      case 'free':
        return 'bg-gray-100 text-gray-700';
      case 'pro':
      case 'professional':
      case 'standard':
        return 'bg-blue-100 text-blue-700';
      case 'enterprise':
      case 'premium':
      case 'business':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 transition-all duration-200 ${
      strategy.completed ? 'bg-green-50 border-green-200' : ''
    } ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1">
          <button
            onClick={handleToggleComplete}
            className={`flex-shrink-0 mt-1 transition-colors ${
              strategy.completed 
                ? 'text-green-600 hover:text-green-700' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <CheckCircleIcon className={`w-5 h-5 ${strategy.completed ? 'fill-current' : ''}`} />
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-lg">{getModelIcon(strategy.model)}</span>
              <h3 className={`text-sm font-medium ${
                strategy.completed ? 'text-green-900 line-through' : 'text-gray-900'
              }`}>
                {strategy.title}
              </h3>
              <span className={`px-2 py-1 text-xs rounded-full ${getMarketFitColor(strategy.marketFit)}`}>
                {strategy.marketFit}/100 fit
              </span>
            </div>
            
            <p className={`text-sm ${
              strategy.completed ? 'text-green-700' : 'text-gray-600'
            }`}>
              {strategy.description}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-shrink-0 ml-2 p-1 text-gray-400 hover:text-gray-600"
        >
          {isExpanded ? (
            <ChevronUpIcon className="w-4 h-4" />
          ) : (
            <ChevronDownIcon className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
        <div>
          <span className="text-gray-500">Model:</span>
          <div className="font-medium text-gray-900 capitalize">{strategy.model}</div>
        </div>
        <div>
          <span className="text-gray-500">Market Fit:</span>
          <div className="font-medium text-gray-900">{strategy.marketFit}/100</div>
        </div>
        <div>
          <span className="text-gray-500">Price Points:</span>
          <div className="font-medium text-gray-900">{strategy.pricePoints.length} tiers</div>
        </div>
      </div>

      {/* Price Points Preview */}
      {strategy.pricePoints.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {strategy.pricePoints.slice(0, 3).map((point, index) => (
            <div key={index} className={`px-2 py-1 text-xs rounded-md ${getTierColor(point.tier)}`}>
              <span className="font-medium">{point.tier}</span>
              <span className="ml-1">{point.price}</span>
            </div>
          ))}
          {strategy.pricePoints.length > 3 && (
            <div className="px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-600">
              +{strategy.pricePoints.length - 3} more
            </div>
          )}
        </div>
      )}

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
          {/* Price Points Detail */}
          {strategy.pricePoints.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Pricing Tiers</h4>
              <div className="space-y-3">
                {strategy.pricePoints.map((point, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-md font-medium ${getTierColor(point.tier)}`}>
                          {point.tier}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">{point.price}</span>
                      </div>
                      <span className="text-xs text-gray-600">{point.targetSegment}</span>
                    </div>
                    
                    {point.features.length > 0 && (
                      <div>
                        <span className="text-xs font-medium text-gray-700">Features:</span>
                        <ul className="mt-1 text-xs text-gray-600 list-disc list-inside">
                          {point.features.map((feature, featureIndex) => (
                            <li key={featureIndex}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Market Fit Analysis */}
          <div className="bg-blue-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Market Fit Analysis ({strategy.marketFit}/100)
            </h4>
            <div className="w-full bg-blue-200 rounded-full h-2 mb-3">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  strategy.marketFit >= 80 ? 'bg-green-500' :
                  strategy.marketFit >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${strategy.marketFit}%` }}
              />
            </div>
            <div className="text-xs text-blue-700">
              {strategy.marketFit >= 80 ? 'Excellent market fit - highly recommended' :
               strategy.marketFit >= 60 ? 'Good market fit - suitable for most scenarios' : 
               'Lower market fit - consider market research'}
            </div>
          </div>

          {/* Competitive Analysis */}
          {strategy.competitiveAnalysis && (
            <div className="bg-purple-50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-purple-900 mb-2">Competitive Analysis</h4>
              <p className="text-sm text-purple-700">{strategy.competitiveAnalysis}</p>
            </div>
          )}

          {/* Model Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-lg p-3">
              <h5 className="text-xs font-medium text-green-900 mb-1">Model Benefits</h5>
              <div className="text-xs text-green-700">
                {strategy.model === 'freemium' && 'Low barrier to entry, viral growth potential'}
                {strategy.model === 'subscription' && 'Predictable revenue, customer retention'}
                {strategy.model === 'one-time' && 'Simple pricing, immediate revenue'}
                {strategy.model === 'tiered' && 'Flexible options, revenue optimization'}
              </div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-3">
              <h5 className="text-xs font-medium text-yellow-900 mb-1">Considerations</h5>
              <div className="text-xs text-yellow-700">
                {strategy.model === 'freemium' && 'Conversion rate optimization needed'}
                {strategy.model === 'subscription' && 'Churn management critical'}
                {strategy.model === 'one-time' && 'Customer lifetime value limited'}
                {strategy.model === 'tiered' && 'Complexity in positioning'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleToggleComplete}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  strategy.completed
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {strategy.completed ? 'Mark Incomplete' : 'Mark Complete'}
              </button>
            </div>
            
            <div className="text-xs text-gray-500">
              {strategy.pricePoints.length} tier{strategy.pricePoints.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};