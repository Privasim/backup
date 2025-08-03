import { DeduplicationService } from '../deduplication';
import { RSSArticle } from '../types';
import { debugLog } from '@/components/debug/DebugConsole';

// Mock the debug logger
jest.mock('@/components/debug/DebugConsole', () => ({
  debugLog: {
    info: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

// Mock the RSS parser service
jest.mock('../parser', () => ({
  rssFeedService: {
    calculateSimilarity: jest.fn(),
    normalizeUrl: jest.fn(),
  },
}));

import { rssFeedService } from '../parser';

describe('DeduplicationService', () => {
  let service: DeduplicationService;
  const mockRssFeedService = rssFeedService as jest.Mocked<typeof rssFeedService>;

  beforeEach(() => {
    service = new DeduplicationService();
    jest.clearAllMocks();
    
    // Setup default mocks
    mockRssFeedService.calculateSimilarity.mockImplementation((str1, str2) => {
      return str1 === str2 ? 1.0 : 0.5;
    });
    
    mockRssFeedService.normalizeUrl.mockImplementation((url) => {
      return url.toLowerCase().replace(/[?#].*$/, '');
    });
  });

  const createMockArticle = (
    title: string,
    link: string,
    guid?: string,
    pubDate?: Date
  ): RSSArticle => ({
    id: `article-${Date.now()}-${Math.random()}`,
    title,
    description: 'Test description',
    link,
    pubDate: pubDate || new Date(),
    guid,
    isSelected: false,
  });

  describe('deduplicateArticles', () => {
    it('should remove articles with duplicate GUIDs', () => {
      const articles = [
        createMockArticle('Article 1', 'https://example.com/1', 'guid-1'),
        createMockArticle('Article 2', 'https://example.com/2', 'guid-2'),
        createMockArticle('Article 1 Duplicate', 'https://example.com/3', 'guid-1'),
      ];

      const uniqueArticles = service.deduplicateArticles(articles);

      expect(uniqueArticles).toHaveLength(2);
      expect(uniqueArticles.map(a => a.guid)).toEqual(['guid-1', 'guid-2']);
      
      expect(debugLog.info).toHaveBeenCalledWith(
        'DeduplicationService',
        'Starting deduplication process',
        expect.objectContaining({
          totalArticles: 3,
        })
      );

      expect(debugLog.success).toHaveBeenCalledWith(
        'DeduplicationService',
        'Deduplication complete',
        expect.objectContaining({
          originalCount: 3,
          uniqueCount: 2,
          duplicatesRemoved: 1,
        })
      );
    });

    it('should remove articles with duplicate normalized links', () => {
      const articles = [
        createMockArticle('Article 1', 'https://example.com/article?utm_source=test'),
        createMockArticle('Article 2', 'https://example.com/article2'),
        createMockArticle('Article 1 Duplicate', 'https://example.com/article#section'),
      ];

      mockRssFeedService.normalizeUrl.mockImplementation((url) => {
        if (url.includes('example.com/article')) {
          return 'https://example.com/article';
        }
        return url;
      });

      const uniqueArticles = service.deduplicateArticles(articles);

      expect(uniqueArticles).toHaveLength(2);
      expect(mockRssFeedService.normalizeUrl).toHaveBeenCalledTimes(3);
    });

    it('should remove articles with similar titles within time window', () => {
      const baseTime = new Date('2025-01-01T12:00:00Z');
      const articles = [
        createMockArticle('TechCorp Announces Layoffs', 'https://example.com/1', undefined, baseTime),
        createMockArticle('Different Article', 'https://example.com/2', undefined, baseTime),
        createMockArticle('TechCorp Announces Major Layoffs', 'https://example.com/3', undefined, 
          new Date(baseTime.getTime() + 1000 * 60 * 60)), // 1 hour later
      ];

      mockRssFeedService.calculateSimilarity.mockImplementation((str1, str2) => {
        if (str1.includes('TechCorp') && str2.includes('TechCorp')) {
          return 0.9; // High similarity
        }
        return 0.3; // Low similarity
      });

      const uniqueArticles = service.deduplicateArticles(articles);

      expect(uniqueArticles).toHaveLength(2);
      expect(debugLog.info).toHaveBeenCalledWith(
        'DeduplicationService',
        'Found duplicate by title similarity',
        expect.objectContaining({
          similarity: '0.900',
        })
      );
    });

    it('should not remove articles with similar titles outside time window', () => {
      const baseTime = new Date('2025-01-01T12:00:00Z');
      const articles = [
        createMockArticle('TechCorp Announces Layoffs', 'https://example.com/1', undefined, baseTime),
        createMockArticle('TechCorp Announces Major Layoffs', 'https://example.com/2', undefined, 
          new Date(baseTime.getTime() + 1000 * 60 * 60 * 72)), // 72 hours later (outside 48h window)
      ];

      mockRssFeedService.calculateSimilarity.mockImplementation(() => 0.9);

      const uniqueArticles = service.deduplicateArticles(articles);

      expect(uniqueArticles).toHaveLength(2); // Both should remain
    });

    it('should use custom deduplication configuration', () => {
      const articles = [
        createMockArticle('Similar Title', 'https://example.com/1'),
        createMockArticle('Similar Title Too', 'https://example.com/2'),
      ];

      const customConfig = {
        titleSimilarityThreshold: 0.3, // Lower threshold
        linkNormalization: false,
        timeWindowHours: 24,
        guidComparison: false,
      };

      mockRssFeedService.calculateSimilarity.mockImplementation(() => 0.5);

      const uniqueArticles = service.deduplicateArticles(articles, customConfig);

      expect(uniqueArticles).toHaveLength(1); // Should remove one due to lower threshold
    });

    it('should handle empty article array', () => {
      const uniqueArticles = service.deduplicateArticles([]);

      expect(uniqueArticles).toEqual([]);
    });

    it('should preserve article order', () => {
      const articles = [
        createMockArticle('Article A', 'https://example.com/a'),
        createMockArticle('Article B', 'https://example.com/b'),
        createMockArticle('Article C', 'https://example.com/c'),
      ];

      const uniqueArticles = service.deduplicateArticles(articles);

      expect(uniqueArticles.map(a => a.title)).toEqual(['Article A', 'Article B', 'Article C']);
    });
  });

  describe('areArticlesDuplicate', () => {
    it('should detect duplicate GUIDs', () => {
      const article1 = createMockArticle('Article 1', 'https://example.com/1', 'same-guid');
      const article2 = createMockArticle('Article 2', 'https://example.com/2', 'same-guid');

      const isDuplicate = service.areArticlesDuplicate(article1, article2);

      expect(isDuplicate).toBe(true);
    });

    it('should detect duplicate normalized links', () => {
      const article1 = createMockArticle('Article 1', 'https://example.com/article?param=1');
      const article2 = createMockArticle('Article 2', 'https://example.com/article#section');

      mockRssFeedService.normalizeUrl.mockReturnValue('https://example.com/article');

      const isDuplicate = service.areArticlesDuplicate(article1, article2);

      expect(isDuplicate).toBe(true);
    });

    it('should detect similar titles within time window', () => {
      const baseTime = new Date();
      const article1 = createMockArticle('TechCorp Layoffs', 'https://example.com/1', undefined, baseTime);
      const article2 = createMockArticle('TechCorp Major Layoffs', 'https://example.com/2', undefined, 
        new Date(baseTime.getTime() + 1000 * 60 * 30)); // 30 minutes later

      mockRssFeedService.calculateSimilarity.mockReturnValue(0.9);

      const isDuplicate = service.areArticlesDuplicate(article1, article2);

      expect(isDuplicate).toBe(true);
    });

    it('should not detect similar titles outside time window', () => {
      const baseTime = new Date();
      const article1 = createMockArticle('TechCorp Layoffs', 'https://example.com/1', undefined, baseTime);
      const article2 = createMockArticle('TechCorp Major Layoffs', 'https://example.com/2', undefined, 
        new Date(baseTime.getTime() + 1000 * 60 * 60 * 72)); // 72 hours later

      mockRssFeedService.calculateSimilarity.mockReturnValue(0.9);

      const isDuplicate = service.areArticlesDuplicate(article1, article2);

      expect(isDuplicate).toBe(false);
    });

    it('should not detect non-duplicate articles', () => {
      const article1 = createMockArticle('Article 1', 'https://example.com/1', 'guid-1');
      const article2 = createMockArticle('Article 2', 'https://example.com/2', 'guid-2');

      mockRssFeedService.calculateSimilarity.mockReturnValue(0.3);

      const isDuplicate = service.areArticlesDuplicate(article1, article2);

      expect(isDuplicate).toBe(false);
    });
  });

  describe('getDefaultConfig', () => {
    it('should return default configuration', () => {
      const defaultConfig = service.getDefaultConfig();

      expect(defaultConfig).toEqual({
        titleSimilarityThreshold: 0.85,
        linkNormalization: true,
        timeWindowHours: 48,
        guidComparison: true,
      });
    });
  });

  describe('updateConfig', () => {
    it('should update configuration', () => {
      const updates = {
        titleSimilarityThreshold: 0.7,
        timeWindowHours: 24,
      };

      const updatedConfig = service.updateConfig(updates);

      expect(updatedConfig.titleSimilarityThreshold).toBe(0.7);
      expect(updatedConfig.timeWindowHours).toBe(24);
      expect(updatedConfig.linkNormalization).toBe(true); // Should remain unchanged
    });
  });
});