'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { XMarkIcon, CogIcon, SparklesIcon, ChevronDownIcon, ChevronUpIcon, ExclamationTriangleIcon, CheckIcon } from '@heroicons/react/24/outline';
import { getBusinessPromptTemplates, getTemplateById } from '@/lib/business/prompt-templates';
import { validateSystemPrompt, formatCharacterCount, getCharacterCountColor, SYSTEM_PROMPT_LIMITS } from '@/lib/chatbox/utils/system-prompt-utils';
import { getBusinessPlanSettings, saveBusinessPlanSettings, BusinessPlanSettings } from '@/lib/business/settings-utils';

interface BusinessPlanSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SystemPromptContentProps {
  settings: BusinessPlanSettings;
  onSettingsChange: (key: string, value: any) => void;
}

const SystemPromptContent: React.FC<SystemPromptContentProps> = ({ settings, onSettingsChange }) => {
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const templates = getBusinessPromptTemplates();
  
  const currentPrompt = settings.systemPrompt.customPrompt || '';
  const validation = useMemo(() => validateSystemPrompt(currentPrompt), [currentPrompt]);
  
  const handlePromptChange = useCallback((value: string) => {
    onSettingsChange('systemPrompt', {
      ...settings.systemPrompt,
      customPrompt: value,
      templateId: '' // Clear template selection when manually editing
    });
  }, [settings.systemPrompt, onSettingsChange]);
  
  const handleTemplateSelect = useCallback((templateId: string) => {
    const template = getTemplateById(templateId);
    if (template) {
      onSettingsChange('systemPrompt', {
        ...settings.systemPrompt,
        templateId,
        customPrompt: template.prompt
      });
    }
    setShowTemplateSelector(false);
  }, [settings.systemPrompt, onSettingsChange]);
  
  const clearPrompt = useCallback(() => {
    onSettingsChange('systemPrompt', {
      ...settings.systemPrompt,
      templateId: '',
      customPrompt: ''
    });
  }, [settings.systemPrompt, onSettingsChange]);

  return (
    <div className="mt-2 space-y-3">
      {/* Enable Toggle */}
      <div className="flex items-center justify-between py-2">
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900">Custom Prompts</div>
          <div className="text-xs text-gray-500 mt-0.5">Customize AI generation</div>
        </div>
        <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
          <input
            type="checkbox"
            checked={settings.systemPrompt.enabled}
            onChange={(e) => onSettingsChange('systemPrompt', {
              ...settings.systemPrompt,
              enabled: e.target.checked
            })}
            className="sr-only"
          />
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
              settings.systemPrompt.enabled ? 'translate-x-6 bg-white' : 'translate-x-1'
            }`}
          />
          <span
            className={`absolute inset-0 h-full w-full rounded-full transition-colors duration-200 ease-in-out ${
              settings.systemPrompt.enabled ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          />
        </div>
      </div>

      {settings.systemPrompt.enabled && (
        <div className="space-y-3 pl-4 border-l-2 border-blue-100">
          {/* Template Selector */}
          <div>
            <button
              onClick={() => setShowTemplateSelector(!showTemplateSelector)}
              className="flex items-center justify-between w-full py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <span>Templates</span>
              <ChevronDownIcon className={`h-4 w-4 transition-transform ${showTemplateSelector ? 'rotate-180' : ''}`} />
            </button>
            
            {showTemplateSelector && (
              <div className="space-y-1 mt-2">
                {templates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    className="flex items-start p-2 w-full text-left text-xs bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors group"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 group-hover:text-blue-900">{template.name}</div>
                      <div className="text-gray-600 group-hover:text-blue-700 mt-0.5 line-clamp-2">{template.description}</div>
                    </div>
                    {settings.systemPrompt.templateId === template.id && (
                      <CheckIcon className="h-3 w-3 text-blue-600 mt-0.5 ml-2 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Custom Prompt Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Custom Prompt</span>
              {currentPrompt && (
                <button
                  onClick={clearPrompt}
                  className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            
            <div className="relative">
              <textarea
                value={currentPrompt}
                onChange={(e) => handlePromptChange(e.target.value)}
                placeholder="Define how the AI should generate business suggestions..."
                className={`w-full px-3 py-2 text-sm border rounded-lg resize-none transition-all duration-200 ${
                  validation.isValid
                    ? 'border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    : 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                }`}
                rows={3}
                maxLength={SYSTEM_PROMPT_LIMITS.MAX_CHARACTERS}
              />
              
              {/* Character count overlay */}
              <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white px-1 rounded">
                {validation.characterCount}/{SYSTEM_PROMPT_LIMITS.MAX_CHARACTERS}
              </div>
            </div>
            
            {/* Validation Feedback */}
            {(validation.errors.length > 0 || validation.warnings.length > 0) && (
              <div className="mt-1 text-xs">
                {validation.errors.length > 0 && (
                  <div className="flex items-center text-red-600">
                    <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                    <span>{validation.errors[0]}</span>
                  </div>
                )}
                {validation.warnings.length > 0 && validation.errors.length === 0 && (
                  <div className="flex items-center text-yellow-600">
                    <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                    <span>{validation.warnings[0]}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Help Text */}
          <div className="text-xs text-blue-700 bg-blue-50 p-2 rounded-lg">
            💡 Use templates as starting points or create custom prompts for specific business types
          </div>
        </div>
      )}
    </div>
  );
};

export default function BusinessPlanSettings({ isOpen, onClose }: BusinessPlanSettingsProps) {
  const [settings, setSettings] = useState<BusinessPlanSettings>(() => getBusinessPlanSettings());

  const [isSystemPromptExpanded, setIsSystemPromptExpanded] = useState(false);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <CogIcon className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Business Plan Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Settings Content */}
        <div className="space-y-6">
          {/* Auto Refresh */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Auto Refresh</label>
              <p className="text-xs text-gray-500">Automatically update suggestions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoRefresh}
                onChange={(e) => handleSettingChange('autoRefresh', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Show Viability Scores */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Show Viability Scores</label>
              <p className="text-xs text-gray-500">Display percentage scores on cards</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showViabilityScores}
                onChange={(e) => handleSettingChange('showViabilityScores', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Sort By</label>
            <select
              value={settings.sortBy}
              onChange={(e) => handleSettingChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="viability">Viability Score</option>
              <option value="category">Category</option>
              <option value="cost">Startup Cost</option>
              <option value="market">Market Size</option>
            </select>
          </div>

          {/* Max Suggestions */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Max Suggestions: {settings.maxSuggestions}
            </label>
            <input
              type="range"
              min="5"
              max="20"
              value={settings.maxSuggestions}
              onChange={(e) => handleSettingChange('maxSuggestions', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5</span>
              <span>20</span>
            </div>
          </div>

          {/* Include Market Data */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Include Market Data</label>
              <p className="text-xs text-gray-500">Show market size and trends</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.includeMarketData}
                onChange={(e) => handleSettingChange('includeMarketData', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* System Prompt Section */}
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={() => setIsSystemPromptExpanded(!isSystemPromptExpanded)}
            className="w-full flex items-center justify-between text-sm text-gray-700 hover:text-gray-900 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <SparklesIcon className="h-4 w-4" />
              <span className="font-medium">System Prompt</span>
              {settings.systemPrompt.enabled && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Active
                </span>
              )}
            </div>
            {isSystemPromptExpanded ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronUpIcon className="h-4 w-4" />
            )}
          </button>

          {isSystemPromptExpanded && (
            <SystemPromptContent 
              settings={settings}
              onSettingsChange={handleSettingChange}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              saveBusinessPlanSettings(settings);
              console.log('Settings saved:', settings);
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}