"use client";

import React from "react";
import CompactSelect from "../CompactSelect";
import SegmentedControl from "../SegmentedControl";
import IncomeCurrencyField from "../fields/IncomeCurrencyField";
import ExperienceField from "../fields/ExperienceField";
import ChallengesGoalsField from "../fields/ChallengesGoalsField";
import {
  COMPANY_SIZE_OPTIONS,
  SECTOR_OPTIONS,
  TEAM_SIZE_OPTIONS,
  GOAL_OPTIONS_BUSINESS,
  BusinessOwnerDetails
} from "../../types";

interface BusinessOwnerDetailsFormProps {
  data: BusinessOwnerDetails;
  onUpdate: (patch: Partial<BusinessOwnerDetails>) => void;
  industry?: string;
  className?: string;
}

export default function BusinessOwnerDetailsForm({
  data,
  onUpdate,
  industry,
  className = ""
}: BusinessOwnerDetailsFormProps) {
  const handleRevenueChange = (revenue: { range?: string; currency?: string; type?: string }) => {
    onUpdate({
      ...(revenue.range && { revenueRange: revenue.range }),
      ...(revenue.type && { revenueType: revenue.type })
    });
  };

  const handleExperienceChange = (experience: { type?: string; duration?: string; details?: string }) => {
    onUpdate({
      ...(experience.type && { founderType: experience.type }),
      ...(experience.duration && { operatingDuration: experience.duration })
    });
  };

  const handleGoalsChange = (goals: { current?: string[]; desired?: string[] }) => {
    onUpdate({
      businessGoals: goals.desired
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-0.5">
        <h3 className="text-sm font-medium text-indigo-600">Business Details</h3>
        <p className="text-xs text-gray-500">About your business and goals</p>
      </div>

      {/* Core Business Info - Required */}
      <div className="grid grid-cols-2 gap-3">
        <CompactSelect
          label="Company Size"
          value={data.companySize}
          onChange={(value) => onUpdate({ companySize: value })}
          options={COMPANY_SIZE_OPTIONS}
          required
          placeholder="Select company size"
        />
        <CompactSelect
          label="Sector"
          value={data.sector}
          onChange={(value) => onUpdate({ sector: value })}
          options={SECTOR_OPTIONS}
          required
          placeholder="Select sector"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SegmentedControl
          label="Stage"
          options={["Idea", "MVP", "Growing", "Scaling"]}
          value={data.stage}
          onChange={(value) => onUpdate({ stage: value as "Idea" | "MVP" | "Growing" | "Scaling" })}
        />
        <CompactSelect
          label="Team Size"
          value={data.teamSize}
          onChange={(value) => onUpdate({ teamSize: value })}
          options={TEAM_SIZE_OPTIONS}
          required
          placeholder="Select team size"
        />
      </div>

      {/* Founder Experience */}
      <ExperienceField
        value={{
          type: (data as any).founderType,
          duration: (data as any).operatingDuration
        }}
        onChange={handleExperienceChange}
        typeOptions={["First-time Founder", "Serial Entrepreneur", "Acquired Founder", "Family Business"]}
        durationOptions={["<1 year", "1–3 years", "3–5 years", "5–10 years", "10+ years"]}
        label="Founder Experience"
      />

      {/* Revenue */}
      <IncomeCurrencyField
        value={{
          range: (data as any).revenueRange,
          currency: "USD",
          type: (data as any).revenueType
        }}
        onChange={handleRevenueChange}
        rangeOptions={["<$50k", "$50k–$100k", "$100k–$250k", "$250k–$1M", "$1M–$5M", "$5M+"]}
        typeOptions={["Pre-revenue", "Revenue", "Profitable"]}
        label="Business Revenue"
      />

      {/* Goals */}
      <ChallengesGoalsField
        value={{
          desired: data.businessGoals
        }}
        onChange={handleGoalsChange}
        goalOptions={GOAL_OPTIONS_BUSINESS}
        label="Business Goals"
      />
    </div>
  );
}