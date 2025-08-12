"use client";

import React from "react";
import CompactSelect from "../components/CompactSelect";
import SegmentedControl from "../components/SegmentedControl";
import {
  Role,
  RoleDetails,
  EDUCATION_LEVEL_OPTIONS,
  FIELD_OF_STUDY_OPTIONS,
  GRAD_YEAR_OPTIONS,
  YEARS_EXPERIENCE_OPTIONS,
  JOB_FUNCTION_OPTIONS,
  SENIORITY_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  SECTOR_OPTIONS,
  TEAM_SIZE_OPTIONS,
} from "../types";

type Props = {
  roleDetails?: RoleDetails;
  onPatch: (patch: Record<string, any>) => void;
};

export default function RoleDetailsStep({ roleDetails, onPatch }: Props) {
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
            onChange={(v) => onPatch({ educationLevel: v })} 
            options={EDUCATION_LEVEL_OPTIONS} 
            required
          />
          <CompactSelect 
            label="Field of Study" 
            value={s.fieldOfStudy} 
            onChange={(v) => onPatch({ fieldOfStudy: v })} 
            options={FIELD_OF_STUDY_OPTIONS} 
            required
          />
          <CompactSelect 
            label="Graduation Year" 
            value={s.graduationYear} 
            onChange={(v) => onPatch({ graduationYear: v })} 
            options={GRAD_YEAR_OPTIONS} 
            required
          />
          <SegmentedControl 
            label="Status" 
            options={["Full-time", "Part-time"]} 
            value={s.status} 
            onChange={(v) => onPatch({ status: v })} 
          />
        </div>
      </div>
    );
  }

  if (roleDetails.role === Role.Professional) {
    const p = roleDetails.professional || {};
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
            options={JOB_FUNCTION_OPTIONS} 
            required
          />
          <CompactSelect 
            label="Seniority" 
            value={p.seniority} 
            onChange={(v) => onPatch({ seniority: v })} 
            options={SENIORITY_OPTIONS} 
            required
          />
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
            label="Sector" 
            value={b.sector} 
            onChange={(v) => onPatch({ sector: v })} 
            options={SECTOR_OPTIONS} 
            required
          />
          <SegmentedControl 
            label="Stage" 
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
        </div>
      </div>
    );
  }

  if (roleDetails.role === Role.CareerShifter) {
    const s = roleDetails.shifter || {};
    return (
      <div className="p-1">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-indigo-600 mb-1">Career Transition Details</h3>
          <p className="text-xs text-gray-500">Tell us about your career transition goals</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CompactSelect 
            label="Previous Field" 
            value={s.previousField} 
            onChange={(v) => onPatch({ previousField: v })} 
            options={["Hospitality","Retail","Education","Operations","Other"]} 
            required
          />
          <CompactSelect 
            label="Desired Field" 
            value={s.desiredField} 
            onChange={(v) => onPatch({ desiredField: v })} 
            options={["Technology","Design","Marketing","Operations","Finance"]} 
            required
          />
          <CompactSelect 
            label="Timeline" 
            value={s.timeline} 
            onChange={(v) => onPatch({ timeline: v })} 
            options={["Immediate","3–6 months","6–12 months"]} 
            required
          />
          <SegmentedControl 
            label="Work Preference" 
            options={["Remote","Hybrid","On-site"]} 
            value={s.workPreference} 
            onChange={(v) => onPatch({ workPreference: v })} 
          />
        </div>
      </div>
    );
  }

  return null;
}
