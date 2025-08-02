'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { EnhancedDropdownProps, DropdownOption } from '@/lib/quiz/types';

export default function Dropdown({ 
  label, 
  value, 
  options, 
  onChange, 
  placeholder,
  searchable = false,
  error,
  touched,
  required = false,
  disabled = false,
  groupBy
}: EnhancedDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter and group options
  const processedOptions = useMemo(() => {
    let filtered = options;

    // Filter by search query
    if (searchable && searchQuery) {
      filtered = options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        option.value.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Group options if groupBy function is provided
    if (groupBy) {
      const grouped = filtered.reduce((acc, option) => {
        const group = groupBy(option);
        if (!acc[group]) acc[group] = [];
        acc[group].push(option);
        return acc;
      }, {} as Record<string, DropdownOption[]>);

      return Object.entries(grouped).map(([groupName, groupOptions]) => ({
        groupName,
        options: groupOptions
      }));
    }

    return [{ groupName: null, options: filtered }];
  }, [options, searchQuery, searchable, groupBy]);

  // Flatten options for keyboard navigation
  const flatOptions = useMemo(() => {
    return processedOptions.flatMap(group => group.options);
  }, [processedOptions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
    setSearchQuery('');
    setFocusedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < flatOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : flatOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && flatOptions[focusedIndex]) {
          handleSelect(flatOptions[focusedIndex].value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        setFocusedIndex(-1);
        break;
    }
  };

  const selectedOption = options.find(option => option.value === value);
  const hasError = touched && error;

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="text-label mb-2 block" style={{ color: 'var(--neutral-900)' }}>
        {label}
        {required && <span style={{ color: 'var(--error-500)' }} className="ml-1">*</span>}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-labelledby={`${label}-label`}
          className={`input-base text-left ${
            disabled 
              ? 'cursor-not-allowed'
              : hasError
                ? 'input-error'
                : value 
                  ? 'input-success' 
                  : ''
          } modern-focus`}
          style={{
            borderColor: disabled 
              ? 'var(--neutral-200)'
              : hasError
                ? 'var(--error-500)'
                : isOpen
                  ? 'var(--primary-500)'
                  : value
                    ? 'var(--success-300)'
                    : 'var(--neutral-200)',
            background: disabled ? 'var(--neutral-50)' : 'white',
            color: disabled ? 'var(--neutral-400)' : 'var(--neutral-900)'
          }}
        >
          <span className="block" style={{ 
            color: selectedOption 
              ? 'var(--neutral-900)' 
              : 'var(--neutral-500)' 
          }}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              style={{ 
                color: disabled 
                  ? 'var(--neutral-300)' 
                  : isOpen 
                    ? 'var(--primary-600)' 
                    : 'var(--neutral-400)' 
              }}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-20 w-full mt-2 card-elevated max-h-64 overflow-hidden animate-scale-in">
            {searchable && (
              <div className="p-3" style={{ borderBottom: '1px solid var(--neutral-200)' }}>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search options..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-base text-body-sm"
                  style={{ padding: 'var(--space-2) var(--space-3)' }}
                />
              </div>
            )}
            
            <div ref={listRef} className="py-2 overflow-y-auto max-h-48" role="listbox">
              {processedOptions.map((group, groupIndex) => (
                <div key={groupIndex}>
                  {group.groupName && (
                    <div className="px-4 py-2 text-label-sm" 
                         style={{ 
                           color: 'var(--neutral-500)', 
                           background: 'var(--neutral-50)',
                           borderBottom: '1px solid var(--neutral-200)'
                         }}>
                      {group.groupName}
                    </div>
                  )}
                  {group.options.map((option, optionIndex) => {
                    const flatIndex = processedOptions
                      .slice(0, groupIndex)
                      .reduce((acc, g) => acc + g.options.length, 0) + optionIndex;
                    
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelect(option.value)}
                        role="option"
                        aria-selected={value === option.value}
                        className="w-full px-4 py-3 text-left transition-all text-body hover:transform hover:scale-[1.01]"
                        style={{
                          background: value === option.value 
                            ? 'var(--primary-50)' 
                            : focusedIndex === flatIndex
                              ? 'var(--neutral-50)'
                              : 'transparent',
                          color: value === option.value 
                            ? 'var(--primary-700)' 
                            : 'var(--neutral-900)',
                          fontWeight: value === option.value ? 'var(--font-medium)' : 'var(--font-normal)'
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <span className="truncate">{option.label}</span>
                            {option.description && (
                              <div className="text-body-sm mt-1 truncate" style={{ color: 'var(--neutral-500)' }}>
                                {option.description}
                              </div>
                            )}
                          </div>
                          {value === option.value && (
                            <svg className="w-4 h-4 flex-shrink-0 ml-3" style={{ color: 'var(--primary-600)' }} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
              
              {flatOptions.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <svg className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--neutral-300)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-body-sm" style={{ color: 'var(--neutral-500)' }}>No options found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

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