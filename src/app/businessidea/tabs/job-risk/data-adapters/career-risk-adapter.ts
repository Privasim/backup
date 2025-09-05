import { DataDrivenInsightsModel, AutomationExposureItem } from '@/components/insights/types';

export interface ExposureThresholds {
  lowMax: number;   // <= lowMax => Low
  highMin: number;  // > highMin => High
}

export interface ExposureBuckets {
  low: number;
  moderate: number;
  high: number;
  total: number;
  percents: { low: number; moderate: number; high: number };
}

export interface CareerRiskVM {
  careerRiskIndex: number; // 0-100
  buckets: ExposureBuckets;
  drivers: string[]; // backend-provided threat drivers (top N)
}

export const DEFAULT_THRESHOLDS: ExposureThresholds = { lowMax: 40, highMin: 70 };

function clamp01(value: number, min = 0, max = 100) {
  const v = Number.isFinite(value) ? value : 0;
  return Math.max(min, Math.min(max, Math.round(v)));
}

export function computeExposureBuckets(
  items: AutomationExposureItem[] | undefined,
  thresholds: ExposureThresholds = DEFAULT_THRESHOLDS
): ExposureBuckets {
  const list = Array.isArray(items) ? items : [];
  let low = 0, moderate = 0, high = 0;

  for (const it of list) {
    const v = clamp01(it?.exposure);
    if (v > thresholds.highMin) high += 1;
    else if (v > thresholds.lowMax) moderate += 1;
    else low += 1;
  }

  const total = list.length;
  const toPct = (c: number) => (total > 0 ? Math.round((c / total) * 100) : 0);

  return {
    low,
    moderate,
    high,
    total,
    percents: {
      low: toPct(low),
      moderate: toPct(moderate),
      high: toPct(high),
    },
  };
}

export function buildCareerRiskVM(
  insights: DataDrivenInsightsModel,
  options?: { thresholds?: ExposureThresholds; topDrivers?: number }
): CareerRiskVM {
  const thresholds = options?.thresholds ?? DEFAULT_THRESHOLDS;
  const buckets = computeExposureBuckets(insights?.automationExposure, thresholds);
  const score = clamp01(insights?.riskScore ?? 0);
  const drivers = Array.isArray(insights?.threatDrivers)
    ? insights!.threatDrivers.slice(0, options?.topDrivers ?? 3)
    : [];

  return {
    careerRiskIndex: score,
    buckets,
    drivers,
  };
}
