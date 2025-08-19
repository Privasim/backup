// File: src/components/visualizations/cost-comparison-card.tsx
"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { DataDrivenInsightsModel } from '@/components/insights/types';
import { resolveCurrencyAndLocale, formatCurrency } from '@/components/insights/cost/locale';
import { CostModelConfig } from '@/components/insights/cost/types';
import { useCostComparison } from '@/components/insights/cost/useCostComparison';
import { InformationCircleIcon, ClipboardIcon } from '@heroicons/react/24/outline';

export interface CostComparisonCardProps {
  insights?: DataDrivenInsightsModel;
  profileLocation?: string;
  title?: string;
  className?: string;
  loading?: boolean;
  error?: string;
}

function LabeledNumberInput({
  id,
  label,
  value,
  onChange,
  min = 0,
  step = 1,
  placeholder,
  help,
}: {
  id: string;
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  min?: number;
  step?: number;
  placeholder?: string;
  help?: string;
}) {
  return (
    <label htmlFor={id} className="block text-sm">
      <span className="text-gray-700">{label}</span>
      <input
        id={id}
        type="number"
        value={value ?? ''}
        inputMode="decimal"
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 text-sm"
        min={min}
        step={step}
        placeholder={placeholder}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw.trim() === '') onChange(undefined);
          else onChange(Number(raw));
        }}
        aria-describedby={help ? `${id}-help` : undefined}
      />
      {help && (
        <div id={`${id}-help`} className="mt-1 text-xs text-gray-500 flex items-start gap-1">
          <InformationCircleIcon className="h-4 w-4 mt-0.5" />
          <span>{help}</span>
        </div>
      )}
    </label>
  );
}

export function CostComparisonCard({ insights, profileLocation, title = 'Human vs AI Cost Comparison', className, loading = false, error }: CostComparisonCardProps) {
  const loc = useMemo(() => resolveCurrencyAndLocale(profileLocation), [profileLocation]);

  const [persist, setPersist] = useState<boolean>(false);
  const storageKey = useMemo(() => `cost-cfg:${profileLocation ?? 'unknown'}`, [profileLocation]);

  const [cfg, setCfg] = useState<CostModelConfig | undefined>(undefined);

  // Initialize config from profile location and (optionally) localStorage
  useEffect(() => {
    // Provide sensible defaults for the cost model configuration
    const baseCfg: CostModelConfig = {
      currency: loc.currency,
      locale: loc.locale,
      human: {
        baseMonthly: 5000, // Default monthly salary
        benefitsRate: 0.3, // 30% benefits
        overheadRate: 0.2, // 20% overhead
        toolingMonthly: 100,
        trainingMonthly: 200,
        managementOversightHours: 10,
        hourlyRate: 50
      },
      ai: {
        modelUsagePer1kTokens: 0.002, // Default token cost
        estTokensPerTask: 1000,
        tasksPerMonth: 500,
        subscriptionsMonthly: 50,
        infraMonthly: 100,
        orchestrationMonthly: 50,
        oversightHours: 5,
        oversightHourlyRate: 50,
        oneOffSetupCost: 2000
      },
      analysis: { automationWeighting: 'mean' },
    };
    if (persist) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          setCfg({ ...baseCfg, ...parsed, currency: loc.currency, locale: loc.locale });
          return;
        }
      } catch {}
    }
    setCfg(baseCfg);
  }, [loc.currency, loc.locale, persist, storageKey]);

  // Persist changes when enabled
  useEffect(() => {
    if (!persist || !cfg) return;
    try {
      const toSave = JSON.stringify(cfg);
      localStorage.setItem(storageKey, toSave);
    } catch {}
  }, [persist, cfg, storageKey]);

  const { state, result } = useCostComparison(insights, cfg);
  
  // Debug logging to help identify issues
  useEffect(() => {
    if (!state.ok && state.errors.length > 0) {
      console.debug('CostComparisonCard: Errors in cost comparison calculation', {
        errors: state.errors,
        warnings: state.warnings,
        insights: !!insights,
        cfg: cfg
      });
    }
  }, [state, insights, cfg]);

  const copySummary = () => {
    if (!result) return;
    const lines: string[] = [];
    lines.push(`${title}`);
    lines.push(`Coverage: ${result.coverage.automationCoveragePct.toFixed(1)}% (${result.coverage.method})`);
    lines.push(`Human monthly: ${formatCurrency(result.human.totalMonthly, result.currency, loc.locale)}`);
    lines.push(`AI monthly: ${formatCurrency(result.ai.totalMonthly, result.currency, loc.locale)}`);
    lines.push(`Savings monthly: ${formatCurrency(result.savings.absoluteMonthly, result.currency, loc.locale)} (${result.savings.relativePct.toFixed(1)}%)`);
    if (result.oneOff.aiSetupCost) {
      lines.push(`AI Setup (one-off): ${formatCurrency(result.oneOff.aiSetupCost, result.currency, loc.locale)}`);
      if (result.oneOff.breakEvenMonths) lines.push(`Break-even: ${result.oneOff.breakEvenMonths} months`);
    }
    navigator.clipboard?.writeText(lines.join('\n')).catch(() => {});
  };

  const ready = state.ok && !!result;

  // Import the CardSkeletonLoader component
  const { CardSkeletonLoader } = require('@/components/ui/SkeletonLoader');

  if (loading) {
    return (
      <section className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm ${className ?? ''}`} aria-labelledby="cost-card-title">
        <div className="flex items-center justify-between mb-4">
          <h3 id="cost-card-title" className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <CardSkeletonLoader />
      </section>
    );
  }

  if (error) {
    return (
      <section className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm ${className ?? ''}`} aria-labelledby="cost-card-title">
        <div className="flex items-center justify-between mb-4">
          <h3 id="cost-card-title" className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="p-4 rounded-md bg-red-50 border border-red-200">
          <p className="text-red-700">{error}</p>
          <p className="text-sm text-red-600 mt-2">Please try again or contact support if the issue persists.</p>
        </div>
      </section>
    );
  }

  return (
    <section className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm ${className ?? ''}`} aria-labelledby="cost-card-title">
      <div className="flex items-center justify-between">
        <div>
          <h3 id="cost-card-title" className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="mt-1 text-xs text-gray-600 flex items-center gap-2">
            <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5">{loc.currency} • {loc.locale}</span>
            {loc.warning && <span className="text-amber-600">{loc.warning}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-700 inline-flex items-center gap-2">
            <input type="checkbox" className="rounded border-gray-300" checked={persist} onChange={(e) => setPersist(e.target.checked)} />
            Persist config
          </label>
          <button
            type="button"
            onClick={copySummary}
            className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
            aria-label="Copy cost comparison summary"
          >
            <ClipboardIcon className="h-4 w-4" /> Copy
          </button>
        </div>
      </div>

      {/* Inline Config */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-800">Coverage method</div>
          <label className="block text-sm">
            <span className="text-gray-700">Automation weighting</span>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 text-sm"
              value={cfg?.analysis.automationWeighting ?? 'mean'}
              onChange={(e) => setCfg((prev) => prev ? { ...prev, analysis: { ...prev.analysis, automationWeighting: e.target.value as any } } : prev)}
            >
              <option value="mean">Mean</option>
              <option value="topN">Top N</option>
              <option value="threshold">Threshold</option>
            </select>
          </label>
          {cfg?.analysis.automationWeighting === 'topN' && (
            <LabeledNumberInput id="topN" label="Top N tasks" value={cfg.analysis.topN} min={1} step={1} onChange={(v) => setCfg((p) => p ? { ...p, analysis: { ...p.analysis, topN: v } } : p)} />
          )}
          {cfg?.analysis.automationWeighting === 'threshold' && (
            <LabeledNumberInput id="threshold" label="Exposure threshold (0-100)" value={cfg.analysis.exposureThreshold} min={0} step={1} onChange={(v) => setCfg((p) => p ? { ...p, analysis: { ...p.analysis, exposureThreshold: v } } : p)} />
          )}
        </div>

        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-800">Human (monthly)</div>
          <LabeledNumberInput id="human-base" label="Base salary" value={cfg?.human.baseMonthly} step={100} onChange={(v) => setCfg((p) => p ? { ...p, human: { ...p.human, baseMonthly: v } } : p)} />
          <LabeledNumberInput id="human-benefits" label="Benefits rate (0-1)" value={cfg?.human.benefitsRate} step={0.01} onChange={(v) => setCfg((p) => p ? { ...p, human: { ...p.human, benefitsRate: v } } : p)} />
          <LabeledNumberInput id="human-overhead" label="Overhead rate (0-1)" value={cfg?.human.overheadRate} step={0.01} onChange={(v) => setCfg((p) => p ? { ...p, human: { ...p.human, overheadRate: v } } : p)} />
          <LabeledNumberInput id="human-tooling" label="Tooling" value={cfg?.human.toolingMonthly} step={10} onChange={(v) => setCfg((p) => p ? { ...p, human: { ...p.human, toolingMonthly: v } } : p)} />
          <LabeledNumberInput id="human-training" label="Training" value={cfg?.human.trainingMonthly} step={10} onChange={(v) => setCfg((p) => p ? { ...p, human: { ...p.human, trainingMonthly: v } } : p)} />
          <LabeledNumberInput id="human-mgmt-hours" label="Mgmt oversight hours" value={cfg?.human.managementOversightHours} step={1} onChange={(v) => setCfg((p) => p ? { ...p, human: { ...p.human, managementOversightHours: v } } : p)} />
          <LabeledNumberInput id="human-hourly" label="Hourly rate (for oversight)" value={cfg?.human.hourlyRate} step={10} onChange={(v) => setCfg((p) => p ? { ...p, human: { ...p.human, hourlyRate: v } } : p)} />
        </div>

        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-800">AI (monthly)</div>
          <LabeledNumberInput id="ai-per1k" label="Model price per 1k tokens" value={cfg?.ai.modelUsagePer1kTokens} step={0.001} onChange={(v) => setCfg((p) => p ? { ...p, ai: { ...p.ai, modelUsagePer1kTokens: v } } : p)} />
          <LabeledNumberInput id="ai-tokens-per-task" label="Tokens per task" value={cfg?.ai.estTokensPerTask} step={10} onChange={(v) => setCfg((p) => p ? { ...p, ai: { ...p.ai, estTokensPerTask: v } } : p)} />
          <LabeledNumberInput id="ai-tasks-per-month" label="Tasks per month" value={cfg?.ai.tasksPerMonth} step={1} onChange={(v) => setCfg((p) => p ? { ...p, ai: { ...p.ai, tasksPerMonth: v } } : p)} />
          <LabeledNumberInput id="ai-subs" label="Subscriptions" value={cfg?.ai.subscriptionsMonthly} step={10} onChange={(v) => setCfg((p) => p ? { ...p, ai: { ...p.ai, subscriptionsMonthly: v } } : p)} />
          <LabeledNumberInput id="ai-infra" label="Infrastructure" value={cfg?.ai.infraMonthly} step={10} onChange={(v) => setCfg((p) => p ? { ...p, ai: { ...p.ai, infraMonthly: v } } : p)} />
          <LabeledNumberInput id="ai-orch" label="Orchestration" value={cfg?.ai.orchestrationMonthly} step={10} onChange={(v) => setCfg((p) => p ? { ...p, ai: { ...p.ai, orchestrationMonthly: v } } : p)} />
          <LabeledNumberInput id="ai-oversight-hours" label="Oversight hours" value={cfg?.ai.oversightHours} step={1} onChange={(v) => setCfg((p) => p ? { ...p, ai: { ...p.ai, oversightHours: v } } : p)} />
          <LabeledNumberInput id="ai-oversight-rate" label="Oversight hourly rate" value={cfg?.ai.oversightHourlyRate} step={10} onChange={(v) => setCfg((p) => p ? { ...p, ai: { ...p.ai, oversightHourlyRate: v } } : p)} />
          <LabeledNumberInput id="ai-setup" label="One-off setup cost" value={cfg?.ai.oneOffSetupCost} step={100} onChange={(v) => setCfg((p) => p ? { ...p, ai: { ...p.ai, oneOffSetupCost: v } } : p)} />
        </div>
      </div>

      {/* States */}
      {!ready && (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-800" role="status" aria-live="polite">
          <div className="font-medium">Insufficient data</div>
          <ul className="list-disc ml-5 mt-1 text-sm">
            {state.errors.map((e, idx) => (<li key={idx}>{e}</li>))}
          </ul>
        </div>
      )}

      {ready && result && (
        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5">Automation coverage: {result.coverage.automationCoveragePct.toFixed(1)}% ({result.coverage.method})</span>
            {state.warnings.map((w, i) => (
              <span key={i} className="text-amber-700">{w}</span>
            ))}
          </div>

          {/* Comparison bars */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 rounded border">
              <div className="text-sm font-medium text-gray-700">Human monthly</div>
              <div className="mt-1 text-xl font-semibold text-gray-900">{formatCurrency(result.human.totalMonthly, result.currency, loc.locale)}</div>
              <div className="mt-2 h-3 w-full rounded bg-gray-100">
                <div className="h-3 rounded bg-red-500" style={{ width: '100%' }} aria-label="Human cost bar" />
              </div>
            </div>
            <div className="p-3 rounded border">
              <div className="text-sm font-medium text-gray-700">AI monthly</div>
              <div className="mt-1 text-xl font-semibold text-gray-900">{formatCurrency(result.ai.totalMonthly, result.currency, loc.locale)}</div>
              <div className="mt-2 h-3 w-full rounded bg-gray-100">
                <div className="h-3 rounded bg-green-500" style={{ width: `${Math.max(2, Math.min(100, (result.ai.totalMonthly / Math.max(1, result.human.totalMonthly)) * 100))}%` }} aria-label="AI cost bar" />
              </div>
            </div>
          </div>

          {/* Savings */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded bg-green-50 px-3 py-1 text-green-700 ring-1 ring-inset ring-green-600/20">
              Monthly savings: {formatCurrency(result.savings.absoluteMonthly, result.currency, loc.locale)} ({result.savings.relativePct.toFixed(1)}%)
            </span>
            {typeof result.oneOff.aiSetupCost === 'number' && (
              <span className="inline-flex items-center rounded bg-blue-50 px-3 py-1 text-blue-700 ring-1 ring-inset ring-blue-600/20">
                Break-even: {result.oneOff.breakEvenMonths ?? '—'} months
              </span>
            )}
          </div>

          {/* Breakdown tables */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-800">Human breakdown</div>
              <table className="mt-2 w-full text-sm">
                <thead>
                  <tr className="text-gray-500">
                    <th className="text-left font-normal">Item</th>
                    <th className="text-right font-normal">Monthly</th>
                    <th className="text-right font-normal">Annual</th>
                  </tr>
                </thead>
                <tbody>
                  {result.human.breakdown.slice(0, 6).map((b, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-1 pr-2">{b.label}</td>
                      <td className="py-1 text-right">{formatCurrency(b.monthly, result.currency, loc.locale)}</td>
                      <td className="py-1 text-right">{formatCurrency(b.annual, result.currency, loc.locale)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-800">AI breakdown</div>
              <table className="mt-2 w-full text-sm">
                <thead>
                  <tr className="text-gray-500">
                    <th className="text-left font-normal">Item</th>
                    <th className="text-right font-normal">Monthly</th>
                    <th className="text-right font-normal">Annual</th>
                  </tr>
                </thead>
                <tbody>
                  {result.ai.breakdown.slice(0, 8).map((b, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-1 pr-2">{b.label}</td>
                      <td className="py-1 text-right">{formatCurrency(b.monthly, result.currency, loc.locale)}</td>
                      <td className="py-1 text-right">{formatCurrency(b.annual, result.currency, loc.locale)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
