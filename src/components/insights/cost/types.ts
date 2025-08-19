// File: src/components/insights/cost/types.ts
export interface CostModelHumanConfig {
  // Required minimal fields
  baseMonthly?: number; // currency units per month
  benefitsRate?: number; // 0..1
  overheadRate?: number; // 0..1
  // Optional contributors
  toolingMonthly?: number; // subscriptions, licenses
  trainingMonthly?: number; // courses, learning
  managementOversightHours?: number; // hours per month
  hourlyRate?: number; // if provided, used with managementOversightHours
}

export interface CostModelAiConfig {
  // Required minimal fields
  modelUsagePer1kTokens?: number; // currency per 1000 tokens
  estTokensPerTask?: number; // tokens per task
  tasksPerMonth?: number; // tasks executed per month
  // Optional contributors
  subscriptionsMonthly?: number; // tool subscriptions
  infraMonthly?: number; // infra costs
  orchestrationMonthly?: number; // agent/orchestration platform
  oversightHours?: number; // human oversight hours per month
  oversightHourlyRate?: number; // hourly cost of oversight
  oneOffSetupCost?: number; // AI setup one-time
}

export type AutomationWeighting = 'mean' | 'topN' | 'threshold';

export interface CostModelAnalysisConfig {
  automationWeighting: AutomationWeighting;
  topN?: number; // when automationWeighting = 'topN'
  exposureThreshold?: number; // 0..100 when automationWeighting = 'threshold'
  timeHorizonMonths?: number; // for break-even reporting (optional)
}

export interface CostModelConfig {
  currency: string; // e.g., USD
  locale: string; // e.g., en-US
  human: CostModelHumanConfig;
  ai: CostModelAiConfig;
  analysis: CostModelAnalysisConfig;
}

export interface CostBreakdown {
  label: string;
  monthly: number; // >= 0
  annual: number; // monthly * 12
  note?: string;
}

export interface CostSideTotals {
  totalMonthly: number;
  totalAnnual: number;
  breakdown: CostBreakdown[];
}

export interface CostComparisonResult {
  currency: string;
  coverage: { automationCoveragePct: number; method: string };
  human: CostSideTotals;
  ai: CostSideTotals;
  savings: { absoluteMonthly: number; absoluteAnnual: number; relativePct: number };
  oneOff: { aiSetupCost?: number; breakEvenMonths?: number };
}

export interface CostComparisonState {
  ok: boolean;
  errors: string[];
  warnings: string[];
}
