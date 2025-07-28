'use client';

interface SkillSelectorProps {
  label: string;
  selectedSkills: string[];
  availableSkills: string[];
  onChange: (skills: string[]) => void;
}

export default function SkillSelector({ label, selectedSkills, availableSkills, onChange }: SkillSelectorProps) {
  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      onChange(selectedSkills.filter(s => s !== skill));
    } else {
      onChange([...selectedSkills, skill]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-3">
        {label}
      </label>
      
      <p className="text-sm text-gray-600 mb-4">
        Select all skills that apply to your current role (choose at least one)
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {availableSkills.map((skill) => (
          <button
            key={skill}
            type="button"
            onClick={() => toggleSkill(skill)}
            className={`px-4 py-3 text-sm font-medium rounded-xl border-2 transition-all duration-200 text-left ${
              selectedSkills.includes(skill)
                ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{skill}</span>
              {selectedSkills.includes(skill) && (
                <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>
      
      {selectedSkills.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">
                {selectedSkills.length} skill{selectedSkills.length !== 1 ? 's' : ''} selected
              </p>
              <p className="text-sm text-blue-700">
                {selectedSkills.join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}