// File: src/components/insights/prompt/prompt-settings-dialog.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon, AdjustmentsHorizontalIcon, CheckIcon, ArrowPathIcon, BookmarkIcon, DocumentTextIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useInsightsPrompt } from './prompt-settings-context';
import { PromptSettings, getPresets } from './settings-registry';

interface PromptSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PromptSettingsDialog: React.FC<PromptSettingsDialogProps> = ({ isOpen, onClose }) => {
  const { settings, setSettings, resetSettings } = useInsightsPrompt();
  const [localSettings, setLocalSettings] = useState<PromptSettings>(settings);
  
  // Update local settings when context settings change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);
  
  // Handle input changes
  const handleInputChange = (field: keyof PromptSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };
  
  // Handle nested object changes
  const handleNestedChange = (parent: keyof PromptSettings, field: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as object),
        [field]: value
      }
    }));
  };
  
  // Handle section toggle
  const handleSectionToggle = (section: string) => {
    setLocalSettings(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: !prev.sections[section as keyof typeof prev.sections]
      }
    }));
  };
  
  // Apply settings
  const handleApply = () => {
    setSettings(localSettings);
    onClose();
  };
  
  // Reset to defaults
  const handleReset = () => {
    resetSettings();
    setLocalSettings(settings);
  };
  
  // Handle preset selection
  const handlePresetChange = (presetId: string) => {
    const presets = getPresets();
    const selectedPreset = presets.find(p => p.id === presetId);
    if (selectedPreset) {
      setLocalSettings(selectedPreset.settings);
    }
  };
  
  // Get current preset ID based on settings
  const getCurrentPresetId = () => {
    const presets = getPresets();
    const matchedPreset = presets.find(preset => 
      JSON.stringify(preset.settings) === JSON.stringify(localSettings)
    );
    return matchedPreset ? matchedPreset.id : '';
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-2 transition-all duration-300">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 transform transition-all duration-300">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-100 px-3 py-2 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-1 rounded-full">
              <AdjustmentsHorizontalIcon className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">Narrative Settings</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 bg-white rounded-full p-1 hover:bg-gray-100 transition-colors duration-200"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto flex-1 p-2">
          <div className="space-y-2">
            {/* Preset Selector */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="bg-blue-100 p-1 rounded-full">
                  <BookmarkIcon className="h-4 w-4 text-blue-600" />
                </div>
                <label className="text-sm font-semibold text-gray-900">Preset Configuration</label>
              </div>
              
              <div className="relative">
                <select
                  value={getCurrentPresetId()}
                  onChange={(e) => handlePresetChange(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white py-1.5 px-2.5 pr-8 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm appearance-none transition-colors duration-200 text-gray-800"
                >
                  {getPresets().map(preset => (
                    <option key={preset.id} value={preset.id}>
                      {preset.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              <p className="mt-1 text-xs text-gray-600 bg-gray-50 p-2 rounded-md border border-gray-100">
                Choose a preset to quickly apply a predefined configuration for your narrative generation
              </p>
            </div>
            
            {/* Tone Settings */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="bg-purple-100 p-1 rounded-full">
                  <DocumentTextIcon className="h-4 w-4 text-purple-600" />
                </div>
                <h4 className="text-sm font-semibold text-gray-900">Tone & Style</h4>
              </div>
              
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <label className="block text-xs font-medium text-gray-800 mb-1">Tone</label>
                  <div className="relative">
                    <select
                      value={localSettings.tone}
                      onChange={(e) => handleInputChange('tone', e.target.value as any)}
                      className="w-full rounded-lg border border-gray-300 bg-white py-1.5 px-2.5 pr-8 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm appearance-none transition-colors duration-200 text-gray-800"
                    >
                      <option value="neutral">Neutral</option>
                      <option value="professional">Professional</option>
                      <option value="optimistic">Optimistic</option>
                      <option value="cautious">Cautious</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <label className="block text-xs font-medium text-gray-800 mb-1">Verbosity</label>
                  <div className="relative">
                    <select
                      value={localSettings.verbosity}
                      onChange={(e) => handleInputChange('verbosity', e.target.value as any)}
                      className="w-full rounded-lg border border-gray-300 bg-white py-1.5 px-2.5 pr-8 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm appearance-none transition-colors duration-200 text-gray-800"
                    >
                      <option value="short">Short</option>
                      <option value="medium">Medium</option>
                      <option value="long">Long</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <label className="block text-xs font-medium text-gray-800 mb-1">Audience</label>
                  <div className="relative">
                    <select
                      value={localSettings.audience}
                      onChange={(e) => handleInputChange('audience', e.target.value as any)}
                      className="w-full rounded-lg border border-gray-300 bg-white py-1.5 px-2.5 pr-8 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm appearance-none transition-colors duration-200 text-gray-800"
                    >
                      <option value="general">General</option>
                      <option value="executive">Executive</option>
                      <option value="individual-contributor">Individual Contributor</option>
                      <option value="hr">HR Professional</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <label className="block text-xs font-medium text-gray-800 mb-1">Structure</label>
                  <div className="relative">
                    <select
                      value={localSettings.structure}
                      onChange={(e) => handleInputChange('structure', e.target.value as any)}
                      className="w-full rounded-lg border border-gray-300 bg-white py-1.5 px-2.5 pr-8 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm appearance-none transition-colors duration-200 text-gray-800"
                    >
                      <option value="paragraph">Paragraph</option>
                      <option value="bulleted">Bulleted</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sections */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="bg-indigo-100 p-1 rounded-full">
                  <ShieldCheckIcon className="h-4 w-4 text-indigo-600" />
                </div>
                <h4 className="text-sm font-semibold text-gray-900">Narrative Sections</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
                {Object.entries(localSettings.sections).map(([section, enabled]) => {
                  const sectionName = section.charAt(0).toUpperCase() + section.slice(1).replace(/-/g, ' ');
                  return (
                    <div 
                      key={section} 
                      className={`flex items-center p-2 rounded-lg border ${enabled ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-200'} transition-colors duration-200`}
                    >
                      <input
                        id={`section-${section}`}
                        name={`section-${section}`}
                        type="checkbox"
                        checked={enabled as boolean}
                        onChange={() => handleSectionToggle(section)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-colors duration-200"
                      />
                      <label htmlFor={`section-${section}`} className="ml-2 text-xs text-gray-800">
                        {sectionName}
                      </label>
                    </div>
                  );
                })}
              </div>
              <p className="mt-1 text-xs text-gray-600 bg-gray-50 p-2 rounded-md border border-gray-100">
                Select which sections to include in the generated narrative
              </p>
            </div>
            
            {/* Compliance */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="bg-green-100 p-1 rounded-full">
                  <ShieldCheckIcon className="h-4 w-4 text-green-600" />
                </div>
                <h4 className="text-sm font-semibold text-gray-900">Compliance Settings</h4>
              </div>
              
              <div className="space-y-2">
                <div className={`flex items-center p-2 rounded-lg border ${localSettings.disclaimer.enabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} transition-colors duration-200`}>
                  <input
                    id="disclaimer-enabled"
                    type="checkbox"
                    checked={localSettings.disclaimer.enabled}
                    onChange={(e) => handleNestedChange('disclaimer', 'enabled', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 transition-colors duration-200"
                  />
                  <div className="ml-2">
                    <label htmlFor="disclaimer-enabled" className="text-sm font-medium text-gray-800">
                      Include AI-generated content disclaimer
                    </label>
                    <p className="text-xs text-gray-600 mt-1">Adds a notice that content was generated with AI assistance</p>
                  </div>
                </div>
                
                {localSettings.disclaimer.enabled && (
                  <div className="ml-5 p-2 rounded-lg border border-gray-100 bg-gray-50">
                    <label className="block text-xs font-medium text-gray-800 mb-2">Disclaimer Style</label>
                    <div className="relative">
                      <select
                        value={localSettings.disclaimer.style}
                        onChange={(e) => handleNestedChange('disclaimer', 'style', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white py-1.5 px-2.5 pr-8 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 text-sm appearance-none transition-colors duration-200 text-gray-800"
                      >
                        <option value="standard">Standard</option>
                        <option value="minimal">Minimal</option>
                        <option value="detailed">Detailed</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className={`flex items-center p-2 rounded-lg border bg-gray-50 border-gray-200 transition-colors duration-200`}>
                  <input
                    id="compliance-focused"
                    type="checkbox"
                    checked={localSettings.compliance?.focused || false}
                    onChange={(e) => handleNestedChange('compliance', 'focused', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 transition-colors duration-200"
                  />
                  <div className="ml-2">
                    <label htmlFor="compliance-focused" className="text-sm text-gray-800">
                      Emphasize compliance with employment regulations
                    </label>
                    <p className="text-xs text-gray-600 mt-1">Ensures content adheres to relevant employment laws and guidelines</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Advanced */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="bg-purple-100 p-1 rounded-full">
                  <AdjustmentsHorizontalIcon className="h-4 w-4 text-purple-600" />
                </div>
                <h4 className="text-sm font-semibold text-gray-900">Advanced Settings</h4>
              </div>
              
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="p-2 rounded-lg border border-gray-200 bg-white hover:shadow-sm transition-shadow duration-200">
                  <label className="block text-xs font-medium text-gray-800 mb-1">
                    Max Characters
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={localSettings.constraints.maxChars || ''}
                      onChange={(e) => handleNestedChange('constraints', 'maxChars', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                      className="w-full rounded-lg border border-gray-300 bg-white py-1.5 px-2.5 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm transition-colors duration-200 text-gray-800"
                      placeholder="2000"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-600">
                    Maximum character limit for the generated narrative
                  </p>
                </div>
                
                <div className="p-2 rounded-lg border border-gray-200 bg-white hover:shadow-sm transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-gray-800">
                      Avoid Overclaiming
                    </label>
                    <div className="relative inline-block w-10 align-middle select-none">
                      <input 
                        type="checkbox" 
                        id="avoid-overclaiming"
                        checked={localSettings.constraints.avoidOverclaiming}
                        onChange={(e) => handleNestedChange('constraints', 'avoidOverclaiming', e.target.checked)}
                        className="sr-only"
                      />
                      <label 
                        htmlFor="avoid-overclaiming"
                        className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${localSettings.constraints.avoidOverclaiming ? 'bg-purple-600' : 'bg-gray-300'}`}
                      >
                        <span 
                          className={`block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${localSettings.constraints.avoidOverclaiming ? 'translate-x-5' : 'translate-x-0'}`}
                        />
                      </label>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">
                    Ensures content is factual and avoids exaggerated claims
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-200 px-3 py-2 bg-gradient-to-b from-white to-gray-50 flex justify-end space-x-2">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};
