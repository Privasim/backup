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

const ExperienceStep = dynamic(
  () => import('./ExperienceStep'),
  { ssr: false }
);

const ReviewStep = dynamic(
  () => import('./ReviewStep'),
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

  const profileTypeCards = [
    {
      type: 'student' as ProfileType,
      label: PROFILE_TYPE_LABELS.student,
      description: 'Currently studying or recently graduated',
      icon: '🎓',
      color: 'blue'
    },
    {
      type: 'professional' as ProfileType,
      label: PROFILE_TYPE_LABELS.professional,
      description: 'Working full-time, part-time, or freelancing',
      icon: '💼',
      color: 'purple'
    },
    {
      type: 'businessOwner' as ProfileType,
      label: PROFILE_TYPE_LABELS.businessOwner,
      description: 'Running your own business or startup',
      icon: '🏢',
      color: 'green'
    },
    {
      type: 'unemployed' as ProfileType,
      label: PROFILE_TYPE_LABELS.unemployed,
      description: 'Currently seeking opportunities',
      icon: '🎯',
      color: 'orange'
    }
  ];
  
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-lg font-semibold text-gray-900">Tell us about yourself</h2>
        <p className="text-sm text-gray-600">Choose the option that best describes your current situation</p>
        {isClient && profileStatus !== 'none' && (
          <div className="inline-flex items-center">
            <span className={`text-xs px-2 py-1 rounded-full ${
              profileStatus === 'completed' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {profileStatus === 'completed' ? '✓ Completed' : '📝 Draft'}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {profileTypeCards.map(({ type, label, description, icon, color }) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${
              selectedType === type
                ? `border-${color}-500 bg-${color}-50 ring-2 ring-${color}-200`
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="text-2xl flex-shrink-0">{icon}</div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 text-sm">{label}</h3>
                <p className="text-xs text-gray-600 mt-1">{description}</p>
              </div>
              {selectedType === type && (
                <div className="flex-shrink-0">
                  <div className={`w-5 h-5 rounded-full bg-${color}-500 flex items-center justify-center`}>
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
      
      <div className="flex justify-end pt-4">
        <button
          onClick={handleNext}
          disabled={!selectedType}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            selectedType 
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continue →
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
        return <ExperienceStep />;
      case 'review':
        return <ReviewStep />;
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
