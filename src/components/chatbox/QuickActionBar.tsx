'use client';

import React, { useState } from 'react';
import { useChatbox } from './ChatboxProvider';
import { useBusinessSuggestion } from '@/contexts/BusinessSuggestionContext';
import { SparklesIcon, ArrowRightIcon, PlusIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { TemplateEditor } from '@/components/business/TemplateEditor';

interface QuickActionBarProps {
  className?: string;
}

export const QuickActionBar: React.FC<QuickActionBarProps> = ({ className = '' }) => {
  const { 
    status, 
    currentAnalysis, 
    businessSuggestions 
  } = useChatbox();
  
  const {
    businessType,
    setBusinessType,
    templates,
    addTemplate,
    generateSuggestions,
    isGenerating
  } = useBusinessSuggestion();
  
  const [isTemplateModalOpen, setTemplateModalOpen] = useState(false);

  // Only show if analysis is completed and we haven't generated suggestions yet
  const shouldShow = status === 'completed' && 
                    currentAnalysis && 
                    businessSuggestions.suggestionStatus === 'idle';

  const hasError = businessSuggestions.suggestionStatus === 'error';

  if (!shouldShow && !isGenerating && !hasError) {
    return null;
  }

  const handleGenerateSuggestions = async () => {
    try {
      await generateSuggestions();
    } catch (error) {
      console.error('Failed to generate business suggestions:', error);
    }
  };
  
  const handleTemplateCreation = async (templateData: any) => {
    try {
      const newTemplate = await addTemplate(templateData);
      setBusinessType(newTemplate.id);
      setTemplateModalOpen(false);
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  return (
    <div className={`mt-4 p-4 bg-white/70 rounded-xl border border-gray-200 shadow-sm ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <SparklesIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Ready for Business Ideas?
            </h3>
            <p className="text-xs text-gray-600">
              Get personalized business suggestions based on your analysis
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Business Type Dropdown */}
          <div className="relative">
            <select
              value={businessType}
              onChange={(e) => {
                if (e.target.value === 'create_new') {
                  setTemplateModalOpen(true);
                } else {
                  setBusinessType(e.target.value);
                }
              }}
              className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="saas">SaaS</option>
              <option value="retail">Retail</option>
              <option value="course">Course</option>
              {templates
                .filter(t => !['saas', 'retail', 'course'].includes(t.id))
                .map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              <option value="create_new">+ Create New Template</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDownIcon className="h-4 w-4" />
            </div>
          </div>
          
          {/* Generate Button */}
          <button
            onClick={handleGenerateSuggestions}
            disabled={isGenerating}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${isGenerating
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] shadow-sm'
              }
            `}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <span>Get Business Ideas</span>
                <ArrowRightIcon className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
      
      {hasError && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <div className="w-4 h-4 text-red-500 mt-0.5">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-red-800">Generation Failed</h4>
              <p className="text-xs text-red-700 mt-1">
                {businessSuggestions.suggestionError || 'Failed to generate business suggestions'}
              </p>
              <button
                onClick={handleGenerateSuggestions}
                className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Template Editor Modal */}
      <TemplateEditor
        isOpen={isTemplateModalOpen}
        onSave={handleTemplateCreation}
        onCancel={() => setTemplateModalOpen(false)}
      />
    </div>
  );
};

export default QuickActionBar;