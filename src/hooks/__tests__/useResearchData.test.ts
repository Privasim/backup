import { renderHook, waitFor } from '@testing-library/react';
import { useOccupationRisk, useOccupationSearch, useVisualization } from '../useResearchData';
import { getResearchService, initializeResearchService } from '../../lib/research/service';

// Mock the research service
jest.mock('../../lib/research/service');

const mockGetResearchService = getResearchService as jest.MockedFunction<typeof getResearchService>;
const mockInitializeResearchService = initializeResearchService as jest.MockedFunction<typeof initializeResearchService>;

describe('useResearchData hooks', () => {
  const mockService = {
    getOccupationRiskWithFallback: jest.fn(),
    searchOccupations: jest.fn(),
    getVisualizationConfig: jest.fn(),
    getTopRiskOccupations: jest.fn(),
    getIndustryData: jest.fn(),
    getTaskAutomationData: jest.fn(),
    getCacheStats: jest.fn(),
  };

  beforeEach(() => {
    mockGetResearchService.mockReturnValue(mockService as any);
    mockInitializeResearchService.mockResolvedValue(mockService as any);
    jest.clearAllMocks();
  });

  describe('useOccupationRisk', () => {
    const mockOccupationRisk = {
      occupation: {
        code: '15-1252',
        name: 'Software Developers',
        riskScore: 0.96,
        keyTasks: ['Programming', 'Design'],
        tableReferences: ['table_1'],
        confidence: 0.95,
      },
      riskLevel: 'very_high' as const,
      percentile: 85,
      similarOccupations: [],
    };

    it('should fetch occupation risk data', async () => {
      mockService.getOccupationRiskWithFallback.mockResolvedValue(mockOccupationRisk);

      const { result } = renderHook(() => useOccupationRisk('Software Developers'));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.occupationRisk).toBeNull();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.occupationRisk).toEqual(mockOccupationRisk);
      expect(result.current.error).toBeNull();
      expect(result.current.isInitialized).toBe(true);
    });

    it('should handle errors', async () => {
      const errorMessage = 'Occupation not found';
      mockService.getOccupationRiskWithFallback.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useOccupationRisk('Non-existent Job'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.occupationRisk).toBeNull();
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isInitialized).toBe(false);
    });

    it('should not fetch when no occupation identifier provided', () => {
      renderHook(() => useOccupationRisk(''));

      expect(mockService.getOccupationRiskWithFallback).not.toHaveBeenCalled();
    });

    it('should refetch when occupation identifier changes', async () => {
      mockService.getOccupationRiskWithFallback.mockResolvedValue(mockOccupationRisk);

      const { result, rerender } = renderHook(
        ({ occupation }) => useOccupationRisk(occupation),
        { initialProps: { occupation: 'Software Developers' } }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockService.getOccupationRiskWithFallback).toHaveBeenCalledWith('Software Developers');

      // Change occupation
      rerender({ occupation: 'Data Scientists' });

      await waitFor(() => {
        expect(mockService.getOccupationRiskWithFallback).toHaveBeenCalledWith('Data Scientists');
      });
    });

    it('should provide refetch function', async () => {
      mockService.getOccupationRiskWithFallback.mockResolvedValue(mockOccupationRisk);

      const { result } = renderHook(() => useOccupationRisk('Software Developers'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Call refetch
      await result.current.refetch();

      expect(mockService.getOccupationRiskWithFallback).toHaveBeenCalledTimes(2);
    });
  });

  describe('useOccupationSearch', () => {
    const mockSearchResults = [
      {
        occupation: {
          code: '15-1252',
          name: 'Software Developers',
          riskScore: 0.96,
          keyTasks: ['Programming'],
          tableReferences: ['table_1'],
          confidence: 0.95,
        },
        matchScore: 95,
        matchReasons: ['Exact name match'],
      },
    ];

    it('should search occupations', async () => {
      mockService.searchOccupations.mockResolvedValue(mockSearchResults);

      const { result } = renderHook(() => useOccupationSearch());

      expect(result.current.results).toEqual([]);
      expect(result.current.isLoading).toBe(false);

      // Perform search
      await result.current.search('software');

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.results).toEqual(mockSearchResults);
      expect(result.current.error).toBeNull();
      expect(result.current.isInitialized).toBe(true);
    });

    it('should handle search errors', async () => {
      const errorMessage = 'Search failed';
      mockService.searchOccupations.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useOccupationSearch());

      await result.current.search('software');

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.results).toEqual([]);
      expect(result.current.error).toBe(errorMessage);
    });

    it('should clear results', () => {
      const { result } = renderHook(() => useOccupationSearch());

      // Set some mock results
      result.current.clearResults();

      expect(result.current.results).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should handle empty query', async () => {
      const { result } = renderHook(() => useOccupationSearch());

      await result.current.search('');

      expect(result.current.results).toEqual([]);
      expect(mockService.searchOccupations).not.toHaveBeenCalled();
    });

    it('should pass filters to search', async () => {
      mockService.searchOccupations.mockResolvedValue(mockSearchResults);

      const { result } = renderHook(() => useOccupationSearch());

      const filters = { minRiskScore: 0.8, limit: 5 };
      await result.current.search('software', filters);

      expect(mockService.searchOccupations).toHaveBeenCalledWith('software', filters);
    });
  });

  describe('useVisualization', () => {
    const mockChartConfig = {
      type: 'bar' as const,
      title: 'Test Chart',
      data: [
        { label: 'Item 1', value: 10 },
        { label: 'Item 2', value: 20 },
      ],
      options: {
        responsive: true,
      },
    };

    it('should fetch visualization config', async () => {
      mockService.getVisualizationConfig.mockResolvedValue(mockChartConfig);

      const { result } = renderHook(() => useVisualization('bar'));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.chartConfig).toBeNull();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.chartConfig).toEqual(mockChartConfig);
      expect(result.current.error).toBeNull();
      expect(result.current.isInitialized).toBe(true);
    });

    it('should handle visualization errors', async () => {
      const errorMessage = 'Visualization not found';
      mockService.getVisualizationConfig.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useVisualization('nonexistent'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.chartConfig).toBeNull();
      expect(result.current.error).toBe(errorMessage);
    });

    it('should not fetch when no chart type provided', () => {
      renderHook(() => useVisualization(''));

      expect(mockService.getVisualizationConfig).not.toHaveBeenCalled();
    });

    it('should refetch when chart type changes', async () => {
      mockService.getVisualizationConfig.mockResolvedValue(mockChartConfig);

      const { result, rerender } = renderHook(
        ({ chartType }) => useVisualization(chartType),
        { initialProps: { chartType: 'bar' } }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockService.getVisualizationConfig).toHaveBeenCalledWith('bar');

      // Change chart type
      rerender({ chartType: 'line' });

      await waitFor(() => {
        expect(mockService.getVisualizationConfig).toHaveBeenCalledWith('line');
      });
    });

    it('should provide refetch function', async () => {
      mockService.getVisualizationConfig.mockResolvedValue(mockChartConfig);

      const { result } = renderHook(() => useVisualization('bar'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Call refetch
      await result.current.refetch();

      expect(mockService.getVisualizationConfig).toHaveBeenCalledTimes(2);
    });
  });

  describe('service initialization', () => {
    it('should initialize service only once', async () => {
      const { result: result1 } = renderHook(() => useOccupationRisk('Software Developers'));
      const { result: result2 } = renderHook(() => useOccupationSearch());

      await waitFor(() => {
        expect(result1.current.isLoading).toBe(false);
      });

      // Service should be initialized only once despite multiple hooks
      expect(mockInitializeResearchService).toHaveBeenCalledTimes(1);
    });

    it('should handle service initialization failure', async () => {
      mockInitializeResearchService.mockRejectedValue(new Error('Init failed'));

      const { result } = renderHook(() => useOccupationRisk('Software Developers'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Init failed');
    });
  });
});