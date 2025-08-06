'use client';

import React, { useState } from 'react';
import { useProfile } from '../../context/ProfileContext';
import { ExperienceEntry } from '../../types/profile.types';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

// Helper functions for dropdown options
const getIndustryOptions = (): string[] => [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Manufacturing',
  'Consulting',
  'Marketing',
  'Real Estate',
  'Legal',
  'Non-profit',
  'Government',
  'Media',
  'Entertainment',
  'Transportation',
  'Energy',
  'Agriculture',
  'Other'
];

const getCompanySizeOptions = (): string[] => [
  'Startup (1-10 employees)',
  'Small Business (11-50 employees)',
  'Medium Business (51-200 employees)',
  'Large Enterprise (201-1000 employees)',
  'Corporation (1000+ employees)',
  'Freelance/Self-employed'
];

const getRoleOptions = (): string[] => [
  'Software Engineer',
  'Product Manager',
  'Data Analyst',
  'Data Scientist',
  'UX Designer',
  'Marketing Manager',
  'Sales Representative',
  'Customer Success Manager',
  'Operations Manager',
  'Business Analyst',
  'Project Manager',
  'Consultant',
  'Teacher/Educator',
  'Financial Analyst',
  'Accountant',
  'Human Resources',
  'Legal Counsel',
  'Research Scientist',
  'Content Creator',
  'Graphic Designer',
  'Other'
];

const getSeniorityOptions = (): string[] => [
  'Entry Level',
  'Junior',
  'Mid-level',
  'Senior',
  'Lead',
  'Manager',
  'Director',
  'VP/Executive',
  'C-level'
];

const ExperienceStep = () => {
  const { profileFormData, updateExperience, nextStep, prevStep } = useProfile();
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);

  const experiences = profileFormData.experience || [];

  const handleAddEntry = () => {
    setIsAddingEntry(true);
    setEditingEntry(null);
  };

  const handleEditEntry = (id: string) => {
    setEditingEntry(id);
    setIsAddingEntry(false);
  };

  const handleDeleteEntry = (id: string) => {
    const updatedExperiences = experiences.filter(exp => exp.id !== id);
    updateExperience(updatedExperiences);
  };

  const handleSaveEntry = (entry: ExperienceEntry) => {
    let updatedExperiences;
    
    if (editingEntry) {
      // Update existing entry
      updatedExperiences = experiences.map(exp => 
        exp.id === editingEntry ? entry : exp
      );
    } else {
      // Add new entry
      updatedExperiences = [...experiences, entry];
    }
    
    updateExperience(updatedExperiences);
    setIsAddingEntry(false);
    setEditingEntry(null);
  };

  const handleCancelEdit = () => {
    setIsAddingEntry(false);
    setEditingEntry(null);
  };

  const getExperienceTypeLabel = (type: ExperienceEntry['type']) => {
    const labels = {
      work: 'Work Experience',
      education: 'Education',
      project: 'Project',
      volunteer: 'Volunteer Work'
    };
    return labels[type];
  };

  const getIndustryOptions = () => [
    'Technology',
    'Healthcare',
    'Education',
    'Finance',
    'Retail',
    'Manufacturing',
    'Marketing',
    'Consulting',
    'Government',
    'Non-profit',
    'Other'
  ];

  const getCompanySizeOptions = () => [
    'Startup (1-10 employees)',
    'Small Business (11-50 employees)',
    'Medium (51-200 employees)',
    'Large (200+ employees)',
    'Enterprise (1000+ employees)'
  ];

  const getRoleOptions = () => [
    'Software Developer',
    'Product Manager',
    'Designer',
    'Marketing',
    'Sales',
    'Operations',
    'Customer Support',
    'Finance',
    'Human Resources',
    'Data Analyst',
    'Project Manager',
    'Consultant',
    'Teacher/Educator',
    'Healthcare Professional',
    'Other'
  ];

  const getSeniorityOptions = () => [
    'Entry Level',
    'Junior',
    'Mid-level',
    'Senior',
    'Lead',
    'Manager',
    'Director',
    'Executive'
  ];

  const getExperienceIcon = (type: ExperienceEntry['type']) => {
    switch (type) {
      case 'work':
        return '💼';
      case 'education':
        return '🎓';
      case 'project':
        return '🚀';
      case 'volunteer':
        return '🤝';
      default:
        return '📋';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Your Experience</h3>
        <span className="text-xs text-gray-500">
          {experiences.length} {experiences.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      {/* Experience List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {experiences.map((experience) => (
          <div
            key={experience.id}
            className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm">{getExperienceIcon(experience.type)}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {getExperienceTypeLabel(experience.type)}
                  </span>
                </div>
                
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  {experience.title}
                </h4>
                
                <div className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">{experience.industry}</span>
                  <span className="text-gray-400 mx-1">•</span>
                  <span>{experience.companySize}</span>
                </div>
                
                <div className="text-xs text-gray-500">
                  {experience.industry} • {experience.companySize}
                </div>
                
                {experience.description && (
                  <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                    {experience.description}
                  </p>
                )}
              </div>
              
              <div className="flex space-x-1 ml-2">
                <button
                  onClick={() => handleEditEntry(experience.id)}
                  className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                  aria-label="Edit experience"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteEntry(experience.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  aria-label="Delete experience"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {experiences.length === 0 && !isAddingEntry && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-sm">No experience entries yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Add your work experience, education, projects, or volunteer work
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAddingEntry || editingEntry) && (
        <ExperienceEntryForm
          entry={editingEntry ? experiences.find(exp => exp.id === editingEntry) : undefined}
          onSave={handleSaveEntry}
          onCancel={handleCancelEdit}
        />
      )}

      {/* Add Button */}
      {!isAddingEntry && !editingEntry && (
        <button
          onClick={handleAddEntry}
          className="w-full flex items-center justify-center space-x-2 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          <span className="text-sm">Add Experience</span>
        </button>
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

// Experience Entry Form Component
interface ExperienceEntryFormProps {
  entry?: ExperienceEntry;
  onSave: (entry: ExperienceEntry) => void;
  onCancel: () => void;
}

const ExperienceEntryForm: React.FC<ExperienceEntryFormProps> = ({
  entry,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<Partial<ExperienceEntry>>({
    id: entry?.id || crypto.randomUUID(),
    type: entry?.type || 'work',
    title: entry?.title || '',
    industry: entry?.industry || '',
    companySize: entry?.companySize || '',
    seniority: entry?.seniority || '',
    description: entry?.description || '',
    skills: entry?.skills || [],
    achievements: entry?.achievements || []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Role is required';
    }
    if (!formData.industry?.trim()) {
      newErrors.industry = 'Industry is required';
    }
    if (!formData.companySize?.trim()) {
      newErrors.companySize = 'Company size is required';
    }
    if (!formData.seniority?.trim()) {
      newErrors.seniority = 'Seniority level is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSave(formData as ExperienceEntry);
  };

  const handleInputChange = (field: keyof ExperienceEntry, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Type Selection */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className="w-full text-sm border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="work">Work Experience</option>
            <option value="education">Education</option>
            <option value="project">Project</option>
            <option value="volunteer">Volunteer Work</option>
          </select>
        </div>

        {/* Role */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Role *
          </label>
          <select
            value={formData.title || ''}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`w-full text-sm border rounded-md focus:ring-indigo-500 ${
              errors.title ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
            }`}
          >
            <option value="">Select role...</option>
            {getRoleOptions().map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          {errors.title && (
            <p className="text-xs text-red-600 mt-1">{errors.title}</p>
          )}
        </div>

        {/* Seniority Level */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Seniority Level *
          </label>
          <select
            value={formData.seniority || ''}
            onChange={(e) => handleInputChange('seniority', e.target.value)}
            className={`w-full text-sm border rounded-md focus:ring-indigo-500 ${
              errors.seniority ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
            }`}
          >
            <option value="">Select level...</option>
            {getSeniorityOptions().map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
          {errors.seniority && (
            <p className="text-xs text-red-600 mt-1">{errors.seniority}</p>
          )}
        </div>

        {/* Industry */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Industry *
          </label>
          <select
            value={formData.industry || ''}
            onChange={(e) => handleInputChange('industry', e.target.value)}
            className={`w-full text-sm border rounded-md focus:ring-indigo-500 ${
              errors.industry ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
            }`}
          >
            <option value="">Select industry...</option>
            {getIndustryOptions().map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
          {errors.industry && (
            <p className="text-xs text-red-600 mt-1">{errors.industry}</p>
          )}
        </div>

        {/* Company Size */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Company Size *
          </label>
          <select
            value={formData.companySize || ''}
            onChange={(e) => handleInputChange('companySize', e.target.value)}
            className={`w-full text-sm border rounded-md focus:ring-indigo-500 ${
              errors.companySize ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
            }`}
          >
            <option value="">Select company size...</option>
            {getCompanySizeOptions().map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          {errors.companySize && (
            <p className="text-xs text-red-600 mt-1">{errors.companySize}</p>
          )}
        </div>

        {/* Removed date fields as per requirements */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Brief description of your role, responsibilities, or achievements..."
            rows={3}
            className="w-full text-sm border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition-colors"
          >
            {entry ? 'Update' : 'Add'} Experience
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExperienceStep;