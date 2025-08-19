// File: src/components/insights/cost/cost-model.ts
import { DataDrivenInsightsModel } from '@/components/insights/types';
import {
  CostBreakdown,
  CostModelAnalysisConfig,
  CostModelConfig,
} from './types';

function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

function nonNeg(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n >= 0;
}

function rate01(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 1;
}

export function validateConfig(cfg?: CostModelConfig): string[] {
  const errors: string[] = [];
  if (!cfg) {
    return ['Missing cost configuration'];
  }
  if (!cfg.currency) errors.push('Missing currency');
  if (!cfg.locale) errors.push('Missing locale');

  // Human required fields
  if (!nonNeg(cfg.human.baseMonthly ?? NaN)) errors.push('Human baseMonthly must be a non-negative number');
  if (!rate01(cfg.human.benefitsRate ?? NaN)) errors.push('Human benefitsRate must be in [0,1]');
  if (!rate01(cfg.human.overheadRate ?? NaN)) errors.push('Human overheadRate must be in [0,1]');

  // Optional numeric non-negative checks
  const optionalHuman: Array<[string, unknown]> = [
    ['toolingMonthly', cfg.human.toolingMonthly],
    ['trainingMonthly', cfg.human.trainingMonthly],
    ['managementOversightHours', cfg.human.managementOversightHours],
    ['hourlyRate', cfg.human.hourlyRate],
  ];
  for (const [key, val] of optionalHuman) {
    if (val !== undefined && !nonNeg(val)) errors.push(`Human ${key} must be non-negative`);
  }

  // AI required minimal fields
  if (!nonNeg(cfg.ai.modelUsagePer1kTokens ?? NaN)) errors.push('AI modelUsagePer1kTokens must be non-negative');
  if (!nonNeg(cfg.ai.estTokensPerTask ?? NaN)) errors.push('AI estTokensPerTask must be non-negative');
  if (!nonNeg(cfg.ai.tasksPerMonth ?? NaN)) errors.push('AI tasksPerMonth must be non-negative');

  const optionalAi: Array<[string, unknown]> = [
    ['subscriptionsMonthly', cfg.ai.subscriptionsMonthly],
    ['infraMonthly', cfg.ai.infraMonthly],
    ['orchestrationMonthly', cfg.ai.orchestrationMonthly],
    ['oversightHours', cfg.ai.oversightHours],
    ['oversightHourlyRate', cfg.ai.oversightHourlyRate],
    ['oneOffSetupCost', cfg.ai.oneOffSetupCost],
  ];
  for (const [key, val] of optionalAi) {
    if (val !== undefined && !nonNeg(val)) errors.push(`AI ${key} must be non-negative`);
  }

  // Analysis config
  if (!cfg.analysis || !cfg.analysis.automationWeighting) {
    errors.push('Missing analysis.automationWeighting');
  } else {
    if (
      cfg.analysis.automationWeighting === 'topN' &&
      (!Number.isFinite(cfg.analysis.topN as number) || (cfg.analysis.topN as number) <= 0)
    ) {
      errors.push('analysis.topN must be > 0 when automationWeighting = topN');
    }
    if (
      cfg.analysis.automationWeighting === 'threshold' &&
      (!Number.isFinite(cfg.analysis.exposureThreshold as number) || (cfg.analysis.exposureThreshold as number) < 0 || (cfg.analysis.exposureThreshold as number) > 100)
    ) {
      errors.push('analysis.exposureThreshold must be in [0,100] when automationWeighting = threshold');
    }
  }

  return errors;
}

export function computeAutomationCoverage(
  insights: DataDrivenInsightsModel,
  analysis: CostModelAnalysisConfig
): { coveragePct: number; method: string } {
  const items = insights.automationExposure || [];
  if (!items.length) {
    return { coveragePct: 0, method: `${analysis.automationWeighting} (no tasks)` };
  }
  const exposures = items.map((t) => clamp(t.exposure ?? 0, 0, 100));
  let pct = 0;
  let method = analysis.automationWeighting;
  if (analysis.automationWeighting === 'mean') {
    pct = exposures.reduce((a, b) => a + b, 0) / exposures.length;
  } else if (analysis.automationWeighting === 'topN') {
    const n = Math.min(exposures.length, Math.max(1, Math.floor(analysis.topN as number)));
    const sorted = exposures.slice().sort((a, b) => b - a);
    const top = sorted.slice(0, n);
    pct = top.reduce((a, b) => a + b, 0) / top.length;
    method = `top${n}`;
  } else if (analysis.automationWeighting === 'threshold') {
    const thr = clamp((analysis.exposureThreshold as number) ?? 0, 0, 100);
    const count = exposures.filter((e) => e >= thr).length;
    pct = (count / exposures.length) * 100;
    method = `threshold≥${thr}`;
  }
  return { coveragePct: clamp(pct, 0, 100), method };
}

export function computeHumanMonthly(cfg: CostModelConfig): { total: number; breakdown: CostBreakdown[] } {
  const base = cfg.human.baseMonthly as number;
  const benefits = base * (cfg.human.benefitsRate as number);
  const overhead = base * (cfg.human.overheadRate as number);
  const tooling = cfg.human.toolingMonthly ?? 0;
  const training = cfg.human.trainingMonthly ?? 0;
  const mgmtHours = cfg.human.managementOversightHours ?? 0;
  const hourly = cfg.human.hourlyRate ?? 0;
  const mgmt = mgmtHours * hourly;

  const breakdown: CostBreakdown[] = [
    { label: 'Base Salary', monthly: base, annual: base * 12 },
    { label: 'Benefits', monthly: benefits, annual: benefits * 12 },
    { label: 'Overhead', monthly: overhead, annual: overhead * 12 },
  ];
  if (tooling) breakdown.push({ label: 'Tooling', monthly: tooling, annual: tooling * 12 });
  if (training) breakdown.push({ label: 'Training', monthly: training, annual: training * 12 });
  if (mgmt) breakdown.push({ label: 'Management Oversight', monthly: mgmt, annual: mgmt * 12 });

  const total = breakdown.reduce((sum, i) => sum + i.monthly, 0);
  return { total, breakdown };
}

export function computeAiMonthly(
  cfg: CostModelConfig,
  coveragePct: number
): { total: number; breakdown: CostBreakdown[] } {
  const tokensPerTask = cfg.ai.estTokensPerTask as number;
  const tpm = cfg.ai.tasksPerMonth as number;
  const per1k = cfg.ai.modelUsagePer1kTokens as number;
  const usage = (tpm * tokensPerTask * per1k) / 1000;

  const subs = cfg.ai.subscriptionsMonthly ?? 0;
  const infra = cfg.ai.infraMonthly ?? 0;
  const orchestration = cfg.ai.orchestrationMonthly ?? 0;
  const oversightH = cfg.ai.oversightHours ?? 0;
  const oversightRate = cfg.ai.oversightHourlyRate ?? 0;
  const oversight = oversightH * oversightRate;

  const breakdown: CostBreakdown[] = [
    { label: 'Model Usage', monthly: usage, annual: usage * 12, note: `${tpm} tasks/mo • ${tokensPerTask} tok/task • ${per1k}/1k tok` },
  ];
  if (subs) breakdown.push({ label: 'Subscriptions', monthly: subs, annual: subs * 12 });
  if (infra) breakdown.push({ label: 'Infrastructure', monthly: infra, annual: infra * 12 });
  if (orchestration) breakdown.push({ label: 'Orchestration', monthly: orchestration, annual: orchestration * 12 });
  if (oversight) breakdown.push({ label: 'Human Oversight', monthly: oversight, annual: oversight * 12 });

  const total = breakdown.reduce((sum, i) => sum + i.monthly, 0);
  return { total, breakdown };
}

export function computeSavings(humanMonthly: number, aiMonthly: number) {
  const absoluteMonthly = humanMonthly - aiMonthly;
  const absoluteAnnual = absoluteMonthly * 12;
  const denom = humanMonthly === 0 ? 1 : humanMonthly;
  const relativePct = (absoluteMonthly / denom) * 100;
  return { absoluteMonthly, absoluteAnnual, relativePct };
}

export function computeBreakEven(oneOffSetup: number | undefined, monthlySavings: number): number | undefined {
  if (!nonNeg(oneOffSetup) || monthlySavings <= 0) return undefined;
  return Math.ceil((oneOffSetup as number) / monthlySavings);
}
