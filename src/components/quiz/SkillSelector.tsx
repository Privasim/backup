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
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      
      <div className="grid grid-cols-2 gap-2">
        {availableSkills.map((skill) => (
          <button
            key={skill}
            type="button"
            onClick={() => toggleSkill(skill)}
            className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
              selectedSkills.includes(skill)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-500'
            }`}
          >
            {skill}
          </button>
        ))}
      </div>
      
      {selectedSkills.length > 0 && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Selected: {selectedSkills.join(', ')}
        </div>
      )}
    </div>
  );
}