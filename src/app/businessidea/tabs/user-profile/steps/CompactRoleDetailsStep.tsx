"use client";

import React, { useMemo } from "react";
import { useUserProfile } from "../UserProfileContext";
import {
  Role,
  RoleDetails,
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
} from "../types";

// We'll need to create these compact components
import CompactSelect from "../components/CompactSelect";
import SegmentedControl from "../components/SegmentedControl";
import PillMultiSelect from "../components/PillMultiSelect";

type Props = {
  className?: string;
};

export default function CompactRoleDetailsStep({ className = "" }: Props) {
  const { profileData, setProfileData } = useUserProfile();
  const role = profileData.role;
  const roleDetails = profileData.roleDetails;
  const industry = profileData.industry;

  const handlePatch = (patch: Record<string, any>) => {
    if (!role) return;
    
    let updatedRoleDetails: RoleDetails | undefined = roleDetails;
    
    if (!updatedRoleDetails) {
      // Create new role details object based on role
      switch (role) {
        case Role.Student:
          updatedRoleDetails = { role, student: { ...patch } };
          break;
        case Role.Professional:
          updatedRoleDetails = { role, professional: { ...patch } };
          break;
        case Role.BusinessOwner:
          updatedRoleDetails = { role, business: { ...patch } };
          break;
        case Role.CareerShifter:
          updatedRoleDetails = { role, shifter: { ...patch } };
          break;
      }
    } else {
      // Update existing role details
      switch (role) {
        case Role.Student:
          updatedRoleDetails = { 
            ...updatedRoleDetails, 
            student: { ...updatedRoleDetails.student, ...patch } 
          };
          break;
        case Role.Professional:
          updatedRoleDetails = { 
            ...updatedRoleDetails, 
            professional: { ...updatedRoleDetails.professional, ...patch } 
          };
          break;
        case Role.BusinessOwner:
          updatedRoleDetails = { 
            ...updatedRoleDetails, 
            business: { ...updatedRoleDetails.business, ...patch } 
          };
          break;
        case Role.CareerShifter:
          updatedRoleDetails = { 
            ...updatedRoleDetails, 
            shifter: { ...updatedRoleDetails.shifter, ...patch } 
          };
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

  if (role === Role.Student) {
    const s = roleDetails?.student || {};
    
    // Get field of study options based on education level
    const fieldOfStudyOptions = useMemo(() => {
      if (!s.educationLevel) return FIELD_OF_STUDY_BY_EDUCATION_LEVEL["Bachelor's Degree"];
      return FIELD_OF_STUDY_BY_EDUCATION_LEVEL[s.educationLevel] || FIELD_OF_STUDY_BY_EDUCATION_LEVEL["Bachelor's Degree"];
    }, [s.educationLevel]);
    
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="space-y-0.5">
          <h3 className="text-xs font-medium text-indigo-600">Student Details</h3>
          <p className="text-[10px] text-gray-500">Educational background</p>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <CompactSelect 
            label="Education" 
            value={s.educationLevel} 
            onChange={(v) => {
              handlePatch({ educationLevel: v });
              // Clear field of study when education level changes if it's not valid for new level
              const newFieldOptions = FIELD_OF_STUDY_BY_EDUCATION_LEVEL[v] || [];
              if (s.fieldOfStudy && !newFieldOptions.includes(s.fieldOfStudy)) {
                handlePatch({ fieldOfStudy: undefined });
              }
            }} 
            options={EDUCATION_LEVEL_OPTIONS} 
            required
          />
          <CompactSelect 
            label="Field" 
            value={s.fieldOfStudy} 
            onChange={(v) => handlePatch({ fieldOfStudy: v })} 
            options={fieldOfStudyOptions}
            placeholder={s.educationLevel ? "Select field..." : "Select education first"}
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <CompactSelect 
            label="Graduation" 
            value={s.graduationYear} 
            onChange={(v) => handlePatch({ graduationYear: v })} 
            options={GRAD_YEAR_OPTIONS} 
            required
          />
          <SegmentedControl 
            label="Status" 
            options={["Full-time", "Part-time"]} 
            value={s.status} 
            onChange={(v) => handlePatch({ status: v })} 
          />
        </div>
        
        <div className="mt-1 pt-1 border-t border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-700">Academic Goals</span>
            <span className="text-[10px] text-gray-400 px-1.5 py-0.5 bg-gray-50 rounded">optional</span>
          </div>
          <PillMultiSelect
            label=""
            options={GOAL_OPTIONS_STUDENT}
            value={s.studentGoals ?? []}
            onChange={(v) => handlePatch({ studentGoals: v })}
            recommended={GOAL_OPTIONS_STUDENT.slice(0,3)}
            initialVisibleCount={3}
            showSearch
            onSelectAllRecommended={() => handlePatch({ studentGoals: Array.from(new Set([...(s.studentGoals ?? []), ...GOAL_OPTIONS_STUDENT.slice(0,3)])) })}
          />
        </div>
      </div>
    );
  }

  if (role === Role.Professional) {
    const p = roleDetails?.professional || {};
    
    // Get job function options based on industry
    const jobFunctionOptions = useMemo(() => {
      if (!industry) return JOB_FUNCTION_BY_INDUSTRY["Technology"];
      return JOB_FUNCTION_BY_INDUSTRY[industry] || JOB_FUNCTION_BY_INDUSTRY["Technology"];
    }, [industry]);
    
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="space-y-0.5">
          <h3 className="text-xs font-medium text-indigo-600">Professional Details</h3>
          <p className="text-[10px] text-gray-500">Work experience</p>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <CompactSelect 
            label="Experience" 
            value={p.yearsExperience} 
            onChange={(v) => handlePatch({ yearsExperience: v })} 
            options={YEARS_EXPERIENCE_OPTIONS} 
            required
          />
          <CompactSelect 
            label="Function" 
            value={p.jobFunction} 
            onChange={(v) => handlePatch({ jobFunction: v })} 
            options={jobFunctionOptions}
            placeholder={industry ? `Select in ${industry}...` : "Select industry first"}
            required
          />
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          <CompactSelect 
            label="Seniority" 
            value={p.seniority} 
            onChange={(v) => handlePatch({ seniority: v })} 
            options={SENIORITY_OPTIONS} 
            required
          />
        </div>
        
        <div className="mt-1 pt-1 border-t border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-700">Professional Goals</span>
            <span className="text-[10px] text-gray-400 px-1.5 py-0.5 bg-gray-50 rounded">optional</span>
          </div>
          <PillMultiSelect
            label=""
            options={GOAL_OPTIONS_PROFESSIONAL}
            value={p.professionalGoals ?? []}
            onChange={(v) => handlePatch({ professionalGoals: v })}
            recommended={GOAL_OPTIONS_PROFESSIONAL.slice(0,3)}
            initialVisibleCount={3}
            showSearch
            onSelectAllRecommended={() => handlePatch({ professionalGoals: Array.from(new Set([...(p.professionalGoals ?? []), ...GOAL_OPTIONS_PROFESSIONAL.slice(0,3)])) })}
          />
        </div>
      </div>
    );
  }

  if (role === Role.BusinessOwner) {
    const b = roleDetails?.business || {};
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="space-y-0.5">
          <h3 className="text-xs font-medium text-indigo-600">Business Details</h3>
          <p className="text-[10px] text-gray-500">About your business</p>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <CompactSelect 
            label="Company Size" 
            value={b.companySize} 
            onChange={(v) => handlePatch({ companySize: v })} 
            options={COMPANY_SIZE_OPTIONS} 
            required
          />
          <CompactSelect 
            label="Sector" 
            value={b.sector} 
            onChange={(v) => handlePatch({ sector: v })} 
            options={SECTOR_OPTIONS} 
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <SegmentedControl 
            label="Stage" 
            options={["Idea", "MVP", "Growing", "Scaling"]} 
            value={b.stage} 
            onChange={(v) => handlePatch({ stage: v })} 
          />
          <CompactSelect 
            label="Team Size" 
            value={b.teamSize} 
            onChange={(v) => handlePatch({ teamSize: v })} 
            options={TEAM_SIZE_OPTIONS} 
            required
          />
        </div>
        
        <div className="mt-1 pt-1 border-t border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-700">Business Goals</span>
            <span className="text-[10px] text-gray-400 px-1.5 py-0.5 bg-gray-50 rounded">optional</span>
          </div>
          <PillMultiSelect
            label=""
            options={GOAL_OPTIONS_BUSINESS}
            value={b.businessGoals ?? []}
            onChange={(v) => handlePatch({ businessGoals: v })}
            recommended={GOAL_OPTIONS_BUSINESS.slice(0,3)}
            initialVisibleCount={3}
            showSearch
            onSelectAllRecommended={() => handlePatch({ businessGoals: Array.from(new Set([...(b.businessGoals ?? []), ...GOAL_OPTIONS_BUSINESS.slice(0,3)])) })}
          />
        </div>
      </div>
    );
  }

  if (role === Role.CareerShifter) {
    const s = roleDetails?.shifter || {};
    
    // Enhanced previous and desired field options
    const previousFieldOptions = [
      "Hospitality & Service", "Retail & Sales", "Education & Training", 
      "Operations & Logistics", "Healthcare", "Manufacturing", 
      "Government & Public Service", "Non-profit", "Military", "Other"
    ];
    
    const desiredFieldOptions = useMemo(() => {
      if (!industry) return ["Technology", "Design", "Marketing", "Operations", "Finance", "Healthcare", "Education"];
      return JOB_FUNCTION_BY_INDUSTRY[industry] || ["Technology", "Design", "Marketing", "Operations", "Finance"];
    }, [industry]);
    
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="space-y-0.5">
          <h3 className="text-xs font-medium text-indigo-600">Career Transition</h3>
          <p className="text-[10px] text-gray-500">Your career journey</p>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <CompactSelect 
            label="Previous" 
            value={s.previousField} 
            onChange={(v) => handlePatch({ previousField: v })} 
            options={previousFieldOptions}
            required
          />
          <CompactSelect 
            label="Desired" 
            value={s.desiredField} 
            onChange={(v) => handlePatch({ desiredField: v })} 
            options={desiredFieldOptions}
            placeholder={industry ? `Select in ${industry}...` : "Select industry first"}
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <CompactSelect 
            label="Timeline" 
            value={s.timeline} 
            onChange={(v) => handlePatch({ timeline: v })} 
            options={["Immediate", "3–6 months", "6–12 months", "1+ years"]}
            required
          />
          <SegmentedControl 
            label="Work" 
            options={["Remote", "Hybrid", "On-site"]} 
            value={s.workPreference} 
            onChange={(v) => handlePatch({ workPreference: v })} 
          />
        </div>
        
        <div className="mt-1 pt-1 border-t border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-700">Transition Goals</span>
            <span className="text-[10px] text-gray-400 px-1.5 py-0.5 bg-gray-50 rounded">optional</span>
          </div>
          <PillMultiSelect
            label=""
            options={GOAL_OPTIONS_SHIFTER}
            value={s.transitionGoals ?? []}
            onChange={(v) => handlePatch({ transitionGoals: v })}
            recommended={GOAL_OPTIONS_SHIFTER.slice(0,3)}
            initialVisibleCount={3}
            showSearch
            onSelectAllRecommended={() => handlePatch({ transitionGoals: Array.from(new Set([...(s.transitionGoals ?? []), ...GOAL_OPTIONS_SHIFTER.slice(0,3)])) })}
          />
        </div>
        
        {/* Skill Transfer Insight - More compact */}
        {s.previousField && s.desiredField && (
          <div className="mt-1 p-2 bg-blue-50 rounded border border-blue-100 text-[10px]">
            <div className="flex items-start gap-1.5">
              <span className="text-blue-500 mt-0.5">💡</span>
              <div>
                <h4 className="font-medium text-blue-800">Transferable Skills</h4>
                <p className="text-blue-700 mt-0.5">
                  Skills from {s.previousField} like communication and problem-solving transfer well to {s.desiredField}.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
