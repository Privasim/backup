import { RSSArticle, RelevanceFilter } from './types';
import { debugLog } from '@/components/debug/DebugConsole';

export class RelevanceFilterService {
  private defaultFilter: RelevanceFilter = {
    keywords: [
      // Job loss keywords
      'layoff', 'layoffs', 'job loss', 'job losses', 'unemployment', 'fired', 'termination',
      'workforce reduction', 'downsizing', 'restructuring', 'redundancy', 'redundancies',
      
      // AI and automation keywords
      'artificial intelligence', 'ai', 'automation', 'robot', 'robotic', 'machine learning',
      'automated', 'digitization', 'digital transformation', 'chatbot', 'algorithm',
      
      // Industry impact keywords
      'replace workers', 'job displacement', 'workforce automation', 'human workers',
      'employment impact', 'job market', 'labor market', 'career impact'
    ],
    titleWeight: 0.6,
    descriptionWeight: 0.4,
    minimumScore: 0.3
  };

  /**
   * Calculate relevance score for an article
   */
  calculateRelevanceScore(article: RSSArticle, filter?: RelevanceFilter): number {
    const activeFilter = filter || this.defaultFilter;
    
    const titleScore = this.scoreText(article.title, activeFilter.keywords);
    const descriptionScore = this.scoreText(article.description, activeFilter.keywords);
    
    const totalScore = (titleScore * activeFilter.titleWeight) + 
                      (descriptionScore * activeFilter.descriptionWeight);
    
    debugLog.info('RelevanceFilter', 'Calculated relevance score', {
      articleTitle: article.title.substring(0, 50) + '...',
      titleScore,
      descriptionScore,
      totalScore
    });
    
    return Math.min(totalScore, 1.0); // Cap at 1.0
  }

  /**
   * Filter articles by relevance
   */
  filterRelevantArticles(articles: RSSArticle[], filter?: RelevanceFilter): RSSArticle[] {
    const activeFilter = filter || this.defaultFilter;
    
    debugLog.info('RelevanceFilter', 'Filtering articles for relevance', {
      totalArticles: articles.length,
      minimumScore: activeFilter.minimumScore
    });
    
    const relevantArticles = articles.map(article => {
      const relevanceScore = this.calculateRelevanceScore(article, activeFilter);
      return {
        ...article,
        relevanceScore,
        isJobLossRelated: relevanceScore >= activeFilter.minimumScore
      };
    }).filter(article => article.isJobLossRelated);
    
    debugLog.success('RelevanceFilter', 'Relevance filtering complete', {
      originalCount: articles.length,
      relevantCount: relevantArticles.length,
      filterRate: `${((relevantArticles.length / articles.length) * 100).toFixed(1)}%`
    });
    
    return relevantArticles;
  }

  /**
   * Score text against keywords
   */
  private scoreText(text: string, keywords: string[]): number {
    if (!text) return 0;
    
    const lowerText = text.toLowerCase();
    let score = 0;
    let matchCount = 0;
    
    for (const keyword of keywords) {
      const lowerKeyword = keyword.toLowerCase();
      
      // Exact match gets full points
      if (lowerText.includes(lowerKeyword)) {
        matchCount++;
        
        // Bonus for multiple occurrences
        const occurrences = (lowerText.match(new RegExp(lowerKeyword, 'g')) || []).length;
        score += Math.min(occurrences * 0.1, 0.3); // Cap bonus at 0.3
      }
      
      // Partial word matches get reduced points
      const words = lowerText.split(/\s+/);
      for (const word of words) {
        if (word.includes(lowerKeyword) && word !== lowerKeyword) {
          score += 0.05; // Small bonus for partial matches
        }
      }
    }
    
    // Normalize score based on keyword density
    const keywordDensity = matchCount / keywords.length;
    return Math.min(score + keywordDensity, 1.0);
  }

  /**
   * Get default filter configuration
   */
  getDefaultFilter(): RelevanceFilter {
    return { ...this.defaultFilter };
  }

  /**
   * Update filter keywords
   */
  updateFilter(updates: Partial<RelevanceFilter>): RelevanceFilter {
    this.defaultFilter = { ...this.defaultFilter, ...updates };
    return this.defaultFilter;
  }
}

// Export singleton instance
export const relevanceFilterService = new RelevanceFilterService();