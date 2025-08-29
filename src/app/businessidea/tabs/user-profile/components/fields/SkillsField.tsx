"use client";

import React, { useMemo } from "react";
import PillMultiSelect from "../PillMultiSelect";
import { Role, ROLE_SKILL_MAPPING, INDUSTRY_FUNCTION_SKILLS } from "../../types";

interface SkillsFieldProps {
  value: string[];
  onChange: (value: string[]) => void;
  role: Role;
  industry?: string;
  required?: boolean;
  className?: string;
}

export default function SkillsField({
  value,
  onChange,
  role,
  industry,
  required = false,
  className = ""
}: SkillsFieldProps) {
  // Generate role and industry-specific skill options
  const skillOptions = useMemo(() => {
    const roleSkills = ROLE_SKILL_MAPPING[role];
    let options: string[] = [];

    // Add role-specific skills
    if (roleSkills) {
      Object.values(roleSkills).forEach(skillArray => {
        if (Array.isArray(skillArray)) {
          options.push(...skillArray);
        }
      });
    }

    // Add industry-specific skills if available
    if (industry && INDUSTRY_FUNCTION_SKILLS[industry]) {
      Object.values(INDUSTRY_FUNCTION_SKILLS[industry]).forEach(skillArray => {
        options.push(...skillArray);
      });
    }

    // Remove duplicates and sort
    return Array.from(new Set(options)).sort();
  }, [role, industry]);

  // Get recommended skills based on role
  const recommendedSkills = useMemo(() => {
    const roleSkills = ROLE_SKILL_MAPPING[role];
    if (!roleSkills) return [];

    // Get first few skills from each category
    const recommended: string[] = [];
    Object.values(roleSkills).forEach(skillArray => {
      if (Array.isArray(skillArray)) {
        recommended.push(...skillArray.slice(0, 2));
      }
    });

    return recommended.slice(0, 5);
  }, [role]);

  const handleSelectAllRecommended = () => {
    const merged = Array.from(new Set([...value, ...recommendedSkills]));
    onChange(merged);
  };

  return (
    <div className={className}>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-700">Skills</span>
          <div className="flex items-center gap-2">
            {required && <span className="text-red-500 text-xs">*</span>}
            <span className="text-[10px] text-gray-400">Select 3-8 skills</span>
          </div>
        </div>
        <p className="text-[10px] text-gray-500">
          {role}-relevant skills {industry && `for ${industry}`}
        </p>
      </div>

      <PillMultiSelect
        label=""
        options={skillOptions}
        value={value}
        onChange={onChange}
        recommended={recommendedSkills}
        initialVisibleCount={6}
        showSearch
        onSelectAllRecommended={handleSelectAllRecommended}
        placeholder="Search skills..."
      />
    </div>
  );
}