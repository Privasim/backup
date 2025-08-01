import { DataNormalizer } from '../data-normalizer';
import { RawTable } from '../../types';

describe('DataNormalizer', () => {
  let normalizer: DataNormalizer;

  beforeEach(() => {
    normalizer = new DataNormalizer();
  });

  describe('normalizeData', () => {
    const mockRawTables: RawTable[] = [
      {
        pageNumber: 1,
        title: 'Occupation Exposure Table',
        headers: ['Occupation', 'SOC Code', 'Exposure Score', 'Employment'],
        rows: [
          ['Software Developers', '15-1252', '0.96', '1,847,900'],
          ['Data Scientists', '15-2051', '0.94', '113,300'],
        ],
        confidence: 0.95,
      },
      {
        pageNumber: 2,
        title: 'Industry Analysis',
        headers: ['Industry', 'NAICS Code', 'Exposure Score'],
        rows: [
          ['Information Technology', '54', '0.73'],
          ['Finance and Insurance', '52', '0.68'],
        ],
        confidence: 0.90,
      },
    ];

    it('should normalize raw tables to structured format', async () => {
      const result = await normalizer.normalizeData(mockRawTables);

      expect(result.tables).toHaveLength(2);
      expect(result.tables[0]).toHaveProperty('id');
      expect(result.tables[0]).toHaveProperty('title');
      expect(result.tables[0]).toHaveProperty('headers');
      expect(result.tables[0]).toHaveProperty('rows');
      expect(result.tables[0]).toHaveProperty('source');
    });

    it('should extract occupation data from tables', async () => {
      const result = await normalizer.normalizeData(mockRawTables);

      expect(result.occupations.length).toBeGreaterThan(0);
      
      const softwareDev = result.occupations.find(occ => 
        occ.name.includes('Software Developers')
      );
      
      expect(softwareDev).toBeDefined();
      expect(softwareDev!.code).toBe('15-1252');
      expect(softwareDev!.riskScore).toBe(0.96);
      expect(softwareDev!.keyTasks.length).toBeGreaterThan(0);
    });

    it('should standardize occupation names when enabled', async () => {
      const tablesWithVariations: RawTable[] = [
        {
          pageNumber: 1,
          headers: ['Occupation', 'SOC Code', 'Score'],
          rows: [
            ['Software Developers, Applications', '15-1252', '0.96'],
            ['Software Developers, Systems Software', '15-1253', '0.94'],
          ],
          confidence: 0.95,
        },
      ];

      const result = await normalizer.normalizeData(tablesWithVariations, {
        standardizeOccupationNames: true,
      });

      // Should standardize similar occupation names
      const standardizedNames = result.occupations.map(occ => occ.name);
      expect(standardizedNames).toContain('Software Developers');
    });

    it('should create cross-references between tables', async () => {
      const result = await normalizer.normalizeData(mockRawTables, {
        createCrossReferences: true,
      });

      expect(result.crossReferences).toBeDefined();
      // Should find relationships between tables with common fields
    });

    it('should validate data consistency', async () => {
      const inconsistentTables: RawTable[] = [
        {
          pageNumber: 1,
          headers: ['Occupation', 'Score'],
          rows: [
            ['Test Occupation', '1.5'], // Invalid score > 1
          ],
          confidence: 0.95,
        },
      ];

      const result = await normalizer.normalizeData(inconsistentTables, {
        validateDataTypes: true,
      });

      expect(result.validationIssues.length).toBeGreaterThan(0);
      expect(result.validationIssues[0]).toContain('Invalid risk score');
    });
  });

  describe('occupation name standardization', () => {
    it('should handle whitespace normalization', () => {
      const normalized = (normalizer as any).standardizeOccupationName('  Software   Developer  ');
      expect(normalized).toBe('Software Developer');
    });

    it('should remove special characters', () => {
      const normalized = (normalizer as any).standardizeOccupationName('Software Developer (Web)');
      expect(normalized).toBe('Software Developer Web');
    });

    it('should use predefined mappings', () => {
      const normalized = (normalizer as any).standardizeOccupationName('Software Developers, Applications');
      expect(normalized).toBe('Software Developers');
    });
  });

  describe('key tasks assignment', () => {
    it('should assign relevant tasks for software developers', () => {
      const tasks = (normalizer as any).getKeyTasksForSpecificOccupation('Software Developers');
      
      expect(tasks).toContain('Code generation and programming');
      expect(tasks).toContain('Software architecture design');
      expect(tasks.length).toBeGreaterThan(2);
    });

    it('should assign relevant tasks for data scientists', () => {
      const tasks = (normalizer as any).getKeyTasksForSpecificOccupation('Data Scientists');
      
      expect(tasks).toContain('Data analysis and modeling');
      expect(tasks).toContain('Statistical analysis and interpretation');
    });

    it('should provide fallback tasks for unknown occupations', () => {
      const tasks = (normalizer as any).getKeyTasksForSpecificOccupation('Unknown Occupation');
      
      expect(tasks).toContain('Professional knowledge work');
      expect(tasks.length).toBeGreaterThan(0);
    });
  });

  describe('cross-reference creation', () => {
    it('should find common fields between tables', () => {
      const headers1 = ['Occupation', 'SOC Code', 'Score'];
      const headers2 = ['Job Title', 'SOC', 'Risk Level'];
      
      const commonFields = (normalizer as any).findCommonFields(headers1, headers2);
      
      expect(commonFields).toContain('occupation');
      expect(commonFields).toContain('soc');
    });

    it('should identify related field terms', () => {
      const isRelated1 = (normalizer as any).areFieldsRelated('occupation', 'job');
      const isRelated2 = (normalizer as any).areFieldsRelated('soc code', 'classification');
      const isRelated3 = (normalizer as any).areFieldsRelated('score', 'risk');
      
      expect(isRelated1).toBe(true);
      expect(isRelated2).toBe(true);
      expect(isRelated3).toBe(true);
    });
  });

  describe('data validation', () => {
    it('should detect missing SOC codes', async () => {
      const invalidOccupations = [
        {
          code: '',
          name: 'Test Occupation',
          riskScore: 0.5,
          keyTasks: ['Task 1'],
          tableReferences: ['table_1'],
          confidence: 0.9,
        },
      ];

      const issues = (normalizer as any).validateDataConsistency([], invalidOccupations);
      
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0]).toContain('Missing SOC code');
    });

    it('should detect invalid risk scores', async () => {
      const invalidOccupations = [
        {
          code: '15-1252',
          name: 'Test Occupation',
          riskScore: 1.5, // Invalid: > 1
          keyTasks: ['Task 1'],
          tableReferences: ['table_1'],
          confidence: 0.9,
        },
      ];

      const issues = (normalizer as any).validateDataConsistency([], invalidOccupations);
      
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0]).toContain('Invalid risk score');
    });

    it('should detect missing key tasks', async () => {
      const invalidOccupations = [
        {
          code: '15-1252',
          name: 'Test Occupation',
          riskScore: 0.5,
          keyTasks: [], // Empty tasks
          tableReferences: ['table_1'],
          confidence: 0.9,
        },
      ];

      const issues = (normalizer as any).validateDataConsistency([], invalidOccupations);
      
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0]).toContain('No key tasks defined');
    });
  });
});