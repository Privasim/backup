import { useState, useCallback } from 'react';
import { useJobLossStore } from '@/store/useJobLossStore';
import { webSearchService } from '@/lib/websearch';
import { createNewsAnalyzer } from '@/lib/openrouter/analysis';
import { NewsItem } from '@/types/jobloss';

export const useJobLossTracker = () => {
  // Get state and actions from our store
  const {
    searchQuery,
    searchResults,
    isLoading,
    error,
    lastSearchedQuery,
    selectedItems,
    analysisResults,
    isAnalyzing,
    analysisError,
    setSearchQuery,
    setSearchResults,
    setLoading,
    setError,
    toggleItemSelection,
    selectAllItems,
    clearSelection,
    addAnalysisResult,
    setAnalyzing,
    setAnalysisError,
    clearAnalysis,
    reset,
  } = useJobLossStore();

  // State for API key management
  const [apiKey, setApiKey] = useState<string>('');
  const [isApiKeyValid, setIsApiKeyValid] = useState<boolean>(false);

  /**
   * Search for news articles based on the current query
   */
  const searchNews = useCallback(async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search term');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Perform the search
      const response = await webSearchService.search(searchQuery, {
        count: 20, // Get more results to allow for filtering
        freshness: 'month', // Get recent articles
      });

      // Transform to our NewsItem format
      const newsItems: NewsItem[] = response.results.map((result, index) => ({
        id: result.id || `result-${index}-${Date.now()}`,
        title: result.title,
        url: result.url,
        source: result.provider?.name || new URL(result.url).hostname,
        snippet: result.snippet,
        publishedAt: result.datePublished || new Date().toISOString(),
        isSelected: false,
      }));

      setSearchResults(newsItems);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Failed to fetch news. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, setError, setLoading, setSearchResults]);

  /**
   * Analyze selected news articles using OpenRouter
   */
  const analyzeSelected = useCallback(async () => {
    if (selectedItems.length === 0) {
      setAnalysisError('Please select at least one article to analyze');
      return;
    }

    if (!apiKey || !isApiKeyValid) {
      setAnalysisError('Please provide a valid API key');
      return;
    }

    try {
      setAnalyzing(true);
      setAnalysisError(null);
      
      const analyzer = createNewsAnalyzer(apiKey, {
        model: 'anthropic/claude-3-opus',
        temperature: 0.3,
      });

      // Get the selected articles
      const articlesToAnalyze = searchResults.filter(article => 
        selectedItems.includes(article.id)
      );

      // Process articles one by one to avoid rate limiting
      for (const article of articlesToAnalyze) {
        try {
          const result = await analyzer.analyzeArticle(article);
          addAnalysisResult(result);
        } catch (err) {
          console.error(`Failed to analyze article ${article.id}:`, err);
          // Continue with next article even if one fails
        }
      }
    } catch (err) {
      console.error('Analysis failed:', err);
      setAnalysisError('Failed to analyze articles. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  }, [
    selectedItems, 
    apiKey, 
    isApiKeyValid, 
    searchResults, 
    setAnalyzing, 
    setAnalysisError, 
    addAnalysisResult
  ]);

  /**
   * Toggle selection of an article
   */
  const toggleSelectItem = useCallback((id: string) => {
    toggleItemSelection(id);
  }, [toggleItemSelection]);

  /**
   * Select or deselect all articles
   */
  const toggleSelectAll = useCallback((select: boolean) => {
    selectAllItems(select);
  }, [selectAllItems]);

  /**
   * Validate and set the API key
   */
  const validateAndSetApiKey = useCallback((key: string) => {
    setApiKey(key);
    // Simple validation - in a real app, you might want to validate with the API
    const isValid = key.startsWith('sk-or-v1-') && key.length > 30;
    setIsApiKeyValid(isValid);
    return isValid;
  }, []);

  return {
    // State
    searchQuery,
    searchResults,
    isLoading,
    error,
    lastSearchedQuery,
    selectedItems,
    analysisResults: Object.values(analysisResults),
    isAnalyzing,
    analysisError,
    apiKey,
    isApiKeyValid,
    
    // Actions
    setSearchQuery,
    searchNews,
    toggleSelectItem,
    toggleSelectAll,
    analyzeSelected,
    setApiKey: validateAndSetApiKey,
    clearSelection,
    clearAnalysis,
    reset,
  };
};
