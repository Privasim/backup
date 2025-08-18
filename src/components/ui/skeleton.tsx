import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading?: boolean;
  children?: React.ReactNode;
}

export function Skeleton({ 
  isLoading = true, 
  children, 
  className = '', 
  ...props 
}: SkeletonProps) {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div 
      className={`animate-pulse rounded-md bg-gray-200 ${className}`}
      {...props}
    />
  );
}
