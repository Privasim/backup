"use client";

import React, { useState } from "react";

type Props = {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  subtitle?: string;
  badge?: string;
  className?: string;
  compact?: boolean;
};

export default function CollapsibleSection({ 
  title, 
  children, 
  defaultExpanded = false, 
  subtitle,
  badge,
  className = "",
  compact = true
}: Props) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`border border-gray-200 rounded-lg bg-white ${className}`}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-3 ${compact ? 'py-2.5' : 'p-4'} text-left hover:bg-gray-50 transition-colors rounded-lg`}
      >
        <div className="flex items-center space-x-3">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className={`font-medium text-gray-800 ${compact ? 'text-sm' : 'text-base'}`}>
                {title}
              </h3>
              {badge && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className={`text-gray-500 ${compact ? 'text-xs mt-0.5' : 'text-sm mt-1'}`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        <svg 
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className={`border-t border-gray-100 ${compact ? 'p-3 pt-2.5' : 'p-4'}`}>
          {children}
        </div>
      )}
    </div>
  );
}