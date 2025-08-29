// File: src/modules/job-loss-viz/components/JobLossViz.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useJobLossData } from '../hooks/useJobLossData';
import { LineGraph } from './LineGraph';
import { IndustryList } from './IndustryList';
import { SourcePanel } from './SourcePanel';
import { FloatingActionButton } from '../../../components/ui/FloatingActionButton';
import { InfoModal } from '../../../components/ui/InfoModal';
import { formatDateRange } from '../utils/sourceAggregator';

interface Props {
  className?: string;
  year?: number;
}

export default function JobLossViz({ className, year = 2025 }: Props) {
  const { 
    ytdSeries, 
    roles, 
    industries,
    latestSources, 
    aggregatedSources,
    sourceDateRange,
    lastUpdated, 
    error 
  } = useJobLossData({ year });
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  
  const handleOpenSourceModal = () => setIsSourceModalOpen(true);
  const handleCloseSourceModal = () => setIsSourceModalOpen(false);

  return (
    <section className={className} aria-labelledby="job-loss-viz-title">
      <div className="max-w-6xl mx-auto">
        {/* Main Visualization Card */}
        <div className="card-base p-6 md:p-8 relative">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 id="job-loss-viz-title" className="text-xl md:text-2xl font-semibold text-primary">Global AI‑Related Job Losses (YTD) — {year}</h2>
              <p className="text-sm text-secondary mt-1">Curated from public reports; cumulative totals only when explicitly attributed to AI.</p>
            </div>
            <div className="shrink-0 mt-1">
              {lastUpdated ? (
                <span className="badge-base badge-neutral">Last updated: {formatDate(lastUpdated)}</span>
              ) : (
                <span className="badge-base badge-neutral text-secondary">Awaiting data</span>
              )}
            </div>
          </div>

          {/* Body */}
          {error ? (
            <div className="text-sm text-error">Failed to load data: {error}</div>
          ) : (
            <>
              <div className="flex flex-col gap-6 mt-4">
                {/* LineGraph Card */}
                <div className="card-base p-6 relative">
                  <LineGraph data={ytdSeries} height={200} />
                  
                  {/* Total YTD Value */}
                  {ytdSeries.length > 0 && (
                    <div className="mt-4 text-center">
                      <div className="text-sm text-secondary">Total YTD Job Losses</div>
                      <div className="text-3xl font-bold text-primary">
                        {ytdSeries[ytdSeries.length - 1]?.value.toLocaleString()}
                      </div>
                    </div>
                  )}
                  
                  {/* Floating Action Button for Sources - positioned within LineGraph card */}
                  <FloatingActionButton 
                    onClick={handleOpenSourceModal} 
                    ariaLabel="View data sources"
                    position="bottom-right"
                    className="absolute bottom-4 right-4"
                    size="sm"
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    }
                  />
                </div>
                
                {/* Industry Breakdown Card */}
                {industries && industries.length > 0 && (
                  <div className="card-base p-6">
                    <IndustryList industries={industries} maxItems={5} />
                  </div>
                )}
              </div>
              
            </>
          )}
        </div>
        
        
        {/* Sources Modal */}
        <InfoModal 
          isOpen={isSourceModalOpen} 
          onClose={handleCloseSourceModal}
          title="Data Sources"
          size="md"
        >
          <SourcePanel 
            sources={latestSources}
            aggregatedSources={aggregatedSources}
            sourceDateRange={sourceDateRange}
            subtitle={sourceDateRange ? 
              `${aggregatedSources?.length || 0} sources from ${formatDateRange(sourceDateRange.start, sourceDateRange.end)}` : 
              undefined
            }
            isModal={true} 
            onClose={handleCloseSourceModal} 
            className="w-full"
          />
        </InfoModal>
      </div>
    </section>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
}
