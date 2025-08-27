"use client";

import React from "react";
import { Role } from "../types";
import { useUserProfile } from "../UserProfileContext";

type Props = {
  className?: string;
};

const CARDS: { role: Role; title: string; desc: string; icon: React.ReactNode }[] = [
  { role: Role.Student, title: 'Student', desc: 'Currently studying', icon: "🎓" },
  { role: Role.Professional, title: 'Professional', desc: 'Working professional', icon: "💼" },
  { role: Role.BusinessOwner, title: 'Business Owner', desc: 'Founder/owner', icon: "🏢" },
  { role: Role.CareerShifter, title: 'Career Shifter', desc: 'New opportunities', icon: "🔄" },
];

export default function CompactRoleStep({ className = "" }: Props) {
  const { profileData, setProfileData } = useUserProfile();
  const role = profileData.role;
  
  const handleSelect = (selectedRole: Role) => {
    setProfileData({ role: selectedRole });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="space-y-1">
        <h3 className="text-base font-medium text-gray-900">Tell us about yourself</h3>
        <p className="text-xs text-gray-500">Select the option that best describes you.</p>
      </div>
      
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Select Role">
        {CARDS.map((c) => {
          const selected = role === c.role;
          return (
            <button
              key={c.title}
              type="button"
              onClick={() => handleSelect(c.role)}
              className={`group text-left p-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                selected 
                  ? 'border-indigo-500 bg-indigo-50 shadow-sm' 
                  : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
              }`}
              role="radio"
              aria-checked={selected}
            >
              <div className="flex items-center gap-2">
                <span 
                  className={`inline-flex items-center justify-center text-lg ${
                    selected ? 'text-indigo-600' : 'text-gray-500'
                  }`}
                >
                  {c.icon}
                </span>
                <div>
                  <div className={`text-xs font-medium ${selected ? 'text-indigo-700' : 'text-gray-900'}`}>
                    {c.title}
                  </div>
                  <div className="text-[10px] text-gray-500">{c.desc}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
