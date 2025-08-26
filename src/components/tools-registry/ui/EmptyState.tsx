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
      className="mx-auto max-w-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm py-10 px-6 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-4 mb-4 inline-flex">
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
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">{message}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Try adjusting your search or filters</p>
      
      {onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 dark:focus-visible:ring-blue-400"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
