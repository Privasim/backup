"use client";

import React, { useMemo, useEffect, useState } from "react";
import StepIndicator from "./components/StepIndicator";
import StepFooter from "./components/StepFooter";
import RoleStep from "./steps/RoleStep";
import RoleDetailsStep from "./steps/RoleDetailsStep";
import IndustryLocationStep from "./steps/IndustryLocationStep";
import SkillsStep from "./steps/SkillsStep";
import ReviewStep from "./steps/ReviewStep";
import { useUserProfileForm } from "./hooks/useUserProfileForm";
import { Role, INTEREST_OPTIONS_BY_INDUSTRY, INTEREST_OPTIONS } from "./types";
import { useChatbox } from '@/components/chatbox/ChatboxProvider';
import { adaptUserProfileToFormData } from '@/components/chatbox/utils/profile-transformation';

export default function UserProfileTab() {
  const { state, actions, isStepComplete } = useUserProfileForm();
  const { setProfileData } = useChatbox();
  const [prunedInterestsBackup, setPrunedInterestsBackup] = useState<string[] | null>(null);
  const [prunedRemovedCount, setPrunedRemovedCount] = useState<number>(0);

  const canBack = state.currentStep > 1;
  const canNext = isStepComplete(state.currentStep);

  // Sync profile data to chatbox whenever it changes
  useEffect(() => {
    try {
      if (state.data && Object.keys(state.data).length > 0) {
        // Adapt UserProfileData -> ProfileFormData before setting
        const adapted = adaptUserProfileToFormData(state.data);
        setProfileData(adapted);
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
            hobbies={state.data.hobbies}
            interests={state.data.interests}
            values={state.data.values}
            onChange={(patch) => {
              if (typeof patch.industry !== 'undefined') {
                actions.updateField("industry", patch.industry);
                // Prune interests when industry changes
                const currentInterests = state.data.interests || [];
                const newIndustryInterests = patch.industry ? 
                  (INTEREST_OPTIONS_BY_INDUSTRY[patch.industry] || INTEREST_OPTIONS) : 
                  INTEREST_OPTIONS;
                const validInterests = currentInterests.filter(interest => 
                  newIndustryInterests.includes(interest)
                );
                if (validInterests.length !== currentInterests.length) {
                  // store backup and count for undo UX
                  setPrunedInterestsBackup(currentInterests);
                  setPrunedRemovedCount(currentInterests.length - validInterests.length);
                  actions.updateField("interests", validInterests);
                } else {
                  setPrunedInterestsBackup(null);
                  setPrunedRemovedCount(0);
                }
              }
              if (typeof patch.location !== 'undefined') {
                actions.updateField("location", patch.location);
              }
              if (typeof patch.workPreference !== 'undefined') {
                actions.updateField("workPreference", patch.workPreference);
              }
              if (typeof patch.hobbies !== 'undefined') {
                actions.updateField("hobbies", patch.hobbies);
              }
              if (typeof patch.interests !== 'undefined') {
                actions.updateField("interests", patch.interests);
              }
              if (typeof patch.values !== 'undefined') {
                actions.updateField("values", patch.values);
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
        return <ReviewStep data={state.data} onEditStep={(step) => actions.setStep(step)} />;
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
          {state.currentStep === 3 && prunedInterestsBackup && prunedRemovedCount > 0 && (
            <div className="mb-4 px-3 py-2 rounded-md border border-amber-200 bg-amber-50 text-amber-800 flex items-center justify-between">
              <span className="text-xs">{prunedRemovedCount} interest{prunedRemovedCount > 1 ? 's' : ''} were removed due to industry change.</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded border border-amber-300 hover:bg-amber-100"
                  onClick={() => {
                    if (prunedInterestsBackup) {
                      actions.updateField("interests", prunedInterestsBackup);
                    }
                    setPrunedInterestsBackup(null);
                    setPrunedRemovedCount(0);
                  }}
                >
                  Undo
                </button>
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded border border-transparent hover:bg-amber-100"
                  onClick={() => {
                    setPrunedInterestsBackup(null);
                    setPrunedRemovedCount(0);
                  }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
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
