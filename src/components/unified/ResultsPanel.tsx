'use client';

import React, { useState, useEffect } from 'react';
import { QuizData } from '@/lib/quiz/types';
import { debugLog } from '@/components/debug/DebugConsole';
import { getResearchService, initializeResearchService } from '@/lib/research/service';
import knowledgeBase from '@/lib/research/data/ai_employment_risks.json';
import '@/styles/visualization.css';

// New deterministic D3 components + types (forwardRef handles)
import RiskGaugeD3, { RiskGaugeHandle } from '@/components/visualization/d3/RiskGaugeD3';
import FactorBarsD3, { FactorBarsHandle } from '@/components/visualization/d3/FactorBarsD3';
import TaskExposureRadarD3, { TaskExposureRadarHandle } from '@/components/visualization/d3/TaskExposureRadarD3';
import IndustryScatterBubblesD3, { IndustryScatterHandle } from '@/components/visualization/d3/IndustryScatterBubblesD3';
import RiskHeatmapD3, { RiskHeatmapHandle } from '@/components/visualization/d3/RiskHeatmapD3';

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
  const [visualizationData, setVisualizationData] = useState<{
    riskMatrix: any[];
    industryBubble: any[]; // exposure vs employment
    taskExposure: any[];   // from table_4
  }>({ riskMatrix: [], industryBubble: [], taskExposure: [] });

  // Refs for SVG export using component handles
  const riskGaugeRef = React.useRef<RiskGaugeHandle>(null);
  const factorBarsRef = React.useRef<FactorBarsHandle>(null);
  const taskRadarRef = React.useRef<TaskExposureRadarHandle>(null);
  const industryBubblesRef = React.useRef<IndustryScatterHandle>(null);
  const heatmapRef = React.useRef<RiskHeatmapHandle>(null);

  const exportSvg = (handle: { getSvg?: () => SVGSVGElement | null } | null | undefined, filename: string) => {
    const node = handle?.getSvg ? handle.getSvg() : null;
    if (!node) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(node);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.svg') ? filename : `${filename}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

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

  // Load visualization data when results are available
  useEffect(() => {
    const loadVisualizationData = async () => {
      if (!results || !quizData) return;

      try {
        // Ensure service is initialized first
        await initializeResearchService(knowledgeBase as any);
        const service = getResearchService();
        
        // Deterministic-only data sources
        const [riskMatrix, industryData, taskData] = await Promise.all([
          service.getRiskMatrixData(),      // Deterministic synthesis from KB occupations x industries
          service.getIndustryData(),        // From table_3
          service.getTaskAutomationData()   // From table_4
        ]);

        // Build deterministic inputs for D3 charts
        // Industry bubbles use exposureScore (x), employment (y and/or radius)
        const industryBubble = (industryData || []).slice(0, 20).map((d: any) => ({
          industry: d.industry,
          exposureScore: d.exposureScore,
          employment: d.employment, // millions numeric
          naicsCode: d.naicsCode
        }));

        // Task exposure radar uses table_4 "Automation Potential"
        const taskExposure = (taskData || []).map((t: any) => ({
          taskCategory: t.taskCategory,
          automationPotential: t.automationPotential,
          humanComplementarity: t.humanComplementarity,
          timeline: t.timeline,
          description: t.description
        }));

        setVisualizationData({
          riskMatrix: (riskMatrix || []).slice(0, 50),
          industryBubble,
          taskExposure
        });

        debugLog.success('ResultsPanel', 'Visualization data loaded', {
          riskMatrixCount: (riskMatrix || []).length,
          industryCount: (industryData || []).length,
          taskCategoryCount: (taskData || []).length
        });
      } catch (error) {
        debugLog.error('ResultsPanel', 'Failed to load visualization data', { 
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
      }
    };

    loadVisualizationData();
  }, [results, quizData]);

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
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-gray-900">AI Displacement Risk</span>
                <button
                  onClick={() => exportSvg(riskGaugeRef.current, 'risk-gauge')}
                  className="text-[10px] px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                >
                  Export SVG
                </button>
              </div>
              <div className="mb-2">
                <RiskGaugeD3
                  ref={riskGaugeRef}
                  score={results.riskScore}
                  level={results.riskLevel}
                  className="w-full h-36"
                />
              </div>
              {quizData && (
                <div className="text-xs text-gray-500 space-y-1 text-center">
                  <div><span className="font-medium">Role:</span> {quizData.jobDescription.replace('-', ' ')}</div>
                  <div><span className="font-medium">Experience:</span> {quizData.experience}</div>
                  <div><span className="font-medium">Industry:</span> {quizData.industry}</div>
                </div>
              )}
            </div>
          </div>

          {/* Risk Factors */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4 h-full">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Risk Drivers</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSection('factors')}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    {expandedSection === 'factors' ? 'Collapse' : 'Expand'}
                  </button>
                  <button
                    onClick={() => exportSvg(factorBarsRef.current, 'risk-drivers')}
                    className="text-[10px] px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                  >
                    Export SVG
                  </button>
                </div>
              </div>

              <FactorBarsD3
                ref={factorBarsRef}
                factors={[
                  { label: 'Automation', value: results.factors.automation },
                  { label: 'AI Replacement', value: results.factors.aiReplacement },
                  { label: 'Skill Demand', value: results.factors.skillDemand },
                  { label: 'Industry Growth', value: results.factors.industryGrowth },
                ]}
                className="w-full h-40"
              />
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

          {/* Professional Visualizations - Full Width */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Professional Analytics Dashboard</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleSection('visualizations')}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    {expandedSection === 'visualizations' ? 'Collapse' : 'Expand'}
                  </button>
                  <button 
                    onClick={() => {
                      debugLog.info('ResultsPanel', 'Export SVG clicked');
                      // Export functionality would be implemented here
                      alert('SVG export functionality - ready for implementation');
                    }}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                  >
                    Export SVG
                  </button>
                </div>
              </div>
              
              <div className={`${expandedSection === 'visualizations' ? 'h-96' : 'h-32'} transition-all duration-300`}>
                {expandedSection === 'visualizations' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
                    {/* Risk Heatmap (D3) */}
                    <div className="bg-white rounded-lg border border-gray-200 p-2">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-center flex-1">
                          <h4 className="text-xs font-semibold text-gray-700">Risk Heatmap</h4>
                          <p className="text-xs text-gray-500">Industry vs Occupation</p>
                        </div>
                        <button
                          onClick={() => exportSvg(heatmapRef.current, 'risk-heatmap')}
                          className="text-[10px] px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                        >
                          Export SVG
                        </button>
                      </div>
                      {visualizationData.riskMatrix.length > 0 ? (
                        <RiskHeatmapD3
                          ref={heatmapRef}
                          data={visualizationData.riskMatrix as any}
                          className="w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-32 bg-gray-50 rounded">
                          <div className="text-center">
                            <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-xs text-gray-500">Loading...</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Industry Bubble Chart */}
                    <div className="bg-white rounded-lg border border-gray-200 p-2">
                      <div className="text-center mb-2">
                        <h4 className="text-xs font-semibold text-gray-700">Industry Exposure</h4>
                        <p className="text-xs text-gray-500">Exposure vs Employment</p>
                      </div>
                      {visualizationData.industryBubble.length > 0 ? (
                        <IndustryScatterBubblesD3
                          ref={industryBubblesRef}
                          data={visualizationData.industryBubble as any}
                          className="w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-32 bg-gray-50 rounded">
                          <div className="text-center">
                            <div className="w-8 h-8 border-2 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-xs text-gray-500">Loading...</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Skill Radar Chart */}
                    <div className="bg-white rounded-lg border border-gray-200 p-2">
                      <div className="text-center mb-2">
                        <h4 className="text-xs font-semibold text-gray-700">Task Exposure</h4>
                        <p className="text-xs text-gray-500">Automation Potential by Category</p>
                      </div>
                      {visualizationData.taskExposure.length > 0 ? (
                        <TaskExposureRadarD3
                          ref={taskRadarRef}
                          data={visualizationData.taskExposure as any}
                          className="w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-32 bg-gray-50 rounded">
                          <div className="text-center">
                            <div className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-xs text-gray-500">Loading...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
                    <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
                         onClick={() => toggleSection('visualizations')}>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                          </svg>
                        </div>
                        <p className="text-xs font-medium text-gray-700">Risk Heatmap</p>
                        <p className="text-xs text-gray-500">Industry vs Occupation</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
                         onClick={() => toggleSection('visualizations')}>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/>
                            <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/>
                          </svg>
                        </div>
                        <p className="text-xs font-medium text-gray-700">Industry Bubbles</p>
                        <p className="text-xs text-gray-500">Multi-dimensional Analysis</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
                         onClick={() => toggleSection('visualizations')}>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <p className="text-xs font-medium text-gray-700">Skill Radar</p>
                        <p className="text-xs text-gray-500">Competency Gaps</p>
                      </div>
                    </div>
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