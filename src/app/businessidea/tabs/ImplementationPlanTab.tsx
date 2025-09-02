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
      <div className="rounded-full bg-blue-50 p-4 mb-3">
        <ClipboardDocumentCheckIcon className="h-10 w-10 text-blue-500" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1.5">No Implementation Plan</h3>
      <p className="text-sm text-gray-600 mb-3.5 max-w-md">
        Generate an implementation plan by clicking "Create Implementation Plan" on a business suggestion card.
      </p>
      <div className="text-sm text-gray-500">
        Plans will automatically appear here once generated.
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
          <h3 className="text-base font-semibold text-slate-900 mb-2">Crafting Your Implementation Plan</h3>
          <p className="text-xs text-slate-600">
            Analyzing your business idea and creating a comprehensive roadmap...
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
          <div className="p-2.5 bg-red-50 rounded-full">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2 text-center">Generation Failed</h3>
        <p className="text-sm text-slate-600 mb-5 text-center leading-relaxed">
          {error || 'There was an error generating your implementation plan. Please try again.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => {
              setError(null);
              // Retry by refreshing the plan sync
              window.location.reload();
            }}
            className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
          >
            <ArrowPathIcon className="h-4 w-4 mr-1.5" />
            Try Again
          </button>
          <button
            onClick={() => setError(null)}
            className="inline-flex items-center justify-center px-3 py-2 border border-slate-300 text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors duration-200"
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
        className="inline-flex items-center px-3 py-2 border border-slate-200 text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow"
      >
        <ClipboardDocumentCheckIcon className="h-4 w-4 mr-1.5" />
        Copy
      </button>
      <button
        onClick={() => {
          if (planContent) {
            const blob = new Blob([planContent], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'implementation-plan.md';
            a.click();
            URL.revokeObjectURL(url);
          }
        }}
        className="inline-flex items-center px-3 py-2 border border-slate-200 text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow"
      >
        <ArrowDownTrayIcon className="h-4 w-4 mr-1.5" />
        Download
      </button>
      <button
        onClick={() => {
          // TODO: Implement regenerate logic - would need access to original suggestion
          console.log('Regenerate plan - feature to be implemented');
        }}
        className="inline-flex items-center px-3 py-2 border border-slate-200 text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow"
      >
        <ArrowPathIcon className="h-4 w-4 mr-1.5" />
        Regenerate
      </button>
      <button
        onClick={() => setShowSettings(!showSettings)}
        className={`inline-flex items-center px-3 py-2 border text-xs font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow ${
          showSettings 
            ? 'border-blue-300 bg-blue-50 text-blue-700 focus:ring-blue-500' 
            : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 focus:ring-blue-500'
        }`}
      >
        <CogIcon className="h-4 w-4 mr-1.5" />
        View Settings
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Implementation Plan</h2>
            <p className="text-xs text-slate-600 mt-1">
              {getVisualizationDisplayName(settings.visualizationType)} • {processedPlanData?.length || 0} characters
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {renderActionButtons()}
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-medium text-gray-900">Visualization Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600 text-xs"
                aria-label="Close settings"
              >
                ✕
              </button>
            </div>
            <PlanSettings 
              showPreview={true}
              onSettingsChange={() => {
                // Settings are automatically saved via context
                // The visualization will re-render automatically
              }}
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