'use client';

import React, { useState, useCallback } from 'react';
import { useStorageManager } from './hooks/useStorageManager';

interface StorageManagementPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

/**
 * Panel for managing chatbox storage and cache
 */
export const StorageManagementPanel: React.FC<StorageManagementPanelProps> = ({
  isVisible,
  onClose
}) => {
  const {
    storageStats,
    isLoading,
    cleanup,
    clearHistory,
    clearAll,
    exportData,
    importData,
    getStorageQuota,
    refreshStats
  } = useStorageManager();

  const [quotaInfo, setQuotaInfo] = useState<any>(null);
  const [showConfirmClear, setShowConfirmClear] = useState<'history' | 'all' | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [operationResult, setOperationResult] = useState<string | null>(null);

  /**
   * Load storage quota information
   */
  const loadQuotaInfo = useCallback(async () => {
    const quota = await getStorageQuota();
    setQuotaInfo(quota);
  }, [getStorageQuota]);

  /**
   * Handle cleanup operation
   */
  const handleCleanup = useCallback(async () => {
    try {
      const result = await cleanup();
      setOperationResult(
        `Cleanup completed: ${result.removedItems} items removed, ${result.freedSpace} bytes freed`
      );
      
      if (result.errors.length > 0) {
        console.warn('Cleanup errors:', result.errors);
      }
    } catch (error) {
      setOperationResult(`Cleanup failed: ${error}`);
    }
  }, [cleanup]);

  /**
   * Handle clear history
   */
  const handleClearHistory = useCallback(() => {
    clearHistory();
    setOperationResult('Analysis history cleared');
    setShowConfirmClear(null);
  }, [clearHistory]);

  /**
   * Handle clear all data
   */
  const handleClearAll = useCallback(() => {
    clearAll();
    setOperationResult('All storage data cleared');
    setShowConfirmClear(null);
  }, [clearAll]);

  /**
   * Handle export data
   */
  const handleExport = useCallback(() => {
    try {
      const data = exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `chatbox-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
      setOperationResult('Data exported successfully');
    } catch (error) {
      setOperationResult(`Export failed: ${error}`);
    }
  }, [exportData]);

  /**
   * Handle import data
   */
  const handleImport = useCallback(async () => {
    if (!importFile) return;
    
    try {
      const text = await importFile.text();
      const result = await importData(text);
      
      setOperationResult(
        `Import completed: ${result.importedItems} items imported`
      );
      
      if (result.errors.length > 0) {
        console.warn('Import errors:', result.errors);
      }
      
      setImportFile(null);
    } catch (error) {
      setOperationResult(`Import failed: ${error}`);
    }
  }, [importFile, importData]);

  /**
   * Format bytes to human readable
   */
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  /**
   * Load quota info on mount
   */
  React.useEffect(() => {
    if (isVisible) {
      loadQuotaInfo();
      refreshStats();
    }
  }, [isVisible, loadQuotaInfo, refreshStats]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Storage Management
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Storage Statistics */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Storage Usage</h3>
            
            {storageStats && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Total Size</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatBytes(storageStats.totalSize)}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Items</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {storageStats.itemCount}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Cache Size</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatBytes(storageStats.cacheSize)}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">History Size</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatBytes(storageStats.historySize)}
                  </div>
                </div>
              </div>
            )}

            {quotaInfo && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm text-blue-600 mb-1">Browser Storage Quota</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-800">
                    {formatBytes(quotaInfo.usage)} / {formatBytes(quotaInfo.quota)}
                  </span>
                  <span className="text-sm text-blue-600">
                    {quotaInfo.usagePercentage.toFixed(1)}% used
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(quotaInfo.usagePercentage, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Management Actions */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Management Actions</h3>
            
            <div className="space-y-3">
              <button
                onClick={handleCleanup}
                disabled={isLoading}
                className="w-full flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors disabled:opacity-50"
              >
                <div className="text-left">
                  <div className="font-medium text-yellow-800">Cleanup Storage</div>
                  <div className="text-sm text-yellow-600">
                    Remove expired cache entries and optimize storage
                  </div>
                </div>
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>

              <button
                onClick={() => setShowConfirmClear('history')}
                className="w-full flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <div className="text-left">
                  <div className="font-medium text-orange-800">Clear Analysis History</div>
                  <div className="text-sm text-orange-600">
                    Remove all saved analysis results
                  </div>
                </div>
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                </svg>
              </button>

              <button
                onClick={() => setShowConfirmClear('all')}
                className="w-full flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                <div className="text-left">
                  <div className="font-medium text-red-800">Clear All Data</div>
                  <div className="text-sm text-red-600">
                    Remove all chatbox data including settings and API keys
                  </div>
                </div>
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Backup & Restore */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Backup & Restore</h3>
            
            <div className="space-y-3">
              <button
                onClick={handleExport}
                className="w-full flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="text-left">
                  <div className="font-medium text-green-800">Export Data</div>
                  <div className="text-sm text-green-600">
                    Download all chatbox data as JSON file
                  </div>
                </div>
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>

              <div className="flex gap-2">
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <button
                  onClick={handleImport}
                  disabled={!importFile || isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Import
                </button>
              </div>
            </div>
          </div>

          {/* Operation Result */}
          {operationResult && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">{operationResult}</div>
              <button
                onClick={() => setOperationResult(null)}
                className="text-xs text-blue-600 hover:text-blue-800 mt-1"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Confirmation Dialogs */}
          {showConfirmClear && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
              <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Confirm {showConfirmClear === 'all' ? 'Clear All Data' : 'Clear History'}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {showConfirmClear === 'all' 
                    ? 'This will permanently delete all chatbox data including settings, API keys, and analysis history. This action cannot be undone.'
                    : 'This will permanently delete all analysis history. Your settings and API keys will be preserved. This action cannot be undone.'
                  }
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowConfirmClear(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={showConfirmClear === 'all' ? handleClearAll : handleClearHistory}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    {showConfirmClear === 'all' ? 'Clear All' : 'Clear History'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};