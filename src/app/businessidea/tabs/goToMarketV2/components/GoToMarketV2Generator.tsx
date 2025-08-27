'use client';

import React, { useEffect, useState } from 'react';
import { useGoToMarketV2 } from '../hooks/useGoToMarketV2';
import { StrategyDisplay } from './StrategyDisplay';
import { SettingsModal } from './SettingsModal';
import { useChatbox } from '@/components/chatbox/ChatboxProvider';
import { useImplementationContext } from '../hooks/useImplementationContext';
import { GoToMarketSettings, DEFAULT_SETTINGS } from '../types';

export default function GoToMarketV2Generator() {
  const [settings, setSettings] = useState<GoToMarketSettings>({...DEFAULT_SETTINGS});
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [showStrategy, setShowStrategy] = useState(false);
  
  const { 
    strategyContent, 
    isLoading, 
    isError, 
    progress, 
    error, 
    contextStatus, 
    isContextValid, 
    generateStrategy, 
    resetGeneration,
    cancelGeneration
  } = useGoToMarketV2(settings);
  
  const { config } = useChatbox();
  
  const handleGenerate = async () => {
    setShowStrategy(true);
    await generateStrategy();
  };
  
  const handleReset = () => {
    resetGeneration();
    setShowStrategy(false);
  };
  
  const handleOpenSettings = () => {
    setIsSettingsModalOpen(true);
  };
  
  const handleCloseSettings = () => {
    setIsSettingsModalOpen(false);
  };
  
  const handleSaveSettings = (newSettings: GoToMarketSettings) => {
    setSettings(newSettings);
    // Optional: Save to localStorage
    localStorage.setItem('goToMarketV2Settings', JSON.stringify(newSettings));
  };
  
  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('goToMarketV2Settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      } catch (e) {
        console.error('Failed to parse saved settings', e);
      }
    }
  }, []);
  
  const isConfigValid = config.apiKey && config.model;
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Go-to-Market Strategy Generator</h1>
        <p className="text-gray-600">Generate a comprehensive go-to-market strategy based on your implementation plan</p>
      </div>
      
      {/* Context Status */}
      <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {contextStatus === 'success' && isContextValid ? (
              <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : contextStatus === 'error' || !isContextValid ? (
              <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Implementation Plan Context
            </h3>
            <div className="mt-1 text-sm text-blue-700">
              <p>
                {contextStatus === 'success' && isContextValid
                  ? 'Implementation plan context is ready for strategy generation'
                  : contextStatus === 'error' || !isContextValid
                  ? 'Implementation plan context is not available or incomplete'
                  : 'Waiting for implementation plan context...'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* API Configuration Warning */}
      {!isConfigValid && (
        <div className="mb-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                API Configuration Required
              </h3>
              <div className="mt-1 text-sm text-yellow-700">
                <p>Please configure your API key and model selection in the Chatbox controls before generating a strategy.</p>
              </div>
            </div>
          </div>
        </div>
      )
}
      
      {/* Controls */}
      <div className="mb-8 flex flex-wrap gap-4">
        <button
          onClick={handleGenerate}
          disabled={isLoading || !isContextValid || !isConfigValid}
          className={`px-6 py-3 rounded-lg font-medium flex items-center ${
            isLoading || !isContextValid || !isConfigValid
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            'Generate Strategy'
          )}
        </button>
        
        <button
          onClick={handleOpenSettings}
          disabled={isLoading}
          className={`px-6 py-3 rounded-lg font-medium flex items-center ${
            isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
          }`}
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </button>
        
        <button
          onClick={handleReset}
          disabled={isLoading}
          className={`px-6 py-3 rounded-lg font-medium ${
            isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Reset
        </button>
        
        {isLoading && (
          <button
            onClick={cancelGeneration}
            className="px-6 py-3 rounded-lg font-medium bg-red-100 text-red-700 hover:bg-red-200"
          >
            Cancel
          </button>
        )}
      </div>
      
      {/* Progress Bar */}
      {isLoading && (
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Generating strategy...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Error Display */}
      {isError && error && (
        <div className="mb-8 p-4 rounded-lg bg-red-50 border border-red-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Generation Error</h3>
              <div className="mt-1 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-2">
                <button
                  onClick={handleGenerate}
                  className="text-sm font-medium text-red-800 hover:text-red-900"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Strategy Display */}
      {showStrategy && (
        <StrategyDisplay 
          content={strategyContent} 
          isLoading={isLoading} 
        />
      )}
      
      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={handleCloseSettings}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
};
