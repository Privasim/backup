'use client';

import React, { useEffect, useState } from 'react';
import { useChatbox } from './ChatboxProvider';
import ChatboxPanel from './ChatboxPanel';

/**
 * Enhanced overlay component for mobile chatbox with better animations
 */
const ChatboxOverlay: React.FC = () => {
  const { isVisible, closeChatbox } = useChatbox();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isAnimating) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black z-40 lg:hidden transition-opacity duration-300 ease-in-out ${
        isVisible ? 'bg-opacity-25' : 'bg-opacity-0'
      }`}
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
 * Enhanced layout component with improved responsive behavior and animations
 */
export const ChatboxLayout: React.FC<ChatboxLayoutProps> = ({
  children,
  position = 'right',
  width = '24rem', // 384px (w-96)
  className = ''
}) => {
  const { isVisible } = useChatbox();
  const [isClient, setIsClient] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // Don't render on server to avoid hydration issues
  if (!isClient) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative min-h-screen ${className}`}>
      {/* Main content with enhanced transitions */}
      <div 
        className={`
          transition-all duration-300 ease-in-out
          ${isVisible 
            ? position === 'right' 
              ? 'lg:mr-96' 
              : 'lg:ml-96'
            : ''
          }
          ${isAnimating && isVisible ? 'lg:overflow-hidden' : ''}
        `}
        style={{
          marginRight: isVisible && position === 'right' ? width : undefined,
          marginLeft: isVisible && position === 'left' ? width : undefined,
        }}
      >
        {children}
      </div>

      {/* Enhanced Chatbox Panel with better animations */}
      <div
        className={`
          fixed top-0 bottom-0 z-50 
          ${position === 'right' ? 'right-0' : 'left-0'}
          transition-all duration-300 ease-in-out
          ${isVisible ? 'translate-x-0' : 
            position === 'right' ? 'translate-x-full' : '-translate-x-full'
          }
          ${isAnimating ? 'block' : 'hidden'}
        `}
        style={{ width }}
      >
        <ChatboxPanel className="h-full w-full" />
      </div>

      {/* Enhanced overlay for mobile with fade animation */}
      <ChatboxOverlay />
    </div>
  );
};

export default ChatboxLayout;