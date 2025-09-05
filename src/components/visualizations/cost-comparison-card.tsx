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
      <label className="text-sm text-gray-700 mb-1.5">{label}</label>
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
        className="px-3 py-2 rounded-md text-base bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
      <div className={`bg-white p-6 animate-fade-in transition-all duration-300 ${className}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-red-100 p-2 rounded-full">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800">{title || 'Job Displacement Analysis'}</h3>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-8 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-36 w-full rounded-lg" />
          <Skeleton className="h-36 w-full rounded-lg" />
          <Skeleton className="h-6 w-1/2 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white p-6 animate-fade-in transition-all duration-300 ${className}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-red-100 p-2 rounded-full">
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800">{title || 'Job Displacement Analysis'}</h3>
        </div>
        <div className="p-4 bg-red-50 rounded-lg">
          <p className="text-lg text-red-700">{error}</p>
          <p className="text-base mt-3 text-gray-700">Please try again or contact support if the issue persists.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 animate-fade-in ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 p-2 rounded-full">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-800">{title || 'Job Displacement Analysis'}</h3>
          <div className="ml-auto flex items-center gap-2">
            {showSettings && (
              <button 
                onClick={() => setShowConfig(!showConfig)} 
                className="px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Toggle configuration panel"
                aria-expanded={showConfig}
              >
                <Settings className="h-4 w-4" />
              </button>
            )}
            <button 
              onClick={handleCopy} 
              className="px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors inline-flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Copy job displacement analysis to clipboard"
            >
              <Copy className="h-4 w-4" />
              <span className="text-sm">{copied ? 'Copied' : 'Copy'}</span>
              {copied && <span className="sr-only">Copied!</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      {showConfig && (
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-medium text-gray-800">Configuration</h4>
            <button 
              onClick={() => setShowConfig(false)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close configuration panel"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <div className="space-y-8">
          {/* Summary - Warning about job displacement */}
          <div className="bg-red-50 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h4 className="text-lg font-medium text-red-800">Job Displacement Warning</h4>
            </div>
            <p className="text-base text-red-700">
              Potential job displacement cost of <span className="font-bold">${data.jobDisplacementCost.toLocaleString()}</span> per year 
              <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-sm font-medium">{data.jobDisplacementPercentage}%</span>
            </p>
          </div>
          
          {/* Gauge Chart for Job Displacement */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-5">
              <TrendingDown className="h-6 w-6 text-red-600" />
              <h4 className="text-xl font-medium text-gray-800">Job Displacement Impact</h4>
            </div>
            <div className="relative h-48 w-full">
              {/* Semi-circular gauge */}
              <div className="flex justify-center">
                <div className="relative w-full max-w-sm">
                  {/* Gauge background */}
                  <div className="h-40 w-full bg-gray-200 rounded-t-full overflow-hidden">
                    {/* Gauge fill - represents job displacement percentage */}
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-red-600 rounded-t-full"
                      style={{ width: `${data.jobDisplacementPercentage}%` }}
                    />
                  </div>
                  
                  {/* Gauge needle */}
                  <div 
                    className="absolute bottom-0 left-1/2 h-36 w-1.5 bg-red-700 origin-bottom transform -translate-x-1/2"
                    style={{ transform: `translateX(-50%) rotate(${(data.jobDisplacementPercentage / 100) * 180 - 90}deg)` }}
                  >
                    <div className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-red-700 rounded-full" />
                  </div>
                  
                  {/* Percentage display */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-2xl font-bold text-red-700">
                    {data.jobDisplacementPercentage}%
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Cost Comparison Chart */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="text-xl font-medium text-gray-800 mb-5">Cost Comparison</h4>
            
            {/* Human Cost */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg text-gray-700">Human Labor Cost</span>
                <span className="text-lg font-semibold text-gray-800">
                  ${data.humanCost.toLocaleString()}/year
                </span>
              </div>
              <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={100} aria-valuemin={0} aria-valuemax={100}>
                <div 
                  className="h-full bg-blue-600"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            
            {/* AI Cost */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg text-gray-700">AI Replacement Cost</span>
                <span className="text-lg font-semibold text-gray-800">
                  ${data.aiCost.toLocaleString()}/year
                </span>
              </div>
              <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={data.costRatio} aria-valuemin={0} aria-valuemax={100}>
                <div 
                  className="h-full bg-red-600"
                  style={{ width: `${data.costRatio}%` }}
                />
              </div>
            </div>
          </div>
          
          {/* Job Displacement Impact */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="text-xl font-medium text-gray-800 mb-5">Job Displacement Impact</h4>
            <div className="flex flex-col space-y-4">
              <div className="p-5 rounded-lg bg-red-50">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  <h5 className="text-lg font-medium text-red-800">Jobs at Risk</h5>
                </div>
                <p className="text-base text-red-700">
                  This AI replacement could eliminate human jobs with a cost impact of
                  <span className="text-2xl font-bold block mt-2">
                    ${data.jobDisplacementCost.toLocaleString()}/year
                  </span>
                </p>
              </div>
              
              <div className="p-5 rounded-lg bg-amber-50">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <h5 className="text-lg font-medium text-amber-800">Workforce Impact</h5>
                </div>
                <p className="text-base text-amber-700">
                  AI could replace
                  <span className="text-2xl font-bold block mt-2">
                    {data.jobDisplacementPercentage}% of the workforce
                  </span>
                </p>
              </div>
            </div>
          </div>
          
          {/* Detailed Breakdown */}
          <div className="bg-white p-6 rounded-lg">
            <h4 className="text-xl font-medium text-gray-800 mb-4">Cost Details</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-base text-gray-600">Human Hourly Rate</span>
                <span className="text-lg font-medium text-gray-800">${config.humanHourlyCost}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-base text-gray-600">AI Hourly Rate</span>
                <span className="text-lg font-medium text-gray-800">${config.aiHourlyCost}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-base text-gray-600">Hours Per Week</span>
                <span className="text-lg font-medium text-gray-800">{config.hoursPerWeek}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-base text-gray-600">Weeks Per Year</span>
                <span className="text-lg font-medium text-gray-800">{config.weeksPerYear}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 text-base text-gray-500">
            Analysis based on current market rates and industry standards for AI replacement costs.
          </div>
        </div>
      )}
    </div>
  );
}
