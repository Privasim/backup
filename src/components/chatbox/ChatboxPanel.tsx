'use client';

import React, { useEffect, useRef } from 'react';
import { useChatbox } from './ChatboxProvider';
import { XMarkIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

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
    getActivePlugins
  } = useChatbox();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activePlugins = getActivePlugins();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center space-x-2">
          <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Profile Analysis</h2>
        </div>
        <button
          onClick={closeChatbox}
          className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          aria-label="Close chatbox"
        >
          <XMarkIcon className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* Status Indicator */}
      {status !== 'idle' && (
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              status === 'analyzing' ? 'bg-blue-500 animate-pulse' :
              status === 'completed' ? 'bg-green-500' :
              status === 'error' ? 'bg-red-500' :
              'bg-gray-400'
            }`} />
            <span className="text-sm text-gray-600 capitalize">
              {status === 'analyzing' ? 'Analyzing...' : status}
            </span>
          </div>
        </div>
      )}

      {/* Plugin Controls Slot */}
      <div className="border-b border-gray-200">
        {activePlugins.map(plugin => {
          const ControlsComponent = plugin.getControls?.();
          return ControlsComponent ? (
            <div key={plugin.id} className="p-4">
              <ControlsComponent />
            </div>
          ) : null;
        })}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && status === 'idle' && (
          <div className="text-center text-gray-500 py-8">
            <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">Configure your analysis settings below to get started.</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.type === 'error'
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : message.type === 'system'
                  ? 'bg-gray-50 text-gray-700 border border-gray-200'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              {message.metadata?.showTimestamp && (
                <div className="text-xs opacity-70 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <div className="w-5 h-5 text-red-500 mt-0.5">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-red-800">Analysis Error</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Plugin Actions Slot */}
      <div className="border-t border-gray-200 p-4">
        {activePlugins.map(plugin => {
          // Future: Plugin action components can be rendered here
          return (
            <div key={`${plugin.id}-actions`} className="mb-2 last:mb-0">
              {/* Plugin-specific action buttons will go here */}
            </div>
          );
        })}
        
        {/* Default actions when no plugins provide custom actions */}
        {activePlugins.length === 0 && (
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Configure analysis settings to enable actions
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatboxPanel;