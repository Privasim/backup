import { ResearchDataExtractor } from '../extraction';
import { DataProcessor } from '../processing';
import { ResearchDataService } from '../service/research-data-service';
import { KnowledgeBase } from '../types';

describe('Research Data Integration Tests', () => {
  let extractor: ResearchDataExtractor;
  let processor: DataProcessor;
  let service: ResearchDataService;

  beforeEach(() => {
    extractor = new ResearchDataExtractor();
    processor = new DataProcessor();
    service = new ResearchDataService();
  });

  describe('End-to-End Data Flow', () => {
    it('should complete full extraction to service pipeline', async () => {
      // Step 1: Extract data from paper
      const extractionResult = await extractor.extractPaperData({
        arxivUrl: 'https://arxiv.org/pdf/2507.07935',
        outputDir: './test-output',
        sections: ['abstract', 'methodology', 'results'],
        exportCSV: false,
        exportText: false,
      });

      expect(extractionResult.success).toBe(true);
      expect(extractionResult.tables.length).toBeGreaterThan(0);
      expect(extractionResult.extractedText.sections).toBeDefined();

      // Step 2: Process extracted data
      const processingResult = await processor.processExtractedData(
        extractionResult.tables,
        extractionResult.extractedText,
        extractionResult.metadata,
        {
          outputPath: './test-output/knowledge-base.json',
          validateSchema: true,
          runComprehensiveValidation: true,
        }
      );

      expect(processingResult.success).toBe(true);
      expect(processingResult.knowledgeBase).toBeDefined();
      expect(processingResult.validationResult?.overall.isValid).toBe(true);

      // Step 3: Initialize service with processed data
      await service.initialize(processingResult.knowledgeBase!);

      // Step 4: Test service functionality
      const occupationRisk = await service.getOccupationRisk('Software Developers');
      expect(occupationRisk).toBeDefined();
      expect(occupationRisk!.occupation.riskScore).toBeGreaterThan(0);

      const searchResults = await service.searchOccupations('software');
      expect(searchResults.length).toBeGreaterThan(0);

      const topRisk = await service.getTopRiskOccupations(5);
      expect(topRisk.length).toBeLessThanOrEqual(5);
    }, 30000); // 30 second timeout for integration test

    it('should handle extraction errors gracefully', async () => {
      const extractionResult = await extractor.extractPaperData({
        arxivUrl: 'https://invalid-url.com/nonexistent.pdf',
        outputDir: './test-output',
        sections: ['abstract'],
      });

      expect(extractionResult.success).toBe(false);
      expect(extractionResult.error).toBeDefined();
    });

    it('should validate data consistency across pipeline', async () => {
      // Extract with real data
      const extractionResult = await extractor.extractPaperData({
        arxivUrl: 'https://arxiv.org/pdf/2507.07935',
        outputDir: './test-output',
        sections: ['abstract', 'methodology', 'results'],
      });

      if (!extractionResult.success) {
        throw new Error('Extraction failed');
      }

      // Process data
      const processingResult = await processor.processExtractedData(
        extractionResult.tables,
        extractionResult.extractedText,
        extractionResult.metadata,
        {
          outputPath: './test-output/knowledge-base.json',
          runComprehensiveValidation: true,
        }
      );

      expect(processingResult.success).toBe(true);
      
      const validation = processingResult.validationResult!;
      
      // Check overall quality
      expect(validation.qualityReport.overallScore).toBeGreaterThan(80);
      
      // Check data integrity
      expect(validation.dataIntegrity.isValid).toBe(true);
      
      // Check completeness
      expect(validation.completeness.isComplete).toBe(true);
      
      // Verify occupation data consistency
      const knowledgeBase = processingResult.knowledgeBase!;
      expect(knowledgeBase.occupations.length).toBeGreaterThan(10);
      expect(knowledgeBase.tables.length).toBeGreaterThan(3);
      
      // Check that all occupations have valid risk scores
      knowledgeBase.occupations.forEach(occupation => {
        expect(occupation.riskScore).toBeGreaterThanOrEqual(0);
        expect(occupation.riskScore).toBeLessThanOrEqual(1);
        expect(occupation.code).toBeTruthy();
        expect(occupation.name).toBeTruthy();
        expect(occupation.keyTasks.length).toBeGreaterThan(0);
      });
    }, 45000);
  });

  describe('Data Accuracy Validation', () => {
    let knowledgeBase: KnowledgeBase;

    beforeEach(async () => {
      // Load the actual knowledge base for testing
      const fs = require('fs').promises;
      const knowledgeBaseContent = await fs.readFile(
        './src/lib/research/data/ai_employment_risks.json',
        'utf-8'
      );
      knowledgeBase = JSON.parse(knowledgeBaseContent);
      await service.initialize(knowledgeBase);
    });

    it('should have accurate occupation data from research paper', async () => {
      // Test specific occupations mentioned in the paper
      const softwareDev = await service.getOccupationRisk('Software Developers');
      expect(softwareDev).toBeDefined();
      expect(softwareDev!.occupation.riskScore).toBe(0.96); // From paper
      expect(softwareDev!.occupation.code).toBe('15-1252');

      const dataScientist = await service.getOccupationRisk('Data Scientists');
      expect(dataScientist).toBeDefined();
      expect(dataScientist!.occupation.riskScore).toBe(0.94); // From paper
      expect(dataScientist!.occupation.code).toBe('15-2051');

      const technicalWriter = await service.getOccupationRisk('Technical Writers');
      expect(technicalWriter).toBeDefined();
      expect(technicalWriter!.occupation.riskScore).toBe(0.90); // From paper
      expect(technicalWriter!.occupation.code).toBe('27-3042');
    });

    it('should have correct industry data', async () => {
      const industryData = await service.getIndustryData();
      expect(industryData.length).toBeGreaterThan(15);

      // Check specific industries from the paper
      const techServices = industryData.find(ind => 
        ind.industry.includes('Professional, Scientific, and Technical Services')
      );
      expect(techServices).toBeDefined();
      expect(techServices!.exposureScore).toBe(0.73);

      const financeInsurance = industryData.find(ind => 
        ind.industry.includes('Finance and Insurance')
      );
      expect(financeInsurance).toBeDefined();
      expect(financeInsurance!.exposureScore).toBe(0.68);
    });

    it('should have correct task automation data', async () => {
      const taskData = await service.getTaskAutomationData();
      expect(taskData.length).toBeGreaterThan(8);

      // Check specific task categories from the paper
      const infoProcessing = taskData.find(task => 
        task.taskCategory === 'Information Processing'
      );
      expect(infoProcessing).toBeDefined();
      expect(infoProcessing!.automationPotential).toBe(0.89);

      const contentCreation = taskData.find(task => 
        task.taskCategory === 'Content Creation'
      );
      expect(contentCreation).toBeDefined();
      expect(contentCreation!.automationPotential).toBe(0.87);
    });

    it('should maintain data relationships', async () => {
      // Check that occupation table references are valid
      const softwareDev = await service.getOccupationRisk('Software Developers');
      expect(softwareDev!.occupation.tableReferences.length).toBeGreaterThan(0);

      // Verify referenced tables exist
      for (const tableRef of softwareDev!.occupation.tableReferences) {
        const table = await service.getTableData(tableRef);
        expect(table).toBeDefined();
      }
    });

    it('should have consistent metadata', () => {
      expect(knowledgeBase.metadata.title).toBe('The Impact of Generative AI on Employment');
      expect(knowledgeBase.metadata.arxivId).toBe('2507.07935');
      expect(knowledgeBase.metadata.authors).toContain('Edward W. Felten');
      expect(knowledgeBase.metadata.authors).toContain('Manav Raj');
      expect(knowledgeBase.metadata.authors).toContain('Robert Seamans');
    });
  });

  describe('Performance and Scalability', () => {
    beforeEach(async () => {
      const fs = require('fs').promises;
      const knowledgeBaseContent = await fs.readFile(
        './src/lib/research/data/ai_employment_risks.json',
        'utf-8'
      );
      const knowledgeBase = JSON.parse(knowledgeBaseContent);
      await service.initialize(knowledgeBase);
    });

    it('should handle multiple concurrent requests', async () => {
      const requests = [
        service.getOccupationRisk('Software Developers'),
        service.getOccupationRisk('Data Scientists'),
        service.searchOccupations('engineer'),
        service.getTopRiskOccupations(10),
        service.getIndustryData(),
      ];

      const results = await Promise.all(requests);
      
      // All requests should complete successfully
      expect(results[0]).toBeDefined(); // Software Developers
      expect(results[1]).toBeDefined(); // Data Scientists
      expect(results[2].length).toBeGreaterThan(0); // Search results
      expect(results[3].length).toBe(10); // Top risk occupations
      expect(results[4].length).toBeGreaterThan(0); // Industry data
    });

    it('should maintain good cache performance', async () => {
      // Make multiple requests for the same data
      await service.getOccupationRisk('Software Developers');
      await service.getOccupationRisk('Software Developers');
      await service.getOccupationRisk('Software Developers');

      const stats = service.getCacheStats();
      expect(stats.hitRate).toBeGreaterThan(0.5); // At least 50% hit rate
      expect(stats.hits).toBeGreaterThan(0);
    });

    it('should handle large search queries efficiently', async () => {
      const startTime = Date.now();
      
      // Perform multiple searches
      const searches = [
        service.searchOccupations('software'),
        service.searchOccupations('data'),
        service.searchOccupations('engineer'),
        service.searchOccupations('analyst'),
        service.searchOccupations('developer'),
      ];

      const results = await Promise.all(searches);
      const endTime = Date.now();
      
      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds
      
      // All searches should return results
      results.forEach(result => {
        expect(result.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should recover from service initialization failures', async () => {
      // Try to initialize with invalid data
      const invalidKnowledgeBase = {
        metadata: null,
        occupations: [],
        tables: [],
      } as any;

      try {
        await service.initialize(invalidKnowledgeBase);
      } catch (error) {
        expect(error).toBeDefined();
      }

      // Should be able to initialize with valid data afterwards
      const fs = require('fs').promises;
      const validKnowledgeBase = JSON.parse(
        await fs.readFile('./src/lib/research/data/ai_employment_risks.json', 'utf-8')
      );

      await expect(service.initialize(validKnowledgeBase)).resolves.not.toThrow();
    });

    it('should handle graceful degradation', async () => {
      const fs = require('fs').promises;
      const knowledgeBase = JSON.parse(
        await fs.readFile('./src/lib/research/data/ai_employment_risks.json', 'utf-8')
      );
      await service.initialize(knowledgeBase);

      // Test fallback methods
      const fallbackRisk = await service.getOccupationRiskWithFallback('Software Developers');
      expect(fallbackRisk).toBeDefined();
      expect(fallbackRisk!.occupation.name).toBe('Software Developers');
    });
  });
});