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

  // Mock implementation for demo purposes
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      try {
        // Mock data
        const mockCategories: LiveCategory[] = [
          { slug: 'ai', name: 'AI Tools', count: 12 },
          { slug: 'analytics', name: 'Analytics', count: 8 },
          { slug: 'marketing', name: 'Marketing', count: 15 },
          { slug: 'productivity', name: 'Productivity', count: 10 },
          { slug: 'development', name: 'Development', count: 20 },
        ];
        
        const mockCapabilities = [
          'API Access', 'Data Export', 'Automation', 'Collaboration', 
          'Mobile Support', 'Integrations', 'Custom Reporting'
        ];
        
        const mockTools: ToolSummary[] = mockCategories.flatMap(cat => 
          Array(cat.count).fill(0).map((_, i) => ({
            id: `${cat.slug}-tool-${i+1}`,
            name: `${cat.name.slice(0, -1)} ${i+1}`,
            vendor: `${cat.name.split(' ')[0]} Co.`,
            category: cat.slug,
            website: `https://example.com/${cat.slug}/tool-${i+1}`,
            description: `A powerful tool for ${cat.name.toLowerCase()}.`,
            capabilities: mockCapabilities.slice(0, Math.floor(Math.random() * 5) + 1),
            pricing: ((): ToolSummary['pricing'] => {
              const tier = Math.floor(Math.random() * 4);
              if (tier === 0) return { model: 'free', minUSD: 0, maxUSD: 0 };
              if (tier === 1) return { model: 'freemium', minUSD: 0, maxUSD: 10 };
              if (tier === 2) return { model: 'paid', minUSD: 10, maxUSD: 50 };
              return { model: 'enterprise', minUSD: 50, maxUSD: 200 };
            })(),
            lastVerifiedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString(),
          }))
        );
        
        setLiveCategories(mockCategories);
        setAvailableCapabilities(mockCapabilities);
        
        // Filter tools based on current state
        let filtered = [...mockTools];
        
        if (selectedCategory) {
          filtered = filtered.filter(tool => tool.category === selectedCategory);
        }
        
        if (query) {
          const lowerQuery = query.toLowerCase();
          filtered = filtered.filter(tool => 
            tool.name.toLowerCase().includes(lowerQuery) || 
            tool.description.toLowerCase().includes(lowerQuery)
          );
        }
        
        if (selectedCapabilities.length > 0) {
          filtered = filtered.filter(tool => 
            selectedCapabilities.every(cap => tool.capabilities.includes(cap))
          );
        }
        
        // Sort tools
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
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setIsLoading(false);
      }
    }, 500);
  }, [selectedCategory, query, sort, selectedCapabilities]);

  const toggleCapability = (capability: string) => {
    setSelectedCapabilities(prev => 
      prev.includes(capability) 
        ? prev.filter(c => c !== capability)
        : [...prev, capability]
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
    // Re-fetch data
    setError(null);
    // This would trigger the useEffect
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
