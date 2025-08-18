import React from 'react';
import { Skeleton } from '../ui/skeleton';
import type { DataDrivenInsightsProps } from './types';

export function DataDrivenInsightsMinimal({ 
  insights, 
  loading = false,
  errors = [],
  slots
}: DataDrivenInsightsProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-3 sm:p-4">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-base font-semibold tracking-tight">Job Risk Insights</h2>
          {slots?.headerRight}
        </div>
        <p className="text-sm text-gray-500 mb-2">Analyzing job risk data...</p>
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (errors.length > 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-3 sm:p-4">
        <p className="text-sm text-red-600">{errors[0]}</p>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-3 sm:p-4">
        <p className="text-sm text-gray-600">No insights available</p>
      </div>
    );
  }

  const { summary, riskScore } = insights;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-3 sm:p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-base font-semibold tracking-tight">Job Risk Insights</h2>
        {slots?.headerRight}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-sm text-gray-700 line-clamp-2">
          {summary || '—'}
        </p>
        {typeof riskScore === 'number' && (
          <div className="ml-3 flex items-baseline gap-1 shrink-0">
            <span className="text-lg font-bold text-red-600">{riskScore}</span>
            <span className="text-xs text-red-600">/100</span>
          </div>
        )}
      </div>
      {slots?.footer && (
        <div className="border-t border-gray-100 pt-2 mt-2">
          {slots.footer}
        </div>
      )}
    </div>
  );
}
