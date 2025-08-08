"use client";

import React, { useEffect, useRef } from 'react';
import type { DesignSpec } from './types.design';

interface Props {
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
  spec?: DesignSpec;
  streamText: string;
  metrics: { startedAt?: number; lastChunkAt?: number; tokenCount: number; bytes: number };
  onApprove: () => void;
  onRegenerate: () => void;
  onCancel?: () => void;
}

export default function DesignSpecPanel({ status, error, spec, streamText, metrics, onApprove, onRegenerate, onCancel }: Props) {
  const streamRef = useRef<HTMLPreElement>(null);
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [streamText]);
  return (
    <div className="space-y-4 h-full">
      {/* Live JSON */}
      {(status === 'loading' || streamText.length > 0) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-slate-700">Live Design Spec</span>
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
            <pre
              ref={streamRef}
              className="h-[30vh] w-full overflow-auto p-4 text-xs text-slate-700 font-mono whitespace-pre-wrap break-words leading-relaxed"
              aria-live="polite"
            >
              {streamText}
            </pre>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200/60 bg-red-50/80 backdrop-blur-sm p-4 text-sm text-red-700 flex items-start gap-3" role="alert">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <div className="font-medium text-red-800 mb-1">Generation Error</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {spec && (
        <div className="rounded-xl border border-slate-200/60 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
          <div className="mb-5">
            <h4 className="text-lg font-bold text-slate-800 mb-2">{spec.title}</h4>
            <p className="text-sm text-slate-600 leading-relaxed">{spec.description}</p>
          </div>

          {/* Compact Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
            {/* Design Tokens */}
            <div className="space-y-3">
              <h5 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                Design Tokens
              </h5>
              <div className="grid grid-cols-1 gap-2">
                <div className="rounded-lg border border-slate-200/60 bg-slate-50/50 p-3">
                  <div className="text-xs font-medium text-slate-600 mb-2">Colors</div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {Object.entries(spec.designTokens.colors).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between">
                        <span className="text-slate-500 capitalize">{k}</span>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded border border-slate-200" style={{ backgroundColor: String(v) }}></div>
                          <span className="font-mono text-slate-700">{String(v)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-slate-200/60 bg-slate-50/50 p-3">
                    <div className="text-xs font-medium text-slate-600 mb-1">Spacing</div>
                    <div className="text-xs text-slate-700 font-medium">{spec.designTokens.spacing}</div>
                  </div>
                  <div className="rounded-lg border border-slate-200/60 bg-slate-50/50 p-3">
                    <div className="text-xs font-medium text-slate-600 mb-1">Typography</div>
                    <div className="text-xs text-slate-700">
                      <div className="font-mono">{spec.designTokens.typography.fontFamily}</div>
                      <div className="text-slate-500">{spec.designTokens.typography.baseSize}px • {spec.designTokens.typography.scale}x</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Components & Layout */}
            <div className="space-y-3">
              <h5 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                Architecture
              </h5>
              <div className="grid grid-cols-1 gap-2">
                <div className="rounded-lg border border-slate-200/60 bg-slate-50/50 p-3">
                  <div className="text-xs font-medium text-slate-600 mb-2">Components ({spec.components.length})</div>
                  <div className="flex flex-wrap gap-1">
                    {spec.components.slice(0, 6).map((c) => (
                      <span key={c.name} className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-medium">
                        {c.name}
                      </span>
                    ))}
                    {spec.components.length > 6 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs">
                        +{spec.components.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200/60 bg-slate-50/50 p-3">
                  <div className="text-xs font-medium text-slate-600 mb-2">Layout Sections</div>
                  <div className="space-y-1">
                    {spec.layout.sections.slice(0, 3).map(s => (
                      <div key={s.id} className="text-xs">
                        <span className="font-medium text-slate-700">{s.title || s.id}</span>
                        <span className="text-slate-500 ml-2">({s.components.length} components)</span>
                      </div>
                    ))}
                    {spec.layout.sections.length > 3 && (
                      <div className="text-xs text-slate-500">+{spec.layout.sections.length - 3} more sections</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tasks - Collapsible */}
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer p-3 rounded-lg bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                <span className="text-sm font-semibold text-slate-700">Design Tasks ({spec.tasks.length})</span>
              </div>
              <svg className="w-4 h-4 text-slate-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
              {spec.tasks.map((t, idx) => (
                <div key={t.id} className="border border-slate-200/60 rounded-lg p-3 bg-white/50">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-medium flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-slate-800 mb-1">{t.title}</div>
                      <div className="text-xs text-slate-600 mb-2">{t.rationale}</div>
                      {t.acceptanceCriteria?.length ? (
                        <div className="space-y-1">
                          {t.acceptanceCriteria.slice(0, 2).map((a, i) => (
                            <div key={i} className="text-xs text-slate-500 flex items-start gap-1">
                              <div className="w-1 h-1 bg-slate-400 rounded-full mt-1.5 flex-shrink-0"></div>
                              <span>{a}</span>
                            </div>
                          ))}
                          {t.acceptanceCriteria.length > 2 && (
                            <div className="text-xs text-slate-400">+{t.acceptanceCriteria.length - 2} more criteria</div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60">
        <button 
          type="button" 
          onClick={onRegenerate} 
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Regenerate
        </button>
        
        {onCancel && status === 'loading' ? (
          <button 
            type="button" 
            onClick={onCancel} 
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Stop
          </button>
        ) : null}
        
        <div className="flex-1" />
        
        <button 
          type="button" 
          onClick={onApprove} 
          disabled={!spec} 
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            spec 
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-sm hover:shadow-md' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          Generate Code
        </button>
      </div>
    </div>
  );
}
