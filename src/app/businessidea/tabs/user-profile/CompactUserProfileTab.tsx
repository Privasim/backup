"use client";

import React, { useState } from "react";
import StepIndicator from "./components/StepIndicator";
import StepFooter from "./components/StepFooter";
import { UserProfileProvider, useUserProfile } from "./UserProfileContext";
import CompactRoleStep from "./steps/CompactRoleStep";
import CompactRoleDetailsStep from "./steps/CompactRoleDetailsStep";
import CompactIndustryLocationStep from "./steps/CompactIndustryLocationStep";
import CompactSkillsStep from "./steps/CompactSkillsStep";
import CompactReviewStep from "./steps/CompactReviewStep";
import { Role, INTEREST_OPTIONS_BY_INDUSTRY, INTEREST_OPTIONS } from "./types";
import { useChatbox } from '@/components/chatbox/ChatboxProvider';
import { adaptUserProfileToFormData } from '@/components/chatbox/utils/profile-transformation';

function CompactUserProfileContent() {
  const { profileData, setProfileData } = useUserProfile();
  const { setProfileData: setChatboxProfileData } = useChatbox();
  const [currentStep, setCurrentStep] = useState(1);

  // Helper function to check if current step is complete
  const isStepComplete = (step: number): boolean => {
    switch (step) {
      case 1: // Role selection
        return !!profileData.role;
      case 2: // Role details
        if (!profileData.roleDetails) return false;
        
        if (profileData.role === Role.Student) {
          const s = profileData.roleDetails.student;
          return !!(s?.educationLevel && s?.fieldOfStudy);
        } else if (profileData.role === Role.Professional) {
          const p = profileData.roleDetails.professional;
          return !!(p?.jobFunction && p?.seniority);
        } else if (profileData.role === Role.BusinessOwner) {
          const b = profileData.roleDetails.business;
          return !!(b?.sector && b?.stage);
        } else if (profileData.role === Role.CareerShifter) {
          const c = profileData.roleDetails.shifter;
          return !!(c?.previousField && c?.desiredField);
        }
        return false;
      case 3: // Review
        return true;
      default:
        return false;
    }
  };

  const canBack = currentStep > 1;
  const canNext = isStepComplete(currentStep);

  // Sync profile data to chatbox whenever it changes
  React.useEffect(() => {
    try {
      if (profileData && Object.keys(profileData).length > 0) {
        // Adapt UserProfileData -> ProfileFormData before setting
        const adapted = adaptUserProfileToFormData(profileData);
        setChatboxProfileData(adapted);
      }
    } catch (error) {
      console.warn('Failed to sync profile data to chatbox:', error);
    }
  }, [profileData, setChatboxProfileData]);


  // Navigation functions
  const goNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= 5) {
      setCurrentStep(step);
    }
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <CompactRoleStep />;
      case 2:
        return <CompactRoleDetailsStep />;
      case 3:
        return <CompactReviewStep onEditStep={goToStep} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-3xl">
        <div className="p-4 sm:p-5 rounded-xl border border-gray-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition-all">
          <div className="mb-4">
            <StepIndicator currentStep={currentStep} />
          </div>
          
          
          <div className="space-y-4">
            {renderStepContent()}
          </div>
          
          <StepFooter
            onBack={goBack}
            onNext={goNext}
            canBack={canBack}
            canNext={canNext}
            currentStep={currentStep}
            totalSteps={3}
          />
        </div>
      </div>
    </div>
  );
}

export default function CompactUserProfileTab() {
  return (
    <UserProfileProvider>
      <CompactUserProfileContent />
    </UserProfileProvider>
  );
}
