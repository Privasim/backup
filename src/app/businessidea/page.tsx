import React from 'react';
import BusinessHeader from './components/BusinessHeader';

const BusinessIdeaPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessHeader 
        title="Business Ideas Hub"
        description="Discover and explore innovative business opportunities"
      />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-500">
              Browse through our curated collection of business ideas or submit your own!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessIdeaPage;
