"use client";

import React from 'react';
import type { GenerationPhase } from '../streaming/types';

interface ProgressHeaderProps {
  currentPhase: GenerationPhase;
  progress: number;
  estimatedTimeRemaining?: number;
  isComplete: boolean;
}

export const ProgressHeader: React.FC<ProgressHeaderProps> = ({
  currentPhase,
  progress,
  estimatedTimeRemaining,
  isComplete
}) => {
  const getPhaseIcon = (phase: GenerationPhase) => {
    const icons: Record<GenerationPhase, string> = {
      'initializing': '🚀',
      'overview': '🎯',
      'phases': '📋',
      'tasks': '✅',
      'timeline': '📅',
      'resources': '👥',
      'budget': '💰',
      'risks': '⚠️',
      'kpis': '📊',
      'next90days': '🗓️',
      'finalizing': '🔄',
      'complete': '✨'
    };
    return icons[phase] || '📝';
  };

  const getPhaseDisplayName = (phase: GenerationPhase): string => {
    const displayNames: Record<GenerationPhase, string> = {
      'initializing': 'Initializing',
      'overview': 'Business Overview',
      'phases': 'Implementation Phases',
      'tasks': 'Task Planning',
      'timeline': 'Timeline & Milestones',
      'resources': 'Resource Planning',
      'budget': 'Budget Analysis',
      'risks': 'Risk Assessment',
      'kpis': 'Success Metrics',
      'next90days': '90-Day Action Plan',
      'finalizing': 'Finalizing Plan',
      'complete': 'Complete'
    };
    return displayNames[phase] || phase;
  };

  const formatTimeRemaining = (ms: number): string => {
    const seconds = Math.ceil(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.ceil(seconds / 60);
    return `${minutes}m`;
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-lg">{getPhaseIcon(currentPhase)}</span>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {isComplete ? 'Plan Complete!' : `Generating ${getPhaseDisplayName(currentPhase)}`}
            </div>
            {!isComplete && (
              <div className="text-xs text-gray-600">
                {estimatedTimeRemaining 
                  ? `~${formatTimeRemaining(estimatedTimeRemaining)} remaining`
                  : 'Processing...'
                }
              </div>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-semibold text-indigo-600">
            {progress}%
          </div>
          <div className="text-xs text-gray-500">
            {isComplete ? 'Done' : 'Progress'}
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ease-out ${
            isComplete 
              ? 'bg-green-500' 
              : 'bg-gradient-to-r from-indigo-500 to-blue-500'
          }`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      
      {!isComplete && progress > 0 && (
        <div className="mt-2 flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-600">Streaming content...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressHeader;