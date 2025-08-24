'use client';

import React, { useState } from 'react';
import { SalesChannel } from '../types';
import { CheckCircleIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface SalesChannelCardProps {
  channel: SalesChannel;
  onUpdate: (updates: Partial<SalesChannel>) => void;
  className?: string;
}

export const SalesChannelCard: React.FC<SalesChannelCardProps> = ({
  channel,
  onUpdate,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleComplete = () => {
    onUpdate({ completed: !channel.completed });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'direct': return '🤝';
      case 'retail': return '🏪';
      case 'online': return '🌐';
      case 'partner': return '🤝';
      default: return '💼';
    }
  };

  const getSuitabilityColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 transition-all duration-200 ${
      channel.completed ? 'bg-green-50 border-green-200' : ''
    } ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1">
          <button
            onClick={handleToggleComplete}
            className={`flex-shrink-0 mt-1 transition-colors ${
              channel.completed 
                ? 'text-green-600 hover:text-green-700' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <CheckCircleIcon className={`w-5 h-5 ${channel.completed ? 'fill-current' : ''}`} />
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-lg">{getTypeIcon(channel.type)}</span>
              <h3 className={`text-sm font-medium ${
                channel.completed ? 'text-green-900 line-through' : 'text-gray-900'
              }`}>
                {channel.name}
              </h3>
              <span className={`px-2 py-1 text-xs rounded-full ${getSuitabilityColor(channel.suitabilityScore)}`}>
                {channel.suitabilityScore}/100
              </span>
            </div>
            
            <p className={`text-sm ${
              channel.completed ? 'text-green-700' : 'text-gray-600'
            }`}>
              {channel.description}
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
          <span className="text-gray-500">Type:</span>
          <div className="font-medium text-gray-900 capitalize">{channel.type}</div>
        </div>
        <div>
          <span className="text-gray-500">Expected Reach:</span>
          <div className="font-medium text-gray-900">{channel.expectedReach}</div>
        </div>
        <div>
          <span className="text-gray-500">Setup Cost:</span>
          <div className="font-medium text-gray-900">{channel.costStructure.setup}</div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
          {/* Cost Structure */}
          <div className="bg-blue-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Cost Structure</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-blue-700">Setup:</span>
                <div className="font-medium text-blue-900">{channel.costStructure.setup}</div>
              </div>
              <div>
                <span className="text-blue-700">Monthly:</span>
                <div className="font-medium text-blue-900">{channel.costStructure.monthly}</div>
              </div>
              {channel.costStructure.commission && (
                <div>
                  <span className="text-blue-700">Commission:</span>
                  <div className="font-medium text-blue-900">{channel.costStructure.commission}</div>
                </div>
              )}
              {channel.costStructure.notes && (
                <div className="md:col-span-2">
                  <span className="text-blue-700">Notes:</span>
                  <div className="font-medium text-blue-900">{channel.costStructure.notes}</div>
                </div>
              )}
            </div>
          </div>

          {/* Implementation Steps */}
          {channel.implementationSteps.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Implementation Steps</h4>
              <div className="space-y-2">
                {channel.implementationSteps.map((step, index) => (
                  <div key={step.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <h5 className="text-sm font-medium text-gray-900">{step.title}</h5>
                      </div>
                      <span className="text-xs text-gray-600">{step.estimatedTime}</span>
                    </div>
                    <p className="text-sm text-gray-600 ml-8">{step.description}</p>
                    {step.dependencies && step.dependencies.length > 0 && (
                      <div className="ml-8 mt-2">
                        <span className="text-xs text-gray-500">Dependencies: </span>
                        <span className="text-xs text-gray-600">{step.dependencies.join(', ')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suitability Analysis */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Suitability Analysis ({channel.suitabilityScore}/100)
            </h4>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  channel.suitabilityScore >= 80 ? 'bg-green-500' :
                  channel.suitabilityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${channel.suitabilityScore}%` }}
              />
            </div>
            <div className="text-xs text-gray-600">
              {channel.suitabilityScore >= 80 ? 'Highly suitable for your business' :
               channel.suitabilityScore >= 60 ? 'Moderately suitable' : 'May require additional consideration'}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleToggleComplete}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  channel.completed
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {channel.completed ? 'Mark Incomplete' : 'Mark Complete'}
              </button>
            </div>
            
            <div className="text-xs text-gray-500">
              {channel.implementationSteps.length} step{channel.implementationSteps.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};