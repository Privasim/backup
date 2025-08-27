'use client';

import React, { useState } from 'react';
import { 
  GoToMarketSettings, 
  DEFAULT_SETTINGS, 
  DetailLevel, 
  PricingModel, 
  SalesApproach,
  DistributionChannels
} from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GoToMarketSettings;
  onSave: (settings: GoToMarketSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave
}) => {
  const [localSettings, setLocalSettings] = useState<GoToMarketSettings>({...settings});
  
  if (!isOpen) return null;
  
  const handleDetailLevelChange = (level: DetailLevel) => {
    setLocalSettings(prev => ({
      ...prev,
      detailLevel: level
    }));
  };
  
  const handleDistributionChannelToggle = (channel: keyof DistributionChannels) => {
    setLocalSettings(prev => ({
      ...prev,
      distributionChannels: {
        ...prev.distributionChannels,
        [channel]: !prev.distributionChannels[channel]
      }
    }));
  };
  
  const handlePricingModelChange = (model: PricingModel) => {
    setLocalSettings(prev => ({
      ...prev,
      pricingModel: model
    }));
  };
  
  const handleSalesApproachChange = (approach: SalesApproach) => {
    setLocalSettings(prev => ({
      ...prev,
      salesApproach: approach
    }));
  };
  
  const handleTimelineToggle = () => {
    setLocalSettings(prev => ({
      ...prev,
      includeTimeline: !prev.includeTimeline
    }));
  };
  
  const handleReset = () => {
    setLocalSettings({...DEFAULT_SETTINGS});
  };
  
  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };
  
  // Detail level descriptions
  const detailLevelDescriptions = {
    1: "Brief overview with essential points only",
    2: "Concise strategy with key elements",
    3: "Standard level of detail for most businesses",
    4: "Detailed strategy with specific recommendations",
    5: "Comprehensive analysis with in-depth explanations"
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      
      {/* Modal */}
      <div className="flex min-h-full items-end justify-center p-2 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-4 sm:w-full sm:max-w-md w-full">
          {/* Header */}
          <div className="bg-white px-4 py-3 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
            <h3 className="text-base font-semibold text-gray-900" id="modal-title">
              Go-to-Market Settings
            </h3>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={onClose}
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Body */}
          <div className="px-4 py-4 space-y-5 max-h-[60vh] overflow-y-auto">
            {/* Detail Level */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">
                  Detail Level
                </label>
                <span className="text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full px-2 py-1">
                  {localSettings.detailLevel}/5
                </span>
              </div>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => handleDetailLevelChange(level as DetailLevel)}
                    className={`flex-1 py-2 text-xs font-medium rounded transition-colors ${
                      localSettings.detailLevel === level
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                {detailLevelDescriptions[localSettings.detailLevel as keyof typeof detailLevelDescriptions]}
              </p>
            </div>
            
            {/* Distribution Channels */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Distribution Channels
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(localSettings.distributionChannels).map(([channel, enabled]) => {
                  const channelLabels: Record<string, string> = {
                    'socialMedia': 'Social Media',
                    'reddit': 'Reddit',
                    'email': 'Email',
                    'partnerships': 'Partnerships',
                    'events': 'Events'
                  };
                  
                  return (
                    <div 
                      key={channel}
                      onClick={() => handleDistributionChannelToggle(channel as keyof DistributionChannels)}
                      className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
                        enabled 
                          ? 'bg-indigo-50 border border-indigo-200' 
                          : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center mr-2 ${
                        enabled 
                          ? 'bg-indigo-600 border-indigo-600' 
                          : 'bg-white border-gray-300'
                      }`}>
                        {enabled && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-xs text-gray-700">{channelLabels[channel]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Pricing Model */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Pricing Model
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['freemium', 'subscription', 'one-time'] as PricingModel[]).map((model) => (
                  <button
                    key={model}
                    onClick={() => handlePricingModelChange(model)}
                    className={`py-2 text-xs font-medium rounded transition-colors capitalize ${
                      localSettings.pricingModel === model
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {model}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Sales Approach */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Sales Approach
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['self-service', 'assisted', 'enterprise'] as SalesApproach[]).map((approach) => (
                  <button
                    key={approach}
                    onClick={() => handleSalesApproachChange(approach)}
                    className={`py-2 text-xs font-medium rounded transition-colors capitalize ${
                      localSettings.salesApproach === approach
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {approach}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Include Timeline */}
            <div 
              onClick={handleTimelineToggle}
              className="flex items-center p-3 rounded-lg bg-gray-50 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 ${
                localSettings.includeTimeline 
                  ? 'bg-indigo-600 border-indigo-600' 
                  : 'bg-white border-gray-300'
              }`}>
                {localSettings.includeTimeline && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-gray-700">Include Launch Timeline</span>
            </div>
          </div>
          
          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 flex flex-col sm:flex-row justify-between gap-2 sticky bottom-0 z-10 border-t border-gray-200">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-medium text-gray-700 hover:text-gray-900 py-2 px-3 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-medium text-gray-700 hover:text-gray-900 py-2 px-4 rounded border border-gray-300 hover:bg-gray-50 transition-colors flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="text-xs font-medium text-white py-2 px-4 rounded bg-indigo-600 hover:bg-indigo-700 transition-colors flex-1"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
