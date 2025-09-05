"use client";

import React, { useMemo, useId } from 'react';
import { DataDrivenInsightsModel } from '@/components/insights/types';
import { KpiTile } from '@/components/insights/infographic/kpi-tile';
import { ExposureGauge } from './charts/exposure/exposure-gauge';
import { Info, PieChart, AlertCircle, ExternalLink } from 'lucide-react';
import { buildCareerRiskVM, DEFAULT_THRESHOLDS } from '@/app/businessidea/tabs/job-risk/data-adapters/career-risk-adapter';

export interface CareerRiskSummaryCardProps {
  insights?: DataDrivenInsightsModel;
  title?: string;
  thresholds?: { lowMax: number; highMin: number };
  className?: string;
  loading?: boolean;
  error?: string;
  slots?: {
    headerRight?: React.ReactNode;
    footer?: React.ReactNode;
  }
}

export function CareerRiskSummaryCard({
  insights,
  title = 'Career Risk Summary',
  thresholds = DEFAULT_THRESHOLDS,
  className = '',
  loading = false,
  error,
  slots
}: CareerRiskSummaryCardProps) {
  const contextHeadingId = useId();

  const vm = useMemo(() => {
    if (!insights) return null;
    return buildCareerRiskVM(insights, { thresholds, topDrivers: 3 });
  }, [insights, thresholds]);

  if (loading) {
    return (
      <div className={`card-elevated p-4 animate-fade-in ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-accent-100 p-2 rounded-full">
            <PieChart className="h-5 w-5 text-accent-600" />
          </div>
          <h3 className="text-subheading text-primary">{title}</h3>
        </div>
        <div className="space-y-3">
          <div className="h-6 w-40 rounded bg-neutral-200" />
          <div className="h-36 w-full rounded bg-neutral-200" />
          <div className="grid grid-cols-3 gap-3">
            <div className="h-16 rounded bg-neutral-200" />
            <div className="h-16 rounded bg-neutral-200" />
            <div className="h-16 rounded bg-neutral-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`card-elevated overflow-hidden ${className}`}>
        <div className="px-4 py-3 border-b border-default">
          <h3 className="text-heading text-primary">{title}</h3>
        </div>
        <div className="p-4">
          <div className="card-base p-4">
            <p className="text-primary">{error}</p>
            <p className="text-body mt-2 text-secondary">Please try again or contact support if the issue persists.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!insights || !vm) {
    return (
      <div className={`card-elevated p-4 ${className}`}>
        <div className="flex items-center gap-3 mb-2">
          <AlertCircle className="h-5 w-5 text-secondary" />
          <h3 className="text-subheading text-primary">{title}</h3>
        </div>
        <p className="text-body text-secondary">No data available. Generate insights to view your career risk summary.</p>
      </div>
    );
  }

  const { careerRiskIndex, buckets, drivers } = vm;

  const severityLabel: 'Low' | 'Moderate' | 'High' = careerRiskIndex > thresholds.highMin
    ? 'High'
    : careerRiskIndex > thresholds.lowMax
      ? 'Moderate'
      : 'Low';

  const severityClass = `badge-base ${
    severityLabel === 'High' ? 'badge-error' : severityLabel === 'Moderate' ? 'badge-warning' : 'badge-success'
  }`;

  return (
    <div className={`card-elevated overflow-hidden animate-fade-in ${className}`}>
      <div className="px-4 py-3 border-b border-default">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-heading text-primary">{title}</h3>
            <span className={severityClass} aria-label={`Overall career risk: ${severityLabel}`}>
              {severityLabel}
            </span>
          </div>
          {slots?.headerRight ?? null}
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Donut/Ring showing overall career risk index */}
          <div className="card-base p-4 rounded-lg border border-default">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="h-5 w-5 text-secondary" />
              <h4 className="text-subheading text-primary">Overall Career Risk</h4>
            </div>
            <div className="flex justify-center">
              <ExposureGauge 
                value={careerRiskIndex} 
                size={180}
                ariaLabel={`Overall career risk gauge showing ${careerRiskIndex}% (${severityLabel})`}
              />
            </div>
            <p className="text-body-sm text-secondary text-center mt-2">Aggregated risk derived from your occupation and task exposure</p>
          </div>

          {/* Right: KPI tiles for bucketized exposure distribution */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <KpiTile title="Low Exposure" value={`${buckets.percents.low}%`} emphasis="success" caption={`${buckets.low} tasks`} />
            <KpiTile title="Moderate" value={`${buckets.percents.moderate}%`} emphasis="warning" caption={`${buckets.moderate} tasks`} />
            <KpiTile title="High" value={`${buckets.percents.high}%`} emphasis="error" caption={`${buckets.high} tasks`} />
          </div>
        </div>

        {/* Contextual drivers and sources */}
        <div className="mt-6 space-y-3" role="region" aria-labelledby={contextHeadingId}>
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-secondary" />
            <h4 id={contextHeadingId} className="text-label text-primary">Context</h4>
          </div>

          {drivers && drivers.length > 0 && (
            <div className="card-base p-3 rounded-lg border border-default">
              <h5 className="text-label mb-2 text-primary">Top Risk Drivers</h5>
              <ul role="list" className="list-disc pl-5 space-y-1">
                {drivers.map((d, i) => (
                  <li key={i} role="listitem" className="text-body text-primary">{d}</li>
                ))}
              </ul>
            </div>
          )}

          {insights?.sources && insights.sources.length > 0 && (
            <div className="card-base p-3 rounded-lg border border-default">
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="h-3.5 w-3.5 text-secondary" />
                <span className="text-label text-primary">Sources</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2" role="list">
                {insights.sources.slice(0, 2).map((s, idx) => (
                  <div key={idx} role="listitem" className="flex items-center gap-2 p-2 rounded border border-default bg-surface">
                    <div className="bg-surface p-0.5 rounded-full border border-default">
                      <ExternalLink className="h-3.5 w-3.5 text-brand" />
                    </div>
                    {s.url ? (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-body-sm link-primary focus-ring rounded"
                      >
                        {s.title}
                      </a>
                    ) : (
                      <span className="text-body-sm text-primary">{s.title}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {slots?.footer ?? null}
        </div>
      </div>

      <div className="px-4 py-2 bg-surface border-t border-default text-body-sm text-secondary">
        Aggregation uses exposure buckets (Low ≤ {thresholds.lowMax}%, High ≥ {thresholds.highMin}%)
      </div>
    </div>
  );
}
