// File: src/modules/job-loss-viz/components/LineGraph.tsx
'use client';

import React from 'react';

interface Datum { ts: string; value: number }

interface Props {
  data: Datum[];
  height?: number; // px
  colorPrimary?: string; // hex
  areaOpacity?: number; // 0..1
  className?: string;
}

export function LineGraph({
  data,
  height = 180,
  colorPrimary = '#2563eb', // tailwind blue-600
  areaOpacity = 0.12,
  className,
}: Props) {
  const hasSeries = data && data.length >= 2;

  // Compute scale
  let min = 0, max = 0;
  if (hasSeries) {
    const values = data.map((d) => d.value);
    min = Math.min(...values);
    max = Math.max(...values);
    if (min === max) {
      // Avoid zero range
      max = min + 1;
    }
  }
  const range = max - min || 1;
  const pad = range * 0.1;
  const yMin = hasSeries ? min - pad : 0;
  const yMax = hasSeries ? max + pad : 1;
  const yRange = yMax - yMin || 1;

  const widthStep = hasSeries ? 100 / (data.length - 1) : 100;

  const normalizeY = (v: number) => 1 - (v - yMin) / yRange;

  const linePath = hasSeries
    ? data.reduce((acc, d, i) => {
        const x = i * widthStep;
        const y = normalizeY(d.value) * 100;
        return acc + (i === 0 ? `M${x},${y}` : ` L${x},${y}`);
      }, '')
    : '';

  const areaPath = hasSeries
    ? linePath + ` L100,100 L0,100 Z`
    : '';

  const containerStyle: React.CSSProperties = { height };

  return (
    <div className={className} style={containerStyle} aria-label="YTD global AI-related job losses line chart">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Area */}
        {hasSeries && (
          <path d={areaPath} fill={hexWithOpacity(colorPrimary, areaOpacity)} />
        )}
        {/* Line */}
        {hasSeries && (
          <path d={linePath} fill="none" stroke={colorPrimary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        )}
        {/* Points */}
        {hasSeries && data.map((d, i) => {
          const x = i * widthStep;
          const y = normalizeY(d.value) * 100;
          return (
            <circle key={i} cx={x} cy={y} r={2} fill="white" stroke={colorPrimary} strokeWidth={1} />
          );
        })}
      </svg>
      {/* X-axis labels (first, mid, last) */}
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        {hasSeries ? (
          <>
            <div>{formatMonth(data[0].ts)}</div>
            <div>{formatMonth(data[Math.floor(data.length / 2)].ts)}</div>
            <div>{formatMonth(data[data.length - 1].ts)}</div>
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
