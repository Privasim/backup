/**
 * Enhanced error handling utilities for chatbox components
 */

export interface ErrorContext {
  component: string;
  action: string;
  timestamp: string;
  userAgent?: string;
  url?: string;
}

export interface ErrorDetails {
  message: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
  context: ErrorContext;
  originalError?: Error;
}

export class ChatboxError extends Error {
  public readonly category: string;
  public readonly severity: 'low' | 'medium' | 'high' | 'critical';
  public readonly recoverable: boolean;
  public readonly context: ErrorContext;
  public readonly timestamp: string;

  constructor(
    message: string,
    category: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    recoverable: boolean = true,
    context?: Partial<ErrorContext>
  ) {
    super(message);
    this.name = 'ChatboxError';
    this.category = category;
    this.severity = severity;
    this.recoverable = recoverable;
    this.timestamp = new Date().toISOString();
    this.context = {
      component: context?.component || 'unknown',
      action: context?.action || 'unknown',
      timestamp: this.timestamp,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      ...context
    };
  }
}

/**
 * Error categorization utility
 */
export function categorizeError(error: Error | any): ErrorDetails {
  const message = error?.message || String(error);
  
  // Network-related errors
  if (message.includes('network') || message.includes('fetch') || message.includes('ECONN')) {
    return {
      message,
      category: 'network',
      severity: 'medium',
      recoverable: true,
      context: {
        component: 'network',
        action: 'api-request',
        timestamp: new Date().toISOString()
      },
      originalError: error instanceof Error ? error : undefined
    };
  }
  
  // Authentication errors
  if (message.includes('API key') || message.includes('authentication') || message.includes('401')) {
    return {
      message,
      category: 'authentication',
      severity: 'high',
      recoverable: true,
      context: {
        component: 'authentication',
        action: 'api-authentication',
        timestamp: new Date().toISOString()
      },
      originalError: error instanceof Error ? error : undefined
    };
  }
  
  // Rate limiting errors
  if (message.includes('rate limit') || message.includes('429')) {
    return {
      message,
      category: 'rate-limit',
      severity: 'medium',
      recoverable: true,
      context: {
        component: 'api',
        action: 'rate-limited',
        timestamp: new Date().toISOString()
      },
      originalError: error instanceof Error ? error : undefined
    };
  }
  
  // Timeout errors
  if (message.includes('timeout') || message.includes('TIMEOUT')) {
    return {
      message,
      category: 'timeout',
      severity: 'medium',
      recoverable: true,
      context: {
        component: 'api',
        action: 'request-timeout',
        timestamp: new Date().toISOString()
      },
      originalError: error instanceof Error ? error : undefined
    };
  }
  
  // Storage errors
  if (message.includes('storage') || message.includes('localStorage') || message.includes('quota')) {
    return {
      message,
      category: 'storage',
      severity: 'high',
      recoverable: false,
      context: {
        component: 'storage',
        action: 'storage-operation',
        timestamp: new Date().toISOString()
      },
      originalError: error instanceof Error ? error : undefined
    };
  }
  
  // Configuration errors
  if (message.includes('configuration') || message.includes('model') || message.includes('provider')) {
    return {
      message,
      category: 'configuration',
      severity: 'medium',
      recoverable: true,
      context: {
        component: 'configuration',
        action: 'config-validation',
        timestamp: new Date().toISOString()
      },
      originalError: error instanceof Error ? error : undefined
    };
  }
  
  // Default unknown errors
  return {
    message,
    category: 'unknown',
    severity: 'low',
    recoverable: true,
    context: {
      component: 'general',
      action: 'unknown-operation',
      timestamp: new Date().toISOString()
    },
    originalError: error instanceof Error ? error : undefined
  };
}

/**
 * Safe async error handler with retry logic
 */
export async function handleAsyncOperation<T>(
  operation: () => Promise<T>,
  options: {
    retries?: number;
    delay?: number;
    fallback?: T;
    context?: Partial<ErrorContext>;
  } = {}
): Promise<T> {
  const { retries = 0, delay = 1000, fallback, context = {} } = options;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const errorDetails = categorizeError(error);
      
      // Log error for debugging
      console.error(`Async operation failed (attempt ${attempt + 1}/${retries + 1}):`, {
        error: errorDetails,
        context: { ...errorDetails.context, ...context }
      });
      
      // If this is the last attempt, handle final error
      if (attempt === retries) {
        if (fallback !== undefined) {
          return fallback;
        }
        
        // Re-throw as ChatboxError with enhanced context
        throw new ChatboxError(
          errorDetails.message,
          errorDetails.category,
          errorDetails.severity,
          errorDetails.recoverable,
          { ...errorDetails.context, ...context }
        );
      }
      
      // Wait before retry
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
      }
    }
  }
  
  throw new Error('Unexpected error in retry logic');
}

/**
 * Error logging utility
 */
export class ErrorLogger {
  private static errors: ErrorDetails[] = [];
  private static maxErrors = 50;
  
  static log(error: Error | any, context?: Partial<ErrorContext>) {
    const errorDetails = categorizeError(error);
    const enhancedContext = { ...errorDetails.context, ...context };
    
    const logEntry: ErrorDetails = {
      ...errorDetails,
      context: enhancedContext
    };
    
    this.errors.unshift(logEntry);
    
    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Chatbox Error:', logEntry);
    }
  }
  
  static getRecentErrors(limit = 10): ErrorDetails[] {
    return this.errors.slice(0, limit);
  }
  
  static clear() {
    this.errors = [];
  }
  
  static export(): string {
    return JSON.stringify(this.errors, null, 2);
  }
}

/**
 * Error boundary helper for async operations
 */
export function createAsyncErrorHandler(
  componentName: string,
  onError?: (error: ErrorDetails) => void
) {
  return async (operation: () => Promise<void>) => {
    try {
      await operation();
    } catch (error) {
      const errorDetails = categorizeError(error);
      errorDetails.context.component = componentName;
      
      ErrorLogger.log(error, { component: componentName });
      
      if (onError) {
        onError(errorDetails);
      }
    }
  };
}
