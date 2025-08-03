'use client';

import React from 'react';

interface RefreshIntervalSelectorProps {
  value: number; // minutes
  onChange: (interval: number) => void;
  className?: string;
}

const REFRESH_OPTIONS = [
  { value: 5, label: '5 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
  { value: 240, label: '4 hours' },
  { value: 480, label: '8 hours' },
  { value: 720, label: '12 hours' },
  { value: 1440, label: '24 hours' },
];

export default function RefreshIntervalSelector({
  value,
  onChange,
  className = ''
}: RefreshIntervalSelectorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(parseInt(e.target.value, 10));
  };

  return (
    <div className={`refresh-interval-selector ${className}`}>
      <div className="flex flex-col space-y-2">
        <label htmlFor="refresh-interval" className="text-sm font-medium text-gray-700">
          Auto-refresh Interval
        </label>
        
        <div className="flex items-center space-x-2">
          <select
            id="refresh-interval"
            value={value}
            onChange={handleChange}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {REFRESH_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Automatic refresh</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-500">
          RSS feed will be automatically refreshed at this interval
        </div>
      </div>
    </div>
  );
}