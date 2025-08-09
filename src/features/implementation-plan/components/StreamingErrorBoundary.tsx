"use client";

import React from 'react';

interface StreamingErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface StreamingErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class StreamingErrorBoundary extends React.Component<
  StreamingErrorBoundaryProps,
  StreamingErrorBoundaryState
> {
  constructor(props: StreamingErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): StreamingErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Streaming component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-yellow-600">⚠️</span>
            <span className="text-sm font-medium text-yellow-800">
              Streaming Display Issue
            </span>
          </div>
          <div className="text-sm text-yellow-700">
            The progressive display encountered an error. The plan generation is still working in the background.
          </div>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default StreamingErrorBoundary;