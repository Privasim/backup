import { rssFeedService } from '../parser';
import { relevanceFilterService } from '../relevance-filter';
import { deduplicationService } from '../deduplication';

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

describe('RSS Feed Integration', () => {
  const mockParser = (rssFeedService as any).parser;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should complete full RSS processing workflow', async () => {
    // Mock RSS feed data
    const mockFeed = {
      title: 'Tech News RSS',
      description: 'Latest technology news',
      link: 'https://technews.com',
      lastBuildDate: '2025-01-01T00:00:00Z',
      items: [
        {
          title: 'TechCorp Announces Major Layoffs Due to AI Automation',
          link: 'https://technews.com/techcorp-layoffs',
          pubDate: '2025-01-01T12:00:00Z',
          contentSnippet: 'TechCorp is laying off 1000 employees as artificial intelligence systems replace human workers in customer service and data processing roles.',
          guid: 'techcorp-layoffs-2025',
          creator: 'Tech Reporter',
        },
        {
          title: 'New Coffee Shop Opens Downtown',
          link: 'https://technews.com/coffee-shop',
          pubDate: '2025-01-01T10:00:00Z',
          contentSnippet: 'A new artisanal coffee shop has opened in the downtown area, featuring locally sourced beans and a cozy atmosphere.',
          guid: 'coffee-shop-2025',
          creator: 'Local Reporter',
        },
        {
          title: 'Manufacturing Jobs Lost to Robotic Automation',
          link: 'https://technews.com/manufacturing-automation',
          pubDate: '2025-01-01T08:00:00Z',
          contentSnippet: 'Factory automation leads to unemployment as robotic systems replace human workers in assembly line operations.',
          guid: 'manufacturing-automation-2025',
          creator: 'Industry Reporter',
        },
        {
          title: 'TechCorp Announces Major Layoffs Due to AI Automation', // Duplicate
          link: 'https://technews.com/techcorp-layoffs-duplicate',
          pubDate: '2025-01-01T11:00:00Z',
          contentSnippet: 'TechCorp is laying off 1000 employees as AI systems replace workers.',
          guid: 'techcorp-layoffs-duplicate-2025',
          creator: 'Tech Reporter',
        },
      ],
    };

    mockParser.parseURL.mockResolvedValue(mockFeed);

    // Step 1: Parse RSS feed
    const feedData = await rssFeedService.parseFeed('https://technews.com/feed.xml');

    expect(feedData.title).toBe('Tech News RSS');
    expect(feedData.articles).toHaveLength(4);

    // Step 2: Apply deduplication
    const deduplicatedArticles = deduplicationService.deduplicateArticles(feedData.articles);

    // Should remove the duplicate TechCorp article
    expect(deduplicatedArticles).toHaveLength(3);

    // Step 3: Apply relevance filtering
    const relevantArticles = relevanceFilterService.filterRelevantArticles(deduplicatedArticles);

    // Should keep only job loss related articles (TechCorp and Manufacturing)
    expect(relevantArticles).toHaveLength(2);
    expect(relevantArticles.every(article => article.isJobLossRelated)).toBe(true);
    expect(relevantArticles.every(article => (article.relevanceScore || 0) >= 0.3)).toBe(true);

    // Verify the relevant articles are the expected ones
    const titles = relevantArticles.map(article => article.title);
    expect(titles).toContain('TechCorp Announces Major Layoffs Due to AI Automation');
    expect(titles).toContain('Manufacturing Jobs Lost to Robotic Automation');
    expect(titles).not.toContain('New Coffee Shop Opens Downtown');
  });

  it('should handle RSS feed parsing errors gracefully', async () => {
    mockParser.parseURL.mockRejectedValue(new Error('Network error'));

    await expect(rssFeedService.parseFeed('https://invalid-feed.com/feed.xml')).rejects.toThrow('Network error');

    const status = rssFeedService.getStatus();
    expect(status.status).toBe('error');
    expect(status.lastError).toBe('Network error');
  });

  it('should handle empty RSS feeds', async () => {
    const emptyFeed = {
      title: 'Empty Feed',
      items: [],
    };

    mockParser.parseURL.mockResolvedValue(emptyFeed);

    const feedData = await rssFeedService.parseFeed('https://empty-feed.com/feed.xml');
    const relevantArticles = relevanceFilterService.filterRelevantArticles(feedData.articles);

    expect(feedData.articles).toHaveLength(0);
    expect(relevantArticles).toHaveLength(0);
  });

  it('should maintain article order through processing pipeline', async () => {
    const mockFeed = {
      title: 'Ordered Feed',
      items: [
        {
          title: 'First Article - AI Layoffs',
          link: 'https://example.com/1',
          pubDate: '2025-01-01T12:00:00Z',
          contentSnippet: 'AI automation causing job losses',
          guid: 'article-1',
        },
        {
          title: 'Second Article - Automation Impact',
          link: 'https://example.com/2',
          pubDate: '2025-01-01T11:00:00Z',
          contentSnippet: 'Robotic systems replacing workers',
          guid: 'article-2',
        },
        {
          title: 'Third Article - Job Market',
          link: 'https://example.com/3',
          pubDate: '2025-01-01T10:00:00Z',
          contentSnippet: 'Employment trends and layoffs',
          guid: 'article-3',
        },
      ],
    };

    mockParser.parseURL.mockResolvedValue(mockFeed);

    const feedData = await rssFeedService.parseFeed('https://example.com/feed.xml');
    const deduplicatedArticles = deduplicationService.deduplicateArticles(feedData.articles);
    const relevantArticles = relevanceFilterService.filterRelevantArticles(deduplicatedArticles);

    // Articles should be sorted by publication date (newest first) from RSS parser
    expect(relevantArticles[0].title).toContain('First Article');
    expect(relevantArticles[1].title).toContain('Second Article');
    expect(relevantArticles[2].title).toContain('Third Article');
  });

  it('should handle malformed RSS data gracefully', async () => {
    const malformedFeed = {
      // Missing title and other fields
      items: [
        {
          // Missing required fields
          pubDate: '2025-01-01T12:00:00Z',
        },
        {
          title: 'Valid Article About Layoffs',
          link: 'https://example.com/valid',
          contentSnippet: 'Company announces workforce reduction',
        },
      ],
    };

    mockParser.parseURL.mockResolvedValue(malformedFeed);

    const feedData = await rssFeedService.parseFeed('https://malformed-feed.com/feed.xml');

    expect(feedData.title).toBe('RSS Feed'); // Default title
    expect(feedData.articles).toHaveLength(2);
    expect(feedData.articles[0].title).toBe('Untitled'); // Default for missing title
    expect(feedData.articles[1].title).toBe('Valid Article About Layoffs');

    // Processing should still work
    const relevantArticles = relevanceFilterService.filterRelevantArticles(feedData.articles);
    expect(relevantArticles).toHaveLength(1); // Only the valid layoffs article
  });
});