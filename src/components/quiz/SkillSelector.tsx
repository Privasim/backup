'use client';

import { useState, useMemo } from 'react';

interface SkillSelectorProps {
  label: string;
  selectedSkills: string[];
  availableSkills: string[];
  onChange: (skills: string[]) => void;
  error?: string;
  touched?: boolean;
  required?: boolean;
  maxSelections?: number;
  searchable?: boolean;
}

export default function SkillSelector({ 
  label, 
  selectedSkills, 
  availableSkills, 
  onChange,
  error,
  touched,
  required = false,
  maxSelections,
  searchable = true
}: SkillSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  const filteredSkills = useMemo(() => {
    let filtered = availableSkills;

    if (searchQuery) {
      filtered = availableSkills.filter(skill =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Show only first 12 skills initially, unless showAll is true
    if (!showAll && !searchQuery) {
      filtered = filtered.slice(0, 12);
    }

    return filtered;
  }, [availableSkills, searchQuery, showAll]);

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      onChange(selectedSkills.filter(s => s !== skill));
    } else {
      if (maxSelections && selectedSkills.length >= maxSelections) {
        return; // Don't add if max selections reached
      }
      onChange([...selectedSkills, skill]);
    }
  };

  const selectAll = () => {
    const skillsToAdd = filteredSkills.filter(skill => !selectedSkills.includes(skill));
    const newSelections = [...selectedSkills, ...skillsToAdd];
    
    if (maxSelections) {
      onChange(newSelections.slice(0, maxSelections));
    } else {
      onChange(newSelections);
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  const hasError = touched && error;
  const canSelectMore = !maxSelections || selectedSkills.length < maxSelections;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-semibold text-gray-900">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {filteredSkills.length > 0 && (
          <div className="flex items-center space-x-2 text-sm">
            <button
              type="button"
              onClick={selectAll}
              disabled={!canSelectMore}
              className="text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed font-medium"
            >
              Select All
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={clearAll}
              disabled={selectedSkills.length === 0}
              className="text-gray-600 hover:text-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed font-medium"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Select all skills that apply to your current role (choose at least one)
        {maxSelections && (
          <span className="block mt-1 text-gray-500">
            Maximum {maxSelections} selections • {selectedSkills.length} selected
          </span>
        )}
      </p>

      {searchable && (
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredSkills.map((skill) => {
          const isSelected = selectedSkills.includes(skill);
          const isDisabled = !isSelected && !canSelectMore;
          
          return (
            <button
              key={skill}
              type="button"
              onClick={() => toggleSkill(skill)}
              disabled={isDisabled}
              className={`px-4 py-3 text-sm font-medium rounded-xl border-2 transition-all duration-200 text-left ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                  : isDisabled
                    ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="truncate pr-2">{skill}</span>
                {isSelected && (
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {!showAll && !searchQuery && availableSkills.length > 12 && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Show {availableSkills.length - 12} more skills
          </button>
        </div>
      )}

      {searchQuery && filteredSkills.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p>No skills found matching "{searchQuery}"</p>
        </div>
      )}
      
      {selectedSkills.length > 0 && (
        <div className={`mt-4 p-4 rounded-xl border ${hasError ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
          <div className="flex items-start">
            <svg className={`w-5 h-5 mr-2 mt-0.5 flex-shrink-0 ${hasError ? 'text-red-600' : 'text-blue-600'}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className={`text-sm font-medium mb-1 ${hasError ? 'text-red-900' : 'text-blue-900'}`}>
                {selectedSkills.length} skill{selectedSkills.length !== 1 ? 's' : ''} selected
                {maxSelections && ` (${selectedSkills.length}/${maxSelections})`}
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedSkills.map((skill) => (
                  <span
                    key={skill}
                    className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                      hasError ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className="ml-1 hover:bg-red-200 rounded-full p-0.5"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {hasError && (
        <div className="mt-2 flex items-center text-red-600 text-sm">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}