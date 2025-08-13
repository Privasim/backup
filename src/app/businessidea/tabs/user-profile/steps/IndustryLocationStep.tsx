"use client";

import React, { useMemo, useState } from "react";
import CompactSelect from "../components/CompactSelect";
import SegmentedControl from "../components/SegmentedControl";
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
  const [showPersonalization, setShowPersonalization] = useState(false);

  const interestOptions = useMemo(() => (
    industry ? (INTEREST_OPTIONS_BY_INDUSTRY[industry] || INTEREST_OPTIONS) : INTEREST_OPTIONS
  ), [industry]);

  const recommendedInterests = useMemo(() => interestOptions.slice(0, 8), [interestOptions]);
  const recommendedHobbies = useMemo(() => HOBBY_OPTIONS.slice(0, 8), []);
  const recommendedValues = useMemo(() => VALUE_OPTIONS.slice(0, 8), []);

  return (
    <div className="p-1">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-indigo-600 mb-1">Industry & Location</h3>
        <p className="text-xs text-gray-500">Tell us about your industry and preferred work location</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="md:col-span-2 mt-2">
          <SegmentedControl 
            label="Work Preference" 
            options={["Remote","Hybrid","On-site"]} 
            value={workPreference} 
            onChange={(v) => onChange({ workPreference: v as WorkPreference })} 
          />
        </div>
        
        <div className="col-span-2">
          <PillMultiSelect
            label="Interests"
            options={interestOptions}
            value={interests}
            onChange={(v) => onChange({ interests: v })}
            recommended={recommendedInterests}
            initialVisibleCount={10}
            showSearch
            onSelectAllRecommended={() => {
              const merged = Array.from(new Set([...(interests || []), ...recommendedInterests]));
              onChange({ interests: merged });
            }}
          />
          <p className="mt-1 text-[11px] text-gray-500">Tip: Start with a few that resonate. You can add more anytime.</p>
        </div>

        {/* Personalization (optional) */}
        <div className="col-span-2 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-800">Personalization (optional)</h4>
              <p className="text-xs text-gray-500">Hobbies and values help us tailor suggestions.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowPersonalization((s) => !s)}
              className="text-xs text-indigo-600 hover:text-indigo-700"
              aria-expanded={showPersonalization}
            >
              {showPersonalization ? 'Hide' : 'Show'}
            </button>
          </div>

          {showPersonalization && (
            <div className="mt-3 space-y-4">
              <div>
                <PillMultiSelect
                  label="Hobbies"
                  options={HOBBY_OPTIONS}
                  value={hobbies}
                  onChange={(v) => onChange({ hobbies: v })}
                  recommended={recommendedHobbies}
                  initialVisibleCount={8}
                  onSelectAllRecommended={() => {
                    const merged = Array.from(new Set([...(hobbies || []), ...recommendedHobbies]));
                    onChange({ hobbies: merged });
                  }}
                />
              </div>
              
              <div>
                <PillMultiSelect
                  label="Values & Motivators"
                  options={VALUE_OPTIONS}
                  value={values}
                  onChange={(v) => onChange({ values: v })}
                  recommended={recommendedValues}
                  initialVisibleCount={8}
                  showSearch
                  onSelectAllRecommended={() => {
                    const merged = Array.from(new Set([...(values || []), ...recommendedValues]));
                    onChange({ values: merged });
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
