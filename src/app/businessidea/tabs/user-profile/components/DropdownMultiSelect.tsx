"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";

type Props = {
  label?: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  maxSelected?: number;
  placeholder?: string;
  recommended?: string[];
  onSelectAllRecommended?: () => void;
  className?: string;
  compact?: boolean;
};

export default function DropdownMultiSelect({ 
  label, 
  options, 
  value, 
  onChange, 
  maxSelected, 
  placeholder = "Select...", 
  recommended,
  onSelectAllRecommended,
  className = "",
  compact = true
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    return options.filter(option => 
      option.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  const orderedOptions = useMemo(() => {
    if (!recommended || recommended.length === 0) return filteredOptions;
    
    const recommendedFiltered = recommended.filter(r => filteredOptions.includes(r));
    const othersFiltered = filteredOptions.filter(o => !recommended.includes(o));
    
    return [...recommendedFiltered, ...othersFiltered];
  }, [filteredOptions, recommended]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggle = (option: string) => {
    const exists = value.includes(option);
    if (exists) {
      onChange(value.filter(v => v !== option));
    } else {
      if (maxSelected && value.length >= maxSelected) return;
      onChange([...value, option]);
    }
  };

  const handleSelectAll = () => {
    if (onSelectAllRecommended) {
      onSelectAllRecommended();
    }
  };

  const getDisplayText = () => {
    if (value.length === 0) return placeholder;
    if (compact && value.length > 2) {
      return `${value[0]}, ${value[1]} + ${value.length - 2} more`;
    }
    if (value.length > 3) {
      return `${value.slice(0, 3).join(", ")} + ${value.length - 3} more`;
    }
    return value.join(", ");
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-xs font-medium text-gray-700">
            {label}
            <span className="ml-1 text-[11px] font-normal text-gray-500">
              ({value.length}{maxSelected ? `/${maxSelected}` : ""} selected)
            </span>
          </label>
          {recommended && recommended.length > 0 && onSelectAllRecommended && (
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-[10px] px-2 py-0.5 rounded border border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
            >
              Quick select
            </button>
          )}
        </div>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2.5 text-left bg-white border rounded-lg transition-all duration-200 ${
          isOpen 
            ? 'border-indigo-300 ring-2 ring-indigo-100' 
            : 'border-gray-200 hover:border-gray-300'
        } ${value.length > 0 ? 'text-gray-800' : 'text-gray-500'}`}
      >
        <span className="text-sm truncate">{getDisplayText()}</span>
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search options..."
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {orderedOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">No options found</div>
            ) : (
              orderedOptions.map((option) => {
                const isSelected = value.includes(option);
                const isRecommended = recommended?.includes(option);
                const isDisabled = !isSelected && maxSelected !== undefined && value.length >= maxSelected;
                
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => !isDisabled && toggle(option)}
                    disabled={isDisabled}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      isSelected 
                        ? 'bg-indigo-50 text-indigo-600 font-medium' 
                        : isDisabled
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        {isSelected && (
                          <svg className="w-3 h-3 mr-2 text-indigo-500" fill="currentColor" viewBox="0 0 12 12">
                            <path d="M3.5 6L5 7.5L8.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                          </svg>
                        )}
                        {option}
                      </span>
                      {isRecommended && !isSelected && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">
                          recommended
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}