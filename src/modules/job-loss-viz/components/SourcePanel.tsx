// File: src/modules/job-loss-viz/components/SourcePanel.tsx
'use client';

import React from 'react';
import type { SourceRef } from '../types';

interface Props {
  sources: SourceRef[];
  className?: string;
}

export function SourcePanel({ sources, className }: Props) {
  if (!sources || sources.length === 0) {
    return (
      <div className={className} aria-live="polite">
        <div className="text-xs text-gray-400">No sources linked yet</div>
      </div>
    );
  }

  return (
    <div className={className} aria-label="Sources supporting the latest cumulative value">
      <div className="text-xs font-medium text-gray-600 mb-1">Sources</div>
      <ul className="space-y-1">
        {sources.slice(0, 4).map((s, i) => (
          <li key={i} className="text-xs text-gray-500 truncate">
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-800 underline-offset-2 hover:underline"
            >
              {s.publisher ? `${s.publisher} — ` : ''}
              {s.title ?? s.url}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
