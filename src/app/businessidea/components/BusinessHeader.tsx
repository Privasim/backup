'use client';

import React, { useEffect } from 'react';
import ProfilePanel from './profile-panel/ProfilePanel';
import { ChatboxToggle } from '@/components/chatbox/ChatboxToggle';
import { useChatbox } from '@/components/chatbox/ChatboxProvider';

interface BusinessHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

const BusinessHeader: React.FC<BusinessHeaderProps> = ({ 
  title, 
  description = 'Explore innovative business opportunities and ideas',
  className = ''
}) => {
  const { openChatbox } = useChatbox();

  // Ensure chatbox panel is opened when this header mounts
  useEffect(() => {
    openChatbox();
  }, [openChatbox]);

  return (
    <header className={`bg-white shadow ${className}`}>
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
            {description && (
              <p className="mt-1 text-xs md:text-sm text-gray-500">
                {description}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <ChatboxToggle variant="icon" size="md" />
            <ProfilePanel />
          </div>
        </div>
      </div>
    </header>
  );
};

export default BusinessHeader;
