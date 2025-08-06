'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Copy } from 'lucide-react';
import { errorHandler, UserFriendlyError, ErrorCategory } from './utils/error-handler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

/**
 * Error boundary specifically designed for chatbox components
 * Provides recovery strategies and user-friendly error messages
 */
export class ChatboxErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('Chatbox Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Auto-recovery attempt after 5 seconds for certain error types
    if (this.shouldAutoRecover(error)) {
      this.resetTimeoutId = window.setTimeout(() => {
        this.handleReset();
      }, 5000);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    // Reset error state when resetKeys change
    if (hasError && resetOnPropsChange && resetKeys) {
      const prevResetKeys = prevProps.resetKeys || [];
      const hasResetKeyChanged = resetKeys.some((key, index) => 
        key !== prevResetKeys[index]
      );

      if (hasResetKeyChanged) {
        this.handleReset();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private shouldAutoRecover = (error: Error): boolean => {
    // Auto-recover for network errors, temporary API issues, etc.
    const recoverableErrors = [
      'NetworkError',
      'TimeoutError',
      'AbortError',
      'TypeError: Failed to fetch'
    ];

    return recoverableErrors.some(errorType => 
      error.name === errorType || error.message.includes(errorType)
    );
  };

  private handleReset = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  private getErrorDetails = (error: Error): UserFriendlyError => {
    return errorHandler.handleAnalysisError(error, {
      component: 'ChatboxErrorBoundary',
      action: 'componentDidCatch',
      timestamp: new Date().toISOString()
    });
  };

  private getErrorMessage = (error: Error): { title: string; description: string; action: string; retryable: boolean } => {
    const errorDetails = this.getErrorDetails(error);
    
    return {
      title: errorDetails.title,
      description: errorDetails.message,
      action: errorDetails.suggestedAction || 'Try again',
      retryable: errorDetails.retryable
    };
  };

  private copyErrorDetails = () => {
    const { error, errorInfo, errorId } = this.state;
    const errorDetails = {
      errorId,
      timestamp: new Date().toISOString(),
      error: {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      },
      componentStack: errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => {
        // Could show a toast notification here
        console.log('Error details copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy error details:', err);
      });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error } = this.state;
      const errorDetails = error ? this.getErrorMessage(error) : {
        title: 'Unknown Error',
        description: 'An unexpected error occurred.',
        action: 'Try again'
      };

      return (
        <div className="flex items-center justify-center p-8">
          <div className="max-w-md w-full">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-red-900">
                    {errorDetails.title}
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    {errorDetails.description}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm text-red-800 bg-red-100 rounded p-3">
                  <strong>What you can do:</strong> {errorDetails.action}
                </div>

                <div className="flex space-x-3">
                  {errorDetails.retryable && (
                    <button
                      onClick={this.handleReset}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </button>
                  )}

                  <button
                    onClick={this.copyErrorDetails}
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Details
                  </button>
                </div>

                {/* Development error details */}
                {process.env.NODE_ENV === 'development' && error && (
                  <details className="mt-4">
                    <summary className="text-sm text-red-700 cursor-pointer hover:text-red-900">
                      Developer Details
                    </summary>
                    <div className="mt-2 p-3 bg-red-100 rounded text-xs font-mono text-red-800 overflow-auto max-h-32">
                      <div><strong>Error:</strong> {error.message}</div>
                      {error.stack && (
                        <div className="mt-2">
                          <strong>Stack:</strong>
                          <pre className="whitespace-pre-wrap">{error.stack}</pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook version of the error boundary for functional components
 */
export const useChatboxErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    console.error('Chatbox error:', error);
    setError(error);
  }, []);

  // Reset error when component unmounts
  React.useEffect(() => {
    return () => setError(null);
  }, []);

  return {
    error,
    hasError: !!error,
    resetError,
    handleError
  };
};

export default ChatboxErrorBoundary;