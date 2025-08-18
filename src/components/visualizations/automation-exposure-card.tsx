import React, { useMemo } from 'react';
import { DataDrivenInsightsModel } from '../insights/types';
import { AutomationExposureBar } from './automation-exposure-bar';
import { AlertCircle } from 'lucide-react';

interface AutomationExposureCardProps {
  insights?: DataDrivenInsightsModel;
  title?: string;
  topN?: number;
  minExposure?: number;
  className?: string;
}

export function AutomationExposureCard({
  insights,
  title = 'Automation Exposure',
  topN = 8,
  minExposure = 0,
  className = ''
}: AutomationExposureCardProps) {
  // Adapter: insights -> dataset mapping with memoization
  const barItems = useMemo(() => {
    if (!insights?.automationExposure || insights.automationExposure.length === 0) {
      return [];
    }
    
    return insights.automationExposure
      .map(item => ({
        label: item.task,
        value: Math.max(0, Math.min(100, item.exposure)) // Clamp to 0-100
      }))
      .filter(item => item.value >= minExposure)
      .sort((a, b) => b.value - a.value) // Sort descending by exposure
      .slice(0, topN);
  }, [insights, topN, minExposure]);
  
  const isEmpty = barItems.length === 0;
  
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>
      </div>
      
      <div className="p-4">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-gray-500 text-sm">No automation exposure data available</p>
            <p className="text-gray-400 text-xs mt-1">Complete your profile analysis to see insights</p>
          </div>
        ) : (
          <AutomationExposureBar 
            items={barItems} 
            maxBars={topN}
            ariaLabel={`${title} chart showing automation risk for top ${topN} tasks`}
          />
        )}
      </div>
      
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
        Showing top {topN} tasks with highest automation exposure
      </div>
    </div>
  );
}
