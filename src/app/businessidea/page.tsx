import React from 'react';
import BusinessHeader from './components/BusinessHeader';
import ConversationTabs from './tabs/ConversationTabs';
import DebugButton from './components/DebugButton';
import ProfileSidebar from './profile-settings/ProfileSidebar';
import { ChatboxToggle } from '@/components/chatbox/ChatboxToggle';

const BusinessIdeaPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 relative">
        {/* Chatbox Toggle in upper right corner */}
        <div className="absolute top-4 right-4 z-10">
          <ChatboxToggle variant="icon" size="md" />
        </div>
        
        <div className="flex gap-4">
          {/* Left: Sidebar */}
          <ProfileSidebar />

          {/* Right: Main content */}
          <div className="flex-1">
            <BusinessHeader
              title="Business Ideas Hub"
              description="Discover and explore innovative business opportunities"
              className="hidden"
            />
            <div className="py-1">
              <ConversationTabs />
            </div>
          </div>
        </div>
      </div>
      <DebugButton />
    </div>
  );
};

export default BusinessIdeaPage;
