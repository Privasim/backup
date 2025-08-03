import { useState, useCallback, useEffect } from 'react';
import { useJobLossStore, useFeedState, useSelectionState, useAnalysisState, useFilterState } from '@/store/useJobLossStore';
import { rssFeedService, relevanceFilterService, deduplicationService } from '@/lib/rss';
import { RSSArticle, AnalysisResult } from '@/lib/rss/types';
import { debugLog } from '@/components/debug/DebugConsole';

export const useRSSFeedTracker = () => {
  // Get state and actions from store
  const feedState = useFeedState();
  const selectionState = useSelectionState();
  const analysisState = useAnalysisState();
  const filterState = useFilterState();
  
  // Local state for API key management
  const [apiKey, setApiKey] = useState<string>('');
  const [isApiKeyValid, setIsApiKeyValid] = useState<boolean>(false);

  /**
   * Validate RSS feed URL
   */
  const validateFeedUrl = useCallback(async (url: string): Promise<boolean> => {
    try {
      feedState.setLoading(true);
      feedState.setError(null);
      
      const isValid = await rssFeedService.validateFeedUrl(url);
      
      if (isValid) {
        feedState.setFeedUrl(url);
        feedState.setFeedStatus({ status: 'healthy' });
      } else {
        feedState.setError('Invalid RSS feed URL. Please check the URL and try again.');
        feedState.setFeedStatus({ status: 'error', lastError: 'Invalid RSS feed URL' });
      }
      
      return isValid;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to validate RSS feed';
      feedState.setError(errorMessage);
      feedState.setFeedStatus({ status: 'error', lastError: errorMessage });
      return false;
    } finally {
      feedState.setLoading(false);
    }
  }, [feedState]);

  /**
   * Load articles from RSS feed
   */
  const loadArticles = useCallback(async () => {
    if (!feedState.feedConfig.url) {
      feedState.setError('Please configure an RSS feed URL first');
      return;
    }

    try {
      feedState.setLoading(true);
      feedState.setError(null);
      feedState.setFeedStatus({ status: 'loading' });
      
      debugLog.info('RSSFeedTracker', 'Loading articles from RSS feed', {
        url: feedState.feedConfig.url,
        maxArticles: feedState.feedConfig.maxArticles
      });
      
      // Parse RSS feed
      const feedData = await rssFeedService.parseFeed(feedState.feedConfig.url);
      
      // Limit articles to max configured
      let articles = feedData.articles.slice(0, feedState.feedConfig.maxArticles);
      
      // Apply deduplication
      articles = deduplicationService.deduplicateArticles(articles);
      
      // Apply relevance filtering if enabled
      if (feedState.feedConfig.filterRelevant) {
        articles = relevanceFilterService.filterRelevantArticles(articles);
      }
      
      // Update store
      feedState.setArticles(articles);
      feedState.setFilteredArticles(articles);
      feedState.setFeedStatus({
        status: 'healthy',
        lastUpdated: new Date(),
        articleCount: articles.length
      });
      
      debugLog.success('RSSFeedTracker', 'Articles loaded successfully', {
        totalArticles: articles.length,
        relevantArticles: articles.filter(a => a.isJobLossRelated).length
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load RSS feed';
      feedState.setError(errorMessage);
      feedState.setFeedStatus({ 
        status: 'error', 
        lastError: errorMessage 
      });
      
      debugLog.error('RSSFeedTracker', 'Failed to load articles', { error });
    } finally {
      feedState.setLoading(false);
    }
  }, [feedState]);

  /**
   * Filter and sort articles based on current settings
   */
  const applyFiltersAndSort = useCallback(() => {
    let filtered = [...feedState.articles];
    
    // Apply relevance filter
    if (filterState.showRelevantOnly) {
      filtered = filtered.filter(article => article.isJobLossRelated);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (filterState.sortBy) {
        case 'date':
          return b.pubDate.getTime() - a.pubDate.getTime();
        case 'relevance':
          return (b.relevanceScore || 0) - (a.relevanceScore || 0);
        case 'analysis':
          const aHasAnalysis = analysisState.analysisResults[a.id] ? 1 : 0;
          const bHasAnalysis = analysisState.analysisResults[b.id] ? 1 : 0;
          return bHasAnalysis - aHasAnalysis;
        default:
          return 0;
      }
    });
    
    feedState.setFilteredArticles(filtered);
  }, [feedState, filterState, analysisState.analysisResults]);

  /**
   * Analyze selected articles using OpenRouter
   */
  const analyzeSelected = useCallback(async () => {
    if (selectionState.selectedArticles.length === 0) {
      analysisState.setAnalysisError('Please select at least one article to analyze');
      return;
    }

    if (!apiKey || !isApiKeyValid) {
      analysisState.setAnalysisError('Please provide a valid OpenRouter API key');
      return;
    }

    try {
      analysisState.setAnalyzing(true);
      analysisState.setAnalysisError(null);
      
      debugLog.info('RSSFeedTracker', 'Starting analysis of selected articles', {
        selectedCount: selectionState.selectedArticles.length
      });
      
      // Get selected articles
      const articlesToAnalyze = feedState.articles.filter(article => 
        selectionState.selectedArticles.includes(article.id)
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
              
              analysisState.addAnalysisResult(result);
              
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
      analysisState.setAnalysisError(errorMessage);
      debugLog.error('RSSFeedTracker', 'Analysis batch failed', { error });
    } finally {
      analysisState.setAnalyzing(false);
    }
  }, [selectionState.selectedArticles, feedState.articles, apiKey, isApiKeyValid, analysisState]);

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
    if (feedState.feedConfig.url && feedState.feedConfig.refreshInterval > 0) {
      const interval = setInterval(() => {
        loadArticles();
      }, feedState.feedConfig.refreshInterval * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [feedState.feedConfig.url, feedState.feedConfig.refreshInterval, loadArticles]);

  /**
   * Apply filters when dependencies change
   */
  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  return {
    // State
    feedConfig: feedState.feedConfig,
    feedStatus: feedState.feedStatus,
    articles: feedState.filteredArticles,
    selectedArticles: selectionState.selectedArticles,
    analysisResults: Object.values(analysisState.analysisResults),
    isLoading: feedState.isLoading,
    isAnalyzing: analysisState.isAnalyzing,
    error: feedState.error,
    analysisError: analysisState.analysisError,
    showRelevantOnly: filterState.showRelevantOnly,
    sortBy: filterState.sortBy,
    apiKey,
    isApiKeyValid,
    
    // Actions
    setFeedUrl: feedState.setFeedUrl,
    setFeedConfig: feedState.setFeedConfig,
    validateFeedUrl,
    loadArticles,
    toggleArticleSelection: selectionState.toggleArticleSelection,
    selectAllArticles: selectionState.selectAllArticles,
    clearSelection: selectionState.clearSelection,
    analyzeSelected,
    setShowRelevantOnly: filterState.setShowRelevantOnly,
    setSortBy: filterState.setSortBy,
    updateSettings: feedState.setFeedConfig,
    setApiKey: validateAndSetApiKey,
    clearAnalysis: analysisState.clearAnalysis,
    reset: useJobLossStore.getState().reset,
  };
};