'use client';

import React, { useState, useEffect } from 'react';
import { ChatboxMessage as MessageType } from './types';
import { 
  UserIcon, 
  ComputerDesktopIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClipboardDocumentIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface ChatboxMessageProps {
  message: MessageType;
  isStreaming?: boolean;
  showTimestamp?: boolean;
  onCopy?: (content: string) => void;
}

export const ChatboxMessage: React.FC<ChatboxMessageProps> = ({
  message,
  isStreaming = false,
  showTimestamp = false,
  onCopy
}) => {
  const [copied, setCopied] = useState(false);
  const [displayContent, setDisplayContent] = useState('');

  // Handle streaming content updates
  useEffect(() => {
    if (isStreaming) {
      // For streaming messages, content builds up over time
      setDisplayContent(message.content);
    } else {
      // For complete messages, show full content immediately
      setDisplayContent(message.content);
    }
  }, [message.content, isStreaming]);

  const handleCopy = async () => {
    if (!onCopy) return;
    
    try {
      await navigator.clipboard.writeText(message.content);
      onCopy(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const getMessageIcon = () => {
    switch (message.type) {
      case 'user':
        return <UserIcon className="w-4 h-4" />;
      case 'assistant':
        return <ComputerDesktopIcon className="w-4 h-4" />;
      case 'system':
        return <InformationCircleIcon className="w-4 h-4" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      default:
        return <InformationCircleIcon className="w-4 h-4" />;
    }
  };

  const getMessageStyles = () => {
    const baseStyles = "max-w-[85%] rounded-lg px-4 py-3 relative group";
    
    switch (message.type) {
      case 'user':
        return `${baseStyles} bg-blue-600 text-white ml-auto`;
      case 'assistant':
        return `${baseStyles} bg-gray-100 text-gray-900 mr-auto`;
      case 'system':
        return `${baseStyles} bg-blue-50 text-blue-800 border border-blue-200 mx-auto`;
      case 'error':
        return `${baseStyles} bg-red-50 text-red-800 border border-red-200 mr-auto`;
      default:
        return `${baseStyles} bg-gray-100 text-gray-900 mr-auto`;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const shouldShowCopyButton = message.type === 'assistant' && message.content.length > 50;

  return (
    <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={getMessageStyles()}>
        {/* Message Header */}
        <div className="flex items-center mb-2">
          <div className={`flex items-center space-x-2 ${
            message.type === 'user' ? 'text-blue-100' : 'text-gray-600'
          }`}>
            {getMessageIcon()}
            <span className="text-xs font-medium capitalize">
              {message.type === 'assistant' ? 'AI Assistant' : message.type}
            </span>
            {showTimestamp && (
              <span className="text-xs opacity-75">
                {formatTimestamp(message.timestamp)}
              </span>
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className="space-y-2">
          <div className="text-sm whitespace-pre-wrap leading-relaxed">
            {displayContent}
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-current opacity-75 animate-pulse ml-1" />
            )}
          </div>

          {/* Analysis Type Badge */}
          {message.analysisType && (
            <div className="flex items-center mt-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                message.type === 'user' 
                  ? 'bg-blue-500 text-blue-100' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {message.analysisType} analysis
              </span>
            </div>
          )}

          {/* Metadata Display */}
          {message.metadata && Object.keys(message.metadata).length > 0 && (
            <details className="mt-2">
              <summary className={`text-xs cursor-pointer ${
                message.type === 'user' ? 'text-blue-200' : 'text-gray-500'
              } hover:opacity-75`}>
                Analysis Details
              </summary>
              <div className={`mt-1 text-xs ${
                message.type === 'user' ? 'text-blue-100' : 'text-gray-600'
              }`}>
                {message.metadata.usage && (
                  <div className="space-y-1">
                    <div>Tokens: {message.metadata.usage.total_tokens}</div>
                    <div>Model: {message.metadata.usage.model || 'Unknown'}</div>
                  </div>
                )}
                {message.metadata.profileStats && (
                  <div className="mt-2">
                    Profile Completion: {message.metadata.profileStats.completionPercentage}%
                  </div>
                )}
              </div>
            </details>
          )}
        </div>

        {/* Copy Button */}
        {shouldShowCopyButton && (
          <button
            onClick={handleCopy}
            className={`absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
              message.type === 'user'
                ? 'text-blue-200 hover:text-white hover:bg-blue-500'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'
            }`}
            title="Copy message"
          >
            {copied ? (
              <CheckIcon className="w-4 h-4" />
            ) : (
              <ClipboardDocumentIcon className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatboxMessage;