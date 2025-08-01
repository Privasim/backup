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
    console.log(`[${category}] ${message}`, data);
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
      case 'error': return 'text-red-500 bg-red-900/10';
      case 'warn': return 'text-yellow-500 bg-yellow-900/10';
      case 'success': return 'text-green-500 bg-green-900/10';
      case 'debug': return 'text-purple-500 bg-purple-900/10';
      default: return 'text-blue-500 bg-blue-900/10';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return '•';
      case 'warn': return '•';
      case 'success': return '•';
      case 'debug': return '•';
      default: return '•';
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
    <div className={`fixed left-0 top-0 h-full w-72 bg-gray-900 text-white shadow-2xl z-40 flex flex-col ${className}`}>
      {/* Header */}
      <div className="bg-gray-800 p-2 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Debug Console</h3>
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-white transition-colors"
            title="Close Console"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Controls */}
        <div className="space-y-1.5">
          <div className="flex gap-1">
            <button
              onClick={clearLogs}
              className="px-2 py-0.5 bg-red-600 hover:bg-red-700 rounded text-xs transition-colors"
              title="Clear all logs"
            >
              Clear
            </button>
            <button
              onClick={copyAllLogs}
              className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors"
              title="Copy logs to clipboard"
            >
              Copy
            </button>
            <button
              onClick={exportLogs}
              className="px-2 py-0.5 bg-green-600 hover:bg-green-700 rounded text-xs transition-colors"
              title="Export logs to file"
            >
              Export
            </button>
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`px-2 py-0.5 rounded text-xs transition-colors ${
                autoScroll ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-600 hover:bg-gray-700'
              }`}
              title="Toggle auto-scroll"
            >
              {autoScroll ? 'Auto' : 'Manual'}
            </button>
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-2 gap-1">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-1.5 py-0.5 text-xs"
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
              className="bg-gray-700 border border-gray-600 rounded px-1.5 py-0.5 text-xs"
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
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-0.5 text-xs placeholder-gray-400"
          />
        </div>
        
        <div className="mt-1.5 text-xs text-gray-400">
          {filteredLogs.length} of {logs.length} logs
        </div>
      </div>

      {/* Logs */}
      <div 
        ref={consoleRef}
        className="flex-1 overflow-y-auto p-1 space-y-0.5 font-mono text-xs"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-gray-500 text-center py-4 text-xs">
            No logs to display
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className={`p-1.5 rounded cursor-pointer hover:bg-gray-800 transition-colors ${
                selectedLog?.id === log.id ? 'bg-gray-700' : ''
              }`}
              onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
            >
              <div className="flex items-start gap-1.5">
                <span className={`flex-shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full ${getLevelColor(log.level).split(' ')[0]} ${getLevelColor(log.level).split(' ')[1]}`}>
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`px-1 py-0.5 rounded text-xs font-medium ${getLevelColor(log.level)}`}>
                      {log.level.charAt(0).toUpperCase()}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className="text-blue-400 text-xs font-medium truncate">
                      {log.category}
                    </span>
                  </div>
                  <div className="text-gray-200 break-words text-xs leading-tight">
                    {log.message}
                  </div>
                  {selectedLog?.id === log.id && (
                    <div className="mt-1.5 space-y-1.5">
                      {log.data && (
                        <div>
                          <div className="text-gray-400 text-xs mb-0.5">Data:</div>
                          <pre className="bg-gray-800 p-1.5 rounded text-xs overflow-x-auto max-h-20">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        </div>
                      )}
                      {log.stack && (
                        <div>
                          <div className="text-gray-400 text-xs mb-0.5">Stack:</div>
                          <pre className="bg-gray-800 p-1.5 rounded text-xs overflow-x-auto text-red-300 max-h-20">
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