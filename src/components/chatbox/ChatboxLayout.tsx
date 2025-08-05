'use client';

import React, { useEffect, useState } from 'react';
import { useChatbox } from './ChatboxProvider';
import ChatboxPanel from './ChatboxPanel';

/**
 * Overlay component for mobile chatbox
 */
const ChatboxOverlay: React.FC = () => {
  const { isVisible, closeChatbox } = useChatbox();

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-25 z-40 lg:hidden"
      onClick={closeChatbox}
    />
  );
};

interface ChatboxLayoutProps {
  children: React.ReactNode;
  position?: 'right' | 'left';
  width?: string;
  className?: string;
}

/**
 * Layout component that handles chatbox positioning and slide-out behavior
 */
export const ChatboxLayout: React.FC<ChatboxLayoutProps> = ({
  children,
  position = 'right',
  width = '24rem', // 384px (w-96)
  className = ''
}) => {
  const { isVisible } = useChatbox();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render on server to avoid hydration issues
  if (!isClient) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative min-h-screen ${className}`}>
      {/* Main content */}
      <div 
        className={`
          transition-all duration-300 ease-in-out
          ${isVisible 
            ? position === 'right' 
              ? `mr-[${width}]` 
              : `ml-[${width}]`
            : ''
          }
        `}
        style={{
          marginRight: isVisible && position === 'right' ? width : undefined,
          marginLeft: isVisible && position === 'left' ? width : undefined,
        }}
      >
        {children}
      </div>

      {/* Chatbox Panel */}
      <div
        className={`
          fixed top-0 bottom-0 z-50 
          ${position === 'right' ? 'right-0' : 'left-0'}
          transition-transform duration-300 ease-in-out
          ${isVisible ? 'translate-x-0' : 
            position === 'right' ? 'translate-x-full' : '-translate-x-full'
          }
        `}
        style={{ width }}
      >
        <ChatboxPanel className="h-full w-full" />
      </div>

      {/* Overlay for mobile */}
      <ChatboxOverlay />
    </div>
  );
};

export default ChatboxLayout;