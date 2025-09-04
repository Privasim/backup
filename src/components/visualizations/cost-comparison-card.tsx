// File: src/components/visualizations/cost-comparison-card.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useCostComparison, CostComparisonConfig } from '@/hooks/use-cost-comparison';
import { Skeleton } from '../ui/skeleton';
import { AlertCircle, Copy, Info, Settings, ChevronDown, ChevronUp, X, DollarSign, BarChart3 } from 'lucide-react';

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

export interface CostComparisonConfig {
  humanHourlyCost: number;
  aiHourlyCost: number;
  hoursPerWeek: number;
  weeksPerYear: number;
}

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
    
    const summaryText = `Cost Comparison Summary\n\n` +
      `Human Cost: $${data.humanCost.toLocaleString()} per year\n` +
      `AI Cost: $${data.aiCost.toLocaleString()} per year\n` +
      `Savings: $${data.savings.toLocaleString()} per year (${data.savingsPercentage}%)\n\n` +
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
          <div className="bg-brand-100 p-2 rounded-full">
            <DollarSign className="h-5 w-5 text-brand-600" />
          </div>
          <h3 className="text-subheading text-primary">Cost Comparison</h3>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-6 w-full rounded-md" />
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
          <h3 className="text-subheading text-primary">Cost Comparison</h3>
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
        <div className="bg-brand-100 p-2 rounded-full">
          <DollarSign className="h-5 w-5 text-brand-600" />
        </div>
        <h3 className="text-subheading text-primary">{title}</h3>
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
            aria-label="Copy summary to clipboard"
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

      {/* Cost Comparison */}
      {data && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-success-50 rounded-lg p-3 border border-success-200">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-success-600" />
              <p className="text-label text-primary">
                Potential savings of ${data.savings.toLocaleString()} per year 
                <span className="badge-base badge-success ml-1">{data.savingsPercentage}%</span>
              </p>
            </div>
          </div>
          
          {/* Human Cost */}
          <div className="p-3 rounded-lg border border-default bg-surface">
            <div className="flex justify-between items-center mb-2">
              <span className="text-label text-primary">Human Cost</span>
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
          <div className="p-3 rounded-lg border border-default bg-surface">
            <div className="flex justify-between items-center mb-2">
              <span className="text-label text-primary">AI Cost</span>
              <span className="text-label text-primary font-medium">
                ${data.aiCost.toLocaleString()}/year
              </span>
            </div>
            <div className="progress-base" role="progressbar" aria-valuenow={100 - data.savingsPercentage} aria-valuemin={0} aria-valuemax={100}>
              <div 
                className="progress-bar-success"
                style={{ width: `${100 - data.savingsPercentage}%` }}
              />
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
