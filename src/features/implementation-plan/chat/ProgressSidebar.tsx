'use client';

import React from 'react';
import { 
  CheckIcon, 
  ClockIcon, 
  PlayIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { ChatState } from './types';

interface ProgressStep {
  id: string;
  label: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
}

interface ProgressSidebarProps {
  currentPhase: ChatState['currentPhase'];
  progress?: number;
  className?: string;
}

export const ProgressSidebar: React.FC<ProgressSidebarProps> = ({
  currentPhase,
  progress = 0,
  className = ''
}) => {
  const getSteps = (): ProgressStep[] => {
    const steps: ProgressStep[] = [
      {
        id: 'start',
        label: 'Start',
        description: 'Initialize plan generation',
        status: 'completed'
      },
      {
        id: 'outline',
        label: 'Generate Outline',
        description: 'Create high-level plan structure',
        status: currentPhase === 'generating-outline' ? 'active' :
                currentPhase === 'awaiting-approval' || 
                currentPhase === 'generating-plan' || 
                currentPhase === 'completed' ? 'completed' :
                currentPhase === 'error' ? 'error' : 'pending'
      },
      {
        id: 'approval',
        label: 'Review & Approve',
        description: 'Approve outline for detailed plan',
        status: currentPhase === 'awaiting-approval' ? 'active' :
                currentPhase === 'generating-plan' || 
                currentPhase === 'completed' ? 'completed' :
                currentPhase === 'error' ? 'error' : 'pending'
      },
      {
        id: 'detailed',
        label: 'Generate Plan',
        description: 'Create detailed implementation plan',
        status: currentPhase === 'generating-plan' ? 'active' :
                currentPhase === 'completed' ? 'completed' :
                currentPhase === 'error' ? 'error' : 'pending'
      },
      {
        id: 'complete',
        label: 'Complete',
        description: 'Plan ready for export',
        status: currentPhase === 'completed' ? 'completed' : 'pending'
      }
    ];

    return steps;
  };

  const getStepIcon = (step: ProgressStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckIcon className="w-4 h-4 md:w-5 md:h-5" />;
      case 'active':
        return step.id === 'outline' || step.id === 'detailed' ? 
          <ArrowPathIcon className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> :
          <PlayIcon className="w-4 h-4 md:w-5 md:h-5" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-4 h-4 md:w-5 md:h-5" />;
      default:
        return <ClockIcon className="w-4 h-4 md:w-5 md:h-5" />;
    }
  };

  const getStepStyles = (step: ProgressStep, index: number, isLast: boolean) => {
    const baseStyles = "relative flex items-start";
    
    return {
      container: baseStyles,
      iconContainer: `flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full border-2 ${
        step.status === 'completed' ? 'bg-green-100 border-green-500 text-green-600' :
        step.status === 'active' ? 'bg-blue-100 border-blue-500 text-blue-600' :
        step.status === 'error' ? 'bg-red-100 border-red-500 text-red-600' :
        'bg-gray-100 border-gray-300 text-gray-400'
      }`,
      connector: !isLast ? `absolute left-4 md:left-5 top-8 md:top-10 w-0.5 h-12 md:h-16 ${
        step.status === 'completed' ? 'bg-green-500' :
        step.status === 'active' ? 'bg-blue-500' :
        'bg-gray-300'
      }` : '',
      content: "ml-3 md:ml-4 flex-1",
      label: `text-xs md:text-sm font-medium ${
        step.status === 'completed' ? 'text-green-800' :
        step.status === 'active' ? 'text-blue-800' :
        step.status === 'error' ? 'text-red-800' :
        'text-gray-500'
      }`,
      description: `text-xs mt-1 ${
        step.status === 'completed' ? 'text-green-600' :
        step.status === 'active' ? 'text-blue-600' :
        step.status === 'error' ? 'text-red-600' :
        'text-gray-400'
      }`
    };
  };

  const getOverallProgress = () => {
    const steps = getSteps();
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    const totalSteps = steps.length;
    return Math.round((completedSteps / totalSteps) * 100);
  };

  const steps = getSteps();
  const overallProgress = getOverallProgress();

  return (
    <div className={`bg-white border-r border-gray-200 p-4 md:p-6 ${className}`}>
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
          Implementation Plan
        </h3>
        <div className="flex items-center justify-between text-xs md:text-sm text-gray-600 mb-3">
          <span>Progress</span>
          <span className="font-medium">{overallProgress}%</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-0">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const styles = getStepStyles(step, index, isLast);
          
          return (
            <div key={step.id} className={styles.container}>
              {/* Connector Line */}
              {!isLast && <div className={styles.connector} />}
              
              {/* Icon */}
              <div className={styles.iconContainer}>
                {getStepIcon(step)}
              </div>
              
              {/* Content */}
              <div className={styles.content}>
                <div className={styles.label}>
                  {step.label}
                </div>
                <div className={styles.description}>
                  {step.description}
                </div>
                
                {/* Active step progress */}
                {step.status === 'active' && progress > 0 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Message */}
      <div className="mt-6 p-3 bg-gray-50 rounded-lg">
        <div className="text-xs text-gray-600">
          {currentPhase === 'idle' && 'Ready to start generation'}
          {currentPhase === 'generating-outline' && 'Generating plan outline...'}
          {currentPhase === 'awaiting-approval' && 'Waiting for your approval'}
          {currentPhase === 'generating-plan' && 'Creating detailed plan...'}
          {currentPhase === 'completed' && 'Plan generation complete!'}
          {currentPhase === 'error' && 'An error occurred'}
        </div>
      </div>
    </div>
  );
};

export default ProgressSidebar;