"use client";

import React, { useMemo } from 'react';
import styles from '../jobrisk-theme.module.css';
import { Emphasis, emphasisColor, formatters } from '../jobrisk-visual-spec';
import { arc as d3Arc } from 'd3';

export interface GaugeMiniProps {
  value: number; // 0-100
  size?: number; // px
  thickness?: number; // px
  emphasis?: Emphasis;
  label?: string;
  className?: string;
}

export const GaugeMini: React.FC<GaugeMiniProps> = ({
  value,
  size = 120,
  thickness = 10,
  emphasis = 'primary',
  label,
  className,
}) => {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const color = emphasisColor(emphasis);

  const { pathBg, pathFg, viewBox, center, radius } = useMemo(() => {
    const w = size;
    const h = size;
    const r = (Math.min(w, h) / 2) - thickness / 2;
    const cx = w / 2;
    const cy = h / 2;
    const start = -Math.PI / 2; // 12 o'clock
    const endBg = start + Math.PI * 2;
    const endFg = start + (Math.PI * 2) * (v / 100);

    const arc = d3Arc().innerRadius(r - thickness).outerRadius(r);

    type ArcInput = { startAngle: number; endAngle: number; innerRadius: number; outerRadius: number };
    const bgInput: ArcInput = { startAngle: start, endAngle: endBg, innerRadius: r - thickness, outerRadius: r };
    const fgInput: ArcInput = { startAngle: start, endAngle: endFg, innerRadius: r - thickness, outerRadius: r };

    return {
      pathBg: arc(bgInput) || undefined,
      pathFg: arc(fgInput) || undefined,
      viewBox: `0 0 ${w} ${h}`,
      center: { cx, cy },
      radius: r,
    };
  }, [size, thickness, v]);

  return (
    <div className={`${styles.gaugeRoot} ${className ?? ''}`} role="img" aria-label={`Gauge ${label ?? ''}`.trim()}>
      <svg width={size} height={size} viewBox={viewBox} aria-hidden={label ? undefined : true}>
        <g transform={`translate(${center.cx}, ${center.cy})`}>
          <path d={pathBg} style={{ fill: 'var(--border)' }} />
          <path d={pathFg} fill={color} />
        </g>
      </svg>
      <div style={{ textAlign: 'center', marginTop: 4 }}>
        <div style={{ fontSize: 18, fontWeight: 600, color }}>{formatters.percent(v)}</div>
        {label && <div className={styles.muted} style={{ fontSize: 12 }}>{label}</div>}
      </div>
    </div>
  );
};
