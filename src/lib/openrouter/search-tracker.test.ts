import { SearchTracker } from './search-tracker';

describe('SearchTracker', () => {
  let searchTracker: SearchTracker;
  const searchId = 'test-search-123';

  beforeEach(() => {
    searchTracker = new SearchTracker(searchId);
  });

  describe('constructor', () => {
    it('should initialize with correct default values', () => {
      const metadata = searchTracker.getSearchMetadata();
      expect(metadata.status).toBe('queued');
      expect(metadata.visitedSources).toEqual([]);
      expect(metadata.stats.totalVisited).toBe(0);
      expect(metadata.stats.uniqueDomains).toBe(0);
      expect(metadata.stats.startedAt).toBeInstanceOf(Date);
      expect(metadata.stats.completedAt).toBeUndefined();
    });
  });

  describe('start', () => {
    it('should set status to active', () => {
      searchTracker.start();
      expect(searchTracker.getStatus()).toBe('active');
    });
  });

  describe('processing', () => {
    it('should set status to processing', () => {
      searchTracker.processing();
      expect(searchTracker.getStatus()).toBe('processing');
    });
  });

  describe('complete', () => {
    it('should set status to completed and record completion time', () => {
      const before = new Date();
      searchTracker.complete();
      const after = new Date();
      
      const metadata = searchTracker.getSearchMetadata();
      expect(metadata.status).toBe('completed');
      expect(metadata.stats.completedAt).toBeInstanceOf(Date);
      expect(metadata.stats.completedAt!.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(metadata.stats.completedAt!.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('fail', () => {
    it('should set status to failed and record completion time', () => {
      const before = new Date();
      searchTracker.fail();
      const after = new Date();
      
      const metadata = searchTracker.getSearchMetadata();
      expect(metadata.status).toBe('failed');
      expect(metadata.stats.completedAt).toBeInstanceOf(Date);
      expect(metadata.stats.completedAt!.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(metadata.stats.completedAt!.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('logSource', () => {
    it('should add a new source to visitedSources', () => {
      const url = 'https://example.com';
      const title = 'Example Site';
      const snippet = 'This is an example site';
      
      searchTracker.logSource(url, title, snippet);
      
      const metadata = searchTracker.getSearchMetadata();
      expect(metadata.visitedSources).toHaveLength(1);
      expect(metadata.visitedSources[0]).toEqual({
        url,
        domain: 'example.com',
        title,
        snippet
      });
      expect(metadata.stats.totalVisited).toBe(1);
      expect(metadata.stats.uniqueDomains).toBe(1);
    });

    it('should not add duplicate sources', () => {
      const url = 'https://example.com';
      
      searchTracker.logSource(url, 'Example Site', 'This is an example site');
      searchTracker.logSource(url, 'Example Site', 'This is an example site');
      
      const metadata = searchTracker.getSearchMetadata();
      expect(metadata.visitedSources).toHaveLength(1);
      expect(metadata.stats.totalVisited).toBe(1);
    });

    it('should count unique domains correctly', () => {
      searchTracker.logSource('https://example.com', 'Example Site');
      searchTracker.logSource('https://another-example.com', 'Another Example Site');
      searchTracker.logSource('https://example.com/different-page', 'Different Page');
      
      const metadata = searchTracker.getSearchMetadata();
      expect(metadata.stats.totalVisited).toBe(3);
      expect(metadata.stats.uniqueDomains).toBe(2);
    });
  });

  describe('getSourceCount', () => {
    it('should return the correct number of visited sources', () => {
      expect(searchTracker.getSourceCount()).toBe(0);
      
      searchTracker.logSource('https://example.com');
      expect(searchTracker.getSourceCount()).toBe(1);
      
      searchTracker.logSource('https://another-example.com');
      expect(searchTracker.getSourceCount()).toBe(2);
    });
  });
});
