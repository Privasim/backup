"use client";

import React, { useMemo } from 'react';
import * as d3 from 'd3';
import { CutSeries } from '../types';

export type D3VelocityCutsChartProps = {
  data: CutSeries;
  highlightWindowMonths?: number;
  width?: number;
  height?: number;
  showCaption?: boolean;
  className?: string;
};

export default function D3VelocityCutsChart({
  data,
  highlightWindowMonths = 3,
  width = 640,
  height = 220,
  showCaption = true,
  className,
}: D3VelocityCutsChartProps) {
  const margin = { top: 12, right: 16, bottom: 24, left: 36 };
  const innerW = Math.max(0, width - margin.left - margin.right);
  const innerH = Math.max(0, height - margin.top - margin.bottom);

  const parsed = useMemo(() => {
    return data.map((d) => ({ t: d.t instanceof Date ? d.t : new Date(d.t), v: d.cuts }));
  }, [data]);

  const x = useMemo(() => d3.scaleTime().domain(d3.extent(parsed, (d) => d.t) as [Date, Date]).range([0, innerW]), [parsed, innerW]);
  const y = useMemo(() => d3.scaleLinear().domain([0, d3.max(parsed, (d) => d.v)! * 1.1]).nice().range([innerH, 0]), [parsed, innerH]);

  const area = useMemo(
    () =>
      d3
        .area<{ t: Date; v: number }>()
        .x((d) => x(d.t))
        .y0(innerH)
        .y1((d) => y(d.v))
        .curve(d3.curveMonotoneX),
    [x, y, innerH]
  );

  const line = useMemo(
    () =>
      d3
        .line<{ t: Date; v: number }>()
        .x((d) => x(d.t))
        .y((d) => y(d.v))
        .curve(d3.curveMonotoneX),
    [x, y]
  );

  const lastIdx = parsed.length - 1;
  const highlightStartIdx = Math.max(0, lastIdx - (highlightWindowMonths - 1));

  const gridY = useMemo(() => y.ticks(4), [y]);

  const reducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <figure className={className} aria-label="Velocity of AI-driven role cuts over time">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="auto" role="img">
        <defs>
          <linearGradient id="vel-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#fde68a" stopOpacity="0.08" />
          </linearGradient>
          <filter id="soft-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* gridlines */}
          {gridY.map((gy, i) => (
            <line key={i} x1={0} x2={innerW} y1={y(gy)} y2={y(gy)} stroke="rgba(100,116,139,0.25)" strokeWidth={1} />
          ))}

          {/* area fill */}
          <path d={area(parsed) || undefined} fill="url(#vel-fill)" />

          {/* base line */}
          <path
            d={line(parsed) || undefined}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={2}
            style={reducedMotion ? undefined : { filter: 'url(#soft-glow)' }}
          />

          {/* highlight last window */}
          {highlightWindowMonths > 0 && lastIdx > 0 && (
            <path
              d={line(parsed.slice(highlightStartIdx)) || undefined}
              fill="none"
              stroke="#ef4444"
              strokeWidth={2.5}
              strokeDasharray={reducedMotion ? undefined : '4 3'}
            />
          )}

          {/* minimal axes ticks */}
          {x.ticks(4).map((t, i) => (
            <text key={i} x={x(t)} y={innerH + 16} textAnchor="middle" fontSize={10} fill="#64748b">
              {d3.timeFormat('%b %y')(t as Date)}
            </text>
          ))}
          {y.ticks(3).map((t, i) => (
            <text key={i} x={-8} y={y(t)} dy={3} textAnchor="end" fontSize={10} fill="#64748b">
              {t}
            </text>
          ))}
        </g>
      </svg>
      {showCaption && (
        <figcaption className="mt-2 text-xs text-slate-400">
          Acceleration emphasized in the last {highlightWindowMonths} months.
        </figcaption>
      )}
    </figure>
  );
}
