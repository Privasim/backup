import React, { useRef, useEffect } from 'react';
import { LiveCategory } from '../../../features/tools-registry/types';

interface SegmentedCategoriesProps {
  categories: LiveCategory[];
  active?: string;
  onSelect: (slug?: string) => void;
}

export const SegmentedCategories: React.FC<SegmentedCategoriesProps> = ({
  categories,
  active,
  onSelect,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Deterministic color index 1..8 for category avatar via slug hash
  function colorIndexFor(slug?: string): number {
    const s = slug ?? 'all';
    let hash = 0 >>> 0;
    for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
    return (hash % 8) + 1; // 1..8
  }

  function initials(label: string) {
    const parts = label.trim().split(/\s+/).slice(0, 2);
    return parts.map(p => p[0]?.toUpperCase() ?? '').join('');
  }

  // Scroll active category into view
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const activeElement = activeRef.current;
      
      // Calculate scroll position to center the active element
      const scrollLeft = activeElement.offsetLeft - container.clientWidth / 2 + activeElement.clientWidth / 2;
      
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  }, [active]);

  return (
    <div className="mb-3 overflow-hidden">
      <div className="mx-3 mt-2 mb-1 bg-white dark:bg-gray-800 border border-gray-50 dark:border-gray-700 radius-xl shadow-xs">
        <div
          ref={scrollRef}
          className="hide-scrollbar flex overflow-x-auto gap-1.5 pb-1.5 snap-x snap-mandatory"
          role="tablist"
          aria-label="Categories"
        >
          {/* All category (default) */}
          {(() => {
            const colorIndex = colorIndexFor('all');
            return (
              <button
                ref={!active ? activeRef : undefined}
                role="tab"
                aria-selected={!active}
                tabIndex={!active ? 0 : -1}
                onClick={() => onSelect(undefined)}
                data-color-index={colorIndex}
                className={`snap-start flex flex-col items-center min-w-[96px] px-3 py-2 rounded-lg transition-all bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border focus-ring ${
                  !active ? 'cat-active border-blue-100' : 'border-gray-50 dark:border-gray-700'
                }`}
              >
                <div className={`cat-avatar w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium`}>ALL</div>
                <span className="mt-1 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">All Tools</span>
                <span className="text-xs mt-0.5 text-gray-500 dark:text-gray-400">
                  {categories.reduce((acc, cat) => acc + cat.count, 0)}
                </span>
              </button>
            );
          })()}

          {/* Category buttons */}
          {categories.map((category) => {
            const isActive = active === category.slug;
            const colorIndex = colorIndexFor(category.slug);
            return (
              <button
                key={category.slug}
                ref={isActive ? activeRef : undefined}
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => onSelect(category.slug)}
                data-color-index={colorIndex}
                className={`snap-start flex flex-col items-center min-w-[96px] px-3 py-2 rounded-lg transition-all bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border focus-ring ${
                  isActive ? 'cat-active border-blue-100' : 'border-gray-50 dark:border-gray-700'
                }`}
              >
                <div className={`cat-avatar w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium`}>{initials(category.name)}</div>
                <span className="mt-1 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">{category.name}</span>
                <span className="text-xs mt-0.5 text-gray-500 dark:text-gray-400">{category.count}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
