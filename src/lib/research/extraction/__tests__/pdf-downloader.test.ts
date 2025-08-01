import { PDFDownloader } from '../pdf-downloader';
import { promises as fs } from 'fs';

// Mock fs module
jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    mkdir: jest.fn(),
    writeFile: jest.fn(),
    stat: jest.fn(),
    readFile: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe('PDFDownloader', () => {
  let downloader: PDFDownloader;
  const mockFs = fs as jest.Mocked<typeof fs>;
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    downloader = new PDFDownloader();
    jest.clearAllMocks();
  });

  describe('downloadPDF', () => {
    it('should successfully download a PDF', async () => {
      const mockBuffer = Buffer.from('PDF content');
      const mockResponse = {
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('application/pdf'),
        },
        arrayBuffer: jest.fn().mockResolvedValue(mockBuffer.buffer),
      };

      mockFetch.mockResolvedValue(mockResponse as any);
      mockFs.access.mockRejectedValue(new Error('Directory does not exist'));
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
      mockFs.stat.mockResolvedValue({ size: 1024 } as any);

      const result = await downloader.downloadPDF({
        url: 'https://example.com/test.pdf',
        outputPath: '/test/output.pdf',
      });

      expect(result.success).toBe(true);
      expect(result.filePath).toBe('/test/output.pdf');
      expect(result.fileSize).toBe(1024);
      expect(mockFetch).toHaveBeenCalledWith('https://example.com/test.pdf', {
        signal: expect.any(AbortSignal),
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ResearchDataExtractor/1.0)',
        },
      });
    });

    it('should handle HTTP errors', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      const result = await downloader.downloadPDF({
        url: 'https://example.com/nonexistent.pdf',
        outputPath: '/test/output.pdf',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('HTTP 404: Not Found');
    });

    it('should handle invalid content type', async () => {
      const mockResponse = {
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('text/html'),
        },
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      const result = await downloader.downloadPDF({
        url: 'https://example.com/test.html',
        outputPath: '/test/output.pdf',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid content type: text/html');
    });

    it('should retry on failure', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          headers: {
            get: jest.fn().mockReturnValue('application/pdf'),
          },
          arrayBuffer: jest.fn().mockResolvedValue(Buffer.from('PDF').buffer),
        } as any);

      mockFs.access.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
      mockFs.stat.mockResolvedValue({ size: 1024 } as any);

      const result = await downloader.downloadPDF({
        url: 'https://example.com/test.pdf',
        outputPath: '/test/output.pdf',
        retryAttempts: 3,
      });

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should timeout after specified duration', async () => {
      mockFetch.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 2000))
      );

      const result = await downloader.downloadPDF({
        url: 'https://example.com/slow.pdf',
        outputPath: '/test/output.pdf',
        timeout: 100,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validatePDF', () => {
    it('should validate a valid PDF file', async () => {
      const pdfBuffer = Buffer.from('%PDF-1.4\nPDF content');
      mockFs.readFile.mockResolvedValue(pdfBuffer);

      const isValid = await downloader.validatePDF('/test/valid.pdf');

      expect(isValid).toBe(true);
      expect(mockFs.readFile).toHaveBeenCalledWith('/test/valid.pdf');
    });

    it('should reject invalid PDF file', async () => {
      const invalidBuffer = Buffer.from('Not a PDF file');
      mockFs.readFile.mockResolvedValue(invalidBuffer);

      const isValid = await downloader.validatePDF('/test/invalid.pdf');

      expect(isValid).toBe(false);
    });

    it('should handle file read errors', async () => {
      mockFs.readFile.mockRejectedValue(new Error('File not found'));

      const isValid = await downloader.validatePDF('/test/nonexistent.pdf');

      expect(isValid).toBe(false);
    });
  });
});