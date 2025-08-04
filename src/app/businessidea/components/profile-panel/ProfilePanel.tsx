'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useProfile, ProfileProvider } from '../../context/ProfileContext';
import { PROFILE_TYPE_LABELS, ProfileType } from '../../types/profile.types';
import dynamic from 'next/dynamic';

// Lazy load components to reduce bundle size
const SkillsetSelector = dynamic(
  () => import('./SkillsetSelector'),
  { ssr: false }
);

const ConditionalFieldsStep = dynamic(
  () => import('./ConditionalFieldsStep'),
  { ssr: false }
);

const PostSubmissionPanel = dynamic(
  () => import('./PostSubmissionPanel'),
  { ssr: false }
);

const ProfileTypeSelector = ({ onNext }: { onNext: () => void }) => {
  const { updateProfileType, profile, getProfileStatus, profileFormData } = useProfile();
  const [selectedType, setSelectedType] = useState<ProfileType | null>(
    profileFormData?.profile?.profileType || profile.type || null
  );
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const profileStatus = isClient ? getProfileStatus() : 'none';
  
  const handleNext = () => {
    if (selectedType) {
      updateProfileType(selectedType);
      // Use setTimeout to ensure state update is processed before navigation
      setTimeout(() => {
        onNext();
      }, 0);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">Tell me about yourself</p>
          {isClient && profileStatus !== 'none' && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              profileStatus === 'completed' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {profileStatus === 'completed' ? 'Completed' : 'Draft'}
            </span>
          )}
        </div>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {Object.entries(PROFILE_TYPE_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedType(key as ProfileType)}
              className={`w-full text-left px-4 py-2 text-sm rounded-md transition-colors ${
                selectedType === key 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end pt-2">
        <button
          onClick={handleNext}
          disabled={!selectedType}
          className={`px-4 py-2 rounded-md text-sm transition-colors ${
            selectedType 
              ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

const ProfilePanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { currentStep, nextStep, isLoading, getProfileStatus, isProfileComplete } = useProfile();

  // Set client flag to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getStepTitle = () => {
    switch (currentStep) {
      case 'profile': return 'Profile Type';
      case 'conditional': return 'Additional Details';
      case 'experience': return 'Experience';
      case 'skills': return 'Skills';
      case 'review': return 'Review';
      default: return 'Profile';
    }
  };

  const getProgressPercentage = () => {
    const steps = ['profile', 'conditional', 'experience', 'skills', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      );
    }

    if (isProfileComplete()) {
      return <PostSubmissionPanel />;
    }

    switch (currentStep) {
      case 'profile':
        return <ProfileTypeSelector onNext={nextStep} />;
      case 'conditional':
        return <ConditionalFieldsStep />;
      case 'skills':
        return <SkillsetSelector />;
      case 'experience':
        return <div className="text-center py-8 text-gray-500">Experience step coming soon</div>;
      case 'review':
        return <div className="text-center py-8 text-gray-500">Review step coming soon</div>;
      default:
        return null;
    }
  };

  // Get profile status only on client to prevent hydration mismatch
  const profileStatus = isClient ? getProfileStatus() : 'none';

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 focus:outline-none relative"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
          isClient && profileStatus === 'completed' 
            ? 'bg-green-100' 
            : isClient && profileStatus === 'draft' 
            ? 'bg-yellow-100' 
            : 'bg-gray-300'
        }`}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 ${
              isClient && profileStatus === 'completed' 
                ? 'text-green-600' 
                : isClient && profileStatus === 'draft' 
                ? 'text-yellow-600' 
                : 'text-gray-600'
            }`}
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
        {isClient && profileStatus === 'draft' && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full"></div>
        )}
        {isClient && profileStatus === 'completed' && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 max-h-[85vh] overflow-hidden">
          {/* Header with progress */}
          {!isProfileComplete() && (
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900">{getStepTitle()}</h3>
                <span className="text-xs text-gray-500">
                  {Math.round(getProgressPercentage())}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Content */}
          <div className="px-4 py-4 max-h-[70vh] overflow-y-auto">
            {renderContent()}
          </div>
        </div>
      )}
    </div>
  );
};

const ProfilePanelWithProvider = () => (
  <ProfileProvider>
    <ProfilePanel />
  </ProfileProvider>
);

export default ProfilePanelWithProvider;
