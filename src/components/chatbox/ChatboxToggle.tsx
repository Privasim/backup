'use client';

import React from 'react';
import { 
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useChatbox } from './ChatboxProvider';

interface ChatboxToggleProps {
  className?: string;
  variant?: 'button' | 'fab' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
}

/**
 * Toggle button for opening/closing the chatbox
 */
export const ChatboxToggle: React.FC<ChatboxToggleProps> = ({
  className = '',
  variant = 'button',
  size = 'md',
  showBadge = true
}) => {
  const { 
    isVisible, 
    openChatbox, 
    closeChatbox, 
    status,
    messages 
  } = useChatbox();

  const handleToggle = () => {
    if (isVisible) {
      closeChatbox();
    } else {
      openChatbox();
    }
  };

  // Count unread messages (system messages or new analysis results)
  const unreadCount = messages.filter(msg => 
    msg.type === 'assistant' && 
    !msg.metadata?.read &&
    Date.now() - new Date(msg.timestamp).getTime() < 300000 // 5 minutes
  ).length;

  // Size configurations
  const sizeConfig = {
    sm: {
      button: 'px-3 py-1.5 text-sm',
      icon: 'w-4 h-4',
      fab: 'w-10 h-10',
      badge: 'w-4 h-4 text-xs'
    },
    md: {
      button: 'px-4 py-2 text-base',
      icon: 'w-5 h-5',
      fab: 'w-12 h-12',
      badge: 'w-5 h-5 text-xs'
    },
    lg: {
      button: 'px-6 py-3 text-lg',
      icon: 'w-6 h-6',
      fab: 'w-14 h-14',
      badge: 'w-6 h-6 text-sm'
    }
  };

  const currentSize = sizeConfig[size];

  // Status-based styling
  const getStatusColor = () => {
    switch (status) {
      case 'analyzing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-white border-gray-200 hover:bg-gray-50';
    }
  };

  // Button variant
  if (variant === 'button') {
    return (
      <button
        onClick={handleToggle}
        className={`
          inline-flex items-center justify-center space-x-2 font-medium rounded-lg
          border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          ${currentSize.button}
          ${getStatusColor()}
          ${status === 'analyzing' ? 'animate-pulse' : ''}
          ${className}
        `}
        title={isVisible ? 'Close AI Assistant' : 'Open AI Assistant'}
      >
        {status === 'analyzing' ? (
          <SparklesIcon className={`${currentSize.icon} animate-spin`} />
        ) : isVisible ? (
          <XMarkIcon className={currentSize.icon} />
        ) : (
          <ChatBubbleLeftRightIcon className={currentSize.icon} />
        )}
        
        <span>
          {status === 'analyzing' ? 'Analyzing...' : 
           isVisible ? 'Close Assistant' : 'AI Assistant'}
        </span>

        {/* Unread badge */}
        {showBadge && unreadCount > 0 && !isVisible && (
          <span className={`
            inline-flex items-center justify-center rounded-full bg-red-500 text-white font-medium
            ${currentSize.badge}
          `}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    );
  }

  // FAB (Floating Action Button) variant
  if (variant === 'fab') {
    return (
      <button
        onClick={handleToggle}
        className={`
          fixed bottom-6 right-6 z-40 inline-flex items-center justify-center
          rounded-full shadow-lg border transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          ${currentSize.fab}
          ${getStatusColor()}
          ${status === 'analyzing' ? 'animate-pulse' : ''}
          ${className}
        `}
        title={isVisible ? 'Close AI Assistant' : 'Open AI Assistant'}
      >
        {status === 'analyzing' ? (
          <SparklesIcon className={`${currentSize.icon} animate-spin`} />
        ) : isVisible ? (
          <XMarkIcon className={currentSize.icon} />
        ) : (
          <ChatBubbleLeftRightIcon className={currentSize.icon} />
        )}

        {/* Unread badge */}
        {showBadge && unreadCount > 0 && !isVisible && (
          <span className={`
            absolute -top-1 -right-1 inline-flex items-center justify-center
            rounded-full bg-red-500 text-white font-medium
            ${currentSize.badge}
          `}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    );
  }

  // Icon-only variant
  return (
    <button
      onClick={handleToggle}
      className={`
        relative inline-flex items-center justify-center p-2 rounded-lg
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        ${getStatusColor()}
        ${status === 'analyzing' ? 'animate-pulse' : ''}
        ${className}
      `}
      title={isVisible ? 'Close AI Assistant' : 'Open AI Assistant'}
    >
      {status === 'analyzing' ? (
        <SparklesIcon className={`${currentSize.icon} animate-spin`} />
      ) : isVisible ? (
        <XMarkIcon className={currentSize.icon} />
      ) : (
        <ChatBubbleLeftRightIcon className={currentSize.icon} />
      )}

      {/* Unread badge */}
      {showBadge && unreadCount > 0 && !isVisible && (
        <span className={`
          absolute -top-1 -right-1 inline-flex items-center justify-center
          rounded-full bg-red-500 text-white font-medium
          ${currentSize.badge}
        `}>
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default ChatboxToggle;