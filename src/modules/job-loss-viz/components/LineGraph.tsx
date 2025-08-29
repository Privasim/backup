// File: src/modules/job-loss-viz/components/LineGraph.tsx
'use client';

import React from 'react';

interface Datum { ts: string; value: number }

interface Props {
  data: Datum[];
  forecastData?: Datum[];
  height?: number; // px
  colorPrimary?: string; // hex
  forecastColor?: string; // hex
  areaOpacity?: number; // 0..1
  className?: string;
}

export function LineGraph({
  data,
  forecastData = [],
  height = 180,
  colorPrimary = '#2563eb', // tailwind blue-600
  forecastColor = '#ef4444', // tailwind red-500
  areaOpacity = 0.12,
  className,
}: Props) {
  const hasHistorical = data && data.length >= 2;
  const hasForecast = forecastData && forecastData.length > 0;

  // Compute scale for combined data
  let min = 0, max = 0;
  const allData = [...data, ...forecastData];
  const hasData = allData && allData.length > 0;
  
  if (hasData) {
    const values = allData.map((d) => d.value);
    min = Math.min(...values);
    max = Math.max(...values);
    if (min === max) {
      max = min + 1;
    }
  }
  const range = max - min || 1;
  const pad = range * 0.1;
  const yMin = hasData ? min - pad : 0;
  const yMax = hasData ? max + pad : 1;
  const yRange = yMax - yMin || 1;

  const totalPoints = data.length + forecastData.length;
  const widthStep = totalPoints > 1 ? 100 / (totalPoints - 1) : 100;

  const normalizeY = (v: number) => 1 - (v - yMin) / yRange;

  // Historical line path
  const historicalPath = hasHistorical
    ? data.reduce((acc, d, i) => {
        const x = i * widthStep;
        const y = normalizeY(d.value) * 100;
        return acc + (i === 0 ? `M${x},${y}` : ` L${x},${y}`);
      }, '')
    : '';

  // Forecast line path
  const forecastPath = hasForecast
    ? forecastData.reduce((acc, d, i) => {
        const x = (data.length + i) * widthStep;
        const y = normalizeY(d.value) * 100;
        return acc + (i === 0 ? `M${x},${y}` : ` L${x},${y}`);
      }, '')
    : '';

  // Historical area
  const historicalAreaPath = hasHistorical
    ? historicalPath + ` L${(data.length - 1) * widthStep},100 L0,100 Z`
    : '';

  // Forecast area
  const forecastAreaPath = hasForecast
    ? forecastPath + ` L100,100 L${data.length * widthStep},100 Z`
    : '';

  const containerStyle: React.CSSProperties = { height };

  return (
    <div className={className} style={containerStyle} aria-label="YTD global AI-related job losses line chart">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Historical Area */}
        {hasHistorical && (
          <path d={historicalAreaPath} fill={hexWithOpacity(colorPrimary, areaOpacity)} />
        )}
        {/* Forecast Area */}
        {hasForecast && (
          <path d={forecastAreaPath} fill={hexWithOpacity(forecastColor, areaOpacity)} />
        )}
        
        {/* Historical Line */}
        {hasHistorical && (
          <path d={historicalPath} fill="none" stroke={colorPrimary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        )}
        
        {/* Forecast Line */}
        {hasForecast && (
          <path d={forecastPath} fill="none" stroke={forecastColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4,4" />
        )}
        
        {/* Historical Points */}
        {hasHistorical && data.map((d, i) => {
          const x = i * widthStep;
          const y = normalizeY(d.value) * 100;
          return (
            <circle key={`hist-${i}`} cx={x} cy={y} r={2} fill="white" stroke={colorPrimary} strokeWidth={1} />
          );
        })}
        
        {/* Forecast Points */}
        {hasForecast && forecastData.map((d, i) => {
          const x = (data.length + i) * widthStep;
          const y = normalizeY(d.value) * 100;
          return (
            <circle key={`forecast-${i}`} cx={x} cy={y} r={2} fill="white" stroke={forecastColor} strokeWidth={1} />
          );
        })}
      </svg>
      {/* X-axis labels */}
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        {hasHistorical || hasForecast ? (
          <>
            <div>{formatMonth(data[0]?.ts || forecastData[0]?.ts)}</div>
            <div>{formatMonth(data[data.length - 1]?.ts || forecastData[0]?.ts)}</div>
            <div>{formatMonth(forecastData[forecastData.length - 1]?.ts || data[data.length - 1]?.ts)}</div>
          </>
        ) : (
          <div className="text-gray-400">No data yet</div>
        )}
      </div>
    </div>
  );
}

function formatMonth(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function hexWithOpacity(hex: string, opacity: number): string {
  // Convert #RRGGBB to rgba with opacity; fallback to hex + opacity if needed
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return hex;
  const r = parseInt(m[1], 16);
  const g = parseInt(m[2], 16);
  const b = parseInt(m[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, opacity))})`;
}
