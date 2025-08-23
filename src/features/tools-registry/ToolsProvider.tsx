'use client';

import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from 'react';
import { registrySchema } from '@/data/tools-registry/_meta/schemas/registry.schema';
import { useChatbox } from '@/components/chatbox/ChatboxProvider';
import { useImplementationPlan } from '@/features/implementation-plan/useImplementationPlan';
import type { ToolsContextValue, ToolsState, SortMode } from './types';
import { buildLiveCategories, filterAndSortTools, getAvailableCapabilities } from './utils';

const ToolsContext = createContext<ToolsContextValue | undefined>(undefined);

interface ToolsProviderProps {
  children: ReactNode;
}

export function ToolsProvider({ children }: ToolsProviderProps) {
  const [state, setState] = useState<ToolsState>({
    isLoading: true,
    query: '',
    sort: 'name',
    selectedCapabilities: [],
  });

  const { openConversation } = useChatbox();
  const implementationPlan = useImplementationPlan();

  // Fetch and validate snapshot
  const fetchSnapshot = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      const response = await fetch('/data/tools.snapshot.v1.json', {
        cache: 'force-cache',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tools snapshot: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Validate in development only
      if (process.env.NODE_ENV === 'development') {
        try {
          await registrySchema.parseAsync(data);
        } catch (validationError) {
          console.error('Tools snapshot validation failed:', validationError);
          throw new Error('Tools snapshot failed validation. Check console for details.');
        }
      }

      setState(prev => ({
        ...prev,
        snapshot: data,
        isLoading: false,
        error: undefined,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load tools registry';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
    }
  }, []);

  // Load snapshot on mount
  useEffect(() => {
    fetchSnapshot();
  }, [fetchSnapshot]);

  // Memoized derived data
  const toolsByCategory = useMemo(() => {
    return state.snapshot?.indexes.byCategory || {};
  }, [state.snapshot]);

  const toolsByCapability = useMemo(() => {
    return state.snapshot?.indexes.byCapability || {};
  }, [state.snapshot]);

  const liveCategories = useMemo(() => {
    return state.snapshot ? buildLiveCategories(state.snapshot) : [];
  }, [state.snapshot]);

  const availableCapabilities = useMemo(() => {
    return state.snapshot ? getAvailableCapabilities(state.snapshot) : [];
  }, [state.snapshot]);

  const visibleTools = useMemo(() => {
    if (!state.snapshot) return [];
    return filterAndSortTools({ snapshot: state.snapshot, state });
  }, [state.snapshot, state.selectedCategory, state.query, state.selectedCapabilities, state.sort]);

  // Actions
  const setCategory = useCallback((slug?: string) => {
    setState(prev => ({ ...prev, selectedCategory: slug }));
  }, []);

  const setQuery = useCallback((q: string) => {
    setState(prev => ({ ...prev, query: q }));
  }, []);

  const setSort = useCallback((s: SortMode) => {
    setState(prev => ({ ...prev, sort: s }));
  }, []);

  const toggleCapability = useCallback((capability: string) => {
    setState(prev => ({
      ...prev,
      selectedCapabilities: prev.selectedCapabilities.includes(capability)
        ? prev.selectedCapabilities.filter(c => c !== capability)
        : [...prev.selectedCapabilities, capability],
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedCategory: undefined,
      query: '',
      selectedCapabilities: [],
    }));
  }, []);

  const openInChat = useCallback((toolId: string) => {
    if (!state.snapshot) return;

    const tool = state.snapshot.tools.find(t => t.id === toolId);
    if (!tool) return;

    const message = `I'd like to discuss ${tool.name} by ${tool.vendor}.

**Tool Details:**
- Category: ${tool.category}
- Website: ${tool.website}
- Description: ${tool.description}
- Capabilities: ${tool.capabilities.join(', ')}
${tool.pricing ? `- Pricing: ${tool.pricing.model}${tool.pricing.minUSD ? ` ($${tool.pricing.minUSD}${tool.pricing.maxUSD ? `-$${tool.pricing.maxUSD}` : '+'}` : ''}` : ''}
${tool.compliance ? `- Compliance: ${Object.entries(tool.compliance).filter(([, value]) => value).map(([key]) => key.toUpperCase()).join(', ')}` : ''}

How can this tool help with my business implementation?`;

    openConversation(message);
  }, [state.snapshot, openConversation]);

  const addToPlan = useCallback((toolId: string) => {
    if (!state.snapshot) return;

    const tool = state.snapshot.tools.find(t => t.id === toolId);
    if (!tool) return;

    // Check if implementation plan has an API to add resources
    // For now, we'll show a notice that this feature is coming soon
    console.log('Add to plan requested for:', tool.name);
    
    // TODO: Integrate with implementation plan when API is available
    // This would ideally call something like:
    // implementationPlan.addResource({
    //   type: 'tool',
    //   name: tool.name,
    //   vendor: tool.vendor,
    //   website: tool.website,
    //   category: tool.category,
    //   pricing: tool.pricing,
    // });
    
    alert(`"Add to Plan" feature is coming soon. Tool: ${tool.name} by ${tool.vendor}`);
  }, [state.snapshot]);

  const retry = useCallback(() => {
    fetchSnapshot();
  }, [fetchSnapshot]);

  const contextValue: ToolsContextValue = {
    ...state,
    toolsByCategory,
    toolsByCapability,
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
  };

  return (
    <ToolsContext.Provider value={contextValue}>
      {children}
    </ToolsContext.Provider>
  );
}

export function useTools(): ToolsContextValue {
  const context = useContext(ToolsContext);
  if (context === undefined) {
    throw new Error('useTools must be used within a ToolsProvider');
  }
  return context;
}
