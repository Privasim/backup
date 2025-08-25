// File: src/modules/job-loss-viz/types/index.ts

export interface SourceRef {
  url: string;
  title?: string;
  publisher?: string;
  date?: string; // ISO date string
}

export interface YtdPoint {
  date: string; // ISO month start e.g., 2025-01-01
  ytd_global_ai_job_losses: number;
  sources: string[]; // URLs supporting the cumulative value
}

export interface RoleAggregate {
  role: string;
  count: number;
  sources: string[]; // URLs
}

export interface UseJobLossDataResult {
  ytdSeries: Array<{ ts: string; value: number }>;
  latestSources: SourceRef[];
  roles: RoleAggregate[];
  lastUpdated?: string; // ISO date string
  error?: string;
}
