'use client';

import React, { useState } from 'react';
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';

interface CodePanelProps {
  code: string;
  compile: { ok: boolean; errors: string[] };
}

export function CodePanel({ code, compile }: CodePanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (code) {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Generated Code</h3>
        <button
          onClick={handleCopy}
          disabled={!code}
          className={`flex items-center space-x-1 px-2 py-1 text-xs rounded transition-colors ${
            code
              ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          {copied ? (
            <>
              <CheckIcon className="w-3 h-3" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <ClipboardDocumentIcon className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Display */}
      <div className="relative">
        <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs font-mono overflow-auto max-h-64 whitespace-pre-wrap">
          {code || '// Generated code will appear here...'}
        </pre>
      </div>

      {/* Compile Errors */}
      {!compile.ok && compile.errors.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-red-700">Compile Errors</h4>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
            {compile.errors.map((error, index) => (
              <div key={index} className="text-xs text-red-700 font-mono">
                {error}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Indicator */}
      {compile.ok && code && (
        <div className="flex items-center space-x-2 text-sm text-green-700">
          <CheckIcon className="w-4 h-4" />
          <span>Code compiled successfully</span>
        </div>
      )}
    </div>
  );
}
