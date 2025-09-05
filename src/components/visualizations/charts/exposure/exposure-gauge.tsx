"use client";

import React, { useMemo } from 'react';

export interface ExposureGaugeProps {
  value: number; // 0-100
  size?: number; // px
  lowThreshold?: number; // 0-100
  highThreshold?: number; // 0-100
  ariaLabel?: string;
  className?: string;
}

export function ExposureGauge({
  value,
  size = 160,
  lowThreshold = 40,
  highThreshold = 70,
  ariaLabel,
  className = '',
}: ExposureGaugeProps) {
  // Clamp value between 0-100
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  
  // Calculate gauge dimensions
  const strokeWidth = Math.max(8, size * 0.08);
  const radius = (size - strokeWidth) / 2;
  const centerX = size / 2;
  const centerY = size / 2;
  
  // Calculate the arc path for the gauge
  // Semi-circle (180 degrees) starting from the bottom left
  const startAngle = 180;
  const endAngle = 0;
  const angleRange = endAngle - startAngle;
  
  // Calculate the angle for the current value
  const valueAngle = startAngle + (angleRange * (clamped / 100));
  
  // Calculate threshold angles
  const lowAngle = startAngle + (angleRange * (lowThreshold / 100));
  const highAngle = startAngle + (angleRange * (highThreshold / 100));
  
  // Convert angles to radians and calculate points
  const valueRad = (valueAngle * Math.PI) / 180;
  const valueX = centerX + radius * Math.cos(valueRad);
  const valueY = centerY + radius * Math.sin(valueRad);
  
  // Create arc paths
  const createArcPath = (start: number, end: number) => {
    const startRad = (start * Math.PI) / 180;
    const endRad = (end * Math.PI) / 180;
    const startX = centerX + radius * Math.cos(startRad);
    const startY = centerY + radius * Math.sin(startRad);
    const endX = centerX + radius * Math.cos(endRad);
    const endY = centerY + radius * Math.sin(endRad);
    
    const largeArcFlag = Math.abs(end - start) > 180 ? 1 : 0;
    
    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${endX} ${endY}`;
  };
  
  // Create the track paths for each segment
  const lowPath = createArcPath(startAngle, lowAngle);
  const moderatePath = createArcPath(lowAngle, highAngle);
  const highPath = createArcPath(highAngle, endAngle);
  
  // Determine severity based on value
  const severity = useMemo(() => {
    if (clamped >= highThreshold) return 'High';
    if (clamped >= lowThreshold) return 'Moderate';
    return 'Low';
  }, [clamped, highThreshold, lowThreshold]);
  
  // Determine color classes based on severity
  const severityColorClass = useMemo(() => {
    if (severity === 'High') return 'text-error-600';
    if (severity === 'Moderate') return 'text-warning-600';
    return 'text-success-600';
  }, [severity]);
  
  const severityBgClass = useMemo(() => {
    if (severity === 'High') return 'bg-error-100';
    if (severity === 'Moderate') return 'bg-warning-100';
    return 'bg-success-100';
  }, [severity]);
  
  const severityBorderClass = useMemo(() => {
    if (severity === 'High') return 'border-error-200';
    if (severity === 'Moderate') return 'border-warning-200';
    return 'border-success-200';
  }, [severity]);
  
  // Create the needle
  const needleLength = radius - strokeWidth / 2;
  const needleX = centerX + needleLength * Math.cos(valueRad);
  const needleY = centerY + needleLength * Math.sin(valueRad);
  
  return (
    <div 
      className={`flex flex-col items-center ${className}`}
      role="img"
      aria-label={ariaLabel || `Automation exposure gauge showing ${clamped}% (${severity} risk)`}
    >
      <svg width={size} height={size / 1.6} viewBox={`0 0 ${size} ${size}`}>
        {/* Track segments */}
        <path
          d={lowPath}
          stroke="var(--success-200)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={moderatePath}
          stroke="var(--warning-200)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={highPath}
          stroke="var(--error-200)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Center point */}
        <circle
          cx={centerX}
          cy={centerY}
          r={strokeWidth / 1.5}
          fill="var(--neutral-200)"
        />
        
        {/* Needle */}
        <line
          x1={centerX}
          y1={centerY}
          x2={needleX}
          y2={needleY}
          stroke="var(--neutral-800)"
          strokeWidth={strokeWidth / 4}
          strokeLinecap="round"
        />
        
        {/* Needle cap */}
        <circle
          cx={centerX}
          cy={centerY}
          r={strokeWidth / 3}
          fill="var(--neutral-800)"
        />
        
        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const tickAngle = startAngle + (angleRange * (tick / 100));
          const tickRad = (tickAngle * Math.PI) / 180;
          const outerX = centerX + (radius + strokeWidth / 4) * Math.cos(tickRad);
          const outerY = centerY + (radius + strokeWidth / 4) * Math.sin(tickRad);
          const innerX = centerX + (radius - strokeWidth / 2) * Math.cos(tickRad);
          const innerY = centerY + (radius - strokeWidth / 2) * Math.sin(tickRad);
          
          return (
            <React.Fragment key={tick}>
              <line
                x1={innerX}
                y1={innerY}
                x2={outerX}
                y2={outerY}
                stroke="var(--neutral-400)"
                strokeWidth={tick % 50 === 0 ? 2 : 1}
              />
              {tick % 50 === 0 && (
                <text
                  x={centerX + (radius + strokeWidth * 1.2) * Math.cos(tickRad)}
                  y={centerY + (radius + strokeWidth * 1.2) * Math.sin(tickRad)}
                  fontSize={size * 0.08}
                  fill="var(--neutral-600)"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {tick}%
                </text>
              )}
            </React.Fragment>
          );
        })}
      </svg>
      
      {/* Value and label */}
      <div className="mt-2 flex flex-col items-center">
        <div className="flex items-center gap-2">
          <span className="text-heading font-bold">{clamped}%</span>
          <span className={`badge-base ${
            severity === 'High' ? 'badge-error' : 
            severity === 'Moderate' ? 'badge-warning' : 
            'badge-success'
          }`}>
            {severity}
          </span>
        </div>
        <div className="text-body-sm text-secondary mt-1">Automation Exposure</div>
      </div>
      
      {/* Legend */}
      <div className="mt-3 flex items-center justify-center gap-4 text-body-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-success-400"></div>
          <span>Low</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-warning-400"></div>
          <span>Moderate</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-error-400"></div>
          <span>High</span>
        </div>
      </div>
    </div>
  );
}
