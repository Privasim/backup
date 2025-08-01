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
      {/* Panel Header */}
      <div className="panel-header bg-gray-50 border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Assessment Form</h2>
          <div className="text-sm text-gray-500">
            Step {state.currentStep}/3
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(state.currentStep / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Analysis Progress */}
        {isAnalyzing && analysisProgress && (
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-800 font-medium">{analysisProgress.message}</span>
              <span className="text-blue-600">{analysisProgress.progress}%</span>
            </div>
            <div className="mt-1 w-full bg-blue-200 rounded-full h-1">
              <div 
                className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                style={{ width: `${analysisProgress.progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Step 1: Job Selection */}
        <div className={`transition-all duration-300 ${state.currentStep >= 1 ? 'opacity-100' : 'opacity-50'}`}>
          <div className="flex items-center mb-6">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mr-4 ${
              actions.isStepComplete(1) 
                ? 'bg-green-500 text-white' 
                : 'bg-blue-600 text-white'
            }`}>
              {actions.isStepComplete(1) ? '✓' : '1'}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Your Role</h3>
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
            <div className="flex items-center mb-6">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mr-4 ${
                actions.isStepComplete(2) 
                  ? 'bg-green-500 text-white' 
                  : 'bg-blue-600 text-white'
              }`}>
                {actions.isStepComplete(2) ? '✓' : '2'}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Details</h3>
            </div>

            <div className="space-y-5">
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
        )}

        {/* Step 3: Analysis Setup */}
        {canProceedToStep3 && (
          <div className={`transition-all duration-300 ${state.currentStep >= 3 ? 'opacity-100' : 'opacity-50'}`}>
            <div className="flex items-center mb-6">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mr-4 ${
                actions.isStepComplete(3) 
                  ? 'bg-green-500 text-white' 
                  : 'bg-blue-600 text-white'
              }`}>
                {actions.isStepComplete(3) ? '✓' : '3'}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Analysis Setup</h3>
            </div>

            <div className="space-y-5">
              {/* Profile Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Profile Summary</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div><span className="font-medium">Role:</span> {state.data.jobDescription.replace('-', ' ')}</div>
                  <div><span className="font-medium">Experience:</span> {state.data.experience}</div>
                  <div><span className="font-medium">Industry:</span> {state.data.industry}</div>
                  <div><span className="font-medium">Skills:</span> {state.data.skillSet.slice(0, 3).join(', ')}{state.data.skillSet.length > 3 ? ` +${state.data.skillSet.length - 3} more` : ''}</div>
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
        )}
      </div>

      {/* Analysis Button */}
      {canProceedToStep3 && state.currentStep === 3 && (
        <div className="panel-footer border-t border-gray-200 p-6 bg-gray-50">
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
            type="button"
            onClick={handleStartAnalysis}
            disabled={!isFormComplete || isAnalyzing}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center text-base"
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Start Analysis
              </>
            )}
          </button>
          
          <p className="text-center text-xs text-gray-500 mt-2">
            {isAnalyzing ? 'Processing with AI...' : 'Results will appear below in real-time'}
          </p>
        </div>
      )}
    </div>
  );
}