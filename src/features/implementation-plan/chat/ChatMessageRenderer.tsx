'use client';

import React from 'react';
import { ChatMessage, ChatMessageRendererProps } from './types';
import { 
  UserIcon, 
  CpuChipIcon, 
  InformationCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export const ChatMessageRenderer: React.FC<ChatMessageRendererProps> = ({ 
  message, 
  onApproval, 
  className = '' 
}) => {
  const getMessageIcon = () => {
    switch (message.type) {
      case 'user':
        return <UserIcon className="w-5 h-5" />;
      case 'assistant':
        return <CpuChipIcon className="w-5 h-5" />;
      case 'system':
        return <InformationCircleIcon className="w-5 h-5" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'loading':
        return <ArrowPathIcon className="w-5 h-5 animate-spin" />;
      default:
        return <CpuChipIcon className="w-5 h-5" />;
    }
  };

  const getMessageStyles = () => {
    const baseStyles = "flex gap-3 p-4 rounded-lg border";
    
    switch (message.type) {
      case 'user':
        return `${baseStyles} bg-blue-50 border-blue-200 ml-8`;
      case 'assistant':
        return `${baseStyles} bg-gray-50 border-gray-200 mr-8`;
      case 'system':
        return `${baseStyles} bg-yellow-50 border-yellow-200 mx-4`;
      case 'error':
        return `${baseStyles} bg-red-50 border-red-200 mx-4`;
      case 'loading':
        return `${baseStyles} bg-gray-50 border-gray-200 mr-8`;
      default:
        return `${baseStyles} bg-gray-50 border-gray-200 mr-8`;
    }
  };

  const getIconStyles = () => {
    switch (message.type) {
      case 'user':
        return "text-blue-600 bg-blue-100 p-2 rounded-full";
      case 'assistant':
        return "text-gray-600 bg-gray-100 p-2 rounded-full";
      case 'system':
        return "text-yellow-600 bg-yellow-100 p-2 rounded-full";
      case 'error':
        return "text-red-600 bg-red-100 p-2 rounded-full";
      case 'loading':
        return "text-gray-600 bg-gray-100 p-2 rounded-full";
      default:
        return "text-gray-600 bg-gray-100 p-2 rounded-full";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderContent = () => {
    if (message.type === 'loading') {
      return (
        <div className="flex items-center gap-2 text-gray-600">
          <span>Generating {message.phase === 'outline' ? 'plan outline' : 'detailed plan'}...</span>
          {message.metadata?.progress && (
            <span className="text-sm">({Math.round(message.metadata.progress)}%)</span>
          )}
        </div>
      );
    }

    return (
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-gray-700">
              {message.type === 'user' ? 'You' : 
               message.type === 'assistant' ? 'AI Assistant' :
               message.type === 'system' ? 'System' : 'Error'}
            </span>
            {message.phase && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {message.phase === 'outline' ? 'Outline Phase' : 'Full Plan Phase'}
              </span>
            )}
            {message.section && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                {message.section}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <ClockIcon className="w-3 h-3" />
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
        
        <div className="prose prose-sm max-w-none">
          {message.content.split('\n').map((line, index) => {
            // Handle different markdown elements
            if (line.startsWith('# ')) {
              return <h1 key={index} className="text-xl font-bold mb-3 mt-4 first:mt-0">{line.substring(2)}</h1>;
            } else if (line.startsWith('## ')) {
              return <h2 key={index} className="text-lg font-semibold mb-2 mt-3 first:mt-0">{line.substring(3)}</h2>;
            } else if (line.startsWith('### ')) {
              return <h3 key={index} className="text-base font-medium mb-2 mt-2 first:mt-0">{line.substring(4)}</h3>;
            } else if (line.startsWith('**') && line.endsWith('**')) {
              return <p key={index} className="font-semibold mb-2">{line.substring(2, line.length - 2)}</p>;
            } else if (line.startsWith('- ') || line.startsWith('• ')) {
              return <li key={index} className="ml-4 mb-1">{line.substring(2)}</li>;
            } else if (line.startsWith('---')) {
              return <hr key={index} className="my-4 border-gray-200" />;
            } else if (line.trim() === '') {
              return <br key={index} />;
            } else {
              return <p key={index} className="mb-2 last:mb-0">{line}</p>;
            }
          })}
        </div>

        {message.metadata?.requiresApproval && onApproval && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 mb-3">
              The outline is ready! Would you like to proceed with generating the detailed implementation plan?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => onApproval('approve')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CheckIcon className="w-4 h-4" />
                Generate Full Plan
              </button>
              <button
                onClick={() => onApproval('regenerate')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Regenerate Outline
              </button>
            </div>
          </div>
        )}

        {message.metadata?.isStreaming && (
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span>Streaming content...</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`${getMessageStyles()} ${className}`}>
      <div className={getIconStyles()}>
        {getMessageIcon()}
      </div>
      {renderContent()}
    </div>
  );
};

export default ChatMessageRenderer;