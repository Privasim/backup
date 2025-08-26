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
              className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors underline-offset-2 hover:underline"
            >
              Clear all
            </button>
          )}
        </div>

        <div role="group" aria-label="Capabilities" className="flex flex-wrap gap-2">
          {availableCapabilities.map((capability) => {
            const selected = selectedCapabilities.includes(capability);
            return (
              <button
                key={capability}
                type="button"
                aria-pressed={selected}
                onClick={() => onToggle(capability)}
                className={cn(
                  "inline-flex items-center px-3 py-1.5 rounded-full border text-sm transition-colors focus-visible:outline-none focus-visible:ring-2",
                  selected
                    ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300 focus-visible:ring-blue-300"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 focus-visible:ring-blue-200"
                )}
              >
                <span className="truncate max-w-[200px]">{capability}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
