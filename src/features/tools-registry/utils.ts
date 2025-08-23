import type { RegistrySnapshot, ToolSummary, ToolsState, LiveCategory, SortMode } from './types';

/**
 * Normalizes a tool from the registry snapshot to ToolSummary format
 */
export function normalizeTool(tool: RegistrySnapshot['tools'][number]): ToolSummary {
  return {
    id: tool.id,
    name: tool.name,
    vendor: tool.vendor,
    category: tool.category,
    website: tool.website,
    description: tool.description,
    pricing: tool.pricing,
    capabilities: tool.capabilities,
    compliance: tool.compliance,
    lastVerifiedAt: tool.metadata?.lastVerifiedAt,
  };
}

/**
 * Builds live categories with counts from snapshot
 */
export function buildLiveCategories(snapshot: RegistrySnapshot): LiveCategory[] {
  const liveCategories: LiveCategory[] = [];
  
  for (const [slug, categoryMeta] of Object.entries(snapshot.categories)) {
    if (categoryMeta.status === 'live') {
      const toolIds = snapshot.indexes.byCategory[slug] || [];
      liveCategories.push({
        slug,
        name: categoryMeta.name,
        count: toolIds.length,
      });
    }
  }
  
  // Sort by name ascending
  return liveCategories.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Gets tool IDs for a specific category
 */
export function getCategoryToolIds(snapshot: RegistrySnapshot, category?: string): string[] {
  if (!category) {
    // Return all tools from live categories
    const liveCategories = Object.entries(snapshot.categories)
      .filter(([, meta]) => meta.status === 'live')
      .map(([slug]) => slug);
    
    const allIds = new Set<string>();
    liveCategories.forEach(slug => {
      const ids = snapshot.indexes.byCategory[slug] || [];
      ids.forEach(id => allIds.add(id));
    });
    
    return Array.from(allIds);
  }
  
  return snapshot.indexes.byCategory[category] || [];
}

/**
 * Gets tool IDs that have ALL selected capabilities (intersection)
 */
export function getCapabilityToolIds(snapshot: RegistrySnapshot, capabilities: string[]): string[] {
  if (capabilities.length === 0) {
    return [];
  }
  
  // Start with tools that have the first capability
  let toolIds = new Set(snapshot.indexes.byCapability[capabilities[0]] || []);
  
  // Intersect with tools that have each subsequent capability
  for (let i = 1; i < capabilities.length; i++) {
    const capabilityToolIds = new Set(snapshot.indexes.byCapability[capabilities[i]] || []);
    toolIds = new Set([...toolIds].filter(id => capabilityToolIds.has(id)));
  }
  
  return Array.from(toolIds);
}

/**
 * Normalizes search query by trimming and collapsing whitespace
 */
function normalizeQuery(query: string): string {
  return query.trim().replace(/\s+/g, ' ').toLowerCase();
}

/**
 * Checks if a tool matches the search query
 */
function matchesQuery(tool: ToolSummary, normalizedQuery: string): boolean {
  if (!normalizedQuery) return true;
  
  const searchableText = [
    tool.name,
    tool.vendor,
    tool.description,
  ].join(' ').toLowerCase();
  
  return searchableText.includes(normalizedQuery);
}

/**
 * Sorts tools based on the selected sort mode
 */
function sortTools(tools: ToolSummary[], sort: SortMode): ToolSummary[] {
  const sorted = [...tools];
  
  switch (sort) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
      
    case 'price-asc':
      return sorted.sort((a, b) => {
        const aMin = a.pricing?.minUSD;
        const bMin = b.pricing?.minUSD;
        
        // Undefined prices go last
        if (aMin === undefined && bMin === undefined) return a.name.localeCompare(b.name);
        if (aMin === undefined) return 1;
        if (bMin === undefined) return -1;
        
        if (aMin !== bMin) return aMin - bMin;
        
        // If min prices are equal, compare max prices
        const aMax = a.pricing?.maxUSD;
        const bMax = b.pricing?.maxUSD;
        
        if (aMax === undefined && bMax === undefined) return a.name.localeCompare(b.name);
        if (aMax === undefined) return 1;
        if (bMax === undefined) return -1;
        
        return aMax - bMax;
      });
      
    case 'price-desc':
      return sorted.sort((a, b) => {
        const aMax = a.pricing?.maxUSD ?? a.pricing?.minUSD;
        const bMax = b.pricing?.maxUSD ?? b.pricing?.minUSD;
        
        // Undefined prices go last
        if (aMax === undefined && bMax === undefined) return a.name.localeCompare(b.name);
        if (aMax === undefined) return 1;
        if (bMax === undefined) return -1;
        
        return bMax - aMax;
      });
      
    case 'recent':
      return sorted.sort((a, b) => {
        const aDate = a.lastVerifiedAt;
        const bDate = b.lastVerifiedAt;
        
        // Undefined dates go last, then sort by name
        if (!aDate && !bDate) return a.name.localeCompare(b.name);
        if (!aDate) return 1;
        if (!bDate) return -1;
        
        // Most recent first
        const comparison = new Date(bDate).getTime() - new Date(aDate).getTime();
        return comparison !== 0 ? comparison : a.name.localeCompare(b.name);
      });
      
    default:
      return sorted;
  }
}

/**
 * Filters and sorts tools based on current state
 */
export function filterAndSortTools(args: {
  snapshot: RegistrySnapshot;
  state: ToolsState;
}): ToolSummary[] {
  const { snapshot, state } = args;
  const { selectedCategory, query, selectedCapabilities, sort } = state;
  
  // Get base tool IDs from category filter
  let toolIds = getCategoryToolIds(snapshot, selectedCategory);
  
  // Apply capability filter (intersection)
  if (selectedCapabilities.length > 0) {
    const capabilityToolIds = getCapabilityToolIds(snapshot, selectedCapabilities);
    toolIds = toolIds.filter(id => capabilityToolIds.includes(id));
  }
  
  // Convert IDs to normalized tools
  const tools = toolIds
    .map(id => snapshot.tools.find(tool => tool.id === id))
    .filter((tool): tool is NonNullable<typeof tool> => tool !== undefined)
    .map(normalizeTool);
  
  // Apply search filter
  const normalizedQuery = normalizeQuery(query);
  const filteredTools = tools.filter(tool => matchesQuery(tool, normalizedQuery));
  
  // Apply sorting
  return sortTools(filteredTools, sort);
}

/**
 * Gets all available capabilities from live categories
 */
export function getAvailableCapabilities(snapshot: RegistrySnapshot): string[] {
  const liveCategories = Object.entries(snapshot.categories)
    .filter(([, meta]) => meta.status === 'live')
    .map(([slug]) => slug);
  
  const capabilities = new Set<string>();
  
  liveCategories.forEach(category => {
    const toolIds = snapshot.indexes.byCategory[category] || [];
    toolIds.forEach(toolId => {
      const tool = snapshot.tools.find(t => t.id === toolId);
      if (tool) {
        tool.capabilities.forEach(cap => capabilities.add(cap));
      }
    });
  });
  
  return Array.from(capabilities).sort();
}
