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
        <label className="text-label" style={{ color: 'var(--neutral-900)' }}>
          {label}
          {required && <span style={{ color: 'var(--error-500)' }} className="ml-1">*</span>}
        </label>
        
        {filteredSkills.length > 0 && (
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={selectAll}
              disabled={!canSelectMore}
              className="btn-base btn-sm btn-ghost"
              style={{ 
                color: canSelectMore ? 'var(--primary-600)' : 'var(--neutral-400)',
                cursor: canSelectMore ? 'pointer' : 'not-allowed'
              }}
            >
              Select All
            </button>
            <button
              type="button"
              onClick={clearAll}
              disabled={selectedSkills.length === 0}
              className="btn-base btn-sm btn-ghost"
              style={{ 
                color: selectedSkills.length > 0 ? 'var(--neutral-600)' : 'var(--neutral-400)',
                cursor: selectedSkills.length > 0 ? 'pointer' : 'not-allowed'
              }}
            >
              Clear All
            </button>
          </div>
        )}
      </div>
      
      <p className="text-body-sm mb-4" style={{ color: 'var(--neutral-600)' }}>
        Select the skills and technologies you work with regularly
        {maxSelections && (
          <span className="badge-neutral ml-2">
            {selectedSkills.length}/{maxSelections} selected
          </span>
        )}
      </p>

      {searchable && (
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search skills and technologies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base pl-10 modern-focus"
            />
            <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" 
                 style={{ color: 'var(--neutral-400)' }} 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredSkills.map((skill) => {
          const isSelected = selectedSkills.includes(skill);
          const isDisabled = !isSelected && !canSelectMore;
          
          return (
            <button
              key={skill}
              type="button"
              onClick={() => toggleSkill(skill)}
              disabled={isDisabled}
              className="card-interactive text-left p-3 transition-all duration-200 hover:scale-105"
              style={{
                background: isSelected
                  ? 'var(--primary-50)'
                  : isDisabled
                    ? 'var(--neutral-50)'
                    : 'white',
                borderColor: isSelected
                  ? 'var(--primary-300)'
                  : isDisabled
                    ? 'var(--neutral-200)'
                    : 'var(--neutral-200)',
                color: isSelected
                  ? 'var(--primary-700)'
                  : isDisabled
                    ? 'var(--neutral-400)'
                    : 'var(--neutral-700)',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                transform: isDisabled ? 'none' : undefined
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-body-sm font-medium truncate pr-2">{skill}</span>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                       style={{ background: 'var(--primary-600)' }}>
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
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
            className="btn-base btn-sm btn-secondary"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Show {availableSkills.length - 12} more skills
          </button>
        </div>
      )}

      {searchQuery && filteredSkills.length === 0 && (
        <div className="text-center py-8">
          <svg className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--neutral-300)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-body" style={{ color: 'var(--neutral-500)' }}>No skills found for "{searchQuery}"</p>
          <p className="text-body-sm mt-1" style={{ color: 'var(--neutral-400)' }}>Try a different search term</p>
        </div>
      )}
      
      {selectedSkills.length > 0 && (
        <div className={`mt-4 card-base p-4 ${hasError ? 'border-error-200' : 'border-success-200'}`}
             style={{ 
               background: hasError ? 'var(--error-50)' : 'var(--success-50)' 
             }}>
          <div className="flex items-start">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-0.5`}
                 style={{ 
                   background: hasError ? 'var(--error-600)' : 'var(--success-600)' 
                 }}>
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-label-sm mb-3" 
                 style={{ 
                   color: hasError ? 'var(--error-900)' : 'var(--success-900)' 
                 }}>
                {selectedSkills.length} skill{selectedSkills.length !== 1 ? 's' : ''} selected
                {maxSelections && ` (${selectedSkills.length}/${maxSelections})`}
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-3 py-1 rounded-full text-body-sm font-medium"
                    style={{
                      background: hasError ? 'var(--error-100)' : 'var(--success-100)',
                      color: hasError ? 'var(--error-800)' : 'var(--success-800)',
                      border: `1px solid ${hasError ? 'var(--error-200)' : 'var(--success-200)'}`
                    }}
                  >
                    <span className="truncate max-w-24">{skill}</span>
                    <button
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className="ml-2 hover:scale-110 transition-transform rounded-full p-0.5"
                      style={{ 
                        color: hasError ? 'var(--error-600)' : 'var(--success-600)' 
                      }}
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
        <div className="mt-2 flex items-center text-body-sm" style={{ color: 'var(--error-600)' }}>
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}