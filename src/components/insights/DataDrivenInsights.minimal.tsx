import React from 'react';
import { Skeleton } from '../ui/skeleton';
import type { DataDrivenInsightsProps } from './types';

export function DataDrivenInsightsMinimal({ 
  insights, 
  loading = false
}: DataDrivenInsightsProps) {
  if (loading) {
    return <Skeleton className="h-4 w-3/4" />;
  }
  
  return <div>Minimal Component</div>;
}
