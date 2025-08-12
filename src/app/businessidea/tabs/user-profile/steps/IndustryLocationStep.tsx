"use client";

import React from "react";
import CompactSelect from "../components/CompactSelect";
import SegmentedControl from "../components/SegmentedControl";
import { INDUSTRY_OPTIONS, LOCATION_OPTIONS, WorkPreference } from "../types";

type Props = {
  industry?: string;
  location?: string;
  workPreference?: WorkPreference;
  onChange: (patch: { industry?: string; location?: string; workPreference?: WorkPreference }) => void;
};

export default function IndustryLocationStep({ industry, location, workPreference, onChange }: Props) {
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
      </div>
    </div>
  );
}
