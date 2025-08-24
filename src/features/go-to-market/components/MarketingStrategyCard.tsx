'use client';

import React, { useState } from 'react';
import { MarketingStrategy } from '../types';
import { 
  ChevronDownIcon, 
  ChevronUpIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

interface MarketingStrategyCardProps {
  strategy: MarketingStrategy;
  onToggleComplete: (strategyId: string) => void;
  className?: string;
}

const strategyIcons = {
  digital: '💻',
  content: '📝',
  partnership: '🤝',
  traditional: '📺'
};

const strategyColors = {
  digital: 'from-blue-50 to-indigo-50 border-blue-200',
  content: 'from-green-50 to-emerald-50 border-green-200',
  partnership: 'from-purple-50 to-violet-50 border-purple-200',
  traditional: 'from-orange-50 to-amber-50 border-orange-200'
};

const difficultyColors = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700'
};

export function MarketingStrategyCard({ 
  strategy, 
  onToggleComplete, 
  className = '' 
}: MarketingStrategyCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleComplete = () => {
    onToggleComplete(strategy.id);
  };

  const strategyColor = strategyColors[strategy.type] || strategyColors.digital;
  const difficultyColor = difficultyColors[strategy.difficulty] || difficultyColors.medium;

  return (
    <div className={`bg-gradient-to-br ${strategyColor} rounded-xl border p-6 transition-all hover:shadow-md ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">
            {strategyIcons[strategy.type]}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {strategy.title}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${difficultyColor}`}>
                {strategy.difficulty} difficulty
              </span>
              <span className="text-xs px-2 py-1 bg-white bg-opacity-60 text-gray-700 rounded-full">
                Priority: {strategy.priority}/10
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleToggleComplete}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
            strategy.completed
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-white bg-opacity-60 text-gray-700 hover:bg-white hover:bg-opacity-80'
          }`}
        >
          <CheckCircleIcon className={`w-4 h-4 ${strategy.completed ? 'text-green-600' : 'text-gray-400'}`} />
          <span className="text-sm font-medium">
            {strategy.completed ? 'Completed' : 'Mark Complete'}
          </span>
        </button>
      </div>

      {/* Description */}
      <p className="text-gray-700 mb-4 leading-relaxed">
        {strategy.description}
      </p>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <CurrencyDollarIcon className="w-4 h-4 text-gray-500" />
          <div>
            <div className="text-xs text-gray-500">Estimated Cost</div>
            <div className="text-sm font-medium text-gray-900">{strategy.estimatedCost}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <ClockIcon className="w-4 h-4 text-gray-500" />
          <div>
            <div className="text-xs text-gray-500">Timeframe</div>
            <div className="text-sm font-medium text-gray-900">{strategy.timeframe}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <ChartBarIcon className="w-4 h-4 text-gray-500" />
          <div>
            <div className="text-xs text-gray-500">Expected ROI</div>
            <div className="text-sm font-medium text-gray-900">{strategy.expectedROI}</div>
          </div>
        </div>
      </div>

      {/* Tactics Preview */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-900 mb-2">
          Key Tactics ({strategy.tactics.length})
        </div>
        <div className="space-y-2">
          {strategy.tactics.slice(0, isExpanded ? undefined : 2).map((tactic, index) => (
            <div key={tactic.id || index} className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">{tactic.name}</div>
                <div className="text-xs text-gray-600">{tactic.description}</div>
                {isExpanded && (
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-gray-500">
                      Cost: {tactic.estimatedCost}
                    </span>
                    <span className="text-xs text-gray-500">
                      Timeline: {tactic.timeframe}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${difficultyColors[tactic.difficulty]}`}>
                      {tactic.difficulty}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expand/Collapse Button */}
      {strategy.tactics.length > 2 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUpIcon className="w-4 h-4" />
              <span>Show Less</span>
            </>
          ) : (
            <>
              <ChevronDownIcon className="w-4 h-4" />
              <span>Show {strategy.tactics.length - 2} More Tactics</span>
            </>
          )}
        </button>
      )}

      {/* Progress Indicator */}
      {strategy.completed && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Strategy completed! Great work on implementing this marketing approach.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}