/**
 * DonutCard component for dashboard metrics
 * Displays a donut chart with optional legend
 */
import React from 'react';
import type { JSX } from 'react';
import { DonutCardProps } from '../../app/businessidea/tabs/visualization/metrics-types';

export function DonutCard({
  title,
  subtitle,
  data,
  dimension,
  showLegend = true,
  loading = false,
  error = null,
  onExplain,
  onCompare,
  onExport
}: DonutCardProps): JSX.Element {
  // Calculate total for percentages
  const total = data?.reduce((sum, item) => sum + item.value, 0) || 0;
  
  // Generate donut chart segments
  const generateDonutSegments = () => {
    if (!data || data.length === 0) return null;
    
    let cumulativePercent = 0;
    const segments = data.map((item, index) => {
      const percent = total > 0 ? (item.value / total) * 100 : 0;
      const startPercent = cumulativePercent;
      cumulativePercent += percent;
      
      // Calculate SVG arc parameters
      const startAngle = (startPercent / 100) * 2 * Math.PI - Math.PI / 2;
      const endAngle = (cumulativePercent / 100) * 2 * Math.PI - Math.PI / 2;
      
      // Calculate points on the circle
      const x1 = 50 + 40 * Math.cos(startAngle);
      const y1 = 50 + 40 * Math.sin(startAngle);
      const x2 = 50 + 40 * Math.cos(endAngle);
      const y2 = 50 + 40 * Math.sin(endAngle);
      
      // Determine if the arc should be drawn as a large arc
      const largeArcFlag = percent > 50 ? 1 : 0;
      
      // Create SVG path for the segment
      const path = `
        M 50 50
        L ${x1} ${y1}
        A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}
        Z
      `;
      
      return (
        <path
          key={`segment-${index}`}
          d={path}
          fill={item.color || `hsl(${index * 60}, 70%, 60%)`}
          stroke="#fff"
          strokeWidth="1"
        />
      );
    });
    
    // Add center circle for donut hole
    segments.push(
      <circle
        key="donut-hole"
        cx="50"
        cy="50"
        r="25"
        fill="white"
      />
    );
    
    return segments;
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse">
        <div className="flex justify-between items-center mb-4">
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-100 rounded w-16"></div>
        </div>
        <div className="flex justify-center mb-4">
          <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
        </div>
        {showLegend && (
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded w-full"></div>
            <div className="h-4 bg-gray-100 rounded w-full"></div>
            <div className="h-4 bg-gray-100 rounded w-full"></div>
          </div>
        )}
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
        <div className="flex justify-center items-center h-32">
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
      
      <div className="flex flex-col sm:flex-row items-center">
        {/* Donut Chart */}
        <div className="relative w-32 h-32 mx-auto sm:mx-0" onClick={onExplain}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {generateDonutSegments()}
          </svg>
          
          {/* Center text for small donuts without legends */}
          {!showLegend && data && data.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-medium text-gray-900">
                {Math.round(data[0].percentage || 0)}%
              </span>
            </div>
          )}
        </div>
        
        {/* Legend */}
        {showLegend && (
          <div className="mt-4 sm:mt-0 sm:ml-4 flex-1 space-y-2">
            {data && data.map((item, index) => (
              <div key={`legend-${index}`} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-sm mr-2" 
                  style={{ backgroundColor: item.color || `hsl(${index * 60}, 70%, 60%)` }}
                ></div>
                <span className="text-xs text-gray-600 flex-1">{item.category}</span>
                <span className="text-xs font-medium text-gray-900">{Math.round(item.percentage || 0)}%</span>
              </div>
            ))}
          </div>
        )}
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
