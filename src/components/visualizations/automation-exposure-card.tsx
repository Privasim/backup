"use client";

import React, { useMemo, useState, useCallback, useId, useEffect } from 'react';
import { DataDrivenInsightsModel } from '../insights/types';
import { AutomationExposureBar } from './automation-exposure-bar';
import { AlertCircle, Info, ChevronDown, ChevronUp, Copy, Check, ExternalLink } from 'lucide-react';

interface AutomationExposureCardProps {
  insights?: DataDrivenInsightsModel;
  title?: string;
  topN?: number;
  minExposure?: number;
  className?: string;
  loading?: boolean;
  error?: string;
}

export function AutomationExposureCard({
  insights,
  title = 'Automation Exposure',
  topN = 8,
  minExposure = 0,
  className = '',
  loading = false,
  error
}: AutomationExposureCardProps) {
  const contextHeadingId = useId();
  // Adapter: insights -> dataset mapping with memoization
  const barItems = useMemo(() => {
    if (!insights?.automationExposure || insights.automationExposure.length === 0) {
      return [];
    }
    
    return insights.automationExposure
      .map(item => ({
        label: item.task,
        value: Math.max(0, Math.min(100, item.exposure)) // Clamp to 0-100
      }))
      .filter(item => item.value >= minExposure)
      .sort((a, b) => b.value - a.value) // Sort descending by exposure
      .slice(0, topN);
  }, [insights, topN, minExposure]);
  
  const isEmpty = barItems.length === 0;

  // Debug logging to help identify data/filters issues mirroring CostComparisonCard's approach
  useEffect(() => {
    if (!insights) {
      console.debug('AutomationExposureCard: insights are missing');
      return;
    }
    const raw = insights.automationExposure ?? [];
    if (raw.length === 0) {
      console.debug('AutomationExposureCard: no automationExposure data found in insights');
    }
    if (barItems.length === 0 && raw.length > 0) {
      const sample = raw.slice(0, 5).map(i => ({ task: i.task, exposure: i.exposure }));
      console.debug('AutomationExposureCard: items filtered out or below threshold', {
        minExposure,
        topN,
        rawCount: raw.length,
        sample,
      });
    }
  }, [insights, barItems, minExposure, topN]);

  // Derived context statistics (based on items after filtering and slicing for display)
  const contextStats = useMemo(() => {
    const values = barItems.map(i => i.value);
    const total = values.length;
    if (total === 0) {
      return {
        topTaskLabel: '',
        topTaskValue: 0,
        avg: 0,
        median: 0,
        p90: 0,
        counts: { high: 0, moderate: 0, low: 0, total: 0 },
        filteredEligible: 0,
        truncatedFrom: 0
      };
    }

    const sortedAsc = [...values].sort((a, b) => a - b);
    const avg = Math.round(values.reduce((a, b) => a + b, 0) / total);
    const median = total % 2 === 1
      ? sortedAsc[(total - 1) / 2]
      : Math.round((sortedAsc[total / 2 - 1] + sortedAsc[total / 2]) / 2);
    const p90Index = Math.max(0, Math.ceil(0.9 * total) - 1);
    const p90 = sortedAsc[p90Index];

    const counts = values.reduce(
      (acc, v) => {
        if (v > 70) acc.high += 1;
        else if (v > 40) acc.moderate += 1;
        else acc.low += 1;
        return acc;
      },
      { high: 0, moderate: 0, low: 0 }
    );

    // Determine filtering/truncation based on full dataset
    const full = insights?.automationExposure ?? [];
    const eligible = full.filter(i => Math.max(0, Math.min(100, i.exposure)) >= minExposure);
    const filteredEligible = eligible.length;
    const truncatedFrom = filteredEligible > topN ? filteredEligible : 0;

    return {
      topTaskLabel: barItems[0]?.label ?? '',
      topTaskValue: barItems[0]?.value ?? 0,
      avg,
      median,
      p90,
      counts: { ...counts, total },
      filteredEligible,
      truncatedFrom
    };
  }, [barItems, insights, minExposure, topN]);

  // Expand/Collapse and Copy-to-Clipboard
  const [expanded, setExpanded] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const contextCopyText = useMemo(() => {
    const parts: string[] = [];
    if (insights?.narratives?.automationNarrative) {
      parts.push(`Narrative: ${insights.narratives.automationNarrative}`);
    }
    if (contextStats.topTaskLabel) {
      parts.push(`Top task: ${contextStats.topTaskLabel} (${contextStats.topTaskValue}%)`);
    }
    parts.push(
      `Average exposure: ${contextStats.avg}%`,
      `Median: ${contextStats.median}%`,
      `P90: ${contextStats.p90}%`,
      `Counts — High: ${contextStats.counts.high}, Moderate: ${contextStats.counts.moderate}, Low: ${contextStats.counts.low}, Total: ${contextStats.counts.total}`
    );
    if (minExposure > 0) {
      parts.push(`Filtered by minimum exposure ≥ ${minExposure}%`);
    }
    if (contextStats.truncatedFrom > 0) {
      parts.push(`Showing top ${topN} of ${contextStats.truncatedFrom} eligible tasks`);
    }
    return parts.join('\n');
  }, [contextStats, insights, minExposure, topN]);

  const handleCopy = useCallback(() => {
    navigator.clipboard?.writeText(contextCopyText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {
        // Silently ignore copy failures
      });
  }, [contextCopyText]);
 
  // Derived severity and top-3 tasks for additional context
  const severityLabel = useMemo<'Low' | 'Moderate' | 'High'>(() => {
    const a = contextStats.avg;
    return a > 70 ? 'High' : a > 40 ? 'Moderate' : 'Low';
  }, [contextStats.avg]);
  const severityClass = useMemo(() => (
    severityLabel === 'High'
      ? 'badge-base badge-error'
      : severityLabel === 'Moderate'
      ? 'badge-base badge-warning'
      : 'badge-base badge-success'
  ), [severityLabel]);
  const topThree = useMemo(() => barItems.slice(0, Math.min(3, barItems.length)), [barItems]);
  
  // Import the CardSkeletonLoader component
  const { CardSkeletonLoader } = require('@/components/ui/SkeletonLoader');
  
  if (loading) {
    return (
      <div className={`card-elevated overflow-hidden ${className}`}>
        <div className="px-4 py-3 border-b border-default">
          <h3 className="text-heading text-primary">{title}</h3>
        </div>
        <div className="p-4">
          <CardSkeletonLoader />
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
  
  return (
    <div className={`card-elevated overflow-hidden animate-fade-in ${className}`}>
      <div className="px-4 py-3 border-b border-default">
        <h3 className="text-heading text-primary">{title}</h3>
      </div>
      
      <div className="p-4">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-8 w-8 text-secondary mb-2" />
            <p className="text-body text-secondary">No automation exposure data available</p>
            <p className="text-body-sm text-secondary mt-1">Complete your profile analysis to see insights</p>
          </div>
        ) : (
          <AutomationExposureBar 
            items={barItems} 
            maxBars={topN}
            ariaLabel={`${title} chart showing automation risk for top ${topN} tasks`}
          />
        )}

        {/* Contextual Statements */}
        {!isEmpty && (
          <div className="mt-4" role="region" aria-labelledby={contextHeadingId}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-secondary" />
                <h4 id={contextHeadingId} className="text-label text-primary">Context</h4>
                <span className={`ml-2 ${severityClass}`} aria-label={`Overall exposure: ${severityLabel}`}>
                  Overall: {severityLabel}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="btn-ghost btn-sm focus-ring inline-flex items-center gap-1"
                  aria-label="Copy context"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span className="text-body-sm text-secondary">{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExpanded(prev => !prev)}
                  aria-expanded={expanded}
                  className="btn-ghost btn-sm focus-ring inline-flex items-center gap-1"
                >
                  {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  <span className="text-body-sm text-secondary">{expanded ? 'Collapse' : 'Expand'}</span>
                </button>
              </div>
            </div>

            {expanded && insights?.narratives?.automationNarrative && (
              <div className="bg-hero rounded-lg p-2 border border-default mt-2">
                <p className="text-body leading-relaxed text-primary">{insights.narratives.automationNarrative}</p>
              </div>
            )}

            {expanded && (
              <ul role="list" className="mt-2 space-y-1">
                {contextStats.topTaskLabel && (
                  <li role="listitem" className="text-body text-primary">
                    <span className="font-medium text-primary">Top task:</span> {contextStats.topTaskLabel} ({contextStats.topTaskValue}%)
                  </li>
                )}
                {topThree.length > 0 && (
                  <li role="listitem" className="text-body text-primary">
                    <span className="font-medium text-primary">Top tasks:</span> {topThree.map(t => `${t.label} (${t.value}%)`).join(', ')}
                  </li>
                )}
                <li role="listitem" className="text-body text-primary">
                  <span className="font-medium text-primary">Average exposure:</span> {contextStats.avg}%
                </li>
                <li role="listitem" className="text-body text-primary">
                  <span className="font-medium text-primary">Median:</span> {contextStats.median}% · <span className="font-medium text-primary">P90:</span> {contextStats.p90}%
                </li>
                <li role="listitem" className="text-body text-primary">
                  <span className="font-medium text-primary">Counts:</span> High {contextStats.counts.high}, Moderate {contextStats.counts.moderate}, Low {contextStats.counts.low} (Total {contextStats.counts.total})
                </li>
                {(minExposure > 0 || contextStats.truncatedFrom > 0) && (
                  <li role="listitem" className="text-body-sm text-secondary">
                    {minExposure > 0 && (<span className="mr-2">Filtered by minimum exposure ≥ {minExposure}%.</span>)}
                    {contextStats.truncatedFrom > 0 && (<span>Showing top {topN} of {contextStats.truncatedFrom} eligible tasks.</span>)}
                  </li>
                )}
              </ul>
            )}

            {expanded && insights?.sources && insights.sources.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="bg-surface p-1 rounded-full border border-default">
                    <ExternalLink className="h-3.5 w-3.5 text-secondary" />
                  </div>
                  <span className="text-label-sm text-primary">Sources</span>
                </div>
                <div className="grid gap-1 sm:grid-cols-2" role="list">
                  {insights.sources.slice(0, 2).map((s, idx) => (
                    <div key={idx} role="listitem" className="flex items-center gap-2 p-1.5 rounded border border-default bg-surface">
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
          </div>
        )}
      </div>
      
      <div className="px-4 py-2 bg-surface border-t border-default text-body-sm text-secondary">
        Showing top {topN} tasks with highest automation exposure
      </div>
    </div>
  );
}
