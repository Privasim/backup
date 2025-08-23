'use client';

import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface FiltersPanelProps {
  selectedCapabilities: string[];
  availableCapabilities: string[];
  onToggle: (capability: string) => void;
  onClear?: () => void;
  className?: string;
}

export function FiltersPanel({ 
  selectedCapabilities, 
  availableCapabilities, 
  onToggle, 
  onClear,
  className 
}: FiltersPanelProps) {
  if (availableCapabilities.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Capabilities
        </h3>
        {selectedCapabilities.length > 0 && onClear && (
          <button
            onClick={onClear}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Selected capabilities */}
      {selectedCapabilities.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCapabilities.map((capability) => (
            <button
              key={capability}
              onClick={() => onToggle(capability)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors group"
            >
              <span className="capitalize">{capability.replace(/-/g, ' ')}</span>
              <XMarkIcon className="h-3 w-3 group-hover:text-blue-800 dark:group-hover:text-blue-200" />
            </button>
          ))}
        </div>
      )}

      {/* Available capabilities */}
      <div className="max-h-64 overflow-y-auto">
        <div className="flex flex-wrap gap-2">
          {availableCapabilities
            .filter(cap => !selectedCapabilities.includes(cap))
            .map((capability) => (
              <button
                key={capability}
                onClick={() => onToggle(capability)}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                <span className="capitalize">{capability.replace(/-/g, ' ')}</span>
              </button>
            ))}
        </div>
      </div>

      {selectedCapabilities.length > 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Showing tools with <span className="font-medium">{selectedCapabilities.length}</span> selected capabilities
        </div>
      )}
    </div>
  );
}
