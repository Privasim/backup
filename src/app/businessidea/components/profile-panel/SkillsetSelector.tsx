'use client';

import { useState, useMemo } from 'react';
import { useProfile } from '../../context/ProfileContext';
import { Skill, SkillCategory, Certification, LanguageProficiency } from '../../types/profile.types';
import { MagnifyingGlassIcon, PlusIcon, StarIcon, TrashIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

// Popular skills by category for suggestions
const POPULAR_SKILLS = {
  technical: [
    'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'SQL', 'Git', 'AWS',
    'Docker', 'MongoDB', 'PostgreSQL', 'GraphQL', 'REST APIs', 'HTML/CSS',
    'Java', 'C++', 'Machine Learning', 'Data Analysis', 'Kubernetes', 'Jenkins'
  ],
  soft: [
    'Communication', 'Leadership', 'Problem Solving', 'Teamwork', 'Project Management',
    'Critical Thinking', 'Adaptability', 'Time Management', 'Creativity', 'Negotiation',
    'Public Speaking', 'Mentoring', 'Strategic Planning', 'Customer Service', 'Sales'
  ],
  languages: [
    'English', 'Spanish', 'French', 'German', 'Chinese (Mandarin)', 'Japanese',
    'Portuguese', 'Italian', 'Russian', 'Arabic', 'Hindi', 'Korean'
  ]
};

const PROFICIENCY_LEVELS = [
  { value: 1, label: 'Beginner', color: 'bg-red-100 text-red-800' },
  { value: 2, label: 'Basic', color: 'bg-orange-100 text-orange-800' },
  { value: 3, label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' },
  { value: 4, label: 'Advanced', color: 'bg-blue-100 text-blue-800' },
  { value: 5, label: 'Expert', color: 'bg-green-100 text-green-800' }
] as const;

const LANGUAGE_PROFICIENCY_LEVELS = [
  { value: 'basic', label: 'Basic', color: 'bg-red-100 text-red-800' },
  { value: 'conversational', label: 'Conversational', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'fluent', label: 'Fluent', color: 'bg-blue-100 text-blue-800' },
  { value: 'native', label: 'Native', color: 'bg-green-100 text-green-800' }
] as const;

const SkillsetSelector = () => {
  const { profileFormData, updateSkillset, nextStep, prevStep } = useProfile();
  const [activeTab, setActiveTab] = useState<'skills' | 'certifications' | 'languages'>('skills');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'technical' | 'soft'>('technical');

  const skillset = profileFormData.skillset || {
    technical: [],
    soft: [],
    languages: [],
    certifications: [],
    categories: [],
    certificationsDetailed: [],
    languageProficiency: []
  };

  // Filter popular skills based on search term
  const filteredPopularSkills = useMemo(() => {
    if (!searchTerm) return POPULAR_SKILLS[selectedCategory].slice(0, 10);
    
    return POPULAR_SKILLS[selectedCategory]
      .filter(skill => 
        skill.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !skillset.categories
          .find(cat => cat.name === selectedCategory)
          ?.skills.some(s => s.name.toLowerCase() === skill.toLowerCase())
      )
      .slice(0, 8);
  }, [searchTerm, selectedCategory, skillset.categories]);

  // Get skills for current category
  const currentCategorySkills = useMemo(() => {
    return skillset.categories.find(cat => cat.name === selectedCategory)?.skills || [];
  }, [skillset.categories, selectedCategory]);

  const addSkill = (skillName: string, proficiency: 1 | 2 | 3 | 4 | 5 = 3) => {
    const newSkill: Skill = {
      id: crypto.randomUUID(),
      name: skillName,
      category: selectedCategory,
      proficiency,
      highlight: false,
      source: 'manual'
    };

    const updatedCategories = [...skillset.categories];
    const categoryIndex = updatedCategories.findIndex(cat => cat.name === selectedCategory);
    
    if (categoryIndex >= 0) {
      updatedCategories[categoryIndex].skills.push(newSkill);
    } else {
      updatedCategories.push({
        id: crypto.randomUUID(),
        name: selectedCategory,
        skills: [newSkill]
      });
    }

    updateSkillset({
      ...skillset,
      categories: updatedCategories
    });
    setSearchTerm('');
  };

  const updateSkillProficiency = (skillId: string, proficiency: 1 | 2 | 3 | 4 | 5) => {
    const updatedCategories = skillset.categories.map(category => ({
      ...category,
      skills: category.skills.map(skill =>
        skill.id === skillId ? { ...skill, proficiency } : skill
      )
    }));

    updateSkillset({
      ...skillset,
      categories: updatedCategories
    });
  };

  const toggleSkillHighlight = (skillId: string) => {
    const updatedCategories = skillset.categories.map(category => ({
      ...category,
      skills: category.skills.map(skill =>
        skill.id === skillId ? { ...skill, highlight: !skill.highlight } : skill
      )
    }));

    updateSkillset({
      ...skillset,
      categories: updatedCategories
    });
  };

  const removeSkill = (skillId: string) => {
    const updatedCategories = skillset.categories.map(category => ({
      ...category,
      skills: category.skills.filter(skill => skill.id !== skillId)
    })).filter(category => category.skills.length > 0);

    updateSkillset({
      ...skillset,
      categories: updatedCategories
    });
  };

  const addCertification = (cert: Omit<Certification, 'id'>) => {
    const newCert: Certification = {
      ...cert,
      id: crypto.randomUUID()
    };

    updateSkillset({
      ...skillset,
      certificationsDetailed: [...skillset.certificationsDetailed, newCert]
    });
  };

  const removeCertification = (certId: string) => {
    updateSkillset({
      ...skillset,
      certificationsDetailed: skillset.certificationsDetailed.filter(cert => cert.id !== certId)
    });
  };

  const addLanguage = (lang: Omit<LanguageProficiency, 'id'>) => {
    const newLang: LanguageProficiency = {
      ...lang,
      id: crypto.randomUUID()
    };

    updateSkillset({
      ...skillset,
      languageProficiency: [...skillset.languageProficiency, newLang]
    });
  };

  const removeLanguage = (langId: string) => {
    updateSkillset({
      ...skillset,
      languageProficiency: skillset.languageProficiency.filter(lang => lang.id !== langId)
    });
  };

  const getProficiencyLabel = (level: number) => {
    return PROFICIENCY_LEVELS.find(p => p.value === level)?.label || 'Unknown';
  };

  const getProficiencyColor = (level: number) => {
    return PROFICIENCY_LEVELS.find(p => p.value === level)?.color || 'bg-gray-100 text-gray-800';
  };

  const getLanguageProficiencyColor = (level: string) => {
    return LANGUAGE_PROFICIENCY_LEVELS.find(p => p.value === level)?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Skills & Expertise</h3>
        <div className="text-xs text-gray-500">
          {skillset.categories.reduce((total, cat) => total + cat.skills.length, 0)} skills
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'skills', label: 'Skills', icon: '🎯' },
          { key: 'certifications', label: 'Certifications', icon: '🏆' },
          { key: 'languages', label: 'Languages', icon: '🌍' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-md text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Skills Tab */}
      {activeTab === 'skills' && (
        <div className="space-y-4">
          {/* Category Selection */}
          <div className="flex space-x-2">
            {[
              { key: 'technical', label: 'Technical', icon: '💻' },
              { key: 'soft', label: 'Soft Skills', icon: '🤝' }
            ].map(category => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key as any)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  selectedCategory === category.key
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>

          {/* Search and Add Skills */}
          <div className="space-y-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${selectedCategory} skills...`}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchTerm.trim()) {
                    addSkill(searchTerm.trim());
                  }
                }}
              />
            </div>

            {/* Popular Skills Suggestions */}
            {filteredPopularSkills.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500">Popular {selectedCategory} skills:</p>
                <div className="flex flex-wrap gap-1">
                  {filteredPopularSkills.map(skill => (
                    <button
                      key={skill}
                      onClick={() => addSkill(skill)}
                      className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 hover:bg-indigo-100 text-xs text-gray-700 hover:text-indigo-700 rounded-md transition-colors"
                    >
                      <PlusIcon className="h-3 w-3" />
                      <span>{skill}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Current Skills */}
          <div className="space-y-3">
            {currentCategorySkills.map(skill => (
              <div
                key={skill.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  skill.highlight 
                    ? 'border-yellow-300 bg-yellow-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleSkillHighlight(skill.id)}
                    className={`p-1 rounded-full transition-colors ${
                      skill.highlight 
                        ? 'text-yellow-500 hover:text-yellow-600' 
                        : 'text-gray-400 hover:text-yellow-500'
                    }`}
                    title={skill.highlight ? 'Remove highlight' : 'Highlight skill'}
                  >
                    {skill.highlight ? (
                      <StarIconSolid className="h-4 w-4" />
                    ) : (
                      <StarIcon className="h-4 w-4" />
                    )}
                  </button>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-900">{skill.name}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getProficiencyColor(skill.proficiency)}`}>
                        {getProficiencyLabel(skill.proficiency)}
                      </span>
                      {skill.yearsOfExperience && (
                        <span className="text-xs text-gray-500">
                          {skill.yearsOfExperience} years
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Proficiency Selector */}
                  <select
                    value={skill.proficiency}
                    onChange={(e) => updateSkillProficiency(skill.id, parseInt(e.target.value) as any)}
                    className="text-xs border-gray-300 rounded focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    {PROFICIENCY_LEVELS.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => removeSkill(skill.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Remove skill"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {currentCategorySkills.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <div className="text-2xl mb-2">
                  {selectedCategory === 'technical' ? '💻' : '🤝'}
                </div>
                <p className="text-sm">No {selectedCategory} skills added yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Search and add skills from the suggestions above
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Certifications Tab */}
      {activeTab === 'certifications' && (
        <CertificationManager
          certifications={skillset.certificationsDetailed}
          onAdd={addCertification}
          onRemove={removeCertification}
        />
      )}

      {/* Languages Tab */}
      {activeTab === 'languages' && (
        <LanguageManager
          languages={skillset.languageProficiency}
          onAdd={addLanguage}
          onRemove={removeLanguage}
          getLanguageProficiencyColor={getLanguageProficiencyColor}
        />
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-gray-200">
        <button
          onClick={prevStep}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Back
        </button>
        <button
          onClick={nextStep}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SkillsetSelector;

// Certification Manager Component
interface CertificationManagerProps {
  certifications: Certification[];
  onAdd: (cert: Omit<Certification, 'id'>) => void;
  onRemove: (certId: string) => void;
}

const CertificationManager: React.FC<CertificationManagerProps> = ({
  certifications,
  onAdd,
  onRemove
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    issuer: '',
    dateObtained: '',
    expiryDate: '',
    credentialId: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.issuer.trim() || !formData.dateObtained) {
      return;
    }

    onAdd({
      name: formData.name.trim(),
      issuer: formData.issuer.trim(),
      dateObtained: formData.dateObtained,
      expiryDate: formData.expiryDate || undefined,
      credentialId: formData.credentialId || undefined
    });

    setFormData({
      name: '',
      issuer: '',
      dateObtained: '',
      expiryDate: '',
      credentialId: ''
    });
    setIsAdding(false);
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return expiry <= threeMonthsFromNow;
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="space-y-4">
      {/* Certifications List */}
      <div className="space-y-3">
        {certifications.map(cert => (
          <div
            key={cert.id}
            className={`p-3 rounded-lg border transition-colors ${
              isExpired(cert.expiryDate)
                ? 'border-red-200 bg-red-50'
                : isExpiringSoon(cert.expiryDate)
                ? 'border-yellow-200 bg-yellow-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-sm font-medium text-gray-900">{cert.name}</h4>
                  {isExpired(cert.expiryDate) && (
                    <span className="text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded-full">
                      Expired
                    </span>
                  )}
                  {!isExpired(cert.expiryDate) && isExpiringSoon(cert.expiryDate) && (
                    <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">
                      Expiring Soon
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-1">{cert.issuer}</p>
                
                <div className="text-xs text-gray-500">
                  Obtained: {new Date(cert.dateObtained).toLocaleDateString()}
                  {cert.expiryDate && (
                    <span className="ml-2">
                      • Expires: {new Date(cert.expiryDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                
                {cert.credentialId && (
                  <p className="text-xs text-gray-500 mt-1">
                    ID: {cert.credentialId}
                  </p>
                )}
              </div>
              
              <button
                onClick={() => onRemove(cert.id)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Remove certification"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {certifications.length === 0 && !isAdding && (
          <div className="text-center py-6 text-gray-500">
            <div className="text-2xl mb-2">🏆</div>
            <p className="text-sm">No certifications added yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Add your professional certifications and credentials
            </p>
          </div>
        )}
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Certification Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., AWS Solutions Architect"
                  className="w-full text-sm border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Issuer *
                </label>
                <input
                  type="text"
                  value={formData.issuer}
                  onChange={(e) => setFormData(prev => ({ ...prev, issuer: e.target.value }))}
                  placeholder="e.g., Amazon Web Services"
                  className="w-full text-sm border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Date Obtained *
                </label>
                <input
                  type="month"
                  value={formData.dateObtained}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateObtained: e.target.value }))}
                  className="w-full text-sm border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="month"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                  className="w-full text-sm border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Credential ID
              </label>
              <input
                type="text"
                value={formData.credentialId}
                onChange={(e) => setFormData(prev => ({ ...prev, credentialId: e.target.value }))}
                placeholder="Optional credential ID or verification code"
                className="w-full text-sm border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition-colors"
              >
                Add Certification
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Button */}
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center justify-center space-x-2 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          <span className="text-sm">Add Certification</span>
        </button>
      )}
    </div>
  );
};

// Language Manager Component
interface LanguageManagerProps {
  languages: LanguageProficiency[];
  onAdd: (lang: Omit<LanguageProficiency, 'id'>) => void;
  onRemove: (langId: string) => void;
  getLanguageProficiencyColor: (level: string) => string;
}

const LanguageManager: React.FC<LanguageManagerProps> = ({
  languages,
  onAdd,
  onRemove,
  getLanguageProficiencyColor
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    language: '',
    proficiency: 'conversational' as LanguageProficiency['proficiency']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.language.trim()) return;

    // Check if language already exists
    if (languages.some(lang => lang.language.toLowerCase() === formData.language.toLowerCase())) {
      return;
    }

    onAdd({
      language: formData.language.trim(),
      proficiency: formData.proficiency
    });

    setFormData({
      language: '',
      proficiency: 'conversational'
    });
    setIsAdding(false);
  };

  const filteredLanguageSuggestions = POPULAR_SKILLS.languages.filter(lang =>
    !languages.some(existing => existing.language.toLowerCase() === lang.toLowerCase()) &&
    lang.toLowerCase().includes(formData.language.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Languages List */}
      <div className="space-y-3">
        {languages.map(lang => (
          <div
            key={lang.id}
            className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="text-lg">🌍</div>
              <div>
                <div className="text-sm font-medium text-gray-900">{lang.language}</div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getLanguageProficiencyColor(lang.proficiency)}`}>
                  {lang.proficiency.charAt(0).toUpperCase() + lang.proficiency.slice(1)}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => onRemove(lang.id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Remove language"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        ))}

        {languages.length === 0 && !isAdding && (
          <div className="text-center py-6 text-gray-500">
            <div className="text-2xl mb-2">🌍</div>
            <p className="text-sm">No languages added yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Add the languages you speak and your proficiency level
            </p>
          </div>
        )}
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Language *
              </label>
              <input
                type="text"
                value={formData.language}
                onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                placeholder="e.g., Spanish, French, Mandarin"
                className="w-full text-sm border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
              
              {/* Language Suggestions */}
              {formData.language && filteredLanguageSuggestions.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500">Suggestions:</p>
                  <div className="flex flex-wrap gap-1">
                    {filteredLanguageSuggestions.map(lang => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, language: lang }))}
                        className="text-xs px-2 py-1 bg-gray-100 hover:bg-indigo-100 text-gray-700 hover:text-indigo-700 rounded transition-colors"
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Proficiency Level *
              </label>
              <select
                value={formData.proficiency}
                onChange={(e) => setFormData(prev => ({ ...prev, proficiency: e.target.value as any }))}
                className="w-full text-sm border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
              >
                {LANGUAGE_PROFICIENCY_LEVELS.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition-colors"
              >
                Add Language
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Button */}
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center justify-center space-x-2 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          <span className="text-sm">Add Language</span>
        </button>
      )}
    </div>
  );
};