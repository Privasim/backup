'use client';

import React, { useState, useEffect } from 'react';
import { QuizData } from '@/lib/quiz/types';
import { debugLog } from '@/components/debug/DebugConsole';

interface AssessmentResult {
  riskLevel: 'Low' | 'Medium' | 'High';
  riskScore: number;
  summary: string;
  factors: {
    automation: number;
    aiReplacement: number;
    skillDemand: number;
    industryGrowth: number;
  };
  recommendations: string[];
  keyFindings?: string[];
}

interface ResultsPanelProps {
  results: AssessmentResult | null;
  researchData: any;
  quizData: QuizData | null;
  isLoading: boolean;
  onExport: () => void;
  className?: string;
}

export default function ResultsPanel({
  results,
  researchData,
  quizData,
  isLoading,
  onExport,
  className = '',
}: ResultsPanelProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Initialize logging
  useEffect(() => {
    debugLog.info('ResultsPanel', 'Results panel initialized', {
      hasResults: !!results,
      hasResearchData: !!researchData,
      hasQuizData: !!quizData,
      isLoading
    });
  }, []);

  // Log when results change
  useEffect(() => {
    if (results) {
      debugLog.success('ResultsPanel', 'Assessment results received', {
        riskLevel: results.riskLevel,
        riskScore: results.riskScore,
        factorCount: Object.keys(results.factors).length,
        recommendationCount: results.recommendations.length,
        hasKeyFindings: !!results.keyFindings
      });
    }
  }, [results]);

  // Log when research data changes
  useEffect(() => {
    if (researchData) {
      debugLog.success('ResultsPanel', 'Research data integrated', {
        hasRecommendations: !!researchData.recommendations,
        recommendationCount: researchData.recommendations?.length || 0,
        dataKeys: Object.keys(researchData)
      });
    }
  }, [researchData]);

  // Log loading state changes
  useEffect(() => {
    if (isLoading) {
      debugLog.info('ResultsPanel', 'Results panel showing loading state');
    } else {
      debugLog.info('ResultsPanel', 'Results panel loading completed');
    }
  }, [isLoading]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-green-700 bg-green-100 border-green-200';
      case 'Medium': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'High': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const toggleSection = (section: string) => {
    const newState = expandedSection === section ? null : section;
    debugLog.debug('ResultsPanel', `Section ${newState ? 'expanded' : 'collapsed'}: ${section}`);
    setExpandedSection(newState);
  };

  if (isLoading) {
    return (
      <div className={`results-panel flex flex-col h-full ${className}`}>
        <div className="panel-header bg-gray-50 border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Assessment Results</h2>
            <div className="flex items-center space-x-2 text-sm text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">AI is analyzing your career data...</p>
            <p className="text-sm text-gray-500 mt-1">Results will appear here in real-time</p>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className={`results-panel flex flex-col h-full ${className}`}>
        <div className="panel-header bg-gray-50 border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Assessment Results</h2>
            <div className="text-sm text-gray-500">Waiting for analysis...</div>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">No results yet</p>
            <p className="text-sm text-gray-500 mt-1">Complete the form and click "Start Analysis" to see your AI risk assessment</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`results-panel flex flex-col h-full ${className}`}>
      {/* Panel Header */}
      <div className="panel-header bg-gray-50 border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Assessment Results</h2>
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(results.riskLevel)}`}>
              {results.riskLevel} Risk
            </div>
            <button
              onClick={() => {
                debugLog.info('ResultsPanel', 'Export button clicked', {
                  hasResults: !!results,
                  hasResearchData: !!researchData
                });
                onExport();
              }}
              className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Results Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
          {/* Risk Score - Main Display */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4 h-full">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">{results.riskScore}%</div>
                <div className="text-sm text-gray-600 mb-4">AI Displacement Risk</div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div 
                    className={`h-3 rounded-full transition-all duration-1000 ${
                      results.riskLevel === 'Low' ? 'bg-green-500' :
                      results.riskLevel === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${results.riskScore}%` }}
                  ></div>
                </div>

                {quizData && (
                  <div className="text-xs text-gray-500 space-y-1">
                    <div><span className="font-medium">Role:</span> {quizData.jobDescription.replace('-', ' ')}</div>
                    <div><span className="font-medium">Experience:</span> {quizData.experience}</div>
                    <div><span className="font-medium">Industry:</span> {quizData.industry}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Risk Factors */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4 h-full">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Risk Factors</h3>
                <button
                  onClick={() => toggleSection('factors')}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  {expandedSection === 'factors' ? 'Collapse' : 'Expand'}
                </button>
              </div>
              
              <div className="space-y-3">
                {Object.entries(results.factors).map(([factor, score]) => (
                  <div key={factor}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-700 capitalize">
                        {factor.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-xs font-semibold text-gray-900">{score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-1000"
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary & Key Findings */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-4 h-full">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Analysis Summary</h3>
                <button
                  onClick={() => toggleSection('summary')}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  {expandedSection === 'summary' ? 'Collapse' : 'Expand'}
                </button>
              </div>
              
              <div className={`space-y-3 ${expandedSection === 'summary' ? '' : 'max-h-32 overflow-hidden'}`}>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {results.summary}
                </p>

                {results.keyFindings && results.keyFindings.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-900 mb-2">Key Findings:</h4>
                    <ul className="space-y-1">
                      {results.keyFindings.slice(0, expandedSection === 'summary' ? undefined : 3).map((finding, index) => (
                        <li key={index} className="text-xs text-gray-600 flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          <span>{finding}</span>
                        </li>
                      ))}
                    </ul>
                    {results.keyFindings.length > 3 && expandedSection !== 'summary' && (
                      <button
                        onClick={() => toggleSection('summary')}
                        className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                      >
                        +{results.keyFindings.length - 3} more findings
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recommendations - Full Width */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Recommendations</h3>
                <button
                  onClick={() => toggleSection('recommendations')}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  {expandedSection === 'recommendations' ? 'Collapse' : 'Expand'}
                </button>
              </div>
              
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ${
                expandedSection === 'recommendations' ? '' : 'max-h-24 overflow-hidden'
              }`}>
                {results.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 font-semibold text-xs">{index + 1}</span>
                    </div>
                    <p className="text-xs text-gray-700">{recommendation}</p>
                  </div>
                ))}
              </div>

              {/* Research-based recommendations */}
              {researchData?.recommendations && researchData.recommendations.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <h4 className="text-xs font-medium text-gray-900 mb-2">
                    Research-Based Recommendations:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {researchData.recommendations.slice(0, 4).map((recommendation: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-purple-600 font-semibold text-xs">📊</span>
                        </div>
                        <p className="text-xs text-gray-700">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}