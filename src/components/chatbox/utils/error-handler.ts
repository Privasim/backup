/**
 * Comprehensive error handling utility for chatbox analysis
 */

export enum ErrorCategory {
  NETWORK = 'network',
  API_KEY = 'api_key',
  RATE_LIMIT = 'rate_limit',
  VALIDATION = 'validation',
  SYSTEM = 'system',
  TIMEOUT = 'timeout',
  QUOTA = 'quota',
  MODEL = 'model'
}

export interface ErrorContext {
  component: string;
  action: string;
  timestamp: string;
  userAgent?: string;
  url?: string;
  config?: any;
  profileData?: any;
  additionalInfo?: Record<string, any>;
}

export interface UserFriendlyError {
  category: ErrorCategory;
  title: string;
  message: string;
  actionable: boolean;
  retryable: boolean;
  suggestedAction?: string;
  technicalDetails?: string;
}

export interface RetryOptions {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryableErrors: ErrorCategory[];
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2,
  retryableErrors: [ErrorCategory.NETWORK, ErrorCategory.RATE_LIMIT, ErrorCategory.TIMEOUT]
};

/**
 * Error message mappings for user-friendly display
 */
const ERROR_MAPPINGS: Record<string, UserFriendlyError> = {
  // API Key errors
  'api key': {
    category: ErrorCategory.API_KEY,
    title: 'Invalid API Key',
    message: 'Your OpenRouter API key appears to be invalid or expired.',
    actionable: true,
    retryable: false,
    suggestedAction: 'Please check your API key in the settings and try again.'
  },
  'unauthorized': {
    category: ErrorCategory.API_KEY,
    title: 'Authentication Failed',
    message: 'Unable to authenticate with the AI service.',
    actionable: true,
    retryable: false,
    suggestedAction: 'Verify your API key is correct and has the necessary permissions.'
  },
  
  // Network errors
  'network error': {
    category: ErrorCategory.NETWORK,
    title: 'Connection Problem',
    message: 'Unable to connect to the AI service. Please check your internet connection.',
    actionable: true,
    retryable: true,
    suggestedAction: 'Check your internet connection and try again.'
  },
  'fetch': {
    category: ErrorCategory.NETWORK,
    title: 'Network Request Failed',
    message: 'The request to the AI service failed. This might be a temporary issue.',
    actionable: true,
    retryable: true,
    suggestedAction: 'Please try again in a moment.'
  },
  
  // Rate limiting
  'rate limit': {
    category: ErrorCategory.RATE_LIMIT,
    title: 'Too Many Requests',
    message: 'You have exceeded the rate limit for the AI service.',
    actionable: true,
    retryable: true,
    suggestedAction: 'Please wait a moment before trying again.'
  },
  '429': {
    category: ErrorCategory.RATE_LIMIT,
    title: 'Rate Limited',
    message: 'Too many requests sent to the AI service. Please slow down.',
    actionable: true,
    retryable: true,
    suggestedAction: 'Wait a few seconds and try again.'
  },
  
  // Quota errors
  'quota': {
    category: ErrorCategory.QUOTA,
    title: 'Usage Quota Exceeded',
    message: 'Your API usage quota has been exceeded.',
    actionable: true,
    retryable: false,
    suggestedAction: 'Check your OpenRouter account balance or upgrade your plan.'
  },
  'insufficient funds': {
    category: ErrorCategory.QUOTA,
    title: 'Insufficient Credits',
    message: 'Your OpenRouter account has insufficient credits for this request.',
    actionable: true,
    retryable: false,
    suggestedAction: 'Add credits to your OpenRouter account and try again.'
  },
  
  // Model errors
  'model not found': {
    category: ErrorCategory.MODEL,
    title: 'Model Unavailable',
    message: 'The selected AI model is currently unavailable.',
    actionable: true,
    retryable: false,
    suggestedAction: 'Try selecting a different model from the dropdown.'
  },
  'model overloaded': {
    category: ErrorCategory.MODEL,
    title: 'Model Overloaded',
    message: 'The AI model is currently overloaded with requests.',
    actionable: true,
    retryable: true,
    suggestedAction: 'Please try again in a few moments or select a different model.'
  },
  
  // Timeout errors
  'timeout': {
    category: ErrorCategory.TIMEOUT,
    title: 'Request Timeout',
    message: 'The AI service took too long to respond.',
    actionable: true,
    retryable: true,
    suggestedAction: 'The service might be busy. Please try again.'
  },
  
  // Validation errors
  'validation': {
    category: ErrorCategory.VALIDATION,
    title: 'Invalid Input',
    message: 'The provided data is invalid or incomplete.',
    actionable: true,
    retryable: false,
    suggestedAction: 'Please check your profile data and configuration.'
  },
  
  // System errors
  'system': {
    category: ErrorCategory.SYSTEM,
    title: 'System Error',
    message: 'An unexpected system error occurred.',
    actionable: false,
    retryable: true,
    suggestedAction: 'Please try again. If the problem persists, contact support.'
  }
};

/**
 * Main error handler class
 */
export class ChatboxErrorHandler {
  private errorLog: Array<{ error: Error; context: ErrorContext; timestamp: string }> = [];
  private maxLogSize = 100;

  /**
   * Categorize an error based on its message and properties
   */
  categorizeError(error: Error | any): ErrorCategory {
    const errorMessage = error?.message?.toLowerCase() || '';
    const errorCode = error?.status || error?.code;

    // Check for specific error patterns
    if (errorMessage.includes('api key') || errorMessage.includes('unauthorized') || errorCode === 401) {
      return ErrorCategory.API_KEY;
    }
    
    if (errorMessage.includes('rate limit') || errorCode === 429) {
      return ErrorCategory.RATE_LIMIT;
    }
    
    if (errorMessage.includes('quota') || errorMessage.includes('insufficient funds') || errorCode === 402) {
      return ErrorCategory.QUOTA;
    }
    
    if (errorMessage.includes('model') && (errorMessage.includes('not found') || errorMessage.includes('unavailable'))) {
      return ErrorCategory.MODEL;
    }
    
    if (errorMessage.includes('timeout') || errorCode === 408) {
      return ErrorCategory.TIMEOUT;
    }
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch') || !navigator.onLine) {
      return ErrorCategory.NETWORK;
    }
    
    if (errorMessage.includes('validation') || errorCode === 400) {
      return ErrorCategory.VALIDATION;
    }
    
    return ErrorCategory.SYSTEM;
  }

  /**
   * Convert technical error to user-friendly error
   */
  handleAnalysisError(error: Error | any, context: ErrorContext): UserFriendlyError {
    const category = this.categorizeError(error);
    const errorMessage = error?.message?.toLowerCase() || '';
    
    // Log the error
    this.logError(error, context);
    
    // Find matching error mapping
    let userError: UserFriendlyError | undefined;
    
    for (const [key, mapping] of Object.entries(ERROR_MAPPINGS)) {
      if (errorMessage.includes(key) || category === mapping.category) {
        userError = mapping;
        break;
      }
    }
    
    // Fallback to generic error
    if (!userError) {
      userError = {
        category,
        title: 'Analysis Failed',
        message: 'The analysis could not be completed due to an unexpected error.',
        actionable: true,
        retryable: true,
        suggestedAction: 'Please try again. If the problem persists, check your settings.'
      };
    }
    
    // Add technical details for debugging
    return {
      ...userError,
      technicalDetails: error?.message || 'Unknown error'
    };
  }

  /**
   * Retry an operation with exponential backoff
   */
  async retryWithBackoff<T>(
    operation: () => Promise<T>,
    options: Partial<RetryOptions> = {}
  ): Promise<T> {
    const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
    let lastError: Error;
    
    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        const result = await operation();
        
        // Log successful retry if it wasn't the first attempt
        if (attempt > 1) {
          console.info(`Operation succeeded on attempt ${attempt}`);
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        
        const errorCategory = this.categorizeError(error);
        
        // Check if error is retryable
        if (!config.retryableErrors.includes(errorCategory)) {
          console.warn(`Non-retryable error (${errorCategory}):`, error);
          throw error;
        }
        
        // Don't retry on last attempt
        if (attempt === config.maxAttempts) {
          console.error(`Operation failed after ${config.maxAttempts} attempts:`, error);
          throw error;
        }
        
        // Calculate delay with exponential backoff
        const delay = Math.min(
          config.baseDelay * Math.pow(config.backoffFactor, attempt - 1),
          config.maxDelay
        );
        
        console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms:`, error);
        
        // Call retry callback if provided
        if (config.onRetry) {
          config.onRetry(attempt, error as Error);
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  /**
   * Log error with context for debugging
   */
  logError(error: Error | any, context: ErrorContext): void {
    const logEntry = {
      error,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined
      },
      timestamp: new Date().toISOString()
    };
    
    // Add to error log
    this.errorLog.push(logEntry);
    
    // Maintain log size limit
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }
    
    // Console logging with appropriate level
    const category = this.categorizeError(error);
    const logMessage = `[${category.toUpperCase()}] ${context.component}.${context.action}:`;
    
    switch (category) {
      case ErrorCategory.SYSTEM:
        console.error(logMessage, error, context);
        break;
      case ErrorCategory.NETWORK:
      case ErrorCategory.TIMEOUT:
        console.warn(logMessage, error.message);
        break;
      default:
        console.info(logMessage, error.message);
    }
  }

  /**
   * Get recent errors for debugging
   */
  getRecentErrors(limit = 10): Array<{ error: Error; context: ErrorContext; timestamp: string }> {
    return this.errorLog.slice(-limit);
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Export error log for debugging
   */
  exportErrorLog(): string {
    return JSON.stringify(this.errorLog, null, 2);
  }
}

// Global error handler instance
export const errorHandler = new ChatboxErrorHandler();

/**
 * Convenience function for handling analysis errors
 */
export const handleAnalysisError = (error: Error | any, context: Partial<ErrorContext>): UserFriendlyError => {
  const fullContext: ErrorContext = {
    component: 'ChatboxAnalysis',
    action: 'unknown',
    timestamp: new Date().toISOString(),
    ...context
  };
  
  return errorHandler.handleAnalysisError(error, fullContext);
};

/**
 * Convenience function for retrying operations
 */
export const retryOperation = <T>(
  operation: () => Promise<T>,
  options?: Partial<RetryOptions>
): Promise<T> => {
  return errorHandler.retryWithBackoff(operation, options);
};

/**
 * Create error handler for specific component
 */
export const createComponentErrorHandler = (componentName: string) => {
  return {
    handleError: (error: Error | any, action: string, additionalContext?: any) => {
      return handleAnalysisError(error, {
        component: componentName,
        action,
        additionalInfo: additionalContext
      });
    },
    
    retryOperation: <T>(operation: () => Promise<T>, options?: Partial<RetryOptions>) => {
      return retryOperation(operation, {
        ...options,
        onRetry: (attempt, error) => {
          console.debug(`${componentName}: Retry attempt ${attempt}`, error.message);
          options?.onRetry?.(attempt, error);
        }
      });
    }
  };
};

/**
 * Business suggestion specific error handler
 */
export const businessSuggestionErrorHandler = createComponentErrorHandler('BusinessSuggestion');

/**
 * Handle business suggestion generation errors with specific messaging
 */
export const handleBusinessSuggestionError = (error: Error | any): UserFriendlyError => {
  const baseError = businessSuggestionErrorHandler.handleError(error, 'generateSuggestions');
  
  // Customize messages for business suggestion context
  switch (baseError.category) {
    case ErrorCategory.API_KEY:
      return {
        ...baseError,
        message: 'Unable to generate business suggestions due to API key issues.',
        suggestedAction: 'Please check your OpenRouter API key in the chatbox settings.'
      };
      
    case ErrorCategory.RATE_LIMIT:
      return {
        ...baseError,
        message: 'Too many business suggestion requests. Please wait before generating more.',
        suggestedAction: 'Wait a few minutes before requesting new business suggestions.'
      };
      
    case ErrorCategory.QUOTA:
      return {
        ...baseError,
        message: 'Cannot generate business suggestions due to quota limits.',
        suggestedAction: 'Check your OpenRouter account balance or upgrade your plan.'
      };
      
    case ErrorCategory.MODEL:
      return {
        ...baseError,
        message: 'The selected AI model cannot generate business suggestions right now.',
        suggestedAction: 'Try selecting a different model or wait a moment and try again.'
      };
      
    default:
      return {
        ...baseError,
        message: 'Failed to generate business suggestions. This might be a temporary issue.',
        suggestedAction: 'Please try again. If the problem persists, check your analysis results and settings.'
      };
  }
};

export default errorHandler;