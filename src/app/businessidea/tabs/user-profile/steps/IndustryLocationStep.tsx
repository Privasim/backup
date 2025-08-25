"use client";

import React, { useMemo } from "react";
import CompactSelect from "../components/CompactSelect";
import SegmentedControl from "../components/SegmentedControl";
import CollapsibleSection from "../components/CollapsibleSection";
import PillMultiSelect from "../components/PillMultiSelect";
import { 
  INDUSTRY_OPTIONS, 
  LOCATION_OPTIONS, 
  WorkPreference, 
  HOBBY_OPTIONS,
  INTEREST_OPTIONS,
  VALUE_OPTIONS,
  INTEREST_OPTIONS_BY_INDUSTRY
} from "../types";

type Props = {
  industry?: string;
  location?: string;
  workPreference?: WorkPreference;
  hobbies?: string[];
  interests?: string[];
  values?: string[];
  onChange: (patch: { 
    industry?: string; 
    location?: string; 
    workPreference?: WorkPreference;
    hobbies?: string[];
    interests?: string[];
    values?: string[];
  }) => void;
};

export default function IndustryLocationStep({ industry, location, workPreference, hobbies = [], interests = [], values = [], onChange }: Props) {
  const interestOptions = useMemo(() => (
    industry ? (INTEREST_OPTIONS_BY_INDUSTRY[industry] || INTEREST_OPTIONS) : INTEREST_OPTIONS
  ), [industry]);

  const recommendedInterests = useMemo(() => interestOptions.slice(0, 6), [interestOptions]);
  const recommendedHobbies = useMemo(() => HOBBY_OPTIONS.slice(0, 6), []);
  const recommendedValues = useMemo(() => VALUE_OPTIONS.slice(0, 6), []);

  return (
    <div className="p-1">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-indigo-600 mb-1">Industry & Location</h3>
        <p className="text-xs text-gray-500">Tell us about your industry and preferred work location</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <CompactSelect 
          label="Industry" 
          value={industry} 
          onChange={(v) => onChange({ industry: v })} 
          options={INDUSTRY_OPTIONS} 
          required
        />
        <CompactSelect 
          label="Location" 
          value={location} 
          onChange={(v) => onChange({ location: v })} 
          options={LOCATION_OPTIONS} 
          required
        />
        <div className="md:col-span-2">
          <SegmentedControl 
            label="Work Preference" 
            options={["Remote","Hybrid","On-site"]} 
            value={workPreference} 
            onChange={(v) => onChange({ workPreference: v as WorkPreference })} 
          />
        </div>
      </div>
      
      <div className="mt-4">
        <CollapsibleSection
          title="Interests"
          subtitle="Select topics that interest you professionally"
          defaultExpanded={true}
          compact
        >
          <PillMultiSelect
            label=""
            options={interestOptions}
            value={interests}
            onChange={(v) => onChange({ interests: v })}
            recommended={recommendedInterests}
            initialVisibleCount={8}
            showSearch
            onSelectAllRecommended={() => {
              const merged = Array.from(new Set([...(interests || []), ...recommendedInterests]));
              onChange({ interests: merged });
            }}
          />
          <p className="mt-2 text-[11px] text-gray-500">💡 Start with a few that resonate. You can add more anytime.</p>
        </CollapsibleSection>
      </div>

      <div className="mt-3">
        <CollapsibleSection
          title="Personal Details"
          subtitle="Hobbies and values help us tailor suggestions"
          badge="optional"
          defaultExpanded={false}
          compact
        >
          <div className="space-y-4">
            <PillMultiSelect
              label="Hobbies"
              options={HOBBY_OPTIONS}
              value={hobbies}
              onChange={(v) => onChange({ hobbies: v })}
              recommended={recommendedHobbies}
              initialVisibleCount={6}
              onSelectAllRecommended={() => {
                const merged = Array.from(new Set([...(hobbies || []), ...recommendedHobbies]));
                onChange({ hobbies: merged });
              }}
            />
            
            <PillMultiSelect
              label="Values & Motivators"
              options={VALUE_OPTIONS}
              value={values}
              onChange={(v) => onChange({ values: v })}
              recommended={recommendedValues}
              initialVisibleCount={6}
              showSearch
              onSelectAllRecommended={() => {
                const merged = Array.from(new Set([...(values || []), ...recommendedValues]));
                onChange({ values: merged });
              }}
            />
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}
