'use client';

import React from 'react';

interface ContentFilterControlsProps {
  showRelevantOnly: boolean;
  sortBy: 'date' | 'relevance' | 'analysis';
  selectedCount: number;
  totalCount: number;
  onShowRelevantChange: (show: boolean) => void;
  onSortByChange: (sort: 'date' | 'relevance' | 'analysis') => void;
  onAnalyzeSelected: () => void;
  onSelectAll: (select: boolean) => void;
  isAnalyzing?: boolean;
  className?: string;
}

export default function ContentFilterControls({
  showRelevantOnly,
  sortBy,
  selectedCount,
  totalCount,
  onShowRelevantChange,
  onSortByChange,
  onAnalyzeSelected,
  onSelectAll,
  isAnalyzing = false,
  className = ''
}: ContentFilterControlsProps) {
  const handleShowRelevantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onShowRelevantChange(e.target.value === 'relevant');
  };

  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSortByChange(e.target.value as 'date' | 'relevance' | 'analysis');
  };

  const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelectAll(e.target.checked);
  };

  const allSelected = selectedCount === totalCount && totalCount > 0;
  const someSelected = selectedCount > 0 && selectedCount < totalCount;

  return (
    <div className={`content-filter-controls bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        {/* Left side - Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Show Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Show:</label>
            <select
              value={showRelevantOnly ? 'relevant' : 'all'}
              onChange={handleShowRelevantChange}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Articles</option>
              <option value="relevant">Job Loss Only</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Sort:</label>
            <select
              value={sortBy}
              onChange={handleSortByChange}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="date">Latest First</option>
              <option value="relevance">By Relevance</option>
              <option value="analysis">Analyzed First</option>
            </select>
          </div>

          {/* Article Count */}
          <div className="text-sm text-gray-600">
            Showing {totalCount} articles
          </div>
        </div>

        {/* Right side - Selection and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Select All */}
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(input) => {
                if (input) input.indeterminate = someSelected;
              }}
              onChange={handleSelectAllChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-gray-700">
              {allSelected ? 'Deselect All' : someSelected ? 'Select All' : 'Select All'}
            </span>
          </label>

          {/* Selection Info */}
          {selectedCount > 0 && (
            <div className="text-sm text-blue-600 font-medium">
              {selectedCount} selected
            </div>
          )}

          {/* Analyze Button */}
          <button
            onClick={onAnalyzeSelected}
            disabled={selectedCount === 0 || isAnalyzing}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-md transition-colors flex items-center space-x-2 text-sm"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>Analyze Selected ({selectedCount})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Status */}
      {isAnalyzing && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 text-sm text-blue-700">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Analyzing {selectedCount} selected articles using AI...</span>
          </div>
        </div>
      )}
    </div>
  );
}