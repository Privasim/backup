"use client";

import React from "react";
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
        
        <div className="col-span-2 mt-6">
          <PillMultiSelect
            label="Hobbies"
            options={HOBBY_OPTIONS}
            value={hobbies}
            onChange={(v) => onChange({ hobbies: v })}
          />
        </div>
        
        <div className="col-span-2">
          <PillMultiSelect
            label="Interests"
            options={industry ? (INTEREST_OPTIONS_BY_INDUSTRY[industry] || INTEREST_OPTIONS) : INTEREST_OPTIONS}
            value={interests}
            onChange={(v) => onChange({ interests: v })}
          />
        </div>
        
        <div className="col-span-2">
          <PillMultiSelect
            label="Values & Motivators"
            options={VALUE_OPTIONS}
            value={values}
            onChange={(v) => onChange({ values: v })}
          />
        </div>
      </div>
    </div>
  );
}
