// File: src/modules/job-loss-viz/components/SourcePanel.tsx
'use client';

import React from 'react';
import type { SourceRef } from '../types';

interface Props {
  sources: SourceRef[];
  className?: string;
  onClose?: () => void;
  isModal?: boolean;
}

export function SourcePanel({ sources, className, onClose, isModal = false }: Props) {
  const isEmpty = !sources || sources.length === 0;
  
  // Show all sources when in modal view, otherwise limit to 4
  const displaySources = isModal ? sources : sources?.slice(0, 4);
  
  return (
    <div 
      className={`${className} ${isModal ? 'w-full' : ''}`} 
      aria-label="Sources supporting the latest cumulative value"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-primary font-semibold">
          {isModal ? 'Data Sources' : 'Sources'}
        </h3>
        {isModal && onClose && (
          <button 
            onClick={onClose}
            className="text-secondary hover:text-primary focus-ring p-1 rounded-full"
            aria-label="Close sources panel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
      
      {isEmpty ? (
        <div className="text-secondary text-sm py-4" aria-live="polite">
          No sources linked yet
        </div>
      ) : (
        <>
          {isModal && (
            <p className="text-secondary text-sm mb-4">
              The following sources were used to compile the job loss visualization data.
            </p>
          )}
          <ul className={`${isModal ? 'divide-y divide-gray-100' : 'space-y-2'}`}>
            {displaySources.map((source, i) => (
              <li 
                key={i} 
                className={`${isModal ? 'py-3' : 'text-sm text-secondary'} truncate`}
              >
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-primary hover:underline underline-offset-2 focus-ring"
                >
                  {source.publisher ? `${source.publisher} — ` : ''}
                  {source.title ?? source.url}
                </a>
                {isModal && source.description && (
                  <p className="mt-1 text-sm text-secondary">{source.description}</p>
                )}
              </li>
            ))}
          </ul>
          
          {!isModal && sources.length > 4 && (
            <div className="mt-2 text-xs text-secondary">
              +{sources.length - 4} more sources
            </div>
          )}
        </>
      )}
    </div>
  );
}
