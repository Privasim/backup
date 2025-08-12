"use client";

import React, { useMemo, useEffect } from "react";
import StepIndicator from "./components/StepIndicator";
import StepFooter from "./components/StepFooter";
import RoleStep from "./steps/RoleStep";
import RoleDetailsStep from "./steps/RoleDetailsStep";
import IndustryLocationStep from "./steps/IndustryLocationStep";
import SkillsStep from "./steps/SkillsStep";
import ReviewStep from "./steps/ReviewStep";
import { useUserProfileForm } from "./hooks/useUserProfileForm";
import { Role } from "./types";
import { useChatbox } from '@/components/chatbox/ChatboxProvider';

export default function UserProfileTab() {
  const { state, actions, isStepComplete } = useUserProfileForm();
  const { setProfileData } = useChatbox();

  const canBack = state.currentStep > 1;
  const canNext = isStepComplete(state.currentStep);

  // Sync profile data to chatbox whenever it changes
  useEffect(() => {
    try {
      if (state.data && Object.keys(state.data).length > 0) {
        // Pass the UserProfileData directly - transformation will happen in the hook
        setProfileData(state.data as any);
      }
    } catch (error) {
      console.warn('Failed to sync profile data to chatbox:', error);
    }
  }, [state.data, setProfileData]);

  const content = useMemo(() => {
    switch (state.currentStep) {
      case 1:
        return (
          <RoleStep
            role={state.data.role}
            onSelect={(role) => {
              actions.updateRole(role as Role);
            }}
          />
        );
      case 2:
        return (
          <RoleDetailsStep
            roleDetails={state.data.roleDetails}
            onPatch={(patch) => actions.updateRoleDetails(patch)}
          />
        );
      case 3:
        return (
          <IndustryLocationStep
            industry={state.data.industry}
            location={state.data.location}
            workPreference={state.data.workPreference}
            onChange={(patch) => {
              if (typeof patch.industry !== 'undefined') {
                actions.updateField("industry", patch.industry);
              }
              if (typeof patch.location !== 'undefined') {
                actions.updateField("location", patch.location);
              }
              if (typeof patch.workPreference !== 'undefined') {
                actions.updateField("workPreference", patch.workPreference);
              }
            }}
          />
        );
      case 4:
        return (
          <SkillsStep
            skills={state.data.skills}
            onChange={(skills) => actions.updateField("skills", skills)}
          />
        );
      case 5:
        return <ReviewStep data={state.data} />;
      default:
        return null;
    }
  }, [state.currentStep, state.data, actions]);

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-3xl">
        <div className="p-5 sm:p-6 rounded-xl border border-gray-100 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-all">
          <div className="mb-5">
            <StepIndicator currentStep={state.currentStep} />
          </div>
          <div className="space-y-5">
            {content}
          </div>
          <StepFooter
            onBack={() => actions.goBack()}
            onNext={() => actions.goNext()}
            canBack={canBack}
            canNext={canNext}
            currentStep={state.currentStep}
            totalSteps={5}
          />
        </div>
      </div>
    </div>
  );
}
