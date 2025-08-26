import React from 'react';

interface ErrorStateProps {
  message?: string;
  actionLabel?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Something went wrong',
  actionLabel = 'Try again',
  onRetry,
}) => {
  return (
    <div
      className="mx-auto max-w-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 radius-2xl shadow-soft py-10 px-6 text-center"
      role="alert"
      aria-live="assertive"
    >
      <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-4 mb-4 inline-flex">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-8 w-8 text-red-500 dark:text-red-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" 
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">{message}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">We couldn't load the tools registry</p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 dark:focus-visible:ring-blue-400 focus-ring"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
