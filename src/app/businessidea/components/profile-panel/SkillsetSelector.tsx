'use client';

import { useState } from 'react';
import { useProfile } from '../../context/ProfileContext';

const SKILL_CATEGORIES = {
  technical: 'Technical Skills',
  soft: 'Soft Skills',
  languages: 'Languages',
  certifications: 'Certifications'
} as const;

const SkillsetSelector = () => {
  const { profile, updateSkillset, nextStep, prevStep } = useProfile();
  const [currentSkill, setCurrentSkill] = useState('');
  const [currentCategory, setCurrentCategory] = useState<keyof typeof SKILL_CATEGORIES>('technical');

  const handleAddSkill = () => {
    if (!currentSkill.trim()) return;
    
    const currentSkills = [...(profile.skillset?.[currentCategory] || [])];
    if (!currentSkills.includes(currentSkill)) {
      updateSkillset({
        ...profile.skillset,
        [currentCategory]: [...currentSkills, currentSkill]
      });
      setCurrentSkill('');
    }
  };

  const removeSkill = (category: string, skill: string) => {
    const currentSkills = [...(profile.skillset?.[category as keyof typeof SKILL_CATEGORIES] || [])];
    updateSkillset({
      ...profile.skillset,
      [category]: currentSkills.filter(s => s !== skill)
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700">Tell us your skillset/expertise</h3>
      
      <div className="space-y-2">
        <div className="flex space-x-2">
          <select
            value={currentCategory}
            onChange={(e) => setCurrentCategory(e.target.value as keyof typeof SKILL_CATEGORIES)}
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
          >
            {Object.entries(SKILL_CATEGORIES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          
          <input
            type="text"
            value={currentSkill}
            onChange={(e) => setCurrentSkill(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
            placeholder="Add skill"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
          />
          
          <button
            onClick={handleAddSkill}
            className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
          >
            Add
          </button>
        </div>
        
        <div className="space-y-4 mt-4">
          {Object.entries(SKILL_CATEGORIES).map(([key, label]) => (
            <div key={key} className="space-y-1">
              <h4 className="text-xs font-medium text-gray-600">{label}</h4>
              <div className="flex flex-wrap gap-2">
                {profile.skillset?.[key as keyof typeof SKILL_CATEGORIES]?.map((skill) => (
                  <span 
                    key={`${key}-${skill}`}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {skill}
                    <button 
                      onClick={() => removeSkill(key, skill)}
                      className="ml-1.5 text-indigo-400 hover:text-indigo-600"
                      aria-label={`Remove ${skill}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                {(!profile.skillset?.[key as keyof typeof SKILL_CATEGORIES]?.length) && (
                  <span className="text-xs text-gray-400">None added yet</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between pt-4">
        <button
          onClick={prevStep}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          Back
        </button>
        <button
          onClick={nextStep}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SkillsetSelector;
