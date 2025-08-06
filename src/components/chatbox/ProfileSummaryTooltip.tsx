'use client';

import React from 'react';
import { ProfileFormData } from '@/app/businessidea/types/profile.types';

interface ProfileSummaryTooltipProps {
  profileData: ProfileFormData | null;
  isMock: boolean;
}

export const ProfileSummaryTooltip: React.FC<ProfileSummaryTooltipProps> = ({ 
  profileData, 
  isMock 
}) => {
  if (!profileData) {
    return (
      <div className="text-sm text-gray-600">
        No profile data available
      </div>
    );
  }

  const { profile, experience, skillset } = profileData;
  
  // Use profile type directly
  const profileType = profile.profileType || 'Profile';
  
  // Calculate counts
  const experienceCount = experience.length;
  const skillsCount = 
    (skillset.technical?.length || 0) + 
    (skillset.soft?.length || 0);
  const certificationsCount = skillset.certifications?.length || 0;
  const languagesCount = skillset.languages?.length || 0;

  return (
    <div className="w-48">
      <div className="flex items-center mb-2">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          isMock 
            ? 'bg-orange-100 text-orange-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {isMock ? 'Mock' : 'Real'} Data
        </span>
      </div>
      
      <div className="text-sm space-y-1">
        <div className="font-medium text-gray-900 capitalize">
          {profileType} Profile
        </div>
        
        <div className="text-xs text-gray-500 pt-1 border-t border-gray-200">
          {profileType} • {experienceCount} experience{experienceCount !== 1 ? 's' : ''}
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-1">
            <span>⚙️</span>
            <span>{skillsCount} skills</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>📜</span>
            <span>{certificationsCount}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>🌐</span>
            <span>{languagesCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
