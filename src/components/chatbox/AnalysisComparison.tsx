'use client';

import React, { useState, useMemo } from 'react';
import { AnalysisResult } from './types';
import { ContentProcessor } from './utils/content-processor';
import { ClipboardUtils } from './utils/clipboard-utils';

interface AnalysisComparisonProps {
  results: AnalysisResult[];
  onClose?: () => void;
}

/**
 * Component for comparing multiple analysis results
 */
export const AnalysisComparison: React.FC<AnalysisComparisonProps> = ({
  results,
  onClose
}) => {
  const [selectedResults, setSelectedResults] = useState<string[]>(
    results.slice(0, 2).map(r => r.id)
  );
  const [comparisonMode, setComparisonMode] = useState<'side-by-side' | 'diff' | 'summary'>('side-by-side');

  // Get selected analysis results
  const selectedAnalyses = useMemo(() => {
    return results.filter(result => selectedResults.includes(result.id));
  }, [results, selectedResults]);

  // Generate comparison data
  const comparisonData = useMemo(() => {
    if (selectedAnalyses.length < 2) return null;
    
    return ContentProcessor.compareAnalysisResults(
      selectedAnalyses[0],
      selectedAnalyses[1]
    );
  }, [selectedAnalyses]);

  // Generate summary for all results
  const summaryData = useMemo(() => {
    return ContentProcessor.generateAnalysisSummary(results);
  }, [results]);

  // Handle result selection
  const handleResultToggle = (resultId: string) => {
    setSelectedResults(prev => {
      if (prev.includes(resultId)) {
        return prev.filter(id => id !== resultId);
      } else if (prev.length < 2) {
        return [...prev, resultId];
      } else {
        // Replace the first selected item
        return [prev[1], resultId];
      }
    });
  };

  // Copy comparison results
  const handleCopyComparison = async () => {
    if (!comparisonData) return;
    
    const comparisonText = [
      'Analysis Comparison',
      '==================',
      '',
      'Similarities:',
      ...comparisonData.similarities.map(s => `• ${s}`),
      '',
      'Differences:',
      ...comparisonData.differences.map(d => `• ${d}`),
      '',
      'Improvements:',
      ...comparisonData.improvements.map(i => `• ${i}`),
      '',
      `Generated: ${new Date().toLocaleString()}`
    ].join('\n');
    
    await ClipboardUtils.copyToClipboard(comparisonText);
  };

  // Export comparison
  const handleExportComparison = (format: 'text' | 'markdown' | 'html') => {
    if (selectedAnalyses.length === 0) return;
    
    const exportContent = ContentProcessor.exportContent(
      selectedAnalyses.map(result => ({
        id: result.id,
        type: 'assistant' as const,
        content: result.content,
        timestamp: result.timestamp,
        analysisType: result.type,
        metadata: { model: result.model }
      })),
      format,
      { 
        title: 'Analysis Comparison',
        includeMetadata: true 
      }
    );
    
    // Create and download file
    const blob = new Blob([exportContent], { 
      type: format === 'html' ? 'text/html' : 'text/plain' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-comparison.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Analysis Comparison ({results.length} results)
          </h2>
          <div className="flex items-center gap-2">
            {/* Mode Selector */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setComparisonMode('side-by-side')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  comparisonMode === 'side-by-side'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Side by Side
              </button>
              <button
                onClick={() => setComparisonMode('diff')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  comparisonMode === 'diff'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Differences
              </button>
              <button
                onClick={() => setComparisonMode('summary')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  comparisonMode === 'summary'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Summary
              </button>
            </div>
            
            {/* Actions */}
            <button
              onClick={handleCopyComparison}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
              title="Copy comparison"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            
            <div className="relative group">
              <button
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                title="Export comparison"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <div className="py-1 min-w-[120px]">
                  <button
                    onClick={() => handleExportComparison('text')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Plain Text
                  </button>
                  <button
                    onClick={() => handleExportComparison('markdown')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Markdown
                  </button>
                  <button
                    onClick={() => handleExportComparison('html')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    HTML
                  </button>
                </div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {comparisonMode === 'summary' ? (
            /* Summary View */
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-900">{summaryData.totalAnalyses}</div>
                  <div className="text-sm text-blue-600">Total Analyses</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-900">{summaryData.averageLength}</div>
                  <div className="text-sm text-green-600">Avg. Length (chars)</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-900">{summaryData.commonThemes.length}</div>
                  <div className="text-sm text-purple-600">Common Themes</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-900">
                    {Object.keys(summaryData.modelUsage).length}
                  </div>
                  <div className="text-sm text-orange-600">Models Used</div>
                </div>
              </div>

              {/* Common Themes */}
              {summaryData.commonThemes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Common Themes</h3>
                  <div className="space-y-2">
                    {summaryData.commonThemes.map((theme, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-800">{theme}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Model Usage */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Model Usage</h3>
                <div className="space-y-2">
                  {Object.entries(summaryData.modelUsage).map(([model, count]) => (
                    <div key={model} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm font-medium text-gray-800">{model}</span>
                      <span className="text-sm text-gray-600">{count} analyses</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time Range */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Time Range</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">
                    <div>Earliest: {new Date(summaryData.timeRange.earliest).toLocaleString()}</div>
                    <div>Latest: {new Date(summaryData.timeRange.latest).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              {/* Result Selection */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Select analyses to compare (max 2):
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {results.map((result) => (
                    <div
                      key={result.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedResults.includes(result.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleResultToggle(result.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-gray-900">
                          {result.model}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(result.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {result.content.substring(0, 100)}...
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comparison Content */}
              {comparisonMode === 'side-by-side' && selectedAnalyses.length === 2 ? (
                <div className="grid grid-cols-2 gap-6">
                  {selectedAnalyses.map((result, index) => (
                    <div key={result.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Analysis {index + 1}</h4>
                        <div className="text-xs text-gray-500">
                          {result.model} • {new Date(result.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                        <div className="text-sm text-gray-800 whitespace-pre-wrap">
                          {result.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : comparisonMode === 'diff' && comparisonData ? (
                <div className="space-y-6">
                  {/* Similarities */}
                  {comparisonData.similarities.length > 0 && (
                    <div>
                      <h4 className="font-medium text-green-900 mb-3 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Similarities
                      </h4>
                      <div className="space-y-2">
                        {comparisonData.similarities.map((similarity, index) => (
                          <div key={index} className="bg-green-50 border border-green-200 p-3 rounded-lg">
                            <div className="text-sm text-green-800">{similarity}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Differences */}
                  {comparisonData.differences.length > 0 && (
                    <div>
                      <h4 className="font-medium text-orange-900 mb-3 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Differences
                      </h4>
                      <div className="space-y-2">
                        {comparisonData.differences.map((difference, index) => (
                          <div key={index} className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                            <div className="text-sm text-orange-800">{difference}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Improvements */}
                  {comparisonData.improvements.length > 0 && (
                    <div>
                      <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        Improvements
                      </h4>
                      <div className="space-y-2">
                        {comparisonData.improvements.map((improvement, index) => (
                          <div key={index} className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                            <div className="text-sm text-blue-800">{improvement}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <div className="text-sm">
                    {selectedAnalyses.length < 2 
                      ? 'Select 2 analyses to compare'
                      : 'Choose a comparison mode above'
                    }
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisComparison;