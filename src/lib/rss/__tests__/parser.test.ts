import { RSSFeedService } from '../parser';
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

// Mock rss-parser
jest.mock('rss-parser', () => {
  return jest.fn().mockImplementation(() => ({
    parseURL: jest.fn(),
  }));
});

describe('RSSFeedService', () => {
  let service: RSSFeedService;
  let mockParser: any;

  beforeEach(() => {
    service = new RSSFeedService();
    mockParser = (service as any).parser;
    jest.clearAllMocks();
  });

  describe('validateFeedUrl', () => {
    it('should validate a valid RSS feed URL', async () => {
      const mockFeed = {
        title: 'Test Feed',
        items: [
          {
            title: 'Test Article',
            link: 'https://example.com/article1',
            pubDate: '2025-01-01T00:00:00Z',
          },
        ],
      };

      mockParser.parseURL.mockResolvedValue(mockFeed);

      const result = await service.validateFeedUrl('https://example.com/feed.xml');

      expect(result).toBe(true);
      expect(mockParser.parseURL).toHaveBeenCalledWith('https://example.com/feed.xml');
      expect(debugLog.success).toHaveBeenCalledWith(
        'RSSFeedService',
        'RSS feed validation successful',
        expect.objectContaining({
          title: 'Test Feed',
          itemCount: 1,
        })
      );
    });

    it('should reject invalid URLs', async () => {
      const result = await service.validateFeedUrl('invalid-url');

      expect(result).toBe(false);
      expect(debugLog.error).toHaveBeenCalledWith(
        'RSSFeedService',
        'RSS feed validation failed',
        expect.objectContaining({
          url: 'invalid-url',
        })
      );
    });

    it('should reject non-HTTP protocols', async () => {
      const result = await service.validateFeedUrl('ftp://example.com/feed.xml');

      expect(result).toBe(false);
      expect(debugLog.error).toHaveBeenCalled();
    });

    it('should handle parser errors', async () => {
      mockParser.parseURL.mockRejectedValue(new Error('Parse error'));

      const result = await service.validateFeedUrl('https://example.com/feed.xml');

      expect(result).toBe(false);
      expect(debugLog.error).toHaveBeenCalledWith(
        'RSSFeedService',
        'RSS feed validation failed',
        expect.objectContaining({
          url: 'https://example.com/feed.xml',
          error: expect.any(Error),
        })
      );
    });
  });

  describe('parseFeed', () => {
    it('should parse a valid RSS feed', async () => {
      const mockFeed = {
        title: 'Test Feed',
        description: 'Test Description',
        link: 'https://example.com',
        lastBuildDate: '2025-01-01T00:00:00Z',
        items: [
          {
            title: 'Test Article 1',
            link: 'https://example.com/article1',
            pubDate: '2025-01-01T12:00:00Z',
            contentSnippet: 'Article 1 content',
            guid: 'article-1',
            creator: 'Author 1',
          },
          {
            title: 'Test Article 2',
            link: 'https://example.com/article2',
            pubDate: '2025-01-01T10:00:00Z',
            contentSnippet: 'Article 2 content',
            guid: 'article-2',
          },
        ],
      };

      mockParser.parseURL.mockResolvedValue(mockFeed);

      const result = await service.parseFeed('https://example.com/feed.xml');

      expect(result).toEqual({
        title: 'Test Feed',
        description: 'Test Description',
        link: 'https://example.com',
        lastBuildDate: new Date('2025-01-01T00:00:00Z'),
        articles: [
          {
            id: 'article-1',
            title: 'Test Article 1',
            description: 'Article 1 content',
            link: 'https://example.com/article1',
            pubDate: new Date('2025-01-01T12:00:00Z'),
            author: 'Author 1',
            category: undefined,
            guid: 'article-1',
            isSelected: false,
          },
          {
            id: 'article-2',
            title: 'Test Article 2',
            description: 'Article 2 content',
            link: 'https://example.com/article2',
            pubDate: new Date('2025-01-01T10:00:00Z'),
            author: undefined,
            category: undefined,
            guid: 'article-2',
            isSelected: false,
          },
        ],
      });

      expect(debugLog.success).toHaveBeenCalledWith(
        'RSSFeedService',
        'RSS feed parsed successfully',
        expect.objectContaining({
          title: 'Test Feed',
          articleCount: 2,
          attemptsUsed: 1,
        })
      );
    });

    it('should retry on failure with exponential backoff', async () => {
      mockParser.parseURL
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          title: 'Test Feed',
          items: [],
        });

      const startTime = Date.now();
      const result = await service.parseFeed('https://example.com/feed.xml');
      const endTime = Date.now();

      // Should have taken at least 3 seconds (1s + 2s delays)
      expect(endTime - startTime).toBeGreaterThan(2900);

      expect(result.title).toBe('Test Feed');
      expect(mockParser.parseURL).toHaveBeenCalledTimes(3);
      expect(debugLog.warn).toHaveBeenCalledTimes(2);
      expect(debugLog.success).toHaveBeenCalledWith(
        'RSSFeedService',
        'RSS feed parsed successfully',
        expect.objectContaining({
          attemptsUsed: 3,
        })
      );
    });

    it('should fail after max retries', async () => {
      mockParser.parseURL.mockRejectedValue(new Error('Persistent error'));

      await expect(service.parseFeed('https://example.com/feed.xml')).rejects.toThrow(
        'Persistent error'
      );

      expect(mockParser.parseURL).toHaveBeenCalledTimes(4); // Initial + 3 retries
      expect(debugLog.error).toHaveBeenCalledWith(
        'RSSFeedService',
        'RSS feed parsing failed after all retries',
        expect.objectContaining({
          totalAttempts: 4,
        })
      );
    });

    it('should handle missing feed data gracefully', async () => {
      const mockFeed = {
        items: [
          {
            // Missing title, link, etc.
            pubDate: '2025-01-01T12:00:00Z',
          },
        ],
      };

      mockParser.parseURL.mockResolvedValue(mockFeed);

      const result = await service.parseFeed('https://example.com/feed.xml');

      expect(result.title).toBe('RSS Feed');
      expect(result.description).toBe('');
      expect(result.articles).toHaveLength(1);
      expect(result.articles[0].title).toBe('Untitled');
      expect(result.articles[0].link).toBe('');
    });
  });

  describe('getStatus', () => {
    it('should return current status', () => {
      const status = service.getStatus();

      expect(status).toEqual({
        status: 'healthy',
        lastUpdated: null,
        lastError: undefined,
        articleCount: 0,
      });
    });
  });

  describe('normalizeUrl', () => {
    it('should normalize URLs by removing query params and fragments', () => {
      const url = 'https://Example.com/path?utm_source=test&ref=123#section';
      const normalized = service.normalizeUrl(url);

      expect(normalized).toBe('https://example.com/path');
    });

    it('should handle invalid URLs gracefully', () => {
      const url = 'invalid-url';
      const normalized = service.normalizeUrl(url);

      expect(normalized).toBe('invalid-url');
    });
  });

  describe('calculateSimilarity', () => {
    it('should calculate similarity between identical strings', () => {
      const similarity = service.calculateSimilarity('hello world', 'hello world');
      expect(similarity).toBe(1.0);
    });

    it('should calculate similarity between different strings', () => {
      const similarity = service.calculateSimilarity('hello world', 'hello earth');
      expect(similarity).toBeGreaterThan(0.5);
      expect(similarity).toBeLessThan(1.0);
    });

    it('should handle empty strings', () => {
      const similarity = service.calculateSimilarity('', '');
      expect(similarity).toBe(1.0);
    });

    it('should handle completely different strings', () => {
      const similarity = service.calculateSimilarity('abc', 'xyz');
      expect(similarity).toBeLessThan(0.5);
    });
  });
});