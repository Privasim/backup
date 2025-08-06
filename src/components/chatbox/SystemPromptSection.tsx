'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { AnalysisConfig } from './types';
import { 
  getAllSystemPromptTemplates, 
  getTemplatesByCategory, 
  getSystemPromptTemplate,
  getTemplateCategories,
  SystemPromptTemplate 
} from '@/lib/chatbox/prompts/SystemPromptTemplates';
import { 
  validateSystemPrompt, 
  formatCharacterCount, 
  getValidationStatusColor, 
  getCharacterCountColor,
  generateSystemPromptPreview,
  SYSTEM_PROMPT_LIMITS
} from '@/lib/chatbox/utils/system-prompt-utils';
import { ChevronDownIcon, ChevronUpIcon, SparklesIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface SystemPromptSectionProps {
  config: AnalysisConfig;
  onConfigUpdate: (update: Partial<AnalysisConfig>) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

export const SystemPromptSection: React.FC<SystemPromptSectionProps> = ({
  config,
  onConfigUpdate,
  isExpanded,
  onToggleExpanded
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  
  const currentPrompt = config.customPrompt || '';
  const validation = useMemo(() => validateSystemPrompt(currentPrompt), [currentPrompt]);
  const isCustomPrompt = currentPrompt && !selectedTemplateId;
  
  const handlePromptChange = useCallback((value: string) => {
    onConfigUpdate({ customPrompt: value });
    setSelectedTemplateId(''); // Clear template selection when manually editing
  }, [onConfigUpdate]);
  
  const handleTemplateSelect = useCallback((templateId: string) => {
    const template = getSystemPromptTemplate(templateId);
    if (template) {
      onConfigUpdate({ customPrompt: template.prompt });
      setSelectedTemplateId(templateId);
    }
    setShowTemplateSelector(false);
  }, [onConfigUpdate]);
  
  const clearPrompt = useCallback(() => {
    onConfigUpdate({ customPrompt: '' });
    setSelectedTemplateId('');
  }, [onConfigUpdate]);
  
  const templateCategories = getTemplateCategories();
  const hasActivePrompt = Boolean(currentPrompt);
  
  return (
    <div className="border-t border-gray-200 pt-3">
      {/* Header */}
      <button
        onClick={onToggleExpanded}
        className="w-full flex items-center justify-between text-sm text-gray-700 hover:text-gray-900 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <SparklesIcon className="h-4 w-4" />
          <span className="font-medium">System Prompt</span>
          {hasActivePrompt && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
              Active
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronDownIcon className="h-4 w-4" />
        ) : (
          <ChevronUpIcon className="h-4 w-4" />
        )}
      </button>
      
      {/* Preview when collapsed */}
      {!isExpanded && hasActivePrompt && (
        <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
          {generateSystemPromptPreview(currentPrompt, 100)}
        </div>
      )}
    </div>
  );
};      
{/* Expanded Content */}
      {isExpanded && (
        <div className="mt-3 space-y-3">
          {/* Template Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-700">
                Quick Templates
              </label>
              <button
                onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                {showTemplateSelector ? 'Hide' : 'Browse'}
              </button>
            </div>
            
            {showTemplateSelector && (
              <div className="space-y-2 p-3 bg-gray-50 rounded-md">
                {templateCategories.map(category => (
                  <div key={category.key}>
                    <h4 className="text-xs font-medium text-gray-800 mb-1">
                      {category.label}
                    </h4>
                    <div className="grid grid-cols-1 gap-1">
                      {getTemplatesByCategory(category.key).map(template => (
                        <button
                          key={template.id}
                          onClick={() => handleTemplateSelect(template.id)}
                          className="text-left p-2 text-xs bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded transition-colors"
                        >
                          <div className="font-medium text-gray-900">{template.name}</div>
                          <div className="text-gray-600 mt-0.5">{template.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Custom Prompt Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-700">
                Custom System Prompt
              </label>
              {currentPrompt && (
                <button
                  onClick={clearPrompt}
                  className="text-xs text-red-600 hover:text-red-800 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            
            <textarea
              value={currentPrompt}
              onChange={(e) => handlePromptChange(e.target.value)}
              placeholder="Define how the AI should behave and analyze profiles..."
              className={`w-full px-3 py-2 text-xs border rounded-md resize-none transition-all duration-200 ${
                validation.isValid
                  ? 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  : 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              }`}
              rows={4}
              maxLength={SYSTEM_PROMPT_LIMITS.MAX_CHARACTERS}
            />
            
            {/* Validation Feedback */}
            <div className="mt-2 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                {validation.errors.length > 0 && (
                  <div className="flex items-center space-x-1 text-red-600">
                    <ExclamationTriangleIcon className="h-3 w-3" />
                    <span>{validation.errors[0]}</span>
                  </div>
                )}
                {validation.warnings.length > 0 && validation.errors.length === 0 && (
                  <div className="flex items-center space-x-1 text-yellow-600">
                    <ExclamationTriangleIcon className="h-3 w-3" />
                    <span>{validation.warnings[0]}</span>
                  </div>
                )}
                {validation.isValid && validation.warnings.length === 0 && currentPrompt && (
                  <span className="text-green-600">✓ Valid prompt</span>
                )}
              </div>
              
              <span className={getCharacterCountColor(validation.characterCount, SYSTEM_PROMPT_LIMITS.MAX_CHARACTERS)}>
                {formatCharacterCount(validation.characterCount, SYSTEM_PROMPT_LIMITS.MAX_CHARACTERS)}
              </span>
            </div>
          </div>
          
          {/* Help Text */}
          <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
            <strong>Tip:</strong> Start with "You are..." to define the AI's role. 
            Be specific about the analysis style, tone, and focus areas you want.
          </div>
        </div>
      )}
    </div>
  );
};