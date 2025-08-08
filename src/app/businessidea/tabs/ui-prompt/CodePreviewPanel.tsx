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
    <div className="mt-4 space-y-4">
      {(status === 'loading' || streamText.length > 0) && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-700">Live JSON (Code Bundle)</span>
            <span className="text-[10px] text-gray-500">
              {metrics.startedAt ? `${Math.max(0, (metrics.lastChunkAt || Date.now()) - metrics.startedAt)}ms` : ''}
              {` • ${metrics.tokenCount} chunks • ${metrics.bytes} bytes`}
            </span>
          </div>
          <pre className="max-h-48 overflow-auto rounded-md border border-gray-200 bg-gray-50 p-2 text-xs text-gray-800" aria-live="polite">{streamText}</pre>
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        {(['preview','files','readme','deps'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-2 text-sm -mb-px border-b-2 ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-800'}`}>{t.toUpperCase()}</button>
        ))}
        <div className="flex-1" />
        {onBack && (
          <button type="button" onClick={onBack} className="rounded-md px-3 py-2 text-sm bg-gray-100 text-gray-800 hover:bg-gray-200">Back</button>
        )}
        <button type="button" onClick={handleExport} disabled={!bundle} className={`rounded-md px-3 py-2 text-sm ${bundle ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-300 text-white cursor-not-allowed'}`}>Export</button>
      </div>

      {/* Content */}
      {tab === 'preview' && (
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          {bundle?.previewDsl ? (
            <UIWireframeRenderer screen={bundle.previewDsl} />
          ) : (
            <div className="text-sm text-gray-600">No preview DSL provided. Ask the model to include <code>previewDsl</code>.</div>
          )}
        </div>
      )}

      {tab === 'files' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-md border border-gray-200 bg-white p-2">
            <div className="text-xs font-medium text-gray-700 mb-2">Files</div>
            <ul className="max-h-64 overflow-auto text-sm">
              {files.map((f) => (
                <li key={f.path}>
                  <button onClick={() => setActiveFile(f.path)} className={`w-full text-left rounded px-2 py-1 ${selected?.path === f.path ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-800'}`}>{f.path}</button>
                </li>
              ))}
              {files.length === 0 && (
                <li className="text-xs text-gray-500">No files yet.</li>
              )}
            </ul>
          </div>
          <div className="md:col-span-2 rounded-md border border-gray-200 bg-white p-2">
            <div className="text-xs font-medium text-gray-700 mb-2">{selected?.path || 'No file selected'}</div>
            {selected ? (
              <pre className="max-h-80 overflow-auto rounded border border-gray-100 bg-gray-50 p-2 text-xs text-gray-800 whitespace-pre-wrap">{selected.content}</pre>
            ) : (
              <div className="text-sm text-gray-600">Select a file to view</div>
            )}
          </div>
        </div>
      )}

      {tab === 'readme' && (
        <div className="rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-800 whitespace-pre-wrap">
          {bundle?.readme || 'No README provided.'}
        </div>
      )}

      {tab === 'deps' && (
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <div className="text-sm font-medium text-gray-800 mb-2">Suggested Dependencies</div>
          <ul className="text-sm text-gray-800 space-y-1">
            {bundle?.suggestedDependencies?.map((d, i) => (
              <li key={`${d.name}-${i}`} className="flex items-center justify-between">
                <span>{d.name}{d.version ? `@${d.version}` : ''}</span>
                <span className="text-xs text-gray-500">{d.reason}</span>
              </li>
            ))}
            {!bundle?.suggestedDependencies?.length && (
              <li className="text-xs text-gray-500">No suggestions provided.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
