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
      className={`sticky top-0 z-10 transition-all duration-300 ease-in-out
        ${isScrolled ? 'py-2 shadow-md' : 'py-4'}
        bg-gradient-to-r from-blue-500 to-indigo-600`}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-3">
          {/* Title area */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-white font-semibold transition-all duration-300 ${isScrolled ? 'text-xl' : 'text-2xl'}`}>
                {title}
              </h1>
              {subtitle && <p className="text-blue-100 text-sm">{subtitle}</p>}
            </div>
          </div>
          
          {/* Search and filters */}
          <div className="flex gap-2 items-center">
            <div className={`flex-1 bg-white bg-opacity-20 backdrop-blur-sm rounded-full 
              transition-all duration-300 flex items-center px-3 py-1.5
              ${isFocused ? 'ring-2 ring-white ring-opacity-50' : ''}`}>
              <MagnifyingGlassIcon className="h-5 w-5 text-white" />
              <input
                type="text"
                value={query}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search tools..."
                className="bg-transparent border-none focus:outline-none text-white placeholder-blue-100 ml-2 w-full"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
            </div>
            <button
              onClick={onOpenFilters}
              className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-2 hover:bg-opacity-30 transition-all"
              aria-label="Open filters"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5 text-white" />
            </button>
          </div>
          
          {/* Sort options */}
          <div className="flex justify-end">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-1 flex text-xs">
              {(['name', 'price-asc', 'price-desc', 'recent'] as SortMode[]).map((sortOption) => (
                <button
                  key={sortOption}
                  onClick={() => onSortChange(sortOption)}
                  className={`px-3 py-1 rounded-full transition-all ${
                    sort === sortOption 
                      ? 'bg-white text-blue-600 font-medium' 
                      : 'text-white hover:bg-white hover:bg-opacity-10'
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
