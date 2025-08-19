import React, { useMemo, useState, useCallback, useId } from 'react';
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
  const severityColor = useMemo(() => (
    severityLabel === 'High'
      ? 'text-red-700 bg-red-50 ring-red-600/20'
      : severityLabel === 'Moderate'
      ? 'text-amber-700 bg-amber-50 ring-amber-600/20'
      : 'text-emerald-700 bg-emerald-50 ring-emerald-600/20'
  ), [severityLabel]);
  const topThree = useMemo(() => barItems.slice(0, Math.min(3, barItems.length)), [barItems]);
  
  // Import the CardSkeletonLoader component
  const { CardSkeletonLoader } = require('@/components/ui/SkeletonLoader');
  
  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden ${className}`}>
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="p-4">
          <CardSkeletonLoader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden ${className}`}>
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="p-4">
          <div className="p-4 rounded-md bg-red-50 border border-red-200">
            <p className="text-red-700">{error}</p>
            <p className="text-sm text-red-600 mt-2">Please try again or contact support if the issue persists.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>
      </div>
      
      <div className="p-4">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-gray-500 text-sm">No automation exposure data available</p>
            <p className="text-gray-400 text-xs mt-1">Complete your profile analysis to see insights</p>
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
                <Info className="h-4 w-4 text-gray-600" />
                <h4 id={contextHeadingId} className="text-sm font-medium text-gray-900">Context</h4>
                <span className={`ml-2 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${severityColor}`} aria-label={`Overall exposure: ${severityLabel}`}>
                  Overall: {severityLabel}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-2 py-1"
                  aria-label="Copy context"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExpanded(prev => !prev)}
                  aria-expanded={expanded}
                  className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-2 py-1"
                >
                  {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  <span>{expanded ? 'Collapse' : 'Expand'}</span>
                </button>
              </div>
            </div>

            {expanded && insights?.narratives?.automationNarrative && (
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-100 mt-2">
                <p className="text-sm leading-relaxed text-gray-700">{insights.narratives.automationNarrative}</p>
              </div>
            )}

            {expanded && (
              <ul role="list" className="mt-2 space-y-1">
                {contextStats.topTaskLabel && (
                  <li role="listitem" className="text-sm text-gray-700">
                    <span className="font-medium text-gray-800">Top task:</span> {contextStats.topTaskLabel} ({contextStats.topTaskValue}%)
                  </li>
                )}
                {topThree.length > 0 && (
                  <li role="listitem" className="text-sm text-gray-700">
                    <span className="font-medium text-gray-800">Top tasks:</span> {topThree.map(t => `${t.label} (${t.value}%)`).join(', ')}
                  </li>
                )}
                <li role="listitem" className="text-sm text-gray-700">
                  <span className="font-medium text-gray-800">Average exposure:</span> {contextStats.avg}%
                </li>
                <li role="listitem" className="text-sm text-gray-700">
                  <span className="font-medium text-gray-800">Median:</span> {contextStats.median}% · <span className="font-medium text-gray-800">P90:</span> {contextStats.p90}%
                </li>
                <li role="listitem" className="text-sm text-gray-700">
                  <span className="font-medium text-gray-800">Counts:</span> High {contextStats.counts.high}, Moderate {contextStats.counts.moderate}, Low {contextStats.counts.low} (Total {contextStats.counts.total})
                </li>
                {(minExposure > 0 || contextStats.truncatedFrom > 0) && (
                  <li role="listitem" className="text-xs text-gray-600">
                    {minExposure > 0 && (<span className="mr-2">Filtered by minimum exposure ≥ {minExposure}%.</span>)}
                    {contextStats.truncatedFrom > 0 && (<span>Showing top {topN} of {contextStats.truncatedFrom} eligible tasks.</span>)}
                  </li>
                )}
              </ul>
            )}

            {expanded && insights?.sources && insights.sources.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="bg-gray-100 p-1 rounded-full">
                    <ExternalLink className="h-3.5 w-3.5 text-gray-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-800">Sources</span>
                </div>
                <div className="grid gap-1 sm:grid-cols-2" role="list">
                  {insights.sources.slice(0, 2).map((s, idx) => (
                    <div key={idx} role="listitem" className="flex items-center gap-2 p-1.5 rounded border border-gray-100 bg-gray-50">
                      <div className="bg-white p-0.5 rounded-full">
                        <ExternalLink className="h-3.5 w-3.5 text-blue-500" />
                      </div>
                      {s.url ? (
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gray-800 hover:text-gray-900 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
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
        )}
      </div>
      
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
        Showing top {topN} tasks with highest automation exposure
      </div>
    </div>
  );
}
