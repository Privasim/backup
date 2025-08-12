"use client";

import React from "react";
import PillMultiSelect from "../components/PillMultiSelect";
import { TECHNICAL_SKILLS, TOOLING_SKILLS, SOFT_SKILLS } from "../types";

type Props = {
  skills: string[];
  onChange: (skills: string[]) => void;
};

export default function SkillsStep({ skills, onChange }: Props) {
  return (
    <div className="p-1">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-indigo-600 mb-1">Skills & Expertise</h3>
        <p className="text-xs text-gray-500">Select up to 10 skills that best represent your expertise</p>
      </div>
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <PillMultiSelect 
            label="Technical Skills" 
            options={TECHNICAL_SKILLS} 
            value={skills} 
            onChange={onChange} 
            maxSelected={10} 
          />
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <PillMultiSelect 
            label="Tools & Technologies" 
            options={TOOLING_SKILLS} 
            value={skills} 
            onChange={onChange} 
            maxSelected={10} 
          />
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <PillMultiSelect 
            label="Soft Skills" 
            options={SOFT_SKILLS} 
            value={skills} 
            onChange={onChange} 
            maxSelected={10} 
          />
        </div>
      </div>
    </div>
  );
}
