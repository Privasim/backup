"use client";

import React, { useMemo } from "react";
import DropdownMultiSelect from "../components/DropdownMultiSelect";
import CollapsibleSection from "../components/CollapsibleSection";
import { 
  Role, 
  ROLE_SKILL_MAPPING, 
  INDUSTRY_FUNCTION_SKILLS,
  TECHNICAL_SKILLS,
  BUSINESS_SKILLS,
  TOOLING_SKILLS,
  SOFT_SKILLS,
  ACADEMIC_SKILLS,
  TRANSFERABLE_SKILLS,
  LEADERSHIP_SKILLS
} from "../types";

type Props = {
  skills: string[];
  onChange: (skills: string[]) => void;
  // Additional context for conditional logic
  role?: Role;
  industry?: string;
  jobFunction?: string;
  roleDetails?: any;
};

export default function SkillsStep({ skills, onChange, role, industry, jobFunction, roleDetails }: Props) {
  // Get role-specific skill categories
  const roleSkillCategories = useMemo(() => {
    if (!role) return null;
    return ROLE_SKILL_MAPPING[role] || null;
  }, [role]);

  // Get industry and function specific skills
  const industryFunctionSkills = useMemo(() => {
    if (!industry || !jobFunction) return [];
    return INDUSTRY_FUNCTION_SKILLS[industry]?.[jobFunction] || [];
  }, [industry, jobFunction]);

  // Generate skill categories based on role
  const skillCategories = useMemo(() => {
    const categories: Array<{
      name: string;
      skills: string[];
      recommended: string[];
      bgColor: string;
      borderColor: string;
      description?: string;
    }> = [];

    if (!role || !roleSkillCategories) {
      // Fallback to original behavior
      return [
        {
          name: "Technical Skills",
          skills: TECHNICAL_SKILLS.INTERMEDIATE,
          recommended: TECHNICAL_SKILLS.INTERMEDIATE.slice(0, 8),
          bgColor: "bg-blue-50",
          borderColor: "border-blue-100"
        },
        {
          name: "Tools & Technologies",
          skills: [...TOOLING_SKILLS.DEVELOPMENT, ...TOOLING_SKILLS.PRODUCTIVITY],
          recommended: TOOLING_SKILLS.DEVELOPMENT.slice(0, 8),
          bgColor: "bg-purple-50",
          borderColor: "border-purple-100"
        },
        {
          name: "Soft Skills",
          skills: [...SOFT_SKILLS.COMMUNICATION, ...SOFT_SKILLS.COLLABORATION],
          recommended: SOFT_SKILLS.COMMUNICATION.slice(0, 8),
          bgColor: "bg-green-50",
          borderColor: "border-green-100"
        }
      ];
    }

    // Role-specific categories
    if (role === Role.Student) {
      const studentSkills = roleSkillCategories as { technical: string[]; tooling: string[]; soft: string[]; academic: string[]; };
      categories.push(
        {
          name: "Foundational Technical Skills",
          skills: studentSkills.technical || [],
          recommended: (studentSkills.technical || []).slice(0, 6),
          bgColor: "bg-blue-50",
          borderColor: "border-blue-100",
          description: "Foundational technical knowledge and concepts"
        },
        {
          name: "Academic & Research Skills",
          skills: studentSkills.academic || [],
          recommended: (studentSkills.academic || []).slice(0, 6),
          bgColor: "bg-indigo-50",
          borderColor: "border-indigo-100",
          description: "Academic research and study skills"
        },
        {
          name: "Essential Tools",
          skills: studentSkills.tooling || [],
          recommended: (studentSkills.tooling || []).slice(0, 6),
          bgColor: "bg-purple-50",
          borderColor: "border-purple-100",
          description: "Digital tools for productivity and collaboration"
        },
        {
          name: "Personal & Communication Skills",
          skills: studentSkills.soft || [],
          recommended: (studentSkills.soft || []).slice(0, 6),
          bgColor: "bg-green-50",
          borderColor: "border-green-100",
          description: "Communication and personal development skills"
        }
      );
    } else if (role === Role.Professional) {
      const professionalSkills = roleSkillCategories as { technical: string[]; tooling: string[]; soft: string[]; business: string[]; };
      
      // Add industry-function specific skills if available
      if (industryFunctionSkills.length > 0) {
        categories.push({
          name: `${jobFunction} Skills`,
          skills: industryFunctionSkills,
          recommended: industryFunctionSkills.slice(0, 8),
          bgColor: "bg-amber-50",
          borderColor: "border-amber-100",
          description: `Specialized skills for ${jobFunction} in ${industry}`
        });
      }
      
      categories.push(
        {
          name: "Professional Technical Skills",
          skills: professionalSkills.technical || [],
          recommended: (professionalSkills.technical || []).slice(0, 6),
          bgColor: "bg-blue-50",
          borderColor: "border-blue-100",
          description: "Technical skills for your professional role"
        },
        {
          name: "Professional Tools",
          skills: professionalSkills.tooling || [],
          recommended: (professionalSkills.tooling || []).slice(0, 6),
          bgColor: "bg-purple-50",
          borderColor: "border-purple-100",
          description: "Tools and platforms you use professionally"
        },
        {
          name: "Leadership & Communication",
          skills: professionalSkills.soft || [],
          recommended: (professionalSkills.soft || []).slice(0, 6),
          bgColor: "bg-green-50",
          borderColor: "border-green-100",
          description: "Communication and leadership abilities"
        }
      );
    } else if (role === Role.BusinessOwner) {
      const businessSkills = roleSkillCategories as { business: string[]; leadership: string[]; technical: string[]; soft: string[]; };
      categories.push(
        {
          name: "Business Strategy & Operations",
          skills: businessSkills.business || [],
          recommended: (businessSkills.business || []).slice(0, 8),
          bgColor: "bg-emerald-50",
          borderColor: "border-emerald-100",
          description: "Business strategy and operations expertise"
        },
        {
          name: "Leadership & Management",
          skills: businessSkills.leadership || [],
          recommended: (businessSkills.leadership || []).slice(0, 6),
          bgColor: "bg-rose-50",
          borderColor: "border-rose-100",
          description: "Team leadership and management capabilities"
        },
        {
          name: "Business Technology",
          skills: businessSkills.technical || [],
          recommended: (businessSkills.technical || []).slice(0, 6),
          bgColor: "bg-blue-50",
          borderColor: "border-blue-100",
          description: "Technology tools for business efficiency"
        },
        {
          name: "Executive Skills",
          skills: businessSkills.soft || [],
          recommended: (businessSkills.soft || []).slice(0, 6),
          bgColor: "bg-amber-50",
          borderColor: "border-amber-100",
          description: "Executive communication and strategic thinking"
        }
      );
    } else if (role === Role.CareerShifter) {
      const shifterSkills = roleSkillCategories as { transferable: string[]; emerging: string[]; soft: string[]; };
      categories.push(
        {
          name: "Transferable Skills",
          skills: shifterSkills.transferable || [],
          recommended: (shifterSkills.transferable || []).slice(0, 8),
          bgColor: "bg-teal-50",
          borderColor: "border-teal-100",
          description: "Universal skills from your previous experience"
        },
        {
          name: "Emerging Digital Skills",
          skills: shifterSkills.emerging || [],
          recommended: (shifterSkills.emerging || []).slice(0, 6),
          bgColor: "bg-cyan-50",
          borderColor: "border-cyan-100",
          description: "Digital skills for your new career direction"
        },
        {
          name: "Personal Development",
          skills: shifterSkills.soft || [],
          recommended: (shifterSkills.soft || []).slice(0, 6),
          bgColor: "bg-green-50",
          borderColor: "border-green-100",
          description: "Soft skills for career transition success"
        }
      );
      
      // Add target industry skills if available
      if (industryFunctionSkills.length > 0) {
        categories.push({
          name: `Target Role Skills (${jobFunction})`,
          skills: industryFunctionSkills,
          recommended: industryFunctionSkills.slice(0, 6),
          bgColor: "bg-violet-50",
          borderColor: "border-violet-100",
          description: `Skills to develop for your target role in ${industry}`
        });
      }
    }

    return categories;
  }, [role, roleSkillCategories, industryFunctionSkills, jobFunction, industry]);

  const mergeCapped = (current: string[], additions: string[], cap = 10) => {
    const set = new Set(current);
    const merged: string[] = [...current];
    for (const a of additions) {
      if (!set.has(a) && merged.length < cap) {
        set.add(a);
        merged.push(a);
      }
    }
    return merged;
  };

  // Role-specific guidance text
  const getRoleGuidance = () => {
    switch (role) {
      case Role.Student:
        return "Focus on foundational skills and those relevant to your field of study. You can always add more advanced skills as you learn.";
      case Role.Professional:
        return "Select skills that reflect your current expertise and those you're developing for career advancement.";
      case Role.BusinessOwner:
        return "Choose skills that are critical for running your business and leading your team effectively.";
      case Role.CareerShifter:
        return "Highlight transferable skills from your previous experience and new skills you're developing for your target role.";
      default:
        return "Select up to 10 skills that best represent your expertise";
    }
  };

  return (
    <div className="p-1">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-indigo-600 mb-1">Skills & Expertise</h3>
        <p className="text-xs text-gray-500">{getRoleGuidance()}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-700">
            Skills Selected: {skills.length}/10
          </span>
          {skills.length >= 10 && (
            <span className="text-xs text-indigo-600 font-medium">Maximum reached</span>
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        {skillCategories.map((category, index) => {
          const selectedInCategory = skills.filter(skill => category.skills.includes(skill)).length;
          const categoryBadge = selectedInCategory > 0 ? `${selectedInCategory} selected` : undefined;
          
          return (
            <CollapsibleSection
              key={category.name}
              title={category.name}
              subtitle={category.description}
              badge={categoryBadge}
              defaultExpanded={index === 0} // First category expanded by default
              compact
            >
              <DropdownMultiSelect 
                options={category.skills} 
                value={skills} 
                onChange={onChange} 
                maxSelected={10} 
                recommended={category.recommended}
                onSelectAllRecommended={() => onChange(mergeCapped(skills, category.recommended, 10))}
                placeholder={`Select ${category.name.toLowerCase()}...`}
                compact
              />
            </CollapsibleSection>
          );
        })}
      </div>
      
      <div className="mt-4 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
        <div className="text-xs text-gray-500">
          💡 Tip: Focus on your strongest skills. You can update these anytime in your profile.
        </div>
      </div>
    </div>
  );
}
