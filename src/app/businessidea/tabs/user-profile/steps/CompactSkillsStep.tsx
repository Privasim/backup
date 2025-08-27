"use client";

import React, { useMemo } from "react";
import { useUserProfile } from "../UserProfileContext";
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
import DropdownMultiSelect from "../components/DropdownMultiSelect";

type Props = {
  className?: string;
};

export default function CompactSkillsStep({ className = "" }: Props) {
  const { profileData, setProfileData } = useUserProfile();
  const { skills = [], role, industry, jobFunction, roleDetails } = profileData;

  const handleChange = (newSkills: string[]) => {
    setProfileData({ skills: newSkills });
  };

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
          recommended: TECHNICAL_SKILLS.INTERMEDIATE.slice(0, 4),
          bgColor: "bg-blue-50",
          borderColor: "border-blue-100"
        },
        {
          name: "Tools & Technologies",
          skills: [...TOOLING_SKILLS.DEVELOPMENT, ...TOOLING_SKILLS.PRODUCTIVITY],
          recommended: TOOLING_SKILLS.DEVELOPMENT.slice(0, 4),
          bgColor: "bg-purple-50",
          borderColor: "border-purple-100"
        },
        {
          name: "Soft Skills",
          skills: [...SOFT_SKILLS.COMMUNICATION, ...SOFT_SKILLS.COLLABORATION],
          recommended: SOFT_SKILLS.COMMUNICATION.slice(0, 4),
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
          recommended: (studentSkills.technical || []).slice(0, 3),
          bgColor: "bg-blue-50",
          borderColor: "border-blue-100",
          description: "Technical knowledge"
        },
        {
          name: "Academic & Research Skills",
          skills: studentSkills.academic || [],
          recommended: (studentSkills.academic || []).slice(0, 3),
          bgColor: "bg-indigo-50",
          borderColor: "border-indigo-100",
          description: "Research skills"
        },
        {
          name: "Essential Tools",
          skills: studentSkills.tooling || [],
          recommended: (studentSkills.tooling || []).slice(0, 3),
          bgColor: "bg-purple-50",
          borderColor: "border-purple-100",
          description: "Digital tools"
        },
        {
          name: "Personal & Communication Skills",
          skills: studentSkills.soft || [],
          recommended: (studentSkills.soft || []).slice(0, 3),
          bgColor: "bg-green-50",
          borderColor: "border-green-100",
          description: "Communication"
        }
      );
    } else if (role === Role.Professional) {
      const professionalSkills = roleSkillCategories as { technical: string[]; tooling: string[]; soft: string[]; business: string[]; };
      
      // Add industry-function specific skills if available
      if (industryFunctionSkills.length > 0) {
        categories.push({
          name: `${jobFunction} Skills`,
          skills: industryFunctionSkills,
          recommended: industryFunctionSkills.slice(0, 3),
          bgColor: "bg-amber-50",
          borderColor: "border-amber-100",
          description: `For ${jobFunction}`
        });
      }
      
      categories.push(
        {
          name: "Professional Technical Skills",
          skills: professionalSkills.technical || [],
          recommended: (professionalSkills.technical || []).slice(0, 3),
          bgColor: "bg-blue-50",
          borderColor: "border-blue-100",
          description: "Technical expertise"
        },
        {
          name: "Professional Tools",
          skills: professionalSkills.tooling || [],
          recommended: (professionalSkills.tooling || []).slice(0, 3),
          bgColor: "bg-purple-50",
          borderColor: "border-purple-100",
          description: "Tools & platforms"
        },
        {
          name: "Leadership & Communication",
          skills: professionalSkills.soft || [],
          recommended: (professionalSkills.soft || []).slice(0, 3),
          bgColor: "bg-green-50",
          borderColor: "border-green-100",
          description: "Communication"
        }
      );
    } else if (role === Role.BusinessOwner) {
      const businessSkills = roleSkillCategories as { business: string[]; leadership: string[]; technical: string[]; soft: string[]; };
      categories.push(
        {
          name: "Business Strategy",
          skills: businessSkills.business || [],
          recommended: (businessSkills.business || []).slice(0, 3),
          bgColor: "bg-emerald-50",
          borderColor: "border-emerald-100",
          description: "Strategy & operations"
        },
        {
          name: "Leadership",
          skills: businessSkills.leadership || [],
          recommended: (businessSkills.leadership || []).slice(0, 3),
          bgColor: "bg-rose-50",
          borderColor: "border-rose-100",
          description: "Management"
        },
        {
          name: "Business Technology",
          skills: businessSkills.technical || [],
          recommended: (businessSkills.technical || []).slice(0, 3),
          bgColor: "bg-blue-50",
          borderColor: "border-blue-100",
          description: "Tech tools"
        },
        {
          name: "Executive Skills",
          skills: businessSkills.soft || [],
          recommended: (businessSkills.soft || []).slice(0, 3),
          bgColor: "bg-amber-50",
          borderColor: "border-amber-100",
          description: "Strategic thinking"
        }
      );
    } else if (role === Role.CareerShifter) {
      const shifterSkills = roleSkillCategories as { transferable: string[]; emerging: string[]; soft: string[]; };
      categories.push(
        {
          name: "Transferable Skills",
          skills: shifterSkills.transferable || [],
          recommended: (shifterSkills.transferable || []).slice(0, 3),
          bgColor: "bg-teal-50",
          borderColor: "border-teal-100",
          description: "From previous experience"
        },
        {
          name: "Emerging Digital Skills",
          skills: shifterSkills.emerging || [],
          recommended: (shifterSkills.emerging || []).slice(0, 3),
          bgColor: "bg-cyan-50",
          borderColor: "border-cyan-100",
          description: "For new direction"
        },
        {
          name: "Personal Development",
          skills: shifterSkills.soft || [],
          recommended: (shifterSkills.soft || []).slice(0, 3),
          bgColor: "bg-green-50",
          borderColor: "border-green-100",
          description: "Soft skills"
        }
      );
      
      // Add target industry skills if available
      if (industryFunctionSkills.length > 0) {
        categories.push({
          name: `Target Role Skills`,
          skills: industryFunctionSkills,
          recommended: industryFunctionSkills.slice(0, 3),
          bgColor: "bg-violet-50",
          borderColor: "border-violet-100",
          description: `For ${jobFunction}`
        });
      }
    }

    return categories;
  }, [role, roleSkillCategories, industryFunctionSkills, jobFunction]);

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
        return "Focus on foundational skills for your field";
      case Role.Professional:
        return "Select skills reflecting your expertise";
      case Role.BusinessOwner:
        return "Choose skills critical for your business";
      case Role.CareerShifter:
        return "Highlight transferable and new skills";
      default:
        return "Select up to 10 skills";
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="space-y-0.5">
        <h3 className="text-xs font-medium text-indigo-600">Skills & Expertise</h3>
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-gray-500">{getRoleGuidance()}</p>
          <span className="text-[10px] font-medium text-gray-700">
            {skills.length}/10 {skills.length >= 10 && "• Max"}
          </span>
        </div>
      </div>
      
      {/* Horizontal scrollable tabs for skill categories */}
      <div className="border-b border-gray-200 -mx-1">
        <div className="flex overflow-x-auto no-scrollbar py-1 px-1 space-x-2">
          {skillCategories.map((category, idx) => {
            const selectedInCategory = skills.filter(skill => category.skills.includes(skill)).length;
            const isActive = idx === 0; // First tab active by default
            
            return (
              <button
                key={category.name}
                type="button"
                className={`whitespace-nowrap px-2.5 py-1 text-[10px] font-medium rounded-full flex items-center space-x-1
                  ${isActive 
                    ? `${category.bgColor} ${category.borderColor} text-gray-800` 
                    : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'}`}
              >
                <span>{category.name}</span>
                {selectedInCategory > 0 && (
                  <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-white text-[8px] font-medium">
                    {selectedInCategory}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Active skill category content */}
      <div className="pt-1">
        {skillCategories.map((category, index) => (
          <div key={category.name} className={index === 0 ? "" : "hidden"}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-gray-500">{category.description}</span>
              {category.recommended.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleChange(mergeCapped(skills, category.recommended, 10))}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800"
                  disabled={skills.length >= 10}
                >
                  Add recommended
                </button>
              )}
            </div>
            
            <DropdownMultiSelect 
              options={category.skills} 
              value={skills} 
              onChange={handleChange} 
              maxSelected={10} 
              recommended={category.recommended}
              placeholder={`Select ${category.name.toLowerCase()}...`}
              compact
            />
          </div>
        ))}
      </div>
      
      {/* Selected skills pills */}
      {skills.length > 0 && (
        <div className="pt-1 mt-1 border-t border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-medium text-gray-700">Selected Skills</span>
            <button
              type="button"
              onClick={() => handleChange([])}
              className="text-[10px] text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {skills.map(skill => (
              <div 
                key={skill}
                className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded-full text-[10px] flex items-center"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleChange(skills.filter(s => s !== skill))}
                  className="ml-1 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-1 pt-1 border-t border-gray-100">
        <div className="text-[10px] text-gray-500 flex items-center">
          <span className="mr-1">💡</span>
          <span>Focus on your strongest skills. You can update these anytime.</span>
        </div>
      </div>
    </div>
  );
}
