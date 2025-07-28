'use client';

import { useState, useEffect } from 'react';
import { QuizData } from '@/lib/quiz/types';
import { getJobDescriptions, getContextForJob } from '@/lib/quiz/data';
import Dropdown from './Dropdown';
import SkillSelector from './SkillSelector';

export default function QuizForm() {
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
    }
  }, [formData.jobDescription]);

  const handleFieldChange = (field: keyof QuizData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Quiz Data:', formData);
    // TODO: Process quiz data and show results
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
        Find out how risky your job is to AI
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Dropdown
          label="Job Description"
          value={formData.jobDescription}
          options={jobDescriptions.map(job => ({ value: job, label: job.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) }))}
          onChange={(value) => handleFieldChange('jobDescription', value)}
          placeholder="Select your job role"
        />

        {contextData && (
          <>
            <Dropdown
              label="Experience"
              value={formData.experience}
              options={contextData.experiences.map((exp: string) => ({ value: exp, label: exp }))}
              onChange={(value) => handleFieldChange('experience', value)}
              placeholder="Select your experience level"
            />

            <Dropdown
              label="Industry"
              value={formData.industry}
              options={contextData.industries.map((ind: string) => ({ value: ind, label: ind }))}
              onChange={(value) => handleFieldChange('industry', value)}
              placeholder="Select your industry"
            />

            <Dropdown
              label="Location"
              value={formData.location}
              options={contextData.locations.map((loc: string) => ({ value: loc, label: loc }))}
              onChange={(value) => handleFieldChange('location', value)}
              placeholder="Select your location"
            />

            <Dropdown
              label="Salary Range"
              value={formData.salaryRange}
              options={contextData.salaryRanges.map((range: string) => ({ value: range, label: range }))}
              onChange={(value) => handleFieldChange('salaryRange', value)}
              placeholder="Select your salary range"
            />

            <SkillSelector
              label="Skill Set"
              selectedSkills={formData.skillSet}
              availableSkills={contextData.skillSets}
              onChange={(skills) => handleFieldChange('skillSet', skills)}
            />
          </>
        )}

        <button
          type="submit"
          disabled={!formData.jobDescription || !formData.experience || !formData.industry || !formData.location || !formData.salaryRange || formData.skillSet.length === 0}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
        >
          Analyze AI Risk
        </button>
      </form>
    </div>
  );
}