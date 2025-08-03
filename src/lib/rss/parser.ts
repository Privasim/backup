import Parser from 'rss-parser';
import { RSSArticle, RSSFeedData, FeedStatus } from './types';
import { debugLog } from '@/components/debug/DebugConsole';

export class RSSFeedService {
  private parser: Parser;
  private feedUrl: string = '';
  private lastUpdated: Date | null = null;
  private status: 'healthy' | 'error' | 'loading' = 'healthy';
  private lastError?: string;

  constructor() {
    this.parser = new Parser({
      customFields: {
        item: ['guid', 'category']
      }
    });
  }

  /**
   * Validate if a URL is a valid RSS feed
   */
  async validateFeedUrl(url: string): Promise<boolean> {
    try {
      debugLog.info('RSSFeedService', 'Validating RSS feed URL', { url });
      
      // Basic URL validation
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new Error('Invalid protocol. Only HTTP and HTTPS are supported.');
      }

      // Try to parse the feed
      const feed = await this.parser.parseURL(url);
      
      debugLog.success('RSSFeedService', 'RSS feed validation successful', {
        title: feed.title,
        itemCount: feed.items?.length || 0
      });
      
      return true;
    } catch (error) {
      debugLog.error('RSSFeedService', 'RSS feed validation failed', { url, error });
      return false;
    }
  }

  /**
   * Parse RSS feed from URL
   */
  async parseFeed(url: string): Promise<RSSFeedData> {
    try {
      this.status = 'loading';
      this.feedUrl = url;
      
      debugLog.info('RSSFeedService', 'Parsing RSS feed', { url });
      
      const feed = await this.parser.parseURL(url);
      
      // Transform feed items to our RSSArticle format
      const articles: RSSArticle[] = (feed.items || []).map((item, index) => ({
        id: item.guid || item.link || `${url}-${index}-${Date.now()}`,
        title: item.title || 'Untitled',
        description: item.contentSnippet || item.content || item.summary || '',
        link: item.link || '',
        pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
        author: item.creator || item.author,
        category: Array.isArray(item.category) ? item.category : item.category ? [item.category] : undefined,
        guid: item.guid,
        isSelected: false
      }));

      // Sort articles by publication date (newest first)
      articles.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

      const feedData: RSSFeedData = {
        title: feed.title || 'RSS Feed',
        description: feed.description || '',
        link: feed.link || url,
        lastBuildDate: feed.lastBuildDate ? new Date(feed.lastBuildDate) : new Date(),
        articles
      };

      this.lastUpdated = new Date();
      this.status = 'healthy';
      this.lastError = undefined;

      debugLog.success('RSSFeedService', 'RSS feed parsed successfully', {
        title: feedData.title,
        articleCount: articles.length,
        lastBuildDate: feedData.lastBuildDate
      });

      return feedData;
    } catch (error) {
      this.status = 'error';
      this.lastError = error instanceof Error ? error.message : 'Unknown error';
      
      debugLog.error('RSSFeedService', 'RSS feed parsing failed', { url, error });
      throw error;
    }
  }

  /**
   * Get current feed status
   */
  getStatus(): FeedStatus {
    return {
      status: this.status,
      lastUpdated: this.lastUpdated,
      lastError: this.lastError,
      articleCount: 0 // Will be updated by the store
    };
  }

  /**
   * Normalize URLs for deduplication
   */
  normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      // Remove tracking parameters and fragments
      urlObj.search = '';
      urlObj.hash = '';
      return urlObj.toString().toLowerCase();
    } catch {
      return url.toLowerCase();
    }
  }

  /**
   * Calculate similarity between two strings using simple algorithm
   */
  calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}

// Export singleton instance
export const rssFeedService = new RSSFeedService();