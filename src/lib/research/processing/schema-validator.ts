import { KnowledgeBase, OccupationData, TableData, PaperMetadata, ValidationResult } from '../types';

export interface SchemaValidationConfig {
  strictMode?: boolean;
  validateReferences?: boolean;
  checkDataTypes?: boolean;
}

export interface SchemaValidationResult {
  isValid: boolean;
  errors: SchemaValidationError[];
  warnings: SchemaValidationWarning[];
  score: number;
}

export interface SchemaValidationError {
  field: string;
  message: string;
  severity: 'critical' | 'high' | 'medium';
  value?: any;
}

export interface SchemaValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
  value?: any;
}

export class SchemaValidator {
  private readonly requiredFields = {
    knowledgeBase: ['metadata', 'methodology', 'occupations', 'tables', 'visualizations', 'extractionInfo'],
    metadata: ['title', 'arxivId', 'url', 'authors', 'extractionDate', 'version'],
    occupation: ['code', 'name', 'riskScore', 'keyTasks', 'tableReferences', 'confidence'],
    table: ['id', 'title', 'page', 'headers', 'rows', 'footnotes', 'source'],
  };

  async validateKnowledgeBase(
    data: KnowledgeBase,
    config: SchemaValidationConfig = {}
  ): Promise<SchemaValidationResult> {
    const { strictMode = false, validateReferences = true, checkDataTypes = true } = config;

    console.log('Starting schema validation...');

    const errors: SchemaValidationError[] = [];
    const warnings: SchemaValidationWarning[] = [];

    // Validate top-level structure
    this.validateRequiredFields(data, this.requiredFields.knowledgeBase, 'knowledgeBase', errors);

    // Validate metadata
    if (data.metadata) {
      this.validateMetadata(data.metadata, errors, warnings);
    }

    // Validate occupations
    if (data.occupations) {
      this.validateOccupations(data.occupations, errors, warnings, strictMode);
    }

    // Validate tables
    if (data.tables) {
      this.validateTables(data.tables, errors, warnings, strictMode);
    }

    // Validate cross-references
    if (validateReferences && data.occupations && data.tables) {
      this.validateCrossReferences(data.occupations, data.tables, errors, warnings);
    }

    // Validate data types
    if (checkDataTypes) {
      this.validateDataTypes(data, errors, warnings);
    }

    const score = this.calculateValidationScore(errors, warnings);
    const isValid = errors.filter(e => e.severity === 'critical').length === 0;

    console.log(`Schema validation complete. Score: ${score}%, Valid: ${isValid}`);

    return {
      isValid,
      errors,
      warnings,
      score,
    };
  }

  private validateMetadata(
    metadata: PaperMetadata,
    errors: SchemaValidationError[],
    warnings: SchemaValidationWarning[]
  ): void {
    this.validateRequiredFields(metadata, this.requiredFields.metadata, 'metadata', errors);

    // Validate specific metadata fields
    if (metadata.arxivId && !this.isValidArxivId(metadata.arxivId)) {
      errors.push({
        field: 'metadata.arxivId',
        message: 'Invalid arXiv ID format',
        severity: 'medium',
        value: metadata.arxivId,
      });
    }

    if (metadata.url && !this.isValidUrl(metadata.url)) {
      errors.push({
        field: 'metadata.url',
        message: 'Invalid URL format',
        severity: 'medium',
        value: metadata.url,
      });
    }

    if (metadata.authors && metadata.authors.length === 0) {
      warnings.push({
        field: 'metadata.authors',
        message: 'No authors specified',
        suggestion: 'Add author information if available',
      });
    }

    if (metadata.extractionDate && !this.isValidDate(metadata.extractionDate)) {
      errors.push({
        field: 'metadata.extractionDate',
        message: 'Invalid extraction date format',
        severity: 'medium',
        value: metadata.extractionDate,
      });
    }
  }

  private validateOccupations(
    occupations: OccupationData[],
    errors: SchemaValidationError[],
    warnings: SchemaValidationWarning[],
    strictMode: boolean
  ): void {
    if (occupations.length === 0) {
      errors.push({
        field: 'occupations',
        message: 'No occupation data found',
        severity: 'critical',
      });
      return;
    }

    const occupationCodes = new Set<string>();
    const occupationNames = new Set<string>();

    for (let i = 0; i < occupations.length; i++) {
      const occupation = occupations[i];
      const fieldPrefix = `occupations[${i}]`;

      // Validate required fields
      this.validateRequiredFields(occupation, this.requiredFields.occupation, fieldPrefix, errors);

      // Validate SOC code format
      if (occupation.code && !this.isValidSocCode(occupation.code)) {
        errors.push({
          field: `${fieldPrefix}.code`,
          message: 'Invalid SOC code format',
          severity: 'high',
          value: occupation.code,
        });
      }

      // Check for duplicate codes
      if (occupation.code) {
        if (occupationCodes.has(occupation.code)) {
          errors.push({
            field: `${fieldPrefix}.code`,
            message: 'Duplicate SOC code found',
            severity: 'high',
            value: occupation.code,
          });
        }
        occupationCodes.add(occupation.code);
      }

      // Check for duplicate names
      if (occupation.name) {
        if (occupationNames.has(occupation.name)) {
          warnings.push({
            field: `${fieldPrefix}.name`,
            message: 'Duplicate occupation name found',
            value: occupation.name,
          });
        }
        occupationNames.add(occupation.name);
      }

      // Validate risk score range
      if (typeof occupation.riskScore === 'number') {
        if (occupation.riskScore < 0 || occupation.riskScore > 1) {
          errors.push({
            field: `${fieldPrefix}.riskScore`,
            message: 'Risk score must be between 0 and 1',
            severity: 'high',
            value: occupation.riskScore,
          });
        }
      }

      // Validate confidence score
      if (typeof occupation.confidence === 'number') {
        if (occupation.confidence < 0 || occupation.confidence > 1) {
          errors.push({
            field: `${fieldPrefix}.confidence`,
            message: 'Confidence score must be between 0 and 1',
            severity: 'medium',
            value: occupation.confidence,
          });
        }
      }

      // Validate key tasks
      if (occupation.keyTasks && occupation.keyTasks.length === 0) {
        warnings.push({
          field: `${fieldPrefix}.keyTasks`,
          message: 'No key tasks specified for occupation',
          suggestion: 'Add relevant key tasks for better analysis',
        });
      }

      // Strict mode validations
      if (strictMode) {
        if (occupation.keyTasks && occupation.keyTasks.some(task => task.length < 10)) {
          warnings.push({
            field: `${fieldPrefix}.keyTasks`,
            message: 'Some key tasks are very short',
            suggestion: 'Provide more detailed task descriptions',
          });
        }
      }
    }
  }

  private validateTables(
    tables: TableData[],
    errors: SchemaValidationError[],
    warnings: SchemaValidationWarning[],
    strictMode: boolean
  ): void {
    if (tables.length === 0) {
      errors.push({
        field: 'tables',
        message: 'No table data found',
        severity: 'critical',
      });
      return;
    }

    const tableIds = new Set<string>();

    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      const fieldPrefix = `tables[${i}]`;

      // Validate required fields
      this.validateRequiredFields(table, this.requiredFields.table, fieldPrefix, errors);

      // Check for duplicate IDs
      if (table.id) {
        if (tableIds.has(table.id)) {
          errors.push({
            field: `${fieldPrefix}.id`,
            message: 'Duplicate table ID found',
            severity: 'high',
            value: table.id,
          });
        }
        tableIds.add(table.id);
      }

      // Validate table structure
      if (table.headers && table.rows) {
        for (let j = 0; j < table.rows.length; j++) {
          const row = table.rows[j];
          if (row.length !== table.headers.length) {
            errors.push({
              field: `${fieldPrefix}.rows[${j}]`,
              message: 'Row column count does not match header count',
              severity: 'high',
              value: `Expected ${table.headers.length}, got ${row.length}`,
            });
          }
        }
      }

      // Validate page number
      if (typeof table.page === 'number' && table.page < 1) {
        errors.push({
          field: `${fieldPrefix}.page`,
          message: 'Page number must be positive',
          severity: 'medium',
          value: table.page,
        });
      }

      // Strict mode validations
      if (strictMode) {
        if (table.rows && table.rows.length === 0) {
          warnings.push({
            field: `${fieldPrefix}.rows`,
            message: 'Table has no data rows',
            suggestion: 'Verify table extraction was successful',
          });
        }

        if (table.headers && table.headers.some(header => header.length < 3)) {
          warnings.push({
            field: `${fieldPrefix}.headers`,
            message: 'Some headers are very short',
            suggestion: 'Verify header extraction accuracy',
          });
        }
      }
    }
  }

  private validateCrossReferences(
    occupations: OccupationData[],
    tables: TableData[],
    errors: SchemaValidationError[],
    warnings: SchemaValidationWarning[]
  ): void {
    const tableIds = new Set(tables.map(t => t.id));

    for (let i = 0; i < occupations.length; i++) {
      const occupation = occupations[i];
      const fieldPrefix = `occupations[${i}]`;

      if (occupation.tableReferences) {
        for (const tableRef of occupation.tableReferences) {
          if (!tableIds.has(tableRef)) {
            errors.push({
              field: `${fieldPrefix}.tableReferences`,
              message: 'Reference to non-existent table',
              severity: 'high',
              value: tableRef,
            });
          }
        }
      }
    }
  }

  private validateDataTypes(
    data: KnowledgeBase,
    errors: SchemaValidationError[],
    warnings: SchemaValidationWarning[]
  ): void {
    // Validate that arrays are actually arrays
    if (data.occupations && !Array.isArray(data.occupations)) {
      errors.push({
        field: 'occupations',
        message: 'Occupations must be an array',
        severity: 'critical',
        value: typeof data.occupations,
      });
    }

    if (data.tables && !Array.isArray(data.tables)) {
      errors.push({
        field: 'tables',
        message: 'Tables must be an array',
        severity: 'critical',
        value: typeof data.tables,
      });
    }

    // Validate numeric fields
    if (data.occupations && Array.isArray(data.occupations)) {
      for (let i = 0; i < data.occupations.length; i++) {
        const occupation = data.occupations[i];
        
        if (occupation.riskScore !== undefined && typeof occupation.riskScore !== 'number') {
          errors.push({
            field: `occupations[${i}].riskScore`,
            message: 'Risk score must be a number',
            severity: 'high',
            value: typeof occupation.riskScore,
          });
        }

        if (occupation.confidence !== undefined && typeof occupation.confidence !== 'number') {
          errors.push({
            field: `occupations[${i}].confidence`,
            message: 'Confidence must be a number',
            severity: 'medium',
            value: typeof occupation.confidence,
          });
        }
      }
    }
  }

  private validateRequiredFields(
    obj: any,
    requiredFields: string[],
    fieldPrefix: string,
    errors: SchemaValidationError[]
  ): void {
    for (const field of requiredFields) {
      if (obj[field] === undefined || obj[field] === null) {
        errors.push({
          field: `${fieldPrefix}.${field}`,
          message: `Required field '${field}' is missing`,
          severity: 'critical',
        });
      }
    }
  }

  private calculateValidationScore(
    errors: SchemaValidationError[],
    warnings: SchemaValidationWarning[]
  ): number {
    let score = 100;

    // Deduct points for errors
    for (const error of errors) {
      switch (error.severity) {
        case 'critical':
          score -= 20;
          break;
        case 'high':
          score -= 10;
          break;
        case 'medium':
          score -= 5;
          break;
      }
    }

    // Deduct points for warnings
    score -= warnings.length * 2;

    return Math.max(0, score);
  }

  private isValidArxivId(arxivId: string): boolean {
    // arXiv ID format: YYMM.NNNNN or arXiv:YYMM.NNNNN
    const arxivPattern = /^(arXiv:)?(\d{4}\.\d{4,5}|\d{7})$/;
    return arxivPattern.test(arxivId);
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  private isValidSocCode(socCode: string): boolean {
    // SOC code format: XX-XXXX
    const socPattern = /^\d{2}-\d{4}$/;
    return socPattern.test(socCode);
  }
}