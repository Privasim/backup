"use client";

import React, { useMemo } from "react";
import CompactSelect from "../components/CompactSelect";
import SegmentedControl from "../components/SegmentedControl";
import PillMultiSelect from "../components/PillMultiSelect";
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

type Props = {
  roleDetails?: RoleDetails;
  onPatch: (patch: Record<string, any>) => void;
  // Additional context for conditional logic
  industry?: string;
};

export default function RoleDetailsStep({ roleDetails, onPatch, industry }: Props) {
  if (!roleDetails) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        <div className="text-center">
          <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2m0 0H8m4 0h4m-4-8v3m-6 4h18" />
          </svg>
          <p className="mt-2 text-sm font-medium">Please select a role first.</p>
        </div>
      </div>
    );
  }

  if (roleDetails.role === Role.Student) {
    const s = roleDetails.student || {};
    
    // Get field of study options based on education level
    const fieldOfStudyOptions = useMemo(() => {
      if (!s.educationLevel) return FIELD_OF_STUDY_BY_EDUCATION_LEVEL["Bachelor's Degree"];
      return FIELD_OF_STUDY_BY_EDUCATION_LEVEL[s.educationLevel] || FIELD_OF_STUDY_BY_EDUCATION_LEVEL["Bachelor's Degree"];
    }, [s.educationLevel]);
    
    return (
      <div className="p-1">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-indigo-600 mb-1">Student Details</h3>
          <p className="text-xs text-gray-500">Tell us about your educational background</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CompactSelect 
            label="Education Level" 
            value={s.educationLevel} 
            onChange={(v) => {
              onPatch({ educationLevel: v });
              // Clear field of study when education level changes if it's not valid for new level
              const newFieldOptions = FIELD_OF_STUDY_BY_EDUCATION_LEVEL[v] || [];
              if (s.fieldOfStudy && !newFieldOptions.includes(s.fieldOfStudy)) {
                onPatch({ fieldOfStudy: undefined });
              }
            }} 
            options={EDUCATION_LEVEL_OPTIONS} 
            required
          />
          <CompactSelect 
            label="Field of Study" 
            value={s.fieldOfStudy} 
            onChange={(v) => onPatch({ fieldOfStudy: v })} 
            options={fieldOfStudyOptions}
            placeholder={s.educationLevel ? "Select field of study..." : "Select education level first"}
            required
          />
          <CompactSelect 
            label="Expected Graduation" 
            value={s.graduationYear} 
            onChange={(v) => onPatch({ graduationYear: v })} 
            options={GRAD_YEAR_OPTIONS} 
            required
          />
          <SegmentedControl 
            label="Enrollment Status" 
            options={["Full-time", "Part-time"]} 
            value={s.status} 
            onChange={(v) => onPatch({ status: v })} 
          />
          <div className="col-span-2">
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer select-none">
                <span className="text-sm font-medium text-gray-800">Academic Goals (optional)</span>
                <span className="text-xs text-indigo-600 group-open:hidden">Show</span>
                <span className="text-xs text-indigo-600 hidden group-open:inline">Hide</span>
              </summary>
              <div className="mt-2">
                <PillMultiSelect
                  label="Goals"
                  options={GOAL_OPTIONS_STUDENT}
                  value={s.studentGoals ?? []}
                  onChange={(v) => onPatch({ studentGoals: v })}
                  recommended={GOAL_OPTIONS_STUDENT.slice(0,8)}
                  initialVisibleCount={8}
                  showSearch
                  onSelectAllRecommended={() => onPatch({ studentGoals: Array.from(new Set([...(s.studentGoals ?? []), ...GOAL_OPTIONS_STUDENT.slice(0,8)])) })}
                />
                <p className="mt-1 text-[11px] text-gray-500">💡 Choose goals that align with your career aspirations.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    );
  }

  if (roleDetails.role === Role.Professional) {
    const p = roleDetails.professional || {};
    
    // Get job function options based on industry
    const jobFunctionOptions = useMemo(() => {
      if (!industry) return JOB_FUNCTION_BY_INDUSTRY["Technology"];
      return JOB_FUNCTION_BY_INDUSTRY[industry] || JOB_FUNCTION_BY_INDUSTRY["Technology"];
    }, [industry]);
    
    return (
      <div className="p-1">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-indigo-600 mb-1">Professional Details</h3>
          <p className="text-xs text-gray-500">Tell us about your professional experience</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CompactSelect 
            label="Years of Experience" 
            value={p.yearsExperience} 
            onChange={(v) => onPatch({ yearsExperience: v })} 
            options={YEARS_EXPERIENCE_OPTIONS} 
            required
          />
          <CompactSelect 
            label="Job Function" 
            value={p.jobFunction} 
            onChange={(v) => onPatch({ jobFunction: v })} 
            options={jobFunctionOptions}
            placeholder={industry ? `Select function in ${industry}...` : "Select industry first for relevant options"}
            required
          />
          <CompactSelect 
            label="Seniority Level" 
            value={p.seniority} 
            onChange={(v) => onPatch({ seniority: v })} 
            options={SENIORITY_OPTIONS} 
            required
          />
          <div className="col-span-2">
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer select-none">
                <span className="text-sm font-medium text-gray-800">Professional Goals (optional)</span>
                <span className="text-xs text-indigo-600 group-open:hidden">Show</span>
                <span className="text-xs text-indigo-600 hidden group-open:inline">Hide</span>
              </summary>
              <div className="mt-2">
                <PillMultiSelect
                  label="Goals"
                  options={GOAL_OPTIONS_PROFESSIONAL}
                  value={p.professionalGoals ?? []}
                  onChange={(v) => onPatch({ professionalGoals: v })}
                  recommended={GOAL_OPTIONS_PROFESSIONAL.slice(0,8)}
                  initialVisibleCount={8}
                  showSearch
                  onSelectAllRecommended={() => onPatch({ professionalGoals: Array.from(new Set([...(p.professionalGoals ?? []), ...GOAL_OPTIONS_PROFESSIONAL.slice(0,8)])) })}
                />
                <p className="mt-1 text-[11px] text-gray-500">💡 Focus on 2-3 key goals for the next 1-2 years.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    );
  }

  if (roleDetails.role === Role.BusinessOwner) {
    const b = roleDetails.business || {};
    return (
      <div className="p-1">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-indigo-600 mb-1">Business Details</h3>
          <p className="text-xs text-gray-500">Tell us about your business or startup</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CompactSelect 
            label="Company Size" 
            value={b.companySize} 
            onChange={(v) => onPatch({ companySize: v })} 
            options={COMPANY_SIZE_OPTIONS} 
            required
          />
          <CompactSelect 
            label="Business Sector" 
            value={b.sector} 
            onChange={(v) => onPatch({ sector: v })} 
            options={SECTOR_OPTIONS} 
            required
          />
          <SegmentedControl 
            label="Business Stage" 
            options={["Idea", "MVP", "Growing", "Scaling"]} 
            value={b.stage} 
            onChange={(v) => onPatch({ stage: v })} 
          />
          <CompactSelect 
            label="Team Size" 
            value={b.teamSize} 
            onChange={(v) => onPatch({ teamSize: v })} 
            options={TEAM_SIZE_OPTIONS} 
            required
          />
          <div className="col-span-2">
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer select-none">
                <span className="text-sm font-medium text-gray-800">Business Goals (optional)</span>
                <span className="text-xs text-indigo-600 group-open:hidden">Show</span>
                <span className="text-xs text-indigo-600 hidden group-open:inline">Hide</span>
              </summary>
              <div className="mt-2">
                <PillMultiSelect
                  label="Goals"
                  options={GOAL_OPTIONS_BUSINESS}
                  value={b.businessGoals ?? []}
                  onChange={(v) => onPatch({ businessGoals: v })}
                  recommended={GOAL_OPTIONS_BUSINESS.slice(0,8)}
                  initialVisibleCount={8}
                  showSearch
                  onSelectAllRecommended={() => onPatch({ businessGoals: Array.from(new Set([...(b.businessGoals ?? []), ...GOAL_OPTIONS_BUSINESS.slice(0,8)])) })}
                />
                <p className="mt-1 text-[11px] text-gray-500">💡 Choose goals that align with your business stage and priorities.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    );
  }

  if (roleDetails.role === Role.CareerShifter) {
    const s = roleDetails.shifter || {};
    
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
      <div className="p-1">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-indigo-600 mb-1">Career Transition Details</h3>
          <p className="text-xs text-gray-500">Tell us about your career transition journey</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CompactSelect 
            label="Previous Field" 
            value={s.previousField} 
            onChange={(v) => onPatch({ previousField: v })} 
            options={previousFieldOptions}
            required
          />
          <CompactSelect 
            label="Desired Role" 
            value={s.desiredField} 
            onChange={(v) => onPatch({ desiredField: v })} 
            options={desiredFieldOptions}
            placeholder={industry ? `Select role in ${industry}...` : "Select industry first"}
            required
          />
          <CompactSelect 
            label="Transition Timeline" 
            value={s.timeline} 
            onChange={(v) => onPatch({ timeline: v })} 
            options={["Immediate (0-3 months)", "Short-term (3-6 months)", "Medium-term (6-12 months)", "Long-term (1+ years)"]}
            required
          />
          <SegmentedControl 
            label="Work Preference" 
            options={["Remote", "Hybrid", "On-site"]} 
            value={s.workPreference} 
            onChange={(v) => onPatch({ workPreference: v })} 
          />
          <div className="col-span-2">
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer select-none">
                <span className="text-sm font-medium text-gray-800">Transition Goals (optional)</span>
                <span className="text-xs text-indigo-600 group-open:hidden">Show</span>
                <span className="text-xs text-indigo-600 hidden group-open:inline">Hide</span>
              </summary>
              <div className="mt-2">
                <PillMultiSelect
                  label="Goals"
                  options={GOAL_OPTIONS_SHIFTER}
                  value={s.transitionGoals ?? []}
                  onChange={(v) => onPatch({ transitionGoals: v })}
                  recommended={GOAL_OPTIONS_SHIFTER.slice(0,8)}
                  initialVisibleCount={8}
                  showSearch
                  onSelectAllRecommended={() => onPatch({ transitionGoals: Array.from(new Set([...(s.transitionGoals ?? []), ...GOAL_OPTIONS_SHIFTER.slice(0,8)])) })}
                />
                <p className="mt-1 text-[11px] text-gray-500">💡 Focus on practical steps for your transition timeline.</p>
              </div>
            </details>
          </div>
        </div>
        
        {/* Skill Transfer Insight */}
        {s.previousField && s.desiredField && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Transferable Skills Insight</h4>
            <p className="text-sm text-blue-700">
              Many skills from {s.previousField} can transfer to {s.desiredField}. Focus on highlighting 
              communication, problem-solving, and customer service experience in your transition.
            </p>
          </div>
        )}
      </div>
    );
  }

  return null;
}
