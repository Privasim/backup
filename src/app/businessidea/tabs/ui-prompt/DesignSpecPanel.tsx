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
    <div className="mt-4 space-y-4">
      {/* Live JSON */}
      {(status === 'loading' || streamText.length > 0) && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-700">Live JSON (Design Spec)</span>
            <span className="text-[10px] text-gray-500">
              {metrics.startedAt ? `${Math.max(0, (metrics.lastChunkAt || Date.now()) - metrics.startedAt)}ms` : ''}
              {` • ${metrics.tokenCount} chunks • ${metrics.bytes} bytes`}
            </span>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50/80 shadow-sm">
            <pre
              ref={streamRef}
              className="h-[56vh] md:h-[64vh] w-full overflow-auto p-3 text-xs md:text-sm text-gray-800 font-mono whitespace-pre-wrap break-words"
              aria-live="polite"
            >
              {streamText}
            </pre>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</div>
      )}

      {spec && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-3">
            <h4 className="text-base font-semibold text-gray-900">{spec.title}</h4>
            <p className="text-sm text-gray-600">{spec.description}</p>
          </div>

          {/* Tasks */}
          <div className="space-y-2 mb-4">
            <div className="text-sm font-medium text-gray-800">Design Tasks</div>
            <ol className="list-decimal pl-5 space-y-1">
              {spec.tasks.map(t => (
                <li key={t.id} className="text-sm text-gray-800">
                  <div className="font-medium">{t.title}</div>
                  <div className="text-xs text-gray-600">{t.rationale}</div>
                  {t.acceptanceCriteria?.length ? (
                    <ul className="list-disc pl-5 mt-1 space-y-0.5">
                      {t.acceptanceCriteria.map((a, i) => (
                        <li key={i} className="text-xs text-gray-600">{a}</li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>

          {/* Tokens */}
          <div className="grid grid-cols-1 gap-3 mb-4">
            <div className="rounded-md border border-gray-200 p-3">
              <div className="text-xs font-medium text-gray-700 mb-2">Colors</div>
              <div className="text-xs text-gray-700 space-y-1">
                {Object.entries(spec.designTokens.colors).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between"><span className="text-gray-600">{k}</span><span className="font-mono">{String(v)}</span></div>
                ))}
              </div>
            </div>
            <div className="rounded-md border border-gray-200 p-3">
              <div className="text-xs font-medium text-gray-700 mb-2">Spacing</div>
              <div className="text-sm text-gray-800">{spec.designTokens.spacing}</div>
            </div>
            <div className="rounded-md border border-gray-200 p-3">
              <div className="text-xs font-medium text-gray-700 mb-2">Typography</div>
              <div className="text-xs text-gray-700 space-y-1">
                <div className="flex items-center justify-between"><span className="text-gray-600">fontFamily</span><span className="font-mono">{spec.designTokens.typography.fontFamily}</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-600">baseSize</span><span className="font-mono">{spec.designTokens.typography.baseSize}</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-600">scale</span><span className="font-mono">{spec.designTokens.typography.scale}</span></div>
              </div>
            </div>
          </div>

          {/* Components + Layout */}
          <div className="grid grid-cols-1 gap-3 mb-4">
            <div className="rounded-md border border-gray-200 p-3">
              <div className="text-sm font-medium text-gray-800 mb-2">Components</div>
              <ul className="space-y-1">
                {spec.components.map((c) => (
                  <li key={c.name} className="text-sm text-gray-800">
                    <div className="font-medium">{c.name}</div>
                    {c.props?.length ? (<div className="text-xs text-gray-600">props: {c.props.map(p => p.name).join(', ')}</div>) : null}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-md border border-gray-200 p-3">
              <div className="text-sm font-medium text-gray-800 mb-2">Layout Sections</div>
              <ul className="space-y-1">
                {spec.layout.sections.map(s => (
                  <li key={s.id} className="text-sm text-gray-800">
                    <div className="font-medium">{s.title || s.id}</div>
                    <div className="text-xs text-gray-600">{s.components.join(', ')}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Interactions + Libraries */}
          <div className="grid grid-cols-1 gap-3">
            <div className="rounded-md border border-gray-200 p-3">
              <div className="text-sm font-medium text-gray-800 mb-2">Interactions</div>
              <ul className="space-y-1">
                {spec.interactions.map((i, idx) => (
                  <li key={idx} className="text-sm text-gray-800">
                    <div className="font-medium">{i.component} • {i.event}</div>
                    <div className="text-xs text-gray-600">{i.behavior}</div>
                    {i.accessibility ? (<div className="text-[11px] text-gray-500">a11y: {i.accessibility}</div>) : null}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-md border border-gray-200 p-3">
              <div className="text-sm font-medium text-gray-800 mb-2">Libraries</div>
              <div className="text-sm text-gray-800">primary: tailwind</div>
              {spec.libraries.optional?.length ? (
                <div className="text-xs text-gray-600">optional: {spec.libraries.optional.join(', ')}</div>
              ) : null}
              {spec.constraints?.length ? (
                <div className="text-xs text-gray-600 mt-2">constraints: {spec.constraints.join(' • ')}</div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button type="button" onClick={onRegenerate} className="rounded-md px-3 py-2 text-sm bg-gray-100 text-gray-800 hover:bg-gray-200">Regenerate</button>
        {onCancel && status === 'loading' ? (
          <button type="button" onClick={onCancel} className="rounded-md px-3 py-2 text-sm bg-gray-100 text-gray-800 hover:bg-gray-200">Stop</button>
        ) : null}
        <div className="flex-1" />
        <button type="button" onClick={onApprove} disabled={!spec} className={`rounded-md px-4 py-2 text-sm text-white ${spec ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}>Proceed to Code</button>
      </div>
    </div>
  );
}
