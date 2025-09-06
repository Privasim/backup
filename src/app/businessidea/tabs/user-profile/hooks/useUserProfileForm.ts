"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Role,
  UserProfileData,
  WorkPreference,
  CareerShifterDetails,
  StudentDetails,
  ProfessionalDetails,
  BusinessOwnerDetails,
} from "../types";

export type FormErrors = Record<string, string | undefined>;

export function useUserProfileForm(initialStep?: number) {
  const [currentStep, setCurrentStep] = useState<number>(initialStep || 1);
  const [maxStepVisited, setMaxStepVisited] = useState<number>(1);
  const [data, setData] = useState<UserProfileData>({ skills: [] });
  const [errors, setErrors] = useState<FormErrors>({});

  const setStep = useCallback((step: number) => {
    setCurrentStep(step);
    setMaxStepVisited((prev) => Math.max(prev, step));
  }, []);

  const goNext = useCallback(() => {
    setStep(Math.min(currentStep + 1, 5));
  }, [currentStep, setStep]);

  const goBack = useCallback(() => {
    setStep(Math.max(currentStep - 1, 1));
  }, [currentStep, setStep]);

  const updateField = useCallback(
    (field: keyof UserProfileData, value: any) => {
      setData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const updateRole = useCallback((role: Role) => {
    // Reset roleDetails when role changes
    const base: UserProfileData = { ...data, role, skills: data.skills, goals: [] };
    delete (base as any).roleDetails;

    let roleDetails: any;
    if (role === Role.Student) {
      roleDetails = { role, student: {} as StudentDetails };
    } else if (role === Role.Professional) {
      roleDetails = { role, professional: {} as ProfessionalDetails };
    } else if (role === Role.BusinessOwner) {
      roleDetails = { role, business: {} as BusinessOwnerDetails };
    } else if (role === Role.CareerShifter) {
      roleDetails = { role, shifter: {} as CareerShifterDetails };
    }

    setData({ ...base, role, roleDetails });
    // Clear related errors
    setErrors((e) => ({ ...e, role: undefined }));
  }, [data]);

  const updateRoleDetails = useCallback((patch: Record<string, any>) => {
    setData((prev) => {
      const rd = prev.roleDetails;
      if (!rd) return prev;
      
      let newData: UserProfileData;
      if (rd.role === Role.Student) {
        newData = { ...prev, roleDetails: { ...rd, student: { ...rd.student, ...patch } } };
      }
      else if (rd.role === Role.Professional) {
        newData = { ...prev, roleDetails: { ...rd, professional: { ...rd.professional, ...patch } } };
      }
      else if (rd.role === Role.BusinessOwner) {
        newData = { ...prev, roleDetails: { ...rd, business: { ...rd.business, ...patch } } };
      }
      else if (rd.role === Role.CareerShifter) {
        newData = { ...prev, roleDetails: { ...rd, shifter: { ...rd.shifter, ...patch } } };
      }
      else {
        return prev;
      }

      // Merge role-specific goals into aggregate goals
      const roleDetails = newData.roleDetails;
      if (roleDetails) {
        const goals: string[] = [];
        if (roleDetails.role === Role.Student && roleDetails.student?.studentGoals) {
          goals.push(...roleDetails.student.studentGoals);
        }
        if (roleDetails.role === Role.Professional && roleDetails.professional?.professionalGoals) {
          goals.push(...roleDetails.professional.professionalGoals);
        }
        if (roleDetails.role === Role.BusinessOwner && roleDetails.business?.businessGoals) {
          goals.push(...roleDetails.business.businessGoals);
        }
        if (roleDetails.role === Role.CareerShifter && roleDetails.shifter?.transitionGoals) {
          goals.push(...roleDetails.shifter.transitionGoals);
        }
        
        // Remove duplicates and set aggregate goals
        newData.goals = [...new Set(goals)];
      }
      
      return newData;
    });
  }, []);

  const isStepComplete = useCallback(
    (step: number): boolean => {
      if (step === 1) {
        return !!data.role;
      }
      if (step === 2) {
        const rd = data.roleDetails;
        if (!rd) return false;
        switch (rd.role) {
          case Role.Student:
            return !!rd.student?.educationLevel && !!rd.student?.fieldOfStudy && !!rd.student?.graduationYear;
          case Role.Professional:
            return !!rd.professional?.yearsExperience && !!rd.professional?.jobFunction && !!rd.professional?.seniority;
          case Role.BusinessOwner:
            return !!rd.business?.companySize && !!rd.business?.sector && !!rd.business?.stage;
          case Role.CareerShifter:
            return !!rd.shifter?.previousField && !!rd.shifter?.desiredField && !!rd.shifter?.timeline;
          default:
            return false;
        }
      }
      if (step === 3) {
        return !!data.industry && !!data.location;
      }
      if (step === 4) {
        return (data.skills?.length || 0) >= 1; // require at least 1 skill selected
      }
      if (step === 5) {
        return true;
      }
      return false;
    },
    [data]
  );

  const api = useMemo(
    () => ({
      state: { currentStep, maxStepVisited, data, errors },
      actions: { setStep, goNext, goBack, updateField, updateRole, updateRoleDetails, setErrors },
      isStepComplete,
    }),
    [currentStep, maxStepVisited, data, errors, setStep, goNext, goBack, updateField, updateRole, updateRoleDetails, isStepComplete]
  );

  return api;
}
