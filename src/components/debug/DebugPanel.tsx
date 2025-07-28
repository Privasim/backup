'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { DebugLogEntry, debugLogger } from '@/lib/debug/logger';

interface DebugPanelProps {
  isVisible: boolean;
  onToggle: () => void;
}

export default function DebugPanel({ isVisible, onToggle }: DebugPanelProps) {
  const [logs, setLogs] = useState<DebugLogEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'error' | 'warn' | 'info' | 'success'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'api' | 'validation' | 'analysis' | 'progress' | 'system'>('all');
  const [isExpanded, setIsExpanded] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = debugLogger.subscribe(setLogs);
    setLogs(debugLogger.getLogs());
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (logsEndRef.current && isVisible) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isVisible]);

  const filteredLogs = logs.filter(log => {
    const levelMatch = filter === 'all' || log.level === filter;
    const categoryMatch = categoryFilter === 'all' || log.category === categoryFilter;
    return levelMatch && categoryMatch;
  });

  const getLevelIcon = (level: DebugLogEntry['level']) => {
    switch (level) {
      case 'error': return '❌';
      case 'warn': return '⚠️';
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      default: return '📝';
    }
  };

  const getLevelColor = (level: DebugLogEntry['level']) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'warn': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryColor = (category: DebugLogEntry['category']) => {
    switch (category) {
      case 'api': return 'bg-purple-100 text-purple-800';
      case 'validation': return 'bg-orange-100 text-orange-800';
      case 'analysis': return 'bg-blue-100 text-blue-800';
      case 'progress': return 'bg-green-100 text-green-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = useCallback((timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  }, []);

  const formatLogForCopy = useCallback((log: DebugLogEntry) => {
    const timestamp = formatTimestamp(log.timestamp);
    const duration = log.duration ? ` (${log.duration}ms)` : '';
    const data = log.data ? `\nData: ${typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}` : '';
    
    return `[${timestamp}] ${log.level.toUpperCase()} [${log.category.toUpperCase()}]${duration}: ${log.message}${data}`;
  }, [formatTimestamp]);

  const handleClearLogs = useCallback(() => {
    debugLogger.clear();
  }, []);

  const handleExportLogs = useCallback(() => {
    const logsData = debugLogger.exportLogs();
    const blob = new Blob([logsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${new Date().toISOString().slice(0, 19)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const handleCopyAllLogs = useCallback(async () => {
    try {
      const timestamp = new Date().toISOString();
      const header = `=== DEBUG LOGS EXPORT ===\nTimestamp: ${timestamp}\nTotal entries: ${logs.length}\n\n`;
      const logsText = header + debugLogger.exportLogsAsText();
      
      await navigator.clipboard.writeText(logsText);
      setCopyStatus(`All ${logs.length} logs copied!`);
      setTimeout(() => setCopyStatus(null), 2000);
    } catch (error) {
      setCopyStatus('Copy failed');
      setTimeout(() => setCopyStatus(null), 2000);
    }
  }, [logs.length]);

  const handleCopyFilteredLogs = useCallback(async () => {
    try {
      const timestamp = new Date().toISOString();
      const filterInfo = `Filter: Level=${filter}, Category=${categoryFilter}`;
      const logsText = `Debug Logs Export - ${timestamp}\n${filterInfo}\nTotal entries: ${filteredLogs.length}\n\n${filteredLogs.map(formatLogForCopy).join('\n\n')}`;
      
      await navigator.clipboard.writeText(logsText);
      setCopyStatus(`${filteredLogs.length} filtered logs copied!`);
      setTimeout(() => setCopyStatus(null), 2000);
    } catch (error) {
      setCopyStatus('Copy failed');
      setTimeout(() => setCopyStatus(null), 2000);
    }
  }, [filter, categoryFilter, filteredLogs, formatLogForCopy]);

  const handleCopyLog = useCallback(async (log: DebugLogEntry) => {
    try {
      const logText = formatLogForCopy(log);
      await navigator.clipboard.writeText(logText);
      setCopyStatus(`Log ${log.id} copied!`);
      setTimeout(() => setCopyStatus(null), 2000);
    } catch (error) {
      setCopyStatus('Copy failed');
      setTimeout(() => setCopyStatus(null), 2000);
    }
  }, [formatLogForCopy]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isVisible) return;
      
      // Ctrl+Shift+C to copy filtered logs
      if ((event.ctrlKey || event.metaKey) && event.key === 'c' && event.shiftKey) {
        event.preventDefault();
        handleCopyFilteredLogs();
      }
      
      // Ctrl+Shift+A to copy all logs
      if ((event.ctrlKey || event.metaKey) && event.key === 'a' && event.shiftKey) {
        event.preventDefault();
        handleCopyAllLogs();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isVisible, handleCopyFilteredLogs, handleCopyAllLogs]);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={onToggle}
          className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center space-x-2"
        >
          <span className="text-sm">🐛</span>
          <span className="text-sm font-medium">Debug</span>
          {logs.filter(log => log.level === 'error').length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {logs.filter(log => log.level === 'error').length}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl">
      {/* Header */}
      <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-lg">🐛</span>
          <h3 className="font-semibold">Debug Console</h3>
          <span className="text-xs bg-gray-700 px-2 py-1 rounded">
            {filteredLogs.length} entries
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {copyStatus && (
            <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
              {copyStatus}
            </span>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition-colors"
          >
            {isExpanded ? '↓ Collapse' : '↑ Expand'}
          </button>
          <button
            onClick={handleCopyFilteredLogs}
            className="text-xs bg-green-600 hover:bg-green-500 px-2 py-1 rounded transition-colors flex items-center space-x-1"
            title="Copy filtered logs to clipboard (Ctrl+Shift+C)"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
            </svg>
            <span>Copy Filtered</span>
          </button>
          <button
            onClick={handleClearLogs}
            className="text-xs bg-red-600 hover:bg-red-500 px-2 py-1 rounded transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleExportLogs}
            className="text-xs bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded transition-colors"
          >
            Export
          </button>
          <button
            onClick={onToggle}
            className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <label className="text-xs font-medium text-gray-700">Level:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="text-xs border border-gray-300 rounded px-2 py-1"
          >
            <option value="all">All</option>
            <option value="error">Errors</option>
            <option value="warn">Warnings</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-xs font-medium text-gray-700">Category:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="text-xs border border-gray-300 rounded px-2 py-1"
          >
            <option value="all">All</option>
            <option value="api">API</option>
            <option value="validation">Validation</option>
            <option value="analysis">Analysis</option>
            <option value="progress">Progress</option>
            <option value="system">System</option>
          </select>
        </div>

        <div className="flex items-center space-x-4 text-xs text-gray-600">
          <span>Errors: {logs.filter(log => log.level === 'error').length}</span>
          <span>Warnings: {logs.filter(log => log.level === 'warn').length}</span>
          <span>Total: {logs.length}</span>
        </div>

        <div className="flex items-center space-x-2 ml-auto">
          <button
            onClick={handleCopyAllLogs}
            className="text-xs bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded transition-colors flex items-center space-x-1"
            title="Copy all logs (unfiltered) to clipboard (Ctrl+Shift+A)"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z"/>
              <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"/>
            </svg>
            <span>Copy All ({logs.length})</span>
          </button>
        </div>
      </div>

      {/* Logs Container */}
      <div className={`overflow-y-auto bg-gray-900 text-gray-100 ${isExpanded ? 'h-96' : 'h-48'}`}>
        <div className="p-2 space-y-1">
          {filteredLogs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No logs match the current filters</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`group p-2 rounded border-l-4 text-xs font-mono ${getLevelColor(log.level)}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span>{getLevelIcon(log.level)}</span>
                    <span className="font-semibold">{formatTimestamp(log.timestamp)}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(log.category)}`}>
                      {log.category.toUpperCase()}
                    </span>
                    {log.duration && (
                      <span className="text-gray-500">({log.duration}ms)</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleCopyLog(log)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-200 transition-all duration-200 p-1 hover:bg-gray-700 rounded"
                    title="Copy this log entry"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                    </svg>
                  </button>
                </div>
                
                <div className="mb-1">
                  <span className="font-medium">{log.message}</span>
                </div>
                
                {log.data && (
                  <details className="mt-1">
                    <summary className="cursor-pointer text-gray-400 hover:text-gray-200">
                      Show data
                    </summary>
                    <pre className="mt-1 p-2 bg-gray-800 rounded text-xs overflow-x-auto">
                      {typeof log.data === 'string' 
                        ? log.data 
                        : JSON.stringify(log.data, null, 2)
                      }
                    </pre>
                  </details>
                )}
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
        
        {/* Help text */}
        <div className="px-2 py-1 bg-gray-800 border-t border-gray-700 text-xs text-gray-400">
          <div className="flex items-center justify-between">
            <span>💡 Hover over log entries to see copy button</span>
            <span>Shortcuts: Ctrl+Shift+C (copy filtered) | Ctrl+Shift+A (copy all)</span>
          </div>
        </div>
      </div>
    </div>
  );
}