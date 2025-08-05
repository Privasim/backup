'use client';

import React, { useEffect, useRef, useState } from 'react';
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
    getActivePlugins
  } = useChatbox();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const activePlugins = getActivePlugins();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        </div>
        <button
          onClick={closeChatbox}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Close chatbox"
        >
          <XMarkIcon className="h-4 w-4 text-gray-500" />
        </button>
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