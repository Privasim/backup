import React, { useMemo } from 'react';
import { ExternalLink, Info } from 'lucide-react';
import { DataDrivenInsightsModel } from '../insights/types';

interface AutomationExposureContextCardProps {
  insights?: DataDrivenInsightsModel | null;
  className?: string;
}

export function AutomationExposureContextCard({ insights, className = '' }: AutomationExposureContextCardProps) {
  const stats = useMemo(() => {
    const items = insights?.automationExposure ?? [];
    const values = items.map(i => Math.max(0, Math.min(100, i.exposure)));
    const total = values.length;
    if (total === 0) {
      return {
        top: [] as { task: string; exposure: number }[],
        avg: 0,
        median: 0,
        p90: 0,
        counts: { high: 0, moderate: 0, low: 0, total: 0 },
      };
    }

    const sortedValues = [...values].sort((a, b) => a - b);
    const avg = Math.round(values.reduce((a, b) => a + b, 0) / total);
    const median = total % 2 === 1
      ? sortedValues[(total - 1) / 2]
      : Math.round((sortedValues[total / 2 - 1] + sortedValues[total / 2]) / 2);
    const p90Index = Math.max(0, Math.ceil(0.9 * total) - 1);
    const p90 = sortedValues[p90Index];

    const counts = values.reduce(
      (acc, v) => {
        if (v > 70) acc.high += 1; else if (v > 40) acc.moderate += 1; else acc.low += 1; return acc;
      },
      { high: 0, moderate: 0, low: 0 }
    );

    const top = [...(insights?.automationExposure ?? [])]
      .map(i => ({ task: i.task, exposure: Math.max(0, Math.min(100, i.exposure)) }))
      .sort((a, b) => b.exposure - a.exposure)
      .slice(0, 3);

    return { top, avg, median, p90, counts: { ...counts, total } };
  }, [insights]);

  const severity: 'Low' | 'Moderate' | 'High' = stats.avg > 70 ? 'High' : stats.avg > 40 ? 'Moderate' : 'Low';
  const severityColor = severity === 'High' ? 'text-red-700 bg-red-50 ring-red-600/20' : severity === 'Moderate' ? 'text-amber-700 bg-amber-50 ring-amber-600/20' : 'text-emerald-700 bg-emerald-50 ring-emerald-600/20';

  const noData = (insights?.automationExposure?.length ?? 0) === 0;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <Info className="h-4 w-4 text-gray-600" />
        <h3 className="text-base font-semibold text-gray-800">Automation Exposure Context</h3>
        {!noData && (
          <span className={`ml-auto inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${severityColor}`}>
            Overall: {severity}
          </span>
        )}
      </div>

      <div className="p-4">
        {noData ? (
          <p className="text-sm text-gray-500">No contextual information available. Generate insights to view analysis.</p>
        ) : (
          <div className="space-y-3">
            {insights?.narratives?.automationNarrative && (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-sm leading-relaxed text-gray-700">{insights.narratives.automationNarrative}</p>
              </div>
            )}

            <ul className="text-sm text-gray-700 space-y-1" role="list">
              <li role="listitem"><span className="font-medium text-gray-800">Average exposure:</span> {stats.avg}% · <span className="font-medium text-gray-800">Median:</span> {stats.median}% · <span className="font-medium text-gray-800">P90:</span> {stats.p90}%</li>
              <li role="listitem"><span className="font-medium text-gray-800">Distribution:</span> High {stats.counts.high}, Moderate {stats.counts.moderate}, Low {stats.counts.low} (Total {stats.counts.total})</li>
              {stats.top.length > 0 && (
                <li role="listitem"><span className="font-medium text-gray-800">Top tasks:</span> {stats.top.map(t => `${t.task} (${t.exposure}%)`).join(', ')}</li>
              )}
            </ul>

            {insights?.sources && insights.sources.length > 0 && (
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
    </div>
  );
}
