import React, { useState } from 'react';

interface SpecsSettingsPanelProps {
  settings: {
    length: 5 | 10 | 15;
    systemPrompt: string;
  };
  onChangeLength: (length: 5 | 10 | 15) => void;
  onChangeSystemPrompt: (prompt: string) => void;
  disabled?: boolean;
}

export function SpecsSettingsPanel({
  settings,
  onChangeLength,
  onChangeSystemPrompt,
  disabled = false
}: SpecsSettingsPanelProps) {
  const [prompt, setPrompt] = useState(settings.systemPrompt);
  
  // Handle prompt change with debounce
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setPrompt(value);
    // Debounce the actual update to avoid too many rerenders
    setTimeout(() => {
      onChangeSystemPrompt(value);
    }, 300);
  };
  
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Specification Settings</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Specification Length
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[5, 10, 15].map((length) => (
              <button
                key={length}
                type="button"
                className={`py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  settings.length === length
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                onClick={() => onChangeLength(length as 5 | 10 | 15)}
                disabled={disabled}
              >
                {length} lines
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            System Prompt
          </label>
          <textarea
            id="systemPrompt"
            rows={4}
            className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter instructions for how the specification should be structured..."
            value={prompt}
            onChange={handlePromptChange}
            disabled={disabled}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Guide the AI on how to structure the technical specification.
          </p>
        </div>
      </div>
    </div>
  );
}
