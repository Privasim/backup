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
    <div className="bg-white shadow-sm">
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto py-2 px-4 gap-2 hide-scrollbar snap-x snap-mandatory"
        role="tablist"
        aria-label="Categories"
      >
        {/* All category (default) */}
        <button
          ref={!active ? activeRef : undefined}
          role="tab"
          aria-selected={!active}
          onClick={() => onSelect(undefined)}
          className={`snap-start flex flex-col items-center min-w-[80px] px-3 py-2 rounded-xl transition-all
            ${!active 
              ? 'bg-blue-100 text-blue-700 font-medium' 
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
        >
          <span className="text-sm whitespace-nowrap">All Tools</span>
          <span className="text-xs mt-1 text-gray-500">
            {categories.reduce((acc, cat) => acc + cat.count, 0)}
          </span>
        </button>
        
        {/* Category buttons */}
        {categories.map((category) => (
          <button
            key={category.slug}
            ref={active === category.slug ? activeRef : undefined}
            role="tab"
            aria-selected={active === category.slug}
            onClick={() => onSelect(category.slug)}
            className={`snap-start flex flex-col items-center min-w-[80px] px-3 py-2 rounded-xl transition-all
              ${active === category.slug 
                ? 'bg-blue-100 text-blue-700 font-medium' 
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
          >
            <span className="text-sm whitespace-nowrap">{category.name}</span>
            <span className="text-xs mt-1 text-gray-500">
              {category.count}
            </span>
          </button>
        ))}
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
