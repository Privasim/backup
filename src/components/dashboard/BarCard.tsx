/**
 * BarCard component for dashboard metrics
 * Displays a horizontal bar chart for categorical data
 */
import React from 'react';
import type { JSX } from 'react';
import { BarCardProps } from '../../app/businessidea/tabs/visualization/metrics-types';
import { formatMetricValue } from '../../app/businessidea/tabs/visualization/metrics-selectors';

export function BarCard({
  title,
  subtitle,
  data,
  unit,
  loading = false,
  error = null,
  onExplain,
  onCompare,
  onExport
}: BarCardProps): JSX.Element {
  // Calculate max value for scaling
  const maxValue = data ? Math.max(...data.map(item => item.value)) : 0;
  
  // Render loading state
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse">
        <div className="flex justify-between items-center mb-4">
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-100 rounded w-16"></div>
        </div>
        <div className="space-y-3 mt-4">
          <div className="h-6 bg-gray-100 rounded w-full"></div>
          <div className="h-6 bg-gray-100 rounded w-3/4"></div>
          <div className="h-6 bg-gray-100 rounded w-1/2"></div>
          <div className="h-6 bg-gray-100 rounded w-1/3"></div>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-red-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-900">{title}</h3>
        </div>
        <div className="flex justify-center items-center h-40">
          <p className="text-sm text-red-500">Failed to load chart data</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-gray-900">{title}</h3>
        <div className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
          Last week
        </div>
      </div>
      
      {/* Bar Chart */}
      <div className="space-y-3 mt-4" onClick={onExplain}>
        {data && data.map((item, index) => (
          <div key={`bar-${index}`} className="flex flex-col">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600">{item.category}</span>
              <span className="text-xs font-medium text-gray-900">
                {formatMetricValue(item.value, unit)}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div 
                className="h-2.5 rounded-full" 
                style={{ 
                  width: `${maxValue ? (item.value / maxValue) * 100 : 0}%`,
                  backgroundColor: item.color || `hsl(${index * 60}, 70%, 60%)`
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      
      {subtitle && (
        <div className="mt-4 text-xs text-gray-500">{subtitle}</div>
      )}
      
      {/* Action buttons */}
      {(onCompare || onExport) && (
        <div className="mt-3 flex justify-end space-x-2">
          {onCompare && (
            <button 
              onClick={onCompare}
              className="text-xs text-gray-600 hover:text-gray-900"
            >
              Compare
            </button>
          )}
          {onExport && (
            <button 
              onClick={onExport}
              className="text-xs text-gray-600 hover:text-gray-900"
            >
              Export
            </button>
          )}
        </div>
      )}
    </div>
  );
}
