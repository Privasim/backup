// File: src/components/insights/infographic/ring-progress.tsx
"use client";

import React from "react";

export interface RingProgressProps {
  value: number; // 0-100
  size?: number; // px
  thickness?: number; // px
  trackColor?: string;
  barColor?: string;
  label?: string;
  className?: string;
}

export function RingProgress({
  value,
  size = 96,
  thickness = 10,
  trackColor = "var(--neutral-200)",
  barColor = "var(--primary-600)",
  label,
  className,
}: RingProgressProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const radius = Math.max(1, (size - thickness) / 2);
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className={className} style={{ width: size, height: size }} aria-label={label || `Progress ${clamped}%`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={thickness}
          fill="none"
          strokeLinecap="round"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={barColor}
          strokeWidth={thickness}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset var(--transition-slow)" }}
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize={Math.max(12, size * 0.24)}
          fontWeight={700}
          fill="var(--neutral-800)"
        >
          {clamped}%
        </text>
      </svg>
      {label ? (
        <div className="mt-1 text-center text-body-sm text-[color:var(--neutral-600)]">{label}</div>
      ) : null}
    </div>
  );
}
