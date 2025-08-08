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
    <div className="space-y-5">
      <div className="text-center space-y-1.5">
        <h2 className="text-[15px] font-medium text-slate-900 tracking-[-0.01em]">Tell us about yourself</h2>
        <p className="text-[12px] text-slate-500">Choose the option that best describes your current situation</p>
        {isClient && profileStatus !== 'none' && (
          <div className="inline-flex items-center justify-center">
            <span className={`text-[11px] px-2 py-0.5 rounded-full border ${
              profileStatus === 'completed' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {profileStatus === 'completed' ? '✓ Completed' : '📝 Draft'}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2">
        {profileTypeCards.map(({ type, label, description, icon }) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`group p-3 rounded-xl border transition-all duration-200 text-left bg-white ${
              selectedType === type
                ? 'border-indigo-500 ring-2 ring-indigo-200 bg-slate-50'
                : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[15px]">{icon}</div>
              <div className="flex-1">
                <h3 className="font-medium text-slate-900 text-[12px] tracking-[-0.01em]">{label}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>
              </div>
              {selectedType === type && (
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/90 flex items-center justify-center shadow">
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

      <div className="flex justify-end pt-3">
        <button
          onClick={handleNext}
          disabled={!selectedType}
          className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
            selectedType 
              ? 'bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.99]' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
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
  const [openMode, setOpenMode] = useState<'inline' | 'overlay'>('inline');

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

  // Listen for global events to control panel visibility
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const openListener = (_e: Event) => {
      setOpenMode('overlay');
      setIsOpen(true);
    };
    const closeListener = (_e: Event) => setIsOpen(false);
    const toggleListener = (_e: Event) => {
      setOpenMode('overlay');
      setIsOpen(prev => !prev);
    };

    window.addEventListener('profile-panel:open', openListener);
    window.addEventListener('profile-panel:close', closeListener);
    window.addEventListener('profile-panel:toggle', toggleListener);

    return () => {
      window.removeEventListener('profile-panel:open', openListener);
      window.removeEventListener('profile-panel:close', closeListener);
      window.removeEventListener('profile-panel:toggle', toggleListener);
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
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-300 border-t-transparent"></div>
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
        onClick={() => { setOpenMode('inline'); setIsOpen(!isOpen); }}
        className="flex items-center space-x-2 focus:outline-none relative"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all bg-white border border-slate-200 shadow-sm hover:shadow` }>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 text-slate-600`}
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
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
        )}
        {isClient && profileStatus === 'completed' && (
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full"></div>
        )}
      </button>

      {isOpen && (
        <div
          className={`${openMode === 'overlay' 
            ? 'fixed right-2 top-16 w-64 z-[60]'
            : 'absolute right-0 mt-2 w-64 z-50'
          } rounded-xl border border-slate-200/60 shadow-xl ring-1 ring-slate-900/5 bg-white/90 backdrop-blur-md max-h-[72vh] overflow-hidden`}
        >
          {/* Header with progress */}
          {!isProfileComplete() && (
            <div className="px-2.5 py-2 border-b border-slate-200/70 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center justify-between mb-0.5">
                <h3 className="text-[12px] font-medium text-slate-900 tracking-[-0.01em]">{getStepTitle()}</h3>
                <span className="text-[11px] text-slate-500">
                  {Math.round(getProgressPercentage())}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-[4px] overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-blue-600 h-[4px] rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="px-2 py-2 max-h-[56vh] overflow-y-auto profile-compact-ui">
            {renderContent()}
          </div>
        </div>
      )}
      {/* Scoped compact UI overrides for nested step components */}
      <style jsx global>{`
        .profile-compact-ui {
          font-size: 13px;
          line-height: 1.35;
        }
        .profile-compact-ui h1,
        .profile-compact-ui h2,
        .profile-compact-ui h3,
        .profile-compact-ui h4 {
          margin: 0.25rem 0 0.25rem;
          line-height: 1.2;
          font-weight: 600;
        }
        .profile-compact-ui p { margin: 0.25rem 0; color: #64748b; }
        .profile-compact-ui label {
          font-size: 12px;
          color: #334155;
          margin-bottom: 0.25rem !important;
        }
        .profile-compact-ui input,
        .profile-compact-ui select,
        .profile-compact-ui textarea {
          padding: 0.5rem 0.625rem !important;
          border-radius: 0.5rem !important;
          border-color: rgba(148,163,184,.6) !important;
        }
        .profile-compact-ui input:focus,
        .profile-compact-ui select:focus,
        .profile-compact-ui textarea:focus {
          outline: none;
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,.15) !important;
        }
        .profile-compact-ui button,
        .profile-compact-ui [type="submit"] {
          padding: 0.5rem 0.75rem !important;
          border-radius: 0.5rem !important;
          font-size: 13px !important;
        }
        .profile-compact-ui .grid { gap: 0.5rem !important; }
        .profile-compact-ui .helper-text { font-size: 11px !important; }
        .profile-compact-ui small { font-size: 11px !important; color: #94a3b8; }
      `}</style>
    </div>
  );
};

const ProfilePanelWithProvider = () => (
  <ProfileProvider>
    <ProfilePanel />
  </ProfileProvider>
);

export default ProfilePanelWithProvider;
