import React from 'react';
import BusinessHeader from './components/BusinessHeader';
import TabContainer from './tabs/TabContainer';
import DebugButton from './components/DebugButton';
import ProfileSidebar from './profile-settings/ProfileSidebar';

const BusinessIdeaPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex gap-4">
          {/* Left: Sidebar */}
          <ProfileSidebar />

          {/* Right: Main content */}
          <div className="flex-1">
            <BusinessHeader
              title="Business Ideas Hub"
              description="Discover and explore innovative business opportunities"
            />
            <div className="py-4">
              <TabContainer />
            </div>
          </div>
        </div>
      </div>
      <DebugButton />
    </div>
  );
};

export default BusinessIdeaPage;
