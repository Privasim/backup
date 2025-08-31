'use client';

import React from 'react';
import type { ImplementationPlan } from '@/features/implementation-plan/types';

// Visualization component props interface
export interface VisualizationProps {
  planData?: ImplementationPlan;
  planContent?: string;
  isLoading?: boolean;
  onError?: (error: Error) => void;
  className?: string;
}

// Visualization component interface
export interface VisualizationComponent {
  component: React.ComponentType<VisualizationProps>;
  displayName: string;
  description: string;
  supportsFeatures: string[];
  isDefault?: boolean;
}

// Registry interface
export interface VisualizationRegistry {
  [key: string]: VisualizationComponent;
}

// Error boundary for visualization components
export class VisualizationErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ComponentType<VisualizationProps>; onError?: (error: Error) => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Visualization component error:', error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      return React.createElement(FallbackComponent, { onError: this.props.onError });
    }

    return this.props.children;
  }
}

// Standard plan view component (existing implementation)
const StandardPlanView: React.FC<VisualizationProps> = React.memo(({ 
  planContent, 
  isLoading, 
  onError,
  className = '' 
}) => {
  // This will be the existing implementation from ImplementationPlanTab
  // For now, we'll create a placeholder that matches the current structure
  
  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center h-full p-8 ${className}`}>
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
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Crafting Your Implementation Plan</h3>
            <p className="text-sm text-slate-600">
              Analyzing your business idea and creating a comprehensive roadmap...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!planContent) {
    return (
      <div className={`flex flex-col items-center justify-center h-full text-center p-8 ${className}`}>
        <div className="rounded-full bg-blue-50 p-4 mb-4">
          <svg className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Implementation Plan</h3>
        <p className="text-gray-600 mb-4 max-w-md">
          Generate an implementation plan by clicking "Create Implementation Plan" on a business suggestion card.
        </p>
      </div>
    );
  }

  // Return a simple content display for now
  return (
    <div className={`h-full ${className}`}>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm h-full">
        <div className="p-4 sm:p-6 md:p-8 h-full overflow-y-auto">
          <div className="prose prose-slate max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
              {planContent}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
});

StandardPlanView.displayName = 'StandardPlanView';

// Lazy import for VerticalTimeline component
const VerticalTimelineLazy = React.lazy(() => 
  import('./VerticalTimeline').then(module => ({ default: module.VerticalTimeline }))
);

// Wrapper component with Suspense for lazy loading
const VerticalTimelineWithSuspense: React.FC<VisualizationProps> = (props) => (
  <React.Suspense 
    fallback={
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gradient-to-r from-purple-200 to-blue-300 rounded-lg w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-purple-200 rounded w-full"></div>
            <div className="h-4 bg-purple-200 rounded w-5/6"></div>
            <div className="h-4 bg-purple-200 rounded w-4/6"></div>
          </div>
        </div>
        <div className="text-center mt-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Loading Timeline View</h3>
          <p className="text-sm text-slate-600">
            Preparing your timeline visualization...
          </p>
        </div>
      </div>
    }
  >
    <VerticalTimelineLazy {...props} />
  </React.Suspense>
);

// Registry instance
const registry: VisualizationRegistry = {
  standard: {
    component: StandardPlanView,
    displayName: 'Standard View',
    description: 'Traditional list-based implementation plan view',
    supportsFeatures: ['markdown', 'copy', 'download', 'print'],
    isDefault: true,
  },
  'vertical-timeline': {
    component: VerticalTimelineWithSuspense,
    displayName: 'Vertical Timeline',
    description: 'Timeline-based view with phases and milestones',
    supportsFeatures: ['timeline', 'phases', 'milestones', 'interactive'],
    isDefault: false,
  },
};

// Registry management functions
export const getVisualizationComponent = (type: string): VisualizationComponent | null => {
  return registry[type] || null;
};

export const getDefaultVisualization = (): VisualizationComponent => {
  const defaultViz = Object.values(registry).find(viz => viz.isDefault);
  return defaultViz || registry.standard;
};

export const getAllVisualizations = (): VisualizationComponent[] => {
  return Object.values(registry);
};

export const getVisualizationTypes = (): string[] => {
  return Object.keys(registry);
};

export const registerVisualization = (
  type: string, 
  component: VisualizationComponent
): void => {
  registry[type] = component;
};

export const isVisualizationSupported = (type: string): boolean => {
  return type in registry;
};

// Lazy loading support for future use
export const loadVisualizationComponent = async (
  type: string
): Promise<VisualizationComponent | null> => {
  // For now, return synchronously
  // In the future, this could support dynamic imports
  return getVisualizationComponent(type);
};

// Export the registry for testing
export { registry as visualizationRegistry };

// Default export
export default {
  getVisualizationComponent,
  getDefaultVisualization,
  getAllVisualizations,
  getVisualizationTypes,
  registerVisualization,
  isVisualizationSupported,
  loadVisualizationComponent,
};