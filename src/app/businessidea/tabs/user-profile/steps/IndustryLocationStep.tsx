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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <CompactSelect label="Industry" value={industry} onChange={(v) => onChange({ industry: v })} options={INDUSTRY_OPTIONS} />
      <CompactSelect label="Location" value={location} onChange={(v) => onChange({ location: v })} options={LOCATION_OPTIONS} />
      <div className="md:col-span-2">
        <SegmentedControl label="Work Preference" options={["Remote","Hybrid","On-site"]} value={workPreference} onChange={(v) => onChange({ workPreference: v as WorkPreference })} />
      </div>
    </div>
  );
}
