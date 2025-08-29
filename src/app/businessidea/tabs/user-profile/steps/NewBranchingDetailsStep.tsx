"use client";

import React, { useEffect, useMemo } from "react";
import { useUserProfile } from "../UserProfileContext";
import {
  Role,
  RoleDetails,
  WorkPreference,
  EDUCATION_LEVEL_OPTIONS,
  FIELD_OF_STUDY_BY_EDUCATION_LEVEL,
  GRAD_YEAR_OPTIONS,
  YEARS_EXPERIENCE_OPTIONS,
  JOB_FUNCTION_BY_INDUSTRY,
  SENIORITY_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  SECTOR_OPTIONS,
  TEAM_SIZE_OPTIONS,
  GOAL_OPTIONS_STUDENT,
  GOAL_OPTIONS_PROFESSIONAL,
  GOAL_OPTIONS_BUSINESS,
  GOAL_OPTIONS_SHIFTER,
  INDUSTRY_OPTIONS,
  LOCATION_OPTIONS,
  INTEREST_OPTIONS_BY_INDUSTRY,
  INTEREST_OPTIONS
} from "../types";

// Import field components
import IndustryField from "../components/fields/IndustryField";
import LocationField from "../components/fields/LocationField";
import IncomeCurrencyField from "../components/fields/IncomeCurrencyField";
import SkillsField from "../components/fields/SkillsField";
import ExperienceField from "../components/fields/ExperienceField";
import EducationField from "../components/fields/EducationField";
import ChallengesGoalsField from "../components/fields/ChallengesGoalsField";

// Import role-specific forms
import StudentDetailsForm from "../components/role-forms/StudentDetailsForm";
import ProfessionalDetailsForm from "../components/role-forms/ProfessionalDetailsForm";
import BusinessOwnerDetailsForm from "../components/role-forms/BusinessOwnerDetailsForm";
import CareerShifterDetailsForm from "../components/role-forms/CareerShifterDetailsForm";

type Props = {
  className?: string;
};

export default function NewBranchingDetailsStep({ className = "" }: Props) {
  const { profileData, setProfileData } = useUserProfile();
  const role = profileData.role;
  const roleDetails = profileData.roleDetails;
  const industry = profileData.industry;
  const location = profileData.location;

  // Dev-time guard: warn if nested roleDetails doesn't match selected role
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      if (roleDetails && role && roleDetails.role !== role) {
        console.warn("[UserProfile] roleDetails.role mismatch with selected role", {
          role,
          roleDetailsRole: (roleDetails as any).role,
        });
      }
    }
  }, [role, roleDetails]);

  // Handle updates to profile data
  const handleProfileUpdate = (patch: Record<string, any>) => {
    setProfileData(patch);
  };

  // Handle role-specific details updates
  const handleRoleDetailsUpdate = (patch: Record<string, any>) => {
    if (!role) return;
    
    // Lift known top-level fields out of roleDetails
    if (Object.prototype.hasOwnProperty.call(patch, "workPreference")) {
      const wp = patch["workPreference"] as WorkPreference | undefined;
      setProfileData({ workPreference: wp });
      delete patch["workPreference"];
    }
    
    let updatedRoleDetails: RoleDetails | undefined = roleDetails;
    
    if (!updatedRoleDetails) {
      // Create new role details object based on role
      switch (role) {
        case Role.Student:
          updatedRoleDetails = { role: Role.Student, student: { ...patch } };
          break;
        case Role.Professional:
          updatedRoleDetails = { role: Role.Professional, professional: { ...patch } };
          break;
        case Role.BusinessOwner:
          updatedRoleDetails = { role: Role.BusinessOwner, business: { ...patch } };
          break;
        case Role.CareerShifter:
          updatedRoleDetails = { role: Role.CareerShifter, shifter: { ...patch } };
          break;
      }
    } else {
      // Update existing role details
      switch (role) {
        case Role.Student:
          {
            const prev = (updatedRoleDetails as any)?.role === Role.Student ? (updatedRoleDetails as any).student ?? {} : {};
            updatedRoleDetails = {
              role: Role.Student,
              student: { ...prev, ...patch },
            } as RoleDetails;
          }
          break;
        case Role.Professional:
          {
            const prev = (updatedRoleDetails as any)?.role === Role.Professional ? (updatedRoleDetails as any).professional ?? {} : {};
            updatedRoleDetails = {
              role: Role.Professional,
              professional: { ...prev, ...patch },
            } as RoleDetails;
          }
          break;
        case Role.BusinessOwner:
          {
            const prev = (updatedRoleDetails as any)?.role === Role.BusinessOwner ? (updatedRoleDetails as any).business ?? {} : {};
            updatedRoleDetails = {
              role: Role.BusinessOwner,
              business: { ...prev, ...patch },
            } as RoleDetails;
          }
          break;
        case Role.CareerShifter:
          {
            const prev = (updatedRoleDetails as any)?.role === Role.CareerShifter ? (updatedRoleDetails as any).shifter ?? {} : {};
            updatedRoleDetails = {
              role: Role.CareerShifter,
              shifter: { ...prev, ...patch },
            } as RoleDetails;
          }
          break;
      }
    }
    
    setProfileData({ roleDetails: updatedRoleDetails });
  };

  if (!role) {
    return (
      <div className="flex items-center justify-center p-4 text-gray-500 text-xs">
        <div className="text-center">
          <span className="inline-block text-xl mb-1">⚠️</span>
          <p className="text-xs font-medium">Please select a role first</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Universal Fields - Always collected for all roles */}
      <div className="space-y-3">
        <div className="space-y-0.5">
          <h3 className="text-sm font-medium text-indigo-600">Profile Details</h3>
          <p className="text-xs text-gray-500">Complete your profile information</p>
        </div>

        {/* Industry & Location - Required for all roles */}
        <div className="grid grid-cols-2 gap-3">
          <IndustryField
            value={industry}
            onChange={(value) => handleProfileUpdate({ industry: value })}
            options={INDUSTRY_OPTIONS}
            required
          />
          <LocationField
            value={location}
            onChange={(value) => handleProfileUpdate({ location: value })}
            options={LOCATION_OPTIONS}
            required
          />
        </div>

        {/* Skills - Universal but role-contextual */}
        <SkillsField
          value={profileData.skills || []}
          onChange={(value) => handleProfileUpdate({ skills: value })}
          role={role}
          industry={industry}
          required
        />
      </div>

      {/* Role-Specific Form - Branching logic */}
      <div className="border-t border-gray-200 pt-4">
        {role === Role.Student && (
          <StudentDetailsForm
            data={roleDetails?.role === Role.Student ? roleDetails.student : {}}
            onUpdate={handleRoleDetailsUpdate}
            industry={industry}
          />
        )}

        {role === Role.Professional && (
          <ProfessionalDetailsForm
            data={roleDetails?.role === Role.Professional ? roleDetails.professional : {}}
            onUpdate={handleRoleDetailsUpdate}
            industry={industry}
          />
        )}

        {role === Role.BusinessOwner && (
          <BusinessOwnerDetailsForm
            data={roleDetails?.role === Role.BusinessOwner ? roleDetails.business : {}}
            onUpdate={handleRoleDetailsUpdate}
            industry={industry}
          />
        )}

        {role === Role.CareerShifter && (
          <CareerShifterDetailsForm
            data={roleDetails?.role === Role.CareerShifter ? roleDetails.shifter : {}}
            onUpdate={handleRoleDetailsUpdate}
            industry={industry}
            workPreference={profileData.workPreference}
            onWorkPreferenceChange={(value) => handleProfileUpdate({ workPreference: value })}
          />
        )}
      </div>
    </div>
  );
}