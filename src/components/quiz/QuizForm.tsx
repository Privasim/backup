'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QuizData } from '@/lib/quiz/types';
import { getJobDescriptions, getContextForJob } from '@/lib/quiz/data';
import Dropdown from './Dropdown';
import SkillSelector from './SkillSelector';

export default function QuizForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<QuizData>({
    jobDescription: '',
    experience: '',
    industry: '',
    location: '',
    salaryRange: '',
    skillSet: []
  });

  const [contextData, setContextData] = useState<any>(null);
  const jobDescriptions = getJobDescriptions();

  useEffect(() => {
    if (formData.jobDescription) {
      const context = getContextForJob(formData.jobDescription);
      setContextData(context);
      
      // Reset dependent fields when job description changes
      setFormData(prev => ({
        ...prev,
        experience: '',
        industry: '',
        location: '',
        salaryRange: '',
        skillSet: []
      }));
      setCurrentStep(2);
    }
  }, [formData.jobDescription]);

  const handleFieldChange = (field: keyof QuizData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Store data in localStorage for results page
    localStorage.setItem('quizResults', JSON.stringify(formData));
    
    // Navigate to assessment page
    router.push('/assessment');
  };

  const isFormComplete = formData.jobDescription && formData.experience && formData.industry && formData.location && formData.salaryRange && formData.skillSet.length > 0;

  return (
    <div className="py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Progress Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Career Impact Assessment
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Help us understand your professional background to provide personalized insights about AI's impact on your career.
          </p>
          
          {/* Progress Bar */}
          <div className="mt-8 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-600">Step {currentStep} of 2</span>
              <span className="text-sm text-gray-500">{Math.round((currentStep / 2) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 2) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Job Selection */}
            <div className={`transition-all duration-300 ${currentStep >= 1 ? 'opacity-100' : 'opacity-50'}`}>
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                  1
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Tell us about your role</h2>
              </div>
              
              <Dropdown
                label="What's your job title?"
                value={formData.jobDescription}
                options={jobDescriptions.map(job => ({ 
                  value: job, 
                  label: job.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) 
                }))}
                onChange={(value) => handleFieldChange('jobDescription', value)}
                placeholder="Select your primary job role"
              />
            </div>

            {/* Step 2: Detailed Information */}
            {contextData && (
              <div className={`transition-all duration-300 ${currentStep >= 2 ? 'opacity-100' : 'opacity-50'}`}>
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                    2
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Professional details</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Dropdown
                    label="Experience Level"
                    value={formData.experience}
                    options={contextData.experiences.map((exp: string) => ({ value: exp, label: exp }))}
                    onChange={(value) => handleFieldChange('experience', value)}
                    placeholder="Years of experience"
                  />

                  <Dropdown
                    label="Industry"
                    value={formData.industry}
                    options={contextData.industries.map((ind: string) => ({ value: ind, label: ind }))}
                    onChange={(value) => handleFieldChange('industry', value)}
                    placeholder="Your industry sector"
                  />

                  <Dropdown
                    label="Location"
                    value={formData.location}
                    options={contextData.locations.map((loc: string) => ({ value: loc, label: loc }))}
                    onChange={(value) => handleFieldChange('location', value)}
                    placeholder="Work location"
                  />

                  <Dropdown
                    label="Salary Range"
                    value={formData.salaryRange}
                    options={contextData.salaryRanges.map((range: string) => ({ value: range, label: range }))}
                    onChange={(value) => handleFieldChange('salaryRange', value)}
                    placeholder="Current salary range"
                  />
                </div>

                <div className="mt-6">
                  <SkillSelector
                    label="Key Skills & Technologies"
                    selectedSkills={formData.skillSet}
                    availableSkills={contextData.skillSets}
                    onChange={(skills) => handleFieldChange('skillSet', skills)}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            {contextData && (
              <div className="pt-6 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={!isFormComplete || isSubmitting}
                  className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing Your Profile...
                    </>
                  ) : (
                    'Get My AI Risk Assessment'
                  )}
                </button>
                
                <p className="text-center text-sm text-gray-500 mt-4">
                  This assessment takes less than 30 seconds to complete
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              100% Secure
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              No Spam
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Instant Results
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}