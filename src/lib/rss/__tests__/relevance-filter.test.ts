import { RelevanceFilterService } from '../relevance-filter';
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

describe('RelevanceFilterService', () => {
  let service: RelevanceFilterService;

  beforeEach(() => {
    service = new RelevanceFilterService();
    jest.clearAllMocks();
  });

  const createMockArticle = (title: string, description: string): RSSArticle => ({
    id: `article-${Date.now()}-${Math.random()}`,
    title,
    description,
    link: 'https://example.com/article',
    pubDate: new Date(),
    isSelected: false,
  });

  describe('calculateRelevanceScore', () => {
    it('should give high score to job loss related articles', () => {
      const article = createMockArticle(
        'TechCorp Announces Major Layoffs Due to AI Automation',
        'The company is laying off 1000 workers as artificial intelligence systems replace human roles in customer service and data processing.'
      );

      const score = service.calculateRelevanceScore(article);

      expect(score).toBeGreaterThan(0.7);
      expect(debugLog.info).toHaveBeenCalledWith(
        'RelevanceFilter',
        'Calculated relevance score',
        expect.objectContaining({
          articleTitle: expect.stringContaining('TechCorp Announces Major Layoffs'),
          totalScore: expect.any(Number),
        })
      );
    });

    it('should give low score to unrelated articles', () => {
      const article = createMockArticle(
        'New Restaurant Opens Downtown',
        'A new Italian restaurant has opened its doors in the downtown area, featuring authentic cuisine and a cozy atmosphere.'
      );

      const score = service.calculateRelevanceScore(article);

      expect(score).toBeLessThan(0.3);
    });

    it('should weight title higher than description', () => {
      const titleArticle = createMockArticle(
        'Major Layoffs at TechCorp',
        'The weather is nice today and people are enjoying outdoor activities.'
      );

      const descriptionArticle = createMockArticle(
        'Weather Update for Today',
        'TechCorp announces major layoffs due to automation and AI replacing workers.'
      );

      const titleScore = service.calculateRelevanceScore(titleArticle);
      const descriptionScore = service.calculateRelevanceScore(descriptionArticle);

      expect(titleScore).toBeGreaterThan(descriptionScore);
    });

    it('should handle articles with missing content', () => {
      const article = createMockArticle('', '');

      const score = service.calculateRelevanceScore(article);

      expect(score).toBe(0);
    });

    it('should use custom filter configuration', () => {
      const article = createMockArticle(
        'Custom Keyword Test',
        'This article contains custom keywords for testing purposes.'
      );

      const customFilter = {
        keywords: ['custom', 'testing'],
        titleWeight: 0.8,
        descriptionWeight: 0.2,
        minimumScore: 0.5,
      };

      const score = service.calculateRelevanceScore(article, customFilter);

      expect(score).toBeGreaterThan(0);
    });
  });

  describe('filterRelevantArticles', () => {
    it('should filter articles based on relevance score', () => {
      const articles = [
        createMockArticle(
          'TechCorp Layoffs Due to AI Automation',
          'Company reduces workforce by 500 employees as artificial intelligence takes over customer service roles.'
        ),
        createMockArticle(
          'New Coffee Shop Opens',
          'A new coffee shop has opened in the city center with great reviews.'
        ),
        createMockArticle(
          'Manufacturing Jobs Lost to Robots',
          'Factory automation leads to unemployment as robotic systems replace human workers.'
        ),
        createMockArticle(
          'Stock Market Update',
          'Markets are up today with technology stocks leading the gains.'
        ),
      ];

      const relevantArticles = service.filterRelevantArticles(articles);

      expect(relevantArticles.length).toBeLessThan(articles.length);
      expect(relevantArticles.every(article => article.isJobLossRelated)).toBe(true);
      expect(relevantArticles.every(article => (article.relevanceScore || 0) >= 0.3)).toBe(true);

      expect(debugLog.info).toHaveBeenCalledWith(
        'RelevanceFilter',
        'Filtering articles for relevance',
        expect.objectContaining({
          totalArticles: 4,
          minimumScore: 0.3,
        })
      );

      expect(debugLog.success).toHaveBeenCalledWith(
        'RelevanceFilter',
        'Relevance filtering complete',
        expect.objectContaining({
          originalCount: 4,
          relevantCount: expect.any(Number),
          filterRate: expect.stringMatching(/\d+\.\d+%/),
        })
      );
    });

    it('should use custom filter configuration', () => {
      const articles = [
        createMockArticle('Test Article', 'Contains some test content'),
      ];

      const customFilter = {
        keywords: ['test'],
        titleWeight: 0.5,
        descriptionWeight: 0.5,
        minimumScore: 0.1,
      };

      const relevantArticles = service.filterRelevantArticles(articles, customFilter);

      expect(relevantArticles.length).toBeGreaterThan(0);
      expect(relevantArticles[0].isJobLossRelated).toBe(true);
    });

    it('should handle empty article array', () => {
      const relevantArticles = service.filterRelevantArticles([]);

      expect(relevantArticles).toEqual([]);
    });
  });

  describe('getDefaultFilter', () => {
    it('should return default filter configuration', () => {
      const defaultFilter = service.getDefaultFilter();

      expect(defaultFilter).toEqual({
        keywords: expect.arrayContaining(['layoff', 'ai', 'automation']),
        titleWeight: 0.6,
        descriptionWeight: 0.4,
        minimumScore: 0.3,
      });
    });
  });

  describe('updateFilter', () => {
    it('should update filter configuration', () => {
      const updates = {
        minimumScore: 0.5,
        titleWeight: 0.8,
      };

      const updatedFilter = service.updateFilter(updates);

      expect(updatedFilter.minimumScore).toBe(0.5);
      expect(updatedFilter.titleWeight).toBe(0.8);
      expect(updatedFilter.descriptionWeight).toBe(0.4); // Should remain unchanged
    });
  });

  describe('scoreText', () => {
    it('should score text with multiple keyword matches', () => {
      const article = createMockArticle(
        'AI Layoffs and Automation Impact',
        'Artificial intelligence and robotic automation are causing widespread job losses and unemployment.'
      );

      const score = service.calculateRelevanceScore(article);

      // Should be high due to multiple relevant keywords
      expect(score).toBeGreaterThan(0.5);
    });

    it('should give bonus for multiple occurrences of same keyword', () => {
      const singleOccurrence = createMockArticle(
        'Company Announces Layoffs',
        'The company will reduce its workforce.'
      );

      const multipleOccurrences = createMockArticle(
        'Major Layoffs: Company Layoffs Affect Thousands',
        'The layoffs will impact multiple departments as the company implements more layoffs.'
      );

      const singleScore = service.calculateRelevanceScore(singleOccurrence);
      const multipleScore = service.calculateRelevanceScore(multipleOccurrences);

      expect(multipleScore).toBeGreaterThan(singleScore);
    });

    it('should handle partial word matches', () => {
      const article = createMockArticle(
        'Unemployment Rate Rises',
        'The unemployment statistics show concerning trends in employment.'
      );

      const score = service.calculateRelevanceScore(article);

      expect(score).toBeGreaterThan(0);
    });
  });
});