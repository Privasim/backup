'use client';

import React from 'react';
import { useArtifactSubTab } from '../context/ArtifactSubTabContext';
import { CodePanel } from './CodePanel';
import { ArtifactSandbox } from './ArtifactSandbox';

interface ArtifactSubTabContentProps {
  code: string;
  compile: { ok: boolean; errors: string[] };
  compiledJs: string;
  onRuntimeError?: (error: { message: string; stack?: string }) => void;
  onSandboxReady?: () => void;
  runtimeErrors?: string[];
}

export function ArtifactSubTabContent({
  code,
  compile,
  compiledJs,
  onRuntimeError,
  onSandboxReady,
  runtimeErrors = []
}: ArtifactSubTabContentProps) {
  const { activeSubTab } = useArtifactSubTab();

  return (
    <div className="flex-1 min-h-0 bg-white">
      {activeSubTab === 'code' && (
        <div className="h-full p-4 overflow-y-auto">
          <CodePanel code={code} compile={compile} />
        </div>
      )}

      {activeSubTab === 'preview' && (
        <div className="h-full p-4 space-y-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Live Preview</h3>
            {compile.ok && (
              <div className="text-xs text-green-600 flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Ready</span>
              </div>
            )}
          </div>
          
          <ArtifactSandbox
            js={compiledJs}
            className="w-full border border-gray-200 rounded-lg"
            height="400px"
            onRuntimeError={onRuntimeError}
            onReady={onSandboxReady}
          />

          {/* Runtime Errors */}
          {runtimeErrors.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-red-700">Runtime Errors</h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
                {runtimeErrors.map((error, index) => (
                  <div key={index} className="text-xs text-red-700 font-mono">
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}