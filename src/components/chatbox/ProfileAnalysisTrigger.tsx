'use client';

import React, { useState } from 'react';
import { 
  ChatBubbleLeftRightIcon, 
  SparklesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import { useProfileIntegration } from './hooks/useProfileIntegration';

interface ProfileAnalysisTriggerProps {
  profileData: any;
  onAnalysisStart?: () => void;
  onAnalysisComplete?: () => void;
  className?: string;
  variant?: 'button' | 'card' | 'inline';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Component that triggers profile analysis and provides feedback
 */
export const ProfileAnalysisTrigger: React.FC<ProfileAnalysisTriggerProps> = ({
  profileData,
  onAnalysisStart,
  onAnalysisComplete,
  className = '',
  variant = 'button',
  size = 'md'
}) => {
  const {
    triggerProfileAnalysis,
    isAnalysisAvailable,
    getAnalysisReadiness,
    analysisStatus
  } = useProfileIntegration();

  const [isTriggering, setIsTriggering] = useState(false);

  const readiness = getAnalysisReadiness(profileData);
  const canAnalyze = isAnalysisAvailable(profileData);

  const handleTriggerAnalysis = async () => {
    if (!canAnalyze || isTriggering || analysisStatus === 'analyzing') {
      return;
    }

    setIsTriggering(true);
    onAnalysisStart?.();

    try {
      const success = await triggerProfileAnalysis(profileData, {
        autoOpen: true,
        clearPrevious: true,
        useStreaming: true
      });

      if (success) {
        onAnalysisComplete?.();
      }
    } catch (error) {
      console.error('Analysis trigger failed:', error);
    } finally {
      setIsTriggering(false);
    }
  };

  // Size classes
  const sizeClasses = {
    sm: {
      button: 'px-3 py-1.5 text-sm',
      icon: 'w-4 h-4',
      text: 'text-sm'
    },
    md: {
      button: 'px-4 py-2 text-base',
      icon: 'w-5 h-5',
      text: 'text-base'
    },
    lg: {
      button: 'px-6 py-3 text-lg',
      icon: 'w-6 h-6',
      text: 'text-lg'
    }
  };

  const currentSize = sizeClasses[size];

  // Button variant
  if (variant === 'button') {
    const isActive = analysisStatus === 'analyzing' || isTriggering;
    
    return (
      <button
        onClick={handleTriggerAnalysis}
        disabled={!canAnalyze || isActive}
        className={`
          inline-flex items-center justify-center space-x-2 font-medium rounded-lg
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
          ${currentSize.button}
          ${canAnalyze && !isActive
            ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }
          ${isActive ? 'animate-pulse' : ''}
          ${className}
        `}
      >
        {isActive ? (
          <>
            <SparklesIcon className={`${currentSize.icon} animate-spin`} />
            <span>Analyzing...</span>
          </>
        ) : canAnalyze ? (
          <>
            <ChatBubbleLeftRightIcon className={currentSize.icon} />
            <span>Analyze Profile</span>
          </>
        ) : (
          <>
            <ExclamationTriangleIcon className={currentSize.icon} />
            <span>Complete Profile First</span>
          </>
        )}
      </button>
    );
  }

  // Card variant
  if (variant === 'card') {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
        <div className="flex items-start space-x-3">
          <div className={`flex-shrink-0 ${canAnalyze ? 'text-blue-600' : 'text-gray-400'}`}>
            {canAnalyze ? (
              <ChatBubbleLeftRightIcon className={currentSize.icon} />
            ) : (
              <ExclamationTriangleIcon className={currentSize.icon} />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium text-gray-900 ${currentSize.text}`}>
              {canAnalyze ? 'Profile Analysis Ready' : 'Complete Your Profile'}
            </h3>
            
            <p className="mt-1 text-sm text-gray-500">
              {canAnalyze 
                ? 'Get AI-powered insights about your career profile and opportunities.'
                : `Complete ${readiness.missing.join(', ')} to enable analysis.`
              }
            </p>

            {/* Progress indicator */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Profile Completion</span>
                <span>{readiness.completionLevel}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    readiness.completionLevel >= 50 ? 'bg-blue-600' : 'bg-gray-400'
                  }`}
                  style={{ width: `${readiness.completionLevel}%` }}
                />
              </div>
            </div>

            {/* Action button */}
            <div className="mt-4">
              <button
                onClick={handleTriggerAnalysis}
                disabled={!canAnalyze || isTriggering || analysisStatus === 'analyzing'}
                className={`
                  inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md
                  transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${canAnalyze && !isTriggering && analysisStatus !== 'analyzing'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                {isTriggering || analysisStatus === 'analyzing' ? (
                  <>
                    <SparklesIcon className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    <span>Start Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Inline variant
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`flex items-center space-x-2 ${currentSize.text}`}>
        {canAnalyze ? (
          <CheckCircleIcon className={`${currentSize.icon} text-green-500`} />
        ) : (
          <ExclamationTriangleIcon className={`${currentSize.icon} text-yellow-500`} />
        )}
        <span className={canAnalyze ? 'text-green-700' : 'text-yellow-700'}>
          {canAnalyze ? 'Ready for analysis' : `${readiness.completionLevel}% complete`}
        </span>
      </div>
      
      {canAnalyze && (
        <button
          onClick={handleTriggerAnalysis}
          disabled={isTriggering || analysisStatus === 'analyzing'}
          className={`
            inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700
            font-medium transition-colors ${currentSize.text}
            ${isTriggering || analysisStatus === 'analyzing' ? 'animate-pulse' : ''}
          `}
        >
          <ChatBubbleLeftRightIcon className={currentSize.icon} />
          <span>Analyze</span>
        </button>
      )}
    </div>
  );
};

export default ProfileAnalysisTrigger;