'use client';

import React, { useState, useCallback, useReducer, useEffect } from 'react';
import { QuizData } from '@/lib/quiz/types';
import { debugLog, LogEntry } from '@/components/debug/DebugConsole';
import QuizFormPanel from './QuizFormPanel';
import DebugConsolePanel from './DebugConsolePanel';
import ResultsPanel from './ResultsPanel';

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

interface AssessmentProgress {
  stage: 'initializing' | 'analyzing' | 'processing' | 'complete' | 'error';
  message: string;
  progress: number;
}

interface PanelSizes {
  leftWidth: number;
  rightWidth: number;
  bottomHeight: number;
}

interface LogFilters {
  level: string;
  category: string;
  search: string;
}

interface UnifiedState {
  quizData: QuizData | null;
  assessmentResults: AssessmentResult | null;
  debugLogs: LogEntry[];
  isAnalyzing: boolean;
  analysisProgress: AssessmentProgress | null;
  panelSizes: PanelSizes;
  debugConsoleState: {
    filters: LogFilters;
    selectedLog: LogEntry | null;
  };
  researchData: any;
}

type UnifiedAction =
  | { type: 'SET_QUIZ_DATA'; payload: QuizData }
  | { type: 'SET_ASSESSMENT_RESULTS'; payload: AssessmentResult }
  | { type: 'ADD_DEBUG_LOG'; payload: LogEntry }
  | { type: 'CLEAR_DEBUG_LOGS' }
  | { type: 'SET_ANALYZING'; payload: boolean }
  | { type: 'SET_ANALYSIS_PROGRESS'; payload: AssessmentProgress | null }
  | { type: 'SET_PANEL_SIZES'; payload: Partial<PanelSizes> }
  | { type: 'SET_DEBUG_FILTERS'; payload: LogFilters }
  | { type: 'SET_SELECTED_LOG'; payload: LogEntry | null }
  | { type: 'SET_RESEARCH_DATA'; payload: any }
  | { type: 'RESET_SESSION' };

const initialState: UnifiedState = {
  quizData: null,
  assessmentResults: null,
  debugLogs: [],
  isAnalyzing: false,
  analysisProgress: null,
  panelSizes: {
    leftWidth: 40,
    rightWidth: 35,
    bottomHeight: 25,
  },
  debugConsoleState: {
    filters: {
      level: 'all',
      category: 'all',
      search: '',
    },
    selectedLog: null,
  },
  researchData: null,
};

function unifiedReducer(state: UnifiedState, action: UnifiedAction): UnifiedState {
  switch (action.type) {
    case 'SET_QUIZ_DATA':
      return { ...state, quizData: action.payload };
    
    case 'SET_ASSESSMENT_RESULTS':
      return { ...state, assessmentResults: action.payload };
    
    case 'ADD_DEBUG_LOG':
      return {
        ...state,
        debugLogs: [action.payload, ...state.debugLogs].slice(0, 1000), // Keep last 1000 logs
      };
    
    case 'CLEAR_DEBUG_LOGS':
      return { ...state, debugLogs: [] };
    
    case 'SET_ANALYZING':
      return { ...state, isAnalyzing: action.payload };
    
    case 'SET_ANALYSIS_PROGRESS':
      return { ...state, analysisProgress: action.payload };
    
    case 'SET_PANEL_SIZES':
      return {
        ...state,
        panelSizes: { ...state.panelSizes, ...action.payload },
      };
    
    case 'SET_DEBUG_FILTERS':
      return {
        ...state,
        debugConsoleState: {
          ...state.debugConsoleState,
          filters: action.payload,
        },
      };
    
    case 'SET_SELECTED_LOG':
      return {
        ...state,
        debugConsoleState: {
          ...state.debugConsoleState,
          selectedLog: action.payload,
        },
      };
    
    case 'SET_RESEARCH_DATA':
      return { ...state, researchData: action.payload };
    
    case 'RESET_SESSION':
      return {
        ...initialState,
        panelSizes: state.panelSizes, // Preserve panel sizes
        debugConsoleState: {
          ...initialState.debugConsoleState,
          filters: state.debugConsoleState.filters, // Preserve filters
        },
      };
    
    default:
      return state;
  }
}

interface UnifiedDebugInterfaceProps {
  initialMode?: 'development' | 'production';
  enableDebugConsole?: boolean;
  persistState?: boolean;
}

export default function UnifiedDebugInterface({
  initialMode = 'development',
  enableDebugConsole = true,
  persistState = true,
}: UnifiedDebugInterfaceProps) {
  const [state, dispatch] = useReducer(unifiedReducer, initialState);

  // Initialize logging
  useEffect(() => {
    debugLog.info('UnifiedInterface', 'Unified Debug Interface initialized', {
      mode: initialMode,
      debugConsoleEnabled: enableDebugConsole,
      persistState,
    });
  }, [initialMode, enableDebugConsole, persistState]);

  // Subscribe to debug logs
  useEffect(() => {
    const handleNewLog = (logs: LogEntry[]) => {
      const latestLog = logs[0];
      if (latestLog && !state.debugLogs.find(log => log.id === latestLog.id)) {
        dispatch({ type: 'ADD_DEBUG_LOG', payload: latestLog });
      }
    };

    // This would need to be implemented in the DebugConsole component
    // For now, we'll use a simple approach
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    console.log = (...args) => {
      originalConsoleLog(...args);
      if (args[0]?.includes?.('[')) {
        const match = args[0].match(/\[([^\]]+)\]/);
        if (match) {
          const category = match[1];
          const message = args[0].replace(/\[[^\]]+\]\s*/, '');
          dispatch({
            type: 'ADD_DEBUG_LOG',
            payload: {
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              timestamp: new Date(),
              level: 'info',
              category,
              message,
              data: args.slice(1),
            },
          });
        }
      }
    };

    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, [state.debugLogs]);

  // Handle quiz data changes
  const handleQuizDataChange = useCallback((data: QuizData) => {
    debugLog.info('UnifiedInterface', 'Quiz data updated', data);
    dispatch({ type: 'SET_QUIZ_DATA', payload: data });
  }, []);

  // Handle analysis start
  const handleAnalysisStart = useCallback(async (data: QuizData) => {
    debugLog.info('UnifiedInterface', 'Starting analysis process');
    dispatch({ type: 'SET_ANALYZING', payload: true });
    dispatch({ type: 'SET_ASSESSMENT_RESULTS', payload: null });

    try {
      const { createJobRiskAnalyzer } = await import('@/lib/assessment/analyzer');
      
      const analyzer = createJobRiskAnalyzer(data.apiKey!, (progress) => {
        debugLog.debug('UnifiedInterface', `Analysis progress: ${progress.stage} - ${progress.message}`);
        dispatch({ type: 'SET_ANALYSIS_PROGRESS', payload: progress });
      });

      const result = await analyzer.analyzeJobRisk({
        jobDescription: data.jobDescription,
        experience: data.experience,
        industry: data.industry,
        location: data.location,
        salaryRange: data.salaryRange,
        skillSet: data.skillSet,
        apiKey: data.apiKey!,
        model: data.model
      });

      if (result.success && result.data) {
        debugLog.success('UnifiedInterface', 'Analysis completed successfully');
        dispatch({ type: 'SET_ASSESSMENT_RESULTS', payload: result.data });
        
        // Load research data
        try {
          const { assessmentIntegration } = await import('@/lib/research/service/assessment-integration');
          const researchReport = await assessmentIntegration.generateRiskReport(data);
          dispatch({ type: 'SET_RESEARCH_DATA', payload: researchReport });
          debugLog.success('UnifiedInterface', 'Research data loaded');
        } catch (error) {
          debugLog.warn('UnifiedInterface', 'Research data loading failed', error);
        }
      } else {
        debugLog.error('UnifiedInterface', 'Analysis failed', result.error);
      }
    } catch (error) {
      debugLog.error('UnifiedInterface', 'Analysis error', error);
    } finally {
      dispatch({ type: 'SET_ANALYZING', payload: false });
      dispatch({ type: 'SET_ANALYSIS_PROGRESS', payload: null });
    }
  }, []);

  // Handle debug console actions
  const handleClearLogs = useCallback(() => {
    debugLog.info('UnifiedInterface', 'Clearing debug logs');
    dispatch({ type: 'CLEAR_DEBUG_LOGS' });
  }, []);

  const handleExportLogs = useCallback((format: 'json' | 'txt') => {
    debugLog.info('UnifiedInterface', `Exporting logs as ${format}`);
    
    const exportData = {
      timestamp: new Date().toISOString(),
      session: {
        quizData: state.quizData,
        assessmentResults: state.assessmentResults,
        researchData: state.researchData,
      },
      logs: state.debugLogs,
      filters: state.debugConsoleState.filters,
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `debug-session-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      const logText = state.debugLogs.map(log => 
        `[${log.timestamp.toISOString()}] [${log.level.toUpperCase()}] [${log.category}] ${log.message}${
          log.data ? '\nData: ' + JSON.stringify(log.data, null, 2) : ''
        }`
      ).join('\n\n');
      
      const blob = new Blob([logText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `debug-logs-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [state]);

  const handleFiltersChange = useCallback((filters: LogFilters) => {
    dispatch({ type: 'SET_DEBUG_FILTERS', payload: filters });
  }, []);

  const handleLogSelect = useCallback((log: LogEntry | null) => {
    dispatch({ type: 'SET_SELECTED_LOG', payload: log });
  }, []);

  const handleResetSession = useCallback(() => {
    debugLog.info('UnifiedInterface', 'Resetting debug session');
    dispatch({ type: 'RESET_SESSION' });
  }, []);

  return (
    <div className="unified-debug-interface h-screen bg-gray-50 overflow-hidden">
      {/* Header Bar */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">CareerGuard Debug Interface</h1>
            <p className="text-xs text-gray-500">Development & Debugging Environment</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-xs text-gray-500">
            Logs: {state.debugLogs.length}
          </div>
          {state.isAnalyzing && (
            <div className="flex items-center space-x-2 text-xs text-blue-600">
              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Analyzing...</span>
            </div>
          )}
          <button
            onClick={handleResetSession}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
          >
            Reset Session
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="unified-layout flex-1 grid grid-cols-[40%_35%_25%] grid-rows-[1fr_25%] gap-4 p-4 h-[calc(100vh-4rem)]">
        {/* Quiz Form Panel */}
        <div className="quiz-form-panel bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <QuizFormPanel
            onDataChange={handleQuizDataChange}
            onAnalysisStart={handleAnalysisStart}
            isAnalyzing={state.isAnalyzing}
            analysisProgress={state.analysisProgress}
            quizData={state.quizData}
          />
        </div>

        {/* Debug Console Panel */}
        <div className="debug-console-panel bg-gray-900 rounded-lg shadow-sm overflow-hidden">
          <DebugConsolePanel
            logs={state.debugLogs}
            onClear={handleClearLogs}
            onExport={handleExportLogs}
            filters={state.debugConsoleState.filters}
            onFiltersChange={handleFiltersChange}
            selectedLog={state.debugConsoleState.selectedLog}
            onLogSelect={handleLogSelect}
          />
        </div>

        {/* Spacer for third column in first row */}
        <div></div>

        {/* Results Panel - spans all columns */}
        <div className="results-panel col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <ResultsPanel
            results={state.assessmentResults}
            researchData={state.researchData}
            quizData={state.quizData}
            isLoading={state.isAnalyzing}
            onExport={() => handleExportLogs('json')}
          />
        </div>
      </div>
    </div>
  );
}