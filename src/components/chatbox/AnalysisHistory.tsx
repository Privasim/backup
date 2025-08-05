'use client';

import React, { useState, useMemo } from 'react';
import { AnalysisResult } from './types';
import { useStorageManager } from './hooks/useStorageManager';
import { ContentProcessor } from './utils/content-processor';
import { ClipboardUtils } from './utils/clipboard-utils';
import AnalysisComparison from './AnalysisComparison';

interface AnalysisHistoryProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectResult?: (result: AnalysisResult) => void;
}

/**
 * Component for viewing and managing analysis history
 */
export const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({
  isVisible,
  onClose,
  onSelectResult
}) => {
  const { getAnalysisHistory, clearHistory } = useStorageManager();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'model' | 'length'>('date');
  const [filterBy, setFilterBy] = useState<'all' | 'profile' | 'resume' | 'interview'>('all');
  const [selectedResults, setSelectedResults] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Get all analysis history
  const allResults = useMemo(() => {
    return getAnalysisHistory();
  }, [getAnalysisHistory]);

  // Filter and sort results
  const filteredResults = useMemo(() => {
    let filtered = allResults;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(result =>
        result.content.toLowerCase().includes(query) ||
        result.model.toLowerCase().includes(query) ||
        result.type.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(result => result.type === filterBy);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'model':
          return a.model.localeCompare(b.model);
        case 'length':
          return b.content.length - a.content.length;
        default:
          return 0;
      }
    });

    return filtered;
  }, [allResults, searchQuery, sortBy, filterBy]);

  // Handle result selection
  const handleResultToggle = (resultId: string) => {
    setSelectedResults(prev => {
      if (prev.includes(resultId)) {
        return prev.filter(id => id !== resultId);
      } else {
        return [...prev, resultId];
      }
    });
  };

  // Select all visible results
  const handleSelectAll = () => {
    if (selectedResults.length === filteredResults.length) {
      setSelectedResults([]);
    } else {
      setSelectedResults(filteredResults.map(r => r.id));
    }
  };

  // Copy selected results
  const handleCopySelected = async () => {
    const selected = filteredResults.filter(r => selectedResults.includes(r.id));
    if (selected.length === 0) return;

    const messages = selected.map(result => ({
      type: 'assistant',
      content: result.content,
      timestamp: result.timestamp
    }));

    await ClipboardUtils.copyConversation(messages, true);
  };

  // Export selected results
  const handleExportSelected = (format: 'text' | 'markdown' | 'html' | 'json') => {
    const selected = filteredResults.filter(r => selectedResults.includes(r.id));
    if (selected.length === 0) return;

    const messages = selected.map(result => ({
      id: result.id,
      type: 'assistant' as const,
      content: result.content,
      timestamp: result.timestamp,
      analysisType: result.type,
      metadata: { model: result.model }
    }));

    const exportContent = ContentProcessor.exportContent(
      messages,
      format,
      { 
        title: 'Analysis History Export',
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
    a.download = `analysis-history.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Clear all history
  const handleClearHistory = () => {
    clearHistory();
    setSelectedResults([]);
    setShowConfirmClear(false);
  };

  // Show comparison
  const handleShowComparison = () => {
    setShowComparison(true);
  };

  // Format content preview
  const formatPreview = (content: string, maxLength = 150) => {
    const sanitized = ContentProcessor.sanitizeContent(content, { maxLength });
    return sanitized.length > maxLength ? sanitized + '...' : sanitized;
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Analysis History ({allResults.length} total)
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Controls */}
          <div className="p-4 border-b border-gray-200 space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="Search analyses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="date">Sort by Date</option>
                <option value="model">Sort by Model</option>
                <option value="length">Sort by Length</option>
              </select>
              
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="profile">Profile Analysis</option>
                <option value="resume">Resume Analysis</option>
                <option value="interview">Interview Prep</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {selectedResults.length === filteredResults.length ? 'Deselect All' : 'Select All'}
                </button>
                {selectedResults.length > 0 && (
                  <span className="text-sm text-gray-500">
                    ({selectedResults.length} selected)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {selectedResults.length > 0 && (
                  <>
                    <button
                      onClick={handleCopySelected}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                    >
                      Copy Selected
                    </button>
                    
                    <div className="relative group">
                      <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors">
                        Export Selected
                      </button>
                      <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                        <div className="py-1 min-w-[120px]">
                          <button
                            onClick={() => handleExportSelected('text')}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Plain Text
                          </button>
                          <button
                            onClick={() => handleExportSelected('markdown')}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Markdown
                          </button>
                          <button
                            onClick={() => handleExportSelected('html')}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            HTML
                          </button>
                          <button
                            onClick={() => handleExportSelected('json')}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            JSON
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {allResults.length > 1 && (
                  <button
                    onClick={handleShowComparison}
                    className="px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors"
                  >
                    Compare
                  </button>
                )}

                {allResults.length > 0 && (
                  <button
                    onClick={() => setShowConfirmClear(true)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto">
            {filteredResults.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="text-sm">
                  {searchQuery ? 'No analyses match your search' : 'No analysis history found'}
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredResults.map((result) => (
                  <div
                    key={result.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      selectedResults.includes(result.id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedResults.includes(result.id)}
                        onChange={() => handleResultToggle(result.id)}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {result.type}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {result.model}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{result.content.length} chars</span>
                            <span>•</span>
                            <span>{new Date(result.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          {formatPreview(result.content)}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onSelectResult?.(result)}
                            className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            View Full
                          </button>
                          <button
                            onClick={() => ClipboardUtils.copyAnalysisResult(result.content, {
                              model: result.model,
                              timestamp: result.timestamp,
                              analysisType: result.type
                            })}
                            className="text-xs text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comparison Modal */}
      {showComparison && (
        <AnalysisComparison
          results={allResults}
          onClose={() => setShowComparison(false)}
        />
      )}

      {/* Clear Confirmation */}
      {showConfirmClear && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Clear Analysis History
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              This will permanently delete all {allResults.length} analysis results. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleClearHistory}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AnalysisHistory;