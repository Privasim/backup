'use client';

import React, { useState, useRef } from 'react';
import { GoToMarketStrategies } from '../types';
import { exportToJSON, exportToMarkdown, copyToClipboard, importFromJSON } from '../utils/export-utils';
import { 
  ArrowDownTrayIcon, 
  ClipboardDocumentIcon, 
  ArrowUpTrayIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface ExportControlsProps {
  strategies: GoToMarketStrategies;
  onImport?: (strategies: GoToMarketStrategies) => void;
  className?: string;
}

export const ExportControls: React.FC<ExportControlsProps> = ({
  strategies,
  onImport,
  className = ''
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'copied'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    exportToJSON(strategies);
    setShowDropdown(false);
  };

  const handleExportMarkdown = () => {
    exportToMarkdown(strategies);
    setShowDropdown(false);
  };

  const handleCopyJSON = async () => {
    setCopyStatus('copying');
    try {
      await copyToClipboard(strategies, 'json');
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      setCopyStatus('idle');
    }
    setShowDropdown(false);
  };

  const handleCopyMarkdown = async () => {
    setCopyStatus('copying');
    try {
      await copyToClipboard(strategies, 'markdown');
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      setCopyStatus('idle');
    }
    setShowDropdown(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
    setShowDropdown(false);
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = importFromJSON(text);
      onImport?.(imported);
    } catch (error) {
      console.error('Failed to import file:', error);
      alert('Failed to import strategies. Please check the file format.');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center space-x-2">
        {/* Copy Button with Status */}
        <button
          onClick={handleCopyJSON}
          disabled={copyStatus === 'copying'}
          className={`flex items-center px-3 py-1 text-xs rounded-md border transition-all duration-200 ${
            copyStatus === 'copied'
              ? 'bg-green-100 text-green-700 border-green-200'
              : copyStatus === 'copying'
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          {copyStatus === 'copied' ? (
            <CheckIcon className="w-3 h-3 mr-1" />
          ) : (
            <ClipboardDocumentIcon className="w-3 h-3 mr-1" />
          )}
          {copyStatus === 'copied' ? 'Copied!' : copyStatus === 'copying' ? 'Copying...' : 'Copy'}
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center px-3 py-1 text-xs text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50"
          >
            <ArrowDownTrayIcon className="w-3 h-3 mr-1" />
            Export
          </button>

          {showDropdown && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowDropdown(false)}
              />
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                <div className="py-1">
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
                    Download
                  </div>
                  
                  <button
                    onClick={handleExportJSON}
                    className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <ArrowDownTrayIcon className="w-3 h-3 mr-2" />
                    Download as JSON
                  </button>
                  
                  <button
                    onClick={handleExportMarkdown}
                    className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <ArrowDownTrayIcon className="w-3 h-3 mr-2" />
                    Download as Markdown
                  </button>

                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <div className="px-3 py-2 text-xs font-medium text-gray-500">
                      Copy to Clipboard
                    </div>
                    
                    <button
                      onClick={handleCopyJSON}
                      className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <ClipboardDocumentIcon className="w-3 h-3 mr-2" />
                      Copy as JSON
                    </button>
                    
                    <button
                      onClick={handleCopyMarkdown}
                      className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <ClipboardDocumentIcon className="w-3 h-3 mr-2" />
                      Copy as Markdown
                    </button>
                  </div>

                  {onImport && (
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleImportClick}
                        className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <ArrowUpTrayIcon className="w-3 h-3 mr-2" />
                        Import from JSON
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileImport}
        className="hidden"
      />
    </div>
  );
};