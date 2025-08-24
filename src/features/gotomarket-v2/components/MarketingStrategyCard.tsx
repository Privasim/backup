'use client';

import React, { useState } from 'react';
import { MarketingStrategy } from '../types';
import { CheckCircleIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface MarketingStrategyCardProps {
  strategy: MarketingStrategy;
  onUpdate: (updates: Partial<MarketingStrategy>) => void;
  className?: string;
}

export const MarketingStrategyCard: React.FC<MarketingStrategyCardProps> = ({
  strategy,
  onUpdate,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleComplete = () => {
    onUpdate({ completed: !strategy.completed });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'low': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'high': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'digital': return '💻';
      case 'content': return '📝';
      case 'social': return '📱';
      case 'traditional': return '📺';
      default: return '📊';
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
              <span className="text-lg">{getTypeIcon(strategy.type)}</span>
              <h3 className={`text-sm font-medium ${
                strategy.completed ? 'text-green-900 line-through' : 'text-gray-900'
              }`}>
                {strategy.title}
              </h3>
              <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(strategy.difficulty)}`}>
                {strategy.difficulty}
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-gray-500">Timeline:</span>
          <div className="font-medium text-gray-900">{strategy.timeline}</div>
        </div>
        <div>
          <span className="text-gray-500">Budget:</span>
          <div className="font-medium text-gray-900">
            {strategy.budget.min} - {strategy.budget.max}
          </div>
        </div>
        <div>
          <span className="text-gray-500">Expected ROI:</span>
          <div className="font-medium text-gray-900">{strategy.expectedROI}</div>
        </div>
        <div>
          <span className="text-gray-500">Type:</span>
          <div className="font-medium text-gray-900 capitalize">{strategy.type}</div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
          {/* Tactics */}
          {strategy.tactics.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Marketing Tactics</h4>
              <div className="space-y-2">
                {strategy.tactics.map(tactic => (
                  <div key={tactic.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="text-sm font-medium text-gray-900">{tactic.name}</h5>
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <span>{tactic.estimatedCost}</span>
                        <span>•</span>
                        <span>{tactic.timeframe}</span>
                        <span className={`px-2 py-1 rounded-full ${getDifficultyColor(tactic.difficulty)}`}>
                          {tactic.difficulty}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{tactic.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Budget Breakdown */}
          <div className="bg-blue-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Budget Details</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Minimum:</span>
                <div className="font-medium text-blue-900">{strategy.budget.min}</div>
              </div>
              <div>
                <span className="text-blue-700">Maximum:</span>
                <div className="font-medium text-blue-900">{strategy.budget.max}</div>
              </div>
              <div>
                <span className="text-blue-700">Currency:</span>
                <div className="font-medium text-blue-900">{strategy.budget.currency}</div>
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
              {strategy.tactics.length} tactic{strategy.tactics.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};