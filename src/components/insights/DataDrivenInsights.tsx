import React from 'react';
import { Skeleton } from '../ui/skeleton';
import { AlertCircle, Zap, Info, ChevronRight, BarChart3, PieChart } from 'lucide-react';
import type { DataDrivenInsightsModel, AutomationExposureItem } from './types';

interface DataDrivenInsightsProps {
  insights?: DataDrivenInsightsModel;
  loading?: boolean;
  errors?: string[];
  slots?: {
    headerRight?: React.ReactNode;
    footer?: React.ReactNode;
  };
}

export function DataDrivenInsights({ 
  insights, 
  loading = false, 
  errors = [], 
  slots 
}: DataDrivenInsightsProps) {
  if (loading) {
    return (
      <div
        aria-busy="true"
        className="card-elevated p-4 animate-fade-in transition-all duration-300"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-accent p-1.5 rounded-full">
              <PieChart className="h-5 w-5 text-brand" />
            </div>
            <h2 className="text-heading text-primary">Job Risk Insights</h2>
          </div>
          {slots?.headerRight}
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-hero rounded-lg mb-4 border border-default">
          <Info className="h-4 w-4 text-brand animate-pulse" />
          <p className="text-label text-primary">Analyzing job risk data...</p>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-6 w-2/3 rounded-md" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-28 w-full rounded-md" />
          <Skeleton className="h-20 w-full rounded-md" />
        </div>
      </div>
    );
  }

  if (errors.length > 0) {
    return (
      <div className="card-elevated p-4 animate-fade-in transition-all duration-300">
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-error-100 p-1.5 rounded-full">
            <AlertCircle className="h-5 w-5 text-error-600" />
          </div>
          <h3 className="text-heading text-primary">Analysis Error</h3>
        </div>
        <div className="rounded-lg p-3 border border-error-200 bg-error-50">
          <ul className="space-y-2 text-body text-primary" role="list">
            {errors.map((error: string, index: number) => (
              <li key={index} className="flex items-start gap-2" role="listitem">
                <ChevronRight className="h-4 w-4 text-error-500 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="card-elevated p-4 animate-fade-in transition-all duration-300">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="gradient-subtle p-4 rounded-full mb-3">
            <Zap className="h-6 w-6 text-secondary" />
          </div>
          <h3 className="text-subheading text-primary mb-2">No insights available</h3>
          <p className="text-body text-secondary max-w-sm">Generate insights to see your job risk analysis and recommendations</p>
        </div>
      </div>
    );
  }

  const { 
    automationExposure, 
    narratives
  } = insights;

  return (
    <div className="card-elevated p-4 animate-fade-in transition-all duration-300">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-accent p-1.5 rounded-full">
            <PieChart className="h-5 w-5 text-brand" />
          </div>
          <h2 className="text-heading text-primary">Job Risk Insights</h2>
        </div>
        {slots?.headerRight}
      </div>
      <div className="space-y-4">

      

      {/* Automation Exposure */}
      {(automationExposure && automationExposure.length > 0) || narratives?.automationNarrative ? (
        <div className="card-base p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-accent-100 p-2 rounded-full">
              <Zap className="h-5 w-5 text-accent-600" />
            </div>
            <h3 className="text-subheading text-primary">Automation Exposure</h3>
          </div>
          {narratives?.automationNarrative ? (
            <div className="bg-hero rounded-lg p-3 border border-default mb-3">
              <p className="text-body leading-relaxed text-primary">{narratives.automationNarrative}</p>
            </div>
          ) : null}
          
          {automationExposure && automationExposure.length > 0 ? (
            <div className="space-y-3 mt-2" role="list">
              {automationExposure.map((item: AutomationExposureItem, index: number) => (
                <div 
                  key={index} 
                  role="listitem" 
                  className="p-3 rounded-lg border border-default bg-surface hover:bg-neutral-50 transition-colors duration-200"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-label text-primary">{item.task}</span>
                    <span 
                      className={`${item.exposure > 70 ? 'badge-base badge-error' : 
                        item.exposure > 40 ? 'badge-base badge-warning' : 'badge-base badge-success'}`}
                      aria-label={`Exposure level: ${item.exposure}%`}
                    >
                      {item.exposure}% Exposure
                    </span>
                  </div>
                  <div 
                    className="progress-base" 
                    role="progressbar" 
                    aria-valuenow={item.exposure} 
                    aria-valuemin={0} 
                    aria-valuemax={100}
                  >
                    <div 
                      className={`${item.exposure > 70 ? 'progress-bar-error' : 
                        item.exposure > 40 ? 'progress-bar-warning' : 'progress-bar-success'}`}
                      style={{ width: `${Math.max(0, Math.min(100, item.exposure))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}


      {slots?.footer && (
        <div className="border-t border-default pt-3 mt-4">
          {slots.footer}
        </div>
      )}
      </div>
    </div>
  );
}
