import React from 'react';

interface SkeletonListProps {
  count?: number;
  variant: 'grid' | 'list';
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  count = 8,
  variant,
}) => {
  return (
    <div className={variant === 'grid' 
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
      : 'divide-y divide-gray-100 dark:divide-gray-800 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 shadow-sm'
    }>
      {Array.from({ length: count }).map((_, index) => (
        variant === 'grid' 
          ? <SkeletonCard key={index} /> 
          : <SkeletonRow key={index} />
      ))}
    </div>
  );
};

const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden animate-pulse">
      {/* Card header */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="w-16 h-6 rounded-full bg-gray-200 dark:bg-gray-700"></div>
      </div>
      
      {/* Card body */}
      <div className="px-4 pb-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      </div>
      
      {/* Capabilities */}
      <div className="px-4 pb-2 flex gap-1">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-14"></div>
      </div>
      
      {/* Card actions */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex justify-between">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      </div>
    </div>
  );
};

const SkeletonRow: React.FC = () => {
  return (
    <div className="py-3 px-4 animate-pulse">
      <div className="flex items-center gap-3">
        {/* Vendor icon */}
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        
        {/* Tool info */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
          </div>
          
          <div className="flex items-center justify-between mt-1">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            
            {/* Actions */}
            <div className="flex gap-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            </div>
          </div>
          
          {/* Description */}
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mt-1"></div>
          
          {/* Capabilities */}
          <div className="flex gap-1 mt-1.5">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-14"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
