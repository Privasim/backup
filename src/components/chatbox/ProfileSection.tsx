'use client';

import React, { useState } from 'react';
import { ProfileFormData } from '@/app/businessidea/types/profile.types';
import { 
  ChevronDownIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

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

  const profileType = profileData.profile.profileType?.toLowerCase() || 'profile';
  const experienceCount = profileData.experience.length;
  const skillsCount = (profileData.skillset.technical?.length || 0) + (profileData.skillset.soft?.length || 0);

  return (
    <div className={`border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden text-sm ${className}`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50 transition-colors group"
        onClick={toggleExpansion}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            toggleExpansion();
          }
        }}
      >
        <div className="flex items-center space-x-2">
          <div className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center ${
            isMock ? 'bg-orange-50' : 'bg-blue-50'
          }`}>
            <BriefcaseIcon className={`w-3.5 h-3.5 ${isMock ? 'text-orange-500' : 'text-blue-500'}`} />
          </div>
          
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5">
              <h3 className="text-xs font-medium text-gray-900 truncate">
                {profileType.charAt(0).toUpperCase() + profileType.slice(1)} Profile
              </h3>
              <span className={`text-[9px] font-medium px-1 py-0.5 rounded ${
                isMock ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'
              }`}>
                {isMock ? 'Mock' : 'Real'}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-gray-500">
              <span className="flex items-center">
                <BriefcaseIcon className="h-2.5 w-2.5 mr-0.5 text-gray-400" />
                {experienceCount} {experienceCount === 1 ? 'role' : 'roles'}
              </span>
              <span className="flex items-center">
                <CodeBracketIcon className="h-2.5 w-2.5 mr-0.5 text-gray-400" />
                {skillsCount} {skillsCount === 1 ? 'skill' : 'skills'}
              </span>
            </div>
          </div>
        </div>
        
        <ChevronDownIcon 
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-150 ${
            isExpanded ? 'rotate-180' : ''
          } group-hover:text-gray-600`} 
        />
      </div>

      {/* Expanded Content */}
      <div className={`transition-all duration-200 ease-in-out overflow-hidden ${
        isExpanded ? 'max-h-[1000px] border-t border-gray-100' : 'max-h-0'
      }`}>
        <div className="p-2">
          <ProfileDetailView profileData={profileData} />
        </div>
      </div>
    </div>
  );
};

const ProfileDetailView: React.FC<{ profileData: ProfileFormData }> = ({ profileData }) => {
  const { profile, experience, skillset } = profileData;
  const profileType = profile.profileType?.toLowerCase() || 'profile';

  const renderField = (icon: React.ReactNode, label: string, value: string | undefined) => {
    if (!value) return null;
    return (
      <div className="flex items-start space-x-1.5 text-xs">
        <div className="text-gray-400 mt-[3px]">{icon}</div>
        <div className="text-gray-700">
          <span className="text-gray-500">{label}: </span>
          <span className="font-medium">{value}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3 text-xs">
      {/* Basic Profile Info */}
      <div>
        <h4 className="flex items-center text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
          <UserGroupIcon className="h-3 w-3 mr-1" />
          Basic Info
        </h4>
        <div className="space-y-1.5 pl-4">
          {renderField(
            <BriefcaseIcon className="h-3 w-3" />,
            'Type',
            profileType.charAt(0).toUpperCase() + profileType.slice(1)
          )}
          {renderField(
            <AcademicCapIcon className="h-3 w-3" />,
            'Education',
            (profile as any)?.educationLevel
          )}
          {renderField(
            <LightBulbIcon className="h-3 w-3" />,
            'Field',
            (profile as any)?.fieldOfStudy
          )}
          {renderField(
            <BuildingOfficeIcon className="h-3 w-3" />,
            'Industry',
            (profile as any)?.industry
          )}
          {renderField(
            <BriefcaseIcon className="h-3 w-3" />,
            'Prev Role',
            (profile as any)?.previousRole
          )}
        </div>
      </div>

      {/* Experience */}
      {experience.length > 0 && (
        <div>
          <h4 className="flex items-center text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
            <BriefcaseIcon className="h-3 w-3 mr-1" />
            Experience • {experience.length}
          </h4>
          <div className="space-y-2 pl-4">
            {experience.slice(0, 2).map((exp, index) => (
              <div key={exp.id || index} className="relative pl-2 border-l border-gray-100">
                <div className="absolute -left-1 top-1.5 w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <div className="font-medium text-gray-900">{exp.title}</div>
                <div className="text-[11px] text-gray-500 mb-0.5">
                  {[exp.industry, exp.companySize, exp.seniority].filter(Boolean).join(' • ')}
                </div>
                {exp.description && (
                  <div className="text-[11px] text-gray-600 line-clamp-2">
                    {exp.description}
                  </div>
                )}
              </div>
            ))}
            {experience.length > 2 && (
              <div className="text-[11px] text-blue-600 pl-2">+{experience.length - 2} more experiences</div>
            )}
          </div>
        </div>
      )}

      {/* Skills */}
      {(skillset.technical?.length || 0) + (skillset.soft?.length || 0) > 0 && (
        <div>
          <h4 className="flex items-center text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
            <CodeBracketIcon className="h-3 w-3 mr-1" />
            Skills
          </h4>
          <div className="pl-4">
            {skillset.technical && skillset.technical.length > 0 && (
              <div>
                <div className="text-[11px] text-gray-500 mb-1">Technical</div>
                <div className="flex flex-wrap gap-1">
                  {skillset.technical.slice(0, 6).map((skill, index) => (
                    <span 
                      key={index} 
                      className="text-[11px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100"
                    >
                      {skill}
                    </span>
                  ))}
                  {skillset.technical.length > 6 && (
                    <span className="text-[10px] text-gray-400 self-center">+{skillset.technical.length - 6}</span>
                  )}
                </div>
              </div>
            )}
            {skillset.soft && skillset.soft.length > 0 && (
              <div className="mt-1.5">
                <div className="text-[11px] text-gray-500 mb-1">Soft Skills</div>
                <div className="flex flex-wrap gap-1">
                  {skillset.soft.slice(0, 4).map((skill, index) => (
                    <span 
                      key={index} 
                      className="text-[11px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded border border-green-100"
                    >
                      {skill}
                    </span>
                  ))}
                  {skillset.soft.length > 4 && (
                    <span className="text-[10px] text-gray-400 self-center">+{skillset.soft.length - 4}</span>
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
          <h4 className="flex items-center text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
            <DocumentTextIcon className="h-3 w-3 mr-1" />
            Certs • {skillset.certifications.length}
          </h4>
          <div className="space-y-1 pl-4">
            {skillset.certifications.slice(0, 2).map((cert, index) => (
              <div key={index} className="flex items-start text-[11px]">
                <div className="text-blue-500 mr-1 mt-0.5">•</div>
                <span className="text-gray-700">{cert}</span>
              </div>
            ))}
            {skillset.certifications.length > 2 && (
              <div className="text-[11px] text-blue-600">+{skillset.certifications.length - 2} more</div>
            )}
          </div>
        </div>
      )}

      {/* Languages */}
      {skillset.languages && skillset.languages.length > 0 && (
        <div>
          <h4 className="flex items-center text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
            <GlobeAltIcon className="h-3 w-3 mr-1" />
            Languages • {skillset.languages.length}
          </h4>
          <div className="flex flex-wrap gap-1 pl-4">
            {skillset.languages.map((lang, index) => (
              <span 
                key={index} 
                className="text-[11px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
