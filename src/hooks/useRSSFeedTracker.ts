import { useState, useCallback, useEffect, useMemo } from 'react';
import { useJobLossStore } from '@/store/useJobLossStore';
import { rssFeedService, relevanceFilterService, deduplicationService } from '@/lib/rss';
import { RSSArticle, AnalysisResult } from '@/lib/rss/types';
import { debugLog } from '@/components/debug/DebugConsole';

export const useRSSFeedTracker = () => {
  // Get state directly from store to avoid selector issues
  const store = useJobLossStore();
  
  // Local state for API key management
  const [apiKey, setApiKey] = useState<string>('');
  const [isApiKeyValid, setIsApiKeyValid] = useState<boolean>(false);
  
  // Memoized selectors to prevent unnecessary re-renders
  const feedConfig = useMemo(() => store.feedConfig, [store.feedConfig]);
  const feedStatus = useMemo(() => store.feedStatus, [store.feedStatus]);
  const articles = useMemo(() => store.articles, [store.articles]);
  const filteredArticles = useMemo(() => store.filteredArticles, [store.filteredArticles]);
  const selectedArticles = useMemo(() => store.selectedArticles, [store.selectedArticles]);
  const analysisResults = useMemo(() => Object.values(store.analysisResults), [store.analysisResults]);
  const isLoading = store.isLoading;
  const isAnalyzing = store.isAnalyzing;
  const error = store.error;
  const analysisError = store.analysisError;
  const showRelevantOnly = store.showRelevantOnly;
  const sortBy = store.sortBy;

  /**
   * Validate RSS feed URL
   */
  const validateFeedUrl = useCallback(async (url: string): Promise<boolean> => {
    try {
      store.setLoading(true);
      store.setError(null);
      
      const isValid = await rssFeedService.validateFeedUrl(url);
      
      if (isValid) {
        store.setFeedUrl(url);
        store.setFeedStatus({ status: 'healthy' });
      } else {
        store.setError('Invalid RSS feed URL. Please check the URL and try again.');
        store.setFeedStatus({ status: 'error', lastError: 'Invalid RSS feed URL' });
      }
      
      return isValid;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to validate RSS feed';
      store.setError(errorMessage);
      store.setFeedStatus({ status: 'error', lastError: errorMessage });
      return false;
    } finally {
      store.setLoading(false);
    }
  }, [store]);

  /**
   * Load articles from RSS feed
   */
  const loadArticles = useCallback(async () => {
    const currentFeedUrl = feedConfig.url;
    
    if (!currentFeedUrl) {
      store.setError('Please configure an RSS feed URL first');
      return;
    }

    try {
      store.setLoading(true);
      store.setError(null);
      store.setFeedStatus({ status: 'loading' });
      
      debugLog.info('RSSFeedTracker', 'Loading articles from RSS feed', {
        url: currentFeedUrl,
        maxArticles: feedConfig.maxArticles
      });
      
      // Parse RSS feed
      const feedData = await rssFeedService.parseFeed(currentFeedUrl);
      
      // Limit articles to max configured
      let processedArticles = feedData.articles.slice(0, feedConfig.maxArticles);
      
      // Apply deduplication
      processedArticles = deduplicationService.deduplicateArticles(processedArticles);
      
      // Apply relevance filtering if enabled
      if (feedConfig.filterRelevant) {
        processedArticles = relevanceFilterService.filterRelevantArticles(processedArticles);
      }
      
      // Update store
      store.setArticles(processedArticles);
      store.setFilteredArticles(processedArticles);
      store.setFeedStatus({
        status: 'healthy',
        lastUpdated: new Date(),
        articleCount: processedArticles.length
      });
      
      debugLog.success('RSSFeedTracker', 'Articles loaded successfully', {
        totalArticles: processedArticles.length,
        relevantArticles: processedArticles.filter(a => a.isJobLossRelated).length
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load RSS feed';
      store.setError(errorMessage);
      store.setFeedStatus({ 
        status: 'error', 
        lastError: errorMessage 
      });
      
      debugLog.error('RSSFeedTracker', 'Failed to load articles', { error });
    } finally {
      store.setLoading(false);
    }
  }, [feedConfig.url, feedConfig.maxArticles, feedConfig.filterRelevant, store]);

  /**
   * Filter and sort articles based on current settings
   */
  const applyFiltersAndSort = useCallback(() => {
    let filtered = [...articles];
    
    // Apply relevance filter
    if (showRelevantOnly) {
      filtered = filtered.filter(article => article.isJobLossRelated);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.pubDate.getTime() - a.pubDate.getTime();
        case 'relevance':
          return (b.relevanceScore || 0) - (a.relevanceScore || 0);
        case 'analysis':
          const aHasAnalysis = store.analysisResults[a.id] ? 1 : 0;
          const bHasAnalysis = store.analysisResults[b.id] ? 1 : 0;
          return bHasAnalysis - aHasAnalysis;
        default:
          return 0;
      }
    });
    
    store.setFilteredArticles(filtered);
  }, [articles, showRelevantOnly, sortBy, store.analysisResults, store.setFilteredArticles]);

  /**
   * Analyze selected articles using OpenRouter
   */
  const analyzeSelected = useCallback(async () => {
    if (selectedArticles.length === 0) {
      store.setAnalysisError('Please select at least one article to analyze');
      return;
    }

    if (!apiKey || !isApiKeyValid) {
      store.setAnalysisError('Please provide a valid OpenRouter API key');
      return;
    }

    try {
      store.setAnalyzing(true);
      store.setAnalysisError(null);
      
      debugLog.info('RSSFeedTracker', 'Starting analysis of selected articles', {
        selectedCount: selectedArticles.length
      });
      
      // Get selected articles
      const articlesToAnalyze = articles.filter(article => 
        selectedArticles.includes(article.id)
      );

      // Import OpenRouter client dynamically to avoid circular dependencies
      const { createOpenRouterClient } = await import('@/lib/openrouter/client');
      const client = createOpenRouterClient(apiKey);

      // Process articles one by one to avoid rate limiting
      for (const article of articlesToAnalyze) {
        try {
          debugLog.info('RSSFeedTracker', 'Analyzing article', {
            title: article.title.substring(0, 50) + '...'
          });
          
          // Create analysis prompt
          const prompt = `Analyze this job loss related news article and extract key information:

Title: ${article.title}
Description: ${article.description}
Link: ${article.link}
Published: ${article.pubDate.toISOString()}

Please provide a JSON response with the following structure:
{
  "impactLevel": "low|medium|high",
  "companies": ["company1", "company2"],
  "industries": ["industry1", "industry2"],
  "jobsAffected": number or null,
  "isAIRelated": boolean,
  "isAutomationRelated": boolean,
  "keyInsights": ["insight1", "insight2"],
  "confidence": 0.0-1.0,
  "sentiment": "positive|negative|neutral"
}`;

          const response = await client.chat.completions.create({
            model: 'anthropic/claude-3-haiku',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            max_tokens: 1000
          });

          const content = response.choices[0]?.message?.content;
          if (content) {
            try {
              const analysisData = JSON.parse(content);
              const result: AnalysisResult = {
                articleId: article.id,
                ...analysisData
              };
              
              store.addAnalysisResult(result);
              
              debugLog.success('RSSFeedTracker', 'Article analysis complete', {
                articleId: article.id,
                impactLevel: result.impactLevel,
                confidence: result.confidence
              });
            } catch (parseError) {
              debugLog.error('RSSFeedTracker', 'Failed to parse analysis result', {
                articleId: article.id,
                content,
                parseError
              });
            }
          }
        } catch (error) {
          debugLog.error('RSSFeedTracker', 'Failed to analyze article', {
            articleId: article.id,
            error
          });
          // Continue with next article even if one fails
        }
      }
      
      debugLog.success('RSSFeedTracker', 'Analysis batch complete', {
        processedCount: articlesToAnalyze.length
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      store.setAnalysisError(errorMessage);
      debugLog.error('RSSFeedTracker', 'Analysis batch failed', { error });
    } finally {
      store.setAnalyzing(false);
    }
  }, [selectedArticles, articles, apiKey, isApiKeyValid, store]);

  /**
   * Validate and set API key
   */
  const validateAndSetApiKey = useCallback((key: string) => {
    setApiKey(key);
    // Simple validation - in a real app, you might want to validate with the API
    const isValid = key.startsWith('sk-or-v1-') && key.length > 30;
    setIsApiKeyValid(isValid);
    return isValid;
  }, []);

  /**
   * Auto-refresh effect
   */
  useEffect(() => {
    if (feedConfig.url && feedConfig.refreshInterval > 0) {
      const interval = setInterval(() => {
        loadArticles();
      }, feedConfig.refreshInterval * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [feedConfig.url, feedConfig.refreshInterval, loadArticles]);

  /**
   * Apply filters when dependencies change
   */
  useEffect(() => {
    if (articles.length > 0) {
      applyFiltersAndSort();
    }
  }, [articles, showRelevantOnly, sortBy, store.analysisResults, applyFiltersAndSort]);

  return {
    // State
    feedConfig,
    feedStatus,
    articles: filteredArticles,
    selectedArticles,
    analysisResults,
    isLoading,
    isAnalyzing,
    error,
    analysisError,
    showRelevantOnly,
    sortBy,
    apiKey,
    isApiKeyValid,
    
    // Actions
    setFeedUrl: store.setFeedUrl,
    setFeedConfig: store.setFeedConfig,
    validateFeedUrl,
    loadArticles,
    toggleArticleSelection: store.toggleArticleSelection,
    selectAllArticles: store.selectAllArticles,
    clearSelection: store.clearSelection,
    analyzeSelected,
    setShowRelevantOnly: store.setShowRelevantOnly,
    setSortBy: store.setSortBy,
    updateSettings: store.setFeedConfig,
    setApiKey: validateAndSetApiKey,
    clearAnalysis: store.clearAnalysis,
    reset: store.reset,
  };
};