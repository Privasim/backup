'use client';

import React, { useEffect, useCallback, useRef, useState } from 'react';
import { QuizData } from '@/lib/quiz/types';
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
import Dropdown from '../quiz/Dropdown';
import SkillSelector from '../quiz/SkillSelector';
import ApiKeyInput from '../quiz/ApiKeyInput';
import { debugLog } from '@/components/debug/DebugConsole';

interface AssessmentProgress {
  stage: 'initializing' | 'analyzing' | 'processing' | 'complete' | 'error';
  message: string;
  progress: number;
}

interface QuizFormPanelProps {
  onDataChange: (data: QuizData) => void;
  onAnalysisStart: (data: QuizData) => Promise<void>;
  isAnalyzing: boolean;
  analysisProgress: AssessmentProgress | null;
  quizData: QuizData | null;
  className?: string;
}

export default function QuizFormPanel({
  onDataChange,
  onAnalysisStart,
  isAnalyzing,
  analysisProgress,
  quizData,
  className = '',
}: QuizFormPanelProps) {
  const { state, actions } = useQuizForm();
  const prevJobDescriptionRef = useRef<string>('');
  const jobDescriptions = getJobDescriptions();

  // Initialize logging
  useEffect(() => {
    debugLog.info('QuizFormPanel', 'Quiz form panel initialized');
  }, []);

  // No sync needed - just use internal form state and notify parent of changes

  // Notify parent of data changes (debounced to prevent excessive updates)
  const prevDataRef = useRef<QuizData | null>(null);
  
  useEffect(() => {
    // Only call onDataChange if the data actually changed
    if (JSON.stringify(state.data) !== JSON.stringify(prevDataRef.current)) {
      onDataChange(state.data);
      prevDataRef.current = state.data;
    }
  }, [state.data, onDataChange]);

  const canProceedToStep2 = state.data.jobDescription && !state.errors.jobDescription;
  const canProceedToStep3 = actions.isStepComplete(1) && actions.isStepComplete(2);
  const isFormComplete = actions.isStepComplete(1) && actions.isStepComplete(2) && actions.isStepComplete(3);

  const contextData: JobContext | null = state.data.jobDescription 
    ? getContextForJob(state.data.jobDescription) 
    : null;

  // Load context data when job description changes
  useEffect(() => {
    if (state.data.jobDescription && 
        state.data.jobDescription !== prevJobDescriptionRef.current &&
        validateJobKey(state.data.jobDescription)) {
      
      debugLog.info('QuizFormPanel', `Job description changed to: ${state.data.jobDescription}`);
      
      const context = getContextForJob(state.data.jobDescription);
      if (context) {
        debugLog.success('QuizFormPanel', 'Context data loaded successfully', {
          experiences: context.experiences.length,
          industries: context.industries.length,
          locations: context.locations.length,
          skillSets: context.skillSets.length
        });
        
        actions.resetDependentFields();
        prevJobDescriptionRef.current = state.data.jobDescription;
        
        debugLog.debug('QuizFormPanel', 'Dependent fields reset due to job change');
      } else {
        debugLog.warn('QuizFormPanel', 'No context data found for job description', state.data.jobDescription);
      }
    }
  }, [state.data.jobDescription, actions]);

  // Auto-advance to Step 3 when Step 2 is complete
  useEffect(() => {
    if (canProceedToStep3 && state.currentStep === 2) {
      debugLog.info('QuizFormPanel', 'Auto-advancing to step 3 - all required fields completed');
      actions.setStep(3);
    }
  }, [canProceedToStep3, state.currentStep, actions]);

  const handleFieldChange = useCallback((field: keyof typeof state.data, value: string | string[]) => {
    debugLog.debug('QuizFormPanel', `Field changed: ${field}`, { value });
    actions.setField(field, value);
    actions.setTouched(field);
  }, [actions]);

  const handleStartAnalysis = async () => {
    debugLog.info('QuizFormPanel', '🚀 Starting job risk assessment analysis');
    
    actions.setSubmitAttempted(true);
    
    if (!actions.validateForm()) {
      debugLog.error('QuizFormPanel', 'Form validation failed', state.errors);
      return;
    }
    
    debugLog.success('QuizFormPanel', 'Form validation passed');
    await onAnalysisStart(state.data);
  };

  return (
    <div className={`quiz-form-panel flex flex-col h-full ${className}`}>
      {/* Modern Panel Header */}
      <div className="panel-header gradient-subtle">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-heading" style={{ color: 'var(--neutral-900)' }}>AI Risk Assessment</h2>
            <p className="text-body" style={{ color: 'var(--neutral-600)' }}>Professional career analysis in 3 steps</p>
          </div>
          <div className="badge-primary">
            Step {state.currentStep} of 3
          </div>
        </div>
        
        {/* Modern Progress Bar */}
        <div className="progress-base">
          <div 
            className="progress-bar"
            style={{ width: `${(state.currentStep / 3) * 100}%` }}
          ></div>
        </div>

        {/* Analysis Progress */}
        {isAnalyzing && analysisProgress && (
          <div className="mt-4 card-base p-4 animate-fade-in" style={{ background: 'var(--primary-50)', borderColor: 'var(--primary-200)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-label" style={{ color: 'var(--primary-800)' }}>{analysisProgress.message}</span>
              <span className="badge-primary">{analysisProgress.progress}%</span>
            </div>
            <div className="progress-base" style={{ background: 'var(--primary-200)' }}>
              <div 
                className="progress-bar"
                style={{ width: `${analysisProgress.progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Modern Form Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Step 1: Job Selection */}
        <div className={`transition-all duration-300 ${state.currentStep >= 1 ? 'opacity-100' : 'opacity-50'}`}>
          <div className={`card-base p-6 ${actions.isStepComplete(1) ? 'border-success-200 bg-success-50' : state.currentStep === 1 ? 'border-primary-200 bg-primary-50' : ''}`}>
            <div className="flex items-center mb-6">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold mr-4 shadow-sm ${
                actions.isStepComplete(1) 
                  ? 'gradient-success text-white' 
                  : state.currentStep === 1
                    ? 'gradient-primary text-white'
                    : 'bg-neutral-200 text-neutral-500'
              }`}>
                {actions.isStepComplete(1) ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : '1'}
              </div>
              <div>
                <h3 className="text-subheading" style={{ color: 'var(--neutral-900)' }}>Your Professional Role</h3>
                <p className="text-body-sm" style={{ color: 'var(--neutral-600)' }}>Tell us about your current position</p>
              </div>
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
        </div>

        {/* Step 2: Detailed Information */}
        {canProceedToStep2 && contextData && (
          <div className={`transition-all duration-300 animate-slide-up ${state.currentStep >= 2 ? 'opacity-100' : 'opacity-50'}`}>
            <div className={`card-base p-6 ${actions.isStepComplete(2) ? 'border-success-200 bg-success-50' : state.currentStep === 2 ? 'border-primary-200 bg-primary-50' : ''}`}>
              <div className="flex items-center mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold mr-4 shadow-sm ${
                  actions.isStepComplete(2) 
                    ? 'gradient-success text-white' 
                    : state.currentStep === 2
                      ? 'gradient-primary text-white'
                      : 'bg-neutral-200 text-neutral-500'
                }`}>
                  {actions.isStepComplete(2) ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : '2'}
                </div>
                <div>
                  <h3 className="text-subheading" style={{ color: 'var(--neutral-900)' }}>Professional Details</h3>
                  <p className="text-body-sm" style={{ color: 'var(--neutral-600)' }}>Help us understand your background</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

              <div className="mt-6">
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
            </div>
          </div>
        )}

        {/* Step 3: Analysis Setup */}
        {canProceedToStep3 && (
          <div className={`transition-all duration-300 animate-slide-up ${state.currentStep >= 3 ? 'opacity-100' : 'opacity-50'}`}>
            <div className={`card-base p-6 ${actions.isStepComplete(3) ? 'border-success-200 bg-success-50' : state.currentStep === 3 ? 'border-primary-200 bg-primary-50' : ''}`}>
              <div className="flex items-center mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold mr-4 shadow-sm ${
                  actions.isStepComplete(3) 
                    ? 'gradient-success text-white' 
                    : state.currentStep === 3
                      ? 'gradient-primary text-white'
                      : 'bg-neutral-200 text-neutral-500'
                }`}>
                  {actions.isStepComplete(3) ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : '3'}
                </div>
                <div>
                  <h3 className="text-subheading" style={{ color: 'var(--neutral-900)' }}>Analysis Configuration</h3>
                  <p className="text-body-sm" style={{ color: 'var(--neutral-600)' }}>Review your profile and configure AI analysis</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Modern Profile Summary */}
                <div className="card-base p-4" style={{ background: 'var(--neutral-50)', borderColor: 'var(--neutral-200)' }}>
                  <h4 className="text-label mb-3" style={{ color: 'var(--neutral-900)' }}>Profile Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-body-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: 'var(--primary-500)' }}></div>
                      <span style={{ color: 'var(--neutral-600)' }}>Role:</span>
                      <span className="font-medium" style={{ color: 'var(--neutral-900)' }}>{state.data.jobDescription.replace('-', ' ')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: 'var(--success-500)' }}></div>
                      <span style={{ color: 'var(--neutral-600)' }}>Experience:</span>
                      <span className="font-medium" style={{ color: 'var(--neutral-900)' }}>{state.data.experience}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-500)' }}></div>
                      <span style={{ color: 'var(--neutral-600)' }}>Industry:</span>
                      <span className="font-medium" style={{ color: 'var(--neutral-900)' }}>{state.data.industry}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: 'var(--warning-500)' }}></div>
                      <span style={{ color: 'var(--neutral-600)' }}>Skills:</span>
                      <span className="font-medium" style={{ color: 'var(--neutral-900)' }}>
                        {state.data.skillSet.slice(0, 2).join(', ')}{state.data.skillSet.length > 2 ? ` +${state.data.skillSet.length - 2} more` : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <ApiKeyInput
                  value={state.data.apiKey || ''}
                  onChange={(value: string) => handleFieldChange('apiKey', value)}
                  error={state.errors.apiKey}
                  touched={state.touched.apiKey}
                  model={state.data.model}
                  onModelChange={(model) => handleFieldChange('model', model)}
                  modelError={state.errors.model}
                  onValidate={(isValid) => {
                    if (!isValid && state.touched.apiKey) {
                      actions.setError('apiKey', 'Please enter a valid OpenRouter API key');
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modern Analysis Button */}
      {canProceedToStep3 && state.currentStep === 3 && (
        <div className="panel-footer">
          {state.errors.submit && (
            <div className="mb-4 card-base p-4 animate-fade-in" style={{ background: 'var(--error-50)', borderColor: 'var(--error-200)' }}>
              <div className="flex items-center text-body">
                <svg className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: 'var(--error-600)' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span style={{ color: 'var(--error-800)' }}>{state.errors.submit}</span>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleStartAnalysis}
            disabled={!isFormComplete || isAnalyzing}
            className={`btn-base btn-lg w-full ${!isFormComplete || isAnalyzing ? 'btn-primary:disabled' : 'btn-primary'}`}
            style={{ 
              background: !isFormComplete || isAnalyzing 
                ? 'var(--neutral-300)' 
                : 'linear-gradient(135deg, var(--primary-600), var(--accent-600))',
              color: !isFormComplete || isAnalyzing ? 'var(--neutral-500)' : 'white',
              cursor: !isFormComplete || isAnalyzing ? 'not-allowed' : 'pointer'
            }}
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing Your Career Risk...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start AI Risk Analysis
              </>
            )}
          </button>
          
          <p className="text-center text-body-sm mt-3" style={{ color: 'var(--neutral-500)' }}>
            {isAnalyzing ? 'AI is processing your professional profile...' : 'Comprehensive analysis takes 30-60 seconds'}
          </p>
        </div>
      )}
    </div>
  );
}