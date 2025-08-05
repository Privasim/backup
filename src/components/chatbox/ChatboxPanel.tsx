'use client';

import React, { useEffect, useRef } from 'react';
import { useChatbox } from './ChatboxProvider';
import { XMarkIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
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

      {/* Controls Section */}
      <div className="border-b border-gray-200 p-4">
        {/* Plugin Controls Slot */}
        {activePlugins.map(plugin => {
          const ControlsComponent = plugin.getControls?.();
          return ControlsComponent ? (
            <div key={plugin.id} className="mb-4 last:mb-0">
              <ControlsComponent />
            </div>
          ) : null;
        })}
        
        {/* Default Controls when no plugins provide custom controls */}
        {activePlugins.length === 0 && (
          <ChatboxControls />
        )}
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
          <ChatboxMessage
            key={message.id}
            message={message}
            isStreaming={status === 'analyzing' && message.type === 'assistant' && !message.content.trim()}
            showTimestamp={false}
            onCopy={(content) => {
              // Handle copy action - could show toast notification
              console.log('Message copied:', content.substring(0, 50) + '...');
            }}
          />
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

      {/* Actions Footer */}
      {messages.length > 0 && (
        <div className="border-t border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {messages.length} message{messages.length !== 1 ? 's' : ''}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearMessages}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => {
                  // Export messages
                  const { exportMessages } = require('./utils/message-utils');
                  const text = exportMessages.toMarkdown(messages);
                  const blob = new Blob([text], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `chatbox-export-${new Date().toISOString().split('T')[0]}.md`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatboxPanel;