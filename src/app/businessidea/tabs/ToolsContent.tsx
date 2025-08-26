'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { cn } from '@/lib/utils';
import { useToolsRegistry } from "../../../components/tools-registry/useToolsRegistry";
import { ToolsProvider } from "../../../components/tools-registry/ToolsProvider";
import { FiltersPanel } from "../../../components/tools-registry/FiltersPanel";
// Removed unused imports: SortMenu, ToolList
// Removed unused import: SortMode

// Import new UI components
import { HeaderBar } from "../../../components/tools-registry/ui/HeaderBar";
import { SegmentedCategories } from "../../../components/tools-registry/ui/SegmentedCategories";
import { FilterBar } from "../../../components/tools-registry/ui/FilterBar";
import { ToolCardCompact } from "../../../components/tools-registry/ui/ToolCardCompact";
import { EmptyState } from "../../../components/tools-registry/ui/EmptyState";
import { ErrorState } from "../../../components/tools-registry/ui/ErrorState";
import { SkeletonList } from "../../../components/tools-registry/ui/SkeletonList";
import { Squares2X2Icon as ViewGridIcon, ListBulletIcon as ViewListIcon } from '@heroicons/react/24/outline';

// Add animation keyframes for fade-in effect
const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }
`;

interface ToolsContentProps {
  className?: string;
}

const ToolsContentInner = memo(function ToolsContentInner({ className }: ToolsContentProps) {
  // Add animation styles to document head using useEffect to avoid repeated DOM operations
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const styleId = 'tools-animation-styles';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.textContent = animationStyles;
        style.id = styleId;
        document.head.appendChild(style);
      }
    }
    
    return () => {
      // Clean up on unmount
      if (typeof document !== 'undefined') {
        const styleEl = document.getElementById('tools-animation-styles');
        if (styleEl) {
          styleEl.remove();
        }
      }
    };
  }, []);

  const {
    isLoading,
    error,
    selectedCategory,
    query,
    sort,
    selectedCapabilities,
    visibleTools,
    liveCategories,
    availableCapabilities,
    setCategory,
    setQuery,
    setSort,
    toggleCapability,
    clearFilters,
    openInChat,
    addToPlan,
    retry,
  } = useToolsRegistry();

  // UI state
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [tempQuery, setTempQuery] = useState(query);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // New state for view mode

  // Memoize callback functions to prevent unnecessary re-renders
  const handleSearch = useCallback(() => {
    setQuery(tempQuery);
    setShowSearch(false);
  }, [tempQuery, setQuery]);

  const toggleSearch = useCallback(() => {
    setShowSearch(prev => !prev);
    setTempQuery(query);
  }, [query]);

  const toggleFilterPanel = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  // Fix TypeScript errors with proper typing
  const totalToolsCount = liveCategories.reduce((sum: number, cat: { count: number }) => sum + cat.count, 0);

  return (
    <div className={cn("flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-gray-950", className)}>
      {/* Header Bar with gradient background */}
      <HeaderBar
        title="Tools & Resources"
        subtitle="Find the right tools for your business"
        query={query}
        onSearchChange={setQuery}
        onOpenFilters={toggleFilterPanel}
        sort={sort}
        onSortChange={setSort}
      />
      
      {/* Segmented Categories */}
      <SegmentedCategories
        categories={liveCategories}
        active={selectedCategory}
        onSelect={setCategory}
      />
      
      {/* Filter Bar - shows active filters */}
      <FilterBar
        selectedCategory={selectedCategory}
        categoryLabel={liveCategories.find(c => c.slug === selectedCategory)?.name}
        query={query}
        capabilities={selectedCapabilities}
        capabilityLabels={availableCapabilities.reduce((acc, cap) => ({ ...acc, [cap]: cap }), {})}
        onClearAll={clearFilters}
        onRemoveCapability={toggleCapability}
        onClearQuery={() => setQuery('')}
        onClearCategory={() => setCategory(undefined)}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-7xl mx-auto">
          {/* View Mode Toggle */}
          <div className="flex justify-end mb-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 p-1 flex">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
                aria-label="Grid view"
                aria-pressed={viewMode === 'grid'}
              >
                <ViewGridIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
                aria-label="List view"
                aria-pressed={viewMode === 'list'}
              >
                <ViewListIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Filter Panel - when filter button is clicked */}
          {showFilters && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-25 flex items-end sm:items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-t-xl sm:rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto animate-fadeIn">
                <div className="sticky top-0 bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filter Tools</h3>
                  <button 
                    onClick={() => setShowFilters(false)}
                    className="ml-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Close filter panel"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <FiltersPanel
                    selectedCapabilities={selectedCapabilities}
                    availableCapabilities={availableCapabilities}
                    onToggle={toggleCapability}
                    onClear={selectedCapabilities.length > 0 ? clearFilters : undefined}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Tools Content */}
          {isLoading ? (
            <SkeletonList count={8} variant={viewMode} />
          ) : error ? (
            <ErrorState message="Failed to load tools" onRetry={retry} />
          ) : visibleTools.length === 0 ? (
            <EmptyState message="No tools found" actionLabel="Clear filters" onAction={clearFilters} />
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'divide-y divide-gray-100 dark:divide-gray-800 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 shadow-sm'
            }>
              {visibleTools.map(tool => (
                <ToolCardCompact
                  key={tool.id}
                  tool={tool}
                  variant={viewMode}
                  onDiscuss={() => openInChat(tool.id)}
                  onAddToPlan={() => addToPlan(tool.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});  // Close the memo wrapper

// Memoize the main export component for better performance
const ToolsContent = memo(function ToolsContent({ className }: ToolsContentProps) {
  return (
    <ToolsProvider>
      <ToolsContentInner className={className} />
    </ToolsProvider>
  );
});

// Export as default to match TabContainer.tsx import
export default ToolsContent;
