'use client';

import React from 'react';
import ProfilePanel from './profile-panel/ProfilePanel';

interface BusinessHeaderProps {
  title: string;
  description?: string;
}

const BusinessHeader: React.FC<BusinessHeaderProps> = ({ 
  title, 
  description = 'Explore innovative business opportunities and ideas' 
}) => {
  return (
    <header className="bg-white shadow">
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
            <ProfilePanel />
          </div>
        </div>
      </div>
    </header>
  );
};

export default BusinessHeader;
