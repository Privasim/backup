'use client';

import React, { useState, useMemo, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  ClipboardDocumentCheckIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { usePlanSync } from './utils/plan-sync';
import { ImplementationPlanErrorBoundary } from './components/ImplementationPlanErrorBoundary';

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
  
  const [error, setError] = useState<string | null>(null);

  // Map plan generation status to local state
  const isLoading = planGenerationStatus === 'generating';
  const planContent = currentPlanContent;

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
      <div className="rounded-full bg-blue-50 p-4 mb-4">
        <ClipboardDocumentCheckIcon className="h-12 w-12 text-blue-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Implementation Plan</h3>
      <p className="text-gray-600 mb-4 max-w-md">
        Generate an implementation plan by clicking "Create Implementation Plan" on a business suggestion card.
      </p>
      <div className="text-sm text-gray-500">
        Plans will automatically appear here once generated.
      </div>
    </div>
  );

  // Loading state
  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Plan</h3>
      <p className="text-gray-600">
        Your implementation plan is being generated...
      </p>
    </div>
  );

  // Error state
  const renderErrorState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="rounded-full bg-red-50 p-4 mb-4">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Generation Failed</h3>
      <p className="text-gray-600 mb-4 max-w-md">
        {error || 'There was an error generating your implementation plan.'}
      </p>
      <button
        onClick={() => {
          setError(null);
          // Retry by refreshing the plan sync
          window.location.reload();
        }}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        <ArrowPathIcon className="h-4 w-4 mr-2" />
        Try Again
      </button>
    </div>
  );

  // Action buttons for when plan exists
  const renderActionButtons = () => (
    <div className="flex items-center gap-2 mb-4">
      <button
        onClick={() => {
          if (planContent) {
            navigator.clipboard.writeText(planContent);
          }
        }}
        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <ClipboardDocumentCheckIcon className="h-4 w-4 mr-2" />
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
        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
        Download
      </button>
      <button
        onClick={() => {
          // TODO: Implement regenerate logic - would need access to original suggestion
          console.log('Regenerate plan - feature to be implemented');
        }}
        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <ArrowPathIcon className="h-4 w-4 mr-2" />
        Regenerate
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Implementation Plan</h2>
          <div className="flex items-center gap-2">
            {renderActionButtons()}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="prose max-w-none bg-white border border-gray-200 rounded-lg p-6">
            <ReactMarkdown>{planContent}</ReactMarkdown>
          </div>
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