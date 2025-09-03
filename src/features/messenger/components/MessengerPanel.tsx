'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useMessenger } from '../contexts/MessengerProvider';
import { ChatboxControls } from '@/components/chatbox/ChatboxControls';
import { MessengerConfig, MessengerMessage } from '../types';
import {
  ArrowLeftIcon,
  EllipsisVerticalIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  XMarkIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface MessengerPanelProps {
  className?: string;
  onClose?: () => void;
}

/**
 * MessengerPanel - Independent chat UI component
 * Uses MessengerProvider context and renders ChatboxControls in external mode
 */
export const MessengerPanel: React.FC<MessengerPanelProps> = ({ 
  className = '',
  onClose 
}) => {
  const {
    config,
    status,
    messages,
    error,
    updateConfig,
    sendMessage,
    stop,
    clear
  } = useMessenger();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = () => {
    if (!messageInput.trim() || status === 'streaming') return;

    // Prevent sending when configuration is incomplete; surface UI to configure
    if (!config.apiKey || !config.model) {
      setIsSettingsExpanded(true);
      return;
    }

    sendMessage({ content: messageInput.trim() });
    setMessageInput('');
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`h-full w-full bg-white flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between h-12 px-3 border-b border-gray-100 bg-white">
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Back"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="truncate text-[13px] font-semibold text-gray-900">AI Messenger</h2>
          <span
            className={`inline-block w-1.5 h-1.5 rounded-full ${
              status === 'streaming' ? 'bg-blue-500 animate-pulse' :
              status === 'idle' && messages.length > 0 ? 'bg-green-500' :
              status === 'error' ? 'bg-red-500' : 'bg-gray-300'
            }`}
            aria-hidden="true"
          />
        </div>
        <button
          onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
          className="p-1.5 rounded-md hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Settings"
        >
          <Cog6ToothIcon className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-blue-50/40">
        <div className="px-4 py-3 space-y-3 min-h-full">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
              <div className="rounded-full bg-blue-50 p-3">
                <SparklesIcon className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No messages yet</h3>
              <p className="mt-1 text-xs text-gray-500">
                Start a conversation with the AI assistant.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

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
                  <h4 className="text-sm font-medium text-red-800">Error</h4>
                  <p className="text-xs text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Bottom Controls Section */}
      <div className="border-t border-gray-100 bg-white">
        {/* Expandable Settings Panel */}
        <div
          id="messenger-settings"
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isSettingsExpanded ? 'max-h-96' : 'max-h-0'
          }`}
        >
          <div className="border-t border-gray-100 p-3 space-y-3">
            {/* ChatboxControls in external mode */}
            <ChatboxControls 
              controlSource="external"
              externalConfig={{
                model: config.model,
                apiKey: config.apiKey
              }}
              onExternalConfigChange={(update) => {
                // Map from ExternalConfig to MessengerConfig
                const messengerUpdate: Partial<MessengerConfig> = {};
                
                if (update.model !== undefined) messengerUpdate.model = update.model;
                if (update.apiKey !== undefined) messengerUpdate.apiKey = update.apiKey;
                
                updateConfig(messengerUpdate);
              }}
              forceMode="configOnly"
            />
            
            {/* Clear Messages Button */}
            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={clear}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm text-gray-700"
              >
                <XMarkIcon className="h-4 w-4" />
                Clear Conversation
              </button>
            </div>
          </div>
        </div>

        {/* Message Composer */}
        <div className="p-3 flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="w-full p-2 pr-10 bg-gray-50 border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>
          
          {status === 'streaming' ? (
            <button
              onClick={stop}
              className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-red-600 text-white shadow-sm hover:bg-red-700"
              aria-label="Stop"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || !config.apiKey || !config.model}
              className={`inline-flex items-center justify-center h-10 w-10 rounded-full ${
                !messageInput.trim() || !config.apiKey || !config.model
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
              }`}
              aria-label="Send"
            >
              <PaperAirplaneIcon className="h-5 w-5 -rotate-45" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Message bubble component for rendering individual messages
 */
const MessageBubble: React.FC<{ message: MessengerMessage }> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[85%] rounded-lg px-4 py-2 ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-white border border-gray-200 text-gray-800'
        }`}
      >
        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
        <div className={`text-[10px] mt-1 ${isUser ? 'text-blue-200' : 'text-gray-400'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default MessengerPanel;
