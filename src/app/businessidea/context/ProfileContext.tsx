'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  Profile, 
  ProfileType, 
  DEFAULT_PROFILE, 
  EnhancedSkillset, 
  ProfileFormData,
  ExperienceEntry,
  ProfileData,
  ProfileMetadata,
  FormStep
} from '../types/profile.types';
import { ProfileStorage, useAutoSave } from '../lib/storage';
import { validateProfileStep, validateCompleteProfile } from '../lib/validation';

interface ValidationError {
  field: string;
  message: string;
}

interface ProfileContextType {
  // Current state
  profile: Profile;
  profileFormData: ProfileFormData;
  currentStep: FormStep;
  isLoading: boolean;
  errors: ValidationError[];
  
  // Profile management
  updateProfileType: (type: ProfileType) => void;
  updateProfileData: (data: Partial<ProfileData>) => void;
  updateSkillset: (skillset: Partial<EnhancedSkillset>) => void;
  updateExperience: (experience: ExperienceEntry[]) => void;
  
  // Navigation
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: FormStep) => void;
  canProceed: () => boolean;
  
  // Form management
  validateCurrentStep: () => boolean;
  saveProfile: () => boolean;
  resetProfile: () => void;
  loadProfile: () => void;
  
  // Status
  getProfileStatus: () => 'none' | 'draft' | 'completed';
  isProfileComplete: () => boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// Create safe default values outside component to avoid recreation
const createDefaultProfileData = (): ProfileData => ({
  profileType: 'student'
});

const createDefaultSkillset = (): EnhancedSkillset => ({
  technical: [],
  soft: [],
  languages: [],
  certifications: [],
  categories: [],
  certificationsDetailed: [],
  languageProficiency: []
});

const createDefaultMetadata = (): ProfileMetadata => ({
  lastModified: new Date().toISOString(),
  version: '1.0.0',
  isDraft: true
});

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [profileFormData, setProfileFormData] = useState<ProfileFormData>({
    profile: DEFAULT_PROFILE.profileData || createDefaultProfileData(),
    experience: [],
    skillset: (DEFAULT_PROFILE.skillset as EnhancedSkillset) || createDefaultSkillset(),
    metadata: DEFAULT_PROFILE.metadata || createDefaultMetadata()
  });
  const [currentStep, setCurrentStep] = useState<FormStep>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  const autoSave = useAutoSave(500);

  const updateProfileType = useCallback((type: ProfileType) => {
    setProfile(prev => ({ ...prev, type }));
    setProfileFormData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        profileType: type
      },
      metadata: {
        ...prev.metadata,
        lastModified: new Date().toISOString()
      }
    }));
    setErrors([]);
  }, []);

  const updateProfileData = useCallback((data: Partial<ProfileData>) => {
    setProfileFormData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...data
      },
      metadata: {
        ...prev.metadata,
        lastModified: new Date().toISOString()
      }
    }));
  }, []);

  const updateSkillset = useCallback((skillset: Partial<EnhancedSkillset>) => {
    setProfile(prev => ({
      ...prev,
      skillset: {
        ...prev.skillset,
        ...skillset
      } as EnhancedSkillset
    }));
    
    setProfileFormData(prev => ({
      ...prev,
      skillset: {
        ...prev.skillset,
        ...skillset
      },
      metadata: {
        ...prev.metadata,
        lastModified: new Date().toISOString()
      }
    }));
  }, []);

  const updateExperience = useCallback((experience: ExperienceEntry[]) => {
    setProfile(prev => ({ ...prev, experience }));
    setProfileFormData(prev => ({
      ...prev,
      experience,
      metadata: {
        ...prev.metadata,
        lastModified: new Date().toISOString()
      }
    }));
  }, []);

  const validateCurrentStep = useCallback(() => {
    setErrors([]);
    
    // Safety check: ensure profileFormData and profile exist
    if (!profileFormData || !profileFormData.profile) {
      return false;
    }
    
    // For profile step, only validate that a profile type is selected
    if (currentStep === 'profile') {
      const hasProfileType = profileFormData.profile.profileType && profileFormData.profile.profileType !== '';
      if (!hasProfileType) {
        setErrors([{ field: 'profileType', message: 'Please select a profile type' }]);
        return false;
      }
      return true;
    }
    
    // For conditional step, validate the conditional fields
    if (currentStep === 'conditional') {
      try {
        const result = validateProfileStep(profileFormData.profile.profileType, profileFormData.profile);
        if (!result.success) {
          const validationErrors: ValidationError[] = result.error.issues?.map((err: any) => ({
            field: err.path?.join('.') || 'unknown',
            message: err.message || 'Validation error'
          })) || [];
          setErrors(validationErrors);
          return false;
        }
      } catch (error) {
        console.error('Validation error:', error);
        setErrors([{ field: 'general', message: 'Validation failed' }]);
        return false;
      }
    }
    
    return true;
  }, [currentStep, profileFormData]);

  const canProceed = useCallback(() => {
    return validateCurrentStep();
  }, [validateCurrentStep]);

  const nextStep = useCallback(() => {
    if (!canProceed()) return;
    
    const steps: FormStep[] = ['profile', 'conditional', 'experience', 'skills', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  }, [currentStep, canProceed]);

  const prevStep = useCallback(() => {
    const steps: FormStep[] = ['profile', 'conditional', 'experience', 'skills', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: FormStep) => {
    setCurrentStep(step);
  }, []);

  const saveProfile = useCallback(() => {
    if (!profileFormData) {
      return false;
    }
    
    try {
      const result = validateCompleteProfile(profileFormData);
      if (!result.success) {
        const validationErrors: ValidationError[] = result.error.issues?.map((err: any) => ({
          field: err.path?.join('.') || 'unknown',
          message: err.message || 'Validation error'
        })) || [];
        setErrors(validationErrors);
        return false;
      }
      
      const saveSuccess = ProfileStorage.saveCompleted(profileFormData);
      
      // Integrate with chatbox after successful save
      if (saveSuccess) {
        // Dynamic import to avoid circular dependencies
        import('@/components/chatbox/services/ProfileIntegrationService').then(({ profileIntegrationService }) => {
          profileIntegrationService.handleProfileSave(profileFormData);
        }).catch(error => {
          console.warn('Failed to trigger profile analysis:', error);
        });
      }
      
      return saveSuccess;
    } catch (error) {
      console.error('Save profile error:', error);
      setErrors([{ field: 'general', message: 'Failed to save profile' }]);
      return false;
    }
  }, [profileFormData]);

  const resetProfile = useCallback(() => {
    setProfile(DEFAULT_PROFILE);
    setProfileFormData({
      profile: createDefaultProfileData(),
      experience: [],
      skillset: createDefaultSkillset(),
      metadata: createDefaultMetadata()
    });
    setCurrentStep('profile');
    setErrors([]);
    setIsInitialized(false);
    ProfileStorage.clearAll();
  }, []);

  // Regular function for loading profile (not useCallback to avoid circular dependency)
  const loadProfile = () => {
    if (isInitialized) return; // Prevent multiple loads
    
    setIsLoading(true);
    
    try {
      const savedProfile = ProfileStorage.getDraft() || ProfileStorage.getCompleted();
      
      if (savedProfile && savedProfile.profile && savedProfile.skillset && savedProfile.metadata) {
        setProfileFormData(savedProfile);
        setProfile({
          type: savedProfile.profile.profileType,
          skills: (savedProfile.skillset.technical || []).concat(savedProfile.skillset.soft || []),
          skillset: savedProfile.skillset,
          experience: savedProfile.experience || [],
          profileData: savedProfile.profile,
          metadata: savedProfile.metadata
        });
      } else {
        // If saved profile is invalid, reset to default
        console.warn('Invalid saved profile, resetting to default');
        setProfileFormData({
          profile: createDefaultProfileData(),
          experience: [],
          skillset: createDefaultSkillset(),
          metadata: createDefaultMetadata()
        });
        setProfile(DEFAULT_PROFILE);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Reset to default on error
      setProfileFormData({
        profile: createDefaultProfileData(),
        experience: [],
        skillset: createDefaultSkillset(),
        metadata: createDefaultMetadata()
      });
      setProfile(DEFAULT_PROFILE);
    }
    
    setIsLoading(false);
    setIsInitialized(true);
  };

  // Wrapper function for external use
  const loadProfileCallback = useCallback(() => {
    loadProfile();
  }, [isInitialized]);

  const getProfileStatus = useCallback(() => {
    // Prevent hydration mismatch by only accessing localStorage on client
    if (!isClient) return 'none';
    return ProfileStorage.getProfileStatus();
  }, [isClient]);

  const isProfileComplete = useCallback(() => {
    return getProfileStatus() === 'completed';
  }, [getProfileStatus]);

  // Set client flag and load profile on mount
  useEffect(() => {
    setIsClient(true);
    loadProfile();
  }, []); // Empty dependency array to run only once on mount

  // Auto-save on profile changes - only after initialization
  useEffect(() => {
    if (isInitialized && profileFormData && profileFormData.metadata && profileFormData.metadata.isDraft) {
      autoSave(profileFormData);
    }
  }, [profileFormData, autoSave, isInitialized]);

  return (
    <ProfileContext.Provider value={{ 
      profile,
      profileFormData,
      currentStep,
      isLoading,
      errors,
      updateProfileType, 
      updateProfileData,
      updateSkillset,
      updateExperience,
      nextStep,
      prevStep,
      goToStep,
      canProceed,
      validateCurrentStep,
      saveProfile,
      resetProfile,
      loadProfile: loadProfileCallback,
      getProfileStatus,
      isProfileComplete
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
