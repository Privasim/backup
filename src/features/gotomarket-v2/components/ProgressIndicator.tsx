'use client';

import React from 'react';
import { GoToMarketStatus, StreamingState } from '../types';

interface ProgressIndicatorProps {
  status: GoToMarketStatus;
  progress: number;
  streamingState: StreamingState;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  status,
  progress,
  streamingState,
  className = ''
}) => {
  if (status === 'idle' || status === 'success') {
    return null;
  }

  const getStatusMessage = () => {
    switch (status) {
      case 'generating':
        return 'Initializing strategy generation...';
      case 'streaming':
        return streamingState.currentSection || 'Generating strategies...';
      case 'error':
        return streamingState.error || 'Generation failed';
      default:
        return 'Processing...';
    }
  };

  const getProgressColor = () => {
    switch (status) {
      case 'error':
        return 'bg-red-500';
      case 'generating':
      case 'streaming':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Status Message */}
      <div className="flex items-center space-x-3">
        {status === 'generating' || status === 'streaming' ? (
          <div className="flex-shrink-0">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : status === 'error' ? (
          <div className="flex-shrink-0">
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        ) : null}
        
        <span className="text-sm text-gray-700 font-medium">
          {getStatusMessage()}
        </span>
      </div>

      {/* Progress Bar */}
      {(status === 'generating' || status === 'streaming') && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${Math.max(5, progress)}%` }}
            />
          </div>
        </div>
      )}

      {/* Streaming Content Preview */}
      {status === 'streaming' && streamingState.rawContent && (
        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg max-h-32 overflow-y-auto">
          <div className="text-xs text-gray-600 mb-1">Live Preview:</div>
          <div className="text-xs text-gray-800 font-mono whitespace-pre-wrap">
            {streamingState.rawContent.slice(-200)}
            {streamingState.isProcessing && (
              <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-1" />
            )}
          </div>
        </div>
      )}

      {/* Error Details */}
      {status === 'error' && streamingState.error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-xs text-red-600 mb-1">Error Details:</div>
          <div className="text-xs text-red-800">
            {streamingState.error}
          </div>
        </div>
      )}
    </div>
  );
};