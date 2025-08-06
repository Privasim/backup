'use client';

import React from 'react';
import { ProfileFormData } from '@/app/businessidea/types/profile.types';
import { BriefcaseIcon, CodeBracketIcon, DocumentTextIcon, GlobeAltIcon } from '@heroicons/react/20/solid';

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
      <div className="text-xs text-gray-500 p-1.5">
        No profile data
      </div>
    );
  }

  const { profile, experience, skillset } = profileData;
  
  const profileType = profile.profileType?.toLowerCase() || 'profile';
  const experienceCount = experience.length;
  const skillsCount = (skillset.technical?.length || 0) + (skillset.soft?.length || 0);
  const certificationsCount = skillset.certifications?.length || 0;
  const languagesCount = skillset.languages?.length || 0;

  return (
    <div className="text-[11px] text-gray-700 p-1.5 max-w-xs">
      <div className="flex items-center font-medium mb-1">
        <span className="truncate">{profileType} Profile</span>
        <span className={`ml-1.5 px-1 py-0.5 rounded text-[10px] ${
          isMock ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'
        }`}>
          {isMock ? 'Mock' : 'Real'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
        <div className="flex items-center">
          <BriefcaseIcon className="h-2.5 w-2.5 mr-1 text-gray-500" />
          <span>{experienceCount} {experienceCount === 1 ? 'role' : 'roles'}</span>
        </div>
        <div className="flex items-center">
          <CodeBracketIcon className="h-2.5 w-2.5 mr-1 text-gray-500" />
          <span>{skillsCount} {skillsCount === 1 ? 'skill' : 'skills'}</span>
        </div>
        {certificationsCount > 0 && (
          <div className="flex items-center">
            <DocumentTextIcon className="h-2.5 w-2.5 mr-1 text-gray-500" />
            <span>{certificationsCount} {certificationsCount === 1 ? 'cert' : 'certs'}</span>
          </div>
        )}
        {languagesCount > 0 && (
          <div className="flex items-center">
            <GlobeAltIcon className="h-2.5 w-2.5 mr-1 text-gray-500" />
            <span>{languagesCount} {languagesCount === 1 ? 'lang' : 'langs'}</span>
          </div>
        )}
      </div>
    </div>
  );
};
