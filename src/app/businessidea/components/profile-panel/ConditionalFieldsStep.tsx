'use client';

import React, { useState, useEffect } from 'react';
import { useProfile } from '../../context/ProfileContext';
import { CONDITIONAL_FIELD_CONFIG, ProfileType } from '../../types/profile.types';

interface FieldProps {
  label: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'textarea';
  options?: string[];
  placeholder?: string;
  required?: boolean;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

const Field: React.FC<FieldProps> = ({ 
  label, 
  name, 
  type, 
  options, 
  placeholder, 
  required, 
  value, 
  onChange, 
  error 
}) => {
  const baseClasses = "w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";
  const errorClasses = error ? "border-red-300" : "border-gray-300";

  const renderField = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            name={name}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`${baseClasses} ${errorClasses} resize-none`}
            rows={3}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            name={name}
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            placeholder={placeholder}
            className={`${baseClasses} ${errorClasses}`}
          />
        );
      
      case 'select':
        return (
          <select
            name={name}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`${baseClasses} ${errorClasses}`}
          >
            <option value="">Select {label.toLowerCase()}</option>
            {options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'multiselect':
        return (
          <div className="space-y-2">
            {options?.map(option => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      onChange([...currentValues, option]);
                    } else {
                      onChange(currentValues.filter(v => v !== option));
                    }
                  }}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );
      
      default:
        return (
          <input
            type="text"
            name={name}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`${baseClasses} ${errorClasses}`}
          />
        );
    }
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

const ConditionalFieldsStep: React.FC = () => {
  const { profileFormData, updateProfileData, errors, nextStep, prevStep } = useProfile();
  const [localData, setLocalData] = useState(profileFormData.profile);

  const profileType = profileFormData.profile.profileType;
  const config = CONDITIONAL_FIELD_CONFIG[profileType];

  useEffect(() => {
    setLocalData(profileFormData.profile);
  }, [profileFormData.profile]);

  const handleFieldChange = (field: string, value: any) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
    updateProfileData(updatedData);
  };

  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field)?.message;
  };

  const getFieldConfig = (field: string) => {
    const fieldConfigs: Record<string, Partial<FieldProps>> = {
      // Student fields
      educationLevel: {
        label: 'Education Level',
        type: 'select',
        options: ['High School', 'Associate Degree', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD', 'Other'],
        placeholder: 'Select your education level'
      },
      fieldOfStudy: {
        label: 'Field of Study',
        type: 'text',
        placeholder: 'e.g., Computer Science, Business, etc.'
      },
      graduationYear: {
        label: 'Graduation Year',
        type: 'number',
        placeholder: '2024'
      },
      interestedIndustries: {
        label: 'Industries of Interest',
        type: 'multiselect',
        options: ['Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing', 'Retail', 'Consulting', 'Media', 'Non-profit', 'Government']
      },
      
      // Professional fields
      currentRole: {
        label: 'Current Role',
        type: 'text',
        placeholder: 'e.g., Software Engineer, Marketing Manager'
      },
      industry: {
        label: 'Industry',
        type: 'select',
        options: ['Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing', 'Retail', 'Consulting', 'Media', 'Non-profit', 'Government', 'Other']
      },
      yearsOfExperience: {
        label: 'Years of Experience',
        type: 'number',
        placeholder: '5'
      },
      technologies: {
        label: 'Technologies/Tools',
        type: 'multiselect',
        options: ['JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'AWS', 'Docker', 'Git', 'Figma', 'Photoshop', 'Excel', 'Salesforce']
      },
      
      // Freelancer fields
      services: {
        label: 'Services Offered',
        type: 'multiselect',
        options: ['Web Development', 'Mobile Development', 'Design', 'Writing', 'Marketing', 'Consulting', 'Photography', 'Video Production', 'Translation', 'Data Analysis']
      },
      clientTypes: {
        label: 'Client Types',
        type: 'multiselect',
        options: ['Startups', 'Small Business', 'Enterprise', 'Agencies', 'Non-profits', 'Government', 'Individuals']
      },
      hourlyRate: {
        label: 'Hourly Rate (USD)',
        type: 'number',
        placeholder: '50'
      },
      
      // Entrepreneur fields
      businessStage: {
        label: 'Business Stage',
        type: 'select',
        options: ['idea', 'mvp', 'launched', 'profitable']
      },
      teamSize: {
        label: 'Team Size',
        type: 'number',
        placeholder: '5'
      },
      noCodeFamiliarity: {
        label: 'No-Code Tools Familiarity',
        type: 'select',
        options: ['None', 'Basic', 'Intermediate', 'Advanced']
      },
      fundingStage: {
        label: 'Funding Stage',
        type: 'select',
        options: ['Self-funded', 'Friends & Family', 'Angel', 'Seed', 'Series A+', 'Not seeking funding']
      },
      
      // Career shifter fields
      previousCareer: {
        label: 'Previous Career',
        type: 'text',
        placeholder: 'e.g., Teacher, Accountant, Sales Manager'
      },
      yearsInPreviousCareer: {
        label: 'Years in Previous Career',
        type: 'number',
        placeholder: '8'
      },
      targetIndustry: {
        label: 'Target Industry',
        type: 'select',
        options: ['Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing', 'Retail', 'Consulting', 'Media', 'Non-profit', 'Government', 'Other']
      },
      transitionReason: {
        label: 'Reason for Career Change',
        type: 'textarea',
        placeholder: 'What motivated you to change careers?'
      },
      
      // Unemployed fields
      lastRole: {
        label: 'Last Role',
        type: 'text',
        placeholder: 'e.g., Project Manager, Developer'
      },
      unemployedTargetIndustry: {
        label: 'Target Industry',
        type: 'select',
        options: ['Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing', 'Retail', 'Consulting', 'Media', 'Non-profit', 'Government', 'Other']
      },
      jobSearchDuration: {
        label: 'Job Search Duration (months)',
        type: 'number',
        placeholder: '3'
      },
      
      // Other
      customDescription: {
        label: 'Tell us about yourself',
        type: 'textarea',
        placeholder: 'Please describe your current situation, goals, and what you\'re looking for...'
      }
    };

    return fieldConfigs[field] || { label: field, type: 'text' };
  };

  const allFields = [...config.required, ...config.optional];

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Tell us more about yourself</h3>
        <p className="text-sm text-gray-600">
          Help us understand your background better by filling out these details.
        </p>
      </div>

      <div className="space-y-4">
        {allFields.map(field => {
          const fieldConfig = getFieldConfig(field);
          const isRequired = config.required.includes(field);
          
          return (
            <Field
              key={field}
              name={field}
              label={fieldConfig.label || field}
              type={fieldConfig.type || 'text'}
              options={fieldConfig.options}
              placeholder={fieldConfig.placeholder}
              required={isRequired}
              value={localData[field as keyof typeof localData]}
              onChange={(value) => handleFieldChange(field, value)}
              error={getFieldError(field)}
            />
          );
        })}
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={prevStep}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Back
        </button>
        <button
          onClick={nextStep}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ConditionalFieldsStep;