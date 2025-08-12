"use client";

import React from 'react';
import { InsightsBundle } from '../types';

export type InsightsPanelProps = {
  insights: InsightsBundle;
  loading?: boolean;
  className?: string;
};

export default function InsightsPanel({ insights, loading = false, className }: InsightsPanelProps) {
  return (
    <aside className={className} aria-label="Data-driven insights summarizing chart takeaways">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-900">Insights</h3>

        {/* Global KPIs */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          {loading
            ? Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="rounded-lg h-14 bg-slate-100" />
              ))
            : insights.global.map((kpi, i) => (
                <div key={i} className="rounded-lg border border-slate-200 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">{kpi.label}</div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <div className="text-lg font-semibold text-slate-900">{kpi.value}</div>
                    {kpi.deltaLabel && (
                      <div
                        className={
                          'text-[11px] px-1.5 py-0.5 rounded-md ' +
                          (kpi.tone === 'negative'
                            ? 'bg-red-500/10 text-red-600'
                            : kpi.tone === 'positive'
                            ? 'bg-amber-500/10 text-amber-700'
                            : 'bg-slate-500/10 text-slate-600')
                        }
                      >
                        {kpi.deltaLabel}
                      </div>
                    )}
                  </div>
                </div>
              ))}
        </div>

        {/* Sections */}
        <div className="mt-4 space-y-4">
          {renderSection(loading, insights.velocity)}
          {renderSection(loading, insights.skills)}
          {renderSection(loading, insights.forecast)}
        </div>
      </div>
    </aside>
  );
}

function renderSection(loading: boolean, s: { title: string; bullets: string[] }) {
  if (loading) {
    return <div className="rounded-lg h-16 bg-slate-100" />;
  }
  return (
    <section>
      <h4 className="text-xs font-medium text-slate-700">{s.title}</h4>
      <ul className="mt-1 space-y-1 text-xs text-slate-600">
        {s.bullets.map((b, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-[6px] inline-block h-1.5 w-1.5 rounded-full bg-orange-400/60" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
