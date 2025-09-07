'use client';

import dynamic from 'next/dynamic';

const JobLossViz = dynamic(() => import('../../modules/job-loss-viz/components/JobLossViz'), {
  ssr: false,
  loading: () => (
    <div className="max-w-7xl mx-auto px-6">
      <div className="h-64 rounded-xl border border-[var(--border-muted)] card-base animate-pulse" aria-hidden />
    </div>
  ),
});

export default function JobLossVizClient() {
  return <JobLossViz />;
}
