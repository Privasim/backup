import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RSSArticle, FeedConfig, FeedStatus, AnalysisResult } from '@/lib/rss/types';

interface JobLossState {
  // RSS Feed Configuration
  feedConfig: FeedConfig;
  feedStatus: FeedStatus;
  
  // Articles
  articles: RSSArticle[];
  selectedArticles: string[];
  filteredArticles: RSSArticle[];
  
  // Analysis
  analysisResults: Record<string, AnalysisResult>;
  isAnalyzing: boolean;
  analysisError: string | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  showRelevantOnly: boolean;
  sortBy: 'date' | 'relevance' | 'analysis';
  
  // Settings
  autoRefresh: boolean;
  refreshInterval: number;
  maxArticles: number;
  
  // Actions
  setFeedUrl: (url: string) => void;
  setFeedConfig: (config: Partial<FeedConfig>) => void;
  setFeedStatus: (status: Partial<FeedStatus>) => void;
  setArticles: (articles: RSSArticle[]) => void;
  setFilteredArticles: (articles: RSSArticle[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Selection actions
  toggleArticleSelection: (id: string) => void;
  selectAllArticles: (select: boolean) => void;
  clearSelection: () => void;
  
  // Analysis actions
  addAnalysisResult: (result: AnalysisResult) => void;
  setAnalyzing: (isAnalyzing: boolean) => void;
  setAnalysisError: (error: string | null) => void;
  clearAnalysis: () => void;
  
  // Filtering actions
  setShowRelevantOnly: (show: boolean) => void;
  setSortBy: (sort: 'date' | 'relevance' | 'analysis') => void;
  
  // Settings actions
  updateSettings: (settings: Partial<FeedConfig>) => void;
  
  // Reset entire state
  reset: () => void;
}

const initialState = {
  feedConfig: {
    url: '',
    refreshInterval: 15, // minutes
    maxArticles: 50,
    filterRelevant: true,
    autoAnalyze: false
  },
  feedStatus: {
    status: 'healthy' as const,
    lastUpdated: null,
    articleCount: 0
  },
  articles: [],
  selectedArticles: [],
  filteredArticles: [],
  analysisResults: {},
  isAnalyzing: false,
  analysisError: null,
  isLoading: false,
  error: null,
  showRelevantOnly: true,
  sortBy: 'date' as const,
  autoRefresh: true,
  refreshInterval: 15,
  maxArticles: 50,
};

export const useJobLossStore = create<JobLossState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setFeedUrl: (url) => 
        set((state) => ({
          feedConfig: { ...state.feedConfig, url },
          error: null,
        })),
      
      setFeedConfig: (config) => 
        set((state) => ({
          feedConfig: { ...state.feedConfig, ...config },
        })),
      
      setFeedStatus: (status) => 
        set((state) => ({
          feedStatus: { ...state.feedStatus, ...status },
        })),
      
      setArticles: (articles) => set({ 
        articles,
        error: null,
      }),
      
      setFilteredArticles: (filteredArticles) => set({ filteredArticles }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      toggleArticleSelection: (id) => 
        set((state) => ({
          selectedArticles: state.selectedArticles.includes(id)
            ? state.selectedArticles.filter(articleId => articleId !== id)
            : [...state.selectedArticles, id],
        })),
      
      selectAllArticles: (select) => 
        set((state) => ({
          selectedArticles: select 
            ? state.filteredArticles.map(article => article.id)
            : [],
        })),
      
      clearSelection: () => set({ selectedArticles: [] }),
      
      addAnalysisResult: (result) => 
        set((state) => ({
          analysisResults: {
            ...state.analysisResults,
            [result.articleId]: result,
          },
        })),
      
      setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
      
      setAnalysisError: (analysisError) => set({ analysisError }),
      
      clearAnalysis: () => set({ 
        analysisResults: {},
        analysisError: null,
      }),
      
      setShowRelevantOnly: (showRelevantOnly) => set({ showRelevantOnly }),
      
      setSortBy: (sortBy) => set({ sortBy }),
      
      updateSettings: (settings) => 
        set((state) => ({
          feedConfig: { ...state.feedConfig, ...settings },
          autoRefresh: settings.refreshInterval !== undefined ? true : state.autoRefresh,
          refreshInterval: settings.refreshInterval || state.refreshInterval,
          maxArticles: settings.maxArticles || state.maxArticles,
        })),
      
      reset: () => set(initialState),
    }),
    {
      name: 'job-loss-rss-storage', // name for localStorage
      partialize: (state) => ({
        // Persist only specific parts of the state
        feedConfig: state.feedConfig,
        selectedArticles: state.selectedArticles,
        analysisResults: state.analysisResults,
        showRelevantOnly: state.showRelevantOnly,
        sortBy: state.sortBy,
        autoRefresh: state.autoRefresh,
      }),
    }
  )
);

// Memoized selector hooks for optimized re-renders
export const useFeedState = () => {
  return useJobLossStore(
    (state) => ({
      feedConfig: state.feedConfig,
      feedStatus: state.feedStatus,
      articles: state.articles,
      filteredArticles: state.filteredArticles,
      isLoading: state.isLoading,
      error: state.error,
      setFeedUrl: state.setFeedUrl,
      setFeedConfig: state.setFeedConfig,
      setFeedStatus: state.setFeedStatus,
      setArticles: state.setArticles,
      setFilteredArticles: state.setFilteredArticles,
      setLoading: state.setLoading,
      setError: state.setError,
    }),
    (a, b) => 
      a.feedConfig === b.feedConfig &&
      a.feedStatus === b.feedStatus &&
      a.articles === b.articles &&
      a.filteredArticles === b.filteredArticles &&
      a.isLoading === b.isLoading &&
      a.error === b.error
  );
};

export const useSelectionState = () => {
  return useJobLossStore(
    (state) => ({
      selectedArticles: state.selectedArticles,
      toggleArticleSelection: state.toggleArticleSelection,
      selectAllArticles: state.selectAllArticles,
      clearSelection: state.clearSelection,
    }),
    (a, b) => a.selectedArticles === b.selectedArticles
  );
};

export const useAnalysisState = () => {
  return useJobLossStore(
    (state) => ({
      analysisResults: state.analysisResults,
      isAnalyzing: state.isAnalyzing,
      analysisError: state.analysisError,
      addAnalysisResult: state.addAnalysisResult,
      setAnalyzing: state.setAnalyzing,
      setAnalysisError: state.setAnalysisError,
      clearAnalysis: state.clearAnalysis,
    }),
    (a, b) => 
      a.analysisResults === b.analysisResults &&
      a.isAnalyzing === b.isAnalyzing &&
      a.analysisError === b.analysisError
  );
};

export const useFilterState = () => {
  return useJobLossStore(
    (state) => ({
      showRelevantOnly: state.showRelevantOnly,
      sortBy: state.sortBy,
      setShowRelevantOnly: state.setShowRelevantOnly,
      setSortBy: state.setSortBy,
    }),
    (a, b) => 
      a.showRelevantOnly === b.showRelevantOnly &&
      a.sortBy === b.sortBy
  );
};
