import React from 'react';
import ProfileSidebar from './ProfileSidebar';

export default function ProfileSettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex gap-4">
          {/* Left: Sidebar persists across profile-settings routes */}
          <ProfileSidebar />

          {/* Right: Route content */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
