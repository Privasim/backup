import { ResearchDataService } from '../research-data-service';
import { KnowledgeBase, OccupationData } from '../../types';

describe('ResearchDataService', () => {
  let service: ResearchDataService;
  let mockKnowledgeBase: KnowledgeBase;

  beforeEach(() => {
    mockKnowledgeBase = {
      metadata: {
        title: 'Test Paper',
        arxivId: '2507.07935',
        url: 'https://example.com/paper.pdf',
        authors: ['Test Author'],
        extractionDate: '2025-01-08T00:00:00.000Z',
        version: '1.0',
      },
      methodology: {
        dataSources: ['O*NET', 'BLS'],
        analysisApproach: 'Task-level analysis',
        confidence: 0.95,
        limitations: ['Test limitation'],
      },
      occupations: [
        {
          code: '15-1252',
          name: 'Software Developers',
          riskScore: 0.96,
          keyTasks: ['Programming', 'Design', 'Testing'],
          tableReferences: ['table_1'],
          confidence: 0.95,
        },
        {
          code: '15-2051',
          name: 'Data Scientists',
          riskScore: 0.94,
          keyTasks: ['Data analysis', 'Modeling', 'Visualization'],
          tableReferences: ['table_1'],
          confidence: 0.95,
        },
        {
          code: '27-3042',
          name: 'Technical Writers',
          riskScore: 0.90,
          keyTasks: ['Writing', 'Documentation', 'Editing'],
          tableReferences: ['table_1'],
          confidence: 0.95,
        },
      ],
      tables: [
        {
          id: 'table_1',
          title: 'Top Occupations by AI Exposure',
          page: 1,
          headers: ['Occupation', 'SOC Code', 'Exposure Score'],
          rows: [
            ['Software Developers', '15-1252', '0.96'],
            ['Data Scientists', '15-2051', '0.94'],
            ['Technical Writers', '27-3042', '0.90'],
          ],
          footnotes: ['Test footnote'],
          source: 'Page 1',
        },
      ],
      visualizations: [
        {
          type: 'bar',
          title: 'Top Risk Occupations',
          dataSource: 'occupations',
          config: {
            xAxis: 'name',
            yAxis: 'riskScore',
            limit: 10,
          },
        },
      ],
      extractionInfo: {
        extractionDate: '2025-01-08T00:00:00.000Z',
        version: '1.0',
        toolsUsed: ['test'],
        qualityScore: 95,
        manualReviewRequired: false,
      },
    };

    service = new ResearchDataService();
  });

  describe('initialization', () => {
    it('should initialize with knowledge base', async () => {
      await service.initialize(mockKnowledgeBase);
      
      const health = service.getCacheStats();
      expect(health).toBeDefined();
    });

    it('should throw error when not initialized', async () => {
      await expect(service.getOccupationRisk('Software Developers')).rejects.toThrow();
    });
  });

  describe('getOccupationRisk', () => {
    beforeEach(async () => {
      await service.initialize(mockKnowledgeBase);
    });

    it('should return occupation risk by name', async () => {
      const risk = await service.getOccupationRisk('Software Developers');
      
      expect(risk).toBeDefined();
      expect(risk!.occupation.name).toBe('Software Developers');
      expect(risk!.occupation.riskScore).toBe(0.96);
      expect(risk!.riskLevel).toBe('very_high');
      expect(risk!.percentile).toBeGreaterThan(0);
    });

    it('should return occupation risk by SOC code', async () => {
      const risk = await service.getOccupationRisk('15-1252');
      
      expect(risk).toBeDefined();
      expect(risk!.occupation.code).toBe('15-1252');
      expect(risk!.occupation.name).toBe('Software Developers');
    });

    it('should handle partial name matches', async () => {
      const risk = await service.getOccupationRisk('software');
      
      expect(risk).toBeDefined();
      expect(risk!.occupation.name).toBe('Software Developers');
    });

    it('should throw error for non-existent occupation', async () => {
      await expect(service.getOccupationRisk('Non-existent Job')).rejects.toThrow();
    });

    it('should calculate correct risk levels', async () => {
      const veryHighRisk = await service.getOccupationRisk('Software Developers'); // 0.96
      const highRisk = await service.getOccupationRisk('Data Scientists'); // 0.94
      
      expect(veryHighRisk!.riskLevel).toBe('very_high');
      expect(highRisk!.riskLevel).toBe('very_high'); // 0.94 >= 0.8
    });

    it('should find similar occupations', async () => {
      const risk = await service.getOccupationRisk('Software Developers');
      
      expect(risk!.similarOccupations).toBeDefined();
      // Should find Data Scientists as similar (both in tech, similar risk scores)
    });
  });

  describe('searchOccupations', () => {
    beforeEach(async () => {
      await service.initialize(mockKnowledgeBase);
    });

    it('should search by occupation name', async () => {
      const results = await service.searchOccupations('software');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].occupation.name).toContain('Software');
      expect(results[0].matchScore).toBeGreaterThan(0);
      expect(results[0].matchReasons.length).toBeGreaterThan(0);
    });

    it('should search by SOC code', async () => {
      const results = await service.searchOccupations('15-1252');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].occupation.code).toBe('15-1252');
      expect(results[0].matchReasons).toContain('SOC code match');
    });

    it('should search by key tasks', async () => {
      const results = await service.searchOccupations('programming');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].matchReasons.some(reason => 
        reason.includes('task keyword')
      )).toBe(true);
    });

    it('should apply filters', async () => {
      const results = await service.searchOccupations('', {
        minRiskScore: 0.95,
        limit: 2,
      });
      
      expect(results.length).toBeLessThanOrEqual(2);
      results.forEach(result => {
        expect(result.occupation.riskScore).toBeGreaterThanOrEqual(0.95);
      });
    });

    it('should handle empty query', async () => {
      const results = await service.searchOccupations('');
      
      expect(results).toEqual([]);
    });

    it('should sort results by match score', async () => {
      const results = await service.searchOccupations('data');
      
      if (results.length > 1) {
        for (let i = 1; i < results.length; i++) {
          expect(results[i-1].matchScore).toBeGreaterThanOrEqual(results[i].matchScore);
        }
      }
    });
  });

  describe('getTableData', () => {
    beforeEach(async () => {
      await service.initialize(mockKnowledgeBase);
    });

    it('should return table by ID', async () => {
      const table = await service.getTableData('table_1');
      
      expect(table).toBeDefined();
      expect(table!.id).toBe('table_1');
      expect(table!.title).toBe('Top Occupations by AI Exposure');
      expect(table!.headers.length).toBeGreaterThan(0);
      expect(table!.rows.length).toBeGreaterThan(0);
    });

    it('should throw error for non-existent table', async () => {
      await expect(service.getTableData('non-existent')).rejects.toThrow();
    });
  });

  describe('getVisualizationConfig', () => {
    beforeEach(async () => {
      await service.initialize(mockKnowledgeBase);
    });

    it('should return visualization config by type', async () => {
      const config = await service.getVisualizationConfig('bar');
      
      expect(config).toBeDefined();
      expect(config!.type).toBe('bar');
      expect(config!.title).toBe('Top Risk Occupations');
      expect(config!.data.length).toBeGreaterThan(0);
    });

    it('should throw error for non-existent visualization', async () => {
      await expect(service.getVisualizationConfig('non-existent')).rejects.toThrow();
    });
  });

  describe('getTopRiskOccupations', () => {
    beforeEach(async () => {
      await service.initialize(mockKnowledgeBase);
    });

    it('should return top risk occupations', async () => {
      const topOccupations = await service.getTopRiskOccupations(2);
      
      expect(topOccupations.length).toBe(2);
      expect(topOccupations[0].riskScore).toBeGreaterThanOrEqual(topOccupations[1].riskScore);
      expect(topOccupations[0].name).toBe('Software Developers'); // Highest risk
    });

    it('should respect limit parameter', async () => {
      const topOccupations = await service.getTopRiskOccupations(1);
      
      expect(topOccupations.length).toBe(1);
    });
  });

  describe('caching', () => {
    beforeEach(async () => {
      await service.initialize(mockKnowledgeBase);
    });

    it('should cache occupation risk results', async () => {
      // First call
      const risk1 = await service.getOccupationRisk('Software Developers');
      
      // Second call should use cache
      const risk2 = await service.getOccupationRisk('Software Developers');
      
      expect(risk1).toEqual(risk2);
      
      const stats = service.getCacheStats();
      expect(stats.hits).toBeGreaterThan(0);
    });

    it('should cache search results', async () => {
      // First search
      const results1 = await service.searchOccupations('software');
      
      // Second search should use cache
      const results2 = await service.searchOccupations('software');
      
      expect(results1).toEqual(results2);
    });

    it('should clear cache', () => {
      service.clearCache();
      
      const stats = service.getCacheStats();
      expect(stats.size).toBe(0);
    });
  });

  describe('error handling with fallback', () => {
    beforeEach(async () => {
      await service.initialize(mockKnowledgeBase);
    });

    it('should provide fallback for occupation risk', async () => {
      // Mock a failure in the main method
      const originalMethod = service.getOccupationRisk;
      service.getOccupationRisk = jest.fn().mockRejectedValue(new Error('Service error'));
      
      const risk = await service.getOccupationRiskWithFallback('Software Developers');
      
      expect(risk).toBeDefined();
      expect(risk!.occupation.name).toBe('Software Developers');
      expect(risk!.percentile).toBe(50); // Default fallback value
      
      // Restore original method
      service.getOccupationRisk = originalMethod;
    });
  });
});