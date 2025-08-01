import { RawTable, OccupationData, TableData } from '../types';

export interface NormalizationConfig {
  standardizeOccupationNames?: boolean;
  createCrossReferences?: boolean;
  validateDataTypes?: boolean;
}

export interface NormalizationResult {
  occupations: OccupationData[];
  tables: TableData[];
  crossReferences: CrossReference[];
  validationIssues: string[];
}

export interface CrossReference {
  sourceTable: string;
  targetTable: string;
  linkingField: string;
  matchCount: number;
}

export class DataNormalizer {
  private occupationNameMap: Map<string, string> = new Map();
  private socCodeMap: Map<string, string> = new Map();

  constructor() {
    this.initializeNormalizationMaps();
  }

  async normalizeData(
    rawTables: RawTable[],
    config: NormalizationConfig = {}
  ): Promise<NormalizationResult> {
    const {
      standardizeOccupationNames = true,
      createCrossReferences = true,
      validateDataTypes = true,
    } = config;

    console.log('Starting data normalization...');

    // Convert raw tables to structured format
    const tables = this.convertRawTablesToStructured(rawTables);

    // Extract and normalize occupation data
    const occupations = this.extractOccupationData(tables, standardizeOccupationNames);

    // Create cross-references between tables
    const crossReferences = createCrossReferences 
      ? this.createTableCrossReferences(tables)
      : [];

    // Validate data types and consistency
    const validationIssues = validateDataTypes 
      ? this.validateDataConsistency(tables, occupations)
      : [];

    console.log(`Normalization complete: ${occupations.length} occupations, ${tables.length} tables`);

    return {
      occupations,
      tables,
      crossReferences,
      validationIssues,
    };
  }

  private convertRawTablesToStructured(rawTables: RawTable[]): TableData[] {
    return rawTables.map((rawTable, index) => ({
      id: `table_${index + 1}`,
      title: rawTable.title || `Table ${index + 1}`,
      page: rawTable.pageNumber,
      headers: rawTable.headers,
      rows: rawTable.rows,
      footnotes: [], // Would be extracted from PDF in production
      source: `Page ${rawTable.pageNumber}`,
    }));
  }

  private extractOccupationData(tables: TableData[], standardize: boolean): OccupationData[] {
    const occupationMap = new Map<string, OccupationData>();

    for (const table of tables) {
      // Process occupation exposure table (Table 1)
      if (table.title.includes('Exposure to Generative AI by Occupation Group')) {
        this.processOccupationGroupTable(table, occupationMap, standardize);
      }
      
      // Process top occupations table (Table 2)
      if (table.title.includes('Top 20 Occupations Most Exposed')) {
        this.processTopOccupationsTable(table, occupationMap, standardize);
      }
    }

    return Array.from(occupationMap.values());
  }

  private processOccupationGroupTable(
    table: TableData,
    occupationMap: Map<string, OccupationData>,
    standardize: boolean
  ): void {
    // Headers: ['Occupation Group', 'SOC Major Group', 'Exposure Score', 'Employment (thousands)', 'Median Wage']
    for (const row of table.rows) {
      const [occupationGroup, socGroup, exposureScore, employment, wage] = row;
      
      const normalizedName = standardize 
        ? this.standardizeOccupationName(occupationGroup)
        : occupationGroup;

      const occupationData: OccupationData = {
        code: socGroup,
        name: normalizedName,
        riskScore: parseFloat(exposureScore),
        keyTasks: this.getKeyTasksForOccupationGroup(occupationGroup),
        tableReferences: [table.id],
        confidence: 0.95,
      };

      occupationMap.set(normalizedName, occupationData);
    }
  }

  private processTopOccupationsTable(
    table: TableData,
    occupationMap: Map<string, OccupationData>,
    standardize: boolean
  ): void {
    // Headers: ['Occupation', 'SOC Code', 'Exposure Score', 'Employment', 'Median Wage']
    for (const row of table.rows) {
      const [occupation, socCode, exposureScore, employment, wage] = row;
      
      const normalizedName = standardize 
        ? this.standardizeOccupationName(occupation)
        : occupation;

      const existingOccupation = occupationMap.get(normalizedName);
      
      if (existingOccupation) {
        // Update existing occupation with more specific data
        existingOccupation.code = socCode;
        existingOccupation.riskScore = parseFloat(exposureScore);
        existingOccupation.tableReferences.push(table.id);
      } else {
        // Create new occupation entry
        const occupationData: OccupationData = {
          code: socCode,
          name: normalizedName,
          riskScore: parseFloat(exposureScore),
          keyTasks: this.getKeyTasksForSpecificOccupation(occupation),
          tableReferences: [table.id],
          confidence: 0.96,
        };

        occupationMap.set(normalizedName, occupationData);
      }
    }
  }

  private getKeyTasksForOccupationGroup(occupationGroup: string): string[] {
    const taskMap: Record<string, string[]> = {
      'Computer and Mathematical': [
        'Software development and programming',
        'Data analysis and modeling',
        'Algorithm design and optimization',
        'System architecture and design'
      ],
      'Architecture and Engineering': [
        'Technical design and drafting',
        'Engineering analysis and calculations',
        'Project planning and documentation',
        'Quality assurance and testing'
      ],
      'Life, Physical, and Social Science': [
        'Research design and methodology',
        'Data collection and analysis',
        'Report writing and documentation',
        'Statistical analysis and interpretation'
      ],
      'Business and Financial Operations': [
        'Financial analysis and modeling',
        'Business process optimization',
        'Report generation and presentation',
        'Strategic planning and forecasting'
      ],
      'Legal': [
        'Legal research and analysis',
        'Document drafting and review',
        'Case preparation and strategy',
        'Regulatory compliance analysis'
      ],
      'Arts, Design, Entertainment, Sports, and Media': [
        'Content creation and editing',
        'Visual design and layout',
        'Creative concept development',
        'Media production and post-processing'
      ],
      'Management': [
        'Strategic planning and decision making',
        'Team coordination and leadership',
        'Performance analysis and reporting',
        'Resource allocation and optimization'
      ],
      'Education, Training, and Library': [
        'Curriculum development and planning',
        'Educational content creation',
        'Assessment and evaluation',
        'Research and information organization'
      ]
    };

    return taskMap[occupationGroup] || ['General knowledge work', 'Analysis and problem solving'];
  }

  private getKeyTasksForSpecificOccupation(occupation: string): string[] {
    const taskMap: Record<string, string[]> = {
      'Software Developers': [
        'Code generation and programming',
        'Software architecture design',
        'Debugging and testing',
        'Documentation and technical writing'
      ],
      'Data Scientists': [
        'Data analysis and modeling',
        'Statistical analysis and interpretation',
        'Machine learning model development',
        'Data visualization and reporting'
      ],
      'Web Developers': [
        'Frontend and backend development',
        'User interface design',
        'Database integration',
        'Performance optimization'
      ],
      'Technical Writers': [
        'Documentation creation and editing',
        'Technical content development',
        'Information architecture',
        'User guide and manual writing'
      ],
      'Financial Analysts': [
        'Financial modeling and analysis',
        'Investment research and evaluation',
        'Report generation and presentation',
        'Risk assessment and forecasting'
      ],
      'Graphic Designers': [
        'Visual design and layout',
        'Brand identity development',
        'Digital asset creation',
        'Creative concept development'
      ]
    };

    return taskMap[occupation] || ['Professional knowledge work', 'Analysis and communication'];
  }

  private createTableCrossReferences(tables: TableData[]): CrossReference[] {
    const crossReferences: CrossReference[] = [];

    // Find relationships between tables based on common fields
    for (let i = 0; i < tables.length; i++) {
      for (let j = i + 1; j < tables.length; j++) {
        const table1 = tables[i];
        const table2 = tables[j];

        // Check for common occupation-related fields
        const commonFields = this.findCommonFields(table1.headers, table2.headers);
        
        for (const field of commonFields) {
          const matchCount = this.countFieldMatches(table1, table2, field);
          
          if (matchCount > 0) {
            crossReferences.push({
              sourceTable: table1.id,
              targetTable: table2.id,
              linkingField: field,
              matchCount,
            });
          }
        }
      }
    }

    return crossReferences;
  }

  private findCommonFields(headers1: string[], headers2: string[]): string[] {
    const commonFields: string[] = [];
    const normalizedHeaders1 = headers1.map(h => h.toLowerCase());
    const normalizedHeaders2 = headers2.map(h => h.toLowerCase());

    for (const header1 of normalizedHeaders1) {
      for (const header2 of normalizedHeaders2) {
        if (this.areFieldsRelated(header1, header2)) {
          commonFields.push(header1);
        }
      }
    }

    return [...new Set(commonFields)];
  }

  private areFieldsRelated(field1: string, field2: string): boolean {
    const relatedTerms = [
      ['occupation', 'job', 'role'],
      ['soc', 'code', 'classification'],
      ['exposure', 'risk', 'score'],
      ['industry', 'sector', 'naics'],
    ];

    for (const terms of relatedTerms) {
      const field1HasTerm = terms.some(term => field1.includes(term));
      const field2HasTerm = terms.some(term => field2.includes(term));
      
      if (field1HasTerm && field2HasTerm) {
        return true;
      }
    }

    return field1 === field2;
  }

  private countFieldMatches(table1: TableData, table2: TableData, field: string): number {
    const field1Index = table1.headers.findIndex(h => h.toLowerCase().includes(field));
    const field2Index = table2.headers.findIndex(h => h.toLowerCase().includes(field));

    if (field1Index === -1 || field2Index === -1) {
      return 0;
    }

    const values1 = new Set(table1.rows.map(row => row[field1Index]?.toString().toLowerCase()));
    const values2 = new Set(table2.rows.map(row => row[field2Index]?.toString().toLowerCase()));

    let matches = 0;
    for (const value of values1) {
      if (values2.has(value)) {
        matches++;
      }
    }

    return matches;
  }

  private validateDataConsistency(tables: TableData[], occupations: OccupationData[]): string[] {
    const issues: string[] = [];

    // Validate occupation data consistency
    for (const occupation of occupations) {
      if (occupation.riskScore < 0 || occupation.riskScore > 1) {
        issues.push(`Invalid risk score for ${occupation.name}: ${occupation.riskScore}`);
      }

      if (!occupation.code || occupation.code.trim() === '') {
        issues.push(`Missing SOC code for occupation: ${occupation.name}`);
      }

      if (occupation.keyTasks.length === 0) {
        issues.push(`No key tasks defined for occupation: ${occupation.name}`);
      }
    }

    // Validate table data consistency
    for (const table of tables) {
      if (table.headers.length === 0) {
        issues.push(`Table ${table.id} has no headers`);
      }

      for (let i = 0; i < table.rows.length; i++) {
        const row = table.rows[i];
        if (row.length !== table.headers.length) {
          issues.push(`Table ${table.id}, row ${i + 1}: column count mismatch`);
        }
      }
    }

    return issues;
  }

  private standardizeOccupationName(name: string): string {
    // Apply standardization rules
    let standardized = name.trim();
    
    // Use predefined mappings if available
    if (this.occupationNameMap.has(standardized)) {
      return this.occupationNameMap.get(standardized)!;
    }

    // Apply common standardization rules
    standardized = standardized.replace(/\s+/g, ' '); // Normalize whitespace
    standardized = standardized.replace(/[^\w\s,-]/g, ''); // Remove special characters
    
    return standardized;
  }

  private initializeNormalizationMaps(): void {
    // Initialize occupation name standardization mappings
    this.occupationNameMap.set('Software Developers, Applications', 'Software Developers');
    this.occupationNameMap.set('Software Developers, Systems Software', 'Software Developers');
    this.occupationNameMap.set('Computer Systems Analysts', 'Systems Analysts');
    this.occupationNameMap.set('Web Developers', 'Web Developers');
    
    // Initialize SOC code mappings for validation
    this.socCodeMap.set('15-1252', 'Software Developers');
    this.socCodeMap.set('15-2051', 'Data Scientists');
    this.socCodeMap.set('15-1254', 'Web Developers');
    this.socCodeMap.set('27-3042', 'Technical Writers');
  }
}