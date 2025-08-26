import React, { useState } from 'react';

interface SpecsSettingsPanelProps {
  settings: {
    length: 5 | 10 | 15;
    systemPrompt: string;
  };
  onChangeLength: (length: 5 | 10 | 15) => void;
  onChangeSystemPrompt: (prompt: string) => void;
  disabled?: boolean;
  showHeader?: boolean;
}

export function SpecsSettingsPanel({
  settings,
  onChangeLength,
  onChangeSystemPrompt,
  disabled = false,
  showHeader = true
}: SpecsSettingsPanelProps) {
  const [prompt, setPrompt] = useState(settings.systemPrompt);
  
  // Handle prompt change with debounce
  React.useEffect(() => {
    const handler = setTimeout(() => {
      onChangeSystemPrompt(prompt);
    }, 300);
    
    // Cleanup function to clear the timeout if prompt changes again
    return () => {
      clearTimeout(handler);
    };
  }, [prompt, onChangeSystemPrompt]);
  
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };
  
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
      {showHeader && (
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Specification Settings</h3>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Specification Length
          </label>
          <div className="inline-flex rounded-md shadow-sm" role="group" aria-label="Specification length options">
            {[5, 10, 15].map((length) => (
              <button
                key={length}
                type="button"
                onClick={() => onChangeLength(length as 5 | 10 | 15)}
                disabled={disabled}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  settings.length === length
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600'
                } ${
                  length === 5 
                    ? 'rounded-l-lg border border-r-0' 
                    : length === 15 
                      ? 'rounded-r-lg border border-l-0' 
                      : 'border border-r-0'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-pressed={settings.length === length}
              >
                {length} lines
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              System Prompt
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {prompt.length}/1000
            </span>
          </div>
          <textarea
            value={prompt}
            onChange={handlePromptChange}
            disabled={disabled}
            rows={4}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-y"
            placeholder="Enter custom instructions for the specification generator..."
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Customize how the specification is generated. This will be used as part of the system prompt.
          </p>
        </div>
      </div>
    </div>
  );
}
