import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface SortMenuProps {
  value: 'name' | 'popularity' | 'newest';
  onChange: (value: 'name' | 'popularity' | 'newest') => void;
  className?: string;
}

export function SortMenu({ value, onChange, className }: SortMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  
  const handleSelect = (newValue: 'name' | 'popularity' | 'newest') => {
    onChange(newValue);
    setIsOpen(false);
  };
  
  const getSortLabel = (sort: 'name' | 'popularity' | 'newest') => {
    switch (sort) {
      case 'name': return 'Sort by Name';
      case 'popularity': return 'Sort by Popularity';
      case 'newest': return 'Sort by Newest';
    }
  };

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={toggleMenu}
        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {getSortLabel(value)}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={cn("ml-2 h-4 w-4 transition-transform", isOpen ? "transform rotate-180" : "")} 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {(['name', 'popularity', 'newest'] as const).map((option) => (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={cn(
                  "block w-full text-left px-4 py-2 text-sm transition-colors",
                  value === option
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
                role="menuitem"
              >
                {getSortLabel(option)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
