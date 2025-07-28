'use client';

import { AssessmentProgress } from '@/lib/assessment/types';

interface AnalysisProgressProps {
  progress: AssessmentProgress;
  isVisible: boolean;
}

export default function AnalysisProgress({ progress, isVisible }: AnalysisProgressProps) {
  if (!isVisible) return null;

  const getStageIcon = (stage: AssessmentProgress['stage']) => {
    switch (stage) {
      case 'initializing':
        return '🔧';
      case 'searching':
        return '🔍';
      case 'analyzing':
        return '🤖';
      case 'processing':
        return '⚡';
      case 'complete':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '⏳';
    }
  };

  const getStageColor = (stage: AssessmentProgress['stage']) => {
    switch (stage) {
      case 'complete':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">
            {getStageIcon(progress.stage)}
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            AI Analysis in Progress
          </h3>
          
          <p className={`text-sm mb-6 ${getStageColor(progress.stage)}`}>
            {progress.message}
          </p>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress.progress}%` }}
            ></div>
          </div>
          
          <div className="text-xs text-gray-500">
            {progress.progress}% complete
          </div>
          
          {progress.stage === 'error' && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">
                Analysis failed. Please check your API key and try again.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}