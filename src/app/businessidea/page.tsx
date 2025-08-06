import React from 'react';
import BusinessHeader from './components/BusinessHeader';
import TabContainer from './tabs/TabContainer';
import DebugButton from './components/DebugButton';

const BusinessIdeaPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessHeader 
        title="Business Ideas Hub"
        description="Discover and explore innovative business opportunities"
      />
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <TabContainer />
      </div>
      <DebugButton />
    </div>
  );
};

export default BusinessIdeaPage;
