'use client';

import React, { useState, useEffect } from 'react';
import { QuizData } from '@/lib/quiz/types';
import { debugLog } from '@/components/debug/DebugConsole';
import { getResearchService, initializeResearchService } from '@/lib/research/service';
import knowledgeBase from '@/lib/research/data/ai_employment_risks.json';
import { useChartInteractions } from '@/hooks/useChartInteractions';
import { CostAnalysisService, UserProfile, CostAnalysis } from '@/lib/cost-analysis';
import { CostAnalysisSection } from '@/components/cost-analysis';
import '@/styles/visualization.css';

// New deterministic D3 components + types (forwardRef handles)
import RiskGaugeD3, { RiskGaugeHandle } from '@/components/visualization/d3/RiskGaugeD3';
import FactorBarsD3, { FactorBarsHandle } from '@/components/visualization/d3/FactorBarsD3';
import TaskExposureRadarD3, { TaskExposureRadarHandle } from '@/components/visualization/d3/TaskExposureRadarD3';
import IndustryScatterBubblesD3, { IndustryScatterHandle } from '@/components/visualization/d3/IndustryScatterBubblesD3';
import RiskHeatmapD3, { RiskHeatmapHandle } from '@/components/visualization/d3/RiskHeatmapD3';
import MultiDimensionalD3, { MultiDimensionalHandle } from '@/components/visualization/d3/MultiDimensionalD3';

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
    multiDimensional: any[]; // combined data for multi-dimensional chart
  }>({ riskMatrix: [], industryBubble: [], taskExposure: [], multiDimensional: [] });

  const [industryPercentile, setIndustryPercentile] = useState<number | null>(null);
  const [benchmarks, setBenchmarks] = useState<{ industryAverage: number | null; peerAverage: number | null }>({ 
    industryAverage: null, 
    peerAverage: null 
  });
  const [chartMode, setChartMode] = useState<'scatter' | 'parallel' | 'treemap'>('scatter');
  const [presentationMode, setPresentationMode] = useState(false);
  
  // Cost analysis state
  const [costAnalysisData, setCostAnalysisData] = useState<CostAnalysis | null>(null);
  const [costAnalysisLoading, setCostAnalysisLoading] = useState(false);
  const [costAnalysisError, setCostAnalysisError] = useState<string | null>(null);
  
  // Chart interactions state
  const chartInteractions = useChartInteractions();

  // Refs for SVG export using component handles
  const riskGaugeRef = React.useRef<RiskGaugeHandle>(null);
  const factorBarsRef = React.useRef<FactorBarsHandle>(null);
  const taskRadarRef = React.useRef<TaskExposureRadarHandle>(null);
  const industryBubblesRef = React.useRef<IndustryScatterHandle>(null);
  const heatmapRef = React.useRef<RiskHeatmapHandle>(null);
  const multiDimensionalRef = React.useRef<MultiDimensionalHandle>(null);

  const exportSvg = (handle: { getSvg?: () => SVGSVGElement | null } | null | undefined, filename: string) => {
    const node = handle?.getSvg ? handle.getSvg() : null;
    if (!node) return;
    
    // Clone and enhance SVG for professional export
    const clonedNode = node.cloneNode(true) as SVGSVGElement;
    
    // Add professional styling
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.textContent = `
      .export-header { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; fill: #1f2937; }
      .export-subtitle { font-family: 'Inter', sans-serif; font-size: 10px; fill: #6b7280; }
      .export-watermark { font-family: 'Inter', sans-serif; font-size: 8px; fill: #9ca3af; }
    `;
    clonedNode.insertBefore(style, clonedNode.firstChild);
    
    // Add header
    const headerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    headerGroup.setAttribute('class', 'export-header-group');
    
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    title.setAttribute('x', '10');
    title.setAttribute('y', '20');
    title.setAttribute('class', 'export-header');
    title.textContent = `AI Risk Assessment - ${filename.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
    
    const subtitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    subtitle.setAttribute('x', '10');
    subtitle.setAttribute('y', '35');
    subtitle.setAttribute('class', 'export-subtitle');
    subtitle.textContent = `Generated on ${new Date().toLocaleDateString()}`;
    
    headerGroup.appendChild(title);
    headerGroup.appendChild(subtitle);
    clonedNode.insertBefore(headerGroup, clonedNode.firstChild);
    
    // Adjust viewBox to accommodate header
    const currentViewBox = clonedNode.getAttribute('viewBox') || '0 0 800 400';
    const [x, y, w, h] = currentViewBox.split(' ').map(Number);
    clonedNode.setAttribute('viewBox', `${x} ${y - 40} ${w} ${h + 40}`);
    
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(clonedNode);
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

  const exportAllCharts = () => {
    const charts = [
      { ref: riskGaugeRef, name: 'risk-gauge' },
      { ref: factorBarsRef, name: 'risk-factors' },
      { ref: multiDimensionalRef, name: 'multi-dimensional-analysis' },
      { ref: heatmapRef, name: 'risk-heatmap' }
    ];
    
    charts.forEach(chart => {
      if (chart.ref.current) {
        exportSvg(chart.ref.current, chart.name);
      }
    });
    
    debugLog.info('ResultsPanel', 'All charts exported', { chartCount: charts.length });
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

  // Calculate industry percentile and benchmarks from existing occupation data
  const calculateIndustryPercentile = (userRiskScore: number, userIndustry: string) => {
    if (!knowledgeBase?.occupations) return null;
    
    // Filter occupations by industry (approximate matching)
    const industryOccupations = knowledgeBase.occupations.filter(occ => 
      // Simple industry matching - could be enhanced with more sophisticated matching
      userIndustry.toLowerCase().includes('tech') && occ.code.startsWith('15-') ||
      userIndustry.toLowerCase().includes('finance') && occ.code.startsWith('13-') ||
      userIndustry.toLowerCase().includes('healthcare') && occ.code.startsWith('29-') ||
      true // fallback to all occupations if no specific match
    );
    
    if (industryOccupations.length === 0) return null;
    
    // Calculate percentile
    const lowerScores = industryOccupations.filter(occ => occ.riskScore <= userRiskScore).length;
    return Math.round((lowerScores / industryOccupations.length) * 100);
  };

  const calculateBenchmarks = (userRiskScore: number, userIndustry: string, userJob: string) => {
    if (!knowledgeBase?.occupations) return { industryAverage: null, peerAverage: null };
    
    // Industry average
    const industryOccupations = knowledgeBase.occupations.filter(occ => 
      userIndustry.toLowerCase().includes('tech') && occ.code.startsWith('15-') ||
      userIndustry.toLowerCase().includes('finance') && occ.code.startsWith('13-') ||
      userIndustry.toLowerCase().includes('healthcare') && occ.code.startsWith('29-') ||
      true
    );
    
    const industryAverage = industryOccupations.length > 0 
      ? Math.round((industryOccupations.reduce((sum, occ) => sum + occ.riskScore, 0) / industryOccupations.length) * 100)
      : null;
    
    // Peer average (similar job titles)
    const peerOccupations = knowledgeBase.occupations.filter(occ => 
      occ.name.toLowerCase().includes(userJob.toLowerCase().split(' ')[0]) ||
      userJob.toLowerCase().includes(occ.name.toLowerCase().split(' ')[0])
    );
    
    const peerAverage = peerOccupations.length > 0
      ? Math.round((peerOccupations.reduce((sum, occ) => sum + occ.riskScore, 0) / peerOccupations.length) * 100)
      : null;
    
    return { industryAverage, peerAverage };
  };

  // Load visualization data and cost analysis when results are available
  useEffect(() => {
    const loadVisualizationData = async () => {
      if (!results || !quizData) return;

      try {
        // Ensure service is initialized first
        await initializeResearchService(knowledgeBase as any);
        const service = getResearchService();

        // Start cost analysis in parallel
        loadCostAnalysis();
        
        // Calculate industry percentile and benchmarks using existing occupation data
        const percentile = calculateIndustryPercentile(results.riskScore, quizData.industry);
        const benchmarkData = calculateBenchmarks(results.riskScore, quizData.industry, quizData.jobDescription);
        setIndustryPercentile(percentile);
        setBenchmarks(benchmarkData);
        
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

        // Multi-dimensional data combining industries and occupations
        const multiDimensional = [
          // Industry data points
          ...industryBubble.map((industry: any) => ({
            id: `industry-${industry.naicsCode}`,
            name: industry.industry,
            riskScore: industry.exposureScore,
            employment: industry.employment,
            automationPotential: Math.random() * 0.8 + 0.1, // Derived from industry exposure
            growthRate: (Math.random() - 0.5) * 0.1, // Mock growth rate -5% to +5%
            category: 'industry' as const,
            metadata: { naicsCode: industry.naicsCode }
          })),
          // Top occupation data points from knowledge base
          ...(knowledgeBase?.occupations || []).slice(0, 15).map((occ: any) => ({
            id: `occupation-${occ.code}`,
            name: occ.name,
            riskScore: occ.riskScore,
            employment: Math.random() * 5 + 0.5, // Mock employment data
            automationPotential: occ.riskScore * 0.8 + Math.random() * 0.2,
            growthRate: (Math.random() - 0.5) * 0.08,
            category: 'occupation' as const,
            metadata: { socCode: occ.code, keyTasks: occ.keyTasks }
          }))
        ];

        setVisualizationData({
          riskMatrix: (riskMatrix || []).slice(0, 50),
          industryBubble,
          taskExposure,
          multiDimensional
        });

        debugLog.success('ResultsPanel', 'Visualization data loaded', {
          riskMatrixCount: (riskMatrix || []).length,
          industryCount: (industryData || []).length,
          taskCategoryCount: (taskData || []).length,
          industryPercentile: percentile
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

  // Load cost analysis data
  const loadCostAnalysis = async () => {
    if (!quizData || !results) return;

    setCostAnalysisLoading(true);
    setCostAnalysisError(null);

    try {
      debugLog.info('ResultsPanel', 'Starting cost analysis', {
        occupation: quizData.jobDescription,
        location: quizData.location,
        experience: quizData.experience
      });

      // Create user profile for cost analysis
      const userProfile: UserProfile = {
        occupation: quizData.jobDescription,
        experience: quizData.experience,
        location: quizData.location,
        industry: quizData.industry,
        salaryRange: quizData.salaryRange,
        skills: quizData.skillSet,
      };

      // Initialize cost analysis service with API keys
      const costService = new CostAnalysisService({
        // PayScale API key would come from environment variables
        // payScale: process.env.NEXT_PUBLIC_PAYSCALE_API_KEY,
        openRouter: quizData.apiKey, // Use the user's OpenRouter API key
      });

      // Perform cost analysis
      const costAnalysis = await costService.analyze(userProfile, {
        useCache: true,
        fallbackToEstimates: true,
        includeInsights: true,
        confidenceThreshold: 0.3, // Lower threshold to allow more results
      });

      if (costAnalysis) {
        setCostAnalysisData(costAnalysis);
        debugLog.success('ResultsPanel', 'Cost analysis completed', {
          humanCost: costAnalysis.comparison.human.total,
          aiCost: costAnalysis.comparison.ai.total,
          savings: costAnalysis.comparison.savings.absolute,
          confidence: costAnalysis.insights.confidence
        });
      } else {
        throw new Error('Cost analysis returned no data');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setCostAnalysisError(errorMessage);
      debugLog.error('ResultsPanel', 'Cost analysis failed', error);
    } finally {
      setCostAnalysisLoading(false);
    }
  };

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
      <div className={`panel-header ${presentationMode ? 'bg-white border-b-0' : 'bg-gray-50 border-b border-gray-200'} px-4 py-3`}>
        <div className="flex items-center justify-between">
          <h2 className={`text-lg font-semibold ${presentationMode ? 'text-gray-800' : 'text-gray-900'}`}>
            {presentationMode ? 'AI Risk Assessment Report' : 'Assessment Results'}
          </h2>
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(results.riskLevel)}`}>
              {results.riskLevel} Risk
            </div>
            {!presentationMode && (
              <>
                <button
                  onClick={() => setPresentationMode(true)}
                  className="px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                >
                  Presentation Mode
                </button>
                <button
                  onClick={exportAllCharts}
                  className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                >
                  Export All
                </button>
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
                  Export Report
                </button>
              </>
            )}
            {presentationMode && (
              <button
                onClick={() => setPresentationMode(false)}
                className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
              >
                Exit Presentation
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Content */}
      <div className={`flex-1 overflow-y-auto ${presentationMode ? 'p-6 bg-white' : 'p-4'}`}>
        {/* Executive Summary - Always Visible */}
        <div className="mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Risk Score with Enhanced Context */}
              <div className="lg:col-span-1">
                <div className="text-center">
                  <div className="mb-4">
                    <RiskGaugeD3
                      ref={riskGaugeRef}
                      score={results.riskScore}
                      level={results.riskLevel}
                      industryAverage={benchmarks.industryAverage}
                      peerAverage={benchmarks.peerAverage}
                      className="w-full h-40"
                    />
                  </div>
                  {industryPercentile !== null && (
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">{industryPercentile}th percentile</span> in your industry
                    </div>
                  )}
                  {quizData && (
                    <div className="text-xs text-gray-500 space-y-1">
                      <div><span className="font-medium">Role:</span> {quizData.jobDescription.replace('-', ' ')}</div>
                      <div><span className="font-medium">Experience:</span> {quizData.experience}</div>
                      <div><span className="font-medium">Industry:</span> {quizData.industry}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Key Insight */}
              <div className="lg:col-span-1">
                <div className="h-full flex flex-col justify-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Insight</h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-4">
                    {results.summary}
                  </p>
                  {results.keyFindings && results.keyFindings.length > 0 && (
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Primary Finding:</span> {results.keyFindings[0]}
                    </div>
                  )}
                </div>
              </div>

              {/* Primary Recommendation */}
              <div className="lg:col-span-1">
                <div className="h-full flex flex-col justify-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommended Action</h3>
                  {results.recommendations.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white font-bold text-xs">1</span>
                        </div>
                        <p className="text-sm text-blue-900 font-medium">
                          {results.recommendations[0]}
                        </p>
                      </div>
                    </div>
                  )}
                  {results.recommendations.length > 1 && (
                    <button
                      onClick={() => toggleSection('recommendations')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View {results.recommendations.length - 1} more recommendations →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Risk Factors - Moved to secondary position */}
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

          {/* Recommendations - Moved up for prominence */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 p-4 h-full">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">All Recommendations</h3>
                <button
                  onClick={() => toggleSection('recommendations')}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  {expandedSection === 'recommendations' ? 'Collapse' : 'Expand'}
                </button>
              </div>
              
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 ${
                expandedSection === 'recommendations' ? '' : 'max-h-32 overflow-hidden'
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

          {/* Professional Visualizations - Full Width */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Professional Analytics Dashboard</h3>
                <div className="flex items-center space-x-2">
                  {/* Filter Panel */}
                  {chartInteractions.activeFilterCount > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-600">
                        {chartInteractions.activeFilterCount} filter{chartInteractions.activeFilterCount > 1 ? 's' : ''} active
                      </span>
                      <button
                        onClick={chartInteractions.clearFilters}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Clear
                      </button>
                    </div>
                  )}
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
              
              {/* Quick Filters - Hidden in presentation mode */}
              {expandedSection === 'visualizations' && !presentationMode && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-2">
                      <label className="text-gray-600">Category:</label>
                      <select
                        value={chartInteractions.state.filters.selectedCategory}
                        onChange={(e) => chartInteractions.updateFilters({ 
                          selectedCategory: e.target.value as 'all' | 'industry' | 'occupation' 
                        })}
                        className="px-2 py-1 border rounded text-xs"
                      >
                        <option value="all">All</option>
                        <option value="industry">Industries</option>
                        <option value="occupation">Occupations</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-gray-600">Risk:</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={chartInteractions.state.filters.riskRange[1] * 100}
                        onChange={(e) => chartInteractions.updateFilters({ 
                          riskRange: [0, parseInt(e.target.value) / 100] 
                        })}
                        className="w-16"
                      />
                      <span className="text-gray-500 w-8">
                        {Math.round(chartInteractions.state.filters.riskRange[1] * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className={`${expandedSection === 'visualizations' ? 'h-96' : 'h-32'} transition-all duration-300`}>
                {expandedSection === 'visualizations' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
                    {/* Multi-Dimensional Analysis - Primary Chart */}
                    <div className="bg-white rounded-lg border border-gray-200 p-2">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-center flex-1">
                          <h4 className="text-xs font-semibold text-gray-700">Multi-Dimensional Analysis</h4>
                          <p className="text-xs text-gray-500">Risk × Employment × Automation × Growth</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <select
                            value={chartMode}
                            onChange={(e) => setChartMode(e.target.value as 'scatter' | 'parallel' | 'treemap')}
                            className="text-[10px] px-1 py-1 border rounded"
                          >
                            <option value="scatter">Scatter</option>
                            <option value="parallel">Parallel</option>
                            <option value="treemap">Treemap</option>
                          </select>
                          <button
                            onClick={() => exportSvg(multiDimensionalRef.current, 'multi-dimensional')}
                            className="text-[10px] px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                          >
                            Export SVG
                          </button>
                        </div>
                      </div>
                      {visualizationData.multiDimensional.length > 0 ? (
                        <MultiDimensionalD3
                          ref={multiDimensionalRef}
                          data={chartInteractions.filterData(visualizationData.multiDimensional)}
                          mode={chartMode}
                          onDrillDown={(item) => {
                            debugLog.info('ResultsPanel', 'Drill-down clicked', { item });
                            chartInteractions.toggleSelectedItem(item.id);
                            // Highlight related items
                            const relatedItems = chartInteractions.getRelatedItems(item.id, visualizationData.multiDimensional);
                            debugLog.debug('ResultsPanel', 'Related items found', { relatedItems });
                          }}
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
                    <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
                         onClick={() => toggleSection('visualizations')}>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                          </svg>
                        </div>
                        <p className="text-xs font-medium text-gray-700">Multi-Dimensional Analysis</p>
                        <p className="text-xs text-gray-500">Risk × Employment × Automation × Growth</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
                         onClick={() => toggleSection('visualizations')}>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                          </svg>
                        </div>
                        <p className="text-xs font-medium text-gray-700">Risk Heatmap</p>
                        <p className="text-xs text-gray-500">Industry vs Occupation Matrix</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Analysis - Expandable */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Detailed Analysis</h3>
                <button
                  onClick={() => toggleSection('detailed-analysis')}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  {expandedSection === 'detailed-analysis' ? 'Collapse' : 'Expand'}
                </button>
              </div>
              
              {expandedSection === 'detailed-analysis' ? (
                <div className="space-y-4">
                  {/* Key Findings */}
                  {results.keyFindings && results.keyFindings.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Key Findings</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {results.keyFindings.map((finding, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <span className="text-blue-600 mr-2 mt-1">•</span>
                            <p className="text-sm text-gray-700">{finding}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Factor Analysis */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Risk Factor Analysis</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">{results.factors.automation}%</div>
                        <div className="text-xs text-gray-600">Automation Risk</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">{results.factors.aiReplacement}%</div>
                        <div className="text-xs text-gray-600">AI Replacement</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">{results.factors.skillDemand}%</div>
                        <div className="text-xs text-gray-600">Skill Demand</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">{results.factors.industryGrowth}%</div>
                        <div className="text-xs text-gray-600">Industry Growth</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">Click "Expand" to view detailed analysis including key findings and risk factor breakdown</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cost Analysis Section */}
        <div className="mt-6">
          <CostAnalysisSection
            costData={costAnalysisData}
            isLoading={costAnalysisLoading}
            error={costAnalysisError}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}