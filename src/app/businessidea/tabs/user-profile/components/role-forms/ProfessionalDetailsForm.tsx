"use client";

import React, { useMemo } from "react";
import CompactSelect from "../CompactSelect";
import IncomeCurrencyField from "../fields/IncomeCurrencyField";
import ExperienceField from "../fields/ExperienceField";
import ChallengesGoalsField from "../fields/ChallengesGoalsField";
import {
  YEARS_EXPERIENCE_OPTIONS,
  JOB_FUNCTION_BY_INDUSTRY,
  SENIORITY_OPTIONS,
  GOAL_OPTIONS_PROFESSIONAL,
  ProfessionalDetails
} from "../../types";

interface ProfessionalDetailsFormProps {
  data: ProfessionalDetails;
  onUpdate: (patch: Partial<ProfessionalDetails>) => void;
  industry?: string;
  className?: string;
}

export default function ProfessionalDetailsForm({
  data,
  onUpdate,
  industry,
  className = ""
}: ProfessionalDetailsFormProps) {
  // Get job function options based on industry
  const jobFunctionOptions = useMemo(() => {
    if (!industry) return JOB_FUNCTION_BY_INDUSTRY["Technology"];
    return JOB_FUNCTION_BY_INDUSTRY[industry] || JOB_FUNCTION_BY_INDUSTRY["Technology"];
  }, [industry]);

  const handleIncomeChange = (income: { range?: string; currency?: string; type?: string }) => {
    onUpdate({
      ...(income.range && { currentIncome: income.range }),
      ...(income.type && { compensationType: income.type })
    });
  };

  const handleExperienceChange = (experience: { type?: string; duration?: string; details?: string }) => {
    onUpdate({
      ...(experience.type && { managementType: experience.type }),
      ...(experience.duration && { managementDuration: experience.duration })
    });
  };

  const handleGoalsChange = (goals: { current?: string[]; desired?: string[] }) => {
    onUpdate({
      professionalGoals: goals.desired
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-0.5">
        <h3 className="text-sm font-medium text-indigo-600">Professional Details</h3>
        <p className="text-xs text-gray-500">Work experience and career goals</p>
      </div>

      {/* Core Professional Info - Required */}
      <div className="grid grid-cols-2 gap-3">
        <CompactSelect
          label="Experience"
          value={data.yearsExperience}
          onChange={(value) => onUpdate({ yearsExperience: value })}
          options={YEARS_EXPERIENCE_OPTIONS}
          required
          placeholder="Years of experience"
        />
        <CompactSelect
          label="Function"
          value={data.jobFunction}
          onChange={(value) => onUpdate({ jobFunction: value })}
          options={jobFunctionOptions}
          required
          placeholder={industry ? `Function in ${industry}` : "Select industry first"}
        />
      </div>

      <CompactSelect
        label="Seniority"
        value={data.seniority}
        onChange={(value) => onUpdate({ seniority: value })}
        options={SENIORITY_OPTIONS}
        required
        placeholder="Select seniority level"
      />

      {/* Management Experience */}
      <ExperienceField
        value={{
          type: (data as any).managementType,
          duration: (data as any).managementDuration
        }}
        onChange={handleExperienceChange}
        typeOptions={["Individual Contributor", "Team Lead", "Manager", "Director", "VP+"]}
        durationOptions={["None", "<1 year", "1–3 years", "3–5 years", "5+ years"]}
        label="Management Experience"
      />

      {/* Compensation */}
      <IncomeCurrencyField
        value={{
          range: (data as any).currentIncome,
          currency: "USD",
          type: (data as any).compensationType
        }}
        onChange={handleIncomeChange}
        rangeOptions={["<$50k", "$50k–$75k", "$75k–$100k", "$100k–$150k", "$150k–$200k", "$200k+"]}
        typeOptions={["Salary", "Hourly", "Contract"]}
        label="Current Compensation"
      />

      {/* Goals */}
      <ChallengesGoalsField
        value={{
          desired: data.professionalGoals
        }}
        onChange={handleGoalsChange}
        goalOptions={GOAL_OPTIONS_PROFESSIONAL}
        label="Professional Goals"
      />
    </div>
  );
}