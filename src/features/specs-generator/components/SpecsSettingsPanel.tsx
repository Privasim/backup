import React, { useState } from 'react';

import { SpecsSettings } from '../types';

interface SpecsSettingsPanelProps {
  settings: SpecsSettings;
  onChange: (settings: Partial<SpecsSettings>) => void;
  disabled?: boolean;
  showHeader?: boolean;
}

export function SpecsSettingsPanel({
  settings,
  onChange,
  disabled = false,
  showHeader = true
}: SpecsSettingsPanelProps) {
  const [prompt, setPrompt] = useState(settings.systemPrompt);
  
  // Handle prompt change with debounce
  React.useEffect(() => {
    const handler = setTimeout(() => {
      onChange({ systemPrompt: prompt });
    }, 300);
    
    // Cleanup function to clear the timeout if prompt changes again
    return () => {
      clearTimeout(handler);
    };
  }, [prompt, onChange]);
  
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };
  
  const handleLengthChange = (length: 5 | 10 | 15) => {
    onChange({ length });
  };
  
  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ preset: e.target.value as 'web-app' | 'api-service' | 'data-pipeline' | 'custom' });
  };
  
  const handleSectionToggle = (section: keyof SpecsSettings['include']) => {
    onChange({
      include: {
        ...settings.include,
        [section]: !settings.include[section]
      }
    });
  };
  
  const handleOutlineStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ outlineStyle: e.target.value as 'numbered' | 'bulleted' | 'headings' });
  };
  
  const handleAudienceLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ audienceLevel: e.target.value as 'exec' | 'pm' | 'engineer' });
  };
  
  const handleToneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ tone: e.target.value as 'concise' | 'detailed' | 'formal' | 'neutral' });
  };
  
  const handleLanguageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ language: e.target.value });
  };
  
  const handleMaxTokensChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange({ maxTokens: value ? parseInt(value, 10) : undefined });
  };
  
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
      {showHeader && (
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Specification Settings</h3>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Preset
          </label>
          <select
            value={settings.preset}
            onChange={handlePresetChange}
            disabled={disabled}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="web-app">Web Application</option>
            <option value="api-service">API Service</option>
            <option value="data-pipeline">Data Pipeline</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Specification Length
          </label>
          <div className="inline-flex rounded-md shadow-sm" role="group" aria-label="Specification length options">
            {[5, 10, 15].map((length) => (
              <button
                key={length}
                type="button"
                onClick={() => handleLengthChange(length as 5 | 10 | 15)}
                disabled={disabled}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  settings.length === length
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600'
                } ${
                  length === 5 
                    ? 'rounded-l-lg border border-r-0' 
                    : length === 15 
                      ? 'rounded-r-lg border border-l-0' 
                      : 'border border-r-0'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-pressed={settings.length === length}
              >
                {length} lines
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Sections to Include
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(settings.include).map(([section, enabled]) => (
              <div key={section} className="flex items-center">
                <input
                  type="checkbox"
                  id={`section-${section}`}
                  checked={enabled}
                  onChange={() => handleSectionToggle(section as keyof SpecsSettings['include'])}
                  disabled={disabled}
                  className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                />
                <label 
                  htmlFor={`section-${section}`}
                  className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize"
                >
                  {section.replace(/([A-Z])/g, ' $1').trim()}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Outline Style
          </label>
          <select
            value={settings.outlineStyle}
            onChange={handleOutlineStyleChange}
            disabled={disabled}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="numbered">Numbered (1., 2., 2.1)</option>
            <option value="bulleted">Bulleted with Headings</option>
            <option value="headings">Headings Only</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Audience Level
          </label>
          <select
            value={settings.audienceLevel}
            onChange={handleAudienceLevelChange}
            disabled={disabled}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="exec">Executive</option>
            <option value="pm">Project Manager</option>
            <option value="engineer">Engineer</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tone
          </label>
          <select
            value={settings.tone}
            onChange={handleToneChange}
            disabled={disabled}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="concise">Concise</option>
            <option value="detailed">Detailed</option>
            <option value="formal">Formal</option>
            <option value="neutral">Neutral</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Language
          </label>
          <input
            type="text"
            value={settings.language}
            onChange={handleLanguageChange}
            disabled={disabled}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="e.g., English, Spanish, French"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Max Tokens (optional)
          </label>
          <input
            type="number"
            value={settings.maxTokens || ''}
            onChange={handleMaxTokensChange}
            disabled={disabled}
            min="100"
            max="8000"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="e.g., 2000"
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              System Prompt
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {prompt.length}/1000
            </span>
          </div>
          <textarea
            value={prompt}
            onChange={handlePromptChange}
            disabled={disabled}
            rows={4}
            maxLength={1000}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-y"
            placeholder="Enter custom instructions for the specification generator..."
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Customize how the specification is generated. This will be used as part of the system prompt.
            </p>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {prompt.length}/1000
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
