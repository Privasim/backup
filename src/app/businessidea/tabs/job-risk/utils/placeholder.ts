import { CutSeries, CutSeriesPoint, ForecastSeries, ForecastPoint, SkillImpacts, RoleSkillMatrix, SkillClusterId, SKILL_CLUSTER_LABELS } from '../types';

// Simple deterministic PRNG (Mulberry32)
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function () {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function generateCutSeries(months = 24, seed = 42): CutSeries {
  const rand = mulberry32(seed);
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

  const series: CutSeries = [];
  let base = 50 + rand() * 25; // starting monthly cuts
  let trend = 1 + 0.02 + rand() * 0.01; // gentle upward trend

  for (let i = 0; i < months; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    // noise small, slight compounding trend
    const noise = (rand() - 0.5) * 5;
    base = base * trend + noise;
    series.push({ t: new Date(d), cuts: Math.max(0, Math.round(base)) });
  }

  // Last 3 months acceleration (~+20%)
  for (let i = series.length - 3; i < series.length; i++) {
    if (i >= 0) series[i].cuts = Math.round(series[i].cuts * 1.2);
  }

  // Ensure monotone-ish minimal non-decreasing constraint with small dips allowed
  for (let i = 1; i < series.length; i++) {
    if (series[i].cuts < series[i - 1].cuts * 0.85) {
      series[i].cuts = Math.round(series[i - 1].cuts * (0.88 + rand() * 0.06));
    }
  }

  return series;
}

export function computeVelocityInsights(series: CutSeries) {
  if (series.length < 6) return { accelerationPct: 0, volatileMonth: monthKey(new Date(series[series.length - 1].t as any)) };
  const last3 = series.slice(-3).reduce((s, p) => s + p.cuts, 0);
  const prev3 = series.slice(-6, -3).reduce((s, p) => s + p.cuts, 0);
  const accelerationPct = prev3 === 0 ? 0 : ((last3 - prev3) / prev3) * 100;

  // Volatility: month with largest absolute month-over-month diff
  let maxDiff = -Infinity;
  let idx = 1;
  for (let i = 1; i < series.length; i++) {
    const diff = Math.abs(series[i].cuts - series[i - 1].cuts);
    if (diff > maxDiff) { maxDiff = diff; idx = i; }
  }
  const volatileMonth = monthKey(new Date(series[idx].t as any));

  return { accelerationPct, volatileMonth };
}

export function generateSkillImpacts(seed = 7): SkillImpacts {
  const rand = mulberry32(seed);
  const clusters: SkillClusterId[] = ['cognitive_routine', 'analytical', 'creative', 'social', 'manual_routine'];

  return clusters.map((id) => {
    // set different base risks per cluster for visual variety
    const base = {
      cognitive_routine: 0.75 + rand() * 0.15,
      analytical: 0.55 + rand() * 0.25,
      creative: 0.35 + rand() * 0.25,
      social: 0.4 + rand() * 0.2,
      manual_routine: 0.65 + rand() * 0.2,
    }[id];

    return { skillGroupId: SKILL_CLUSTER_LABELS[id], impact: clamp(base, 0, 1), volume: Math.round(100 + rand() * 200) };
  });
}

export function generateRoleSkillMatrix(impacts: SkillImpacts, seed = 11): RoleSkillMatrix {
  const rand = mulberry32(seed);
  // 5 role clusters × N skill clusters matrix
  const roles = ['Operational', 'Analytical', 'Creative', 'Social', 'Technical'];
  const cols = impacts.length;
  const rows = roles.length;
  const mat: RoleSkillMatrix = Array.from({ length: rows }, () => Array(cols).fill(0));

  // Outer-product style with noise to keep chord visually plausible
  const roleWeights = roles.map(() => 0.5 + rand());
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = roleWeights[r] * (impacts[c].impact + 0.2) + rand() * 0.2;
      mat[r][c] = Math.round(clamp(v, 0, 1) * 100) / 100;
    }
  }
  return mat;
}

export function generateForecastSeries(history: CutSeries, horizon = 12, seed = 99): ForecastSeries {
  const rand = mulberry32(seed);
  // EMA on history
  const alpha = 0.3;
  let ema = history[0]?.cuts ?? 50;
  for (let i = 1; i < history.length; i++) {
    ema = alpha * history[i].cuts + (1 - alpha) * ema;
  }

  // future expected with mild upward drift and small noise
  const lastDate = new Date(history[history.length - 1].t as any);
  const out: ForecastSeries = [];
  let expected = ema;
  for (let i = 1; i <= horizon; i++) {
    const d = new Date(lastDate.getFullYear(), lastDate.getMonth() + i, 1);
    expected = expected * (1 + 0.02 + rand() * 0.01); // slight growth
    const spread = 0.12 + i * 0.01; // widening
    const p10 = expected * (1 - spread);
    const p90 = expected * (1 + spread);
    out.push({ t: d, expected: Math.round(expected), p10: Math.round(p10), p90: Math.round(p90) });
  }
  return out;
}

export function computeGlobalKPIs(series: CutSeries) {
  const recent = series.slice(-6);
  const prev = series.slice(-12, -6);
  const recentSum = recent.reduce((s, p) => s + p.cuts, 0);
  const prevSum = prev.length ? prev.reduce((s, p) => s + p.cuts, 0) : 0;
  const delta = prevSum ? ((recentSum - prevSum) / prevSum) * 100 : 0;
  const severity = recent[recent.length - 1]?.cuts ?? 0;
  let badge: 'low' | 'medium' | 'high' | 'very_high' = 'medium';
  if (severity > 250) badge = 'very_high';
  else if (severity > 180) badge = 'high';
  else if (severity < 80) badge = 'low';

  return {
    totalRecent: recentSum,
    recentDeltaPct: delta,
    riskBadge: badge,
  };
}
