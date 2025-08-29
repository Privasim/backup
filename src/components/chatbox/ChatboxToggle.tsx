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
      button: 'px-5 py-2.5 text-sm',
      icon: 'w-6 h-6',
      fab: 'w-15 h-15',
      badge: 'w-6 h-6 text-xs'
    },
    md: {
      button: 'px-6 py-3 text-base',
      icon: 'w-8 h-8',
      fab: 'w-18 h-18',
      badge: 'w-7 h-7 text-xs'
    },
    lg: {
      button: 'px-9 py-4.5 text-lg',
      icon: 'w-9 h-9',
      fab: 'w-21 h-21',
      badge: 'w-9 h-9 text-sm'
    }
  };

  const currentSize = sizeConfig[size];

  // Status-based styling
  const getStatusColor = () => {
    switch (status) {
      case 'analyzing':
        return 'text-white bg-blue-600 border-blue-600 hover:bg-blue-700';
      case 'completed':
        return 'text-white bg-green-600 border-green-600 hover:bg-green-700';
      case 'error':
        return 'text-white bg-red-600 border-red-600 hover:bg-red-700';
      default:
        return 'text-white bg-blue-600 border-blue-600 hover:bg-blue-700';
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