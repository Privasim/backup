import { promises as fs } from 'fs';
import path from 'path';

export interface DownloadConfig {
  url: string;
  outputPath: string;
  retryAttempts?: number;
  timeout?: number;
}

export interface DownloadResult {
  success: boolean;
  filePath?: string;
  error?: string;
  fileSize?: number;
}

export class PDFDownloader {
  private readonly defaultTimeout = 30000; // 30 seconds
  private readonly defaultRetries = 3;

  async downloadPDF(config: DownloadConfig): Promise<DownloadResult> {
    const { url, outputPath, retryAttempts = this.defaultRetries, timeout = this.defaultTimeout } = config;

    // Ensure output directory exists
    await this.ensureDirectoryExists(path.dirname(outputPath));

    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        console.log(`Downloading PDF (attempt ${attempt}/${retryAttempts}): ${url}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; ResearchDataExtractor/1.0)',
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/pdf')) {
          throw new Error(`Invalid content type: ${contentType}. Expected PDF.`);
        }

        const buffer = await response.arrayBuffer();
        await fs.writeFile(outputPath, Buffer.from(buffer));

        const stats = await fs.stat(outputPath);
        
        console.log(`PDF downloaded successfully: ${outputPath} (${stats.size} bytes)`);
        
        return {
          success: true,
          filePath: outputPath,
          fileSize: stats.size,
        };

      } catch (error) {
        console.error(`Download attempt ${attempt} failed:`, error);
        
        if (attempt === retryAttempts) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown download error',
          };
        }

        // Wait before retry (exponential backoff)
        await this.delay(Math.pow(2, attempt) * 1000);
      }
    }

    return {
      success: false,
      error: 'All download attempts failed',
    };
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async validatePDF(filePath: string): Promise<boolean> {
    try {
      const buffer = await fs.readFile(filePath);
      
      // Basic PDF validation - check for PDF header
      const header = buffer.subarray(0, 4).toString();
      return header === '%PDF';
    } catch {
      return false;
    }
  }
}