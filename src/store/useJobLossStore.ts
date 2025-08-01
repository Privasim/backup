import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NewsItem, AnalysisResult } from '@/types/jobloss';

interface JobLossState {
  // Search state
  searchQuery: string;
  searchResults: NewsItem[];
  isLoading: boolean;
  error: string | null;
  lastSearchedQuery: string;
  
  // Selection state
  selectedItems: string[]; // Array of news item IDs
  
  // Analysis state
  analysisResults: Record<string, AnalysisResult>; // articleId -> AnalysisResult
  isAnalyzing: boolean;
  analysisError: string | null;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: NewsItem[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Selection actions
  toggleItemSelection: (id: string) => void;
  selectAllItems: (select: boolean) => void;
  clearSelection: () => void;
  
  // Analysis actions
  addAnalysisResult: (result: AnalysisResult) => void;
  setAnalyzing: (isAnalyzing: boolean) => void;
  setAnalysisError: (error: string | null) => void;
  clearAnalysis: () => void;
  
  // Reset entire state
  reset: () => void;
}

const initialState = {
  searchQuery: '',
  searchResults: [],
  isLoading: false,
  error: null,
  lastSearchedQuery: '',
  selectedItems: [],
  analysisResults: {},
  isAnalyzing: false,
  analysisError: null,
};

export const useJobLossStore = create<JobLossState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      setSearchResults: (results) => set({ 
        searchResults: results,
        lastSearchedQuery: get().searchQuery,
        error: null,
      }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      toggleItemSelection: (id) => 
        set((state) => ({
          selectedItems: state.selectedItems.includes(id)
            ? state.selectedItems.filter(itemId => itemId !== id)
            : [...state.selectedItems, id],
        })),
      
      selectAllItems: (select) => 
        set((state) => ({
          selectedItems: select 
            ? state.searchResults.map(item => item.id)
            : [],
        })),
      
      clearSelection: () => set({ selectedItems: [] }),
      
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
      
      reset: () => set(initialState),
    }),
    {
      name: 'job-loss-storage', // name for localStorage
      partialize: (state) => ({
        // Persist only specific parts of the state
        searchQuery: state.searchQuery,
        lastSearchedQuery: state.lastSearchedQuery,
        selectedItems: state.selectedItems,
        analysisResults: state.analysisResults,
      }),
    }
  )
);

// Selector hooks for optimized re-renders
export const useSearchState = () => {
  return useJobLossStore((state) => ({
    searchQuery: state.searchQuery,
    searchResults: state.searchResults,
    isLoading: state.isLoading,
    error: state.error,
    lastSearchedQuery: state.lastSearchedQuery,
    setSearchQuery: state.setSearchQuery,
    setSearchResults: state.setSearchResults,
    setLoading: state.setLoading,
    setError: state.setError,
  }));
};

export const useSelectionState = () => {
  return useJobLossStore((state) => ({
    selectedItems: state.selectedItems,
    toggleItemSelection: state.toggleItemSelection,
    selectAllItems: state.selectAllItems,
    clearSelection: state.clearSelection,
  }));
};

export const useAnalysisState = () => {
  return useJobLossStore((state) => ({
    analysisResults: state.analysisResults,
    isAnalyzing: state.isAnalyzing,
    analysisError: state.analysisError,
    addAnalysisResult: state.addAnalysisResult,
    setAnalyzing: state.setAnalyzing,
    setAnalysisError: state.setAnalysisError,
    clearAnalysis: state.clearAnalysis,
  }));
};
