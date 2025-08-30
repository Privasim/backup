import { useState, useCallback, useEffect, useMemo } from 'react';
import { useJobLossStore } from '@/store/useJobLossStore';
import { rssFeedService, relevanceFilterService, deduplicationService } from '@/lib/rss';
import { RSSArticle, AnalysisResult } from '@/lib/rss/types';
import { FEATURE_FLAGS } from '@/config/feature-flags';

/**
 * Hook for managing job loss tracking functionality
 * This is a simplified version that delegates to useRSSFeedTracker
 */
export const useJobLossTracker = () => {
  // Inert early return when feature is disabled
  if (!FEATURE_FLAGS.JOB_LOSS_TRACKER_ENABLED) {
    return {
      articles: [] as RSSArticle[],
      selectedArticles: [] as string[],
      analysisResults: [] as AnalysisResult[],
      isLoading: false,
      error: 'Feature disabled',

      searchArticles: async (_query: string, _filters?: any) => {},
      toggleSelection: (_articleId: string) => {},
      toggleSelectAll: () => {},
      analyzeSelected: async () => {},
      clearSelection: () => {},
      reset: () => {},

      setFeedUrl: (_url: string) => {},
      setFeedConfig: (_cfg: any) => {},
      loadArticles: (_articles: RSSArticle[]) => {},
      setShowRelevantOnly: (_val: boolean) => {},
      setSortBy: (_sort: 'date' | 'relevance' | 'analysis') => {},
    };
  }

  // Get state from store
  const store = useJobLossStore();
  
  // Local state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Memoized selectors
  const articles = useMemo(() => store.filteredArticles, [store.filteredArticles]);
  const selectedArticles = useMemo(() => store.selectedArticles, [store.selectedArticles]);
  const analysisResults = useMemo(() => Object.values(store.analysisResults), [store.analysisResults]);

  /**
   * Search for job loss articles
   */
  const searchArticles = useCallback(async (query: string, filters?: any) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Filter existing articles based on query
      const filtered = store.articles.filter(article => 
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.description.toLowerCase().includes(query.toLowerCase())
      );
      
      store.setFilteredArticles(filtered);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [store]);

  /**
   * Toggle article selection
   */
  const toggleSelection = useCallback((articleId: string) => {
    store.toggleArticleSelection(articleId);
  }, [store]);

  /**
   * Toggle select all articles
   */
  const toggleSelectAll = useCallback(() => {
    if (selectedArticles.length === articles.length) {
      store.clearSelection();
    } else {
      store.selectAllArticles();
    }
  }, [selectedArticles.length, articles.length, store]);

  /**
   * Analyze selected articles
   */
  const analyzeSelected = useCallback(async () => {
    if (selectedArticles.length === 0) {
      setError('Please select at least one article to analyze');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // This would typically call an analysis service
      // For now, we'll create mock analysis results
      const mockResults: AnalysisResult[] = selectedArticles.map(articleId => ({
        articleId,
        impactLevel: 'medium' as const,
        companies: ['Example Corp'],
        industries: ['Technology'],
        jobsAffected: Math.floor(Math.random() * 1000) + 100,
        isAIRelated: Math.random() > 0.5,
        isAutomationRelated: Math.random() > 0.5,
        keyInsights: ['Job market impact', 'Industry disruption'],
        confidence: 0.8,
        sentiment: 'negative' as const
      }));

      // Add results to store
      mockResults.forEach(result => {
        store.addAnalysisResult(result);
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [selectedArticles, store]);

  /**
   * Clear all selections
   */
  const clearSelection = useCallback(() => {
    store.clearSelection();
  }, [store]);

  /**
   * Reset tracker state
   */
  const reset = useCallback(() => {
    store.reset();
    setError(null);
  }, [store]);

  return {
    // State
    articles,
    selectedArticles,
    analysisResults,
    isLoading,
    error,
    
    // Actions
    searchArticles,
    toggleSelection,
    toggleSelectAll,
    analyzeSelected,
    clearSelection,
    reset,
    
    // Store actions (for compatibility)
    setFeedUrl: store.setFeedUrl,
    setFeedConfig: store.setFeedConfig,
    loadArticles: store.setArticles,
    setShowRelevantOnly: store.setShowRelevantOnly,
    setSortBy: store.setSortBy,
  };
};