import path from 'path';
import { PDFDownloader, DownloadConfig } from './pdf-downloader';
import { TableExtractor, TableExtractionConfig } from './table-extractor';
import { TextExtractor, TextExtractionConfig } from './text-extractor';
import { RawTable, ExtractedText, PaperMetadata, ValidationResult } from '../types';

export interface ExtractionConfig {
  arxivUrl: string;
  outputDir: string;
  sections: string[];
  exportCSV?: boolean;
  exportText?: boolean;
}

export interface ExtractionResult {
  success: boolean;
  tables: RawTable[];
  extractedText: ExtractedText;
  metadata: PaperMetadata;
  validationResults: {
    tables: ValidationResult;
    text: ValidationResult;
  };
  files: {
    pdf?: string;
    csvExports?: string[];
    textExport?: string;
  };
  error?: string;
}

export class ResearchDataExtractor {
  private pdfDownloader: PDFDownloader;
  private tableExtractor: TableExtractor;
  private textExtractor: TextExtractor;

  constructor() {
    this.pdfDownloader = new PDFDownloader();
    this.tableExtractor = new TableExtractor();
    this.textExtractor = new TextExtractor();
  }

  async extractPaperData(config: ExtractionConfig): Promise<ExtractionResult> {
    const { arxivUrl, outputDir, sections, exportCSV = true, exportText = true } = config;

    try {
      console.log('Starting research data extraction...');
      
      // Step 1: Download PDF
      const pdfPath = path.join(outputDir, 'raw', 'paper.pdf');
      const downloadResult = await this.pdfDownloader.downloadPDF({
        url: arxivUrl,
        outputPath: pdfPath,
      });

      if (!downloadResult.success) {
        throw new Error(`PDF download failed: ${downloadResult.error}`);
      }

      console.log('PDF downloaded successfully');

      // Step 2: Extract tables
      const tableConfig: TableExtractionConfig = {
        pdfPath: downloadResult.filePath!,
        outputDir: exportCSV ? path.join(outputDir, 'tables') : undefined,
      };

      const tableResult = await this.tableExtractor.extractTables(tableConfig);
      console.log(`Extracted ${tableResult.tables.length} tables`);

      // Step 3: Extract text sections
      const textConfig: TextExtractionConfig = {
        pdfPath: downloadResult.filePath!,
        sections,
      };

      const textResult = await this.textExtractor.extractSections(textConfig);
      console.log(`Extracted ${Object.keys(textResult.extractedText.sections).length} text sections`);

      // Step 4: Export text if requested
      let textExportPath: string | undefined;
      if (exportText) {
        textExportPath = path.join(outputDir, 'text', 'extracted_sections.txt');
        await this.textExtractor.exportSectionsToText(
          textResult.extractedText,
          textExportPath
        );
      }

      // Step 5: Validate PDF file
      const isPdfValid = await this.pdfDownloader.validatePDF(downloadResult.filePath!);
      if (!isPdfValid) {
        console.warn('Downloaded PDF may be corrupted');
      }

      console.log('Research data extraction completed successfully');

      return {
        success: true,
        tables: tableResult.tables,
        extractedText: textResult.extractedText,
        metadata: textResult.metadata,
        validationResults: {
          tables: tableResult.validationResult,
          text: textResult.validationResult,
        },
        files: {
          pdf: downloadResult.filePath,
          csvExports: tableResult.csvExports,
          textExport: textExportPath,
        },
      };

    } catch (error) {
      console.error('Research data extraction failed:', error);
      
      return {
        success: false,
        tables: [],
        extractedText: {
          sections: {},
          metadata: {
            pageCount: 0,
            extractionMethod: 'failed',
            confidence: 0,
          },
        },
        metadata: {
          title: 'Unknown',
          arxivId: 'unknown',
          url: arxivUrl,
          authors: [],
          extractionDate: new Date().toISOString(),
          version: '1.0',
        },
        validationResults: {
          tables: {
            isValid: false,
            errors: [],
            warnings: [],
            confidence: 0,
          },
          text: {
            isValid: false,
            errors: [],
            warnings: [],
            confidence: 0,
          },
        },
        files: {},
        error: error instanceof Error ? error.message : 'Unknown extraction error',
      };
    }
  }

  async validateExtractionQuality(result: ExtractionResult): Promise<{
    overallScore: number;
    recommendations: string[];
    requiresManualReview: boolean;
  }> {
    const recommendations: string[] = [];
    let totalScore = 0;
    let scoreComponents = 0;

    // Evaluate table extraction quality
    if (result.validationResults.tables.isValid) {
      totalScore += result.validationResults.tables.confidence * 100;
      scoreComponents++;
    } else {
      recommendations.push('Table extraction requires manual review due to validation errors');
    }

    // Evaluate text extraction quality
    if (result.validationResults.text.isValid) {
      totalScore += result.validationResults.text.confidence * 100;
      scoreComponents++;
    } else {
      recommendations.push('Text extraction requires manual review due to validation errors');
    }

    // Check for warnings
    const totalWarnings = 
      result.validationResults.tables.warnings.length + 
      result.validationResults.text.warnings.length;

    if (totalWarnings > 5) {
      recommendations.push('High number of extraction warnings - consider manual verification');
    }

    // Check table count
    if (result.tables.length < 2) {
      recommendations.push('Low table count - verify all tables were extracted correctly');
    }

    // Check text section completeness
    const requiredSections = ['abstract', 'methodology'];
    const missingSections = requiredSections.filter(
      section => !result.extractedText.sections[section]
    );

    if (missingSections.length > 0) {
      recommendations.push(`Missing required sections: ${missingSections.join(', ')}`);
    }

    const overallScore = scoreComponents > 0 ? totalScore / scoreComponents : 0;
    const requiresManualReview = overallScore < 80 || recommendations.length > 2;

    return {
      overallScore,
      recommendations,
      requiresManualReview,
    };
  }
}

// Export convenience function for direct usage
export async function extractArxivPaper(
  arxivUrl: string = 'https://arxiv.org/pdf/2507.07935',
  outputDir: string = './research'
): Promise<ExtractionResult> {
  const extractor = new ResearchDataExtractor();
  
  return extractor.extractPaperData({
    arxivUrl,
    outputDir,
    sections: ['abstract', 'introduction', 'methodology', 'results', 'discussion', 'conclusion'],
    exportCSV: true,
    exportText: true,
  });
}