'use client';

import React, { useCallback } from 'react';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { usePlanSettings } from '@/hooks/usePlanSettings';

// Settings component props
export interface PlanSettingsProps {
  compact?: boolean;
  showPreview?: boolean;
  className?: string;
  onSettingsChange?: (visualizationType: string) => void;
}

// Visualization selector props
interface VisualizationSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
    description: string;
  }>;
  compact?: boolean;
  className?: string;
}

// Visualization selector component
const VisualizationSelector: React.FC<VisualizationSelectorProps> = ({
  value,
  onChange,
  options,
  compact = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedOption = options.find(option => option.value === value);

  const handleSelect = useCallback((optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  }, [onChange]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(!isOpen);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currentIndex = options.findIndex(option => option.value === value);
        const nextIndex = event.key === 'ArrowDown' 
          ? Math.min(currentIndex + 1, options.length - 1)
          : Math.max(currentIndex - 1, 0);
        handleSelect(options[nextIndex].value);
      }
    }
  }, [isOpen, options, value, handleSelect]);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`
          relative w-full bg-white border border-gray-300 rounded-lg shadow-sm 
          text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 
          focus:border-blue-500 hover:border-gray-400 transition-colors
          ${compact ? 'px-3 py-2 text-sm' : 'px-4 py-3'}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select visualization type"
        aria-describedby={compact ? undefined : "visualization-type-description"}
      >
        <span className="block truncate">
          {selectedOption?.label || 'Select visualization'}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDownIcon 
            className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            aria-hidden="true" 
          />
        </span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Dropdown */}
          <div className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-lg py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`
                  relative cursor-pointer select-none py-3 px-4 w-full text-left hover:bg-blue-50
                  ${option.value === value ? 'bg-blue-50 text-blue-900' : 'text-gray-900'}
                `}
                role="option"
                aria-selected={option.value === value}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{option.label}</div>
                    {!compact && (
                      <div className="text-sm text-gray-500 mt-1">
                        {option.description}
                      </div>
                    )}
                  </div>
                  {option.value === value && (
                    <CheckIcon className="h-4 w-4 text-blue-600 ml-2" aria-hidden="true" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Main settings component
export const PlanSettings: React.FC<PlanSettingsProps> = ({
  compact = false,
  showPreview = false,
  className = '',
  onSettingsChange,
}) => {
  const { 
    settings, 
    safeUpdateSettings, 
    visualizationOptions,
    getVisualizationDisplayName 
  } = usePlanSettings();

  const handleVisualizationChange = useCallback((visualizationType: string) => {
    safeUpdateSettings({ 
      visualizationType: visualizationType as 'standard' | 'vertical-timeline' 
    });
    onSettingsChange?.(visualizationType);
  }, [safeUpdateSettings, onSettingsChange]);

  if (compact) {
    return (
      <div className={`${className}`}>
        <VisualizationSelector
          value={settings.visualizationType}
          onChange={handleVisualizationChange}
          options={visualizationOptions}
          compact={true}
          className="w-full"
        />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Visualization Type
        </label>
        <div id="visualization-type-description" className="sr-only">
          Choose how your implementation plan will be displayed
        </div>
        <VisualizationSelector
          value={settings.visualizationType}
          onChange={handleVisualizationChange}
          options={visualizationOptions}
          className="w-full"
        />
      </div>

      {showPreview && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Preview</h4>
          <div className="text-sm text-gray-600">
            <strong>Selected:</strong> {getVisualizationDisplayName(settings.visualizationType)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {visualizationOptions.find(opt => opt.value === settings.visualizationType)?.description}
          </div>
        </div>
      )}

      {/* Settings info */}
      <div className="text-xs text-gray-500 space-y-1">
        <div>Settings are automatically saved</div>
        <div>Last updated: {new Date(settings.timestamp).toLocaleString()}</div>
      </div>
    </div>
  );
};

export default PlanSettings;