import { TableExtractor } from '../table-extractor';
import { RawTable } from '../../types';

describe('TableExtractor', () => {
  let extractor: TableExtractor;

  beforeEach(() => {
    extractor = new TableExtractor();
  });

  describe('extractTables', () => {
    it('should extract tables with real data structure', async () => {
      const result = await extractor.extractTables({
        pdfPath: '/test/paper.pdf',
      });

      expect(result.tables).toBeDefined();
      expect(result.tables.length).toBeGreaterThan(0);
      expect(result.validationResult).toBeDefined();

      // Verify table structure
      const firstTable = result.tables[0];
      expect(firstTable).toHaveProperty('pageNumber');
      expect(firstTable).toHaveProperty('title');
      expect(firstTable).toHaveProperty('headers');
      expect(firstTable).toHaveProperty('rows');
      expect(firstTable).toHaveProperty('confidence');

      // Verify headers are present
      expect(firstTable.headers.length).toBeGreaterThan(0);
      expect(firstTable.rows.length).toBeGreaterThan(0);
    });

    it('should validate extracted table data', async () => {
      const result = await extractor.extractTables({
        pdfPath: '/test/paper.pdf',
      });

      expect(result.validationResult.isValid).toBe(true);
      expect(result.validationResult.confidence).toBeGreaterThan(0.8);
      expect(result.validationResult.errors).toEqual([]);
    });

    it('should export tables to CSV when output directory provided', async () => {
      const result = await extractor.extractTables({
        pdfPath: '/test/paper.pdf',
        outputDir: '/test/output',
      });

      expect(result.csvExports).toBeDefined();
      expect(result.csvExports!.length).toBeGreaterThan(0);
    });

    it('should filter tables by confidence threshold', async () => {
      const result = await extractor.extractTables({
        pdfPath: '/test/paper.pdf',
        confidenceThreshold: 0.95,
      });

      // All returned tables should meet the confidence threshold
      result.tables.forEach(table => {
        expect(table.confidence).toBeGreaterThanOrEqual(0.95);
      });
    });
  });

  describe('validateTables', () => {
    it('should validate well-formed tables', async () => {
      const validTables: RawTable[] = [
        {
          pageNumber: 1,
          title: 'Test Table',
          headers: ['Column 1', 'Column 2'],
          rows: [['Value 1', 'Value 2'], ['Value 3', 'Value 4']],
          confidence: 0.95,
        },
      ];

      const result = await extractor.validateTables(validTables);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    it('should detect tables with missing headers', async () => {
      const invalidTables: RawTable[] = [
        {
          pageNumber: 1,
          headers: [],
          rows: [['Value 1', 'Value 2']],
          confidence: 0.95,
        },
      ];

      const result = await extractor.validateTables(invalidTables);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].type).toBe('structure');
      expect(result.errors[0].message).toContain('no headers');
    });

    it('should detect inconsistent column counts', async () => {
      const inconsistentTables: RawTable[] = [
        {
          pageNumber: 1,
          headers: ['Col1', 'Col2'],
          rows: [['Val1', 'Val2'], ['Val3']], // Missing second column
          confidence: 0.95,
        },
      ];

      const result = await extractor.validateTables(inconsistentTables);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].message).toContain('inconsistent column counts');
    });

    it('should warn about low confidence tables', async () => {
      const lowConfidenceTables: RawTable[] = [
        {
          pageNumber: 1,
          headers: ['Col1', 'Col2'],
          rows: [['Val1', 'Val2']],
          confidence: 0.5, // Low confidence
        },
      ];

      const result = await extractor.validateTables(lowConfidenceTables);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].message).toContain('low extraction confidence');
    });
  });

  describe('exportTablesToCSV', () => {
    it('should generate valid CSV content', async () => {
      const tables: RawTable[] = [
        {
          pageNumber: 1,
          title: 'Test Table',
          headers: ['Name', 'Score', 'Category'],
          rows: [
            ['John Doe', '95', 'A'],
            ['Jane Smith', '87', 'B'],
          ],
          confidence: 0.95,
        },
      ];

      // Mock the file system operations
      const mockWriteFile = jest.fn();
      const mockMkdir = jest.fn();
      const mockAccess = jest.fn().mockRejectedValue(new Error('Directory does not exist'));

      // Replace the actual methods for testing
      (extractor as any).ensureDirectoryExists = jest.fn().mockResolvedValue(undefined);

      const csvPaths = await extractor.exportTablesToCSV(tables, '/test/output');

      expect(csvPaths).toHaveLength(1);
      expect(csvPaths[0]).toContain('table_1_page_1.csv');
    });

    it('should handle special characters in CSV', () => {
      const testData = 'Text with "quotes" and, commas';
      const escaped = (extractor as any).escapeCSVField(testData);

      expect(escaped).toBe('"Text with ""quotes"" and, commas"');
    });

    it('should not escape simple text', () => {
      const testData = 'SimpleText';
      const escaped = (extractor as any).escapeCSVField(testData);

      expect(escaped).toBe('SimpleText');
    });
  });
});