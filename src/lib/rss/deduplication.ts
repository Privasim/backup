import { RSSArticle, DeduplicationConfig } from './types';
import { rssFeedService } from './parser';
import { debugLog } from '@/components/debug/DebugConsole';

export class DeduplicationService {
  private defaultConfig: DeduplicationConfig = {
    titleSimilarityThreshold: 0.85,
    linkNormalization: true,
    timeWindowHours: 48,
    guidComparison: true
  };

  /**
   * Remove duplicate articles from array
   */
  deduplicateArticles(articles: RSSArticle[], config?: DeduplicationConfig): RSSArticle[] {
    const activeConfig = config || this.defaultConfig;
    
    debugLog.info('DeduplicationService', 'Starting deduplication process', {
      totalArticles: articles.length,
      config: activeConfig
    });
    
    const uniqueArticles: RSSArticle[] = [];
    const seenGuids = new Set<string>();
    const seenLinks = new Set<string>();
    
    for (const article of articles) {
      let isDuplicate = false;
      
      // Check GUID duplicates first (most reliable)
      if (activeConfig.guidComparison && article.guid) {
        if (seenGuids.has(article.guid)) {
          isDuplicate = true;
        } else {
          seenGuids.add(article.guid);
        }
      }
      
      // Check link duplicates
      if (!isDuplicate && article.link) {
        const normalizedLink = activeConfig.linkNormalization 
          ? rssFeedService.normalizeUrl(article.link)
          : article.link;
          
        if (seenLinks.has(normalizedLink)) {
          isDuplicate = true;
        } else {
          seenLinks.add(normalizedLink);
        }
      }
      
      // Check title similarity within time window
      if (!isDuplicate) {
        const timeWindow = activeConfig.timeWindowHours * 60 * 60 * 1000;
        const articleTime = article.pubDate.getTime();
        
        for (const existingArticle of uniqueArticles) {
          const timeDiff = Math.abs(articleTime - existingArticle.pubDate.getTime());
          
          if (timeDiff <= timeWindow) {
            const similarity = rssFeedService.calculateSimilarity(
              article.title.toLowerCase(),
              existingArticle.title.toLowerCase()
            );
            
            if (similarity >= activeConfig.titleSimilarityThreshold) {
              isDuplicate = true;
              debugLog.info('DeduplicationService', 'Found duplicate by title similarity', {
                original: existingArticle.title.substring(0, 50) + '...',
                duplicate: article.title.substring(0, 50) + '...',
                similarity: similarity.toFixed(3)
              });
              break;
            }
          }
        }
      }
      
      if (!isDuplicate) {
        uniqueArticles.push(article);
      }
    }
    
    const duplicatesRemoved = articles.length - uniqueArticles.length;
    
    debugLog.success('DeduplicationService', 'Deduplication complete', {
      originalCount: articles.length,
      uniqueCount: uniqueArticles.length,
      duplicatesRemoved,
      deduplicationRate: `${((duplicatesRemoved / articles.length) * 100).toFixed(1)}%`
    });
    
    return uniqueArticles;
  }

  /**
   * Check if two articles are duplicates
   */
  areArticlesDuplicate(article1: RSSArticle, article2: RSSArticle, config?: DeduplicationConfig): boolean {
    const activeConfig = config || this.defaultConfig;
    
    // Check GUID
    if (activeConfig.guidComparison && article1.guid && article2.guid) {
      if (article1.guid === article2.guid) {
        return true;
      }
    }
    
    // Check normalized links
    if (article1.link && article2.link) {
      const link1 = activeConfig.linkNormalization 
        ? rssFeedService.normalizeUrl(article1.link)
        : article1.link;
      const link2 = activeConfig.linkNormalization 
        ? rssFeedService.normalizeUrl(article2.link)
        : article2.link;
        
      if (link1 === link2) {
        return true;
      }
    }
    
    // Check title similarity within time window
    const timeWindow = activeConfig.timeWindowHours * 60 * 60 * 1000;
    const timeDiff = Math.abs(article1.pubDate.getTime() - article2.pubDate.getTime());
    
    if (timeDiff <= timeWindow) {
      const similarity = rssFeedService.calculateSimilarity(
        article1.title.toLowerCase(),
        article2.title.toLowerCase()
      );
      
      return similarity >= activeConfig.titleSimilarityThreshold;
    }
    
    return false;
  }

  /**
   * Get default deduplication configuration
   */
  getDefaultConfig(): DeduplicationConfig {
    return { ...this.defaultConfig };
  }

  /**
   * Update deduplication configuration
   */
  updateConfig(updates: Partial<DeduplicationConfig>): DeduplicationConfig {
    this.defaultConfig = { ...this.defaultConfig, ...updates };
    return this.defaultConfig;
  }
}

// Export singleton instance
export const deduplicationService = new DeduplicationService();