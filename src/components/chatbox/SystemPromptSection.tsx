'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { AnalysisConfig } from './types';
import { 
  getTemplatesByCategory, 
  getSystemPromptTemplate,
  getTemplateCategories
} from '@/lib/chatbox/prompts/SystemPromptTemplates';
import { 
  validateSystemPrompt, 
  formatCharacterCount, 
  getCharacterCountColor,
  generateSystemPromptPreview,
  SYSTEM_PROMPT_LIMITS
} from '@/lib/chatbox/utils/system-prompt-utils';
import { ChevronDownIcon, ChevronUpIcon, SparklesIcon, ExclamationTriangleIcon, PlusIcon, PencilIcon } from '@heroicons/react/24/outline';
import { PromptTemplate } from '@/lib/chatbox/prompts/types';
import { promptManager } from '@/lib/chatbox/prompts/PromptManager';
import { TemplateSelector } from './TemplateSelector';
import { TemplateEditor } from './TemplateEditor';

interface SystemPromptSectionProps {
  config: AnalysisConfig;
  onConfigUpdate: (update: Partial<AnalysisConfig>) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

enum ViewMode {
  CLASSIC = 'classic',
  ADVANCED = 'advanced'
}

export const SystemPromptSection: React.FC<SystemPromptSectionProps> = ({
  config,
  onConfigUpdate,
  isExpanded,
  onToggleExpanded
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.CLASSIC);
  const [showTemplateEditor, setShowTemplateEditor] = useState<boolean>(false);
  const [templateToEdit, setTemplateToEdit] = useState<PromptTemplate | undefined>(undefined);
  
  // Initialize prompt manager
  React.useEffect(() => {
    promptManager.initialize();
  }, []);
  
  const currentPrompt = config.customPrompt || '';
  const validation = useMemo(() => validateSystemPrompt(currentPrompt), [currentPrompt]);
  
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
  
  // Handle template edit
  const handleEditTemplate = (template: PromptTemplate) => {
    setTemplateToEdit(template);
    setShowTemplateEditor(true);
  };

  // Handle template delete
  const handleDeleteTemplate = async (template: PromptTemplate) => {
    if (window.confirm(`Are you sure you want to delete the template "${template.name}"?`)) {
      await promptManager.deleteTemplate(template.id);
      // If the deleted template was selected, clear the selection
      if (config.customPrompt === template.content) {
        clearPrompt();
      }
    }
  };

  // Handle template save
  const handleTemplateSave = (template: PromptTemplate) => {
    // If we're editing a template that's currently in use, update the prompt
    if (templateToEdit && config.customPrompt === templateToEdit.content) {
      handlePromptChange(template.content);
    }
  };

  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode(viewMode === ViewMode.CLASSIC ? ViewMode.ADVANCED : ViewMode.CLASSIC);
  };
  
  const templateCategories = getTemplateCategories();
  const hasActivePrompt = Boolean(currentPrompt);
  
  return (
    <div className="border-t border-gray-200 pt-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onToggleExpanded}
          className="flex items-center text-sm text-gray-700 hover:text-gray-900 transition-colors"
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
            <ChevronDownIcon className="h-4 w-4 ml-2" />
          ) : (
            <ChevronUpIcon className="h-4 w-4 ml-2" />
          )}
        </button>
        
        {/* View Mode Toggle */}
        <button 
          onClick={toggleViewMode}
          className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          {viewMode === ViewMode.CLASSIC ? 'Advanced Mode' : 'Classic Mode'}
        </button>
      </div>
      
      {/* Preview when collapsed */}
      {!isExpanded && hasActivePrompt && (
        <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
          {generateSystemPromptPreview(currentPrompt, 100)}
        </div>
      )}

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-3 space-y-3">
          {viewMode === ViewMode.CLASSIC ? (
            /* Template Selector - Classic Mode */
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
          ) : (
            /* Template Management - Advanced Mode */
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setShowTemplateSelector(true)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
              >
                <span>Browse Templates</span>
              </button>
              <button
                onClick={() => {
                  setTemplateToEdit(undefined);
                  setShowTemplateEditor(true);
                }}
                className="flex items-center space-x-1 px-3 py-1.5 border border-gray-300 hover:border-gray-400 text-xs rounded transition-colors"
              >
                <PlusIcon className="h-3 w-3" />
                <span>Create Template</span>
              </button>
            </div>
          )}
          
          {/* Custom Prompt Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-700">
                Custom System Prompt
              </label>
              <div className="flex items-center space-x-2">
                {viewMode === ViewMode.ADVANCED && currentPrompt && (
                  <button
                    onClick={() => {
                      setTemplateToEdit({
                        id: '',
                        name: '',
                        description: '',
                        content: currentPrompt,
                        category: 'custom',
                        tags: [],
                        isBuiltIn: false,
                        isEditable: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                      });
                      setShowTemplateEditor(true);
                    }}
                    className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <PencilIcon className="h-3 w-3" />
                    <span>Save as Template</span>
                  </button>
                )}
                {currentPrompt && (
                  <button
                    onClick={clearPrompt}
                    className="text-xs text-red-600 hover:text-red-800 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
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
            <strong>Tip:</strong> Start with &quot;You are...&quot; to define the AI&apos;s role. 
            Be specific about the analysis style, tone, and focus areas you want.
          </div>
        </div>
      )}
      
      {/* Template Selector Dialog */}
      {showTemplateSelector && viewMode === ViewMode.ADVANCED && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium">Select a Template</h2>
              <button onClick={() => setShowTemplateSelector(false)} className="text-gray-500 hover:text-gray-700">
                &times;
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(80vh-8rem)]">
              <TemplateSelector
                onSelectTemplate={(template: PromptTemplate) => {
                  handlePromptChange(template.content);
                  setShowTemplateSelector(false);
                }}
                onEditTemplate={handleEditTemplate}
                onDeleteTemplate={handleDeleteTemplate}
              />
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button 
                onClick={() => setShowTemplateSelector(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Template Editor Dialog */}
      {showTemplateEditor && (
        <TemplateEditor
          open={showTemplateEditor}
          onClose={() => setShowTemplateEditor(false)}
          onSave={handleTemplateSave}
          template={templateToEdit}
        />
      )}
    </div>
  );
};