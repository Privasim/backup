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
      <div className={`bg-white p-6 animate-fade-in transition-all duration-300 ${className}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-accent-100 p-2 rounded-full">
            <PieChart className="h-5 w-5 text-accent-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800">Automation Exposure</h3>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-8 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-6 w-1/2 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white p-6 ${className}`}>
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="p-4 bg-red-50 rounded-lg">
          <p className="text-lg text-red-700">{error}</p>
          <p className="text-base mt-3 text-gray-700">Please try again or contact support if the issue persists.</p>
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
    <div className={`bg-white p-6 animate-fade-in ${className}`}>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-semibold text-gray-800">{title}</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${severityLabel === 'High' ? 'bg-red-100 text-red-800' : severityLabel === 'Moderate' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`} aria-label={`Overall exposure: ${severityLabel}`}>
              {severityLabel}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors inline-flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Copy insights"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="text-sm">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="space-y-8">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-10 w-10 text-gray-500 mb-4" />
            <p className="text-lg text-gray-700">No automation exposure data available</p>
            <p className="text-base text-gray-600 mt-2">Complete your profile analysis to see insights</p>
          </div>
        ) : (
          <>
            {/* KPI Tiles - Now vertical */}
            <div className="flex flex-col space-y-4">
              <h4 className="text-xl font-medium text-gray-800">Exposure Metrics</h4>
              
              <div className={`p-4 rounded-lg ${severityLabel === 'High' ? 'bg-red-50' : severityLabel === 'Moderate' ? 'bg-amber-50' : 'bg-green-50'}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="text-lg font-medium ${severityLabel === 'High' ? 'text-red-800' : severityLabel === 'Moderate' ? 'text-amber-800' : 'text-green-800'}">Average Exposure</h5>
                    <p className="text-sm text-gray-600">Overall automation risk</p>
                  </div>
                  <span className="text-2xl font-bold ${severityLabel === 'High' ? 'text-red-700' : severityLabel === 'Moderate' ? 'text-amber-700' : 'text-green-700'}">${contextStats.avg}%</span>
                </div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="text-lg font-medium text-red-800">High-risk Tasks</h5>
                    <p className="text-sm text-gray-600">{'>'} 70% exposure</p>
                  </div>
                  <span className="text-2xl font-bold text-red-700">{contextStats.counts.high}</span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="text-lg font-medium text-gray-800">Tasks Assessed</h5>
                    <p className="text-sm text-gray-600">Total tasks analyzed</p>
                  </div>
                  <span className="text-2xl font-bold text-gray-700">{contextStats.counts.total}</span>
                </div>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="text-lg font-medium text-amber-800">Above Threshold</h5>
                    <p className="text-sm text-gray-600">Tasks over 50% exposure</p>
                  </div>
                  <span className="text-2xl font-bold text-amber-700">{exposureStats.aboveThresholdPercent}%</span>
                </div>
              </div>
            </div>
            
            {/* Main Visualization Area - Now vertical */}
            <div className="flex flex-col space-y-8">
              {/* Bar Chart */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center gap-2 mb-5">
                  <BarChart3 className="h-6 w-6 text-gray-700" />
                  <h4 className="text-xl font-medium text-gray-800">Highest Exposure Tasks</h4>
                </div>
                <p className="text-base text-gray-600 mb-5">Highest exposure tasks prioritized for automation</p>
                <AutomationExposureBar 
                  items={barItems} 
                  maxBars={topN}
                  ariaLabel={`${title} chart showing automation risk for top ${topN} tasks`}
                />
              </div>
              
              {/* Gauge */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center gap-2 mb-5">
                  <PieChart className="h-6 w-6 text-gray-700" />
                  <h4 className="text-xl font-medium text-gray-800">Overall Exposure</h4>
                </div>
                <div className="flex justify-center mb-5">
                  <ExposureGauge 
                    value={contextStats.avg} 
                    size={200}
                    ariaLabel={`Overall automation exposure gauge showing ${contextStats.avg}% (${severityLabel} risk)`}
                  />
                </div>
                <p className="text-base text-gray-600 text-center">Overall exposure indicates systemic automation pressure</p>
              </div>
            </div>

            {/* Contextual Statements */}
            <div className="bg-gray-50 p-6 rounded-lg" role="region" aria-labelledby={contextHeadingId}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-gray-700" />
                  <h4 id={contextHeadingId} className="text-xl font-medium text-gray-800">Context & Analysis</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setExpanded(prev => !prev)}
                  aria-expanded={expanded}
                  className="px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors inline-flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  <span className="text-sm">{expanded ? 'Collapse' : 'Expand'}</span>
                </button>
              </div>

              {expanded && insights?.narratives?.automationNarrative && (
                <div className="bg-blue-50 rounded-lg p-4 mb-5">
                  <p className="text-base leading-relaxed text-gray-700">{insights.narratives.automationNarrative}</p>
                </div>
              )}

              {expanded && (
                <div className="space-y-5">
                  <div className="bg-white p-5 rounded-lg">
                    <h5 className="text-lg font-medium text-gray-800 mb-3">Key Statistics</h5>
                    <ul role="list" className="space-y-3">
                      {contextStats.topTaskLabel && (
                        <li role="listitem" className="text-base text-gray-700">
                          <span className="font-semibold text-gray-800">Top task:</span> {contextStats.topTaskLabel} ({contextStats.topTaskValue}%)
                        </li>
                      )}
                      {topThree.length > 0 && (
                        <li role="listitem" className="text-base text-gray-700">
                          <span className="font-semibold text-gray-800">Top tasks:</span> {topThree.map(t => `${t.label} (${t.value}%)`).join(', ')}
                        </li>
                      )}
                      <li role="listitem" className="text-base text-gray-700">
                        <span className="font-semibold text-gray-800">Median:</span> {contextStats.median}% · <span className="font-semibold text-gray-800">P90:</span> {contextStats.p90}%
                      </li>
                      <li role="listitem" className="text-base text-gray-700">
                        <span className="font-semibold text-gray-800">Counts:</span> High {contextStats.counts.high}, Moderate {contextStats.counts.moderate}, Low {contextStats.counts.low} (Total {contextStats.counts.total})
                      </li>
                      {(minExposure > 0 || contextStats.truncatedFrom > 0) && (
                        <li role="listitem" className="text-sm text-gray-600 mt-2">
                          {minExposure > 0 && (<span className="mr-2">Filtered by minimum exposure ≥ {minExposure}%.</span>)}
                          {contextStats.truncatedFrom > 0 && (<span>Showing top {topN} of {contextStats.truncatedFrom} eligible tasks.</span>)}
                        </li>
                      )}
                    </ul>
                  </div>

                  {insights?.sources && insights.sources.length > 0 && (
                    <div className="bg-white p-5 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <ExternalLink className="h-5 w-5 text-gray-700" />
                        <h5 className="text-lg font-medium text-gray-800">Research Sources</h5>
                      </div>
                      <div className="flex flex-col space-y-3" role="list">
                        {insights.sources.slice(0, 2).map((s, idx) => (
                          <div key={idx} role="listitem" className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                            <ExternalLink className="h-5 w-5 text-blue-600" />
                            {s.url ? (
                              <a
                                href={s.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-base text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                              >
                                {s.title}
                              </a>
                            ) : (
                              <span className="text-base text-gray-700">{s.title}</span>
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
      
      <div className="mt-6 pt-4 text-base text-gray-500">
        Showing top {topN} tasks with highest automation exposure
      </div>
    </div>
  );
}
