'use client';

import React from 'react';
import { ChatboxStatus } from './types';

interface ProgressStage {
  id: string;
  label: string;
  description: string;
  icon: string;
  duration?: number; // Expected duration in seconds
}

interface ChatboxProgressProps {
  status: ChatboxStatus;
  progress?: number; // 0-100
  currentStage?: string;
  message?: string;
  error?: string;
  className?: string;
  showDetails?: boolean;
  estimatedTime?: number; // Estimated time remaining in seconds
}

const ANALYSIS_STAGES: ProgressStage[] = [
  {
    id: 'configuring',
    label: 'Configuring',
    description: 'Validating settings and preparing analysis',
    icon: '⚙️',
    duration: 2
  },
  {
    id: 'connecting',
    label: 'Connecting',
    description: 'Establishing connection to AI service',
    icon: '🔗',
    duration: 3
  },
  {
    id: 'processing',
    label: 'Processing',
    description: 'Analyzing your profile data',
    icon: '🧠',
    duration: 15
  },
  {
    id: 'generating',
    label: 'Generating',
    description: 'Creating personalized insights',
    icon: '✨',
    duration: 10
  },
  {
    id: 'finalizing',
    label: 'Finalizing',
    description: 'Preparing your analysis results',
    icon: '📋',
    duration: 2
  }
];

export const ChatboxProgress: React.FC<ChatboxProgressProps> = ({
  status,
  progress = 0,
  currentStage,
  message,
  error,
  className = '',
  showDetails = true,
  estimatedTime
}) => {
  const getCurrentStageInfo = (): ProgressStage | null => {
    if (currentStage) {
      return ANALYSIS_STAGES.find(stage => stage.id === currentStage) || null;
    }
    
    // Auto-determine stage based on progress
    if (progress < 10) return ANALYSIS_STAGES[0]; // configuring
    if (progress < 20) return ANALYSIS_STAGES[1]; // connecting
    if (progress < 70) return ANALYSIS_STAGES[2]; // processing
    if (progress < 90) return ANALYSIS_STAGES[3]; // generating
    if (progress < 100) return ANALYSIS_STAGES[4]; // finalizing
    
    return null;
  };

  const getStatusColor = () => {
    switch (status) {
      case 'analyzing':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getProgressBarColor = () => {
    switch (status) {
      case 'analyzing':
        return 'from-blue-500 to-indigo-600';
      case 'completed':
        return 'from-green-500 to-emerald-600';
      case 'error':
        return 'from-red-500 to-red-600';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const currentStageInfo = getCurrentStageInfo();

  // Don't render if status is idle
  if (status === 'idle') {
    return null;
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      {/* Status Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="text-lg">
            {status === 'analyzing' && currentStageInfo ? (
              <span className="animate-pulse">{currentStageInfo.icon}</span>
            ) : status === 'completed' ? (
              '✅'
            ) : status === 'error' ? (
              '❌'
            ) : (
              '⏳'
            )}
          </div>
          <div>
            <div className={`text-sm font-medium ${getStatusColor()}`}>
              {status === 'analyzing' ? (
                currentStageInfo ? currentStageInfo.label : 'Analyzing'
              ) : status === 'completed' ? (
                'Analysis Complete'
              ) : status === 'error' ? (
                'Analysis Failed'
              ) : (
                'Configuring'
              )}
            </div>
            {showDetails && (
              <div className="text-xs text-gray-500">
                {message || 
                 (currentStageInfo ? currentStageInfo.description : 
                  status === 'completed' ? 'Your analysis is ready' :
                  status === 'error' ? 'Something went wrong' :
                  'Preparing analysis')}
              </div>
            )}
          </div>
        </div>
        
        {/* Time Estimate */}
        {estimatedTime && estimatedTime > 0 && status === 'analyzing' && (
          <div className="text-xs text-gray-500">
            ~{formatTime(estimatedTime)} remaining
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {(status === 'analyzing' || status === 'configuring') && (
        <div className="mb-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full bg-gradient-to-r ${getProgressBarColor()} transition-all duration-500 ease-out`}
              style={{ width: `${Math.max(progress, 5)}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            <div className="text-xs text-gray-500">
              {Math.round(progress)}% complete
            </div>
            {status === 'analyzing' && (
              <div className="text-xs text-gray-400">
                Processing...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stage Timeline (for detailed view) */}
      {showDetails && status === 'analyzing' && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-700 mb-2">Analysis Stages</div>
          <div className="space-y-1">
            {ANALYSIS_STAGES.map((stage, index) => {
              const isActive = currentStageInfo?.id === stage.id;
              const isCompleted = currentStageInfo ? 
                ANALYSIS_STAGES.indexOf(currentStageInfo) > index : false;
              
              return (
                <div key={stage.id} className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                    isCompleted ? 'bg-green-100 text-green-600' :
                    isActive ? 'bg-blue-100 text-blue-600 animate-pulse' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {isCompleted ? '✓' : isActive ? stage.icon : '○'}
                  </div>
                  <div className={`text-xs ${
                    isActive ? 'text-gray-900 font-medium' : 
                    isCompleted ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {stage.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error Display */}
      {status === 'error' && error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <div className="text-red-500 mt-0.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-red-800">Analysis Error</div>
              <div className="text-xs text-red-700 mt-1">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {status === 'completed' && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="text-green-500">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-sm font-medium text-green-800">
              Analysis completed successfully!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatboxProgress;