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
      <label className="block text-xs font-semibold text-gray-900 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
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
          className={`w-full px-3 py-2.5 text-left bg-white border-2 rounded-lg transition-all duration-200 text-sm ${
            disabled 
              ? 'bg-gray-50 border-gray-200 cursor-not-allowed text-gray-400'
              : hasError
                ? 'border-red-500 ring-2 ring-red-100'
                : isOpen 
                  ? 'border-blue-500 ring-2 ring-blue-100' 
                  : value 
                    ? 'border-blue-200 hover:border-blue-300' 
                    : 'border-gray-200 hover:border-gray-300'
          } focus:outline-none ${!disabled && 'focus:border-blue-500 focus:ring-2 focus:ring-blue-100'}`}
        >
          <span className={`block ${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${
                disabled ? 'text-gray-300' : isOpen ? 'text-blue-600' : 'text-gray-400'
              }`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-hidden">
            {searchable && (
              <div className="p-2 border-b border-gray-100">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
            
            <div ref={listRef} className="py-1 overflow-y-auto max-h-40" role="listbox">
              {processedOptions.map((group, groupIndex) => (
                <div key={groupIndex}>
                  {group.groupName && (
                    <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
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
                        className={`w-full px-3 py-2 text-left transition-colors text-sm ${
                          value === option.value 
                            ? 'bg-blue-50 text-blue-700 font-medium' 
                            : focusedIndex === flatIndex
                              ? 'bg-gray-50 text-gray-900'
                              : 'text-gray-900 hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <span className="truncate">{option.label}</span>
                            {option.description && (
                              <div className="text-xs text-gray-500 mt-0.5 truncate">
                                {option.description}
                              </div>
                            )}
                          </div>
                          {value === option.value && (
                            <svg className="w-3 h-3 text-blue-600 flex-shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20">
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
                <div className="px-3 py-2 text-gray-500 text-center text-sm">
                  No options found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {hasError && (
        <div className="mt-1 flex items-center text-red-600 text-xs">
          <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}