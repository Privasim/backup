'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { cn } from '@/lib/utils';
import { useToolsRegistry } from "../../../components/tools-registry/useToolsRegistry";
import { ToolsProvider } from "../../../components/tools-registry/ToolsProvider";
import { CategorySidebar } from "../../../components/tools-registry/CategorySidebar";
import { FiltersPanel } from "../../../components/tools-registry/FiltersPanel";
import { SortMenu } from "../../../components/tools-registry/SortMenu";
import { ToolList } from "../../../components/tools-registry/ToolList";

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

  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [tempQuery, setTempQuery] = useState(query);

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
    <div className={cn("flex h-full overflow-hidden", className)}>
      {/* Desktop Sidebar - removed fixed positioning to keep it inside parent container */}
      <div className="hidden lg:block lg:w-64 lg:flex-shrink-0 lg:bg-white lg:dark:bg-gray-900 lg:border-r lg:border-gray-200 lg:dark:border-gray-700">
        <div className="h-full flex flex-col overflow-y-auto">
          <div className="px-4 py-4">
            <CategorySidebar
              categories={liveCategories}
              active={selectedCategory}
              onSelect={setCategory}
            />
          </div>
        </div>
      </div>

      {/* Main Content - removed left padding since sidebar is now properly contained */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* App Store Style Header */}
        <div className="bg-gradient-to-r from-sky-500 to-cyan-400 dark:from-sky-600 dark:to-cyan-500 rounded-b-2xl pb-4 pt-6 px-4 sm:px-6 relative overflow-hidden">
          {/* Header Content */}
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Tools & Resources</h1>
                <p className="text-sky-100 mt-1">Discover tools for your business</p>
              </div>
              <div className="flex space-x-2 mt-1">
                {/* Search Icon Button */}
                <button 
                  onClick={toggleSearch}
                  className="bg-white/20 backdrop-blur-sm p-2 rounded-full text-white hover:bg-white/30 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-sky-500"
                  aria-label="Search tools"
                  aria-expanded={showSearch}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </button>
                {/* Filter Icon Button */}
                <button 
                  onClick={toggleFilterPanel}
                  className="bg-white/20 backdrop-blur-sm p-2 rounded-full text-white hover:bg-white/30 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-sky-500"
                  aria-label="Filter tools"
                  aria-expanded={showFilters}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Embedded Search Pill */}
            <div className="relative max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tools by name, vendor, or description..."
                className="block w-full pl-10 pr-3 py-3 rounded-full border border-transparent bg-white/90 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-200 shadow-sm hover:shadow-md"
                aria-label="Search tools"
              />
            </div>
          </div>
        </div>

        {/* Category Chips - Mobile Only */}
        <div className="lg:hidden px-4 pt-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            <button
              onClick={() => setCategory(undefined)}
              className={cn(
                "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
                !selectedCategory
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-md transform scale-105"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              )}
              aria-pressed={!selectedCategory}
            >
              All ({totalToolsCount})
            </button>
            {liveCategories.map((category: { slug: string; name: string; count: number }) => (
              <button
                key={category.slug}
                onClick={() => setCategory(category.slug)}
                className={cn(
                  "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
                  selectedCategory === category.slug
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-md transform scale-105"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                )}
                aria-pressed={selectedCategory === category.slug}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area with Scroll */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Search Overlay - when search button is clicked */}
            {showSearch && (
              <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 animate-fadeIn">
                <div className="flex items-center mb-3">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mr-2">Search Tools</h3>
                  <button 
                    onClick={() => setShowSearch(false)}
                    className="ml-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Close search panel"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={tempQuery}
                    onChange={(e) => setTempQuery(e.target.value)}
                    placeholder="Search tools by name, vendor, or description..."
                    className="block w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    autoFocus
                    aria-label="Search query"
                  />
                  <div className="mt-3 flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setTempQuery('');
                        setQuery('');
                        setShowSearch(false);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      aria-label="Clear search"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleSearch}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      aria-label="Apply search"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Filter Panel - when filter button is clicked */}
            {showFilters && (
              <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 animate-fadeIn">
                <div className="flex items-center mb-3">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mr-2">Filter Tools</h3>
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
                <FiltersPanel
                  selectedCapabilities={selectedCapabilities}
                  availableCapabilities={availableCapabilities}
                  onToggle={toggleCapability}
                  onClear={selectedCapabilities.length > 0 ? clearFilters : undefined}
                />
              </div>
            )}

            {/* Sort Menu */}
            <div className="flex justify-end mb-6">
              <div className="relative inline-block">
                <SortMenu 
                  value={sort} 
                  onChange={setSort} 
                  className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg rounded-lg transition-all duration-200 border border-gray-200 dark:border-gray-700"
                />
              </div>
            </div>

            {/* Filters Summary */}
            {(selectedCategory || query || selectedCapabilities.length > 0) && (
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-2">
                  {selectedCategory && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 shadow-sm transition-all duration-200 animate-fadeIn">
                      {liveCategories.find((c: { slug: string; name: string }) => c.slug === selectedCategory)?.name}
                      <button 
                        onClick={() => setCategory(undefined)}
                        className="ml-2 inline-flex text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-100 transition-colors"
                        aria-label={`Remove ${liveCategories.find((c: { slug: string; name: string }) => c.slug === selectedCategory)?.name} filter`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {query && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 shadow-sm transition-all duration-200 animate-fadeIn">
                      Search: {query}
                      <button 
                        onClick={() => {
                          setQuery('');
                          setTempQuery('');
                        }}
                        className="ml-2 inline-flex text-green-500 hover:text-green-700 dark:text-green-300 dark:hover:text-green-100 transition-colors"
                        aria-label="Clear search query"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {selectedCapabilities.map((capability: string) => (
                    <span key={capability} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 shadow-sm transition-all duration-200 animate-fadeIn">
                      {capability}
                      <button 
                        onClick={() => toggleCapability(capability)}
                        className="ml-2 inline-flex text-purple-500 hover:text-purple-700 dark:text-purple-300 dark:hover:text-purple-100 transition-colors"
                        aria-label={`Remove ${capability} filter`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors shadow-sm"
                    aria-label="Clear all filters"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            )}

            {/* Tools List */}
            <ToolList
              tools={visibleTools}
              isLoading={isLoading}
              error={error}
              onDiscuss={openInChat}
              onAddToPlan={addToPlan}
              onRetry={retry}
            />
          </div>
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
