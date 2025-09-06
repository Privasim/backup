import React from 'react';
import ProfileSettingsTabs from './ProfileSettingsTabs';
import Link from 'next/link';
import { ChatboxToggle } from '@/components/chatbox/ChatboxToggle';

export default function ProfileSettingsPage({ searchParams }: { searchParams: { step?: string } }) {
  const initialStep = searchParams.step ? parseInt(searchParams.step) : undefined;
  
  return (
    <div className="flex-1 relative">
      {/* Chatbox Toggle in bottom right corner */}
      <div className="absolute bottom-4 right-4 z-10">
        <ChatboxToggle variant="icon" size="md" />
      </div>
      
      <div className="flex items-center justify-between mb-4">
      </div>
      <ProfileSettingsTabs initialStep={initialStep} />
    </div>
  );
}
