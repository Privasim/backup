'use client';

import React, { useState } from 'react';
import { SalesChannel } from '../types';
import { 
  ChevronDownIcon, 
  ChevronUpIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  StarIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

interface SalesChannelCardProps {
  channel: SalesChannel;
  onToggleComplete?: (channelId: string) => void;
  className?: string;
}

const channelIcons = {
  direct: '🏪',
  retail: '🛍️',
  online: '💻',
  partner: '🤝'
};

const channelColors = {
  direct: 'from-blue-50 to-cyan-50 border-blue-200',
  retail: 'from-green-50 to-emerald-50 border-green-200',
  online: 'from-purple-50 to-violet-50 border-purple-200',
  partner: 'from-orange-50 to-amber-50 border-orange-200'
};

export function SalesChannelCard({ 
  channel, 
  onToggleComplete, 
  className = '' 
}: SalesChannelCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showImplementation, setShowImplementation] = useState(false);

  const channelColor = channelColors[channel.type] || channelColors.direct;
  
  const getSuitabilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  const getSuitabilityLabel = (score: number) => {
    if (score >= 80) return 'Excellent Fit';
    if (score >= 60) return 'Good Fit';
    return 'Moderate Fit';
  };

  return (
    <div className={`bg-gradient-to-br ${channelColor} rounded-xl border p-6 transition-all hover:shadow-md ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">
            {channelIcons[channel.type]}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {channel.name}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs px-2 py-1 bg-white bg-opacity-60 text-gray-700 rounded-full capitalize">
                {channel.type} Channel
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getSuitabilityColor(channel.suitabilityScore)}`}>
            <StarIcon className="w-4 h-4" />
            <span>{channel.suitabilityScore}%</span>
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {getSuitabilityLabel(channel.suitabilityScore)}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-700 mb-4 leading-relaxed">
        {channel.description}
      </p>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <CurrencyDollarIcon className="w-4 h-4 text-gray-500" />
          <div>
            <div className="text-xs text-gray-500">Setup Cost</div>
            <div className="text-sm font-medium text-gray-900">{channel.costStructure.setup}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <ClockIcon className="w-4 h-4 text-gray-500" />
          <div>
            <div className="text-xs text-gray-500">Time to Implement</div>
            <div className="text-sm font-medium text-gray-900">{channel.timeToImplement}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <UserGroupIcon className="w-4 h-4 text-gray-500" />
          <div>
            <div className="text-xs text-gray-500">Expected Reach</div>
            <div className="text-sm font-medium text-gray-900">{channel.expectedReach}</div>
          </div>
        </div>
      </div>

      {/* Cost Structure Details */}
      <div className="bg-white bg-opacity-60 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Cost Structure</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div>
            <span className="text-gray-600">Setup:</span>
            <span className="ml-2 font-medium">{channel.costStructure.setup}</span>
          </div>
          <div>
            <span className="text-gray-600">Monthly:</span>
            <span className="ml-2 font-medium">{channel.costStructure.monthly}</span>
          </div>
          {channel.costStructure.commission && (
            <div>
              <span className="text-gray-600">Commission:</span>
              <span className="ml-2 font-medium">{channel.costStructure.commission}</span>
            </div>
          )}
        </div>
        {channel.costStructure.notes && (
          <div className="mt-2 text-xs text-gray-600">
            <strong>Note:</strong> {channel.costStructure.notes}
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
            {channel.pros.map((pro, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                {pro}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
            <ClockIcon className="w-4 h-4 text-orange-500 mr-1" />
            Considerations
          </h4>
          <ul className="space-y-1">
            {channel.cons.map((con, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                {con}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Implementation Steps */}
      <div className="border-t border-white border-opacity-60 pt-4">
        <button
          onClick={() => setShowImplementation(!showImplementation)}
          className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
        >
          <PlayIcon className="w-4 h-4" />
          <span>Implementation Steps ({channel.implementation.length})</span>
          {showImplementation ? (
            <ChevronUpIcon className="w-4 h-4" />
          ) : (
            <ChevronDownIcon className="w-4 h-4" />
          )}
        </button>

        {showImplementation && (
          <div className="mt-3 space-y-3">
            {channel.implementation.map((step, index) => (
              <div key={step.id || index} className="bg-white bg-opacity-60 rounded-lg p-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-gray-900">{step.title}</h5>
                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-gray-500">
                        ⏱️ {step.estimatedTime}
                      </span>
                      {step.dependencies && step.dependencies.length > 0 && (
                        <span className="text-xs text-gray-500">
                          📋 Depends on: {step.dependencies.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Button */}
      {onToggleComplete && (
        <div className="mt-4 pt-4 border-t border-white border-opacity-60">
          <button
            onClick={() => onToggleComplete(channel.id)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-white bg-opacity-80 text-gray-700 rounded-lg hover:bg-white hover:bg-opacity-100 transition-colors"
          >
            <CheckCircleIcon className="w-4 h-4" />
            <span>Mark as Implemented</span>
          </button>
        </div>
      )}
    </div>
  );
}