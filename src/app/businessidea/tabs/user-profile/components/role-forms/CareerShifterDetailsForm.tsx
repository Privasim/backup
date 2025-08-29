"use client";

import React, { useMemo } from "react";
import CompactSelect from "../CompactSelect";
import SegmentedControl from "../SegmentedControl";
import IncomeCurrencyField from "../fields/IncomeCurrencyField";
import ExperienceField from "../fields/ExperienceField";
import ChallengesGoalsField from "../fields/ChallengesGoalsField";
import {
  JOB_FUNCTION_BY_INDUSTRY,
  GOAL_OPTIONS_SHIFTER,
  WorkPreference,
  CareerShifterDetails
} from "../../types";

interface CareerShifterDetailsFormProps {
  data: CareerShifterDetails;
  onUpdate: (patch: Partial<CareerShifterDetails>) => void;
  industry?: string;
  workPreference?: WorkPreference;
  onWorkPreferenceChange?: (value: WorkPreference) => void;
  className?: string;
}

export default function CareerShifterDetailsForm({
  data,
  onUpdate,
  industry,
  workPreference,
  onWorkPreferenceChange,
  className = ""
}: CareerShifterDetailsFormProps) {
  // Enhanced previous field options
  const previousFieldOptions = [
    "Hospitality & Service", "Retail & Sales", "Education & Training", 
    "Operations & Logistics", "Healthcare", "Manufacturing", 
    "Government & Public Service", "Non-profit", "Military", "Other"
  ];
  
  // Get desired field options based on industry
  const desiredFieldOptions = useMemo(() => {
    if (!industry) return ["Technology", "Design", "Marketing", "Operations", "Finance", "Healthcare", "Education"];
    return JOB_FUNCTION_BY_INDUSTRY[industry] || ["Technology", "Design", "Marketing", "Operations", "Finance"];
  }, [industry]);

  const handleIncomeChange = (income: { range?: string; currency?: string; type?: string }) => {
    onUpdate({
      ...(income.range && { targetIncome: income.range }),
      ...(income.type && { compensationType: income.type })
    });
  };

  const handleExperienceChange = (experience: { type?: string; duration?: string; details?: string }) => {
    onUpdate({
      ...(experience.type && { transitionType: experience.type }),
      ...(experience.duration && { preparationTime: experience.duration })
    });
  };

  const handleGoalsChange = (goals: { current?: string[]; desired?: string[] }) => {
    onUpdate({
      transitionGoals: goals.desired
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-0.5">
        <h3 className="text-sm font-medium text-indigo-600">Career Transition</h3>
        <p className="text-xs text-gray-500">Your career journey and goals</p>
      </div>

      {/* Career Transition - Required */}
      <div className="grid grid-cols-2 gap-3">
        <CompactSelect
          label="Previous Field"
          value={data.previousField}
          onChange={(value) => onUpdate({ previousField: value })}
          options={previousFieldOptions}
          required
          placeholder="Select previous field"
        />
        <CompactSelect
          label="Desired Field"
          value={data.desiredField}
          onChange={(value) => onUpdate({ desiredField: value })}
          options={desiredFieldOptions}
          required
          placeholder={industry ? `Field in ${industry}` : "Select industry first"}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <CompactSelect
          label="Timeline"
          value={data.timeline}
          onChange={(value) => onUpdate({ timeline: value as "Immediate" | "3–6 months" | "6–12 months" })}
          options={["Immediate", "3–6 months", "6–12 months", "1+ years"]}
          required
          placeholder="Select timeline"
        />
        {onWorkPreferenceChange && (
          <SegmentedControl
            label="Work Preference"
            options={["Remote", "Hybrid", "On-site"]}
            value={workPreference}
            onChange={(value) => onWorkPreferenceChange(value as WorkPreference)}
          />
        )}
      </div>

      {/* Transition Experience */}
      <ExperienceField
        value={{
          type: (data as any).transitionType,
          duration: (data as any).preparationTime
        }}
        onChange={handleExperienceChange}
        typeOptions={["Self-study", "Bootcamp", "Online Course", "Certification", "Degree Program"]}
        durationOptions={["Just starting", "1–3 months", "3–6 months", "6–12 months", "1+ years"]}
        label="Transition Preparation"
      />

      {/* Target Compensation */}
      <IncomeCurrencyField
        value={{
          range: (data as any).targetIncome,
          currency: "USD",
          type: (data as any).compensationType
        }}
        onChange={handleIncomeChange}
        rangeOptions={["<$40k", "$40k–$60k", "$60k–$80k", "$80k–$100k", "$100k–$120k", "$120k+"]}
        typeOptions={["Salary", "Hourly", "Contract"]}
        label="Target Compensation"
      />

      {/* Skill Transfer Insight */}
      {data.previousField && data.desiredField && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-start gap-2">
            <span className="text-blue-500 text-sm">💡</span>
            <div>
              <h4 className="text-xs font-medium text-blue-800">Transferable Skills</h4>
              <p className="text-xs text-blue-700 mt-1">
                Skills from {data.previousField} like communication and problem-solving transfer well to {data.desiredField}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Goals */}
      <ChallengesGoalsField
        value={{
          desired: data.transitionGoals
        }}
        onChange={handleGoalsChange}
        goalOptions={GOAL_OPTIONS_SHIFTER}
        label="Transition Goals"
      />
    </div>
  );
}