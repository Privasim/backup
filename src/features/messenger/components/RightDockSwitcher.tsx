'use client';

import React, { useState } from 'react';
import { ChatBubbleLeftRightIcon, ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/24/outline';
import ChatboxPanel from '@/components/chatbox/ChatboxPanel';
import { MessengerPanel } from './MessengerPanel';
import { MessengerProvider } from '../contexts/MessengerProvider';

type DockMode = 'chatbox' | 'messenger';

interface RightDockSwitcherProps {
  className?: string;
  initialMode?: DockMode;
  visible?: boolean;
  onClose?: () => void;
}

/**
 * RightDockSwitcher - Toggles between ChatboxPanel and MessengerPanel
 * Maintains independent state for each panel
 * Designed to work within ChatboxLayout
 */
export const RightDockSwitcher: React.FC<RightDockSwitcherProps> = ({
  className = '',
  initialMode = 'chatbox',
  visible = true,
  onClose
}) => {
  const [activeMode, setActiveMode] = useState<DockMode>(initialMode);
  
  // Handle back button click - switch to chatbox if in messenger mode, otherwise close
  const handleBackClick = () => {
    if (activeMode === 'messenger') {
      setActiveMode('chatbox');
    } else if (onClose) {
      onClose();
    }
  };
  
  // Switch between chatbox and messenger modes
  const switchMode = (mode: DockMode) => {
    setActiveMode(mode);
  };

  if (!visible) {
    return null;
  }

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Mode Switcher Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        <button
          onClick={() => switchMode('chatbox')}
          className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium ${
            activeMode === 'chatbox'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
          aria-label="Switch to Chatbox"
        >
          <ChatBubbleOvalLeftEllipsisIcon className="h-4 w-4 mr-2" />
          Analysis
        </button>
        
        <button
          onClick={() => switchMode('messenger')}
          className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium ${
            activeMode === 'messenger'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
          aria-label="Switch to Messenger"
        >
          <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
          Messenger
        </button>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-hidden">
        {activeMode === 'chatbox' && (
          <ChatboxPanel className="h-full" onClose={handleBackClick} />
        )}

        {activeMode === 'messenger' && (
          <MessengerProvider>
            <MessengerPanel className="h-full" onClose={handleBackClick} />
          </MessengerProvider>
        )}
      </div>
    </div>
  );
};

export default RightDockSwitcher;
