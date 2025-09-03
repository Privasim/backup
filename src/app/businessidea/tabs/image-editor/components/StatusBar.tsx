'use client';

import React from 'react';
import { XCircleIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface StatusBarProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  } | null;
  onCancel: () => void;
}

export default function StatusBar({
  status,
  error,
  usage,
  onCancel
}: StatusBarProps) {
  if (status === 'idle' && !error && !usage) {
    return null;
  }

  return (
    <div className="mt-4 border rounded-md overflow-hidden">
      {/* Status indicator */}
      {status === 'loading' && (
        <div className="bg-blue-50 p-3 flex items-center justify-between">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-xs font-medium text-blue-700">Processing...</span>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 p-3">
          <div className="flex">
            <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            <div className="ml-3">
              <h3 className="text-xs font-medium text-red-800">Error</h3>
              <p className="text-xs text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success message */}
      {status === 'success' && !error && (
        <div className="bg-green-50 p-3">
          <div className="flex">
            <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
            <div className="ml-3">
              <h3 className="text-xs font-medium text-green-800">Operation completed successfully</h3>
            </div>
          </div>
        </div>
      )}

      {/* Usage information */}
      {usage && (
        <div className="bg-gray-50 p-3 border-t">
          <div className="flex">
            <InformationCircleIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            <div className="ml-3">
              <h3 className="text-xs font-medium text-gray-800">Usage</h3>
              <div className="mt-1 text-xs text-gray-600 grid grid-cols-3 gap-2">
                <div>Prompt: {usage.prompt_tokens}</div>
                <div>Completion: {usage.completion_tokens}</div>
                <div>Total: {usage.total_tokens}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
