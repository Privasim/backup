import React, { useState, useMemo, useCallback } from 'react';
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
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    advanced: false
  });
  const [languageSearch, setLanguageSearch] = useState('');
  const [recentLanguages, setRecentLanguages] = useState<string[]>([]);
  
  const profileKeys = useMemo(() => Object.keys(DOC_PROFILES) as Array<keyof typeof DOC_PROFILES>, []);
  
  // Filter language options based on search term
  const filteredLanguages = useMemo(() => {
    if (!languageSearch) return LANGUAGE_OPTIONS;
    return LANGUAGE_OPTIONS.filter(option => 
      option.label.toLowerCase().includes(languageSearch.toLowerCase()) || 
      option.value.toLowerCase().includes(languageSearch.toLowerCase())
    );
  }, [languageSearch]);
  
  // Get recent languages that are still in our options
  const recentLanguageOptions = useMemo(() => {
    return recentLanguages
      .map(lang => LANGUAGE_OPTIONS.find(option => option.value === lang))
      .filter((option): option is typeof LANGUAGE_OPTIONS[number] => option !== undefined);
  }, [recentLanguages]);
  
  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);
  
  const handleDocProfileChange = useCallback((profile: keyof typeof DOC_PROFILES) => {
    // When changing profile, reset all advanced settings to profile defaults
    const profileSettings = {
      docProfile: profile,
      include: DOC_PROFILES[profile].include,
      outlineStyle: DOC_PROFILES[profile].outlineStyle,
      audienceLevel: DOC_PROFILES[profile].audienceLevel,
      tone: DOC_PROFILES[profile].tone,
      tokenBudget: DOC_PROFILES[profile].tokenBudget
    };
    onChange(profileSettings);
  }, [onChange]);
  
  const handleLanguageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    onChange({ language: newLanguage });
    
    // Add to recent languages
    setRecentLanguages(prev => {
      const filtered = prev.filter(lang => lang !== newLanguage);
      return [newLanguage, ...filtered].slice(0, 3); // Keep only last 3
    });
  }, [onChange]);
  
  const handleIncludeToggle = useCallback((section: keyof SpecsSettings['include']) => {
    onChange({
      include: {
        ...settings.include,
        [section]: !settings.include[section]
      }
    });
  }, [onChange, settings.include]);
  
  const handleTokenBudgetChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      onChange({ tokenBudget: Math.max(500, Math.min(8000, value)) });
    }
  }, [onChange]);

  const handleLanguageSelect = useCallback((language: string) => {
    onChange({ language });
    setRecentLanguages(prev => {
      const filtered = prev.filter(lang => lang !== language);
      return [language, ...filtered].slice(0, 3);
    });
    setLanguageSearch('');
  }, [onChange]);
  
  const handleResetToDefaults = useCallback(() => {
    const profileSettings = {
      include: DOC_PROFILES[settings.docProfile].include,
      outlineStyle: DOC_PROFILES[settings.docProfile].outlineStyle,
      audienceLevel: DOC_PROFILES[settings.docProfile].audienceLevel,
      tone: DOC_PROFILES[settings.docProfile].tone,
      tokenBudget: DOC_PROFILES[settings.docProfile].tokenBudget
    };
    onChange(profileSettings);
  }, [onChange, settings.docProfile]);
  
  const currentProfile = DOC_PROFILES[settings.docProfile];
  
  // Helper function to safely compare enum values
  const isOutlineStyle = useCallback((style: 'numbered' | 'bulleted' | 'headings') => {
    return currentProfile.outlineStyle === style;
  }, [currentProfile.outlineStyle]);

  const isAudienceLevel = useCallback((level: 'exec' | 'pm' | 'engineer') => {
    return currentProfile.audienceLevel === level;
  }, [currentProfile.audienceLevel]);

  const isTone = useCallback((tone: 'concise' | 'detailed' | 'formal' | 'neutral') => {
    return currentProfile.tone === tone;
  }, [currentProfile.tone]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 md:p-6">
      {showHeader && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Specification Settings</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Configure how your technical specification is generated
          </p>
        </div>
      )
}
      
      <div className="space-y-6">
        {/* Document Profile Selection */}
        <div>
          <label id="document-profile-label" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Document Profile
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup" aria-labelledby="document-profile-label">
            {profileKeys.map((profileKey) => {
              const profile = DOC_PROFILES[profileKey];
              return (
                <button
                  key={profileKey}
                  type="button"
                  onClick={() => handleDocProfileChange(profileKey)}
                  disabled={disabled}
                  className={`text-left p-3 rounded-lg border text-sm ${
                    settings.docProfile === profileKey
                      ? 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-900 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  aria-pressed={settings.docProfile === profileKey}
                  role="radio"
                  aria-checked={settings.docProfile === profileKey}
                >
                  <div className="font-medium text-gray-900 dark:text-white">{profile.name}</div>
                  <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">{profile.description}</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                      ~{profile.pageTarget} pages
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      {profile.tokenBudget} tokens
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Language Selection */}
        <div>
          <label id="language-label" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Language
          </label>
          <div className="relative">
            <input
              type="text"
              value={languageSearch}
              onChange={(e) => setLanguageSearch(e.target.value)}
              placeholder="Search languages..."
              className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-3 pr-10 py-2"
              disabled={disabled}
              aria-autocomplete="list"
              aria-controls="language-options"
              aria-activedescendant=""
            />
            {languageSearch && (
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                onClick={() => setLanguageSearch('')}
                aria-label="Clear search"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          
          <div id="language-options" className="mt-2 max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md" role="listbox" aria-label="Available languages">
            {/* Recent Languages */}
            {recentLanguageOptions.length > 0 && (
              <div className="border-b border-gray-200 dark:border-gray-600">
                <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50">
                  Recent
                </div>
                {recentLanguageOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleLanguageSelect(option.value)}
                    disabled={disabled}
                    className={`w-full text-left px-3 py-2 text-sm ${
                      settings.language === option.value
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-200'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    role="option"
                    aria-selected={settings.language === option.value}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
            
            {/* All Languages */}
            <div>
              {filteredLanguages.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleLanguageSelect(option.value)}
                  disabled={disabled}
                  className={`w-full text-left px-3 py-2 text-sm ${
                    settings.language === option.value
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-200'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  role="option"
                  aria-selected={settings.language === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>
            
            {filteredLanguages.length === 0 && languageSearch && (
              <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                No languages found matching "{languageSearch}"
              </div>
            )}
          </div>
        </div>
        
        {/* Derived Profile Information */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700" role="region" aria-labelledby="profile-details-heading">
          <h3 id="profile-details-heading" className="text-sm font-medium text-gray-900 dark:text-white mb-2">Profile Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600 dark:text-gray-400">Outline Style</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {isOutlineStyle('numbered') && 'Numbered'}
                {isOutlineStyle('bulleted') && 'Bulleted'}
                {isOutlineStyle('headings') && 'Headings'}
              </div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400">Audience</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {isAudienceLevel('engineer') && 'Engineers'}
                {isAudienceLevel('pm') && 'Project Managers'}
                {isAudienceLevel('exec') && 'Executives'}
              </div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400">Tone</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {isTone('concise') && 'Concise'}
                {isTone('detailed') && 'Detailed'}
                {isTone('formal') && 'Formal'}
                {isTone('neutral') && 'Neutral'}
              </div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400">Token Budget</div>
              <div className="font-medium text-gray-900 dark:text-white">{currentProfile.tokenBudget} tokens</div>
            </div>
          </div>
        </div>
        
        {/* Advanced Settings */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            className="flex items-center justify-between w-full text-left"
            onClick={() => toggleSection('advanced')}
            aria-expanded={expandedSections.advanced}
            aria-controls="advanced-settings-content"
          >
            <span className="text-sm font-medium text-gray-900 dark:text-white">Advanced Settings</span>
            <svg
              className={`h-5 w-5 text-gray-500 dark:text-gray-400 transform ${expandedSections.advanced ? 'rotate-180' : ''}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          
          {expandedSections.advanced && (
            <div id="advanced-settings-content" className="mt-4 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label id="sections-include-label" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Sections to Include
                  </label>
                  <button
                    type="button"
                    onClick={handleResetToDefaults}
                    className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Reset to defaults
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(settings.include).map(([section, enabled]) => (
                    <div key={section} className="flex items-center">
                      <input
                        id={`include-${section}`}
                        name={`include-${section}`}
                        type="checkbox"
                        checked={enabled}
                        onChange={() => handleIncludeToggle(section as keyof SpecsSettings['include'])}
                        disabled={disabled}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                        aria-describedby={`include-${section}-description`}
                      />
                      <label
                        htmlFor={`include-${section}`}
                        className="ml-2 block text-sm text-gray-900 dark:text-white"
                      >
                        {section.charAt(0).toUpperCase() + section.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label id="token-budget-label" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Token Budget Override
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="500"
                    max="8000"
                    value={settings.tokenBudget || ''}
                    onChange={handleTokenBudgetChange}
                    disabled={disabled}
                    className="block w-full rounded-md border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    aria-labelledby="token-budget-label"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">tokens</span>
                </div>
                <p id="token-budget-description" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Min: 500, Max: 8000. Profile default: {currentProfile.tokenBudget}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
