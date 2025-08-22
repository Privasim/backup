/**
 * FilterBar component for dashboard metrics
 * Provides time range and comparison filters
 */
import React from 'react';
import { DashboardFilters } from '../../app/businessidea/tabs/visualization/metrics-types';

interface FilterBarProps {
  filters: DashboardFilters;
  onFilterChange: (filters: Partial<DashboardFilters>) => void;
  className?: string;
}

export function FilterBar({ filters, onFilterChange, className = '' }: FilterBarProps): JSX.Element {
  return (
    <div className={`sticky top-0 z-10 bg-white px-3 py-2 flex items-center justify-between border-b border-gray-100 ${className}`}>
      <div className="flex items-center space-x-2">
        <h2 className="text-base font-medium text-gray-900">Measurements</h2>
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Time Range Filter */}
        <div className="inline-flex rounded-full bg-gray-100 p-0.5 text-xs font-medium">
          {(['7d', '30d', '12w'] as const).map((range) => (
            <button
              key={range}
              className={`px-2.5 py-1 rounded-full transition-colors ${
                filters.timeRange === range 
                  ? 'bg-white text-gray-800 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => onFilterChange({ timeRange: range })}
              aria-pressed={filters.timeRange === range}
            >
              {range === '7d' ? 'Last week' : range === '30d' ? 'Last month' : 'Last quarter'}
            </button>
          ))}
        </div>
        
        {/* User Avatar/Profile Button */}
        <button 
          className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-500"
          aria-label="User profile"
        >
          <span className="text-xs">👤</span>
        </button>
      </div>
    </div>
  );
}
