"use client";

import React, { useMemo, useId } from 'react';
import { DataDrivenInsightsModel } from '@/components/insights/types';
import { KpiTile } from '@/components/insights/infographic/kpi-tile';
import { ExposureGauge } from './charts/exposure/exposure-gauge';
import { Info, PieChart, AlertCircle, ExternalLink, TrendingUp } from 'lucide-react';
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
      <div className={`bg-white p-4 animate-fade-in ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-accent-100 p-1.5 rounded-full">
            <PieChart className="h-4 w-4 text-accent-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-800">{title}</h3>
        </div>
        <div className="space-y-3">
          <div className="h-4 w-32 rounded bg-neutral-200" />
          <div className="h-32 w-full rounded bg-neutral-200" />
          <div className="flex flex-col space-y-2">
            <div className="h-10 rounded bg-neutral-200" />
            <div className="h-10 rounded bg-neutral-200" />
            <div className="h-10 rounded bg-neutral-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white p-4 ${className}`}>
        <div className="mb-3">
          <h3 className="text-lg font-medium text-gray-800">{title}</h3>
        </div>
        <div className="p-3 bg-red-50 rounded-md">
          <p className="text-base text-red-700">{error}</p>
          <p className="text-sm mt-2 text-gray-700">Please try again or contact support if the issue persists.</p>
        </div>
      </div>
    );
  }

  if (!insights || !vm) {
    return (
      <div className={`bg-white p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="h-4 w-4 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-800">{title}</h3>
        </div>
        <p className="text-base text-gray-600">No data available. Generate insights to view your career risk summary.</p>
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
    <div className={`bg-white p-4 animate-fade-in ${className}`}>
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-gray-800">{title}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${severityLabel === 'High' ? 'bg-red-100 text-red-800' : severityLabel === 'Moderate' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`} aria-label={`Overall career risk: ${severityLabel}`}>
              {severityLabel}
            </span>
          </div>
          {slots?.headerRight ?? null}
        </div>
      </div>

      <div className="space-y-4">
        {/* Donut/Ring showing overall career risk index */}
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="flex items-center gap-1.5 mb-2">
            <PieChart className="h-4 w-4 text-gray-700" />
            <h4 className="text-base font-medium text-gray-800">Overall Career Risk</h4>
          </div>
          <div className="flex justify-center mb-3">
            <ExposureGauge 
              value={careerRiskIndex} 
              size={150}
              ariaLabel={`Overall career risk gauge showing ${careerRiskIndex}% (${severityLabel})`}
            />
          </div>
          <p className="text-xs text-gray-600 text-center">
            This score represents your aggregated career risk based on occupation trends and task automation potential.
            {severityLabel === 'High' ? ' Your profile shows significant exposure to automation.' : 
             severityLabel === 'Moderate' ? ' Your profile shows moderate exposure to automation.' : 
             ' Your profile shows relatively low exposure to automation.'}
          </p>
        </div>

        {/* KPI tiles for bucketized exposure distribution - now vertical and more compact */}
        <div className="flex flex-col space-y-2">
          <h4 className="text-base font-medium text-gray-800">Task Exposure Breakdown</h4>
          <div className="bg-green-50 p-2.5 rounded-md">
            <div className="flex justify-between items-center">
              <div>
                <h5 className="text-sm font-medium text-green-800">Low Exposure</h5>
                <p className="text-xs text-gray-600">{buckets.low} tasks</p>
              </div>
              <span className="text-lg font-bold text-green-700">{buckets.percents.low}%</span>
            </div>
          </div>
          <div className="bg-amber-50 p-2.5 rounded-md">
            <div className="flex justify-between items-center">
              <div>
                <h5 className="text-sm font-medium text-amber-800">Moderate Exposure</h5>
                <p className="text-xs text-gray-600">{buckets.moderate} tasks</p>
              </div>
              <span className="text-lg font-bold text-amber-700">{buckets.percents.moderate}%</span>
            </div>
          </div>
          <div className="bg-red-50 p-2.5 rounded-md">
            <div className="flex justify-between items-center">
              <div>
                <h5 className="text-sm font-medium text-red-800">High Exposure</h5>
                <p className="text-xs text-gray-600">{buckets.high} tasks</p>
              </div>
              <span className="text-lg font-bold text-red-700">{buckets.percents.high}%</span>
            </div>
          </div>
        </div>

        {/* Enhanced contextual information */}
        <div className="bg-gray-50 p-3 rounded-md" role="region" aria-labelledby={contextHeadingId}>
          <div className="flex items-center gap-1.5 mb-2">
            <Info className="h-4 w-4 text-gray-700" />
            <h4 id={contextHeadingId} className="text-base font-medium text-gray-800">Understanding Your Risk Profile</h4>
          </div>
          
          <div className="space-y-2">
            <p className="text-xs text-gray-700">
              Your career risk assessment is based on two key factors: the overall risk to your occupation 
              and the specific tasks you perform. Tasks with higher automation exposure contribute more to your risk profile.
            </p>

            {drivers && drivers.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-gray-700" />
                  <h5 className="text-sm font-medium text-gray-800">Key Risk Factors</h5>
                </div>
                <ul role="list" className="list-disc pl-4 space-y-1">
                  {drivers.map((d, i) => (
                    <li key={i} role="listitem" className="text-xs text-gray-700">{d}</li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-gray-600">Consider developing skills that complement these areas or exploring adjacent career paths less affected by automation.</p>
              </div>
            )}

            {insights?.sources && insights.sources.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <ExternalLink className="h-3.5 w-3.5 text-gray-700" />
                  <h5 className="text-sm font-medium text-gray-800">Research Sources</h5>
                </div>
                <div className="flex flex-col space-y-1.5" role="list">
                  {insights.sources.slice(0, 2).map((s, idx) => (
                    <div key={idx} role="listitem" className="flex items-center gap-2 p-2 rounded-md bg-white">
                      <ExternalLink className="h-3.5 w-3.5 text-blue-600" />
                      {s.url ? (
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                        >
                          {s.title}
                        </a>
                      ) : (
                        <span className="text-xs text-gray-700">{s.title}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {slots?.footer ?? null}
        </div>
      </div>

      <div className="mt-3 pt-2 text-xs text-gray-500">
        Analysis methodology: Tasks are categorized as Low (≤{thresholds.lowMax}%), Moderate, or High (≥{thresholds.highMin}%) exposure based on automation potential.
      </div>
    </div>
  );
}
