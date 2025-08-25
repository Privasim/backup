'use client';

import React from 'react';
import { PlayIcon, StopIcon } from '@heroicons/react/24/outline';

interface PromptPanelProps {
  status: 'idle' | 'generating' | 'streaming' | 'compiled' | 'error';
  prompt: string;
  onChange: (prompt: string) => void;
  onGenerate: () => void;
  onCancel: () => void;
  validation: { 
    apiValid: boolean; 
    modelValid: boolean; 
    message?: string; 
  };
}

export function PromptPanel({
  status,
  prompt,
  onChange,
  onGenerate,
  onCancel,
  validation
}: PromptPanelProps) {
  const isGenerating = status === 'generating' || status === 'streaming';
  const canGenerate = validation.apiValid && validation.modelValid && prompt.trim().length > 0 && !isGenerating;

  return (
    <div className="p-4 bg-white border-t border-gray-200">
      {/* Validation Banner */}
      {validation.message && (
        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          {validation.message}
        </div>
      )}

      <div className="space-y-3">
        {/* Prompt Input */}
        <div>
          <label htmlFor="artifact-prompt" className="block text-xs font-medium text-gray-700 mb-1">
            Describe the component you want to create
          </label>
          <textarea
            id="artifact-prompt"
            value={prompt}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Create a beautiful landing page hero section with a gradient background..."
            className="w-full h-20 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            disabled={isGenerating}
          />
        </div>

        {/* Action Bar - Horizontal layout with status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {!isGenerating ? (
              <button
                onClick={onGenerate}
                disabled={!canGenerate}
                className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  canGenerate
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <PlayIcon className="w-4 h-4 mr-1.5" />
                Generate
              </button>
            ) : (
              <button
                onClick={onCancel}
                className="flex items-center px-3 py-1.5 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <StopIcon className="w-4 h-4 mr-1.5" />
                Cancel
              </button>
            )}
          </div>

          {/* Status Indicator */}
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <div className={`w-2 h-2 rounded-full ${
              status === 'idle' ? 'bg-gray-400' :
              status === 'generating' || status === 'streaming' ? 'bg-blue-500 animate-pulse' :
              status === 'compiled' ? 'bg-green-500' :
              'bg-red-500'
            }`} />
            <span>
              {status === 'idle' ? 'Ready' :
               status === 'generating' ? 'Generating...' :
               status === 'streaming' ? 'Streaming...' :
               status === 'compiled' ? 'Compiled' :
               'Error'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
