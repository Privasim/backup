import React from 'react';
import { cn } from '@/lib/utils';
import { Category } from './useToolsRegistry';

export interface CategorySidebarProps {
  categories: Category[];
  active?: string;
  onSelect?: (category?: string) => void;
  className?: string;
}

export function CategorySidebar({ 
  categories, 
  active, 
  onSelect, 
  className 
}: CategorySidebarProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <button
        onClick={() => onSelect?.(undefined)}
        className={cn(
          "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors",
          !active 
            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" 
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        )}
      >
        All Categories
      </button>
      
      {categories.map((category) => (
        <button
          key={category.slug}
          onClick={() => onSelect?.(category.slug)}
          className={cn(
            "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors",
            active === category.slug 
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" 
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          )}
        >
          {category.name} ({category.count})
        </button>
      ))}
    </div>
  );
}
