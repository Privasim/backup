import React, { useState, useEffect } from 'react';
import { BusinessTemplate } from '@/services/TemplateService';
import { XMarkIcon, PlusIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface TemplateEditorProps {
  initialTemplate?: Partial<BusinessTemplate>;
  onSave: (template: Omit<BusinessTemplate, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  isOpen: boolean;
}

const VARIABLE_OPTIONS = [
  'skills',
  'interests',
  'budget',
  'experience',
  'goals',
  'market',
  'competitors',
  'timeline',
];

export function TemplateEditor({
  initialTemplate,
  onSave,
  onCancel,
  isOpen
}: TemplateEditorProps) {
  const [name, setName] = useState(initialTemplate?.name || '');
  const [prompt, setPrompt] = useState(initialTemplate?.prompt || '');
  const [variables, setVariables] = useState<string[]>(initialTemplate?.variables || []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showVariableSelector, setShowVariableSelector] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(initialTemplate?.name || '');
      setPrompt(initialTemplate?.prompt || '');
      setVariables(initialTemplate?.variables || []);
      setErrors({});
    }
  }, [isOpen, initialTemplate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }
    
    if (prompt.length < 50) {
      newErrors.prompt = 'Prompt must be at least 50 characters';
    } else if (prompt.length > 2000) {
      newErrors.prompt = 'Prompt must be less than 2000 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        name,
        prompt,
        variables,
      });
    }
  };

  const insertVariable = (variable: string) => {
    const placeholder = `{${variable}}`;
    const newPrompt = prompt + placeholder;
    setPrompt(newPrompt);
    
    if (!variables.includes(variable)) {
      setVariables([...variables, variable]);
    }
    
    setShowVariableSelector(false);
  };

  const removeVariable = (variable: string) => {
    setVariables(variables.filter(v => v !== variable));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {initialTemplate?.id ? 'Edit Template' : 'Create New Template'}
          </h2>
          <button 
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Template Name */}
          <div>
            <label htmlFor="template-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Template Name
            </label>
            <input
              id="template-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., E-commerce Business Plan"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
            )}
          </div>
          
          {/* Template Variables */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Template Variables
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {variables.map(variable => (
                <div 
                  key={variable}
                  className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md flex items-center gap-1"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">{`{${variable}}`}</span>
                  <button 
                    onClick={() => removeVariable(variable)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setShowVariableSelector(!showVariableSelector)}
                className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-2 py-1 rounded-md flex items-center gap-1"
              >
                <PlusIcon className="w-4 h-4" />
                <span className="text-sm">Add Variable</span>
              </button>
            </div>
            
            {/* Variable Selector Dropdown */}
            {showVariableSelector && (
              <div className="relative">
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 py-1 max-h-60 overflow-auto">
                  {VARIABLE_OPTIONS.map(option => (
                    <button
                      key={option}
                      onClick={() => insertVariable(option)}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Template Prompt */}
          <div>
            <label htmlFor="template-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Prompt Template
            </label>
            <div className="relative">
              <textarea
                id="template-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                placeholder="Generate business ideas based on the following profile:&#10;&#10;Skills: {skills}&#10;Interests: {interests}&#10;Budget: {budget}"
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400">
                {prompt.length}/2000
              </div>
            </div>
            {errors.prompt && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.prompt}</p>
            )}
          </div>
          
          {/* Preview */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
              <DocumentTextIcon className="w-4 h-4" />
              Preview
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-3 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {prompt || 'Your prompt will appear here...'}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Save Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
