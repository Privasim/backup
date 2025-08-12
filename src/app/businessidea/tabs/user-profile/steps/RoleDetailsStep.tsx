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
    return <div className="text-sm text-gray-600">Please select a role first.</div>;
  }

  if (roleDetails.role === Role.Student) {
    const s = roleDetails.student || {};
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <CompactSelect label="Education Level" value={s.educationLevel} onChange={(v) => onPatch({ educationLevel: v })} options={EDUCATION_LEVEL_OPTIONS} />
        <CompactSelect label="Field of Study" value={s.fieldOfStudy} onChange={(v) => onPatch({ fieldOfStudy: v })} options={FIELD_OF_STUDY_OPTIONS} />
        <CompactSelect label="Graduation Year" value={s.graduationYear} onChange={(v) => onPatch({ graduationYear: v })} options={GRAD_YEAR_OPTIONS} />
        <SegmentedControl label="Status" options={["Full-time", "Part-time"]} value={s.status} onChange={(v) => onPatch({ status: v })} />
      </div>
    );
  }

  if (roleDetails.role === Role.Professional) {
    const p = roleDetails.professional || {};
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <CompactSelect label="Years of Experience" value={p.yearsExperience} onChange={(v) => onPatch({ yearsExperience: v })} options={YEARS_EXPERIENCE_OPTIONS} />
        <CompactSelect label="Job Function" value={p.jobFunction} onChange={(v) => onPatch({ jobFunction: v })} options={JOB_FUNCTION_OPTIONS} />
        <CompactSelect label="Seniority" value={p.seniority} onChange={(v) => onPatch({ seniority: v })} options={SENIORITY_OPTIONS} />
      </div>
    );
  }

  if (roleDetails.role === Role.BusinessOwner) {
    const b = roleDetails.business || {};
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <CompactSelect label="Company Size" value={b.companySize} onChange={(v) => onPatch({ companySize: v })} options={COMPANY_SIZE_OPTIONS} />
        <CompactSelect label="Sector" value={b.sector} onChange={(v) => onPatch({ sector: v })} options={SECTOR_OPTIONS} />
        <SegmentedControl label="Stage" options={["Idea", "MVP", "Growing", "Scaling"]} value={b.stage} onChange={(v) => onPatch({ stage: v })} />
        <CompactSelect label="Team Size" value={b.teamSize} onChange={(v) => onPatch({ teamSize: v })} options={TEAM_SIZE_OPTIONS} />
      </div>
    );
  }

  if (roleDetails.role === Role.CareerShifter) {
    const s = roleDetails.shifter || {};
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <CompactSelect label="Previous Field" value={s.previousField} onChange={(v) => onPatch({ previousField: v })} options={["Hospitality","Retail","Education","Operations","Other"]} />
        <CompactSelect label="Desired Field" value={s.desiredField} onChange={(v) => onPatch({ desiredField: v })} options={["Technology","Design","Marketing","Operations","Finance"]} />
        <CompactSelect label="Timeline" value={s.timeline} onChange={(v) => onPatch({ timeline: v })} options={["Immediate","3–6 months","6–12 months"]} />
        <SegmentedControl label="Work Preference" options={["Remote","Hybrid","On-site"]} value={s.workPreference} onChange={(v) => onPatch({ workPreference: v })} />
      </div>
    );
  }

  return null;
}
