import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  height?: string | number;
  width?: string | number;
  borderRadius?: string | number;
}

export function SkeletonLoader({
  className = '',
  height = '1rem',
  width = '100%',
  borderRadius = '0.25rem'
}: SkeletonLoaderProps) {
  return (
    <div 
      className={`animate-pulse bg-gray-200 ${className}`}
      style={{ 
        height, 
        width, 
        borderRadius 
      }}
    />
  );
}

export function CardSkeletonLoader() {
  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-sm border border-gray-100 space-y-4">
      <div className="flex justify-between items-center">
        <SkeletonLoader height="1.5rem" width="60%" />
        <SkeletonLoader height="1.5rem" width="20%" />
      </div>
      <div className="space-y-3">
        <SkeletonLoader height="1rem" />
        <SkeletonLoader height="1rem" width="90%" />
        <SkeletonLoader height="1rem" width="80%" />
      </div>
      <div className="pt-4">
        <SkeletonLoader height="10rem" />
      </div>
      <div className="space-y-2">
        <SkeletonLoader height="1rem" width="70%" />
        <SkeletonLoader height="1rem" width="60%" />
      </div>
    </div>
  );
}
