'use client';

import { cn } from '@/lib/utils';
import { ToolsProvider } from '@/features/tools-registry/ToolsProvider';
import { useToolsRegistry } from '@/features/tools-registry/useToolsRegistry';
import { CategorySidebar } from './tools/CategorySidebar';
import { SearchBar } from './tools/SearchBar';
import { SortMenu } from './tools/SortMenu';
import { FiltersPanel } from './tools/FiltersPanel';
import { ToolList } from './tools/ToolList';

interface ToolsContentProps {
  className?: string;
}

function ToolsContentInner({ className }: ToolsContentProps) {
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

  return (
    <div className={cn("flex h-full", className)}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:bg-white lg:dark:bg-gray-900 lg:border-r lg:border-gray-200 lg:dark:border-gray-700">
        <div className="flex-1 flex flex-col min-h-0 pt-20 pb-4 overflow-y-auto">
          <div className="px-4">
            <CategorySidebar
              categories={liveCategories}
              active={selectedCategory}
              onSelect={setCategory}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:pl-64">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Tools & Resources
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Discover and manage the tools that power your business idea
              </p>
            </div>

            {/* Mobile Category Selector */}
            <div className="lg:hidden mb-6">
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setCategory(undefined)}
                  className={cn(
                    "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                    !selectedCategory
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  )}
                >
                  All ({liveCategories.reduce((sum, cat) => sum + cat.count, 0)})
                </button>
                {liveCategories.map((category) => (
                  <button
                    key={category.slug}
                    onClick={() => setCategory(category.slug)}
                    className={cn(
                      "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                      selectedCategory === category.slug
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    )}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Search and Sort */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <SearchBar
                  value={query}
                  onChange={setQuery}
                  placeholder="Search tools by name, vendor, or description..."
                />
              </div>
              <SortMenu value={sort} onChange={setSort} />
            </div>

            {/* Filters */}
            <div className="mb-6">
              <FiltersPanel
                selectedCapabilities={selectedCapabilities}
                availableCapabilities={availableCapabilities}
                onToggle={toggleCapability}
                onClear={selectedCapabilities.length > 0 ? clearFilters : undefined}
              />
            </div>

            {/* Clear All Filters */}
            {(selectedCategory || query || selectedCapabilities.length > 0) && (
              <div className="mb-6">
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  Clear all filters
                </button>
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
}

export function ToolsContent({ className }: ToolsContentProps) {
  return (
    <ToolsProvider>
      <ToolsContentInner className={className} />
    </ToolsProvider>
  );
}
