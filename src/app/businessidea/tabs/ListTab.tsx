'use client';

import { useMemo, useState } from 'react';
import SettingsTrigger from './settings-panel/SettingsTrigger';
import SettingsPanel from './settings-panel/SettingsPanel';
import { useImplementationPlan } from '@/features/implementation-plan/useImplementationPlan';
import PlanEmpty from '@/features/implementation-plan/components/PlanEmpty';
import ProgressiveRenderer from '@/features/implementation-plan/components/ProgressiveRenderer';
import StreamingErrorBoundary from '@/features/implementation-plan/components/StreamingErrorBoundary';

export default function ListTab() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { status, error, plan, rawStream, regenerate, cancel, streamingState } = useImplementationPlan();

  const isLoading = status === 'generating' || status === 'streaming';
  const preview = useMemo(() => {
    if (!rawStream) return '';
    const trimmed = rawStream.length > 1200 ? rawStream.slice(-1200) : rawStream;
    return trimmed;
  }, [rawStream]);

  const copyJson = async () => {
    if (!plan) return;
    const text = JSON.stringify(plan, null, 2);
    await navigator.clipboard.writeText(text);
  };

  const downloadJson = () => {
    if (!plan) return;
    const text = JSON.stringify(plan, null, 2);
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${plan.meta.title?.replace(/\s+/g, '-').toLowerCase() || 'implementation-plan'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto relative">
      <SettingsTrigger onClick={() => setIsSettingsOpen(true)} />
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Implementation Plan</h2>
          <div className="flex items-center gap-2">
            {status === 'success' && plan && (
              <>
                <button onClick={copyJson} className="text-xs px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-50">Copy JSON</button>
                <button onClick={downloadJson} className="text-xs px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-50">Download</button>
                <button onClick={regenerate} className="text-xs px-2 py-1 rounded-md bg-slate-900 text-white hover:bg-black">Regenerate</button>
              </>
            )}
            {isLoading && (
              <button onClick={cancel} className="text-xs px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-50">Cancel</button>
            )}
          </div>
        </div>

        {/* Error */}
        {status === 'error' && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
            <span>{error || 'Generation failed'}</span>
            <button onClick={regenerate} className="text-xs px-2 py-1 rounded-md bg-red-600 text-white hover:bg-red-700">Retry</button>
          </div>
        )}

        {/* Empty */}
        {status === 'idle' && !plan && !rawStream && (
          <PlanEmpty />
        )}

        {/* Progressive Streaming Display */}
        {isLoading && (
          <StreamingErrorBoundary
            fallback={
              <div className="space-y-3">
                <div className="flex items-center text-xs text-gray-600">
                  <span className="inline-block h-2 w-2 rounded-full bg-indigo-500 animate-pulse mr-2" />
                  Streaming implementation plan…
                </div>
                <div className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-md p-3 overflow-auto max-h-64 whitespace-pre-wrap">
                  {preview}
                </div>
              </div>
            }
          >
            <ProgressiveRenderer
              sections={streamingState.processedSections}
              progress={{
                currentPhase: streamingState.currentPhase,
                completedPhases: streamingState.processedSections
                  .filter(s => s.isComplete)
                  .map(s => s.type),
                progress: streamingState.progress
              }}
              isComplete={false}
              error={streamingState.error}
            />
            
            {/* Fallback raw display if no processed sections yet */}
            {streamingState.processedSections.length === 0 && preview && (
              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                <div className="text-xs text-gray-600 mb-2">Raw content (processing...):</div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap font-mono max-h-32 overflow-auto">
                  {preview}
                </div>
              </div>
            )}
          </StreamingErrorBoundary>
        )}

        {/* Success: simple viewer */}
        {status === 'success' && plan && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-semibold text-slate-900">{plan.meta.title}</h3>
              <p className="text-xs text-slate-600">Category: {plan.meta.category || '—'} · Created {new Date(plan.meta.createdAt).toLocaleString()}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <section className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Goals</h4>
                <ul className="text-sm text-slate-700 list-disc pl-5 space-y-1">
                  {plan.overview.goals?.map((g, i) => (<li key={i}>{g}</li>))}
                </ul>
              </section>
              <section className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <h4 className="text-sm font-semibold text-slate-900 mb-2">KPIs</h4>
                <ul className="text-sm text-slate-700 list-disc pl-5 space-y-1">
                  {plan.kpis?.map((k, i) => (<li key={i}>{k.metric}: {k.target}</li>))}
                </ul>
              </section>
            </div>
            <section>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Phases</h4>
              <div className="space-y-2">
                {plan.phases.map(ph => (
                  <div key={ph.id} className="p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-900">{ph.name}</span>
                      {ph.duration && <span className="text-xs text-slate-500">{ph.duration}</span>}
                    </div>
                    <ul className="mt-2 text-sm text-slate-700 list-disc pl-5 space-y-1">
                      {ph.objectives?.map((o, i) => (<li key={i}>{o}</li>))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Top Tasks</h4>
              <ul className="text-sm text-slate-700 list-disc pl-5 space-y-1">
                {plan.tasks.slice(0, 12).map(t => (<li key={t.id}>{t.title}{t.effort ? ` · ${t.effort}` : ''}</li>))}
              </ul>
            </section>
          </div>
        )}
      </div>

      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
}
