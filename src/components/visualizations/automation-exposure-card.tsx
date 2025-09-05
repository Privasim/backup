"use client";

import React, { useMemo, useState, useCallback, useId, useEffect } from 'react';
import { DataDrivenInsightsModel } from '../insights/types';
import { AutomationExposureBar } from './automation-exposure-bar';
import { Zap, ChevronDown, ChevronUp, Copy, ExternalLink, AlertCircle, Info, PieChart, Check, BarChart3 } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { ClipboardUtils } from '../chatbox/utils/clipboard-utils';
import { ExposureGauge } from './charts/exposure/exposure-gauge';
import { calculateExposureStats, getSeverityClass, getSeverityLabel, formatExposure } from './charts/exposure/exposure-helpers';
import { KpiTile } from '../insights/infographic/kpi-tile';

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

  // Derived context statistics using the helper function
  const exposureStats = useMemo(() => {
    if (!insights?.automationExposure || insights.automationExposure.length === 0) {
      return {
        avg: 0,
        median: 0,
        p90: 0,
        counts: { high: 0, moderate: 0, low: 0, total: 0 },
        topTask: null,
        aboveThreshold: 0,
        aboveThresholdPercent: 0
      };
    }
    
    return calculateExposureStats(insights.automationExposure, minExposure);
  }, [insights, minExposure]);
  
  // Derived context statistics (based on items after filtering and slicing for display)
  const contextStats = useMemo(() => {
    const values = barItems.map(i => i.value);
    const total = values.length;
    if (total === 0) {
      return {
        topTaskLabel: '',
        topTaskValue: 0,
        avg: exposureStats.avg,
        median: exposureStats.median,
        p90: exposureStats.p90,
        counts: exposureStats.counts,
        filteredEligible: 0,
        truncatedFrom: 0
      };
    }

    // Determine filtering/truncation based on full dataset
    const full = insights?.automationExposure ?? [];
    const eligible = full.filter(i => Math.max(0, Math.min(100, i.exposure)) >= minExposure);
    const filteredEligible = eligible.length;
    const truncatedFrom = filteredEligible > topN ? filteredEligible : 0;

    return {
      topTaskLabel: barItems[0]?.label ?? '',
      topTaskValue: barItems[0]?.value ?? 0,
      avg: exposureStats.avg,
      median: exposureStats.median,
      p90: exposureStats.p90,
      counts: exposureStats.counts,
      filteredEligible,
      truncatedFrom
    };
  }, [barItems, exposureStats, insights, minExposure, topN]);

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
    ClipboardUtils.copyToClipboard(contextCopyText)
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
    return getSeverityLabel(contextStats.avg);
  }, [contextStats.avg]);
  
  const severityClass = useMemo(() => {
    return `badge-base ${getSeverityClass(severityLabel.toLowerCase())}`;
  }, [severityLabel]);
  const topThree = useMemo(() => barItems.slice(0, Math.min(3, barItems.length)), [barItems]);

  // Import the CardSkeletonLoader component
  const { CardSkeletonLoader } = require('@/components/ui/SkeletonLoader');

  if (loading) {
    return (
      <div className={`card-elevated p-4 animate-fade-in transition-all duration-300 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-accent-100 p-2 rounded-full">
            <PieChart className="h-5 w-5 text-accent-600" />
          </div>
          <h3 className="text-subheading text-primary">Automation Exposure</h3>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-6 w-full rounded-md" />
          <Skeleton className="h-24 w-full rounded-md" />
          <Skeleton className="h-24 w-full rounded-md" />
          <Skeleton className="h-4 w-1/2 rounded-md" />
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

  const validAutomationData = useMemo(() => {
    if (!insights || !insights.automationExposure) return [];
    return insights.automationExposure.filter(item => typeof item.exposure === 'number');
  }, [insights]);

  const stats = useMemo(() => {
    if (!validAutomationData.length) return { avg: 0, high: 0, medium: 0, low: 0, total: 0 };
    
    const total = validAutomationData.length;
    const sum = validAutomationData.reduce((acc, item) => acc + item.exposure, 0);
    const avg = Math.round(sum / total);
    
    const high = validAutomationData.filter(item => item.exposure > 70).length;
    const medium = validAutomationData.filter(item => item.exposure > 40 && item.exposure <= 70).length;
    const low = validAutomationData.filter(item => item.exposure <= 40).length;
    
    return { avg, high, medium, low, total };
  }, [validAutomationData]);

  const displayedTasks = useMemo(() => {
    if (!validAutomationData.length) return [];
    return expanded ? validAutomationData : validAutomationData.slice(0, topN);
  }, [validAutomationData, expanded, topN]);

  // Second handleCopy function removed to fix duplication

  return (
    <div className={`card-elevated overflow-hidden animate-fade-in ${className}`}>
      <div className="px-4 py-3 border-b border-default">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-heading text-primary">{title}</h3>
            <span className={severityClass} aria-label={`Overall exposure: ${severityLabel}`}>
              {severityLabel}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="btn-ghost btn-sm focus-ring inline-flex items-center gap-1"
              aria-label="Copy insights"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span className="text-body-sm text-secondary">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-8 w-8 text-secondary mb-2" />
            <p className="text-body text-secondary">No automation exposure data available</p>
            <p className="text-body-sm text-secondary mt-1">Complete your profile analysis to see insights</p>
          </div>
        ) : (
          <>
            {/* KPI Tiles Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <KpiTile
                title="Average Exposure"
                value={`${contextStats.avg}%`}
                emphasis={severityLabel === 'High' ? 'error' : severityLabel === 'Moderate' ? 'warning' : 'success'}
                caption="Overall automation risk"
              />
              
              <KpiTile
                title="High-risk Tasks"
                value={contextStats.counts.high}
                emphasis="error"
                caption=">70% exposure"
              />
              
              <KpiTile
                title="Tasks Assessed"
                value={contextStats.counts.total}
                emphasis="neutral"
                caption="Total tasks analyzed"
              />
              
              <KpiTile
                title="Above Threshold"
                value={`${exposureStats.aboveThresholdPercent}%`}
                emphasis="warning"
                caption="Tasks over 50% exposure"
              />
            </div>
            
            {/* Main Visualization Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Bar Chart */}
              <div className="card-base p-4 rounded-lg border border-default">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-secondary" />
                  <h4 className="text-subheading text-primary">Highest Exposure Tasks</h4>
                </div>
                <div className="mb-2">
                  <p className="text-body-sm text-secondary mb-3">Highest exposure tasks prioritized for automation</p>
                  <AutomationExposureBar 
                    items={barItems} 
                    maxBars={topN}
                    ariaLabel={`${title} chart showing automation risk for top ${topN} tasks`}
                  />
                </div>
              </div>
              
              {/* Right Column: Gauge */}
              <div className="card-base p-4 rounded-lg border border-default">
                <div className="flex items-center gap-2 mb-4">
                  <PieChart className="h-5 w-5 text-secondary" />
                  <h4 className="text-subheading text-primary">Overall Exposure</h4>
                </div>
                <div className="flex justify-center">
                  <ExposureGauge 
                    value={contextStats.avg} 
                    size={180}
                    ariaLabel={`Overall automation exposure gauge showing ${contextStats.avg}% (${severityLabel} risk)`}
                  />
                </div>
                <p className="text-body-sm text-secondary text-center mt-2">Overall exposure indicates systemic automation pressure</p>
              </div>
            </div>

            {/* Contextual Statements */}
            <div className="mt-6" role="region" aria-labelledby={contextHeadingId}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-secondary" />
                  <h4 id={contextHeadingId} className="text-label text-primary">Context & Analysis</h4>
                </div>
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

              {expanded && insights?.narratives?.automationNarrative && (
                <div className="bg-hero rounded-lg p-3 border border-default mt-3">
                  <p className="text-body leading-relaxed text-primary">{insights.narratives.automationNarrative}</p>
                </div>
              )}

              {expanded && (
                <div className="mt-3 space-y-3">
                  <div className="card-base p-3 rounded-lg border border-default">
                    <h5 className="text-label mb-2 text-primary">Key Statistics</h5>
                    <ul role="list" className="space-y-1">
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
                  </div>

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
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      <div className="px-4 py-2 bg-surface border-t border-default text-body-sm text-secondary">
        Showing top {topN} tasks with highest automation exposure
      </div>
    </div>
  );
}
