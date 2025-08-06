'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useChatbox } from './ChatboxProvider';
import { 
  XMarkIcon, 
  ChatBubbleLeftRightIcon, 
  Cog6ToothIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PaperAirplaneIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import ChatboxControls from './ChatboxControls';
import ChatboxMessage from './ChatboxMessage';
import { getMockProfile } from '@/data/mockProfiles';
import { ProfileSummaryTooltip } from './ProfileSummaryTooltip';
import { ProfileSection } from './ProfileSection';
import { chatboxDebug } from '@/app/businessidea/utils/logStore';

interface ChatboxPanelProps {
  className?: string;
}

export const ChatboxPanel: React.FC<ChatboxPanelProps> = ({ className = '' }) => {
  const {
    isVisible,
    status,
    messages,
    error,
    closeChatbox,
    clearMessages,
    getActivePlugins,
    useMockData,
    toggleMockData,
    profileData
  } = useChatbox();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const activePlugins = getActivePlugins();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Get current profile data for display
  const currentProfileData = useMemo(() => {
    if (useMockData) {
      return getMockProfile();
    }
    return profileData || null;
  }, [useMockData, profileData]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col ${className}`}>
      {/* Minimal Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-blue-100 rounded-lg">
            <ChatBubbleLeftRightIcon className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">AI Analysis</h2>
            <div className="flex items-center space-x-1">
              <div className={`w-1.5 h-1.5 rounded-full ${
                status === 'analyzing' ? 'bg-blue-500 animate-pulse' :
                status === 'completed' ? 'bg-green-500' :
                status === 'error' ? 'bg-red-500' :
                'bg-gray-400'
              }`} />
              <span className="text-xs text-gray-600 capitalize">
                {status === 'analyzing' ? 'Analyzing...' : status}
              </span>
            </div>
          </div>
          
          {/* Profile Data Source Badge */}
          <div className="relative group ml-2">
            <span className={`px-2 py-1 rounded text-xs font-medium cursor-help transition-all ${
              useMockData 
                ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' 
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}>
              {useMockData ? 'Mock' : 'Real'}
            </span>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
              <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-3 min-w-[200px]">
                <ProfileSummaryTooltip 
                  profileData={currentProfileData} 
                  isMock={useMockData} 
                />
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={closeChatbox}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Close chatbox"
        >
          <XMarkIcon className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* Profile Section */}
      <div className="border-b border-gray-200">
        <ProfileSection 
          profileData={currentProfileData} 
          isMock={useMockData} 
        />
      </div>

      {/* Messages Area - Maximized */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-4 space-y-4 min-h-full">
          {messages.length === 0 && status === 'idle' && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="p-4 bg-white rounded-xl shadow-sm">
                <div className="p-3 bg-blue-50 rounded-lg mb-3">
                  <SparklesIcon className="h-8 w-8 text-blue-500 mx-auto" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">Ready to Analyze</h3>
                <p className="text-xs text-gray-500">Configure your settings below and start your profile analysis</p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <ChatboxMessage
              key={message.id}
              message={message}
              isStreaming={status === 'analyzing' && message.type === 'assistant' && !message.content.trim()}
              showTimestamp={true}
              onCopy={(content) => {
                navigator.clipboard.writeText(content);
              }}
            />
          ))}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mx-4 mt-4">
              <div className="flex items-start space-x-2">
                <div className="w-4 h-4 text-red-500 mt-0.5">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-red-800">Analysis Error</h4>
                  <p className="text-xs text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Bottom Controls Section - Consolidated */}
      <div className="border-t border-gray-200 bg-white">
        {/* Settings Toggle Bar */}
        <button
          onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
          className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Cog6ToothIcon className="h-4 w-4" />
            <span>Settings & Controls</span>
          </div>
          {isSettingsExpanded ? (
            <ChevronDownIcon className="h-4 w-4" />
          ) : (
            <ChevronUpIcon className="h-4 w-4" />
          )}
        </button>

        {/* Expandable Settings Panel */}
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isSettingsExpanded ? 'max-h-96' : 'max-h-0'
        }`}>
          <div className="border-t border-gray-100 p-4 space-y-4">
            {/* Plugin Controls */}
            {activePlugins.map(plugin => {
              const ControlsComponent = plugin.getControls?.();
              return ControlsComponent ? (
                <div key={plugin.id}>
                  <ControlsComponent />
                </div>
              ) : null;
            })}
            
            {/* Mock Data Toggle */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Use Mock Data</h4>
                  <p className="text-xs text-gray-500">Toggle between real and mock profile data for testing</p>
                </div>
                <button
                  onClick={toggleMockData}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    useMockData ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={useMockData}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      useMockData ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {useMockData && (
                <div className="mt-2 p-2 bg-blue-50 rounded-md">
                  <p className="text-xs text-blue-700">✓ Using mock profile data for analysis</p>
                </div>
              )}
            </div>

            {/* Default Controls */}
            {activePlugins.length === 0 && (
              <ChatboxControls />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatboxPanel;