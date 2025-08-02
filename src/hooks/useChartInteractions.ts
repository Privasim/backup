import { useState, useCallback, useMemo } from 'react';

export interface FilterState {
  riskRange: [number, number];
  employmentRange: [number, number];
  industries: string[];
  occupations: string[];
  selectedCategory: 'all' | 'industry' | 'occupation';
}

export interface ChartInteractionState {
  filters: FilterState;
  hoveredItem: string | null;
  selectedItems: string[];
  brushedRange: { x: [number, number]; y: [number, number] } | null;
}

const initialFilters: FilterState = {
  riskRange: [0, 1],
  employmentRange: [0, 10],
  industries: [],
  occupations: [],
  selectedCategory: 'all'
};

export const useChartInteractions = () => {
  const [state, setState] = useState<ChartInteractionState>({
    filters: initialFilters,
    hoveredItem: null,
    selectedItems: [],
    brushedRange: null
  });

  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters }
    }));
  }, []);

  const setHoveredItem = useCallback((itemId: string | null) => {
    setState(prev => ({ ...prev, hoveredItem: itemId }));
  }, []);

  const toggleSelectedItem = useCallback((itemId: string) => {
    setState(prev => ({
      ...prev,
      selectedItems: prev.selectedItems.includes(itemId)
        ? prev.selectedItems.filter(id => id !== itemId)
        : [...prev.selectedItems, itemId]
    }));
  }, []);

  const setBrushedRange = useCallback((range: { x: [number, number]; y: [number, number] } | null) => {
    setState(prev => ({ ...prev, brushedRange: range }));
  }, []);

  const clearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: initialFilters,
      selectedItems: [],
      brushedRange: null
    }));
  }, []);

  // Filter data based on current state
  const filterData = useCallback((data: any[]) => {
    return data.filter(item => {
      // Risk range filter
      if (item.riskScore < state.filters.riskRange[0] || item.riskScore > state.filters.riskRange[1]) {
        return false;
      }

      // Employment range filter
      if (item.employment < state.filters.employmentRange[0] || item.employment > state.filters.employmentRange[1]) {
        return false;
      }

      // Category filter
      if (state.filters.selectedCategory !== 'all' && item.category !== state.filters.selectedCategory) {
        return false;
      }

      // Industry filter
      if (state.filters.industries.length > 0 && !state.filters.industries.includes(item.industry || item.name)) {
        return false;
      }

      // Occupation filter
      if (state.filters.occupations.length > 0 && !state.filters.occupations.includes(item.name)) {
        return false;
      }

      // Brushed range filter
      if (state.brushedRange) {
        const { x, y } = state.brushedRange;
        if (item.riskScore < x[0] || item.riskScore > x[1] || 
            item.employment < y[0] || item.employment > y[1]) {
          return false;
        }
      }

      return true;
    });
  }, [state.filters, state.brushedRange]);

  // Get related items for highlighting
  const getRelatedItems = useCallback((itemId: string, data: any[]) => {
    const item = data.find(d => d.id === itemId);
    if (!item) return [];

    return data.filter(d => {
      if (d.id === itemId) return false;
      
      // Same category
      if (d.category === item.category) return true;
      
      // Similar risk score (within 10%)
      if (Math.abs(d.riskScore - item.riskScore) < 0.1) return true;
      
      // Same industry
      if (d.industry === item.industry || d.name === item.industry) return true;
      
      return false;
    }).map(d => d.id);
  }, []);

  // Active filter count for UI
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (state.filters.riskRange[0] > 0 || state.filters.riskRange[1] < 1) count++;
    if (state.filters.employmentRange[0] > 0 || state.filters.employmentRange[1] < 10) count++;
    if (state.filters.industries.length > 0) count++;
    if (state.filters.occupations.length > 0) count++;
    if (state.filters.selectedCategory !== 'all') count++;
    if (state.brushedRange) count++;
    return count;
  }, [state.filters, state.brushedRange]);

  return {
    state,
    updateFilters,
    setHoveredItem,
    toggleSelectedItem,
    setBrushedRange,
    clearFilters,
    filterData,
    getRelatedItems,
    activeFilterCount
  };
};