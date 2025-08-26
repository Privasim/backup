import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { SortMode } from '../../../features/tools-registry/types';

interface HeaderBarProps {
  title: string;
  subtitle?: string;
  query: string;
  onSearchChange: (query: string) => void;
  onOpenFilters: () => void;
  sort: SortMode;
  onSortChange: (sort: SortMode) => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  subtitle,
  query,
  onSearchChange,
  onOpenFilters,
  sort,
  onSortChange,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Handle scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className={`sticky top-0 z-10 transition-all duration-300 ease-in-out bg-slate-50 dark:bg-gray-900 ${isScrolled ? 'py-2' : 'py-4'}`}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-3">
          {/* Title area */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-gray-900 dark:text-gray-100 font-semibold transition-all duration-300 ${isScrolled ? 'text-xl' : 'text-2xl'}`}>
                {title}
              </h1>
              {subtitle && <p className="text-gray-500 dark:text-gray-400 text-sm">{subtitle}</p>}
            </div>
          </div>
          
          {/* Search and filters */}
          <div className="flex gap-2 items-center">
            <div className={`flex-1 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm
              transition-all duration-300 flex items-center px-3 py-1.5
              ${isFocused ? 'ring-2 ring-blue-100 dark:ring-blue-900/40' : ''}`}>
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search tools..."
                aria-label="Search tools"
                className="bg-transparent border-none focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ml-2 w-full"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
            </div>
            <button
              onClick={onOpenFilters}
              className="rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
              aria-label="Open filters"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          
          {/* Sort options */}
          <div className="flex justify-end">
            <div className="bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 p-1 flex text-xs shadow-sm">
              {(['name', 'price-asc', 'price-desc', 'recent'] as SortMode[]).map((sortOption) => (
                <button
                  key={sortOption}
                  onClick={() => onSortChange(sortOption)}
                  className={`px-3 py-1 rounded-full transition-all ${
                    sort === sortOption 
                      ? 'bg-blue-600 text-white font-medium' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {sortOption === 'name' && 'Name'}
                  {sortOption === 'price-asc' && 'Price ↑'}
                  {sortOption === 'price-desc' && 'Price ↓'}
                  {sortOption === 'recent' && 'Recent'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
