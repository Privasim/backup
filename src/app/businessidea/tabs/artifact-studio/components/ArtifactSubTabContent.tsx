'use client';

import React from 'react';
import { useArtifactSubTab } from '../context/ArtifactSubTabContext';
import { CodePanel } from './CodePanel';
import { ArtifactSandbox } from './ArtifactSandbox';
import { SandboxFrame } from './SandboxFrame';
import { FEATURE_FLAGS } from '@/config/feature-flags';
import { WireframeInteractivityResult } from '../utils/sandbox-html';
import { ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ArtifactSubTabContentProps {
  code: string;
  compile: { ok: boolean; errors: string[] };
  processedJs: string;
  codeValidation?: { valid: boolean; errors: string[] };
  onRuntimeError?: (error: { message: string; stack?: string }) => void;
  onSandboxReady?: () => void;
  runtimeErrors?: string[];
  interactivity?: WireframeInteractivityResult;
  retryCount?: number;
  cacheHit?: boolean;
  status?: string;
  onRegenerate?: () => Promise<void>;
}

export function ArtifactSubTabContent({
  code,
  compile,
  processedJs,
  codeValidation = { valid: true, errors: [] },
  onRuntimeError,
  onSandboxReady,
  runtimeErrors = [],
  interactivity,
  retryCount = 0,
  cacheHit = false,
  status,
  onRegenerate
}: ArtifactSubTabContentProps) {
  const { activeSubTab } = useArtifactSubTab();

  return (
    <div className="flex-1 min-h-0 bg-white">
      {activeSubTab === 'code' && (
        <div className="h-full p-2 md:p-3 flex flex-col min-h-0">
          <CodePanel code={code} compile={compile} />
        </div>
      )}

      {activeSubTab === 'preview' && (
        <div className="h-full p-2 md:p-3 flex flex-col min-h-0 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Live Preview</h3>
            <div className="flex items-center space-x-2">
              {status === 'validating' && (
                <div className="text-xs text-blue-600 flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span>Validating...</span>
                </div>
              )}
              {status === 'retrying' && (
                <div className="text-xs text-orange-600 flex items-center space-x-1">
                  <ArrowPathIcon className="w-3 h-3 animate-spin" />
                  <span>Retrying...</span>
                </div>
              )}
              {compile.ok && status === 'compiled' && (
                <div className="text-xs text-green-600 flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Ready</span>
                </div>
              )}
            </div>
          </div>

          {/* Interactivity Status Panel */}
          {interactivity && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">Wireframe Analysis</h4>
                {cacheHit && (
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    From Cache
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-500">Interactivity Level:</span>
                  <div className={`mt-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    interactivity.level === 'interactive' ? 'bg-green-100 text-green-800' :
                    interactivity.level === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {interactivity.level} ({interactivity.score}%)
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-500">Features:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {interactivity.hasHooks && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">Hooks</span>
                    )}
                    {interactivity.hasEventHandlers && (
                      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">Events</span>
                    )}
                    {interactivity.hasControlledInputs && (
                      <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs">Inputs</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Missing Patterns */}
              {interactivity.missingPatterns.length > 0 && (
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex items-start space-x-2">
                    <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h5 className="text-xs font-medium text-gray-700 mb-1">Missing Patterns:</h5>
                      <ul className="text-xs text-gray-600 space-y-0.5">
                        {interactivity.missingPatterns.map((pattern, index) => (
                          <li key={index} className="flex items-start space-x-1">
                            <span className="text-gray-400">•</span>
                            <span>{pattern}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {interactivity.suggestions.length > 0 && interactivity.level !== 'interactive' && (
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex items-start justify-between mb-1">
                    <h5 className="text-xs font-medium text-gray-700">Suggestions:</h5>
                    {onRegenerate && interactivity.level !== 'interactive' && (
                      <button
                        onClick={onRegenerate}
                        disabled={status === 'generating' || status === 'streaming' || status === 'retrying'}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowPathIcon className="w-3 h-3 mr-1" />
                        Regenerate
                      </button>
                    )}
                  </div>
                  <ul className="text-xs text-gray-600 space-y-0.5">
                    {interactivity.suggestions.slice(0, 3).map((suggestion, index) => (
                      <li key={index} className="flex items-start space-x-1">
                        <span className="text-blue-400">→</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {FEATURE_FLAGS.USE_PATH_A_SANDBOX ? (
            <SandboxFrame
              code={processedJs}
              className="w-full h-full border border-gray-200 rounded-lg"
              onRuntimeError={onRuntimeError}
              onReady={onSandboxReady}
            />
          ) : (
            <ArtifactSandbox
              js={processedJs}
              className="w-full h-full border border-gray-200 rounded-lg"
              height="100%"
              onRuntimeError={onRuntimeError}
              onReady={onSandboxReady}
            />
          )}

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