'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useProfile, ProfileProvider } from '../../context/ProfileContext';
import { PROFILE_TYPE_LABELS, ProfileType } from '../../types/profile.types';
import dynamic from 'next/dynamic';

// Lazy load the SkillsetSelector to reduce bundle size
const SkillsetSelector = dynamic(
  () => import('./SkillsetSelector'),
  { ssr: false }
);

const ProfileTypeSelector = ({ onNext }: { onNext: () => void }) => {
  const { updateProfileType, profile } = useProfile();
  const [selectedType, setSelectedType] = useState<ProfileType | null>(profile.type || null);
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Tell me about yourself</p>
        <div className="space-y-1">
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
          onClick={() => {
            if (selectedType) {
              updateProfileType(selectedType);
              onNext();
            }
          }}
          disabled={!selectedType}
          className={`px-4 py-2 rounded-md text-sm ${
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
  const panelRef = useRef<HTMLDivElement>(null);
  const { currentStep, nextStep, prevStep } = useProfile();

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

  const renderContent = () => {
    switch (currentStep) {
      case 'profile':
        return <ProfileTypeSelector onNext={nextStep} />;
      case 'skillset':
        return <SkillsetSelector />;
      case 'experience':
        return <div>Experience step (coming soon)</div>;
      default:
        return null;
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 focus:outline-none"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 text-gray-600" 
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
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg py-4 px-4 z-50 max-h-[80vh] overflow-y-auto">
          {renderContent()}
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
