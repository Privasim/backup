'use client';

import React from 'react';
import { FeedStatus } from '@/lib/rss/types';

interface FeedStatusIndicatorProps {
  status: FeedStatus;
  className?: string;
}

export default function FeedStatusIndicator({ status, className = '' }: FeedStatusIndicatorProps) {
  const getStatusColor = () => {
    switch (status.status) {
      case 'healthy':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'error':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'loading':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (status.status) {
      case 'healthy':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'loading':
        return (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getStatusText = () => {
    switch (status.status) {
      case 'healthy':
        return 'Feed Active';
      case 'error':
        return 'Feed Error';
      case 'loading':
        return 'Loading Feed';
      default:
        return 'Unknown Status';
    }
  };

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className={`feed-status-indicator ${className}`}>
      <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border ${getStatusColor()}`}>
        {getStatusIcon()}
        <div className="flex flex-col">
          <span className="text-sm font-medium">{getStatusText()}</span>
          <div className="flex items-center space-x-3 text-xs">
            <span>
              Last updated: {formatLastUpdated(status.lastUpdated)}
            </span>
            {status.articleCount > 0 && (
              <>
                <span>•</span>
                <span>{status.articleCount} articles</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      {status.status === 'error' && status.lastError && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          <div className="font-medium">Error Details:</div>
          <div className="mt-1">{status.lastError}</div>
        </div>
      )}
    </div>
  );
}