// File: src/components/insights/prompt/prompt-settings-dialog.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
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
  const handleSectionToggle = (section: keyof PromptSettings['sections']) => {
    setLocalSettings(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: !prev.sections[section]
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">Narrative Settings</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Close"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="space-y-6">
            {/* Preset Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preset</label>
              <select
                value={getCurrentPresetId()}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              >
                {getPresets().map(preset => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Choose a preset to quickly apply a predefined configuration
              </p>
            </div>
            
            {/* Tone Settings */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Tone & Style</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tone</label>
                  <select
                    value={localSettings.tone}
                    onChange={(e) => handleInputChange('tone', e.target.value as any)}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="neutral">Neutral</option>
                    <option value="professional">Professional</option>
                    <option value="optimistic">Optimistic</option>
                    <option value="cautious">Cautious</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Verbosity</label>
                  <select
                    value={localSettings.verbosity}
                    onChange={(e) => handleInputChange('verbosity', e.target.value as any)}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="short">Short</option>
                    <option value="medium">Medium</option>
                    <option value="long">Long</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
                  <select
                    value={localSettings.audience}
                    onChange={(e) => handleInputChange('audience', e.target.value as any)}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="general">General</option>
                    <option value="executive">Executive</option>
                    <option value="individual-contributor">Individual Contributor</option>
                    <option value="hr">HR Professional</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Structure</label>
                  <select
                    value={localSettings.structure}
                    onChange={(e) => handleInputChange('structure', e.target.value as any)}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="paragraph">Paragraph</option>
                    <option value="bulleted">Bulleted</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Sections */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Sections</h4>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {Object.entries(localSettings.sections).map(([section, enabled]) => (
                  <div key={section} className="flex items-center">
                    <input
                      id={`section-${section}`}
                      type="checkbox"
                      checked={enabled}
                      onChange={() => handleSectionToggle(section as keyof PromptSettings['sections'])}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`section-${section}`}
                      className="ml-2 block text-sm text-gray-700 capitalize"
                    >
                      {section}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Compliance */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Compliance</h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    id="disclaimer-enabled"
                    type="checkbox"
                    checked={localSettings.disclaimer.enabled}
                    onChange={(e) => handleNestedChange('disclaimer', 'enabled', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="disclaimer-enabled"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Include Disclaimer
                  </label>
                </div>
                
                {localSettings.disclaimer.enabled && (
                  <div className="ml-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Disclaimer Style</label>
                    <select
                      value={localSettings.disclaimer.style}
                      onChange={(e) => handleNestedChange('disclaimer', 'style', e.target.value as any)}
                      className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="soft">Soft</option>
                      <option value="strong">Strong</option>
                    </select>
                  </div>
                )}
                
                <div className="flex items-center">
                  <input
                    id="avoid-overclaiming"
                    type="checkbox"
                    checked={localSettings.constraints.avoidOverclaiming}
                    onChange={(e) => handleNestedChange('constraints', 'avoidOverclaiming', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="avoid-overclaiming"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Avoid Overclaiming
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="cite-sources"
                    type="checkbox"
                    checked={localSettings.constraints.citeSources}
                    onChange={(e) => handleNestedChange('constraints', 'citeSources', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="cite-sources"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Cite Sources
                  </label>
                </div>
              </div>
            </div>
            
            {/* Advanced */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Advanced</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Characters
                  </label>
                  <input
                    type="number"
                    value={localSettings.constraints.maxChars || ''}
                    onChange={(e) => handleNestedChange('constraints', 'maxChars', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    placeholder="2000"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Maximum character limit for the response
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="border-t px-6 py-4 bg-gray-50 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
