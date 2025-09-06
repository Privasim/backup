import React from 'react';
import ProfileSidebar from '../profile-settings/ProfileSidebar';
import { ChatboxToggle } from '@/components/chatbox/ChatboxToggle';

export default function TaskManagementPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 relative">
        {/* Chatbox Toggle in bottom right corner (global dock remains via RootLayout) */}
        <div className="absolute bottom-4 right-4 z-10">
          <ChatboxToggle variant="icon" size="md" />
        </div>

        <div className="flex gap-4">
          {/* Left: Sidebar (preserves UX consistency) */}
          <ProfileSidebar />

          {/* Right: Main content */}
          <div className="flex-1">
            <div className="py-1">
              <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <h1 className="text-lg font-semibold text-gray-900">Task Management</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Placeholder page. The task management feature will appear here.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
