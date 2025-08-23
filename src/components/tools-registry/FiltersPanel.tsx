import React from 'react';
import { cn } from '@/lib/utils';

export interface FiltersPanelProps {
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
  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Capabilities</h4>
          {onClear && selectedCapabilities.length > 0 && (
            <button
              onClick={onClear}
              className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
        
        <div className="space-y-1">
          {availableCapabilities.map((capability) => (
            <div key={capability} className="flex items-center">
              <input
                id={`capability-${capability}`}
                type="checkbox"
                checked={selectedCapabilities.includes(capability)}
                onChange={() => onToggle(capability)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
              />
              <label
                htmlFor={`capability-${capability}`}
                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
              >
                {capability}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
