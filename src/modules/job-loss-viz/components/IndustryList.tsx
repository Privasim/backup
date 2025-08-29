// File: src/modules/job-loss-viz/components/IndustryList.tsx
'use client';

import { useMemo } from 'react';
import type { IndustryAggregate } from '../types';

interface Props {
  industries: IndustryAggregate[];
  className?: string;
  maxItems?: number;
}

export function IndustryList({ industries, className = '', maxItems = 20 }: Props) {
  const displayIndustries = useMemo(() => {
    // Sort by count and limit to maxItems
    return [...industries]
      .sort((a, b) => b.count - a.count)
      .slice(0, maxItems);
  }, [industries, maxItems]);

  const totalCount = useMemo(() => {
    return industries.reduce((sum, industry) => sum + industry.count, 0);
  }, [industries]);

  if (!industries.length) {
    return (
      <div className={`text-secondary ${className}`}>
        No industry data available
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <h3 className="text-md font-semibold text-primary mb-3">Industry Breakdown</h3>
      
      <div className="grid grid-cols-1 gap-1 text-sm">
        {displayIndustries.map((industry) => {
          const percentage = Math.round((industry.count / totalCount) * 100);
          
          return (
            <div key={industry.industry} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2 min-w-0">
                <div 
                  className="w-2 h-2 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: 'var(--color-hero)' }}
                />
                <span className="font-medium text-primary truncate" title={industry.industry}>
                  {industry.industry}
                </span>
              </div>
              <span className="text-secondary text-xs ml-2 whitespace-nowrap">
                {industry.count.toLocaleString()} ({percentage}%)
              </span>
            </div>
          );
        })}
      </div>
      
      {industries.length > maxItems && (
        <div className="text-xs text-secondary mt-2">
          Showing top {maxItems} of {industries.length} industries
        </div>
      )}
    </div>
  );
}
