// Core data types for research data extraction and processing

export interface PaperMetadata {
  title: string;
  arxivId: string;
  url: string;
  authors: string[];
  extractionDate: string;
  version: string;
}

export interface RawTable {
  pageNumber: number;
  title?: string;
  headers: string[];
  rows: string[][];
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ExtractedText {
  sections: Record<string, string>;
  metadata: {
    pageCount: number;
    extractionMethod: string;
    confidence: number;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  confidence: number;
}

export interface ValidationError {
  type: 'structure' | 'data' | 'format';
  message: string;
  location?: string;
  severity: 'high' | 'medium' | 'low';
}

export interface ValidationWarning {
  type: 'quality' | 'completeness' | 'formatting';
  message: string;
  location?: string;
}

export interface OccupationData {
  code: string;
  name: string;
  riskScore: number;
  keyTasks: string[];
  tableReferences: string[];
  confidence: number;
}

export interface TableData {
  id: string;
  title: string;
  page: number;
  headers: string[];
  rows: any[][];
  footnotes: string[];
  source: string;
}

export interface KnowledgeBase {
  metadata: PaperMetadata;
  methodology: MethodologyInfo;
  occupations: OccupationData[];
  tables: TableData[];
  visualizations: VisualizationConfig[];
  extractionInfo: ExtractionMetadata;
}

export interface MethodologyInfo {
  dataSources: string[];
  analysisApproach: string;
  confidence: number;
  limitations: string[];
}

export interface VisualizationConfig {
  type: 'bar' | 'line' | 'scatter';
  title: string;
  dataSource: string;
  config: Record<string, any>;
}

export interface ExtractionMetadata {
  extractionDate: string;
  version: string;
  toolsUsed: string[];
  qualityScore: number;
  manualReviewRequired: boolean;
}