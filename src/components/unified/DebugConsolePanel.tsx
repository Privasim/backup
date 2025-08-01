'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LogEntry } from '@/components/debug/DebugConsole';

interface LogFilters {
  level: string;
  category: string;
  search: string;
}

interface DebugConsolePanelProps {
  logs: LogEntry[];
  onClear: () => void;
  onExport: (format: 'json' | 'txt') => void;
  filters: LogFilters;
  onFiltersChange: (filters: LogFilters) => void;
  selectedLog: LogEntry | null;
  onLogSelect: (log: LogEntry | null) => void;
  className?: string;
}

export default function DebugConsolePanel({
  logs,
  onClear,
  onExport,
  filters,
  onFiltersChange,
  selectedLog,
  onLogSelect,
  className = '',
}: DebugConsolePanelProps) {
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesText = filters.search === '' || 
        log.message.toLowerCase().includes(filters.search.toLowerCase()) ||
        log.category.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesLevel = filters.level === 'all' || log.level === filters.level;
      const matchesCategory = filters.category === 'all' || log.category === filters.category;
      
      return matchesText && matchesLevel && matchesCategory;
    });
  }, [logs, filters]);

  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(logs.map(log => log.category))).sort();
  }, [logs]);

  const copyAllLogs = () => {
    const logText = filteredLogs.map(log => 
      `[${log.timestamp.toISOString()}] [${log.level.toUpperCase()}] [${log.category}] ${log.message}${
        log.data ? '\nData: ' + JSON.stringify(log.data, null, 2) : ''
      }${log.stack ? '\nStack: ' + log.stack : ''}`
    ).join('\n\n');
    
    navigator.clipboard.writeText(logText).then(() => {
      // Could add a toast notification here
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-400 bg-red-900/20';
      case 'warn': return 'text-yellow-400 bg-yellow-900/20';
      case 'success': return 'text-green-400 bg-green-900/20';
      case 'debug': return 'text-purple-400 bg-purple-900/20';
      default: return 'text-blue-400 bg-blue-900/20';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return '❌';
      case 'warn': return '⚠️';
      case 'success': return '✅';
      case 'debug': return '🔍';
      default: return 'ℹ️';
    }
  };

  return (
    <div className={`debug-console-panel flex flex-col h-full text-white ${className}`}>
      {/* Sticky Panel Header */}
      <div className="panel-header bg-gray-800 border-b border-gray-700 p-3 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Debug Console</h2>
          <div className="text-xs text-gray-400">
            {filteredLogs.length} of {logs.length} logs
          </div>
        </div>
        
        {/* Controls */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              onClick={onClear}
              className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition-colors"
              title="Clear all logs"
            >
              Clear
            </button>
            <button
              onClick={copyAllLogs}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors"
              title="Copy logs to clipboard"
            >
              Copy
            </button>
            <button
              onClick={() => onExport('json')}
              className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs transition-colors"
              title="Export logs as JSON"
            >
              Export
            </button>
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                autoScroll ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-600 hover:bg-gray-700'
              }`}
              title="Toggle auto-scroll"
            >
              {autoScroll ? 'Auto' : 'Manual'}
            </button>
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-2 gap-2">
            <select
              value={filters.level}
              onChange={(e) => onFiltersChange({ ...filters, level: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs"
            >
              <option value="all">All Levels</option>
              <option value="error">Errors</option>
              <option value="warn">Warnings</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
              <option value="success">Success</option>
            </select>
            
            <select
              value={filters.category}
              onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <input
            type="text"
            placeholder="Filter logs..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs placeholder-gray-400"
          />
        </div>
      </div>

      {/* Logs */}
      <div 
        ref={consoleRef}
        className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-xs max-h-96"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            {logs.length === 0 ? 'No logs yet. Start the assessment to see debug information.' : 'No logs match current filters.'}
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className={`p-2 rounded cursor-pointer hover:bg-gray-800 transition-colors ${
                selectedLog?.id === log.id ? 'bg-gray-700' : ''
              }`}
              onClick={() => onLogSelect(selectedLog?.id === log.id ? null : log)}
            >
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 mt-0.5">
                  {getLevelIcon(log.level)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getLevelColor(log.level)}`}>
                      {log.level.toUpperCase()}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                    <span className="text-blue-400 text-xs font-medium">
                      [{log.category}]
                    </span>
                  </div>
                  <div className="text-gray-200 break-words">
                    {log.message}
                  </div>
                  {selectedLog?.id === log.id && (
                    <div className="mt-2 space-y-2">
                      {log.data && (
                        <div>
                          <div className="text-gray-400 text-xs mb-1">Data:</div>
                          <pre className="bg-gray-800 p-2 rounded text-xs overflow-x-auto max-h-32">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        </div>
                      )}
                      {log.stack && (
                        <div>
                          <div className="text-gray-400 text-xs mb-1">Stack Trace:</div>
                          <pre className="bg-gray-800 p-2 rounded text-xs overflow-x-auto text-red-300 max-h-32">
                            {log.stack}
                          </pre>
                        </div>
                      )}
                      <div className="text-gray-400 text-xs">
                        ID: {log.id} | Timestamp: {log.timestamp.toISOString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>

      {/* Footer Stats */}
      <div className="panel-footer bg-gray-800 border-t border-gray-700 px-3 py-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-4">
            <span>Total: {logs.length}</span>
            <span>Filtered: {filteredLogs.length}</span>
            {logs.length > 0 && (
              <span>Latest: {logs[0]?.timestamp.toLocaleTimeString()}</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {autoScroll && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Live</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}