"use client";

import React, { useMemo } from "react";
import StepIndicator from "./components/StepIndicator";
import StepFooter from "./components/StepFooter";
import RoleStep from "./steps/RoleStep";
import RoleDetailsStep from "./steps/RoleDetailsStep";
import IndustryLocationStep from "./steps/IndustryLocationStep";
import SkillsStep from "./steps/SkillsStep";
import ReviewStep from "./steps/ReviewStep";
import { useUserProfileForm } from "./hooks/useUserProfileForm";
import { Role } from "./types";

export default function UserProfileTab() {
  const { state, actions, isStepComplete } = useUserProfileForm();

  const canBack = state.currentStep > 1;
  const canNext = isStepComplete(state.currentStep);

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
        <div className="p-4 sm:p-5 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="mb-4">
            <StepIndicator currentStep={state.currentStep} />
          </div>
          <div className="space-y-4">
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
