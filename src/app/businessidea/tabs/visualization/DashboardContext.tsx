/**
 * Dashboard context provider for visualization metrics
 */
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { 
  DashboardActions, 
  DashboardFilters, 
  DashboardState, 
  DimensionBreakdown, 
  MetricKPI, 
  TimeSeriesPoint 
} from './metrics-types';
import { useDashboardData } from './useDashboardData';

// Default filters
const DEFAULT_FILTERS: DashboardFilters = {
  timeRange: '7d',
  compareTo: 'prev',
  segment: null
};

// Create context with default values
const DashboardContext = createContext<{
  state: DashboardState;
  actions: DashboardActions;
}>({
  state: {
    filters: DEFAULT_FILTERS,
    kpis: [],
    series: {},
    breakdowns: {},
    activeCardId: null,
    loading: false,
    error: null
  },
  actions: {
    setFilters: () => {},
    setActiveCard: () => {},
    refresh: async () => {},
    exportSnapshot: async () => {}
  }
});

interface DashboardProviderProps {
  children: ReactNode;
  userId: string;
  useMockData?: boolean;
}

/**
 * Dashboard provider component
 */
export function DashboardProvider({ 
  children, 
  userId,
  useMockData = true
}: DashboardProviderProps): JSX.Element {
  // State
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  
  // Fetch data using the hook
  const { 
    kpis, 
    series, 
    breakdowns, 
    loading, 
    error, 
    refresh 
  } = useDashboardData(userId, filters, useMockData);
  
  // Action to update filters
  const handleSetFilters = useCallback((newFilters: Partial<DashboardFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);
  
  // Action to set active card
  const handleSetActiveCard = useCallback((cardId: string | null) => {
    setActiveCardId(cardId);
  }, []);
  
  // Action to export snapshot
  const handleExportSnapshot = useCallback(async () => {
    try {
      // Create a snapshot object with current state
      const snapshot = {
        timestamp: new Date().toISOString(),
        filters,
        kpis,
        activeBreakdowns: {
          contextual: breakdowns['contextual'] || [],
          device: breakdowns['device'] || [],
          channel: breakdowns['channel'] || [],
          creative: breakdowns['creative'] || []
        },
        impressionsSeries: series['impressions'] || []
      };
      
      // If Supabase is available, save the snapshot
      try {
        const { supabase } = await import('../../../lib/supabase/client');
        
        await supabase
          .from('metric_snapshots')
          .insert({
            user_id: userId,
            snapshot_json: snapshot,
            created_at: new Date().toISOString()
          });
          
        console.log('Snapshot saved to Supabase');
      } catch (err) {
        // Fallback to local export if Supabase is not available
        const dataStr = JSON.stringify(snapshot, null, 2);
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
        
        const exportName = `metrics-snapshot-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportName);
        linkElement.click();
        
        console.log('Snapshot exported locally');
      }
    } catch (err) {
      console.error('Failed to export snapshot:', err);
    }
  }, [userId, filters, kpis, series, breakdowns]);
  
  // Combine state and actions
  const contextValue = {
    state: {
      filters,
      kpis,
      series,
      breakdowns,
      activeCardId,
      loading,
      error
    },
    actions: {
      setFilters: handleSetFilters,
      setActiveCard: handleSetActiveCard,
      refresh,
      exportSnapshot: handleExportSnapshot
    }
  };
  
  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
}

/**
 * Hook to use the dashboard context
 */
export function useDashboard() {
  const context = useContext(DashboardContext);
  
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  
  return context;
}
