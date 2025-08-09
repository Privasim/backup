"use client";

import React from 'react';
import type { ProcessedSection, StreamingProgress } from '../streaming/types';
import { StreamingSection } from './StreamingSection';
import { ProgressHeader } from './ProgressHeader';

interface ProgressiveRendererProps {
  sections: ProcessedSection[];
  progress: StreamingProgress;
  isComplete: boolean;
  error?: string | null;
}

export const ProgressiveRenderer: React.FC<ProgressiveRendererProps> = ({
  sections,
  progress,
  isComplete,
  error
}) => {
  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 border border-red-200">
        <div className="text-red-700 text-sm font-medium mb-2">Processing Error</div>
        <div className="text-red-600 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ProgressHeader 
        currentPhase={progress.currentPhase}
        progress={progress.progress}
        estimatedTimeRemaining={progress.estimatedTimeRemaining}
        isComplete={isComplete}
      />
      
      <div className="space-y-3">
        {sections.map((section) => (
          <StreamingSection
            key={section.id}
            section={section}
            isCurrentPhase={section.type === progress.currentPhase}
          />
        ))}
        
        {!isComplete && sections.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-3 text-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-indigo-500"></div>
              <span className="text-sm">Initializing plan generation...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressiveRenderer;