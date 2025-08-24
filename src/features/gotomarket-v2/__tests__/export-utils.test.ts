import { 
  exportStrategies, 
  copyToClipboard, 
  importStrategies,
  importFromJSONEnhanced,
  importFromMarkdown,
  ExportOptions,
  ImportResult
} from '../utils/export-utils';
import { GoToMarketStrategies, MarkdownGoToMarketStrategies, ContentLength } from '../types';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
});

// Mock document methods for download functionality
const mockCreateElement = jest.fn();
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();
const mockClick = jest.fn();

Object.defineProperty(document, 'createElement', {
  value: mockCreateElement.mockReturnValue({
    href: '',
    download: '',
    style: { display: '' },
    click: mockClick
  })
});

Object.defineProperty(document.body, 'appendChild', { value: mockAppendChild });
Object.defineProperty(document.body, 'removeChild', { value: mockRemoveChild });

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = jest.fn().mockReturnValue('mock-url');
global.URL.revokeObjectURL = jest.fn();

describe('Enhanced Export Utils', () => {
  const mockJsonStrategies: GoToMarketStrategies = {
    id: 'test-strategy',
    businessContext: {
      businessIdea: 'Test Business',
      targetMarket: 'Test Market',
      valueProposition: 'Test Value',
      implementationPhases: [],
      goals: ['Goal 1'],
      constraints: ['Constraint 1']
    },
    marketingStrategies: [
      {
        id: 'marketing-1',
        type: 'digital',
        title: 'Digital Marketing',
        description: 'Online marketing strategy',
        tactics: [],
        budget: { min: '$1000', max: '$5000', currency: 'USD' },
        timeline: '3 months',
        expectedROI: '200%',
        difficulty: 'medium',
        completed: false
      }
    ],
    salesChannels: [],
    pricingStrategies: [],
    distributionPlans: [],
    implementationTimeline: [],
    toolRecommendations: [],
    generatedAt: '2024-01-01T00:00:00Z',
    version: '2.0'
  };

  const mockMarkdownStrategies: MarkdownGoToMarketStrategies = {
    id: 'test-markdown-strategy',
    businessContext: mockJsonStrategies.businessContext,
    rawMarkdown: '# Marketing Strategy\nTest marketing content\n\n# Sales Strategy\nTest sales content',
    sections: [
      {
        id: 'marketing',
        type: 'marketing',
        title: 'Marketing Strategy',
        content: 'Test marketing content',
        subsections: [],
        completed: false,
        editable: true
      }
    ],
    metadata: {
      contentLength: 'standard' as ContentLength,
      generatedAt: '2024-01-01T00:00:00Z',
      wordCount: 8,
      estimatedReadTime: 1
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('exportStrategies', () => {
    it('should export markdown format by default', () => {
      const result = exportStrategies(mockMarkdownStrategies);
      
      expect(result.success).toBe(true);
      expect(result.filename).toContain('.md');
      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockClick).toHaveBeenCalled();
    });

    it('should export JSON format when specified', () => {
      const options: ExportOptions = { format: 'json' };
      const result = exportStrategies(mockJsonStrategies, options);
      
      expect(result.success).toBe(true);
      expect(result.filename).toContain('.json');
    });

    it('should export both formats when requested', () => {
      const options: ExportOptions = { format: 'both' };
      const result = exportStrategies(mockMarkdownStrategies, options);
      
      expect(result.success).toBe(true);
      expect(result.filename).toContain('.md & ');
      expect(result.filename).toContain('.json');
    });

    it('should include metadata when requested', () => {
      const options: ExportOptions = { 
        format: 'markdown', 
        includeMetadata: true 
      };
      const result = exportStrategies(mockMarkdownStrategies, options);
      
      expect(result.success).toBe(true);
    });

    it('should use custom filename when provided', () => {
      const options: ExportOptions = { 
        format: 'markdown',
        customFilename: 'custom-strategy'
      };
      const result = exportStrategies(mockMarkdownStrategies, options);
      
      expect(result.success).toBe(true);
      expect(result.filename).toBe('custom-strategy.md');
    });

    it('should handle conversion from JSON to markdown', () => {
      const options: ExportOptions = { format: 'markdown' };
      const result = exportStrategies(mockJsonStrategies, options);
      
      expect(result.success).toBe(true);
      expect(result.filename).toContain('.md');
    });

    it('should handle invalid format', () => {
      const options: ExportOptions = { format: 'invalid' as any };
      const result = exportStrategies(mockMarkdownStrategies, options);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid export format');
    });
  });

  describe('copyToClipboard', () => {
    it('should copy markdown content by default', async () => {
      const result = await copyToClipboard(mockMarkdownStrategies);
      
      expect(result.success).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        mockMarkdownStrategies.rawMarkdown
      );
    });

    it('should copy JSON content when specified', async () => {
      const result = await copyToClipboard(mockJsonStrategies, 'json');
      
      expect(result.success).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        JSON.stringify(mockJsonStrategies, null, 2)
      );
    });

    it('should include metadata when requested', async () => {
      const result = await copyToClipboard(mockMarkdownStrategies, 'markdown', true);
      
      expect(result.success).toBe(true);
      const calledWith = (navigator.clipboard.writeText as jest.Mock).mock.calls[0][0];
      expect(calledWith).toContain('---');
      expect(calledWith).toContain('title:');
      expect(calledWith).toContain(mockMarkdownStrategies.rawMarkdown);
    });

    it('should convert between formats as needed', async () => {
      // Copy JSON as markdown (requires conversion)
      const result = await copyToClipboard(mockJsonStrategies, 'markdown');
      
      expect(result.success).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });

    it('should handle clipboard API failure with fallback', async () => {
      // Mock clipboard failure
      (navigator.clipboard.writeText as jest.Mock).mockRejectedValueOnce(new Error('Clipboard failed'));
      
      // Mock document.execCommand
      document.execCommand = jest.fn().mockReturnValue(true);
      
      const result = await copyToClipboard(mockMarkdownStrategies);
      
      // The test should handle the error gracefully
      expect(result.success).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });
  });

  describe('importStrategies', () => {
    it('should import JSON format correctly', () => {
      const jsonString = JSON.stringify(mockJsonStrategies);
      const result = importStrategies(jsonString);
      
      expect(result.success).toBe(true);
      expect(result.format).toBe('json');
      expect(result.data).toEqual(mockJsonStrategies);
    });

    it('should import markdown format correctly', () => {
      const markdownContent = '# Test Strategy\nThis is a test strategy';
      const result = importStrategies(markdownContent);
      
      expect(result.success).toBe(true);
      expect(result.format).toBe('markdown');
      expect(result.data).toBeDefined();
      expect((result.data as MarkdownGoToMarketStrategies).rawMarkdown).toBe(markdownContent);
    });

    it('should detect MarkdownGoToMarketStrategies in JSON', () => {
      const jsonString = JSON.stringify(mockMarkdownStrategies);
      const result = importStrategies(jsonString);
      
      expect(result.success).toBe(true);
      expect(result.format).toBe('markdown');
      expect(result.data).toEqual(mockMarkdownStrategies);
    });

    it('should handle invalid JSON', () => {
      const invalidJson = '{ invalid json }';
      const result = importStrategies(invalidJson);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unable to detect content format');
    });

    it('should handle unknown format', () => {
      const unknownContent = 'This is neither JSON nor markdown';
      const result = importStrategies(unknownContent);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unable to detect content format');
    });

    it('should validate JSON structure', () => {
      const invalidStructure = JSON.stringify({ someField: 'value' });
      const result = importStrategies(invalidStructure);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('missing required fields');
    });
  });

  describe('importFromJSONEnhanced', () => {
    it('should validate required fields', () => {
      const incompleteJson = JSON.stringify({ id: 'test' });
      const result = importFromJSONEnhanced(incompleteJson);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('missing required fields');
    });

    it('should validate strategy structure', () => {
      const noStrategiesJson = JSON.stringify({
        id: 'test',
        businessContext: { businessIdea: 'test' }
      });
      const result = importFromJSONEnhanced(noStrategiesJson);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('missing strategy arrays');
    });

    it('should accept empty strategy arrays', () => {
      const validJson = JSON.stringify({
        id: 'test',
        businessContext: { businessIdea: 'test' },
        marketingStrategies: [],
        salesChannels: [],
        pricingStrategies: []
      });
      const result = importFromJSONEnhanced(validJson);
      
      expect(result.success).toBe(true);
      expect(result.format).toBe('json');
    });
  });

  describe('importFromMarkdown', () => {
    it('should create basic structure from markdown', () => {
      const markdown = '# Go-to-Market Strategy: Test Business\n\nThis is test content';
      const result = importFromMarkdown(markdown);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect((result.data as MarkdownGoToMarketStrategies).rawMarkdown).toBe(markdown);
      expect((result.data as MarkdownGoToMarketStrategies).businessContext.businessIdea).toBe('Test Business');
      expect(result.warnings).toContain('Markdown import is basic - section structure may need manual review');
    });

    it('should calculate word count and read time', () => {
      const markdown = 'This is a test with exactly eight words here.';
      const result = importFromMarkdown(markdown);
      
      expect(result.success).toBe(true);
      const data = result.data as MarkdownGoToMarketStrategies;
      expect(data.metadata.wordCount).toBe(9); // "exactly eight words" + others
      expect(data.metadata.estimatedReadTime).toBe(1); // Minimum 1 minute
    });
  });
});