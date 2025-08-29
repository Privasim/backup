// File: src/modules/job-loss-viz/types/index.ts

export interface SourceRef {
  url: string;
  title?: string;
  publisher?: string;
  date?: string; // ISO date string
  description?: string; // Brief description of the source
}

export interface AggregatedSourceRef extends SourceRef {
  firstDate: string; // ISO date of first occurrence
  lastDate: string; // ISO date of last occurrence
  occurrences: number; // Number of times this source appears
  months: string[]; // List of months this source appears in
}

export interface YtdPoint {
  date: string; // ISO month start e.g., 2025-01-01
  ytd_global_ai_job_losses: number;
  sources: (string | SourceRef)[]; // URLs or SourceRef objects supporting the cumulative value
}

export interface RoleAggregate {
  role: string;
  count: number;
  sources: (string | SourceRef)[]; // URLs or SourceRef objects
}

export interface IndustryAggregate {
  industry: string;
  count: number;
  roles: string[]; // List of roles in this industry
  sources: (string | SourceRef)[]; // URLs or SourceRef objects
}

export interface UseJobLossDataResult {
  ytdSeries: Array<{ ts: string; value: number }>;
  latestSources: SourceRef[];
  aggregatedSources: AggregatedSourceRef[];
  sourceDateRange?: { start: string; end: string };
  roles: RoleAggregate[];
  industries: IndustryAggregate[];
  lastUpdated?: string; // ISO date string
  error?: string;
}
