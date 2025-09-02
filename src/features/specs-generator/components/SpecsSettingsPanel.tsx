import React, { useState, useMemo, useCallback } from 'react';
import { SpecsSettings } from '../types';
import { DOC_PROFILES, LANGUAGE_OPTIONS } from '../constants';
import { ChevronDownIcon, XCircleIcon } from '@heroicons/react/24/outline';

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
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 md:p-4">
      {showHeader && (
        <div className="mb-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Specification Settings</h2>
          <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
            Configure how your technical specification is generated
          </p>
        </div>
      )}
      
      <div className="space-y-4">
        {/* Document Profile Selection */}
        <div>
          <label id="document-profile-label" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Document Profile
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="radiogroup" aria-labelledby="document-profile-label">
            {profileKeys.map((profileKey) => {
              const profile = DOC_PROFILES[profileKey];
              return (
                <button
                  key={profileKey}
                  type="button"
                  onClick={() => handleDocProfileChange(profileKey)}
                  disabled={disabled}
                  className={`text-left p-2 rounded-lg border text-xs ${
                    settings.docProfile === profileKey
                      ? 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-900 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  aria-pressed={settings.docProfile === profileKey}
                  role="radio"
                  aria-checked={settings.docProfile === profileKey}
                >
                  <div className="font-medium text-gray-900 dark:text-white text-xs">{profile.name}</div>
                  <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{profile.description}</div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                      ~{profile.pageTarget}p
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      {profile.tokenBudget}t
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Language Selection */}
        <div>
          <label id="language-label" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Language
          </label>
          <div className="relative">
            <input
              type="text"
              value={languageSearch}
              onChange={(e) => setLanguageSearch(e.target.value)}
              placeholder="Search languages..."
              className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs pl-2.5 pr-8 py-1.5"
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
                <XCircleIcon className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div id="language-options" className="mt-1.5 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md" role="listbox" aria-label="Available languages">
            {/* Recent Languages */}
            {recentLanguageOptions.length > 0 && (
              <div className="border-b border-gray-200 dark:border-gray-600">
                <div className="px-2 py-1 text-[10px] font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50">
                  Recent
                </div>
                {recentLanguageOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleLanguageSelect(option.value)}
                    disabled={disabled}
                    className={`w-full text-left px-2 py-1.5 text-xs ${
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
                  className={`w-full text-left px-2 py-1.5 text-xs ${
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
              <div className="px-2 py-3 text-center text-xs text-gray-500 dark:text-gray-400">
                No languages found matching "{languageSearch}"
              </div>
            )}
          </div>
        </div>
        
        {/* Derived Profile Information */}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700" role="region" aria-labelledby="profile-details-heading">
          <h3 id="profile-details-heading" className="text-xs font-medium text-gray-900 dark:text-white mb-1.5">Profile Details</h3>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div>
              <div className="text-gray-600 dark:text-gray-400 text-[10px]">Style</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {isOutlineStyle('numbered') && 'Numbered'}
                {isOutlineStyle('bulleted') && 'Bulleted'}
                {isOutlineStyle('headings') && 'Headings'}
              </div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400 text-[10px]">Audience</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {isAudienceLevel('engineer') && 'Engineers'}
                {isAudienceLevel('pm') && 'Project Managers'}
                {isAudienceLevel('exec') && 'Executives'}
              </div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400 text-[10px]">Tone</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {isTone('concise') && 'Concise'}
                {isTone('detailed') && 'Detailed'}
                {isTone('formal') && 'Formal'}
                {isTone('neutral') && 'Neutral'}
              </div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400 text-[10px]">Tokens</div>
              <div className="font-medium text-gray-900 dark:text-white">{currentProfile.tokenBudget}</div>
            </div>
          </div>
        </div>
        
        {/* Advanced Settings */}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            className="flex items-center justify-between w-full text-left"
            onClick={() => toggleSection('advanced')}
            aria-expanded={expandedSections.advanced}
            aria-controls="advanced-settings-content"
          >
            <span className="text-xs font-medium text-gray-900 dark:text-white">Advanced Settings</span>
            <ChevronDownIcon
              className={`h-4 w-4 text-gray-500 dark:text-gray-400 transform ${expandedSections.advanced ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>
          
          {expandedSections.advanced && (
            <div id="advanced-settings-content" className="mt-3 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label id="sections-include-label" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Sections to Include
                  </label>
                  <button
                    type="button"
                    onClick={handleResetToDefaults}
                    className="text-xs text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Reset to defaults
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-x-2 gap-y-1">
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
                        className="ml-1.5 block text-xs text-gray-900 dark:text-white"
                      >
                        {section.charAt(0).toUpperCase() + section.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label id="token-budget-label" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
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
                    className="block w-full rounded-md border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs py-1.5"
                    aria-labelledby="token-budget-label"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">tokens</span>
                </div>
                <p id="token-budget-description" className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                  Min: 500, Max: 8000. Default: {currentProfile.tokenBudget}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
