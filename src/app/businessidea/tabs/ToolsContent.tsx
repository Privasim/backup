'use client';

/**
 * ToolsContent.tsx
 * 
 * Mobile-first implementation of the Tools Registry UI following modern design principles.
 * All components are defined inline to maintain a consolidated structure.
 */

import { useState, useEffect, useCallback, memo } from 'react';
import { cn } from '@/lib/utils';
import { useToolsRegistry } from "../../../components/tools-registry/useToolsRegistry";
import { ToolsProvider } from "../../../components/tools-registry/ToolsProvider";
import type { ToolSummary, SortMode } from '../../../features/tools-registry/types';
import { 
  MagnifyingGlassIcon, 
  AdjustmentsHorizontalIcon,
  ChatBubbleLeftIcon, 
  PlusIcon, 
  XMarkIcon,
  Squares2X2Icon as ViewGridIcon, 
  ListBulletIcon as ViewListIcon 
} from '@heroicons/react/24/outline';

// Mobile-first inline UI components following modern design principles

// Compact Header Component
const MobileHeader = memo(function MobileHeader({ 
  title, query, onSearchChange, onOpenFilters, className 
}: {
  title: string;
  query: string;
  onSearchChange: (query: string) => void;
  onOpenFilters: () => void;
  className?: string;
}) {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className={cn("sticky top-0 z-10 bg-white border-b border-gray-100", className)}>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h1>
          <button
            onClick={onOpenFilters}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Open filters"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        
        {/* Compact Search Bar */}
        <div className={cn(
          "flex items-center bg-gray-50 dark:bg-gray-800 rounded-xl border transition-colors",
          isFocused ? "border-blue-500" : "border-gray-200 dark:border-gray-700"
        )}>
          <MagnifyingGlassIcon className="h-4 w-4 ml-3 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search tools..."
            className="flex-1 px-3 py-2.5 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none text-sm"
          />
          {query && (
            <button
              onClick={() => onSearchChange('')}
              className="p-1 mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <XMarkIcon className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

// Horizontal Category Pills
const CategoryPills = memo(function CategoryPills({ 
  categories, active, onSelect, className 
}: {
  categories: Array<{ slug: string; name: string; count: number }>;
  active?: string;
  onSelect: (slug?: string) => void;
  className?: string;
}) {
  const totalCount = categories.reduce((sum, cat) => sum + cat.count, 0);
  
  return (
    <div className={cn("px-4 py-2 border-b border-gray-100", className)}>
      <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <button
          onClick={() => onSelect(undefined)}
          className={cn(
            "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors",
            !active 
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" 
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          )}
        >
          All ({totalCount})
        </button>
        {categories.map((category) => (
          <button
            key={category.slug}
            onClick={() => onSelect(category.slug)}
            className={cn(
              "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
              active === category.slug
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            )}
          >
            {category.name} ({category.count})
          </button>
        ))}
      </div>
    </div>
  );
});

// Compact Tool Card
const CompactToolCard = memo(function CompactToolCard({ 
  tool, variant, onDiscuss, onAddToPlan 
}: {
  tool: ToolSummary;
  variant: 'grid' | 'list';
  onDiscuss: () => void;
  onAddToPlan: () => void;
}) {
  const formatPrice = (pricing: ToolSummary['pricing']) => {
    if (!pricing) return null;
    if (pricing.model === 'free') return 'Free';
    if (pricing.model === 'freemium') return 'Freemium';
    if (pricing.minUSD && pricing.maxUSD) {
      return `$${pricing.minUSD}-${pricing.maxUSD}`;
    }
    return pricing.model.charAt(0).toUpperCase() + pricing.model.slice(1);
  };
  
  if (variant === 'list') {
    return (
      <div className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 flex items-center justify-center flex-shrink-0">
          <span className="text-blue-600 dark:text-blue-300 font-medium text-sm">
            {tool.name.charAt(0)}
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-gray-900 dark:text-white truncate">{tool.name}</h3>
            {formatPrice(tool.pricing) && (
              <span className={cn(
                "px-2 py-0.5 rounded text-xs font-medium",
                tool.pricing?.model === 'free' || tool.pricing?.model === 'freemium'
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                  : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
              )}>
                {formatPrice(tool.pricing)}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{tool.description}</p>
        </div>
        
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={onDiscuss}
            className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            title="Discuss"
          >
            <ChatBubbleLeftIcon className="h-4 w-4" />
          </button>
          <button
            onClick={onAddToPlan}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Add to Plan"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }
  
  // Grid variant
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 flex items-center justify-center">
          <span className="text-blue-600 dark:text-blue-300 font-medium text-sm">
            {tool.name.charAt(0)}
          </span>
        </div>
        {formatPrice(tool.pricing) && (
          <span className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            tool.pricing?.model === 'free' || tool.pricing?.model === 'freemium'
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
              : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
          )}>
            {formatPrice(tool.pricing)}
          </span>
        )}
      </div>
      
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">{tool.name}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{tool.description}</p>
      
      <div className="flex gap-2">
        <button
          onClick={onDiscuss}
          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1"
        >
          <ChatBubbleLeftIcon className="h-4 w-4" />
          Discuss
        </button>
        <button
          onClick={onAddToPlan}
          className="px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
          title="Add to Plan"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
});

// Loading Skeleton
const LoadingSkeleton = memo(function LoadingSkeleton({ variant }: { variant: 'grid' | 'list' }) {
  if (variant === 'list') {
    return (
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
            <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700" />
              <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 animate-pulse">
          <div className="flex justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="w-16 h-6 rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3" />
          <div className="flex gap-2">
            <div className="flex-1 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
});

// Empty State
const EmptyState = memo(function EmptyState({ message, actionLabel, onAction }: {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <span className="text-2xl">🔍</span>
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{message}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm">
        Try adjusting your search terms or filters to find more tools.
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
});

// Error State
const ErrorState = memo(function ErrorState({ message, onRetry }: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
        <span className="text-2xl">⚠️</span>
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Failed to load tools</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
});

// Filter Panel
const MobileFilterPanel = memo(function MobileFilterPanel({ 
  show, onClose, selectedCapabilities, availableCapabilities, onToggle, onClear, className 
}: {
  show: boolean;
  onClose: () => void;
  selectedCapabilities: string[];
  availableCapabilities: string[];
  onToggle: (capability: string) => void;
  onClear?: () => void;
  className?: string;
}) {
  if (!show) return null;
  
  return (
    <div className={cn("fixed inset-0 z-50 bg-black/20 flex items-end sm:items-center justify-center p-4", className)}>
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filter Tools</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Capabilities</h4>
            {selectedCapabilities.length > 0 && onClear && (
              <button
                onClick={onClear}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                Clear all
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {availableCapabilities.map((capability) => {
              const isSelected = selectedCapabilities.includes(capability);
              return (
                <button
                  key={capability}
                  onClick={() => onToggle(capability)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isSelected
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  )}
                >
                  {capability.replace(/-/g, ' ')}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});

interface ToolsContentProps {
  className?: string;
}
const ToolsContentInner = memo(function ToolsContentInner({ className }: ToolsContentProps) {
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

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list'); // Default to list for mobile

  return (
    <div className={cn("flex flex-col h-full bg-gray-50", className)} data-compact="true" data-force-light="true">
      {/* Mobile Header */}
      <MobileHeader
        title="Tools & Resources"
        query={query}
        onSearchChange={setQuery}
        onOpenFilters={() => setShowFilters(true)}
        className="tools-header"
      />
      
      {/* Category Pills */}
      <CategoryPills
        categories={liveCategories}
        active={selectedCategory}
        onSelect={setCategory}
        className="tools-categories"
      />
      
      {/* Active Filters */}
      {(selectedCapabilities.length > 0 || query) && (
        <div className="px-4 py-2 border-b border-gray-100 tools-filterbar">
          <div className="flex flex-wrap gap-2">
            {query && (
              <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                <span>Search: "{query}"</span>
                <button onClick={() => setQuery('')}>
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </div>
            )}
            {selectedCapabilities.map((capability) => (
              <div key={capability} className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                <span>{capability.replace(/-/g, ' ')}</span>
                <button onClick={() => toggleCapability(capability)}>
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </div>
            ))}
            <button
              onClick={clearFilters}
              className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
      
      {/* View Mode Toggle */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 tools-view-toggle">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {visibleTools.length} tools found
        </p>
        
        <div className="flex bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-0.5">
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "p-1.5 rounded transition-colors",
              viewMode === 'list'
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            )}
          >
            <ViewListIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-1.5 rounded transition-colors",
              viewMode === 'grid'
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            )}
          >
            <ViewGridIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 tools-content">
        {isLoading ? (
          <LoadingSkeleton variant={viewMode} />
        ) : error ? (
          <ErrorState message={error.message} onRetry={retry} />
        ) : visibleTools.length === 0 ? (
          <EmptyState 
            message="No tools found" 
            actionLabel="Clear filters" 
            onAction={clearFilters} 
          />
        ) : (
          <div className={cn(
            'tools-list',
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'border border-gray-200 rounded-xl bg-white divide-y divide-gray-100'
          )}>
            {visibleTools.map(tool => (
              <CompactToolCard
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
      
      {/* Filter Panel */}
      <MobileFilterPanel
        show={showFilters}
        onClose={() => setShowFilters(false)}
        selectedCapabilities={selectedCapabilities}
        availableCapabilities={availableCapabilities}
        onToggle={toggleCapability}
        onClear={selectedCapabilities.length > 0 ? clearFilters : undefined}
        className="tools-filter-panel"
      />
    </div>
  );
});
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
