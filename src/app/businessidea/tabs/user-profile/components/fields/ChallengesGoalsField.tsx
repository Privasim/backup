"use client";

import React from "react";
import PillMultiSelect from "../PillMultiSelect";

interface ChallengeGoalData {
  current?: string[];
  desired?: string[];
}

interface ChallengesGoalsFieldProps {
  value: ChallengeGoalData;
  onChange: (value: ChallengeGoalData) => void;
  goalOptions: string[];
  label?: string;
  required?: boolean;
  className?: string;
}

export default function ChallengesGoalsField({
  value,
  onChange,
  goalOptions,
  label = "Goals",
  required = false,
  className = ""
}: ChallengesGoalsFieldProps) {
  const handleGoalsChange = (goals: string[]) => {
    onChange({ ...value, desired: goals });
  };

  const recommendedGoals = goalOptions.slice(0, 3);

  const handleSelectAllRecommended = () => {
    const merged = Array.from(new Set([...(value.desired || []), ...recommendedGoals]));
    onChange({ ...value, desired: merged });
  };

  return (
    <div className={className}>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-700">{label}</span>
          <div className="flex items-center gap-2">
            {required && <span className="text-red-500 text-xs">*</span>}
            <span className="text-[10px] text-gray-400 px-1.5 py-0.5 bg-gray-50 rounded">optional</span>
          </div>
        </div>
        <p className="text-[10px] text-gray-500">Select your key objectives</p>
      </div>

      <PillMultiSelect
        label=""
        options={goalOptions}
        value={value.desired || []}
        onChange={handleGoalsChange}
        recommended={recommendedGoals}
        initialVisibleCount={3}
        showSearch
        onSelectAllRecommended={handleSelectAllRecommended}
        placeholder="Search goals..."
      />
    </div>
  );
}