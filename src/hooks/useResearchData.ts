'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  getResearchService, 
  OccupationRisk, 
  OccupationMatch, 
  ChartConfig,
  SearchFilters,
  initializeResearchService 
} from '@/lib/research/service';
import knowledgeBase from '@/lib/research/data/ai_employment_risks.json';

export interface UseResearchDataState {
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

export interface UseOccupationRiskResult extends UseResearchDataState {
  occupationRisk: OccupationRisk | null;
  refetch: () => Promise<void>;
}

export interface UseOccupationSearchResult extends UseResearchDataState {
  results: OccupationMatch[];
  search: (query: string, filters?: SearchFilters) => Promise<void>;
  clearResults: () => void;
}

export interface UseVisualizationResult extends UseResearchDataState {
  chartConfig: ChartConfig | null;
  refetch: () => Promise<void>;
}

// Initialize the research service
let serviceInitialized = false;

async function ensureServiceInitialized() {
  if (!serviceInitialized) {
    try {
      await initializeResearchService(knowledgeBase as any);
      serviceInitialized = true;
    } catch (error) {
      console.error('Failed to initialize research service:', error);
      throw error;
    }
  }
}

// Hook for getting occupation risk data
export function useOccupationRisk(occupationIdentifier?: string): UseOccupationRiskResult {
  const [state, setState] = useState<UseResearchDataState>({
    isLoading: false,
    error: null,
    isInitialized: false,
  });
  const [occupationRisk, setOccupationRisk] = useState<OccupationRisk | null>(null);

  const fetchOccupationRisk = useCallback(async () => {
    if (!occupationIdentifier) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await ensureServiceInitialized();
      const service = getResearchService();
      const risk = await service.getOccupationRiskWithFallback(occupationIdentifier);
      
      setOccupationRisk(risk);
      setState(prev => ({ ...prev, isLoading: false, isInitialized: true }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch occupation risk';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      setOccupationRisk(null);
    }
  }, [occupationIdentifier]);

  useEffect(() => {
    fetchOccupationRisk();
  }, [fetchOccupationRisk]);

  return {
    ...state,
    occupationRisk,
    refetch: fetchOccupationRisk,
  };
}

// Hook for searching occupations
export function useOccupationSearch(): UseOccupationSearchResult {
  const [state, setState] = useState<UseResearchDataState>({
    isLoading: false,
    error: null,
    isInitialized: false,
  });
  const [results, setResults] = useState<OccupationMatch[]>([]);

  const search = useCallback(async (query: string, filters: SearchFilters = {}) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await ensureServiceInitialized();
      const service = getResearchService();
      const searchResults = await service.searchOccupations(query, filters);
      
      setResults(searchResults);
      setState(prev => ({ ...prev, isLoading: false, isInitialized: true }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search occupations';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      setResults([]);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    results,
    search,
    clearResults,
  };
}

// Hook for visualization data
export function useVisualization(chartType: string): UseVisualizationResult {
  const [state, setState] = useState<UseResearchDataState>({
    isLoading: false,
    error: null,
    isInitialized: false,
  });
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null);

  const fetchVisualization = useCallback(async () => {
    if (!chartType) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await ensureServiceInitialized();
      const service = getResearchService();
      const config = await service.getVisualizationConfig(chartType);
      
      setChartConfig(config);
      setState(prev => ({ ...prev, isLoading: false, isInitialized: true }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch visualization';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      setChartConfig(null);
    }
  }, [chartType]);

  useEffect(() => {
    fetchVisualization();
  }, [fetchVisualization]);

  return {
    ...state,
    chartConfig,
    refetch: fetchVisualization,
  };
}

// Hook for top risk occupations
export function useTopRiskOccupations(limit: number = 10) {
  const [state, setState] = useState<UseResearchDataState>({
    isLoading: false,
    error: null,
    isInitialized: false,
  });
  const [occupations, setOccupations] = useState<any[]>([]);

  const fetchTopRisk = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await ensureServiceInitialized();
      const service = getResearchService();
      const topOccupations = await service.getTopRiskOccupations(limit);
      
      setOccupations(topOccupations);
      setState(prev => ({ ...prev, isLoading: false, isInitialized: true }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch top risk occupations';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      setOccupations([]);
    }
  }, [limit]);

  useEffect(() => {
    fetchTopRisk();
  }, [fetchTopRisk]);

  return {
    ...state,
    occupations,
    refetch: fetchTopRisk,
  };
}

// Hook for industry data
export function useIndustryData() {
  const [state, setState] = useState<UseResearchDataState>({
    isLoading: false,
    error: null,
    isInitialized: false,
  });
  const [industries, setIndustries] = useState<any[]>([]);

  const fetchIndustries = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await ensureServiceInitialized();
      const service = getResearchService();
      const industryData = await service.getIndustryData();
      
      setIndustries(industryData);
      setState(prev => ({ ...prev, isLoading: false, isInitialized: true }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch industry data';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      setIndustries([]);
    }
  }, []);

  useEffect(() => {
    fetchIndustries();
  }, [fetchIndustries]);

  return {
    ...state,
    industries,
    refetch: fetchIndustries,
  };
}

// Hook for task automation data
export function useTaskAutomationData() {
  const [state, setState] = useState<UseResearchDataState>({
    isLoading: false,
    error: null,
    isInitialized: false,
  });
  const [tasks, setTasks] = useState<any[]>([]);

  const fetchTasks = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await ensureServiceInitialized();
      const service = getResearchService();
      const taskData = await service.getTaskAutomationData();
      
      setTasks(taskData);
      setState(prev => ({ ...prev, isLoading: false, isInitialized: true }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch task automation data';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      setTasks([]);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    ...state,
    tasks,
    refetch: fetchTasks,
  };
}

// Hook for service health
export function useServiceHealth() {
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await ensureServiceInitialized();
        const service = getResearchService();
        const stats = service.getCacheStats();
        
        setHealth({
          status: 'healthy',
          initialized: true,
          cache: stats,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        setHealth({
          status: 'unhealthy',
          initialized: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        });
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return health;
}