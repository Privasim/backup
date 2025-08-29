// File: src/modules/job-loss-viz/utils/__tests__/sourceAggregator.test.ts

import { 
  aggregateSourcesFromYtd, 
  derivePublisherFromUrl, 
  getSourceDateRange,
  formatDateRange 
} from '../sourceAggregator';
import type { YtdPoint } from '../../types';

describe('sourceAggregator', () => {
  describe('derivePublisherFromUrl', () => {
    it('should extract publisher from URL hostname', () => {
      expect(derivePublisherFromUrl('https://www.bloomberg.com/news/article')).toBe('Bloomberg');
      expect(derivePublisherFromUrl('https://techcrunch.com/2025/01/15/ai-job-losses')).toBe('Techcrunch');
      expect(derivePublisherFromUrl('https://www.nytimes.com/2025/02/01/business/ai-layoffs')).toBe('Nytimes');
    });

    it('should handle URLs without www prefix', () => {
      expect(derivePublisherFromUrl('https://reuters.com/article/123')).toBe('Reuters');
    });

    it('should return undefined for invalid URLs', () => {
      expect(derivePublisherFromUrl('not-a-url')).toBeUndefined();
    });
  });

  describe('aggregateSourcesFromYtd', () => {
    const mockYtdPoints: YtdPoint[] = [
      {
        date: '2025-01-01',
        ytd_global_ai_job_losses: 1000,
        sources: [
          'https://www.example.com/article1',
          { 
            url: 'https://www.test.com/article1', 
            publisher: 'Test Media',
            title: 'Test Article 1'
          }
        ]
      },
      {
        date: '2025-02-01',
        ytd_global_ai_job_losses: 2500,
        sources: [
          'https://www.example.com/article1', // Duplicate from January
          'https://www.example.com/article2'
        ]
      },
      {
        date: '2025-03-01',
        ytd_global_ai_job_losses: 4000,
        sources: [
          'https://www.newsite.com/article1'
        ]
      }
    ];

    it('should aggregate sources correctly', () => {
      const result = aggregateSourcesFromYtd(mockYtdPoints);
      
      // Should have 4 unique sources
      expect(result.length).toBe(4);
      
      // Check the duplicate source has correct occurrence count
      const duplicateSource = result.find(s => s.url === 'https://www.example.com/article1');
      expect(duplicateSource).toBeDefined();
      expect(duplicateSource?.occurrences).toBe(2);
      expect(duplicateSource?.firstDate).toBe('2025-01-01');
      expect(duplicateSource?.lastDate).toBe('2025-02-01');
      expect(duplicateSource?.months).toContain('2025-01');
      expect(duplicateSource?.months).toContain('2025-02');
      
      // Check source with publisher is preserved
      const sourceWithPublisher = result.find(s => s.url === 'https://www.test.com/article1');
      expect(sourceWithPublisher?.publisher).toBe('Test Media');
      expect(sourceWithPublisher?.title).toBe('Test Article 1');
      
      // Check derived publisher
      const derivedPublisherSource = result.find(s => s.url === 'https://www.example.com/article2');
      expect(derivedPublisherSource?.publisher).toBe('Example');
    });

    it('should sort sources by lastDate (most recent first)', () => {
      const result = aggregateSourcesFromYtd(mockYtdPoints);
      
      // First item should be from March
      expect(result[0].lastDate).toBe('2025-03-01');
      // Last items should be from January/February
      expect(['2025-01-01', '2025-02-01']).toContain(result[result.length - 1].lastDate);
    });

    it('should handle empty input', () => {
      expect(aggregateSourcesFromYtd([])).toEqual([]);
    });
  });

  describe('getSourceDateRange', () => {
    it('should return correct date range', () => {
      const points: YtdPoint[] = [
        { date: '2025-02-01', ytd_global_ai_job_losses: 1000, sources: ['https://example.com'] },
        { date: '2025-01-01', ytd_global_ai_job_losses: 500, sources: ['https://example.com'] },
        { date: '2025-03-01', ytd_global_ai_job_losses: 1500, sources: ['https://example.com'] },
      ];
      
      const range = getSourceDateRange(points);
      expect(range).toEqual({ start: '2025-01-01', end: '2025-03-01' });
    });

    it('should return undefined for empty input', () => {
      expect(getSourceDateRange([])).toBeUndefined();
    });
  });

  describe('formatDateRange', () => {
    it('should format date range within same year', () => {
      expect(formatDateRange('2025-01-01', '2025-03-01')).toBe('Jan – Mar 2025');
    });

    it('should format date range across different years', () => {
      expect(formatDateRange('2024-11-01', '2025-02-01')).toBe('Nov 2024 – Feb 2025');
    });
  });
});
