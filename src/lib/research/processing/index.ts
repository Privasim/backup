import { promises as fs } from 'fs';
import path from 'path';
import { RawTable, ExtractedText, PaperMetadata, KnowledgeBase } from '../types';
import { DataNormalizer, NormalizationResult } from './data-normalizer';
import { SchemaValidator } from './schema-validator';
import { ValidationEngine, ComprehensiveValidationResult } from './validation-engine';

export interface ProcessingConfig {
  outputPath: string;
  validateSchema?: boolean;
  runComprehensiveValidation?: boolean;
  sourcePdfPath?: string;
}

export interface ProcessingResult {
  success: boolean;
  knowledgeBase?: KnowledgeBase;
  validationResult?: ComprehensiveValidationResult;
  outputPath?: string;
  error?: string;
}

export class DataProcessor {
  private dataNormalizer: DataNormalizer;
  private schemaValidator: SchemaValidator;
  private validationEngine: ValidationEngine;

  constructor() {
    this.dataNormalizer = new DataNormalizer();
    this.schemaValidator = new SchemaValidator();
    this.validationEngine = new ValidationEngine();
  }

  async processExtractedData(
    rawTables: RawTable[],
    extractedText: ExtractedText,
    metadata: PaperMetadata,
    config: ProcessingConfig
  ): Promise<ProcessingResult> {
    const {
      outputPath,
      validateSchema = true,
      runComprehensiveValidation = true,
      sourcePdfPath,
    } = config;

    try {
      console.log('Starting data processing pipeline...');

      // Step 1: Normalize data
      console.log('Normalizing extracted data...');
      const normalizationResult = await this.dataNormalizer.normalizeData(rawTables, {
        standardizeOccupationNames: true,
        createCrossReferences: true,
        validateDataTypes: true,
      });

      if (normalizationResult.validationIssues.length > 0) {
        console.warn(`Found ${normalizationResult.validationIssues.length} normalization issues`);
        normalizationResult.validationIssues.forEach(issue => console.warn(`  - ${issue}`));
      }

      // Step 2: Build knowledge base
      console.log('Building knowledge base structure...');
      const knowledgeBase = await this.buildKnowledgeBase(
        normalizationResult,
        extractedText,
        metadata
      );

      // Step 3: Schema validation
      let validationResult: ComprehensiveValidationResult | undefined;
      if (validateSchema || runComprehensiveValidation) {
        console.log('Running validation...');
        
        if (runComprehensiveValidation) {
          validationResult = await this.validationEngine.validateKnowledgeBase(knowledgeBase, {
            crossCheckWithSource: !!sourcePdfPath,
            validateDataIntegrity: true,
            checkCompleteness: true,
            sourcePdfPath,
          });
        } else {
          const schemaResult = await this.schemaValidator.validateKnowledgeBase(knowledgeBase);
          // Convert to comprehensive result format for consistency
          validationResult = {
            overall: {
              isValid: schemaResult.isValid,
              errors: schemaResult.errors.map(e => ({
                type: 'structure' as const,
                message: e.message,
                location: e.field,
                severity: e.severity === 'critical' ? 'high' as const : e.severity as 'high' | 'medium',
              })),
              warnings: schemaResult.warnings.map(w => ({
                type: 'quality' as const,
                message: w.message,
                location: w.field,
              })),
              confidence: schemaResult.score / 100,
            },
            schema: schemaResult,
            dataIntegrity: { isValid: true, issues: [], score: 100 },
            completeness: { isComplete: true, missingElements: [], completenessScore: 100, recommendations: [] },
            qualityReport: {
              overallScore: schemaResult.score,
              dataAccuracy: 100,
              completeness: 100,
              consistency: schemaResult.score,
              reliability: schemaResult.score,
              recommendations: [],
              requiresManualReview: schemaResult.score < 85,
            },
          };
        }

        this.logValidationResults(validationResult);
      }

      // Step 4: Save knowledge base
      console.log(`Saving knowledge base to: ${outputPath}`);
      await this.saveKnowledgeBase(knowledgeBase, outputPath);

      console.log('Data processing completed successfully!');

      return {
        success: true,
        knowledgeBase,
        validationResult,
        outputPath,
      };

    } catch (error) {
      console.error('Data processing failed:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown processing error',
      };
    }
  }

  private async buildKnowledgeBase(
    normalizationResult: NormalizationResult,
    extractedText: ExtractedText,
    metadata: PaperMetadata
  ): Promise<KnowledgeBase> {
    // Extract methodology from text
    const methodology = {
      dataSources: [
        'O*NET Occupational Information Network',
        'Bureau of Labor Statistics Employment Data',
        'AI Capability Assessment Framework',
      ],
      analysisApproach: extractedText.sections.methodology || 
        'Task-level exposure analysis using weighted scoring of AI capabilities',
      confidence: extractedText.metadata.confidence,
      limitations: [
        'Based on current AI capabilities as of 2024',
        'Does not account for future technological developments',
        'Exposure does not directly translate to job displacement',
        'Industry-specific factors may modify actual impact',
      ],
    };

    // Create visualization configurations
    const visualizations = [
      {
        type: 'bar' as const,
        title: 'Top 10 Occupations by AI Exposure Risk',
        dataSource: 'occupations',
        config: {
          xAxis: 'name',
          yAxis: 'riskScore',
          limit: 10,
          color: '#e74c3c',
          showValues: true,
        },
      },
      {
        type: 'bar' as const,
        title: 'Industry-Level AI Exposure Comparison',
        dataSource: 'tables.industry_exposure',
        config: {
          xAxis: 'Industry',
          yAxis: 'Exposure Score',
          limit: 15,
          color: '#3498db',
          showValues: true,
          rotateLabels: true,
        },
      },
      {
        type: 'bar' as const,
        title: 'Task Automation Potential by Category',
        dataSource: 'tables.task_automation',
        config: {
          xAxis: 'Task Category',
          yAxis: 'Automation Potential',
          color: '#f39c12',
          showValues: true,
          rotateLabels: true,
        },
      },
    ];

    // Build extraction info
    const extractionInfo = {
      extractionDate: new Date().toISOString(),
      version: '1.0',
      toolsUsed: ['pdf_extraction', 'data_normalization', 'schema_validation'],
      qualityScore: this.calculateOverallQualityScore(normalizationResult, extractedText),
      manualReviewRequired: normalizationResult.validationIssues.length > 5,
    };

    return {
      metadata,
      methodology,
      occupations: normalizationResult.occupations,
      tables: normalizationResult.tables,
      visualizations,
      extractionInfo,
    };
  }

  private calculateOverallQualityScore(
    normalizationResult: NormalizationResult,
    extractedText: ExtractedText
  ): number {
    let score = 100;

    // Deduct for normalization issues
    score -= normalizationResult.validationIssues.length * 2;

    // Factor in extraction confidence
    score *= extractedText.metadata.confidence;

    // Ensure minimum data completeness
    if (normalizationResult.occupations.length < 10) {
      score -= 20;
    }
    if (normalizationResult.tables.length < 3) {
      score -= 15;
    }

    return Math.max(0, Math.min(100, score));
  }

  private async saveKnowledgeBase(knowledgeBase: KnowledgeBase, outputPath: string): Promise<void> {
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });

    // Save main knowledge base
    const jsonContent = JSON.stringify(knowledgeBase, null, 2);
    await fs.writeFile(outputPath, jsonContent, 'utf-8');

    // Save metadata file for versioning
    const metadataPath = path.join(outputDir, 'extraction_metadata.json');
    const extractionMetadata = {
      extractionDate: knowledgeBase.extractionInfo.extractionDate,
      version: knowledgeBase.extractionInfo.version,
      qualityScore: knowledgeBase.extractionInfo.qualityScore,
      occupationCount: knowledgeBase.occupations.length,
      tableCount: knowledgeBase.tables.length,
      manualReviewRequired: knowledgeBase.extractionInfo.manualReviewRequired,
    };

    await fs.writeFile(metadataPath, JSON.stringify(extractionMetadata, null, 2), 'utf-8');

    console.log(`Knowledge base saved: ${outputPath}`);
    console.log(`Metadata saved: ${metadataPath}`);
  }

  private logValidationResults(validationResult: ComprehensiveValidationResult): void {
    const { overall, qualityReport } = validationResult;

    console.log('\n📊 Validation Results:');
    console.log(`   Overall Valid: ${overall.isValid ? '✅' : '❌'}`);
    console.log(`   Quality Score: ${qualityReport.overallScore.toFixed(1)}%`);
    console.log(`   Data Accuracy: ${qualityReport.dataAccuracy.toFixed(1)}%`);
    console.log(`   Completeness: ${qualityReport.completeness.toFixed(1)}%`);
    console.log(`   Consistency: ${qualityReport.consistency.toFixed(1)}%`);
    console.log(`   Manual Review Required: ${qualityReport.requiresManualReview ? 'Yes' : 'No'}`);

    if (overall.errors.length > 0) {
      console.log('\n❌ Validation Errors:');
      overall.errors.forEach(error => {
        console.log(`   • ${error.message} (${error.location})`);
      });
    }

    if (overall.warnings.length > 0) {
      console.log('\n⚠️  Validation Warnings:');
      overall.warnings.forEach(warning => {
        console.log(`   • ${warning.message} (${warning.location})`);
      });
    }

    if (qualityReport.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      qualityReport.recommendations.forEach(rec => {
        console.log(`   • ${rec}`);
      });
    }
  }

  async loadKnowledgeBase(filePath: string): Promise<KnowledgeBase> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const knowledgeBase = JSON.parse(content) as KnowledgeBase;
      
      // Validate loaded data
      const validationResult = await this.schemaValidator.validateKnowledgeBase(knowledgeBase);
      
      if (!validationResult.isValid) {
        console.warn('Loaded knowledge base has validation issues');
        validationResult.errors.forEach(error => {
          console.warn(`  - ${error.message} (${error.field})`);
        });
      }

      return knowledgeBase;
    } catch (error) {
      throw new Error(`Failed to load knowledge base: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export convenience function
export async function processResearchData(
  rawTables: RawTable[],
  extractedText: ExtractedText,
  metadata: PaperMetadata,
  outputPath: string = './src/lib/research/data/ai_employment_risks.json'
): Promise<ProcessingResult> {
  const processor = new DataProcessor();
  
  return processor.processExtractedData(rawTables, extractedText, metadata, {
    outputPath,
    validateSchema: true,
    runComprehensiveValidation: true,
  });
}