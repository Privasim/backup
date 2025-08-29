// File: src/modules/job-loss-viz/hooks/useJobLossData.ts
'use client';

import { useEffect, useMemo, useState } from 'react';
import type { UseJobLossDataResult, YtdPoint, RoleAggregate, SourceRef, IndustryAggregate, AggregatedSourceRef } from '../types';
import { parseRoleAggregates, parseYtdPoints, toSourceRefs } from '../utils/validate';
import { buildSeriesFromYtd } from '../utils/normalize';
import { aggregateSourcesFromYtd, getSourceDateRange } from '../utils/sourceAggregator';
import { aggregateRolesByIndustry } from '../data/industryMap';

interface Options {
  year?: number; // default 2025
}

export function useJobLossData(opts: Options = {}): UseJobLossDataResult {
  const year = opts.year ?? 2025;
  const [ytdPoints, setYtdPoints] = useState<YtdPoint[] | null>(null);
  const [roles, setRoles] = useState<RoleAggregate[] | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [ytdRes, rolesRes] = await Promise.all([
          fetch(`/data/job-loss-viz/${year}-global-ytd.json`, { cache: 'no-cache' }),
          fetch(`/data/job-loss-viz/${year}-roles.json`, { cache: 'no-cache' }),
        ]);

        if (!ytdRes.ok) throw new Error(`Failed to load YTD data: ${ytdRes.status}`);
        if (!rolesRes.ok) throw new Error(`Failed to load Roles data: ${rolesRes.status}`);

        const rawYtd = await ytdRes.json();
        const rawRoles = await rolesRes.json();

        const parsedYtd = parseYtdPoints(rawYtd);
        const parsedRoles = parseRoleAggregates(rawRoles);

        if (!cancelled) {
          setYtdPoints(parsedYtd);
          setRoles(parsedRoles);
        }
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Unknown error');
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [year]);

  const ytdSeries = useMemo(() => {
    if (!ytdPoints) return [] as Array<{ ts: string; value: number }>;
    return buildSeriesFromYtd(ytdPoints.map((p) => ({ date: p.date, ytd_global_ai_job_losses: p.ytd_global_ai_job_losses })));
  }, [ytdPoints]);

  const latestSources: SourceRef[] = useMemo(() => {
    if (!ytdPoints || ytdPoints.length === 0) return [];
    const last = [...ytdPoints].sort((a, b) => a.date.localeCompare(b.date))[ytdPoints.length - 1];
    return toSourceRefs(last.sources);
  }, [ytdPoints]);
  
  const aggregatedSources: AggregatedSourceRef[] = useMemo(() => {
    if (!ytdPoints || ytdPoints.length === 0) return [];
    return aggregateSourcesFromYtd(ytdPoints);
  }, [ytdPoints]);
  
  const sourceDateRange = useMemo(() => {
    if (!ytdPoints || ytdPoints.length === 0) return undefined;
    return getSourceDateRange(ytdPoints);
  }, [ytdPoints]);
  
  const industries: IndustryAggregate[] = useMemo(() => {
    if (!roles || roles.length === 0) return [];
    
    const industryMap = aggregateRolesByIndustry(roles);
    
    return Object.entries(industryMap).map(([industry, data]) => ({
      industry,
      count: data.count,
      roles: data.roles,
      sources: Array.from(data.sources).map(url => ({ url }))
    })).sort((a, b) => b.count - a.count); // Sort by count descending
  }, [roles]);

  const lastUpdated = useMemo(() => {
    if (!ytdPoints || ytdPoints.length === 0) return undefined;
    return [...ytdPoints].sort((a, b) => a.date.localeCompare(b.date))[ytdPoints.length - 1].date;
  }, [ytdPoints]);

  return {
    ytdSeries,
    latestSources,
    aggregatedSources,
    sourceDateRange,
    roles: roles ?? [],
    industries: industries,
    lastUpdated,
    error,
  };
}
