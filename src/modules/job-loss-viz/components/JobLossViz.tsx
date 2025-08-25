// File: src/modules/job-loss-viz/components/JobLossViz.tsx
'use client';

import React from 'react';
import { useJobLossData } from '../hooks/useJobLossData';
import { LineGraph } from './LineGraph';
import { RolesList } from './RolesList';
import { SourcePanel } from './SourcePanel';

interface Props {
  className?: string;
  year?: number;
}

export default function JobLossViz({ className, year = 2025 }: Props) {
  const { ytdSeries, roles, latestSources, lastUpdated, error } = useJobLossData({ year });

  return (
    <section className={className} aria-labelledby="job-loss-viz-title">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 id="job-loss-viz-title" className="text-xl md:text-2xl font-semibold text-gray-900">Global AI‑Related Job Losses (YTD) — {year}</h2>
              <p className="text-sm text-gray-500 mt-1">Curated from public reports; cumulative totals only when explicitly attributed to AI.</p>
            </div>
            <div className="shrink-0 mt-1">
              {lastUpdated ? (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Last updated: {formatDate(lastUpdated)}</span>
              ) : (
                <span className="text-xs bg-gray-50 text-gray-400 px-2 py-1 rounded">Awaiting data</span>
              )}
            </div>
          </div>

          {/* Body */}
          {error ? (
            <div className="text-sm text-red-600">Failed to load data: {error}</div>
          ) : (
            <>
              <LineGraph data={ytdSeries} height={200} className="mt-2" />

              {/* Bottom section: roles left, sources right */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <RolesList roles={roles} />
                </div>
                <div className="md:col-span-1 md:justify-self-end">
                  <SourcePanel sources={latestSources} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
}
