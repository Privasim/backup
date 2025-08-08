'use client';

import React from 'react';
import { BusinessSuggestion } from '@/components/chatbox/types';
import { 
  StarIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import { useTab } from '@/app/businessidea/tabs/TabContext';

interface SuggestionCardProps {
  suggestion: BusinessSuggestion;
  className?: string;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ 
  suggestion, 
  className = '' 
}) => {
  const { setActiveTab } = useTab();
  const getViabilityColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-blue-600 bg-blue-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  const getViabilityLabel = (score: number) => {
    if (score >= 85) return 'High Viability';
    if (score >= 70) return 'Good Viability';
    return 'Moderate Viability';
  };

  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col w-full ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900 mb-1">
            {suggestion.title}
          </h3>
          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
            {suggestion.category}
          </span>
        </div>
        
        {/* Viability Score */}
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getViabilityColor(suggestion.viabilityScore)}`}>
          <StarIcon className="h-3 w-3" />
          <span>{suggestion.viabilityScore}%</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 flex-grow">
        {suggestion.description}
      </p>

      {/* Key Features */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Key Features</h4>
        <div className="space-y-1">
          {suggestion.keyFeatures.slice(0, 3).map((feature, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
              <CheckCircleIcon className="h-3 w-3 text-green-500 flex-shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 gap-3 mb-4">
        <div className="flex items-center space-x-2 text-sm">
          <UserGroupIcon className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">Target: {suggestion.targetMarket}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">Cost: {suggestion.estimatedStartupCost}</span>
        </div>

        {suggestion.metadata?.timeToMarket && (
          <div className="flex items-center space-x-2 text-sm">
            <ClockIcon className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Timeline: {suggestion.metadata.timeToMarket}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getViabilityColor(suggestion.viabilityScore)}`}>
            {getViabilityLabel(suggestion.viabilityScore)}
          </span>
          
          {suggestion.metadata?.marketSize && (
            <span className="text-xs text-gray-500">
              Market: {suggestion.metadata.marketSize}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-col space-y-2">
        <button
          type="button"
          aria-label="Create Implementation Plan"
          onClick={() => setActiveTab('list')}
          className="w-full inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 px-3 py-2 text-sm font-medium hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all"
        >
          <ClipboardDocumentCheckIcon className="h-4 w-4 mr-2" />
          Create Implementation Plan
        </button>
        <button
          type="button"
          aria-label="Visualize App"
          onClick={() => setActiveTab('mobile')}
          className="w-full inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-3 py-2 text-sm font-medium hover:from-indigo-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
        >
          <DevicePhoneMobileIcon className="h-4 w-4 mr-2" />
          Visualize App
        </button>
      </div>
    </div>
  );
};

export default SuggestionCard;