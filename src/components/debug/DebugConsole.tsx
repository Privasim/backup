'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug' | 'success';
  category: string;
  message: string;
  data?: any;
  stack?: string;
}

interface DebugConsoleProps {
  isVisible: boolean;
  onToggle: () => void;
  className?: string;
}

// Global log store
class LogStore {
  private logs: LogEntry[] = [];
  private listeners: Set<(logs: LogEntry[]) => void> = new Set();
  private maxLogs = 1000;

  addLog(entry: Omit<LogEntry, 'id' | 'timestamp'>) {
    const logEntry: LogEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    this.logs.unshift(logEntry);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    this.notifyListeners();
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    this.notifyListeners();
  }

  subscribe(listener: (logs: LogEntry[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.getLogs()));
  }
}

// Global log store instance
const globalLogStore = new LogStore();

// Global logging functions
export const debugLog = {
  info: (category: string, message: string, data?: any) => {
    console.log(`[${category}] ${message}`, data);
    globalLogStore.addLog({ level: 'info', category, message, data });
  },
  warn: (category: string, message: string, data?: any) => {
    console.warn(`[${category}] ${message}`, data);
    globalLogStore.addLog({ level: 'warn', category, message, data });
  },
  error: (category: string, message: string, data?: any, stack?: string) => {
    console.error(`[${category}] ${message}`, data);
    globalLogStore.addLog({ level: 'error', category, message, data, stack });
  },
  debug: (category: string, message: string, data?: any) => {
    console.debug(`[${category}] ${message}`, data);
    globalLogStore.addLog({ level: 'debug', category, message, data });
  },
  success: (category: string, message: string, data?: any) => {
    console.log(`[${category}] ✅ ${message}`, data);
    globalLogStore.addLog({ level: 'success', category, message, data });
  },
};

export default function DebugConsole({ isVisible, onToggle, className = '' }: DebugConsoleProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);

  // Subscribe to log updates
  useEffect(() => {
    const unsubscribe = globalLogStore.subscribe(setLogs);
    setLogs(globalLogStore.getLogs());
    return unsubscribe;
  }, []);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesText = filter === '' || 
      log.message.toLowerCase().includes(filter.toLowerCase()) ||
      log.category.toLowerCase().includes(filter.toLowerCase());
    
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    
    return matchesText && matchesLevel && matchesCategory;
  });

  // Get unique categories
  const categories = Array.from(new Set(logs.map(log => log.category))).sort();

  const clearLogs = () => {
    globalLogStore.clearLogs();
  };

  const copyAllLogs = () => {
    const logText = filteredLogs.map(log => 
      `[${log.timestamp.toISOString()}] [${log.level.toUpperCase()}] [${log.category}] ${log.message}${
        log.data ? '\nData: ' + JSON.stringify(log.data, null, 2) : ''
      }${log.stack ? '\nStack: ' + log.stack : ''}`
    ).join('\n\n');
    
    navigator.clipboard.writeText(logText).then(() => {
      debugLog.success('Console', 'Logs copied to clipboard');
    });
  };

  const exportLogs = () => {
    const logData = {
      timestamp: new Date().toISOString(),
      logs: filteredLogs,
      filters: { filter, levelFilter, categoryFilter }
    };
    
    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    debugLog.success('Console', 'Logs exported to file');
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-50';
      case 'warn': return 'text-yellow-600 bg-yellow-50';
      case 'success': return 'text-green-600 bg-green-50';
      case 'debug': return 'text-purple-600 bg-purple-50';
      default: return 'text-blue-600 bg-blue-50';
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

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 bg-gray-800 text-white p-2 rounded-r-lg shadow-lg hover:bg-gray-700 transition-colors"
        title="Open Debug Console"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    );
  }

  return (
    <div className={`fixed left-0 top-0 h-full w-96 bg-gray-900 text-white shadow-2xl z-40 flex flex-col ${className}`}>
      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Debug Console</h3>
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-white transition-colors"
            title="Close Console"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Controls */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              onClick={clearLogs}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
              title="Clear all logs"
            >
              Clear
            </button>
            <button
              onClick={copyAllLogs}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
              title="Copy logs to clipboard"
            >
              Copy
            </button>
            <button
              onClick={exportLogs}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
              title="Export logs to file"
            >
              Export
            </button>
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
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
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
            >
              <option value="all">All Levels</option>
              <option value="error">Errors</option>
              <option value="warn">Warnings</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
              <option value="success">Success</option>
            </select>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
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
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm placeholder-gray-400"
          />
        </div>
        
        <div className="mt-2 text-xs text-gray-400">
          {filteredLogs.length} of {logs.length} logs
        </div>
      </div>

      {/* Logs */}
      <div 
        ref={consoleRef}
        className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-xs"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            No logs to display
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className={`p-2 rounded cursor-pointer hover:bg-gray-800 transition-colors ${
                selectedLog?.id === log.id ? 'bg-gray-700' : ''
              }`}
              onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
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
                          <pre className="bg-gray-800 p-2 rounded text-xs overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        </div>
                      )}
                      {log.stack && (
                        <div>
                          <div className="text-gray-400 text-xs mb-1">Stack Trace:</div>
                          <pre className="bg-gray-800 p-2 rounded text-xs overflow-x-auto text-red-300">
                            {log.stack}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}

// Hook for using debug console
export function useDebugConsole() {
  const [isVisible, setIsVisible] = useState(false);

  const toggle = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  const show = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hide = useCallback(() => {
    setIsVisible(false);
  }, []);

  return {
    isVisible,
    toggle,
    show,
    hide,
    log: debugLog,
  };
}