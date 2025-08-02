'use client';

import React, { useState, useRef } from 'react';
import { CostAnalysis } from '@/lib/cost-analysis/types';
import { CostCalculator } from '@/lib/cost-analysis/utils';
import CostComparisonChart, { CostComparisonChartHandle } from './CostComparisonChart';

interface CostAnalysisSectionProps {
  costData: CostAnalysis | null;
  isLoading: boolean;
  error?: string | null;
  className?: string;
}

export default function CostAnalysisSection({
  costData,
  isLoading,
  error,
  className = '',
}: CostAnalysisSectionProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const chartRef = useRef<CostComparisonChartHandle>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const exportChart = () => {
    if (chartRef.current) {
      chartRef.current.exportSvg('human-vs-ai-cost-comparison.svg');
    }
  };

  if (isLoading) {
    return (
      <div className={`cost-analysis-section ${className}`}>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Cost Analysis</h3>
            <div className="flex items-center space-x-2 text-sm text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Analyzing costs...</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`cost-analysis-section ${className}`}>
        <div className="bg-white rounded-lg border border-red-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Cost Analysis</h3>
            <div className="text-sm text-red-600">Analysis Failed</div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center text-red-800 text-sm">
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!costData) {
    return (
      <div className={`cost-analysis-section ${className}`}>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Cost Analysis</h3>
            <div className="text-sm text-gray-500">No data available</div>
          </div>
          
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">Cost analysis not available</p>
            <p className="text-sm text-gray-500 mt-1">Complete the assessment to see cost comparison</p>
          </div>
        </div>
      </div>
    );
  }

  const { comparison, insights } = costData;
  const savings = comparison.savings.absolute;
  const savingsPercentage = comparison.savings.percentage;

  return (
    <div className={`cost-analysis-section ${className}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Human vs AI Cost Analysis</h3>
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              savings > 0 
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {savings > 0 ? 'Cost Savings' : 'Additional Cost'}
            </div>
            <button
              onClick={exportChart}
              className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              Export Chart
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm font-medium text-blue-900 mb-1">Human Worker</div>
            <div className="text-2xl font-bold text-blue-800">
              {CostCalculator.formatCurrency(comparison.human.total)}
            </div>
            <div className="text-xs text-blue-600 mt-1">Annual cost</div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm font-medium text-green-900 mb-1">AI Automation</div>
            <div className="text-2xl font-bold text-green-800">
              {CostCalculator.formatCurrency(comparison.ai.total)}
            </div>
            <div className="text-xs text-green-600 mt-1">Annual cost</div>
          </div>

          <div className={`border rounded-lg p-4 ${
            savings > 0 
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-orange-50 border-orange-200'
          }`}>
            <div className={`text-sm font-medium mb-1 ${
              savings > 0 ? 'text-emerald-900' : 'text-orange-900'
            }`}>
              {savings > 0 ? 'Potential Savings' : 'Additional Cost'}
            </div>
            <div className={`text-2xl font-bold ${
              savings > 0 ? 'text-emerald-800' : 'text-orange-800'
            }`}>
              {CostCalculator.formatCurrency(Math.abs(savings))}
            </div>
            <div className={`text-xs mt-1 ${
              savings > 0 ? 'text-emerald-600' : 'text-orange-600'
            }`}>
              {CostCalculator.formatPercentage(savingsPercentage)}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="mb-6">
          <CostComparisonChart
            ref={chartRef}
            data={{
              comparison,
              confidence: insights.confidence,
              title: 'Annual Cost Comparison',
            }}
            className="w-full"
            height={400}
          />
        </div>

        {/* Insights Sections */}
        <div className="space-y-4">
          {/* Key Insights */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('insights')}
              className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h4 className="text-sm font-semibold text-gray-900">Key Insights</h4>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  expandedSection === 'insights' ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedSection === 'insights' && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <div className="mt-3 space-y-2">
                  {insights.keyFindings.map((finding, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 font-semibold text-xs">{index + 1}</span>
                      </div>
                      <p className="text-sm text-gray-700">{finding}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('recommendations')}
              className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h4 className="text-sm font-semibold text-gray-900">Recommendations</h4>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  expandedSection === 'recommendations' ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedSection === 'recommendations' && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <div className="mt-3 space-y-2">
                  {insights.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-700">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Risk Factors */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('risks')}
              className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h4 className="text-sm font-semibold text-gray-900">Risk Factors</h4>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  expandedSection === 'risks' ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedSection === 'risks' && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <div className="mt-3 space-y-2">
                  {insights.riskFactors.map((risk, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-700">{risk}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div>
              Analysis confidence: {(insights.confidence * 100).toFixed(0)}% | 
              Sources: {insights.sources.join(', ')}
            </div>
            <div>
              Generated on {new Date(costData.metadata.analysisDate).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}