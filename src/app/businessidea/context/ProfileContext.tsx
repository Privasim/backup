'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Profile, ProfileType, DEFAULT_PROFILE, Skillset } from '../types/profile.types';

type FormStep = 'profile' | 'skillset' | 'experience';

interface ProfileContextType {
  profile: Profile;
  currentStep: FormStep;
  updateProfileType: (type: ProfileType) => void;
  updateSkillset: (skillset: Partial<Skillset>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [currentStep, setCurrentStep] = useState<FormStep>('profile');

  const updateProfileType = (type: ProfileType) => {
    setProfile(prev => ({
      ...prev,
      type
    }));
  };

  const updateSkillset = (skillset: Partial<Skillset>) => {
    setProfile(prev => ({
      ...prev,
      skillset: {
        ...prev.skillset,
        ...skillset
      }
    }));
  };

  const nextStep = () => {
    const steps: FormStep[] = ['profile', 'skillset', 'experience'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: FormStep[] = ['profile', 'skillset', 'experience'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  return (
    <ProfileContext.Provider value={{ 
      profile, 
      currentStep,
      updateProfileType, 
      updateSkillset,
      nextStep,
      prevStep
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
