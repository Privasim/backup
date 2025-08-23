'use client';

import { cn } from '@/lib/utils';
import type { LiveCategory } from '@/features/tools-registry/types';

interface CategorySidebarProps {
  categories: LiveCategory[];
  active?: string;
  onSelect: (slug?: string) => void;
  className?: string;
}

export function CategorySidebar({ categories, active, onSelect, className }: CategorySidebarProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="px-3 py-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
          Categories
        </h3>
      </div>
      
      {/* All Categories */}
      <button
        onClick={() => onSelect(undefined)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
          !active
            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        )}
      >
        <span>All Tools</span>
        <span className={cn(
          "text-xs px-2 py-0.5 rounded-full",
          !active
            ? "bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300"
            : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
        )}>
          {categories.reduce((sum, cat) => sum + cat.count, 0)}
        </span>
      </button>

      {/* Individual Categories */}
      {categories.map((category) => (
        <button
          key={category.slug}
          onClick={() => onSelect(category.slug)}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
            active === category.slug
              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          )}
        >
          <span className="truncate">{category.name}</span>
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0",
            active === category.slug
              ? "bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300"
              : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
          )}>
            {category.count}
          </span>
        </button>
      ))}
    </div>
  );
}
