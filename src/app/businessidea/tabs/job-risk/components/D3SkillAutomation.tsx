"use client";

import React, { useMemo } from 'react';
import * as d3 from 'd3';
import { RoleSkillMatrix, SkillImpacts } from '../types';

export type D3SkillAutomationProps = {
  impacts: SkillImpacts;
  matrix?: RoleSkillMatrix;
  mode?: 'auto' | 'radial' | 'chord';
  highlightSkills?: string[];
  width?: number;
  height?: number;
  showLegend?: boolean;
  showCaption?: boolean;
  className?: string;
};

export default function D3SkillAutomation({
  impacts,
  matrix,
  mode = 'radial',
  highlightSkills = [],
  width = 640,
  height = 260,
  showLegend = false,
  showCaption = true,
  className,
}: D3SkillAutomationProps) {
  // For placeholder, implement radial bars (default). Chord is optional later.
  const margin = { top: 16, right: 16, bottom: 24, left: 16 };
  const w = width - margin.left - margin.right;
  const h = height - margin.top - margin.bottom;
  const r = Math.min(w, h) / 2 - 8;
  const center = { x: margin.left + w / 2, y: margin.top + h / 2 };

  const data = useMemo(() => impacts.map((d) => ({ id: d.skillGroupId, v: d.impact })), [impacts]);

  const angle = useMemo(() => d3.scaleBand<string>().domain(data.map((d) => d.id)).range([0, Math.PI * 2]).padding(0.08), [data]);
  const radius = useMemo(() => d3.scaleLinear().domain([0, 1]).range([r * 0.2, r]), [r]);
  const color = useMemo(
    () => d3.scaleLinear<string>().domain([0, 0.5, 0.7, 1]).range(['#fef3c7', '#f97316', '#ea580c', '#b91c1c']).clamp(true),
    []
  );

  const reducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Pulse animation keyframes for high-impact skills
  React.useEffect(() => {
    if (typeof document !== 'undefined' && !reducedMotion) {
      const style = document.createElement('style');
      style.innerHTML = `
        @keyframes pulse-danger {
          0% { opacity: 0.95; }
          50% { opacity: 1; filter: drop-shadow(0 0 3px #dc2626); }
          100% { opacity: 0.95; }
        }
        .danger-pulse {
          animation: pulse-danger 2s infinite ease-in-out;
        }
      `;
      document.head.appendChild(style);
      return () => { document.head.removeChild(style); };
    }
  }, [reducedMotion]);

  return (
    <figure className={className} aria-label="Skill clusters impacted by AI automation">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="auto" role="img">
        <defs>
          <filter id="soft-glow-2" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g transform={`translate(${center.x},${center.y})`}>
          {/* radial grid rings */}
          {d3.range(3).map((i) => (
            <circle key={i} r={r * (0.35 + (i * 0.65) / 2)} fill="none" stroke="rgba(127,29,29,0.12)" strokeWidth={1} />
          ))}

          {/* bars */}
          {data.map((d, i) => {
            const a0 = (angle(d.id) ?? 0) - angle.bandwidth() / 2;
            const a1 = (angle(d.id) ?? 0) + angle.bandwidth() / 2;
            const arc = d3.arc().innerRadius(radius(0)).outerRadius(radius(d.v)).startAngle(a0).endAngle(a1);
            const isHL = highlightSkills.includes(d.id);
            return (
              <path
                key={d.id}
                d={arc({} as any) || undefined}
                fill={color(d.v)}
                opacity={isHL ? 1 : 0.95}
                stroke={d.v >= 0.7 ? 'rgba(185,28,28,0.8)' : 'transparent'}
                strokeWidth={d.v >= 0.7 ? 1 : 0}
                style={{
                  filter: d.v >= 0.7 ? 'url(#soft-glow-2)' : undefined,
                }}
                className={!reducedMotion && d.v >= 0.7 ? 'danger-pulse' : undefined}
              />
            );
          })}

          {/* labels (minimal) */}
          {data.map((d) => {
            const a = angle(d.id) ?? 0;
            const lx = Math.cos(a) * (r + 10);
            const ly = Math.sin(a) * (r + 10);
            const anchor = Math.cos(a) > 0 ? 'start' : 'end';
            return (
              <text key={`lbl-${d.id}`} x={lx} y={ly} textAnchor={anchor} fontSize={10} fill={d.v >= 0.7 ? "#b91c1c" : "#64748b"} fontWeight={d.v >= 0.7 ? "medium" : "normal"}>
                {d.id}
              </text>
            );
          })}
        </g>
      </svg>
      {showLegend && (
        <div className="mt-2 flex gap-3 text-xs text-red-700">
          <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm" style={{ background: '#fef3c7' }}></span>Low</div>
          <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm" style={{ background: '#f97316' }}></span>Medium</div>
          <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm" style={{ background: '#b91c1c' }}></span>Critical</div>
        </div>
      )}
      {showCaption && <figcaption className="mt-2 text-xs text-red-700 font-medium">Higher bars indicate critical automation exposure risk.</figcaption>}
    </figure>
  );
}
