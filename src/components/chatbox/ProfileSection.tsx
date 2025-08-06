'use client';

import React, { useState } from 'react';
import { ProfileFormData } from '@/app/businessidea/types/profile.types';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface ProfileSectionProps {
  profileData: ProfileFormData | null;
  isMock: boolean;
  className?: string;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  profileData,
  isMock,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!profileData) {
    return null;
  }

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`border border-gray-200 rounded-lg bg-white ${className}`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={toggleExpansion}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            toggleExpansion();
          }
        }}
      >
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-blue-600">
                {profileData.profile.profileType?.charAt(0).toUpperCase() || 'P'}
              </span>
            </div>
          </div>
          
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">
                Profile Data
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                isMock 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {isMock ? 'Mock' : 'Real'}
              </span>
            </div>
            <div className="text-xs text-gray-500 capitalize">
              {(profileData.profile as any)?.profileType || 'Profile'} • 
              {profileData.experience.length} experience{profileData.experience.length !== 1 ? 's' : ''} • 
              {(profileData.skillset.technical?.length || 0) + (profileData.skillset.soft?.length || 0)} skills
            </div>
          </div>
        </div>
        
        <ChevronDownIcon 
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`} 
        />
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4">
          <ProfileDetailView profileData={profileData} />
        </div>
      )}
    </div>
  );
};

const ProfileDetailView: React.FC<{ profileData: ProfileFormData }> = ({ profileData }) => {
  const { profile, experience, skillset } = profileData;

  return (
    <div className="space-y-4">
      {/* Basic Profile Info */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Basic Information</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div>Type: <span className="font-medium capitalize">{(profile as any)?.profileType || 'N/A'}</span></div>
          {(profile as any)?.educationLevel && (
            <div>Education: <span className="font-medium">{(profile as any).educationLevel}</span></div>
          )}
          {(profile as any)?.fieldOfStudy && (
            <div>Field: <span className="font-medium">{(profile as any).fieldOfStudy}</span></div>
          )}
          {(profile as any)?.industry && (
            <div>Industry: <span className="font-medium">{(profile as any).industry}</span></div>
          )}
          {(profile as any)?.businessType && (
            <div>Business Type: <span className="font-medium">{(profile as any).businessType}</span></div>
          )}
          {(profile as any)?.previousRole && (
            <div>Previous Role: <span className="font-medium">{(profile as any).previousRole}</span></div>
          )}
        </div>
      </div>

      {/* Experience */}
      {experience.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Experience ({experience.length})</h4>
          <div className="space-y-2">
            {experience.slice(0, 3).map((exp, index) => (
              <div key={exp.id || index} className="text-sm">
                <div className="font-medium text-gray-900">{exp.title}</div>
                <div className="text-gray-600 text-xs">
                  {exp.industry} • {exp.companySize} • {exp.seniority}
                </div>
                <div className="text-gray-500 text-xs line-clamp-2">
                  {exp.description}
                </div>
              </div>
            ))}
            {experience.length > 3 && (
              <div className="text-xs text-gray-500">+{experience.length - 3} more...</div>
            )}
          </div>
        </div>
      )}

      {/* Skills */}
      {(skillset.technical?.length || 0) + (skillset.soft?.length || 0) > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Skills</h4>
          <div className="space-y-2">
            {skillset.technical && skillset.technical.length > 0 && (
              <div>
                <div className="text-xs font-medium text-gray-600 mb-1">Technical:</div>
                <div className="flex flex-wrap gap-1">
                  {skillset.technical.slice(0, 5).map((skill, index) => (
                    <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                  {skillset.technical.length > 5 && (
                    <span className="text-xs text-gray-500">+{skillset.technical.length - 5}</span>
                  )}
                </div>
              </div>
            )}
            {skillset.soft && skillset.soft.length > 0 && (
              <div>
                <div className="text-xs font-medium text-gray-600 mb-1">Soft Skills:</div>
                <div className="flex flex-wrap gap-1">
                  {skillset.soft.slice(0, 3).map((skill, index) => (
                    <span key={index} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                  {skillset.soft.length > 3 && (
                    <span className="text-xs text-gray-500">+{skillset.soft.length - 3}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Certifications */}
      {skillset.certifications && skillset.certifications.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Certifications ({skillset.certifications.length})</h4>
          <div className="space-y-1">
            {skillset.certifications.slice(0, 3).map((cert, index) => (
              <div key={index} className="text-sm text-gray-600">
                • {cert}
              </div>
            ))}
            {skillset.certifications.length > 3 && (
              <div className="text-xs text-gray-500">+{skillset.certifications.length - 3} more...</div>
            )}
          </div>
        </div>
      )}

      {/* Languages */}
      {skillset.languages && skillset.languages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Languages ({skillset.languages.length})</h4>
          <div className="flex flex-wrap gap-1">
            {skillset.languages.map((lang, index) => (
              <span key={index} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                {lang}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
