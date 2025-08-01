import { promises as fs } from 'fs';
import { KnowledgeBase, ValidationResult, TableData, OccupationData } from '../types';
import { SchemaValidator, SchemaValidationResult } from './schema-validator';

export interface ValidationConfig {
  crossCheckWithSource?: boolean;
  validateDataIntegrity?: boolean;
  checkCompleteness?: boolean;
  sourcePdfPath?: string;
}

export interface ComprehensiveValidationResult {
  overall: ValidationResult;
  schema: SchemaValidationResult;
  dataIntegrity: DataIntegrityResult;
  completeness: CompletenessResult;
  qualityReport: QualityReport;
}

export interface DataIntegrityResult {
  isValid: boolean;
  issues: DataIntegrityIssue[];
  score: number;
}

export interface DataIntegrityIssue {
  type: 'inconsistency' | 'outlier' | 'missing_data' | 'format_error';
  field: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  affectedRecords: number;
}

export interface CompletenessResult {
  isComplete: boolean;
  missingElements: string[];
  completenessScore: number;
  recommendations: string[];
}

export interface QualityReport {
  overallScore: number;
  dataAccuracy: number;
  completeness: number;
  consistency: number;
  reliability: number;
  recommendations: string[];
  requiresManualReview: boolean;
}

export class ValidationEngine {
  private schemaValidator: SchemaValidator;

  constructor() {
    this.schemaValidator = new SchemaValidator();
  }

  async validateKnowledgeBase(
    knowledgeBase: KnowledgeBase,
    config: ValidationConfig = {}
  ): Promise<ComprehensiveValidationResult> {
    console.log('Starting comprehensive validation...');

    const {
      crossCheckWithSource = false,
      validateDataIntegrity = true,
      checkCompleteness = true,
      sourcePdfPath,
    } = config;

    // Schema validation
    const schema = await this.schemaValidator.validateKnowledgeBase(knowledgeBase, {
      strictMode: true,
      validateReferences: true,
      checkDataTypes: true,
    });

    // Data integrity validation
    const dataIntegrity = validateDataIntegrity
      ? await this.validateDataIntegrity(knowledgeBase)
      : this.createEmptyDataIntegrityResult();

    // Completeness validation
    const completeness = checkCompleteness
      ? await this.validateCompleteness(knowledgeBase)
      : this.createEmptyCompletenessResult();

    // Source cross-check (if PDF available)
    if (crossCheckWithSource && sourcePdfPath) {
      await this.crossCheckWithSource(knowledgeBase, sourcePdfPath, dataIntegrity);
    }

    // Generate quality report
    const qualityReport = this.generateQualityReport(schema, dataIntegrity, completeness);

    // Overall validation result
    const overall: ValidationResult = {
      isValid: schema.isValid && dataIntegrity.isValid && completeness.isComplete,
      errors: [
        ...schema.errors.map(e => ({
          type: 'structure' as const,
          message: e.message,
          location: e.field,
          severity: e.severity === 'critical' ? 'high' as const : e.severity as 'high' | 'medium',
        })),
        ...dataIntegrity.issues
          .filter(i => i.severity === 'high')
          .map(i => ({
            type: 'data' as const,
            message: i.message,
            location: i.field,
            severity: 'high' as const,
          })),
      ],
      warnings: [
        ...schema.warnings.map(w => ({
          type: 'quality' as const,
          message: w.message,
          location: w.field,
        })),
        ...dataIntegrity.issues
          .filter(i => i.severity !== 'high')
          .map(i => ({
            type: 'quality' as const,
            message: i.message,
            location: i.field,
          })),
      ],
      confidence: qualityReport.overallScore / 100,
    };

    console.log(`Validation complete. Overall score: ${qualityReport.overallScore}%`);

    return {
      overall,
      schema,
      dataIntegrity,
      completeness,
      qualityReport,
    };
  }

  private async validateDataIntegrity(knowledgeBase: KnowledgeBase): Promise<DataIntegrityResult> {
    const issues: DataIntegrityIssue[] = [];

    // Validate occupation data integrity
    if (knowledgeBase.occupations) {
      this.validateOccupationDataIntegrity(knowledgeBase.occupations, issues);
    }

    // Validate table data integrity
    if (knowledgeBase.tables) {
      this.validateTableDataIntegrity(knowledgeBase.tables, issues);
    }

    // Cross-validate occupation and table data
    if (knowledgeBase.occupations && knowledgeBase.tables) {
      this.crossValidateOccupationTableData(knowledgeBase.occupations, knowledgeBase.tables, issues);
    }

    const score = this.calculateDataIntegrityScore(issues);
    const isValid = issues.filter(i => i.severity === 'high').length === 0;

    return {
      isValid,
      issues,
      score,
    };
  }

  private validateOccupationDataIntegrity(occupations: OccupationData[], issues: DataIntegrityIssue[]): void {
    const riskScores = occupations.map(o => o.riskScore).filter(s => typeof s === 'number');
    const confidenceScores = occupations.map(o => o.confidence).filter(s => typeof s === 'number');

    // Check for outliers in risk scores
    const riskOutliers = this.findOutliers(riskScores);
    if (riskOutliers.length > 0) {
      issues.push({
        type: 'outlier',
        field: 'occupations.riskScore',
        message: `Found ${riskOutliers.length} potential outliers in risk scores`,
        severity: 'medium',
        affectedRecords: riskOutliers.length,
      });
    }

    // Check for inconsistent confidence scores
    const lowConfidenceCount = confidenceScores.filter(c => c < 0.7).length;
    if (lowConfidenceCount > occupations.length * 0.2) {
      issues.push({
        type: 'inconsistency',
        field: 'occupations.confidence',
        message: `High number of low-confidence occupations (${lowConfidenceCount})`,
        severity: 'medium',
        affectedRecords: lowConfidenceCount,
      });
    }

    // Check for missing key tasks
    const missingTasksCount = occupations.filter(o => !o.keyTasks || o.keyTasks.length === 0).length;
    if (missingTasksCount > 0) {
      issues.push({
        type: 'missing_data',
        field: 'occupations.keyTasks',
        message: `${missingTasksCount} occupations missing key tasks`,
        severity: 'medium',
        affectedRecords: missingTasksCount,
      });
    }

    // Check for duplicate SOC codes
    const socCodes = occupations.map(o => o.code).filter(Boolean);
    const duplicateCodes = this.findDuplicates(socCodes);
    if (duplicateCodes.length > 0) {
      issues.push({
        type: 'inconsistency',
        field: 'occupations.code',
        message: `Found duplicate SOC codes: ${duplicateCodes.join(', ')}`,
        severity: 'high',
        affectedRecords: duplicateCodes.length,
      });
    }
  }

  private validateTableDataIntegrity(tables: TableData[], issues: DataIntegrityIssue[]): void {
    for (const table of tables) {
      // Check for empty cells in critical columns
      if (table.headers.includes('Exposure Score') || table.headers.includes('Risk Score')) {
        const scoreColumnIndex = table.headers.findIndex(h => 
          h.includes('Exposure Score') || h.includes('Risk Score')
        );
        
        if (scoreColumnIndex !== -1) {
          const emptyCells = table.rows.filter(row => 
            !row[scoreColumnIndex] || row[scoreColumnIndex].toString().trim() === ''
          ).length;
          
          if (emptyCells > 0) {
            issues.push({
              type: 'missing_data',
              field: `tables.${table.id}.scoreColumn`,
              message: `${emptyCells} empty cells in score column`,
              severity: 'high',
              affectedRecords: emptyCells,
            });
          }
        }
      }

      // Check for inconsistent data formats
      this.validateTableDataFormats(table, issues);
    }
  }

  private validateTableDataFormats(table: TableData, issues: DataIntegrityIssue[]): void {
    for (let colIndex = 0; colIndex < table.headers.length; colIndex++) {
      const header = table.headers[colIndex];
      const columnData = table.rows.map(row => row[colIndex]);

      // Check numeric columns
      if (header.toLowerCase().includes('score') || header.toLowerCase().includes('wage')) {
        const numericValues = columnData.filter(cell => {
          const cleaned = cell?.toString().replace(/[$,%]/g, '');
          return !isNaN(parseFloat(cleaned));
        });

        if (numericValues.length < columnData.length * 0.8) {
          issues.push({
            type: 'format_error',
            field: `tables.${table.id}.${header}`,
            message: `Inconsistent numeric format in column '${header}'`,
            severity: 'medium',
            affectedRecords: columnData.length - numericValues.length,
          });
        }
      }

      // Check for excessive empty cells
      const emptyCells = columnData.filter(cell => 
        !cell || cell.toString().trim() === ''
      ).length;

      if (emptyCells > columnData.length * 0.1) {
        issues.push({
          type: 'missing_data',
          field: `tables.${table.id}.${header}`,
          message: `High number of empty cells in column '${header}' (${emptyCells}/${columnData.length})`,
          severity: 'medium',
          affectedRecords: emptyCells,
        });
      }
    }
  }

  private crossValidateOccupationTableData(
    occupations: OccupationData[],
    tables: TableData[],
    issues: DataIntegrityIssue[]
  ): void {
    // Find occupation table for cross-validation
    const occupationTable = tables.find(t => 
      t.title.toLowerCase().includes('occupation') && 
      t.headers.some(h => h.toLowerCase().includes('exposure') || h.toLowerCase().includes('score'))
    );

    if (!occupationTable) {
      issues.push({
        type: 'missing_data',
        field: 'tables',
        message: 'No occupation exposure table found for cross-validation',
        severity: 'medium',
        affectedRecords: 0,
      });
      return;
    }

    // Cross-validate occupation names and scores
    const tableOccupations = new Set(
      occupationTable.rows.map(row => row[0]?.toString().toLowerCase())
    );

    const missingInTable = occupations.filter(occ => 
      !tableOccupations.has(occ.name.toLowerCase())
    ).length;

    if (missingInTable > 0) {
      issues.push({
        type: 'inconsistency',
        field: 'occupations',
        message: `${missingInTable} occupations not found in source table`,
        severity: 'medium',
        affectedRecords: missingInTable,
      });
    }
  }

  private async validateCompleteness(knowledgeBase: KnowledgeBase): Promise<CompletenessResult> {
    const missingElements: string[] = [];
    const recommendations: string[] = [];

    // Check for essential data completeness
    if (!knowledgeBase.occupations || knowledgeBase.occupations.length < 10) {
      missingElements.push('Insufficient occupation data (minimum 10 required)');
      recommendations.push('Extract more occupation data from the source paper');
    }

    if (!knowledgeBase.tables || knowledgeBase.tables.length < 3) {
      missingElements.push('Insufficient table data (minimum 3 tables required)');
      recommendations.push('Ensure all key tables are extracted from the paper');
    }

    // Check for methodology information
    if (!knowledgeBase.methodology || !knowledgeBase.methodology.dataSources) {
      missingElements.push('Missing methodology information');
      recommendations.push('Extract methodology section from the paper');
    }

    // Check for visualization configurations
    if (!knowledgeBase.visualizations || knowledgeBase.visualizations.length === 0) {
      missingElements.push('No visualization configurations defined');
      recommendations.push('Define visualization configurations for the frontend');
    }

    // Calculate completeness score
    const totalRequiredElements = 10; // Adjust based on requirements
    const missingCount = missingElements.length;
    const completenessScore = Math.max(0, (totalRequiredElements - missingCount) / totalRequiredElements * 100);

    return {
      isComplete: missingElements.length === 0,
      missingElements,
      completenessScore,
      recommendations,
    };
  }

  private async crossCheckWithSource(
    knowledgeBase: KnowledgeBase,
    sourcePdfPath: string,
    dataIntegrity: DataIntegrityResult
  ): Promise<void> {
    // This would implement actual PDF cross-checking in production
    // For now, we'll add a placeholder validation
    console.log(`Cross-checking with source PDF: ${sourcePdfPath}`);
    
    try {
      await fs.access(sourcePdfPath);
      console.log('Source PDF accessible for cross-validation');
    } catch {
      dataIntegrity.issues.push({
        type: 'missing_data',
        field: 'source',
        message: 'Source PDF not accessible for cross-validation',
        severity: 'medium',
        affectedRecords: 0,
      });
    }
  }

  private generateQualityReport(
    schema: SchemaValidationResult,
    dataIntegrity: DataIntegrityResult,
    completeness: CompletenessResult
  ): QualityReport {
    const dataAccuracy = dataIntegrity.score;
    const completenessScore = completeness.completenessScore;
    const consistency = schema.score;
    const reliability = Math.min(dataAccuracy, consistency);

    const overallScore = (dataAccuracy + completenessScore + consistency + reliability) / 4;

    const recommendations: string[] = [
      ...completeness.recommendations,
    ];

    // Add specific recommendations based on scores
    if (dataAccuracy < 80) {
      recommendations.push('Review and correct data integrity issues');
    }
    if (completenessScore < 80) {
      recommendations.push('Extract additional data to improve completeness');
    }
    if (consistency < 80) {
      recommendations.push('Address schema validation errors and warnings');
    }

    const requiresManualReview = overallScore < 85 || 
      schema.errors.some(e => e.severity === 'critical') ||
      dataIntegrity.issues.some(i => i.severity === 'high');

    return {
      overallScore,
      dataAccuracy,
      completeness: completenessScore,
      consistency,
      reliability,
      recommendations,
      requiresManualReview,
    };
  }

  private calculateDataIntegrityScore(issues: DataIntegrityIssue[]): number {
    let score = 100;

    for (const issue of issues) {
      switch (issue.severity) {
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 8;
          break;
        case 'low':
          score -= 3;
          break;
      }
    }

    return Math.max(0, score);
  }

  private findOutliers(values: number[]): number[] {
    if (values.length < 4) return [];

    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    return values.filter(v => v < lowerBound || v > upperBound);
  }

  private findDuplicates<T>(array: T[]): T[] {
    const seen = new Set<T>();
    const duplicates = new Set<T>();

    for (const item of array) {
      if (seen.has(item)) {
        duplicates.add(item);
      }
      seen.add(item);
    }

    return Array.from(duplicates);
  }

  private createEmptyDataIntegrityResult(): DataIntegrityResult {
    return {
      isValid: true,
      issues: [],
      score: 100,
    };
  }

  private createEmptyCompletenessResult(): CompletenessResult {
    return {
      isComplete: true,
      missingElements: [],
      completenessScore: 100,
      recommendations: [],
    };
  }
}