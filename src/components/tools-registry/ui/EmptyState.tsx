import React from 'react';

interface EmptyStateProps {
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'No tools found matching your criteria',
  actionLabel = 'Clear filters',
  onAction,
}) => {
  return (
    <div
      className="mx-auto max-w-2xl bg-white dark:bg-gray-900 border border-gray-50 dark:border-gray-800 radius-xl shadow-xs py-8 px-5 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="rounded-full bg-gray-50 dark:bg-gray-800 p-3 mb-3 inline-flex">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-8 w-8 text-gray-400 dark:text-gray-500" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-1.5">{message}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Try adjusting your search or filters</p>
      
      {onAction && (
        <button
          onClick={onAction}
          className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-xs text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-400 focus-ring"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
