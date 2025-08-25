'use client';

import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import SettingsTrigger from './settings-panel/SettingsTrigger';
import SettingsPanel from './settings-panel/SettingsPanel';
import { useImplementationPlan } from '@/features/implementation-plan/useImplementationPlan';
import { useTab } from './TabContext';
import PlanEmpty from '@/features/implementation-plan/components/PlanEmpty';
import ProgressiveRenderer from '@/features/implementation-plan/components/ProgressiveRenderer';
import StreamingErrorBoundary from '@/features/implementation-plan/components/StreamingErrorBoundary';

export default function ListTab() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [displayMode, setDisplayMode] = useState<'text' | 'structured'>('text');
  const { status, error, plan, rawStream, regenerate, cancel, streamingState, isExternallyDriven, settings } = useImplementationPlan();
  const { setActiveTab } = useTab();
  
  // Get length preset settings
  const lengthPreset = settings.lengthPreset || 'long';
  
  // Derive compact mode and max phase cards from length preset
  const compactMode = lengthPreset === 'brief' || lengthPreset === 'standard';
  const compactMaxPhaseCards = 
    lengthPreset === 'brief' ? 1 : 
    lengthPreset === 'standard' ? 2 : 
    (settings.compactMaxPhaseCards && settings.compactMaxPhaseCards > 0 ? settings.compactMaxPhaseCards : 4);

  const isLoading = status === 'generating' || status === 'streaming';
  const preview = useMemo(() => {
    if (!rawStream) return '';
    const trimmed = rawStream.length > 1200 ? rawStream.slice(-1200) : rawStream;
    return trimmed;
  }, [rawStream]);

  const copyText = async () => {
    if (!plan?.textContent) return;
    await navigator.clipboard.writeText(plan.textContent);
  };

  const copyJson = async () => {
    if (!plan) return;
    const text = JSON.stringify(plan, null, 2);
    await navigator.clipboard.writeText(text);
  };

  const downloadText = () => {
    if (!plan?.textContent) return;
    const blob = new Blob([plan.textContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${plan.meta.title?.replace(/\s+/g, '-').toLowerCase() || 'implementation-plan'}.md`;
    a.click();
    URL.revokeObjectURL(url);
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
                <button onClick={copyText} className="text-xs px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-50">Copy Text</button>
                <button onClick={copyJson} className="text-xs px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-50">Copy JSON</button>
                <button onClick={downloadText} className="text-xs px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-50">Download MD</button>
                <button onClick={downloadJson} className="text-xs px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-50">Download JSON</button>
                <button 
                  onClick={() => setActiveTab('specs')}
                  className="text-xs px-2 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Generate Specs
                </button>
                <button 
                  onClick={regenerate} 
                  disabled={isExternallyDriven}
                  className={`text-xs px-2 py-1 rounded-md ${isExternallyDriven ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-black'}`}
                  title={isExternallyDriven ? 'Regeneration disabled while plan is streaming from Chatbox' : 'Regenerate plan'}
                >
                  Regenerate
                </button>
              </>
            )}
            {isLoading && (
              <button 
                onClick={cancel} 
                disabled={isExternallyDriven}
                className={`text-xs px-2 py-1 rounded-md ${isExternallyDriven ? 'border border-gray-300 text-gray-400 cursor-not-allowed' : 'border border-slate-200 hover:bg-slate-50'}`}
                title={isExternallyDriven ? 'Cancellation disabled while plan is streaming from Chatbox' : 'Cancel generation'}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {status === 'error' && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
            <span>{error || 'Generation failed'}</span>
            <button 
              onClick={regenerate} 
              disabled={isExternallyDriven}
              className={`text-xs px-2 py-1 rounded-md ${isExternallyDriven ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}
              title={isExternallyDriven ? 'Retry disabled while plan is streaming from Chatbox' : 'Retry generation'}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {status === 'idle' && !plan && !rawStream && (
          <PlanEmpty />
        )}

        {/* Simplified Streaming Display */}
        {isLoading && (
          <div className="space-y-3">
            <div className="flex items-center text-xs text-gray-600">
              <span className="inline-block h-2 w-2 rounded-full bg-indigo-500 animate-pulse mr-2" />
              Generating implementation plan…
            </div>
            
            {/* Direct text display - no complex processing */}
            {preview && (
              <div className="prose max-w-none bg-gray-50 border border-gray-200 rounded-md p-4 max-h-96 overflow-auto">
                <ReactMarkdown>{preview}</ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {/* Success: hybrid viewer */}
        {status === 'success' && plan && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-semibold text-slate-900">{plan.meta.title}</h3>
              <p className="text-xs text-slate-600">Category: {plan.meta.category || '—'} · Created {new Date(plan.meta.createdAt).toLocaleString()}</p>
            </div>
            
            {/* Display Mode Toggle */}
            <div className="flex items-center gap-2 mb-4">
              <button 
                onClick={() => setDisplayMode('text')}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  displayMode === 'text' 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                📄 Text View
              </button>
              <button 
                onClick={() => setDisplayMode('structured')}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  displayMode === 'structured' 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                📊 Structured View
              </button>
            </div>
            
            {/* Text Content Display */}
            {displayMode === 'text' && plan.textContent && (
              <div className="prose max-w-none bg-white border border-gray-200 rounded-lg p-6">
                <ReactMarkdown>{plan.formattedContent || plan.textContent}</ReactMarkdown>
              </div>
            )}
            
            {/* Structured Content Display (existing) */}
            {displayMode === 'structured' && (
              <div className="space-y-6">
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
                    {(compactMode ? plan.phases.slice(0, compactMaxPhaseCards) : plan.phases).map(ph => (
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
                  {compactMode && plan.phases.length > compactMaxPhaseCards && (
                    <p className="text-xs text-slate-500 mt-2">+{plan.phases.length - compactMaxPhaseCards} more phases hidden in {lengthPreset} mode</p>
                  )}
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
        )}
      </div>

      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
}
