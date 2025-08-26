import { useState, useEffect } from 'react';
import { ToolSummary, LiveCategory, SortMode } from '../../features/tools-registry/types';

export interface ToolsRegistryState {
  isLoading: boolean;
  error: Error | null;
  selectedCategory?: string;
  query: string;
  sort: SortMode;
  selectedCapabilities: string[];
  visibleTools: ToolSummary[];
  liveCategories: LiveCategory[];
  availableCapabilities: string[];
  setCategory: (category?: string) => void;
  setQuery: (query: string) => void;
  setSort: (sort: SortMode) => void;
  toggleCapability: (capability: string) => void;
  clearFilters: () => void;
  openInChat: (toolId: string) => void;
  addToPlan: (toolId: string) => void;
  retry: () => void;
}

export function useToolsRegistry(): ToolsRegistryState {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortMode>('name');
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [visibleTools, setVisibleTools] = useState<ToolSummary[]>([]);
  const [liveCategories, setLiveCategories] = useState<LiveCategory[]>([]);
  const [availableCapabilities, setAvailableCapabilities] = useState<string[]>([]);
  const [allTools, setAllTools] = useState<ToolSummary[]>([]);
  const [reloadCount, setReloadCount] = useState(0);

  function mapToToolSummary(item: any): ToolSummary {
    const pricing = item.pricing
      ? {
          model: String(item.pricing.model),
          ...(typeof item.pricing.minMonthlyUSD === 'number' ? { minUSD: item.pricing.minMonthlyUSD } : {}),
          ...(typeof item.pricing.maxMonthlyUSD === 'number' ? { maxUSD: item.pricing.maxMonthlyUSD } : {}),
        }
      : undefined;

    const compliance = item.compliance
      ? {
          gdpr: item.compliance.gdpr ?? undefined,
          soc2: item.compliance.soc2 ?? undefined,
          hipaa: item.compliance.hipaa ?? undefined,
        }
      : undefined;

    return {
      // Ensure uniqueness for React keys by combining id + category
      id: `${item.id}__${item.category}`,
      name: String(item.name),
      vendor: String(item.vendor),
      category: String(item.category),
      website: String(item.website),
      description: String(item.description || ''),
      pricing,
      capabilities: Array.isArray(item.capabilities) ? (item.capabilities as string[]) : [],
      compliance,
      lastVerifiedAt: item.metadata?.lastVerifiedAt,
    };
  }

  // Load registry snapshot once (and on retry)
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        // Add timestamp to prevent caching issues with the snapshot file
        const timestamp = new Date().getTime();
        const res = await fetch(`/data/tools.snapshot.v1.json?t=${timestamp}`, { 
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch snapshot: ${res.status} ${res.statusText}`);
        }
        const snapshot: any = await res.json();
        const toolsRaw: any[] = Array.isArray(snapshot?.tools) ? snapshot.tools : [];

        // Deduplicate by composite key to avoid repeated entries in snapshot
        const seen = new Set<string>();
        const deduped: any[] = [];
        for (const item of toolsRaw) {
          const key = `${item.id}|${item.category}|${item.website}`;
          if (seen.has(key)) continue;
          seen.add(key);
          deduped.push(item);
        }
        const loadedTools = deduped.map(mapToToolSummary);

        // Compute live categories from snapshot categories + loaded tools counts
        const categoriesRec: Record<string, { name: string; status: string }> = snapshot?.categories || {};
        const counts = new Map<string, number>();
        for (const t of loadedTools) {
          counts.set(t.category, (counts.get(t.category) ?? 0) + 1);
        }
        const liveCats: LiveCategory[] = Object.entries(categoriesRec)
          .filter(([, c]) => c && c.status === 'live')
          .map(([slug, c]) => ({ slug, name: c.name, count: counts.get(slug) ?? 0 }))
          .sort((a, b) => a.name.localeCompare(b.name));

        // Compute available capabilities
        const capSet = new Set<string>();
        for (const t of loadedTools) {
          for (const c of t.capabilities) capSet.add(c);
        }
        const caps = Array.from(capSet).sort((a, b) => a.localeCompare(b));

        if (!cancelled) {
          setAllTools(loadedTools);
          setLiveCategories(liveCats);
          setAvailableCapabilities(caps);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error('Unknown error loading tools snapshot'));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [reloadCount]);

  // Derive visible tools based on filters/sort
  useEffect(() => {
    let filtered = [...allTools];

    if (selectedCategory) {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }

    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter((t) =>
        t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      );
    }

    if (selectedCapabilities.length > 0) {
      filtered = filtered.filter((t) => selectedCapabilities.every((c) => t.capabilities.includes(c)));
    }

    switch (sort) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-asc':
        filtered.sort((a, b) => (a.pricing?.minUSD ?? 0) - (b.pricing?.minUSD ?? 0));
        break;
      case 'price-desc':
        filtered.sort((a, b) => (b.pricing?.maxUSD ?? 0) - (a.pricing?.maxUSD ?? 0));
        break;
      case 'recent':
        filtered.sort((a, b) => {
          const ta = a.lastVerifiedAt ? new Date(a.lastVerifiedAt).getTime() : 0;
          const tb = b.lastVerifiedAt ? new Date(b.lastVerifiedAt).getTime() : 0;
          return tb - ta;
        });
        break;
    }

    setVisibleTools(filtered);
  }, [allTools, selectedCategory, query, sort, selectedCapabilities]);

  const toggleCapability = (capability: string) => {
    setSelectedCapabilities((prev) =>
      prev.includes(capability) ? prev.filter((c) => c !== capability) : [...prev, capability]
    );
  };

  const clearFilters = () => {
    setSelectedCategory(undefined);
    setQuery('');
    setSelectedCapabilities([]);
    setSort('name');
  };

  const openInChat = (toolId: string) => {
    console.log('Open in chat:', toolId);
    // Implementation would connect to chat system
  };

  const addToPlan = (toolId: string) => {
    console.log('Add to plan:', toolId);
    // Implementation would connect to implementation plan
  };

  const retry = () => {
    setError(null);
    setIsLoading(true);
    
    // Force clear any potential browser cache for the snapshot file
    // by adding a unique timestamp to the URL and forcing a network fetch
    const snapshotUrl = '/data/tools.snapshot.v1.json';
    const clearCacheUrl = `${snapshotUrl}?forceClear=${Date.now()}`;
    
    // Use the fetch API to force a network request that bypasses the cache
    fetch(clearCacheUrl, { 
      cache: 'reload',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }).then(() => {
      // Increment reload count to trigger the useEffect that loads the data
      setReloadCount((c) => c + 1);
    }).catch(e => {
      console.error('Failed to clear cache:', e);
      // Still increment reload count to retry loading the data
      setReloadCount((c) => c + 1);
    });
  };

  return {
    isLoading,
    error,
    selectedCategory,
    query,
    sort,
    selectedCapabilities,
    visibleTools,
    liveCategories,
    availableCapabilities,
    setCategory: setSelectedCategory,
    setQuery,
    setSort,
    toggleCapability,
    clearFilters,
    openInChat,
    addToPlan,
    retry,
  };
}
