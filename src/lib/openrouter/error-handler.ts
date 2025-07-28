import { debugLogger } from '@/lib/debug/logger';

export interface ApiErrorInfo {
  isRateLimit: boolean;
  isAuthError: boolean;
  isNetworkError: boolean;
  statusCode?: number;
  message: string;
  suggestedAction: string;
}

export function analyzeApiError(error: any): ApiErrorInfo {
  const errorMessage = error?.message || error?.toString() || '';
  const statusCode = extractStatusCode(errorMessage);
  
  debugLogger.info('api', 'Analyzing API error', {
    errorMessage,
    statusCode,
    errorType: typeof error
  });

  // Check for rate limiting (429 errors)
  if (statusCode === 429 || errorMessage.includes('rate-limited') || errorMessage.includes('429')) {
    return {
      isRateLimit: true,
      isAuthError: false,
      isNetworkError: false,
      statusCode: 429,
      message: 'The selected model is temporarily rate-limited by the provider.',
      suggestedAction: 'Please wait a few minutes and try again, or select a different model.'
    };
  }

  // Check for authentication errors (401, 403)
  if (statusCode === 401 || statusCode === 403 || errorMessage.includes('Unauthorized') || errorMessage.includes('Invalid API key')) {
    return {
      isRateLimit: false,
      isAuthError: true,
      isNetworkError: false,
      statusCode,
      message: 'Your API key is invalid or has insufficient permissions.',
      suggestedAction: 'Please check your OpenRouter API key and ensure it has the necessary permissions.'
    };
  }

  // Check for network/connection errors
  if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('connection')) {
    return {
      isRateLimit: false,
      isAuthError: false,
      isNetworkError: true,
      statusCode,
      message: 'Network connection error occurred.',
      suggestedAction: 'Please check your internet connection and try again.'
    };
  }

  // Check for server errors (5xx)
  if (statusCode && statusCode >= 500) {
    return {
      isRateLimit: false,
      isAuthError: false,
      isNetworkError: false,
      statusCode,
      message: 'The API service is temporarily unavailable.',
      suggestedAction: 'Please try again in a few minutes.'
    };
  }

  // Generic error
  return {
    isRateLimit: false,
    isAuthError: false,
    isNetworkError: false,
    statusCode,
    message: 'An unexpected error occurred during the API request.',
    suggestedAction: 'Please try again or contact support if the issue persists.'
  };
}

function extractStatusCode(errorMessage: string): number | undefined {
  // Try to extract status code from error message
  const statusMatch = errorMessage.match(/(\d{3})/);
  if (statusMatch) {
    const code = parseInt(statusMatch[1]);
    if (code >= 100 && code < 600) {
      return code;
    }
  }
  return undefined;
}

export function getRetryDelay(attempt: number): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, 16s
  return Math.min(1000 * Math.pow(2, attempt), 16000);
}

export function shouldRetry(error: ApiErrorInfo, attempt: number, maxAttempts: number = 3): boolean {
  if (attempt >= maxAttempts) {
    return false;
  }

  // Retry rate limits and server errors
  return error.isRateLimit || (error.statusCode && error.statusCode >= 500);
}