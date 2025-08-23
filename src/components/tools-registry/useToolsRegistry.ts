import { useState, useEffect } from 'react';

export interface Tool {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  capabilities: string[];
  pricing?: {
    type: 'free' | 'freemium' | 'paid' | 'enterprise';
    range?: string;
  };
  compliance?: string[];
}

export interface Category {
  slug: string;
  name: string;
  count: number;
}

export interface ToolsRegistryState {
  isLoading: boolean;
  error: Error | null;
  selectedCategory?: string;
  query: string;
  sort: 'name' | 'popularity' | 'newest';
  selectedCapabilities: string[];
  visibleTools: Tool[];
  liveCategories: Category[];
  availableCapabilities: string[];
  setCategory: (category?: string) => void;
  setQuery: (query: string) => void;
  setSort: (sort: 'name' | 'popularity' | 'newest') => void;
  toggleCapability: (capability: string) => void;
  clearFilters: () => void;
  openInChat: (tool: Tool) => void;
  addToPlan: (tool: Tool) => void;
  retry: () => void;
}

export function useToolsRegistry(): ToolsRegistryState {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'name' | 'popularity' | 'newest'>('name');
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [visibleTools, setVisibleTools] = useState<Tool[]>([]);
  const [liveCategories, setLiveCategories] = useState<Category[]>([]);
  const [availableCapabilities, setAvailableCapabilities] = useState<string[]>([]);

  // Mock implementation for demo purposes
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      try {
        // Mock data
        const mockCategories: Category[] = [
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
        
        const mockTools: Tool[] = mockCategories.flatMap(cat => 
          Array(cat.count).fill(0).map((_, i) => ({
            id: `${cat.slug}-tool-${i+1}`,
            name: `${cat.name.slice(0, -1)} ${i+1}`,
            description: `A powerful tool for ${cat.name.toLowerCase()}.`,
            url: `https://example.com/${cat.slug}/tool-${i+1}`,
            category: cat.slug,
            capabilities: mockCapabilities.slice(0, Math.floor(Math.random() * 5) + 1),
            pricing: {
              type: ['free', 'freemium', 'paid', 'enterprise'][Math.floor(Math.random() * 4)] as 'free' | 'freemium' | 'paid' | 'enterprise',
              range: ['$0', '$10-50/mo', '$50-200/mo', 'Custom'][Math.floor(Math.random() * 4)]
            }
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
          case 'popularity':
            // Mock popularity sorting
            filtered.sort(() => Math.random() - 0.5);
            break;
          case 'newest':
            // Mock newest sorting
            filtered.sort(() => Math.random() - 0.5);
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

  const openInChat = (tool: Tool) => {
    console.log('Open in chat:', tool);
    // Implementation would connect to chat system
  };

  const addToPlan = (tool: Tool) => {
    console.log('Add to plan:', tool);
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
