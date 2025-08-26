import React from 'react';
import { SpecsSettings } from '../types';
import { DOC_PROFILES, LANGUAGE_OPTIONS } from '../constants';

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
  const handleDocProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ docProfile: e.target.value as 'prd' | 'prd-design' | 'full-suite' });
  };
  
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ language: e.target.value });
  };
  
  return (
    <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
      {showHeader && (
        <h3 className="text-lg font-medium text-gray-900 mb-4">Specification Settings</h3>
      )}
      
      <div className="space-y-5">
        {/* Document Profile Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Profile
          </label>
          <select
            value={settings.docProfile}
            onChange={handleDocProfileChange}
            disabled={disabled}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {Object.entries(DOC_PROFILES).map(([key, profile]) => (
              <option key={key} value={key}>
                {profile.name} ({profile.pageTarget} pages)
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            {DOC_PROFILES[settings.docProfile].description}
          </p>
        </div>
        
        {/* Language Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            value={settings.language}
            onChange={handleLanguageChange}
            disabled={disabled}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
