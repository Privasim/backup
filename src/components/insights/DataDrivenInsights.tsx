import React from 'react';
import { Skeleton } from '../ui/skeleton';
import { AlertCircle, Zap, Info, ChevronRight, BarChart3 } from 'lucide-react';
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
        className="rounded-xl border border-gray-200 bg-white shadow-md p-2 sm:p-3 transition-all duration-300"
      >
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-semibold tracking-tight text-gray-900">Job Risk Insights</h2>
          </div>
          {slots?.headerRight}
        </div>
        <div className="flex items-center gap-2 px-2 py-2 bg-blue-50 rounded-lg mb-2">
          <Info className="h-4 w-4 text-blue-600 animate-pulse" />
          <p className="text-sm text-gray-700 font-medium">Analyzing job risk data...</p>
        </div>
        <div className="space-y-2">
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
      <div className="rounded-xl border border-red-100 bg-white shadow-md p-2 sm:p-3 transition-all duration-300">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <h3 className="text-base font-medium text-gray-900">Analysis Error</h3>
        </div>
        <div className="bg-red-50 rounded-lg p-3 border border-red-100">
          <ul className="space-y-1 text-sm text-gray-700">
            {errors.map((error: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
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
      <div className="rounded-xl border border-gray-200 bg-white shadow-md p-3 sm:p-4 transition-all duration-300">
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="bg-gray-100 p-3 rounded-full mb-2">
            <Zap className="h-6 w-6 text-gray-500" />
          </div>
          <h3 className="text-base font-medium text-gray-700 mb-1">No insights available</h3>
          <p className="text-sm text-gray-500 max-w-sm">Generate insights to see your job risk analysis and recommendations</p>
        </div>
      </div>
    );
  }

  const { 
    automationExposure, 
    narratives
  } = insights;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-md p-2 sm:p-3 transition-all duration-300">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <h2 className="text-base font-semibold tracking-tight text-gray-900">Job Risk Insights</h2>
        </div>
        {slots?.headerRight}
      </div>
      <div className="space-y-2">

      

      {/* Automation Exposure */}
      {(automationExposure && automationExposure.length > 0) || narratives?.automationNarrative ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-purple-100 p-1.5 rounded-full">
              <Zap className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-base font-medium text-gray-900">Automation Exposure</h3>
          </div>
          {narratives?.automationNarrative ? (
            <div className="bg-gray-50 rounded-lg p-2 border border-gray-100 mb-2">
              <p className="text-sm leading-relaxed text-gray-700">{narratives.automationNarrative}</p>
            </div>
          ) : null}
          
          {automationExposure && automationExposure.length > 0 ? (
            <div className="space-y-2 mt-1" role="list">
              {automationExposure.map((item: AutomationExposureItem, index: number) => (
                <div 
                  key={index} 
                  role="listitem" 
                  className="p-2 rounded-lg border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-800">{item.task}</span>
                    <span 
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        item.exposure > 70 ? 'bg-red-100 text-gray-800' : 
                        item.exposure > 40 ? 'bg-yellow-100 text-gray-800' : 'bg-green-100 text-gray-800'
                      }`}
                    >
                      {item.exposure}% Exposure
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        item.exposure > 70 ? 'bg-red-600' : 
                        item.exposure > 40 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${item.exposure}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}


      {slots?.footer && (
        <div className="border-t border-gray-100 pt-2 mt-2">
          {slots.footer}
        </div>
      )}
      </div>
    </div>
  );
}
