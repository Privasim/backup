/**
 * KPI Card component for dashboard metrics
 * Displays a single KPI with value, delta, and optional sparkline
 */
import React from 'react';
import { KpiCardProps, TimeSeriesPoint } from '../../app/businessidea/tabs/visualization/metrics-types';
import { formatDeltaPct, formatMetricValue, getDeltaColorClass } from '../../app/businessidea/tabs/visualization/metrics-selectors';

export function KpiCard({
  title,
  value,
  deltaAbs,
  deltaPct,
  unit,
  sparkline,
  color = '#0088FE',
  loading = false,
  error = null,
  onExplain
}: KpiCardProps): JSX.Element {
  // Generate sparkline SVG path
  const generateSparklinePath = (data: TimeSeriesPoint[] = []): string => {
    if (!data || data.length < 2) return '';
    
    const values = data.map(point => point.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    
    // Normalize to 0-1 range for SVG
    const normalizedValues = values.map(v => 1 - ((v - min) / range));
    
    // Generate SVG path
    const width = 100 / (normalizedValues.length - 1);
    let path = `M0,${normalizedValues[0] * 100}`;
    
    for (let i = 1; i < normalizedValues.length; i++) {
      path += ` L${i * width},${normalizedValues[i] * 100}`;
    }
    
    return path;
  };

  // Determine color classes
  const deltaColorClass = getDeltaColorClass(deltaPct);
  const bgColorClass = `bg-${color.replace('#', '')}-50`;
  
  // Render loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 animate-pulse">
        <div className="w-8 h-8 bg-gray-200 rounded-lg mb-2"></div>
        <div className="h-5 bg-gray-200 rounded w-1/2 mb-1"></div>
        <div className="h-3 bg-gray-100 rounded w-1/3"></div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="bg-white rounded-xl p-3 shadow-sm border border-red-100">
        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mb-2">⚠️</div>
        <h3 className="font-medium text-sm text-gray-900 mb-1">{title}</h3>
        <p className="text-xs text-red-500">Failed to load</p>
      </div>
    );
  }
  
  // Custom background style with the provided color
  const bgStyle = {
    backgroundColor: `${color}15` // Using hex opacity
  };
  
  return (
    <div 
      className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow transition-shadow"
      onClick={onExplain}
    >
      <div 
        className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
        style={bgStyle}
      >
        {unit === 'currency' ? '💰' : unit === 'percentage' ? '📊' : '📈'}
      </div>
      
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-sm text-gray-900 mb-1">{formatMetricValue(value, unit)}</h3>
          <p className="text-xs text-gray-600">{title}</p>
        </div>
        
        <div className={`text-xs font-medium px-1.5 py-0.5 rounded-sm ${deltaColorClass}`}>
          {formatDeltaPct(deltaPct)}
        </div>
      </div>
      
      {/* Sparkline */}
      {sparkline && sparkline.length > 1 && (
        <div className="mt-2 h-6">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              d={generateSparklinePath(sparkline)}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
