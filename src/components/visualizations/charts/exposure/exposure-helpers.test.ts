import {
  clamp,
  getSeverityBand,
  getSeverityLabel,
  getSeverityClass,
  calculateExposureStats,
  createHistogramBins,
  formatExposure,
  getExposureAriaLabel
} from './exposure-helpers';
import { AutomationExposureItem } from '@/components/insights/types';

describe('exposure-helpers', () => {
  describe('clamp', () => {
    it('should clamp values within range', () => {
      expect(clamp(50)).toBe(50);
      expect(clamp(-10)).toBe(0);
      expect(clamp(120)).toBe(100);
      expect(clamp(75, 0, 80)).toBe(75);
      expect(clamp(90, 0, 80)).toBe(80);
    });
  });

  describe('getSeverityBand', () => {
    it('should return correct severity bands', () => {
      expect(getSeverityBand(30)).toBe('low');
      expect(getSeverityBand(50)).toBe('moderate');
      expect(getSeverityBand(80)).toBe('high');
    });

    it('should use custom thresholds', () => {
      expect(getSeverityBand(25, 30, 60)).toBe('low');
      expect(getSeverityBand(45, 30, 60)).toBe('moderate');
      expect(getSeverityBand(65, 30, 60)).toBe('high');
    });
  });

  describe('getSeverityLabel', () => {
    it('should return capitalized severity labels', () => {
      expect(getSeverityLabel(30)).toBe('Low');
      expect(getSeverityLabel(50)).toBe('Moderate');
      expect(getSeverityLabel(80)).toBe('High');
    });
  });

  describe('getSeverityClass', () => {
    it('should return correct CSS classes', () => {
      expect(getSeverityClass('low')).toBe('badge-success');
      expect(getSeverityClass('moderate')).toBe('badge-warning');
      expect(getSeverityClass('high')).toBe('badge-error');
      expect(getSeverityClass('unknown')).toBe('badge-neutral');
    });
  });

  describe('calculateExposureStats', () => {
    const testData: AutomationExposureItem[] = [
      { task: 'Task 1', exposure: 20 },
      { task: 'Task 2', exposure: 40 },
      { task: 'Task 3', exposure: 60 },
      { task: 'Task 4', exposure: 80 },
      { task: 'Task 5', exposure: 100 }
    ];

    it('should calculate correct statistics', () => {
      const stats = calculateExposureStats(testData);
      expect(stats.avg).toBe(60);
      expect(stats.median).toBe(60);
      expect(stats.p90).toBe(100);
      expect(stats.counts).toEqual({
        high: 2,
        moderate: 1,
        low: 2,
        total: 5
      });
      expect(stats.topTask).toEqual({ task: 'Task 5', exposure: 100 });
      expect(stats.aboveThreshold).toBe(3);
      expect(stats.aboveThresholdPercent).toBe(60);
    });

    it('should handle empty data', () => {
      const stats = calculateExposureStats([]);
      expect(stats.avg).toBe(0);
      expect(stats.counts.total).toBe(0);
      expect(stats.topTask).toBeNull();
    });

    it('should filter by minimum exposure', () => {
      const stats = calculateExposureStats(testData, 50);
      expect(stats.counts.total).toBe(3);
      expect(stats.avg).toBe(80);
    });
  });

  describe('createHistogramBins', () => {
    const testData: AutomationExposureItem[] = [
      { task: 'Task 1', exposure: 5 },
      { task: 'Task 2', exposure: 15 },
      { task: 'Task 3', exposure: 25 },
      { task: 'Task 4', exposure: 35 },
      { task: 'Task 5', exposure: 45 },
      { task: 'Task 6', exposure: 55 },
      { task: 'Task 7', exposure: 65 },
      { task: 'Task 8', exposure: 75 },
      { task: 'Task 9', exposure: 85 },
      { task: 'Task 10', exposure: 95 }
    ];

    it('should create correct histogram bins', () => {
      const bins = createHistogramBins(testData, 10);
      expect(bins.length).toBe(10);
      
      // Each bin should have exactly one item
      bins.forEach(bin => {
        expect(bin.count).toBe(1);
      });
    });

    it('should handle custom bin count', () => {
      const bins = createHistogramBins(testData, 5);
      expect(bins.length).toBe(5);
      
      // Each bin should have exactly two items
      bins.forEach(bin => {
        expect(bin.count).toBe(2);
      });
    });

    it('should filter by minimum exposure', () => {
      const bins = createHistogramBins(testData, 10, 50);
      expect(bins.filter(bin => bin.count > 0).length).toBe(5);
    });
  });

  describe('formatExposure', () => {
    it('should format exposure values as percentages', () => {
      expect(formatExposure(42.5)).toBe('43%');
      expect(formatExposure(0)).toBe('0%');
      expect(formatExposure(100)).toBe('100%');
      expect(formatExposure(120)).toBe('100%');
    });
  });

  describe('getExposureAriaLabel', () => {
    it('should generate correct ARIA labels', () => {
      expect(getExposureAriaLabel(30)).toBe('Automation exposure: 30% (Low risk)');
      expect(getExposureAriaLabel(50)).toBe('Automation exposure: 50% (Moderate risk)');
      expect(getExposureAriaLabel(80)).toBe('Automation exposure: 80% (High risk)');
    });
  });
});
