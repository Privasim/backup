/**
 * LineCard component for dashboard metrics
 * Displays a line chart for time series data
 */
import React from 'react';
import type { JSX } from 'react';
import { LineCardProps } from '../../app/businessidea/tabs/visualization/metrics-types';
import { formatMetricValue } from '../../app/businessidea/tabs/visualization/metrics-selectors';

export function LineCard({
  title,
  subtitle,
  data,
  unit,
  color = '#0088FE',
  loading = false,
  error = null,
  onExplain,
  onCompare,
  onExport
}: LineCardProps): JSX.Element {
  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  // Generate line chart path
  const generateLinePath = () => {
    if (!data || data.length < 2) return '';
    
    const values = data.map(point => point.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    
    // Add padding to the range
    const paddedMin = min - range * 0.1;
    const paddedMax = max + range * 0.1;
    const paddedRange = paddedMax - paddedMin;
    
    // Normalize to 0-1 range for SVG
    const normalizedValues = values.map(v => 1 - ((v - paddedMin) / paddedRange));
    
    // Generate SVG path
    const width = 100 / (normalizedValues.length - 1);
    let path = `M0,${normalizedValues[0] * 100}`;
    
    for (let i = 1; i < normalizedValues.length; i++) {
      path += ` L${i * width},${normalizedValues[i] * 100}`;
    }
    
    return path;
  };
  
  // Generate area under the line
  const generateAreaPath = () => {
    if (!data || data.length < 2) return '';
    
    const values = data.map(point => point.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    
    // Add padding to the range
    const paddedMin = min - range * 0.1;
    const paddedMax = max + range * 0.1;
    const paddedRange = paddedMax - paddedMin;
    
    // Normalize to 0-1 range for SVG
    const normalizedValues = values.map(v => 1 - ((v - paddedMin) / paddedRange));
    
    // Generate SVG path
    const width = 100 / (normalizedValues.length - 1);
    let path = `M0,${normalizedValues[0] * 100}`;
    
    for (let i = 1; i < normalizedValues.length; i++) {
      path += ` L${i * width},${normalizedValues[i] * 100}`;
    }
    
    // Complete the area path
    path += ` L${100},100 L0,100 Z`;
    
    return path;
  };
  
  // Calculate latest value and delta
  const getLatestValueAndDelta = () => {
    if (!data || data.length < 2) return { value: 0, delta: 0 };
    
    const latest = data[data.length - 1].value;
    const previous = data[data.length - 2].value;
    const delta = ((latest - previous) / previous) * 100;
    
    return { value: latest, delta };
  };
  
  const { value, delta } = getLatestValueAndDelta();
  
  // Determine delta color class
  const getDeltaColorClass = (delta: number) => {
    if (delta > 0) return 'text-green-600 bg-green-50';
    if (delta < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };
  
  const deltaColorClass = getDeltaColorClass(delta);
  
  // Render loading state
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse">
        <div className="flex justify-between items-center mb-4">
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-100 rounded w-16"></div>
        </div>
        <div className="h-40 bg-gray-100 rounded mb-4"></div>
        <div className="flex justify-between">
          <div className="h-4 bg-gray-100 rounded w-20"></div>
          <div className="h-4 bg-gray-100 rounded w-20"></div>
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
      
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="text-xl font-medium text-gray-900">
            {formatMetricValue(value, unit)}
          </div>
          <div className={`text-xs font-medium px-1.5 py-0.5 rounded-sm inline-block ${deltaColorClass}`}>
            {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
          </div>
        </div>
      </div>
      
      {/* Line Chart */}
      <div className="h-40 mt-4 relative" onClick={onExplain}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Area under the line */}
          <path
            d={generateAreaPath()}
            fill={`${color}15`} // Using hex opacity
          />
          
          {/* Line */}
          <path
            d={generateLinePath()}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {data && data.map((point, index) => {
            const values = data.map(p => p.value);
            const min = Math.min(...values);
            const max = Math.max(...values);
            const range = max - min || 1;
            
            // Add padding to the range
            const paddedMin = min - range * 0.1;
            const paddedMax = max + range * 0.1;
            const paddedRange = paddedMax - paddedMin;
            
            const normalizedValue = 1 - ((point.value - paddedMin) / paddedRange);
            const width = 100 / (data.length - 1);
            const x = index * width;
            const y = normalizedValue * 100;
            
            return (
              <circle
                key={`point-${index}`}
                cx={x}
                cy={y}
                r="2"
                fill="white"
                stroke={color}
                strokeWidth="1"
              />
            );
          })}
        </svg>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          {data && data.length > 0 && (
            <>
              <div>{formatDate(data[0].ts)}</div>
              {data.length > 2 && (
                <div>{formatDate(data[Math.floor(data.length / 2)].ts)}</div>
              )}
              <div>{formatDate(data[data.length - 1].ts)}</div>
            </>
          )}
        </div>
      </div>
      
      {subtitle && (
        <div className="mt-2 text-xs text-gray-500">{subtitle}</div>
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
