import React from 'react';
import { cn } from '@/lib/utils';
import { Tool } from './useToolsRegistry';

export interface ToolListProps {
  tools: Tool[];
  isLoading: boolean;
  error: Error | null;
  onDiscuss?: (tool: Tool) => void;
  onAddToPlan?: (tool: Tool) => void;
  onRetry?: () => void;
  className?: string;
}

export function ToolList({
  tools,
  isLoading,
  error,
  onDiscuss,
  onAddToPlan,
  onRetry,
  className
}: ToolListProps) {
  if (isLoading) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12", className)}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading tools...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Failed to load tools</h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{error.message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (tools.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No tools found</h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Try adjusting your filters or search query</p>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4", className)}>
      {tools.map((tool) => (
        <div
          key={tool.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{tool.name}</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{tool.description}</p>
            </div>
            <div className="flex-shrink-0">
              <span className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                tool.pricing?.type === 'free' ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" :
                tool.pricing?.type === 'freemium' ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100" :
                tool.pricing?.type === 'paid' ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100" :
                "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
              )}>
                {tool.pricing?.type === 'free' ? 'Free' :
                 tool.pricing?.type === 'freemium' ? 'Freemium' :
                 tool.pricing?.type === 'paid' ? 'Paid' :
                 'Enterprise'}
              </span>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="flex flex-wrap gap-1">
              {tool.capabilities.map((capability) => (
                <span 
                  key={capability}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                >
                  {capability}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mt-4 flex justify-between">
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Visit Website
            </a>
            
            <div className="flex space-x-2">
              {onDiscuss && (
                <button
                  onClick={() => onDiscuss(tool)}
                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-blue-100 dark:bg-blue-900 dark:hover:bg-blue-800 transition-colors"
                >
                  Discuss
                </button>
              )}
              
              {onAddToPlan && (
                <button
                  onClick={() => onAddToPlan(tool)}
                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 dark:text-green-100 dark:bg-green-900 dark:hover:bg-green-800 transition-colors"
                >
                  Add to Plan
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
