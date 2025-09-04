// File: src/components/visualizations/cost-comparison-card.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useCostComparison } from '@/hooks/use-cost-comparison';
import type { CostComparisonConfig } from '@/hooks/use-cost-comparison';
import { Skeleton } from '../ui/skeleton';
import { AlertCircle, Copy, Info, Settings, ChevronDown, ChevronUp, X, DollarSign, BarChart3, AlertTriangle, TrendingDown } from 'lucide-react';

export interface CostComparisonCardProps {
  insights?: any;
  profileLocation?: string;
  title?: string;
  className?: string;
  loading?: boolean;
  error?: string;
  defaultConfig?: CostComparisonConfig;
  persistKey?: string;
  showSettings?: boolean;
}

// CostComparisonConfig is imported from '@/hooks/use-cost-comparison'

// Subcomponent for number inputs with labels
function LabeledNumberInput({
  label,
  value,
  onChange,
  min = 0,
  max = 1000,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex flex-col">
      <label className="text-caption text-secondary mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const newValue = parseFloat(e.target.value);
          if (!isNaN(newValue) && newValue >= min && newValue <= max) {
            onChange(newValue);
          }
        }}
        min={min}
        max={max}
        className="border border-default rounded-md px-3 py-2 text-body focus-ring"
      />
    </div>
  );
}

export function CostComparisonCard({
  className = '',
  defaultConfig,
  persistKey = 'cost-comparison-config',
  showSettings = true,
  insights,
  profileLocation,
  title = 'Cost Comparison',
  loading: externalLoading,
  error: externalError,
}: CostComparisonCardProps) {
  // State for configuration panel
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState<CostComparisonConfig>(defaultConfig || {
    humanHourlyCost: 50,
    aiHourlyCost: 15,
    hoursPerWeek: 40,
    weeksPerYear: 50,
  });

  // Load saved configuration from localStorage if available
  useEffect(() => {
    if (typeof window === 'undefined' || !persistKey) return;
    
    const savedConfig = localStorage.getItem(persistKey);
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig((prev: CostComparisonConfig) => ({
          ...prev,
          ...parsed,
        }));
      } catch (e) {
        console.error('Failed to parse saved cost comparison config', e);
      }
    }
  }, [persistKey]);

  // Save configuration to localStorage when it changes
  useEffect(() => {
    if (typeof window === 'undefined' || !persistKey) return;
    localStorage.setItem(persistKey, JSON.stringify(config));
  }, [config, persistKey]);

  // Use the cost comparison hook
  const { data, loading: internalLoading, error: internalError } = useCostComparison(config);
  
  // Combine internal and external loading/error states
  const loading = externalLoading || internalLoading;
  const error = externalError || internalError;

  // Handle copy summary to clipboard
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    if (!data) return;
    
    const summaryText = `Job Displacement Analysis Summary\n\n` +
      `Human Labor Cost: $${data.humanCost.toLocaleString()} per year\n` +
      `AI Replacement Cost: $${data.aiCost.toLocaleString()} per year\n` +
      `Job Displacement Cost: $${data.jobDisplacementCost.toLocaleString()} per year (${data.jobDisplacementPercentage}%)\n\n` +
      `Configuration:\n` +
      `- Human Hourly Cost: $${config.humanHourlyCost}\n` +
      `- AI Hourly Cost: $${config.aiHourlyCost}\n` +
      `- Hours Per Week: ${config.hoursPerWeek}\n` +
      `- Weeks Per Year: ${config.weeksPerYear}`;
    
    navigator.clipboard?.writeText(summaryText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  // Update a single config value
  const updateConfig = (key: keyof CostComparisonConfig, value: number) => {
    setConfig((prev: CostComparisonConfig) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (loading) {
    return (
      <div className={`card-elevated p-4 animate-fade-in transition-all duration-300 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-error-100 p-2 rounded-full">
            <AlertTriangle className="h-5 w-5 text-error-600" />
          </div>
          <h3 className="text-subheading text-primary">{title || 'Job Displacement Analysis'}</h3>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-6 w-full rounded-md" />
          <Skeleton className="h-32 w-full rounded-md" />
          <Skeleton className="h-24 w-full rounded-md" />
          <Skeleton className="h-24 w-full rounded-md" />
          <Skeleton className="h-4 w-1/2 rounded-md" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`card-elevated p-4 animate-fade-in transition-all duration-300 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-error-100 p-2 rounded-full">
            <AlertCircle className="h-5 w-5 text-error-600" />
          </div>
          <h3 className="text-subheading text-primary">{title || 'Job Displacement Analysis'}</h3>
        </div>
        <div className="rounded-lg p-3 border border-error-200 bg-error-50">
          <p className="text-body text-error-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`card-elevated p-4 animate-fade-in transition-all duration-300 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-error-100 p-2 rounded-full">
          <AlertTriangle className="h-5 w-5 text-error-600" />
        </div>
        <h3 className="text-subheading text-primary">{title || 'Job Displacement Analysis'}</h3>
        <div className="ml-auto flex items-center gap-2">
          {showSettings && (
            <button 
              onClick={() => setShowConfig(!showConfig)} 
              className="p-2 text-secondary hover:text-primary hover:bg-neutral-100 rounded-full transition-colors focus-ring"
              aria-label="Toggle configuration panel"
              aria-expanded={showConfig}
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
          <button 
            onClick={handleCopy} 
            className="p-2 text-secondary hover:text-primary hover:bg-neutral-100 rounded-full transition-colors focus-ring"
              aria-label="Copy job displacement analysis to clipboard"
          >
            <Copy className="h-4 w-4" />
            {copied && <span className="sr-only">Copied!</span>}
          </button>
        </div>
      </div>

      {/* Configuration Panel */}
      {showConfig && (
        <div className="bg-hero rounded-lg p-4 border border-default mb-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-label text-primary">Configuration</h4>
            <button 
              onClick={() => setShowConfig(false)}
              className="p-1.5 text-secondary hover:text-primary rounded-full focus-ring"
              aria-label="Close configuration panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <LabeledNumberInput 
              label="Human Hourly Cost ($)"
              value={config.humanHourlyCost}
              onChange={(value) => updateConfig('humanHourlyCost', value)}
              min={1}
              max={1000}
            />
            <LabeledNumberInput 
              label="AI Hourly Cost ($)"
              value={config.aiHourlyCost}
              onChange={(value) => updateConfig('aiHourlyCost', value)}
              min={1}
              max={1000}
            />
            <LabeledNumberInput 
              label="Hours Per Week"
              value={config.hoursPerWeek}
              onChange={(value) => updateConfig('hoursPerWeek', value)}
              min={1}
              max={168}
            />
            <LabeledNumberInput 
              label="Weeks Per Year"
              value={config.weeksPerYear}
              onChange={(value) => updateConfig('weeksPerYear', value)}
              min={1}
              max={52}
            />
          </div>
        </div>
      )}

      {/* Job Displacement Analysis */}
      {data && (
        <div className="space-y-4">
          {/* Summary - Warning about job displacement */}
          <div className="bg-error-50 rounded-lg p-3 border border-error-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-error-600" />
              <p className="text-label text-primary">
                Potential job displacement cost of ${data.jobDisplacementCost.toLocaleString()} per year 
                <span className="badge-base badge-error ml-1">{data.jobDisplacementPercentage}%</span>
              </p>
            </div>
          </div>
          
          {/* Gauge Chart for Job Displacement */}
          <div className="p-4 rounded-lg border border-error-200 bg-surface">
            <h4 className="text-label text-primary mb-3 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-error-600" />
              Job Displacement Impact
            </h4>
            <div className="relative h-32 w-full">
              {/* Semi-circular gauge */}
              <div className="absolute inset-0 flex justify-center">
                <div className="relative w-full max-w-xs">
                  {/* Gauge background */}
                  <div className="h-32 w-full bg-neutral-100 rounded-t-full overflow-hidden">
                    {/* Gauge fill - represents job displacement percentage */}
                    <div 
                      className="h-full bg-gradient-to-r from-warning-500 to-error-500 rounded-t-full"
                      style={{ width: `${data.jobDisplacementPercentage}%` }}
                    />
                  </div>
                  
                  {/* Gauge needle */}
                  <div 
                    className="absolute bottom-0 left-1/2 h-28 w-1 bg-error-700 origin-bottom transform -translate-x-1/2"
                    style={{ transform: `translateX(-50%) rotate(${(data.jobDisplacementPercentage / 100) * 180 - 90}deg)` }}
                  >
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-error-700 rounded-full" />
                  </div>
                  
                  {/* Percentage display */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-subheading font-bold text-error-700">
                    {data.jobDisplacementPercentage}%
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Cost Comparison Chart */}
          <div className="p-4 rounded-lg border border-default bg-surface">
            <h4 className="text-label text-primary mb-3">Cost Comparison</h4>
            
            {/* Human Cost */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-label text-primary">Human Labor Cost</span>
                <span className="text-label text-primary font-medium">
                  ${data.humanCost.toLocaleString()}/year
                </span>
              </div>
              <div className="progress-base" role="progressbar" aria-valuenow={100} aria-valuemin={0} aria-valuemax={100}>
                <div 
                  className="progress-bar-brand"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            
            {/* AI Cost */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-label text-primary">AI Replacement Cost</span>
                <span className="text-label text-primary font-medium">
                  ${data.aiCost.toLocaleString()}/year
                </span>
              </div>
              <div className="progress-base" role="progressbar" aria-valuenow={data.costRatio} aria-valuemin={0} aria-valuemax={100}>
                <div 
                  className="progress-bar-error"
                  style={{ width: `${data.costRatio}%` }}
                />
              </div>
            </div>
          </div>
          
          {/* Job Displacement Impact */}
          <div className="p-4 rounded-lg border border-error-200 bg-surface">
            <h4 className="text-label text-primary mb-3">Job Displacement Impact</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-error-50 border border-error-100">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-error-600" />
                  <h5 className="text-caption text-primary font-medium">Jobs at Risk</h5>
                </div>
                <p className="text-body text-error-700">
                  This AI replacement could eliminate human jobs with a cost impact of
                  <span className="text-subheading font-bold block mt-1">
                    ${data.jobDisplacementCost.toLocaleString()}/year
                  </span>
                </p>
              </div>
              
              <div className="p-3 rounded-lg bg-warning-50 border border-warning-100">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-warning-600" />
                  <h5 className="text-caption text-primary font-medium">Workforce Impact</h5>
                </div>
                <p className="text-body text-warning-700">
                  AI could replace
                  <span className="text-subheading font-bold block mt-1">
                    {data.jobDisplacementPercentage}% of the workforce
                  </span>
                </p>
              </div>
            </div>
          </div>
          
          {/* Detailed Breakdown */}
          <div className="mt-3 card-base p-3">
            <h4 className="text-label text-primary mb-2">Cost Details</h4>
            <table className="w-full text-body">
              <tbody>
                <tr className="border-b border-default">
                  <td className="py-2 text-secondary">Human Hourly Rate</td>
                  <td className="py-2 text-right text-primary font-medium">${config.humanHourlyCost}</td>
                </tr>
                <tr className="border-b border-default">
                  <td className="py-2 text-secondary">AI Hourly Rate</td>
                  <td className="py-2 text-right text-primary font-medium">${config.aiHourlyCost}</td>
                </tr>
                <tr className="border-b border-default">
                  <td className="py-2 text-secondary">Hours Per Week</td>
                  <td className="py-2 text-right text-primary font-medium">{config.hoursPerWeek}</td>
                </tr>
                <tr>
                  <td className="py-2 text-secondary">Weeks Per Year</td>
                  <td className="py-2 text-right text-primary font-medium">{config.weeksPerYear}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
