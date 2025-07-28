'use client';

import { useState, useRef, useEffect } from 'react';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder: string;
}

export default function Dropdown({ label, value, options, onChange, placeholder }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-semibold text-gray-900 mb-3">
        {label}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-4 py-4 text-left bg-white border-2 rounded-xl transition-all duration-200 ${
            isOpen 
              ? 'border-blue-500 ring-4 ring-blue-100' 
              : value 
                ? 'border-blue-200 hover:border-blue-300' 
                : 'border-gray-200 hover:border-gray-300'
          } focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100`}
        >
          <span className={`block ${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <svg 
              className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${
                isOpen ? 'text-blue-600' : 'text-gray-400'
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
          <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
            <div className="py-2">
              {options.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors ${
                    value === option.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-900'
                  } ${index === 0 ? 'rounded-t-xl' : ''} ${index === options.length - 1 ? 'rounded-b-xl' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.label}</span>
                    {value === option.value && (
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}