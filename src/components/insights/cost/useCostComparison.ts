// File: src/components/insights/cost/useCostComparison.ts
import { useMemo } from 'react';
import { DataDrivenInsightsModel } from '@/components/insights/types';
import { CostComparisonResult, CostComparisonState, CostModelConfig } from './types';
import {
  computeAutomationCoverage,
  computeBreakEven,
  computeAiMonthly,
  computeHumanMonthly,
  computeSavings,
  validateConfig,
} from './cost-model';

export function useCostComparison(
  insights: DataDrivenInsightsModel | undefined,
  cfg: CostModelConfig | undefined
): { state: CostComparisonState; result?: CostComparisonResult } {
  return useMemo(() => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!insights) {
      return { state: { ok: false, errors: ['Missing insights'], warnings } };
    }

    const exposure = insights.automationExposure || [];
    if (!exposure.length) {
      errors.push('Missing automation exposure data in insights');
    }

    const cfgErrors = validateConfig(cfg);
    errors.push(...cfgErrors);

    if (errors.length) {
      return { state: { ok: false, errors, warnings } };
    }

    const coverage = computeAutomationCoverage(insights, cfg!.analysis);
    const human = computeHumanMonthly(cfg!);
    const ai = computeAiMonthly(cfg!, coverage.coveragePct);
    const savings = computeSavings(human.total, ai.total);
    const breakEvenMonths = computeBreakEven(cfg!.ai.oneOffSetupCost, savings.absoluteMonthly);

    const result: CostComparisonResult = {
      currency: cfg!.currency,
      coverage: { automationCoveragePct: coverage.coveragePct, method: coverage.method },
      human: { totalMonthly: human.total, totalAnnual: human.total * 12, breakdown: human.breakdown },
      ai: { totalMonthly: ai.total, totalAnnual: ai.total * 12, breakdown: ai.breakdown },
      savings: {
        absoluteMonthly: savings.absoluteMonthly,
        absoluteAnnual: savings.absoluteAnnual,
        relativePct: savings.relativePct,
      },
      oneOff: { aiSetupCost: cfg!.ai.oneOffSetupCost, breakEvenMonths },
    };

    return { state: { ok: true, errors: [], warnings }, result };
  }, [insights, cfg]);
}
