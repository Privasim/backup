'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useOccupationSearch } from '@/hooks/useResearchData';
import { OccupationMatch } from '@/lib/research/service';

export interface OccupationSearchProps {
  onSelect?: (occupation: OccupationMatch) => void;
  placeholder?: string;
  className?: string;
  showRiskScores?: boolean;
  maxResults?: number;
}

export function OccupationSearch({
  onSelect,
  placeholder = 'Search for an occupation...',
  className = '',
  showRiskScores = true,
  maxResults = 10,
}: OccupationSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { results, search, clearResults, isLoading } = useOccupationSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        search(query, { limit: maxResults });
        setIsOpen(true);
      } else {
        clearResults();
        setIsOpen(false);
      }
      setSelectedIndex(-1);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, search, clearResults, maxResults]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || results.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : results.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < results.length) {
            handleSelect(results[selectedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (occupation: OccupationMatch) => {
    setQuery(occupation.occupation.name);
    setIsOpen(false);
    setSelectedIndex(-1);
    onSelect?.(occupation);
  };

  const handleClear = () => {
    setQuery('');
    clearResults();
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const getRiskColor = (riskScore: number): string => {
    if (riskScore >= 0.8) return 'text-red-600 bg-red-50';
    if (riskScore >= 0.6) return 'text-orange-600 bg-orange-50';
    if (riskScore >= 0.4) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getRiskLabel = (riskScore: number): string => {
    if (riskScore >= 0.8) return 'Very High';
    if (riskScore >= 0.6) return 'High';
    if (riskScore >= 0.4) return 'Medium';
    return 'Low';
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
        
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400" />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto"
        >
          {isLoading && (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                Searching...
              </div>
            </div>
          )}

          {!isLoading && results.length === 0 && query && (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              No occupations found for "{query}"
            </div>
          )}

          {!isLoading && results.map((result, index) => (
            <button
              key={`${result.occupation.code}-${index}`}
              onClick={() => handleSelect(result)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {result.occupation.name}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    SOC: {result.occupation.code}
                  </div>
                  {result.matchReasons.length > 0 && (
                    <div className="text-xs text-blue-600 mt-1">
                      Match: {result.matchReasons.slice(0, 2).join(', ')}
                    </div>
                  )}
                </div>
                
                {showRiskScores && (
                  <div className="flex-shrink-0 ml-4">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(result.occupation.riskScore)}`}>
                      {getRiskLabel(result.occupation.riskScore)}
                    </div>
                    <div className="text-xs text-gray-500 text-center mt-1">
                      {(result.occupation.riskScore * 100).toFixed(1)}%
                    </div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default OccupationSearch;