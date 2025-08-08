"use client";

import React, { useMemo, useState } from 'react';
import type { CodeBundle } from './types.codegen';
import UIWireframeRenderer from './UIWireframeRenderer';

interface Props {
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
  bundle?: CodeBundle;
  streamText: string;
  metrics: { startedAt?: number; lastChunkAt?: number; tokenCount: number; bytes: number };
  onBack?: () => void;
}

export default function CodePreviewPanel({ status, error, bundle, streamText, metrics, onBack }: Props) {
  const [tab, setTab] = useState<'preview' | 'files' | 'readme' | 'deps'>('preview');
  const [activeFile, setActiveFile] = useState<string | undefined>(undefined);

  const files = bundle?.files || [];
  const selected = useMemo(() => files.find(f => f.path === activeFile) || files[0], [files, activeFile]);

  const handleExport = () => {
    if (!bundle) return;
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'code-bundle.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 h-full">
      {(status === 'loading' || streamText.length > 0) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-slate-700">Live Code Generation</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              {metrics.startedAt && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {Math.max(0, (metrics.lastChunkAt || Date.now()) - metrics.startedAt)}ms
                </span>
              )}
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4z" />
                </svg>
                {metrics.tokenCount} chunks
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {metrics.bytes} bytes
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 backdrop-blur-sm shadow-sm overflow-hidden">
            <pre className="max-h-48 overflow-auto p-4 text-xs text-slate-700 font-mono whitespace-pre-wrap break-words leading-relaxed" aria-live="polite">{streamText}</pre>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200/60 bg-red-50/80 backdrop-blur-sm p-4 text-sm text-red-700 flex items-start gap-3" role="alert">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <div className="font-medium text-red-800 mb-1">Code Generation Error</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/60 bg-slate-50/30 rounded-t-xl p-1">
        {(['preview','files','readme','deps'] as const).map(t => (
          <button 
            key={t} 
            onClick={() => setTab(t)} 
            className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              tab === t 
                ? 'bg-white text-slate-800 shadow-sm border border-slate-200/60' 
                : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
        <div className="flex-1" />
        {onBack && (
          <button 
            type="button" 
            onClick={onBack} 
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Spec
          </button>
        )}
        <button 
          type="button" 
          onClick={handleExport} 
          disabled={!bundle} 
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            bundle 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm hover:shadow-md' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Bundle
        </button>
      </div>

      {/* Content */}
      {tab === 'preview' && (
        <div className="rounded-xl border border-slate-200/60 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
          {bundle?.previewDsl ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                <span className="text-sm font-semibold text-slate-700">Live Preview</span>
              </div>
              <UIWireframeRenderer screen={bundle.previewDsl} />
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div className="text-sm text-slate-600">No preview available</div>
              <div className="text-xs text-slate-500 mt-1">Ask the model to include <code className="bg-slate-100 px-1 rounded">previewDsl</code></div>
            </div>
          )}
        </div>
      )}

      {tab === 'files' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200/60 bg-white/80 backdrop-blur-sm p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-semibold text-slate-700">Files ({files.length})</span>
            </div>
            <ul className="max-h-64 overflow-auto space-y-1">
              {files.map((f) => (
                <li key={f.path}>
                  <button 
                    onClick={() => setActiveFile(f.path)} 
                    className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                      selected?.path === f.path 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200/60' 
                        : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="truncate">{f.path}</span>
                    </div>
                  </button>
                </li>
              ))}
              {files.length === 0 && (
                <li className="text-xs text-slate-500 text-center py-4">No files generated yet</li>
              )}
            </ul>
          </div>
          <div className="lg:col-span-2 rounded-xl border border-slate-200/60 bg-white/80 backdrop-blur-sm p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              <span className="text-sm font-semibold text-slate-700">{selected?.path || 'No file selected'}</span>
            </div>
            {selected ? (
              <div className="rounded-lg border border-slate-200/60 bg-slate-50/50 overflow-hidden">
                <pre className="max-h-80 overflow-auto p-4 text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed">{selected.content}</pre>
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <div className="text-sm text-slate-500">Select a file to view its contents</div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'readme' && (
        <div className="rounded-xl border border-slate-200/60 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
            <span className="text-sm font-semibold text-slate-700">README</span>
          </div>
          <div className="prose prose-sm max-w-none">
            <pre className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {bundle?.readme || 'No README provided.'}
            </pre>
          </div>
        </div>
      )}

      {tab === 'deps' && (
        <div className="rounded-xl border border-slate-200/60 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
            <span className="text-sm font-semibold text-slate-700">Dependencies</span>
          </div>
          <div className="space-y-2">
            {bundle?.suggestedDependencies?.map((d, i) => (
              <div key={`${d.name}-${i}`} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 border border-slate-200/60">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="font-mono text-sm text-slate-800">{d.name}{d.version ? `@${d.version}` : ''}</span>
                </div>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{d.reason}</span>
              </div>
            ))}
            {!bundle?.suggestedDependencies?.length && (
              <div className="text-center py-8">
                <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <div className="text-sm text-slate-500">No dependencies suggested</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
