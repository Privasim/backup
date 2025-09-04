// File: src/components/insights/infographic/kpi-tile.tsx
"use client";

import React from "react";

export interface KpiTileProps {
  title: string;
  value: string | number;
  caption?: string;
  icon?: React.ReactNode;
  emphasis?: "primary" | "neutral" | "success" | "error" | "warning";
  className?: string;
}

export function KpiTile({
  title,
  value,
  caption,
  icon,
  emphasis = "primary",
  className,
}: KpiTileProps) {
  const colorMap: Record<NonNullable<KpiTileProps["emphasis"]>, { bg: string; fg: string; ring: string }> = {
    primary: { bg: "var(--primary-50)", fg: "var(--primary-700)", ring: "var(--primary-200)" },
    neutral: { bg: "var(--neutral-50)", fg: "var(--neutral-700)", ring: "var(--neutral-200)" },
    success: { bg: "var(--success-50)", fg: "var(--success-700)", ring: "var(--success-200)" },
    warning: { bg: "var(--warning-50)", fg: "var(--warning-700)", ring: "var(--warning-200)" },
    error: { bg: "var(--error-50)", fg: "var(--error-700)", ring: "var(--error-200)" },
  };

  const colors = colorMap[emphasis];

  return (
    <div
      className={`card-elevated p-3 sm:p-4 animate-fade-in ${className || ""}`}
      style={{ background: "white", borderColor: colors.ring }}
      role="group"
      aria-label={`${title} ${value}`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="text-label" style={{ color: "var(--neutral-600)" }}>{title}</div>
        {icon ? <div className="ml-2" aria-hidden>{icon}</div> : null}
      </div>
      <div className="flex items-end gap-2">
        <div className="text-title" style={{ color: colors.fg }}>{value}</div>
        {caption ? (
          <div className="text-body-sm" style={{ color: "var(--neutral-500)" }}>{caption}</div>
        ) : null}
      </div>
    </div>
  );
}
