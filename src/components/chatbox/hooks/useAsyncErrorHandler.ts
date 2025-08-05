import { useCallback, useState } from 'react';
import { handleAsyncOperation, ErrorDetails, ErrorLogger } from '../utils/error-handler';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: ErrorDetails | null;
}

interface AsyncHandlerOptions {
  retries?: number;
  delay?: number;
  fallback?: any;
  onError?: (error: ErrorDetails) => void;
  onSuccess?: (data: any) => void;
  componentName?: string;
}

/**
 * Hook for handling async operations with comprehensive error handling
 */
export function useAsyncErrorHandler<T = any>() {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null
  });

  /**
   * Execute an async operation with error handling
   */
  const execute = useCallback(async (
    operation: () => Promise<T>,
    options: AsyncHandlerOptions = {}
  ): Promise<T | null> => {
    const {
      retries = 0,
      delay = 1000,
      fallback,
      onError,
      onSuccess,
      componentName = 'useAsyncErrorHandler'
    } = options;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await handleAsyncOperation(operation, {
        retries,
        delay,
        fallback,
        context: { component: componentName }
      });

      setState({ data: result, loading: false, error: null });
      onSuccess?.(result);
      return result;
    } catch (error) {
      const errorDetails = error as ErrorDetails;
      setState({ data: fallback ?? null, loading: false, error: errorDetails });
      
      // Log error
      ErrorLogger.log(error, { component: componentName });
      
      // Call custom error handler
      onError?.(errorDetails);
      
      return fallback ?? null;
    }
  }, []);

  /**
   * Reset the async state
   */
  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  /**
   * Clear only the error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    clearError
  };
}

/**
 * Hook for handling multiple async operations with error handling
 */
export function useAsyncOperations() {
  const [operations, setOperations] = useState<Map<string, AsyncState<any>>>(new Map());

  const executeOperation = useCallback(async <T>(
    key: string,
    operation: () => Promise<T>,
    options: AsyncHandlerOptions = {}
  ): Promise<T | null> => {
    const {
      retries = 0,
      delay = 1000,
      fallback,
      onError,
      onSuccess,
      componentName = 'useAsyncOperations'
    } = options;

    setOperations(prev => new Map(prev.set(key, { data: null, loading: true, error: null })));

    try {
      const result = await handleAsyncOperation(operation, {
        retries,
        delay,
        fallback,
        context: { component: componentName }
      });

      setOperations(prev => new Map(prev.set(key, { data: result, loading: false, error: null })));
      onSuccess?.(result);
      return result;
    } catch (error) {
      const errorDetails = error as ErrorDetails;
      setOperations(prev => new Map(prev.set(key, { data: fallback ?? null, loading: false, error: errorDetails })));
      
      ErrorLogger.log(error, { component: componentName });
      onError?.(errorDetails);
      
      return fallback ?? null;
    }
  }, []);

  const getOperationState = useCallback((key: string): AsyncState<any> | undefined => {
    return operations.get(key);
  }, [operations]);

  const resetOperation = useCallback((key: string) => {
    setOperations(prev => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });
  }, []);

  const resetAllOperations = useCallback(() => {
    setOperations(new Map());
  }, []);

  return {
    operations,
    executeOperation,
    getOperationState,
    resetOperation,
    resetAllOperations
  };
}

/**
 * Higher-order function to wrap async functions with error handling
 */
export function withAsyncErrorHandler<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: AsyncHandlerOptions = {}
) {
  return async (...args: Parameters<T>): Promise<ReturnType<T> | null> => {
    try {
      return await handleAsyncOperation(() => fn(...args), options);
    } catch (error) {
      console.error(`Error in ${fn.name}:`, error);
      return null;
    }
  };
}

/**
 * Error boundary for async operations in React components
 */
export function useAsyncErrorBoundary() {
  const [error, setError] = useState<ErrorDetails | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);

  const handleError = useCallback((error: Error | any, context?: string) => {
    const errorDetails = error as ErrorDetails;
    setError(errorDetails);
    ErrorLogger.log(error, { component: context || 'useAsyncErrorBoundary' });
  }, []);

  const recover = useCallback(async (recoveryFn?: () => Promise<void>) => {
    setIsRecovering(true);
    try {
      if (recoveryFn) {
        await recoveryFn();
      }
      setError(null);
    } catch (recoveryError) {
      handleError(recoveryError, 'recovery');
    } finally {
      setIsRecovering(false);
    }
  }, [handleError]);

  const reset = useCallback(() => {
    setError(null);
    setIsRecovering(false);
  }, []);

  return {
    error,
    isRecovering,
    handleError,
    recover,
    reset
  };
}
