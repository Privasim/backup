'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import chatboxLogStore, { LogEntry } from '../utils/logStore';

interface DebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to log updates
  useEffect(() => {
    const unsubscribe = chatboxLogStore.subscribe(setLogs);
    return () => unsubscribe();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter(log => {
    const matchesText = filter === '' || 
      log.message.toLowerCase().includes(filter.toLowerCase()) ||
      log.category.toLowerCase().includes(filter.toLowerCase());
    
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    
    return matchesText && matchesLevel && matchesCategory;
  });

  const handleCopyAll = useCallback(() => {
    const textToCopy = filteredLogs
      .map(log => `[${log.timestamp.toLocaleTimeString()}] [${log.level.toUpperCase()}] [${log.category}] ${log.message}${log.data ? ' ' + JSON.stringify(log.data, null, 2) : ''}`)
      .join('\n');
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      console.log('Logs copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy logs:', err);
    });
  }, [filteredLogs]);

  const handleClearLogs = useCallback(() => {
    chatboxLogStore.clearLogs();
  }, []);

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-50';
      case 'warn': return 'text-yellow-600 bg-yellow-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      case 'debug': return 'text-gray-600 bg-gray-50';
      case 'success': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!isOpen) return null;

  const categories = Array.from(new Set(logs.map(log => log.category)));

  return (
    <div className="fixed bottom-16 right-4 w-96 h-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Chatbox Debug Logs</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyAll}
            className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={filteredLogs.length === 0}
          >
            Copy All
          </button>
          <button
            onClick={handleClearLogs}
            className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            disabled={logs.length === 0}
          >
            Clear
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-2 border-b border-gray-200 space-y-2">
        <input
          type="text"
          placeholder="Filter logs..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
        />
        <div className="flex space-x-2">
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
          >
            <option value="all">All Levels</option>
            <option value="info">Info</option>
            <option value="warn">Warn</option>
            <option value="error">Error</option>
            <option value="debug">Debug</option>
            <option value="success">Success</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Log List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredLogs.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            No logs to display
          </div>
        ) : (
          filteredLogs.map(log => (
            <div key={log.id} className={`text-xs p-2 rounded ${getLevelColor(log.level)}`}>
              <div className="flex items-center space-x-1">
                <span className="font-semibold">[{log.level.toUpperCase()}]</span>
                <span className="text-gray-600">[{log.category}]</span>
                <span className="text-gray-500">{log.timestamp.toLocaleTimeString()}</span>
              </div>
              <div className="mt-1">{log.message}</div>
              {log.data && (
                <pre className="mt-1 text-xs bg-gray-100 p-1 rounded overflow-x-auto">
                  {JSON.stringify(log.data, null, 2)}
                </pre>
              )}
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};
