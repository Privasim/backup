// Integration tests for cost analysis module

import { CostAnalysisService } from '../service/CostAnalysisService';
import { UserProfile } from '../types';

describe('CostAnalysisService Integration', () => {
  const mockUserProfile: UserProfile = {
    occupation: 'software-developer',
    experience: 'mid-level',
    location: 'san francisco',
    industry: 'technology',
    salaryRange: '$80k–$100k',
    skills: ['JavaScript', 'React', 'Node.js'],
  };

  let costService: CostAnalysisService;

  beforeEach(() => {
    costService = new CostAnalysisService();
  });

  describe('analyze', () => {
    it('should perform basic cost analysis with fallback data', async () => {
      const result = await costService.analyze(mockUserProfile, {
        fallbackToEstimates: true,
        includeInsights: false, // Skip LLM insights for basic test
        confidenceThreshold: 0.1,
      });

      expect(result).toBeTruthy();
      expect(result?.profile).toEqual(mockUserProfile);
      expect(result?.salaryData.median).toBeGreaterThan(0);
      expect(result?.aiCostData.annualCosts.total).toBeGreaterThan(0);
      expect(result?.comparison.human.total).toBeGreaterThan(0);
      expect(result?.comparison.ai.total).toBeGreaterThan(0);
    });

    it('should handle invalid occupation gracefully', async () => {
      const invalidProfile: UserProfile = {
        ...mockUserProfile,
        occupation: 'invalid-occupation-12345',
      };

      const result = await costService.analyze(invalidProfile, {
        fallbackToEstimates: true,
        confidenceThreshold: 0.1,
      });

      // Should still return a result with estimated data
      expect(result).toBeTruthy();
      expect(result?.salaryData.source).toBe('estimated');
    });

    it('should calculate reasonable cost comparisons', async () => {
      const result = await costService.analyze(mockUserProfile, {
        fallbackToEstimates: true,
        confidenceThreshold: 0.1,
      });

      expect(result).toBeTruthy();
      
      // Human costs should be reasonable for a software developer in SF
      expect(result!.comparison.human.total).toBeGreaterThan(50000);
      expect(result!.comparison.human.total).toBeLessThan(500000);
      
      // AI costs should be much lower
      expect(result!.comparison.ai.total).toBeGreaterThan(0);
      expect(result!.comparison.ai.total).toBeLessThan(50000);
      
      // Should show significant savings
      expect(result!.comparison.savings.absolute).toBeGreaterThan(0);
    });
  });

  describe('quickComparison', () => {
    it('should provide quick cost comparison', async () => {
      const result = await costService.quickComparison(mockUserProfile);

      expect(result).toBeTruthy();
      expect(result!.humanCost).toBeGreaterThan(0);
      expect(result!.aiCost).toBeGreaterThan(0);
      expect(result!.confidence).toBeGreaterThan(0);
      expect(result!.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('caching', () => {
    it('should cache analysis results', async () => {
      const startTime = Date.now();
      const result1 = await costService.analyze(mockUserProfile, {
        useCache: true,
        fallbackToEstimates: true,
      });
      const firstCallTime = Date.now() - startTime;

      const startTime2 = Date.now();
      const result2 = await costService.analyze(mockUserProfile, {
        useCache: true,
        fallbackToEstimates: true,
      });
      const secondCallTime = Date.now() - startTime2;

      expect(result1).toBeTruthy();
      expect(result2).toBeTruthy();
      
      // Second call should be faster (cached)
      expect(secondCallTime).toBeLessThan(firstCallTime);
      
      // Results should be identical
      expect(result1!.comparison.human.total).toBe(result2!.comparison.human.total);
      expect(result1!.comparison.ai.total).toBe(result2!.comparison.ai.total);
    });
  });
});