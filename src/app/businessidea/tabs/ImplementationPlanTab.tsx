'use client';

import React, { useState, useMemo, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  ClipboardDocumentCheckIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { usePlanSync } from './utils/plan-sync';
import { ImplementationPlanErrorBoundary } from './components/ImplementationPlanErrorBoundary';
import { usePlanSettings } from '@/hooks/usePlanSettings';
import { 
  getVisualizationComponent, 
  getDefaultVisualization,
  VisualizationErrorBoundary 
} from '@/components/visualizations/visualizationRegistry';
import { PlanSettings } from '@/components/settings/PlanSettings';

interface ImplementationPlanTabProps {
  className?: string;
}

export default function ImplementationPlanTab({ className = '' }: ImplementationPlanTabProps) {
  const { 
    currentPlanContent, 
    planGenerationStatus, 
    getActivePlanConversation,
    subscribeToPlanUpdates 
  } = usePlanSync();
  
  const { settings, getVisualizationDisplayName } = usePlanSettings();
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Map plan generation status to local state
  const isLoading = planGenerationStatus === 'generating';
  const planContent = currentPlanContent;

  // Get visualization component based on settings
  const visualizationComponent = useMemo(() => {
    const component = getVisualizationComponent(settings.visualizationType);
    return component || getDefaultVisualization();
  }, [settings.visualizationType]);

  // Memoize plan content processing to avoid re-processing on every render
  const processedPlanData = useMemo(() => {
    if (!planContent) return null;
    
    // For now, just return the content as-is
    // In the future, this could include parsing, validation, etc.
    return {
      content: planContent,
      length: planContent.length,
      lastProcessed: Date.now(),
    };
  }, [planContent]);

  // Debug logging
  useEffect(() => {
    console.log('ImplementationPlanTab: Status and content update', {
      planGenerationStatus,
      hasContent: !!currentPlanContent,
      contentLength: currentPlanContent?.length || 0,
      isLoading
    });
  }, [planGenerationStatus, currentPlanContent, isLoading]);

  // Update error state based on plan generation status
  useEffect(() => {
    if (planGenerationStatus === 'error') {
      setError('Failed to generate implementation plan');
    } else {
      setError(null);
    }
  }, [planGenerationStatus]);

  // Empty state when no plan exists
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="rounded-full bg-blue-50 p-2 mb-2">
        <ClipboardDocumentCheckIcon className="h-6 w-6 text-blue-500" />
      </div>
      <h3 className="text-sm font-medium text-gray-900 mb-1">No Plan</h3>
      <p className="text-xs text-gray-600 mb-2 max-w-md">
        Generate an implementation plan by clicking "Create Implementation Plan" on a business suggestion card.
      </p>
      <div className="text-xs text-gray-500">
        Plans appear here once generated.
      </div>
    </div>
  );

  // Loading state
  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="space-y-4 w-full max-w-md">
        <div className="animate-pulse">
          <div className="h-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            <div className="h-4 bg-slate-200 rounded w-4/6"></div>
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-sm font-medium text-slate-900 mb-1">Crafting Plan</h3>
          <p className="text-[10px] text-slate-600">
            Creating roadmap...
          </p>
        </div>
      </div>
    </div>
  );

  // Error state
  const renderErrorState = () => (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 max-w-md">
        <div className="flex items-center justify-center mb-4">
          <div className="p-2 bg-red-50 rounded-full">
            <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
          </div>
        </div>
        <h3 className="text-sm font-medium text-slate-900 mb-1 text-center">Failed</h3>
        <p className="text-xs text-slate-600 mb-3 text-center leading-relaxed">
          {error || 'There was an error generating your implementation plan. Please try again.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => {
              setError(null);
              // Retry by refreshing the plan sync
              window.location.reload();
            }}
            className="inline-flex items-center justify-center px-2 py-1 border border-transparent text-[10px] font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-red-500 transition-colors duration-200"
          >
            <ArrowPathIcon className="h-3 w-3 mr-1" />
            Retry
          </button>
          <button
            onClick={() => setError(null)}
            className="inline-flex items-center justify-center px-2 py-1 border border-slate-300 text-[10px] font-medium rounded text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-slate-500 transition-colors duration-200"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );

  // Action buttons for when plan exists
  const renderActionButtons = () => (
    <div className="flex items-center gap-3">
      <button
        onClick={() => {
          if (planContent) {
            navigator.clipboard.writeText(planContent);
          }
        }}
        className="inline-flex items-center px-2 py-1 border border-slate-200 text-[10px] font-medium rounded text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500 transition-all duration-200"
      >
        <ClipboardDocumentCheckIcon className="h-3 w-3 mr-1" />
        Copy
      </button>
      <button
        onClick={() => {
          if (planContent) {
            const blob = new Blob([planContent], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'plan.md';
            a.click();
            URL.revokeObjectURL(url);
          }
        }}
        className="inline-flex items-center px-2 py-1 border border-slate-200 text-[10px] font-medium rounded text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500 transition-all duration-200"
      >
        <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
        Save
      </button>
      <button
        onClick={() => {
          console.log('Regenerate plan - feature to be implemented');
        }}
        className="inline-flex items-center px-2 py-1 border border-slate-200 text-[10px] font-medium rounded text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500 transition-all duration-200"
      >
        <ArrowPathIcon className="h-3 w-3 mr-1" />
        Regen
      </button>
      <button
        onClick={() => setShowSettings(!showSettings)}
        className={`inline-flex items-center px-2 py-1 border text-[10px] font-medium rounded focus:outline-none focus:ring-1 focus:ring-offset-1 transition-all duration-200 ${
          showSettings 
            ? 'border-blue-300 bg-blue-50 text-blue-700 focus:ring-blue-500' 
            : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 focus:ring-blue-500'
        }`}
      >
        <CogIcon className="h-3 w-3 mr-1" />
        Settings
      </button>
    </div>
  );

  // Main content area
  const renderContent = () => {
    if (isLoading) {
      return renderLoadingState();
    }

    if (error) {
      return renderErrorState();
    }

    if (!planContent) {
      return renderEmptyState();
    }

    return (
      <div className="h-full flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-slate-900">Plan</h2>
            <p className="text-[9px] text-slate-500">
              {getVisualizationDisplayName(settings.visualizationType)} • {processedPlanData?.length || 0}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {renderActionButtons()}
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-2 p-2 bg-gray-50 border border-gray-200 rounded">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[9px] font-medium text-gray-900">Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600 text-[9px]"
                aria-label="Close settings"
              >
                ✕
              </button>
            </div>
            <PlanSettings 
              showPreview={true}
              onSettingsChange={() => {}}
            />
          </div>
        )}
        
        <div className="flex-1 overflow-hidden">
          <VisualizationErrorBoundary
            fallback={getDefaultVisualization().component}
            onError={(error) => {
              console.error('Visualization error:', error);
              setError(`Visualization error: ${error.message}`);
            }}
          >
            {React.createElement(visualizationComponent.component, {
              planContent: processedPlanData?.content,
              isLoading,
              onError: (error: Error) => {
                console.error('Visualization component error:', error);
                setError(`Visualization error: ${error.message}`);
              },
              className: "h-full"
            })}
          </VisualizationErrorBoundary>
        </div>
      </div>
    );
  };

  return (
    <ImplementationPlanErrorBoundary>
      <div className={`h-full ${className}`}>
        {renderContent()}
      </div>
    </ImplementationPlanErrorBoundary>
  );
}