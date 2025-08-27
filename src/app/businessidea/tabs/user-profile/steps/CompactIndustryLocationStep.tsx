"use client";

import React, { useMemo } from "react";
import { useUserProfile } from "../UserProfileContext";
import { 
  INDUSTRY_OPTIONS, 
  LOCATION_OPTIONS, 
  WorkPreference, 
  HOBBY_OPTIONS,
  INTEREST_OPTIONS,
  VALUE_OPTIONS,
  INTEREST_OPTIONS_BY_INDUSTRY
} from "../types";

// We'll need to create these compact components
import CompactSelect from "../components/CompactSelect";
import SegmentedControl from "../components/SegmentedControl";
import PillMultiSelect from "../components/PillMultiSelect";

type Props = {
  className?: string;
};

export default function CompactIndustryLocationStep({ className = "" }: Props) {
  const { profileData, setProfileData } = useUserProfile();
  const { industry, location, workPreference, hobbies = [], interests = [], values = [] } = profileData;

  const handleChange = (patch: { 
    industry?: string; 
    location?: string; 
    workPreference?: WorkPreference;
    hobbies?: string[];
    interests?: string[];
    values?: string[];
  }) => {
    setProfileData(patch);
  };

  const interestOptions = useMemo(() => (
    industry ? (INTEREST_OPTIONS_BY_INDUSTRY[industry] || INTEREST_OPTIONS) : INTEREST_OPTIONS
  ), [industry]);

  const recommendedInterests = useMemo(() => interestOptions.slice(0, 3), [interestOptions]);
  const recommendedHobbies = useMemo(() => HOBBY_OPTIONS.slice(0, 3), []);
  const recommendedValues = useMemo(() => VALUE_OPTIONS.slice(0, 3), []);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="space-y-0.5">
        <h3 className="text-xs font-medium text-indigo-600">Industry & Location</h3>
        <p className="text-[10px] text-gray-500">Work preferences</p>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <CompactSelect 
          label="Industry" 
          value={industry} 
          onChange={(v) => handleChange({ industry: v })} 
          options={INDUSTRY_OPTIONS} 
          required
        />
        <CompactSelect 
          label="Location" 
          value={location} 
          onChange={(v) => handleChange({ location: v })} 
          options={LOCATION_OPTIONS} 
          required
        />
      </div>
      
      <div>
        <SegmentedControl 
          label="Work Preference" 
          options={["Remote","Hybrid","On-site"]} 
          value={workPreference} 
          onChange={(v) => handleChange({ workPreference: v as WorkPreference })} 
        />
      </div>
      
      {/* Interests Section - Always visible but more compact */}
      <div className="mt-1 pt-1 border-t border-gray-100">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-700">Professional Interests</span>
          <span className="text-[10px] text-gray-400">Select 2-5</span>
        </div>
        <PillMultiSelect
          label=""
          options={interestOptions}
          value={interests}
          onChange={(v) => handleChange({ interests: v })}
          recommended={recommendedInterests}
          initialVisibleCount={3}
          showSearch
          onSelectAllRecommended={() => {
            const merged = Array.from(new Set([...(interests || []), ...recommendedInterests]));
            handleChange({ interests: merged });
          }}
        />
      </div>

      {/* Personal Details - Tabbed instead of collapsible */}
      <div className="mt-1 pt-1 border-t border-gray-100">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-700">Personal Details</span>
          <span className="text-[10px] text-gray-400 px-1.5 py-0.5 bg-gray-50 rounded">optional</span>
        </div>
        
        <div className="flex border-b border-gray-200">
          <button 
            className="px-2 py-1 text-[10px] font-medium border-b-2 border-indigo-500 text-indigo-600"
            type="button"
          >
            Hobbies
          </button>
          <button 
            className="px-2 py-1 text-[10px] font-medium text-gray-500 hover:text-gray-700"
            type="button"
          >
            Values
          </button>
        </div>
        
        <div className="pt-1">
          <PillMultiSelect
            label=""
            options={HOBBY_OPTIONS}
            value={hobbies}
            onChange={(v) => handleChange({ hobbies: v })}
            recommended={recommendedHobbies}
            initialVisibleCount={3}
            onSelectAllRecommended={() => {
              const merged = Array.from(new Set([...(hobbies || []), ...recommendedHobbies]));
              handleChange({ hobbies: merged });
            }}
          />
          
          {/* Values section would be toggled via the tab UI */}
          <div className="hidden">
            <PillMultiSelect
              label=""
              options={VALUE_OPTIONS}
              value={values}
              onChange={(v) => handleChange({ values: v })}
              recommended={recommendedValues}
              initialVisibleCount={3}
              showSearch
              onSelectAllRecommended={() => {
                const merged = Array.from(new Set([...(values || []), ...recommendedValues]));
                handleChange({ values: merged });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
