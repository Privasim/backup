// File: src/modules/job-loss-viz/components/IndustryList.tsx
'use client';

import { useMemo } from 'react';
import type { IndustryAggregate } from '../types';

interface Props {
  industries: IndustryAggregate[];
  className?: string;
  maxItems?: number;
}

export function IndustryList({ industries, className = '', maxItems = 5 }: Props) {
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
    <div className={`flex flex-col gap-3 ${className}`}>
      <h3 className="text-lg font-semibold text-primary">Industry Breakdown</h3>
      
      <div className="flex flex-col gap-2">
        {displayIndustries.map((industry) => {
          const percentage = Math.round((industry.count / totalCount) * 100);
          
          return (
            <div key={industry.industry} className="flex flex-col">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-primary">{industry.industry}</span>
                <span className="text-sm text-secondary">
                  {industry.count.toLocaleString()} ({percentage}%)
                </span>
              </div>
              
              <div className="h-2 w-full border-default bg-surface rounded-full overflow-hidden">
                <div 
                  className="bg-hero h-full rounded-full" 
                  style={{ width: `${percentage}%` }}
                  role="progressbar"
                  aria-valuenow={percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      {industries.length > maxItems && (
        <div className="text-sm text-secondary mt-1">
          Showing top {maxItems} of {industries.length} industries
        </div>
      )}
    </div>
  );
}
