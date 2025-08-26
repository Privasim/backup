import React, { useRef, useEffect, useMemo } from 'react';
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

  // Deterministic pastel color palette for category avatar based on slug hash
  const palette = useMemo(
    () => [
      { bg: 'bg-blue-100', text: 'text-blue-700', ring: 'ring-blue-200' },
      { bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-200' },
      { bg: 'bg-rose-100', text: 'text-rose-700', ring: 'ring-rose-200' },
      { bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-200' },
      { bg: 'bg-purple-100', text: 'text-purple-700', ring: 'ring-purple-200' },
      { bg: 'bg-cyan-100', text: 'text-cyan-700', ring: 'ring-cyan-200' },
      { bg: 'bg-indigo-100', text: 'text-indigo-700', ring: 'ring-indigo-200' },
      { bg: 'bg-pink-100', text: 'text-pink-700', ring: 'ring-pink-200' },
    ],
    []
  );

  function colorFor(slug?: string) {
    if (!slug) return palette[0];
    let hash = 0;
    for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
    return palette[hash % palette.length];
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
    <div className="bg-transparent">
      <div className="mx-4 mt-3 mb-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm">
        <div
          ref={scrollRef}
          className="flex md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 overflow-x-auto md:overflow-visible py-3 px-3 gap-2 md:gap-3 hide-scrollbar snap-x md:snap-none snap-mandatory"
          role="tablist"
          aria-label="Categories"
        >
          {/* All category (default) */}
          {(() => {
            const color = colorFor('all');
            return (
              <button
                ref={!active ? activeRef : undefined}
                role="tab"
                aria-selected={!active}
                onClick={() => onSelect(undefined)}
                className={`snap-start flex flex-col items-center min-w-[96px] px-3 py-2 rounded-lg transition-all bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border ${
                  !active ? 'border-blue-200 ring-2 ring-blue-100' : 'border-gray-100 dark:border-gray-700'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color.bg} ${color.text} ${!active ? color.ring : ''} ring-0`}>ALL</div>
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
            const color = colorFor(category.slug);
            return (
              <button
                key={category.slug}
                ref={isActive ? activeRef : undefined}
                role="tab"
                aria-selected={isActive}
                onClick={() => onSelect(category.slug)}
                className={`snap-start flex flex-col items-center min-w-[96px] px-3 py-2 rounded-lg transition-all bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border ${
                  isActive ? `${color.ring} ring-2 border-blue-200` : 'border-gray-100 dark:border-gray-700'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color.bg} ${color.text}`}>{initials(category.name)}</div>
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

// Add this to your global CSS or as a style tag
const styles = `
  .hide-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;  /* Chrome, Safari, Opera */
  }
`;

// Inject styles if not already in document
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  if (!document.head.querySelector('style#segmented-categories-styles')) {
    styleElement.id = 'segmented-categories-styles';
    document.head.appendChild(styleElement);
  }
}
