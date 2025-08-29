'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useChatbox } from './ChatboxProvider';
import { 
  ArrowLeftIcon,
  EllipsisVerticalIcon,
  PaperAirplaneIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

import ChatboxControls from './ChatboxControls';
import ChatboxMessage from './ChatboxMessage';
import QuickActionBar from './QuickActionBar';
import { getMockProfile } from '@/data/mockProfiles';
import { ProfileSection } from './ProfileSection';
import { ProfileSummaryTooltip } from './ProfileSummaryTooltip';

interface ChatboxPanelProps {
  className?: string;
  onClose?: () => void;
}

export const ChatboxPanel: React.FC<ChatboxPanelProps> = ({ className = '', onClose }) => {
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
    profileData,
    conversations,
    activeConversationId
  } = useChatbox();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const activePlugins = getActivePlugins();

  // Get active conversation if one is selected
  const activeConversation = useMemo(() => (
    conversations?.find(c => c.id === activeConversationId)
  ), [conversations, activeConversationId]);

  // Use active conversation messages if available, otherwise fallback to legacy messages
  const displayMessages = useMemo(() => (
    activeConversation ? activeConversation.messages : messages
  ), [activeConversation, messages]);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [displayMessages]);

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
    <div className={`h-full w-full bg-white flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between h-12 px-3 border-b border-gray-100 bg-white">
        <button
          onClick={onClose || closeChatbox}
          className="p-1.5 rounded-md hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Back"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="truncate text-[13px] font-semibold text-gray-900">{activeConversation?.title || 'AI Analysis'}</h2>
          <span
            className={`inline-block w-1.5 h-1.5 rounded-full ${
              status === 'analyzing' ? 'bg-blue-500 animate-pulse' :
              status === 'completed' ? 'bg-green-500' :
              status === 'error' ? 'bg-red-500' : 'bg-gray-300'
            }`}
            aria-hidden="true"
          />
          {/* Profile Data Source Badge with tooltip (preserve functionality) */}
          <div className="relative group ml-2">
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium cursor-help transition-colors ${
              useMockData
                ? 'bg-orange-100 text-orange-800 group-hover:bg-orange-200'
                : 'bg-green-100 text-green-800 group-hover:bg-green-200'
            }`}>
              {useMockData ? 'Mock' : 'Real'}
            </span>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
              <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-3 min-w-[200px]">
                <ProfileSummaryTooltip profileData={currentProfileData} isMock={useMockData} />
              </div>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="p-1.5 rounded-md hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Menu"
        >
          <EllipsisVerticalIcon className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Profile Section */}
      <div className="border-b border-gray-100 bg-gray-50/60">
        <ProfileSection 
          profileData={currentProfileData} 
          isMock={useMockData} 
        />
      </div>

      {/* Messages Area - Minimal & Airy */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-blue-50/40">
        <div className="px-4 py-3 space-y-3 min-h-full">
          {displayMessages.length === 0 && status === 'idle' && (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
              <div className="rounded-full bg-blue-50 p-3">
                <SparklesIcon className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No messages yet</h3>
              <p className="mt-1 text-xs text-gray-500">
                Start a conversation or analyze your profile to get insights.
              </p>
            </div>
          )}

          {displayMessages.map((message) => (
            <ChatboxMessage key={message.id} message={message} />
          ))}

          {/* Quick Action Bar (minimal) */}
          <QuickActionBar className="mt-2 bg-white/70 border border-gray-200 shadow-sm" />

          {/* Decorative page indicator dots */}
          <div className="flex items-center justify-center pt-2" aria-hidden="true">
            <span className="mx-0.5 h-1.5 w-1.5 rounded-full bg-gray-300" />
            <span className="mx-0.5 h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span className="mx-0.5 h-1.5 w-1.5 rounded-full bg-gray-300" />
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
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

      {/* Bottom Controls Section - Composer Styled */}
      <div className="border-t border-gray-100 bg-white">
        {/* Composer-styled toggle bar */}
        <button
          onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
          className="w-full flex items-center gap-2 px-3 py-2"
          aria-controls="chatbox-settings"
          aria-expanded={isSettingsExpanded}
        >
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-full border border-gray-200 text-[13px] text-gray-500 text-left">
            <span className="truncate">Type your messages…</span>
          </div>
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white shadow-sm">
            <PaperAirplaneIcon className="h-4 w-4 -rotate-45" />
          </span>
        </button>

        {/* Expandable Settings Panel */}
        <div
          id="chatbox-settings"
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isSettingsExpanded ? 'max-h-96' : 'max-h-0'
          }`}
        >
          <div className="border-t border-gray-100 p-3 space-y-3">
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
            <div className="border-t border-gray-200 pt-3">
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