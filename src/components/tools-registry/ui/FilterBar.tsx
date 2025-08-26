import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface FilterBarProps {
  selectedCategory?: string;
  categoryLabel?: string;
  query: string;
  capabilities: string[];
  capabilityLabels: Record<string, string>;
  onClearAll: () => void;
  onRemoveCapability: (slug: string) => void;
  onClearQuery: () => void;
  onClearCategory: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedCategory,
  categoryLabel,
  query,
  capabilities,
  capabilityLabels,
  onClearAll,
  onRemoveCapability,
  onClearQuery,
  onClearCategory,
}) => {
  const hasFilters = selectedCategory || query || capabilities.length > 0;
  
  if (!hasFilters) return null;
  
  return (
    <div className="bg-transparent py-2 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-1">
          {/* Active filters as chips */}
          {selectedCategory && (
            <button
              onClick={onClearCategory}
              className="inline-flex items-center px-3 py-1 rounded-full border border-gray-200 bg-white text-gray-700 text-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
            >
              <span>Category: {categoryLabel}</span>
              <XMarkIcon className="w-4 h-4 ml-1" />
            </button>
          )}
          
          {query && (
            <button
              onClick={onClearQuery}
              className="inline-flex items-center px-3 py-1 rounded-full border border-gray-200 bg-white text-gray-700 text-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
            >
              <span>Search: {query}</span>
              <XMarkIcon className="w-4 h-4 ml-1" />
            </button>
          )}
          
          {capabilities.map(capability => (
            <button
              key={capability}
              onClick={() => onRemoveCapability(capability)}
              className="inline-flex items-center px-3 py-1 rounded-full border border-gray-200 bg-white text-gray-700 text-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
            >
              <span>{capabilityLabels[capability] || capability}</span>
              <XMarkIcon className="w-4 h-4 ml-1" />
            </button>
          ))}
        </div>
        
        {/* Clear all button */}
        {hasFilters && (
          <button
            onClick={onClearAll}
            className="text-sm text-gray-600 hover:text-gray-800 whitespace-nowrap underline-offset-2 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
;
