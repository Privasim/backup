'use client';

import React from 'react';
import { useProfile } from '../../context/ProfileContext';
import { PROFILE_TYPE_LABELS } from '../../types/profile.types';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ReviewStep = () => {
  const { profileFormData, saveProfile, prevStep, errors } = useProfile();
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const success = saveProfile();
      if (success) {
        setSaveSuccess(true);
        // Auto-advance after successful save
        setTimeout(() => {
          // This will trigger the PostSubmissionPanel to show
        }, 1000);
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getCompletionStats = () => {
    const stats = {
      profileComplete: !!profileFormData.profile.profileType,
      experienceCount: profileFormData.experience?.length || 0,
      skillsCount: profileFormData.skillset?.categories?.reduce((total, cat) => total + cat.skills.length, 0) || 0,
      certificationsCount: profileFormData.skillset?.certificationsDetailed?.length || 0,
      languagesCount: profileFormData.skillset?.languageProficiency?.length || 0
    };

    const totalItems = 1 + stats.experienceCount + stats.skillsCount + stats.certificationsCount + stats.languagesCount;
    const completedItems = (stats.profileComplete ? 1 : 0) + stats.experienceCount + stats.skillsCount + stats.certificationsCount + stats.languagesCount;
    
    return {
      ...stats,
      completionPercentage: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
      totalItems,
      completedItems
    };
  };

  const stats = getCompletionStats();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  const getProficiencyLabel = (level: number) => {
    const labels = ['', 'Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'];
    return labels[level] || 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Review Your Profile</h3>
        <p className="text-sm text-gray-600">
          Review your information before saving your profile
        </p>
      </div>

      {/* Completion Status */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">Profile Completion</h4>
          <span className="text-sm font-medium text-indigo-600">
            {stats.completionPercentage}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${stats.completionPercentage}%` }}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Profile Type:</span>
              <span className={stats.profileComplete ? 'text-green-600' : 'text-red-600'}>
                {stats.profileComplete ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Experience:</span>
              <span className="text-gray-900">{stats.experienceCount}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Skills:</span>
              <span className="text-gray-900">{stats.skillsCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Languages:</span>
              <span className="text-gray-900">{stats.languagesCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Summary */}
      <div className="space-y-4 max-h-64 overflow-y-auto">
        {/* Basic Profile Info */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <span className="mr-2">👤</span>
            Profile Type
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Type:</span>
              <span className="text-sm font-medium text-gray-900">
                {PROFILE_TYPE_LABELS[profileFormData.profile.profileType]}
              </span>
            </div>
            
            {/* Show conditional fields based on profile type */}
            {profileFormData.profile.currentRole && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current Role:</span>
                <span className="text-sm text-gray-900">{profileFormData.profile.currentRole}</span>
              </div>
            )}
            
            {profileFormData.profile.industry && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Industry:</span>
                <span className="text-sm text-gray-900">{profileFormData.profile.industry}</span>
              </div>
            )}
            
            {profileFormData.profile.yearsOfExperience && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Experience:</span>
                <span className="text-sm text-gray-900">{profileFormData.profile.yearsOfExperience} years</span>
              </div>
            )}
          </div>
        </div>

        {/* Experience Summary */}
        {stats.experienceCount > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <span className="mr-2">💼</span>
              Experience ({stats.experienceCount})
            </h4>
            <div className="space-y-2">
              {profileFormData.experience?.slice(0, 3).map((exp, index) => (
                <div key={exp.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{exp.title}</div>
                    <div className="text-xs text-gray-600">{exp.organization}</div>
                  </div>
                  <div className="text-xs text-gray-500 ml-2">
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : exp.endDate ? formatDate(exp.endDate) : 'Present'}
                  </div>
                </div>
              ))}
              {stats.experienceCount > 3 && (
                <div className="text-xs text-gray-500 text-center pt-1">
                  +{stats.experienceCount - 3} more entries
                </div>
              )}
            </div>
          </div>
        )}

        {/* Skills Summary */}
        {stats.skillsCount > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <span className="mr-2">🎯</span>
              Skills ({stats.skillsCount})
            </h4>
            <div className="space-y-3">
              {profileFormData.skillset?.categories?.map((category) => (
                <div key={category.id}>
                  <div className="text-xs font-medium text-gray-700 mb-1 capitalize">
                    {category.name} Skills:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {category.skills.slice(0, 5).map((skill) => (
                      <span
                        key={skill.id}
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                          skill.highlight 
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {skill.name}
                        <span className="ml-1 text-xs opacity-75">
                          ({getProficiencyLabel(skill.proficiency)})
                        </span>
                      </span>
                    ))}
                    {category.skills.length > 5 && (
                      <span className="text-xs text-gray-500">
                        +{category.skills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages & Certifications */}
        {(stats.languagesCount > 0 || stats.certificationsCount > 0) && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <span className="mr-2">🌍</span>
              Additional Qualifications
            </h4>
            
            {stats.languagesCount > 0 && (
              <div className="mb-3">
                <div className="text-xs font-medium text-gray-700 mb-1">
                  Languages ({stats.languagesCount}):
                </div>
                <div className="flex flex-wrap gap-1">
                  {profileFormData.skillset?.languageProficiency?.map((lang) => (
                    <span
                      key={lang.id}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800"
                    >
                      {lang.language} ({lang.proficiency})
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {stats.certificationsCount > 0 && (
              <div>
                <div className="text-xs font-medium text-gray-700 mb-1">
                  Certifications ({stats.certificationsCount}):
                </div>
                <div className="space-y-1">
                  {profileFormData.skillset?.certificationsDetailed?.slice(0, 3).map((cert) => (
                    <div key={cert.id} className="text-xs text-gray-600">
                      {cert.name} - {cert.issuer}
                    </div>
                  ))}
                  {stats.certificationsCount > 3 && (
                    <div className="text-xs text-gray-500">
                      +{stats.certificationsCount - 3} more certifications
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Validation Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <ExclamationTriangleIcon className="h-4 w-4 text-red-600 mr-2" />
            <h4 className="text-sm font-medium text-red-800">Please fix the following issues:</h4>
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-800">
              Profile saved successfully! 🎉
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-gray-200">
        <button
          onClick={prevStep}
          disabled={isSaving}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
        >
          Back
        </button>
        
        <button
          onClick={handleSave}
          disabled={isSaving || errors.length > 0}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
            isSaving || errors.length > 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : saveSuccess
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {isSaving ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : saveSuccess ? (
            'Saved ✓'
          ) : (
            'Save Profile'
          )}
        </button>
      </div>
    </div>
  );
};

export default ReviewStep;