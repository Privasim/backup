'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuizForm } from '@/hooks/useQuizForm';
import { 
  getJobDescriptions, 
  getContextForJob, 
  getExperienceOptions,
  getIndustryOptions,
  getLocationOptions,
  getSalaryOptions,
  validateJobKey
} from '@/lib/quiz/data';
import { JobContext } from '@/lib/quiz/types';
import Dropdown from './Dropdown';
import SkillSelector from './SkillSelector';

export default function QuizForm() {
  const router = useRouter();
  const { state, actions } = useQuizForm();
  const prevJobDescriptionRef = useRef<string>('');
  
  const jobDescriptions = getJobDescriptions();

  // Load context data when job description changes
  useEffect(() => {
    if (state.data.jobDescription && 
        state.data.jobDescription !== prevJobDescriptionRef.current &&
        validateJobKey(state.data.jobDescription)) {
      
      const context = getContextForJob(state.data.jobDescription);
      if (context) {
        // Reset dependent fields when job description changes
        actions.resetDependentFields();
        prevJobDescriptionRef.current = state.data.jobDescription;
      }
    }
  }, [state.data.jobDescription]); // Only depend on jobDescription

  const contextData: JobContext | null = state.data.jobDescription 
    ? getContextForJob(state.data.jobDescription) 
    : null;

  const handleFieldChange = useCallback((field: keyof typeof state.data, value: string | string[]) => {
    actions.setField(field, value);
    actions.setTouched(field);
  }, [actions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    actions.setSubmitAttempted(true);
    
    if (!actions.validateForm()) {
      return;
    }

    actions.setSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store data in localStorage for results page
      localStorage.setItem('quizResults', JSON.stringify(state.data));
      
      // Navigate to assessment page
      router.push('/assessment');
    } catch (error) {
      console.error('Submission error:', error);
      actions.setError('submit', 'Failed to submit assessment. Please try again.');
    } finally {
      actions.setSubmitting(false);
    }
  };

  const canProceedToStep2 = state.data.jobDescription && !state.errors.jobDescription;
  const isFormComplete = actions.isStepComplete(1) && actions.isStepComplete(2);

  return (
    <div className="py-6 px-4">
      <div className="max-w-lg mx-auto">
        {/* Compact Progress Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            AI Risk Assessment
          </h1>
          <p className="text-sm text-gray-600 mb-4">
            Quick assessment to analyze AI's impact on your role
          </p>
          
          {/* Compact Progress Bar */}
          <div className="max-w-xs mx-auto">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-blue-600">Step {state.currentStep}/2</span>
              <span className="text-xs text-gray-500">{Math.round((state.currentStep / 2) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(state.currentStep / 2) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Compact Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Step 1: Job Selection */}
            <div className={`transition-all duration-300 ${state.currentStep >= 1 ? 'opacity-100' : 'opacity-50'}`}>
              <div className="flex items-center mb-4">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold mr-2 ${
                  actions.isStepComplete(1) 
                    ? 'bg-green-500 text-white' 
                    : 'bg-blue-600 text-white'
                }`}>
                  {actions.isStepComplete(1) ? (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    '1'
                  )}
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Your Role</h2>
              </div>
              
              <Dropdown
                label="What's your job title?"
                value={state.data.jobDescription}
                options={jobDescriptions}
                onChange={(value: string) => handleFieldChange('jobDescription', value)}
                placeholder="Select your primary job role"
                searchable={true}
                error={state.errors.jobDescription}
                touched={state.touched.jobDescription}
                required={true}
              />
            </div>

            {/* Step 2: Detailed Information */}
            {canProceedToStep2 && contextData && (
              <div className={`transition-all duration-300 ${state.currentStep >= 2 ? 'opacity-100' : 'opacity-50'}`}>
                <div className="flex items-center mb-4">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold mr-2 ${
                    actions.isStepComplete(2) 
                      ? 'bg-green-500 text-white' 
                      : 'bg-blue-600 text-white'
                  }`}>
                    {actions.isStepComplete(2) ? (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      '2'
                    )}
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Details</h2>
                </div>

                <div className="space-y-4">
                  <Dropdown
                    label="Experience Level"
                    value={state.data.experience}
                    options={getExperienceOptions(contextData.experiences)}
                    onChange={(value: string) => handleFieldChange('experience', value)}
                    placeholder="Years of experience"
                    groupBy={(option: any) => option.group || 'Other'}
                    error={state.errors.experience}
                    touched={state.touched.experience}
                    required={true}
                  />

                  <Dropdown
                    label="Industry"
                    value={state.data.industry}
                    options={getIndustryOptions(contextData.industries)}
                    onChange={(value: string) => handleFieldChange('industry', value)}
                    placeholder="Your industry sector"
                    searchable={true}
                    groupBy={(option: any) => option.group || 'Other'}
                    error={state.errors.industry}
                    touched={state.touched.industry}
                    required={true}
                  />

                  <Dropdown
                    label="Location"
                    value={state.data.location}
                    options={getLocationOptions(contextData.locations)}
                    onChange={(value: string) => handleFieldChange('location', value)}
                    placeholder="Work location"
                    groupBy={(option: any) => option.group || 'Other'}
                    error={state.errors.location}
                    touched={state.touched.location}
                    required={true}
                  />

                  <Dropdown
                    label="Salary Range"
                    value={state.data.salaryRange}
                    options={getSalaryOptions(contextData.salaryRanges)}
                    onChange={(value: string) => handleFieldChange('salaryRange', value)}
                    placeholder="Current salary range"
                    groupBy={(option: any) => option.group || 'Other'}
                    error={state.errors.salaryRange}
                    touched={state.touched.salaryRange}
                    required={true}
                  />
                </div>

                <SkillSelector
                  label="Skills & Technologies"
                  selectedSkills={state.data.skillSet}
                  availableSkills={contextData.skillSets}
                  onChange={(skills: string[]) => handleFieldChange('skillSet', skills)}
                  error={state.errors.skillSet}
                  touched={state.touched.skillSet}
                  required={true}
                  maxSelections={8}
                  searchable={true}
                />
              </div>
            )}

            {/* Submit Button */}
            {canProceedToStep2 && contextData && (
              <div className="pt-4 border-t border-gray-100">
                {state.errors.submit && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center text-red-800 text-sm">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {state.errors.submit}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!isFormComplete || state.isSubmitting}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none flex items-center justify-center text-sm"
                >
                  {state.isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    'Get AI Risk Assessment'
                  )}
                </button>
                
                <p className="text-center text-xs text-gray-500 mt-2">
                  Takes ~30 seconds
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Compact Trust Indicators */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center">
              <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Secure
            </div>
            <div className="flex items-center">
              <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              No Spam
            </div>
            <div className="flex items-center">
              <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Instant
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}