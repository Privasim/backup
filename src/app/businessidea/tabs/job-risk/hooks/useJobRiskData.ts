"use client";

import { useEffect, useMemo, useState } from 'react';
import {
  CutSeries,
  ForecastSeries,
  InsightsBundle,
  SkillImpacts,
  RoleSkillMatrix,
  GlobalKPI,
} from '../types';
import {
  generateCutSeries,
  generateForecastSeries,
  generateSkillImpacts,
  generateRoleSkillMatrix,
  computeVelocityInsights,
  computeGlobalKPIs,
} from '../utils/placeholder';

export type UseJobRiskDataResult = {
  velocity: { data: CutSeries };
  skills: { impacts: SkillImpacts; matrix: RoleSkillMatrix };
  forecast: { history: CutSeries; forecast: ForecastSeries };
  insights: InsightsBundle;
  loading: boolean;
  error?: string;
};

export function useJobRiskData(): UseJobRiskDataResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  // For placeholders, compute synchronously and mark loading false on mount
  const history: CutSeries = useMemo(() => generateCutSeries(24, 42), []);
  const impacts: SkillImpacts = useMemo(() => generateSkillImpacts(7), []);
  const matrix: RoleSkillMatrix = useMemo(() => generateRoleSkillMatrix(impacts, 11), [impacts]);
  const forecast: ForecastSeries = useMemo(() => generateForecastSeries(history, 12, 99), [history]);

  const velocityInsights = useMemo(() => computeVelocityInsights(history), [history]);
  const globalKpisRaw = useMemo(() => computeGlobalKPIs(history), [history]);

  const insights: InsightsBundle = useMemo(() => {
    const global: GlobalKPI[] = [
      {
        label: 'Total (last 6 mo)',
        value: Intl.NumberFormat().format(globalKpisRaw.totalRecent),
        deltaLabel: `${globalKpisRaw.recentDeltaPct >= 0 ? '+' : ''}${globalKpisRaw.recentDeltaPct.toFixed(1)}% vs prior`,
        tone: globalKpisRaw.recentDeltaPct >= 0 ? 'negative' : 'positive',
      },
      {
        label: 'Risk Severity',
        value: globalKpisRaw.riskBadge.replace('_', ' ').replace(/\b\w/g, (m) => m.toUpperCase()),
      },
    ];

    const skillsTop = [...impacts]
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 3)
      .map((s) => s.skillGroupId)
      .join(', ');

    return {
      global,
      velocity: {
        title: 'Velocity Cuts',
        bullets: [
          `Acceleration (last 3 mo): ${velocityInsights.accelerationPct >= 0 ? '+' : ''}${velocityInsights.accelerationPct.toFixed(1)}%`,
          `Most volatile month: ${velocityInsights.volatileMonth}`,
        ],
      },
      skills: {
        title: 'Skill Automation',
        bullets: [
          `Top exposed clusters: ${skillsTop}`,
          `Above 0.7 impact: ${impacts.filter((s) => s.impact >= 0.7).length}/${impacts.length}`,
        ],
      },
      forecast: {
        title: 'Forecast',
        bullets: [
          `p90 peak around: ${new Date(forecast[forecast.length - 1]?.t as any).toISOString().slice(0, 7)}`,
          `Band widening across horizon: ${(12 + 0.01 * forecast.length * 100).toFixed(0)} bps`,
        ],
      },
    };
  }, [forecast, globalKpisRaw.recentDeltaPct, globalKpisRaw.riskBadge, globalKpisRaw.totalRecent, impacts, velocityInsights.accelerationPct, velocityInsights.volatileMonth]);

  useEffect(() => {
    // Simulate async; in future, fetch from ResearchDataService here.
    const t = setTimeout(() => {
      setLoading(false);
    }, 100);
    return () => clearTimeout(t);
  }, []);

  return {
    velocity: { data: history },
    skills: { impacts, matrix },
    forecast: { history, forecast },
    insights,
    loading,
    error,
  };
}
