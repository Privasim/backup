import type { RegistrySnapshot } from '@/data/tools-registry/_meta/schemas/registry.schema';

// Re-export for convenience
export type { RegistrySnapshot };

export interface ToolSummary {
  id: string;
  name: string;
  vendor: string;
  category: string;
  website: string;
  description: string;
  pricing?: {
    model: string;
    minUSD?: number;
    maxUSD?: number;
  };
  capabilities: string[];
  compliance?: {
    gdpr?: boolean;
    soc2?: boolean;
    hipaa?: boolean;
  };
  lastVerifiedAt?: string;
}

export type SortMode = 'name' | 'price-asc' | 'price-desc' | 'recent';

export interface ToolsState {
  snapshot?: RegistrySnapshot;
  isLoading: boolean;
  error?: string;
  selectedCategory?: string;
  query: string;
  sort: SortMode;
  selectedCapabilities: string[];
}

export interface ToolsActions {
  setCategory: (slug?: string) => void;
  setQuery: (q: string) => void;
  setSort: (s: SortMode) => void;
  toggleCapability: (c: string) => void;
  clearFilters: () => void;
  openInChat: (toolId: string) => void;
  addToPlan: (toolId: string) => void;
  retry: () => void;
}

export interface LiveCategory {
  slug: string;
  name: string;
  count: number;
}

export interface ToolsContextValue extends ToolsState, ToolsActions {
  toolsByCategory: Record<string, string[]>;
  toolsByCapability: Record<string, string[]>;
  visibleTools: ToolSummary[];
  liveCategories: LiveCategory[];
  availableCapabilities: string[];
}
