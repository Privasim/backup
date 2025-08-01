export class ResearchDataError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ResearchDataError';
  }
}

export class DataNotFoundError extends ResearchDataError {
  constructor(resource: string, identifier?: string) {
    const message = identifier 
      ? `${resource} not found: ${identifier}`
      : `${resource} not found`;
    super(message, 'DATA_NOT_FOUND', { resource, identifier });
  }
}

export class ServiceNotInitializedError extends ResearchDataError {
  constructor() {
    super(
      'Research data service not initialized. Call initialize() or loadFromFile() first.',
      'SERVICE_NOT_INITIALIZED'
    );
  }
}

export class InvalidDataError extends ResearchDataError {
  constructor(message: string, validationErrors?: any[]) {
    super(message, 'INVALID_DATA', { validationErrors });
  }
}

export class CacheError extends ResearchDataError {
  constructor(operation: string, cause?: Error) {
    super(
      `Cache operation failed: ${operation}`,
      'CACHE_ERROR',
      { operation, cause: cause?.message }
    );
  }
}

export interface ErrorHandlingConfig {
  enableRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  enableFallback?: boolean;
  logErrors?: boolean;
}

export class ErrorHandler {
  private config: Required<ErrorHandlingConfig>;

  constructor(config: ErrorHandlingConfig = {}) {
    this.config = {
      enableRetry: config.enableRetry ?? true,
      maxRetries: config.maxRetries ?? 3,
      retryDelay: config.retryDelay ?? 1000,
      enableFallback: config.enableFallback ?? true,
      logErrors: config.logErrors ?? true,
    };
  }

  async withRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (this.config.logErrors) {
          console.warn(`${operationName} attempt ${attempt} failed:`, lastError.message);
        }

        if (attempt < this.config.maxRetries && this.shouldRetry(lastError)) {
          await this.delay(this.config.retryDelay * attempt);
          continue;
        }
        
        break;
      }
    }

    if (this.config.logErrors) {
      console.error(`${operationName} failed after ${this.config.maxRetries} attempts:`, lastError!.message);
    }

    throw lastError!;
  }

  async withFallback<T>(
    primaryOperation: () => Promise<T>,
    fallbackOperation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    try {
      return await primaryOperation();
    } catch (error) {
      if (this.config.enableFallback) {
        if (this.config.logErrors) {
          console.warn(`${operationName} primary operation failed, using fallback:`, error);
        }
        return await fallbackOperation();
      }
      throw error;
    }
  }

  handleError(error: unknown, context: string): ResearchDataError {
    if (error instanceof ResearchDataError) {
      return error;
    }

    if (error instanceof Error) {
      return new ResearchDataError(
        `${context}: ${error.message}`,
        'UNKNOWN_ERROR',
        { originalError: error.message, stack: error.stack }
      );
    }

    return new ResearchDataError(
      `${context}: Unknown error occurred`,
      'UNKNOWN_ERROR',
      { originalError: String(error) }
    );
  }

  private shouldRetry(error: Error): boolean {
    // Don't retry for certain error types
    if (error instanceof DataNotFoundError) {
      return false;
    }
    
    if (error instanceof ServiceNotInitializedError) {
      return false;
    }

    if (error instanceof InvalidDataError) {
      return false;
    }

    // Retry for network errors, cache errors, etc.
    return true;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export function createErrorHandler(config?: ErrorHandlingConfig): ErrorHandler {
  return new ErrorHandler(config);
}

// Utility functions for common error scenarios
export function assertInitialized(isInitialized: boolean): void {
  if (!isInitialized) {
    throw new ServiceNotInitializedError();
  }
}

export function assertDataExists<T>(data: T | null | undefined, resource: string, identifier?: string): asserts data is T {
  if (data === null || data === undefined) {
    throw new DataNotFoundError(resource, identifier);
  }
}

export function wrapAsyncOperation<T extends any[], R>(
  operation: (...args: T) => Promise<R>,
  operationName: string,
  errorHandler?: ErrorHandler
): (...args: T) => Promise<R> {
  const handler = errorHandler || createErrorHandler();
  
  return async (...args: T): Promise<R> => {
    try {
      return await operation(...args);
    } catch (error) {
      throw handler.handleError(error, operationName);
    }
  };
}