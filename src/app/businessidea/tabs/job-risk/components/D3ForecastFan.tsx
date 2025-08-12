"use client";

import React, { useMemo } from 'react';
import * as d3 from 'd3';
import { CutSeries, ForecastSeries } from '../types';

export type D3ForecastFanProps = {
  history: CutSeries;
  forecast: ForecastSeries;
  width?: number;
  height?: number;
  showBand?: boolean;
  showThermalStrip?: boolean;
  showCaption?: boolean;
  className?: string;
};

export default function D3ForecastFan({
  history,
  forecast,
  width = 640,
  height = 240,
  showBand = true,
  showThermalStrip = true,
  showCaption = true,
  className,
}: D3ForecastFanProps) {
  const margin = { top: 12, right: 16, bottom: 28, left: 36 };
  const innerW = Math.max(0, width - margin.left - margin.right);
  const innerH = Math.max(0, height - margin.top - margin.bottom - (showThermalStrip ? 18 : 0));

  const hist = useMemo(() => history.map((d) => ({ t: d.t instanceof Date ? d.t : new Date(d.t), v: d.cuts })), [history]);
  const fc = useMemo(
    () => forecast.map((d) => ({ t: d.t instanceof Date ? d.t : new Date(d.t), e: d.expected, p10: d.p10, p90: d.p90 })),
    [forecast]
  );

  const xDomain = useMemo(() => {
    const start = hist[0]?.t ?? new Date();
    const end = fc[fc.length - 1]?.t ?? hist[hist.length - 1]?.t ?? new Date();
    return [start, end] as [Date, Date];
  }, [hist, fc]);

  const yMax = useMemo(() => {
    const m1 = d3.max(hist, (d) => d.v) || 0;
    const m2 = d3.max(fc, (d) => Math.max(d.e, d.p10 ?? 0, d.p90 ?? 0)) || 0;
    return Math.max(m1, m2) * 1.15;
  }, [hist, fc]);

  const x = useMemo(() => d3.scaleTime().domain(xDomain).range([0, innerW]), [xDomain, innerW]);
  const y = useMemo(() => d3.scaleLinear().domain([0, yMax]).nice().range([innerH, 0]), [yMax, innerH]);

  const lineHist = useMemo(
    () => d3.line<{ t: Date; v: number }>().x((d) => x(d.t)).y((d) => y(d.v)).curve(d3.curveMonotoneX),
    [x, y]
  );

  const lineExp = useMemo(
    () => d3.line<{ t: Date; e: number }>().x((d) => x(d.t)).y((d) => y(d.e)).curve(d3.curveMonotoneX),
    [x, y]
  );

  const areaBand = useMemo(
    () =>
      d3
        .area<{ t: Date; p10?: number; p90?: number }>()
        .x((d) => x(d.t))
        .y0((d) => y(d.p10 ?? d3.min(fc, (r) => r.p10 ?? r.e) ?? 0))
        .y1((d) => y(d.p90 ?? d3.max(fc, (r) => r.p90 ?? r.e) ?? 0))
        .curve(d3.curveMonotoneX),
    [x, y, fc]
  );

  // Thermal strip intensity from expected deltas
  const thermal = useMemo(() => {
    if (!showThermalStrip) return [] as { x: number; color: string }[];
    const deltas = fc.map((d, i) => (i === 0 ? 0 : d.e - fc[i - 1].e));
    const absMax = d3.max(deltas, (d) => Math.abs(d)) || 1;
    const color = d3.scaleLinear<string>().domain([0, absMax]).range(['#fef3c7', '#f59e0b']);
    return fc.map((d, i) => ({ x: x(d.t), color: color(Math.abs(deltas[i] || 0)) }));
  }, [fc, x, showThermalStrip]);

  return (
    <figure className={className} aria-label="Forecasted AI-driven role cuts with uncertainty band">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="auto" role="img">
        <defs>
          <linearGradient id="fan-band" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#dc2626" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#fecaca" stopOpacity="0.08" />
          </linearGradient>
          <filter id="danger-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
            <feColorMatrix type="matrix" values="1 0 0 0 0.8  0 0 0 0 0  0 0 0 0 0  0 0 0 18 -7" />
          </filter>
        </defs>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* gridlines */}
          {y.ticks(4).map((gy, i) => (
            <line key={i} x1={0} x2={innerW} y1={y(gy)} y2={y(gy)} stroke="rgba(127,29,29,0.15)" strokeWidth={1} />
          ))}

          {/* history line */}
          <path d={lineHist(hist) || undefined} fill="none" stroke="#dc2626" strokeWidth={2} />

          {/* forecast band */}
          {showBand && <path d={areaBand(fc) || undefined} fill="url(#fan-band)" />}

          {/* forecast expected line */}
          <path d={lineExp(fc) || undefined} fill="none" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 3" style={{ filter: 'url(#danger-glow)' }} />
          
          {/* warning indicators for high-risk forecast points */}
          {fc.map((d, i) => {
            const prevIndex = Math.max(0, i - 1);
            const delta = i > 0 ? ((d.e - fc[prevIndex].e) / fc[prevIndex].e) * 100 : 0;
            if (delta > 20) {
              return (
                <g key={`warning-${i}`} transform={`translate(${x(d.t)},${y(d.e) - 12})`}>
                  <path d="M0,-5 L3,3 L-3,3 Z" fill="#b91c1c" />
                  <circle cx="0" cy="-1" r="0.8" fill="#fff" />
                </g>
              );
            }
            return null;
          })}

          {/* axes ticks */}
          {x.ticks(4).map((t, i) => (
            <text key={i} x={x(t)} y={innerH + 16} textAnchor="middle" fontSize={10} fill="#64748b" fontWeight={i === fc.length - 1 ? "medium" : "normal"}>
              {d3.timeFormat('%b %y')(t as Date)}
            </text>
          ))}
          {y.ticks(3).map((t, i) => (
            <text key={i} x={-8} y={y(t)} dy={3} textAnchor="end" fontSize={10} fill="#64748b">
              {t}
            </text>
          ))}
        </g>

        {/* thermal strip */}
        {showThermalStrip && (
          <g transform={`translate(${margin.left},${height - margin.bottom - 14})`}>
            {thermal.map((cell, i) => (
              <rect key={i} x={cell.x} y={0} width={Math.max(1.5, innerW / Math.max(thermal.length, 24))} height={8} fill={cell.color} opacity={0.9} />
            ))}
          </g>
        )}
      </svg>
      {showCaption && <figcaption className="mt-2 text-xs text-red-700 font-medium">Dashed line indicates critical forecast; warning triangles show acceleration points.</figcaption>}
    </figure>
  );
}
