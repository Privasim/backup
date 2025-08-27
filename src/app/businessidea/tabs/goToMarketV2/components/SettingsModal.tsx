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
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-opacity"></div>
      
      {/* Modal */}
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          {/* Header */}
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white" id="modal-title">
              Go-to-Market Strategy Settings
            </h3>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={onClose}
              aria-label="Close"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Body */}
          <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Detail Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Detail Level
              </label>
              <div className="w-full">
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={localSettings.detailLevel}
                  onChange={(e) => handleDetailLevelChange(parseInt(e.target.value) as DetailLevel)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                  <span>Brief</span>
                  <span>Standard</span>
                  <span>Comprehensive</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {localSettings.detailLevel === 1 && "Brief overview with essential points only"}
                {localSettings.detailLevel === 2 && "Concise strategy with key elements"}
                {localSettings.detailLevel === 3 && "Standard level of detail for most businesses"}
                {localSettings.detailLevel === 4 && "Detailed strategy with specific recommendations"}
                {localSettings.detailLevel === 5 && "Comprehensive analysis with in-depth explanations"}
              </p>
            </div>
            
            {/* Distribution Channels */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Distribution Channels
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center">
                  <input
                    id="channel-social"
                    name="channel-social"
                    type="checkbox"
                    checked={localSettings.distributionChannels.socialMedia}
                    onChange={() => handleDistributionChannelToggle('socialMedia')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="channel-social" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    Social Media
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="channel-reddit"
                    name="channel-reddit"
                    type="checkbox"
                    checked={localSettings.distributionChannels.reddit}
                    onChange={() => handleDistributionChannelToggle('reddit')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="channel-reddit" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    Reddit
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="channel-email"
                    name="channel-email"
                    type="checkbox"
                    checked={localSettings.distributionChannels.email}
                    onChange={() => handleDistributionChannelToggle('email')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="channel-email" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    Email
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="channel-partnerships"
                    name="channel-partnerships"
                    type="checkbox"
                    checked={localSettings.distributionChannels.partnerships}
                    onChange={() => handleDistributionChannelToggle('partnerships')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="channel-partnerships" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    Partnerships
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="channel-events"
                    name="channel-events"
                    type="checkbox"
                    checked={localSettings.distributionChannels.events}
                    onChange={() => handleDistributionChannelToggle('events')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="channel-events" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    Events
                  </label>
                </div>
              </div>
            </div>
            
            {/* Pricing Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pricing Model
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['freemium', 'subscription', 'one-time'] as PricingModel[]).map((model) => (
                  <div
                    key={model}
                    onClick={() => handlePricingModelChange(model)}
                    className={`
                      flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer
                      ${localSettings.pricingModel === model
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-2 ring-indigo-200 dark:ring-indigo-900'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }
                    `}
                  >
                    <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {model}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Sales Approach */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sales Approach
              </label>
              <select
                value={localSettings.salesApproach}
                onChange={(e) => handleSalesApproachChange(e.target.value as SalesApproach)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="self-service">Self-service</option>
                <option value="assisted">Assisted</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            
            {/* Include Timeline */}
            <div className="flex items-center">
              <input
                id="include-timeline"
                name="include-timeline"
                type="checkbox"
                checked={localSettings.includeTimeline}
                onChange={handleTimelineToggle}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="include-timeline" className="ml-2 block text-sm text-gray-900 dark:text-white">
                Include Launch Timeline
              </label>
            </div>
          </div>
          
          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 flex flex-wrap justify-between gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Reset to Defaults
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
