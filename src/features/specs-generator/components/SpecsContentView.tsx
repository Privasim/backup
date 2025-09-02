import React from 'react';
import { SpecsStatus, SpecsGenerationResult } from '../types';

interface SpecsContentViewProps {
  status: SpecsStatus;
  preview?: string;
  result?: SpecsGenerationResult;
  outlinePreview?: string[];
  warnings?: string[];
  profileInfo?: {
    name: string;
    description: string;
    pageTarget: number;
    tokenBudget: number;
  };
  onGenerate: () => void;
  onCancel: () => void;
  onRegenerate: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onOpenInChat: () => void;
  errors?: string[];
}

export function SpecsContentView({
  status,
  preview,
  result,
  outlinePreview = [],
  warnings = [],
  profileInfo,
  onGenerate,
  onCancel,
  onRegenerate,
  onCopy,
  onDownload,
  onOpenInChat,
  errors
}: SpecsContentViewProps) {
  // Render errors if present
  if (errors && errors.length > 0) {
    return (
      <div className="badge-error p-4 mb-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-error-800" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-label text-error-800">Errors</h3>
            <div className="mt-2 text-body text-error-700">
              <ul className="list-disc space-y-1 pl-5">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render content based on status
  switch (status) {
    case 'idle':
      return (
        <div className="space-y-6">
          {/* Profile Information */}
          {profileInfo && (
            <div className="badge-info p-4 mb-4 rounded-md">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-info-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-label text-info-800">{profileInfo.name}</h3>
                  <div className="mt-1 text-body text-info-700">
                    <p>{profileInfo.description}</p>
                    <p className="mt-1">Target: {profileInfo.pageTarget} pages (~{profileInfo.tokenBudget} tokens)</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Outline Preview */}
          <div className="card-base p-4">
            <h3 className="text-title mb-3">Preview Outline</h3>
            {warnings.length > 0 ? (
              <div className="badge-warning p-4 mb-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-warning-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-label text-warning-800">Warnings</h3>
                    <div className="mt-2 text-body text-warning-700">
                      <ul className="list-disc space-y-1 pl-5">
                        {warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
            <div className="font-mono text-sm text-gray-800 whitespace-pre-wrap">
              {outlinePreview.length > 0 ? (
                outlinePreview.map((line, index) => <div key={index}>{line}</div>)
              ) : (
                <div className="text-gray-500 italic">No outline preview available. Generate a specification to see the outline.</div>
              )}
            </div>
          </div>
          
          {/* Generate Button */}
          <div className="text-center py-6">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-label">No specification generated</h3>
            <p className="mt-1 text-body text-muted">
              Get started by generating a technical specification from your implementation plan.
            </p>
            <div className="mt-6">
              <button
                type="button"
                className="btn-primary inline-flex items-center"
                onClick={onGenerate}
              >
                Generate Specification
              </button>
            </div>
          </div>
        </div>
      );
    
    case 'generating':
    case 'streaming':
      return (
        <div className="space-y-4">
          {/* Warnings */}
          {warnings.length > 0 ? (
            <div className="badge-warning p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-warning-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-label text-warning-800">Warnings</h3>
                  <div className="mt-2 text-body text-warning-700">
                    <ul className="list-disc space-y-1 pl-5">
                      {warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          
          <div className="flex justify-between items-center">
            <h3 className="text-title">Generating Specification</h3>
            <button
              type="button"
              className="btn-secondary inline-flex items-center"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
          
          <div className="card-base p-4 min-h-[200px]">
            <div className="text-body font-mono whitespace-pre-wrap">
              {preview || 'Initializing generation...'}
            </div>
            
            <div className="mt-4 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            </div>
          </div>
        </div>
      );
    
    case 'success':
      if (!result) return null;
      
      return (
        <div className="space-y-4">
          {/* Warnings */}
          {warnings.length > 0 ? (
            <div className="badge-warning p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-warning-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-label text-warning-800">Warnings</h3>
                  <div className="mt-2 text-body text-warning-700">
                    <ul className="list-disc space-y-1 pl-5">
                      {warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <h3 className="text-title">Generated Specification</h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-secondary btn-sm inline-flex items-center"
                onClick={onCopy}
              >
                Copy
              </button>
              <button
                type="button"
                className="btn-secondary btn-sm inline-flex items-center"
                onClick={onDownload}
              >
                Download
              </button>
              <button
                type="button"
                className="btn-secondary btn-sm inline-flex items-center"
                onClick={onOpenInChat}
              >
                Open in Chat
              </button>
              <button
                type="button"
                className="btn-secondary btn-sm inline-flex items-center"
                onClick={onRegenerate}
              >
                Regenerate
              </button>
            </div>
          </div>
          
          <div className="card-base p-4">
            <div className="prose dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-sans">{result.markdown}</pre>
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-error-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-label text-error-800">Error generating specification</h3>
                <div className="mt-2 text-body text-error-700">
                  <p>{preview || 'An unknown error occurred during specification generation.'}</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    className="btn-error btn-sm inline-flex items-center"
                    onClick={onRegenerate}
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    
    default:
      return null;
  }
}
