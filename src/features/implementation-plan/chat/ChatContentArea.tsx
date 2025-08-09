'use client';

import React, { useEffect, useRef } from 'react';
import { ChatMessage } from './types';
import { ChatMessageRenderer } from './ChatMessageRenderer';

interface ChatContentAreaProps {
  messages: ChatMessage[];
  onApproval?: (action: string) => void;
  isStreaming?: boolean;
  className?: string;
}

export const ChatContentArea: React.FC<ChatContentAreaProps> = ({
  messages,
  onApproval,
  isStreaming = false,
  className = ''
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [messages.length, isStreaming]);

  // Smooth scroll when streaming updates
  useEffect(() => {
    if (isStreaming && containerRef.current) {
      const container = containerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      
      if (isNearBottom) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return (
      <div className={`flex-1 flex items-center justify-center p-8 ${className}`}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.471L3 21l2.471-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Ready to Generate Your Plan
          </h3>
          <p className="text-gray-600 text-sm">
            Select a business suggestion to start generating your implementation plan. 
            The AI will guide you through a two-phase process to create a comprehensive roadmap.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`flex-1 overflow-y-auto p-4 md:p-6 space-y-4 ${className}`}
      style={{ maxHeight: 'calc(100vh - 200px)' }}
    >
      {/* Messages */}
      {messages.map((message) => (
        <ChatMessageRenderer
          key={message.id}
          message={message}
          onApproval={onApproval}
          className="animate-fade-in"
        />
      ))}

      {/* Streaming indicator */}
      {isStreaming && (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span>AI is thinking...</span>
          </div>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatContentArea;