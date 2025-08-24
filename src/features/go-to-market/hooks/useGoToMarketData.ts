import { useState, useCallback, useEffect, useMemo } from 'react';
import { useChatbox } from '@/components/chatbox/ChatboxProvider';
import { useImplementationPlan } from '@/features/implementation-plan/useImplementationPlan';
import { 
  GoToMarketData, 
  GoToMarketStatus, 
  MarketingStrategy, 
  SalesChannel, 
  PricingStrategy,
  GoToMarketProgress,
  ToolRecommendation
} from '../types';
import { BusinessSuggestion } from '@/components/chatbox/types';

const STORAGE_KEY = 'go-to-market-data';
const PROGRESS_STORAGE_KEY = 'go-to-market-progress';

const defaultProgress: GoToMarketProgress = {
  completedStrategies: [],
  completedChannels: [],
  completedPricingTasks: [],
  overallProgress: 0,
  lastUpdated: new Date().toISOString()
};

export function useGoToMarketData() {
  const { businessSuggestions } = useChatbox();
  const { plan: implementationPlan } = useImplementationPlan();
  
  const [data, setData] = useState<GoToMarketData>({
    marketingStrategies: [],
    salesChannels: [],
    pricingStrategies: [],
    recommendedTools: [],
    progress: defaultProgress,
    status: 'idle'
  });

  const [selectedSuggestion, setSelectedSuggestion] = useState<BusinessSuggestion | undefined>();

  // Load progress from localStorage
  const loadProgress = useCallback((): GoToMarketProgress => {
    if (typeof window === 'undefined') return defaultProgress;
    
    try {
      const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultProgress;
    } catch {
      return defaultProgress;
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = useCallback((progress: GoToMarketProgress) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.warn('Failed to save go-to-market progress:', error);
    }
  }, []);

  // Calculate overall progress
  const calculateProgress = useCallback((
    strategies: MarketingStrategy[],
    channels: SalesChannel[],
    completedStrategies: string[],
    completedChannels: string[]
  ): number => {
    const totalItems = strategies.length + channels.length;
    if (totalItems === 0) return 0;
    
    const completedItems = completedStrategies.length + completedChannels.length;
    return Math.round((completedItems / totalItems) * 100);
  }, []);

  // Mark strategy as completed
  const markStrategyCompleted = useCallback((strategyId: string) => {
    setData(prev => {
      const newProgress = {
        ...prev.progress,
        completedStrategies: prev.progress.completedStrategies.includes(strategyId)
          ? prev.progress.completedStrategies.filter(id => id !== strategyId)
          : [...prev.progress.completedStrategies, strategyId],
        lastUpdated: new Date().toISOString()
      };

      newProgress.overallProgress = calculateProgress(
        prev.marketingStrategies,
        prev.salesChannels,
        newProgress.completedStrategies,
        newProgress.completedChannels
      );

      saveProgress(newProgress);

      return {
        ...prev,
        progress: newProgress,
        marketingStrategies: prev.marketingStrategies.map(strategy =>
          strategy.id === strategyId
            ? { ...strategy, completed: !strategy.completed }
            : strategy
        )
      };
    });
  }, [calculateProgress, saveProgress]);

  // Mark channel as completed
  const markChannelCompleted = useCallback((channelId: string) => {
    setData(prev => {
      const newProgress = {
        ...prev.progress,
        completedChannels: prev.progress.completedChannels.includes(channelId)
          ? prev.progress.completedChannels.filter(id => id !== channelId)
          : [...prev.progress.completedChannels, channelId],
        lastUpdated: new Date().toISOString()
      };

      newProgress.overallProgress = calculateProgress(
        prev.marketingStrategies,
        prev.salesChannels,
        newProgress.completedStrategies,
        newProgress.completedChannels
      );

      saveProgress(newProgress);

      return {
        ...prev,
        progress: newProgress
      };
    });
  }, [calculateProgress, saveProgress]);

  // Clear all data
  const clearData = useCallback(() => {
    setData({
      marketingStrategies: [],
      salesChannels: [],
      pricingStrategies: [],
      recommendedTools: [],
      progress: defaultProgress,
      status: 'idle'
    });
    setSelectedSuggestion(undefined);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(PROGRESS_STORAGE_KEY);
    }
  }, []);

  // Set loading state
  const setLoading = useCallback(() => {
    setData(prev => ({ ...prev, status: 'loading', error: undefined }));
  }, []);

  // Set error state
  const setError = useCallback((error: string) => {
    setData(prev => ({ ...prev, status: 'error', error }));
  }, []);

  // Set success state with data
  const setSuccess = useCallback((
    strategies: MarketingStrategy[],
    channels: SalesChannel[],
    pricing: PricingStrategy[],
    tools: ToolRecommendation[] = []
  ) => {
    const progress = loadProgress();
    
    // Update strategies with completion status
    const updatedStrategies = strategies.map(strategy => ({
      ...strategy,
      completed: progress.completedStrategies.includes(strategy.id)
    }));

    const newData = {
      selectedSuggestion,
      marketingStrategies: updatedStrategies,
      salesChannels: channels,
      pricingStrategies: pricing,
      recommendedTools: tools,
      progress: {
        ...progress,
        overallProgress: calculateProgress(
          updatedStrategies,
          channels,
          progress.completedStrategies,
          progress.completedChannels
        )
      },
      status: 'success' as GoToMarketStatus,
      error: undefined
    };

    setData(newData);
  }, [selectedSuggestion, loadProgress, calculateProgress]);

  // Available business suggestions
  const availableSuggestions = useMemo(() => {
    return businessSuggestions.suggestions || [];
  }, [businessSuggestions.suggestions]);

  // Check if we have a selected suggestion
  const hasSelectedSuggestion = useMemo(() => {
    return !!selectedSuggestion;
  }, [selectedSuggestion]);

  // Check if we have generated content
  const hasContent = useMemo(() => {
    return data.marketingStrategies.length > 0 || 
           data.salesChannels.length > 0 || 
           data.pricingStrategies.length > 0;
  }, [data.marketingStrategies, data.salesChannels, data.pricingStrategies]);

  // Load progress on mount
  useEffect(() => {
    const progress = loadProgress();
    setData(prev => ({ ...prev, progress }));
  }, [loadProgress]);

  // Auto-select first suggestion if available and none selected
  useEffect(() => {
    if (!selectedSuggestion && availableSuggestions.length > 0) {
      setSelectedSuggestion(availableSuggestions[0]);
    }
  }, [selectedSuggestion, availableSuggestions]);

  return {
    // State
    data,
    selectedSuggestion,
    availableSuggestions,
    hasSelectedSuggestion,
    hasContent,
    implementationPlan,
    
    // Actions
    setSelectedSuggestion,
    markStrategyCompleted,
    markChannelCompleted,
    clearData,
    setLoading,
    setError,
    setSuccess
  };
}