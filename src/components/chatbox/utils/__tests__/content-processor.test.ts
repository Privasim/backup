import { ContentProcessor } from '../content-processor';
import { AnalysisResult, ChatboxMessage } from '../../types';

describe('ContentProcessor', () => {
  const mockAnalysisResult: AnalysisResult = {
    id: 'test-1',
    type: 'profile',
    status: 'success',
    content: 'This is a test analysis with key insights:\n- First insight\n- Second insight\nI recommend focusing on skill development.',
    timestamp: '2025-01-08T12:00:00Z',
    model: 'test-model'
  };

  const mockMessage: ChatboxMessage = {
    id: 'msg-1',
    type: 'assistant',
    content: 'Test message content',
    timestamp: '2025-01-08T12:00:00Z'
  };

  describe('sanitizeContent', () => {
    it('should remove HTML tags when not allowed', () => {
      const content = 'Hello <script>alert("test")</script> world';
      const sanitized = ContentProcessor.sanitizeContent(content, { allowHtml: false });
      expect(sanitized).toBe('Hello alert("test") world');
    });

    it('should preserve HTML when allowed', () => {
      const content = 'Hello <strong>world</strong>';
      const sanitized = ContentProcessor.sanitizeContent(content, { allowHtml: true });
      expect(sanitized).toBe('Hello <strong>world</strong>');
    });

    it('should truncate content when too long', () => {
      const content = 'A'.repeat(1000);
      const sanitized = ContentProcessor.sanitizeContent(content, { maxLength: 100 });
      expect(sanitized).toBe('A'.repeat(100) + '...');
    });

    it('should remove URLs when requested', () => {
      const content = 'Visit https://example.com for more info';
      const sanitized = ContentProcessor.sanitizeContent(content, { removeUrls: true });
      expect(sanitized).toBe('Visit [URL removed] for more info');
    });

    it('should remove emails when requested', () => {
      const content = 'Contact test@example.com for help';
      const sanitized = ContentProcessor.sanitizeContent(content, { removeEmails: true });
      expect(sanitized).toBe('Contact [Email removed] for help');
    });

    it('should clean up excessive whitespace', () => {
      const content = 'Hello\n\n\n\nworld    test';
      const sanitized = ContentProcessor.sanitizeContent(content);
      expect(sanitized).toBe('Hello\n\nworld test');
    });
  });

  describe('formatContent', () => {
    it('should wrap long lines when requested', () => {
      const content = 'This is a very long line that should be wrapped at a specific length';
      const formatted = ContentProcessor.formatContent(content, { 
        wrapLongLines: true, 
        maxLineLength: 20 
      });
      const lines = formatted.split('\n');
      expect(lines.every(line => line.length <= 20)).toBe(true);
    });

    it('should add line numbers when requested', () => {
      const content = 'Line 1\nLine 2\nLine 3';
      const formatted = ContentProcessor.formatContent(content, { addLineNumbers: true });
      expect(formatted).toContain('1: Line 1');
      expect(formatted).toContain('2: Line 2');
      expect(formatted).toContain('3: Line 3');
    });

    it('should normalize line endings', () => {
      const content = 'Line 1\r\nLine 2\rLine 3\nLine 4';
      const formatted = ContentProcessor.formatContent(content);
      expect(formatted).toBe('Line 1\nLine 2\nLine 3\nLine 4');
    });
  });

  describe('extractInsights', () => {
    it('should extract key points from bullet lists', () => {
      const content = 'Analysis:\n- First key point\n- Second key point\n* Third point';
      const insights = ContentProcessor.extractInsights(content);
      expect(insights.keyPoints).toHaveLength(3);
      expect(insights.keyPoints[0]).toBe('First key point');
      expect(insights.keyPoints[1]).toBe('Second key point');
      expect(insights.keyPoints[2]).toBe('Third point');
    });

    it('should extract recommendations', () => {
      const content = 'I recommend focusing on skills. You should consider training.';
      const insights = ContentProcessor.extractInsights(content);
      expect(insights.recommendations.length).toBeGreaterThanOrEqual(1);
      expect(insights.recommendations.some(r => r.includes('recommend'))).toBe(true);
    });

    it('should extract warnings', () => {
      const content = 'Warning: this is risky. Be careful with this approach.';
      const insights = ContentProcessor.extractInsights(content);
      expect(insights.warnings.length).toBeGreaterThanOrEqual(1);
      expect(insights.warnings.some(w => w.includes('Warning') || w.includes('careful'))).toBe(true);
    });

    it('should generate summary from first few lines', () => {
      const content = 'This is the first line. This is the second line. This is the third line.\n\n# Header\nMore content';
      const insights = ContentProcessor.extractInsights(content);
      expect(insights.summary).toContain('first line');
      expect(insights.summary).toContain('second line');
      expect(insights.summary.length).toBeLessThanOrEqual(300);
    });
  });

  describe('exportContent', () => {
    const messages: ChatboxMessage[] = [
      {
        id: 'msg-1',
        type: 'user',
        content: 'Hello',
        timestamp: '2025-01-08T12:00:00Z'
      },
      {
        id: 'msg-2',
        type: 'assistant',
        content: 'Hi there!',
        timestamp: '2025-01-08T12:01:00Z'
      }
    ];

    it('should export as plain text', () => {
      const exported = ContentProcessor.exportContent(messages, 'text');
      expect(exported).toContain('Hello');
      expect(exported).toContain('Hi there!');
      expect(exported).toContain('USER');
      expect(exported).toContain('ASSISTANT');
    });

    it('should export as markdown', () => {
      const exported = ContentProcessor.exportContent(messages, 'markdown', { title: 'Test Chat' });
      expect(exported).toContain('# Test Chat');
      expect(exported).toContain('## Message 1');
      expect(exported).toContain('**Type:** user');
    });

    it('should export as HTML', () => {
      const exported = ContentProcessor.exportContent(messages, 'html', { title: 'Test Chat' });
      expect(exported).toContain('<!DOCTYPE html>');
      expect(exported).toContain('<title>Test Chat</title>');
      expect(exported).toContain('<div class="message user">');
    });

    it('should export as JSON', () => {
      const exported = ContentProcessor.exportContent(messages, 'json');
      const parsed = JSON.parse(exported);
      expect(parsed.messages).toHaveLength(2);
      expect(parsed.messages[0].content).toBe('Hello');
      expect(parsed.metadata).toBeDefined();
    });

    it('should exclude metadata when requested', () => {
      const exported = ContentProcessor.exportContent(messages, 'text', { includeMetadata: false });
      expect(exported).not.toContain('Generated:');
      expect(exported).not.toContain('Messages:');
    });
  });

  describe('compareAnalysisResults', () => {
    const result1: AnalysisResult = {
      id: 'test-1',
      type: 'profile',
      status: 'success',
      content: 'Short analysis with key point about skills.',
      timestamp: '2025-01-08T12:00:00Z',
      model: 'model-a'
    };

    const result2: AnalysisResult = {
      id: 'test-2',
      type: 'profile',
      status: 'success',
      content: 'Much longer and more detailed analysis with comprehensive insights about skills and career development.',
      timestamp: '2025-01-08T13:00:00Z',
      model: 'model-b'
    };

    it('should identify content length differences', () => {
      const comparison = ContentProcessor.compareAnalysisResults(result1, result2);
      // The longer analysis should be identified as an improvement (recency at minimum)
      expect(comparison.improvements.length).toBeGreaterThan(0);
    });

    it('should identify model differences', () => {
      const comparison = ContentProcessor.compareAnalysisResults(result1, result2);
      expect(comparison.differences.some(d => d.includes('model-a vs model-b'))).toBe(true);
    });

    it('should identify recency improvements', () => {
      const comparison = ContentProcessor.compareAnalysisResults(result1, result2);
      expect(comparison.improvements.some(i => i.includes('more recent'))).toBe(true);
    });

    it('should identify similar models', () => {
      const result3 = { ...result2, model: 'model-a' };
      const comparison = ContentProcessor.compareAnalysisResults(result1, result3);
      expect(comparison.similarities.some(s => s.includes('Both use model-a'))).toBe(true);
    });
  });

  describe('generateAnalysisSummary', () => {
    const results: AnalysisResult[] = [
      {
        id: 'test-1',
        type: 'profile',
        status: 'success',
        content: 'Analysis 1 with skills focus',
        timestamp: '2025-01-08T12:00:00Z',
        model: 'model-a'
      },
      {
        id: 'test-2',
        type: 'profile',
        status: 'success',
        content: 'Analysis 2 with career development',
        timestamp: '2025-01-08T13:00:00Z',
        model: 'model-b'
      },
      {
        id: 'test-3',
        type: 'resume',
        status: 'success',
        content: 'Resume analysis with skills assessment',
        timestamp: '2025-01-08T14:00:00Z',
        model: 'model-a'
      }
    ];

    it('should calculate correct statistics', () => {
      const summary = ContentProcessor.generateAnalysisSummary(results);
      expect(summary.totalAnalyses).toBe(3);
      expect(summary.averageLength).toBeGreaterThan(0);
      expect(summary.modelUsage['model-a']).toBe(2);
      expect(summary.modelUsage['model-b']).toBe(1);
    });

    it('should identify time range', () => {
      const summary = ContentProcessor.generateAnalysisSummary(results);
      expect(summary.timeRange.earliest).toContain('2025-01-08T12:00:00');
      expect(summary.timeRange.latest).toContain('2025-01-08T14:00:00');
    });

    it('should handle empty results', () => {
      const summary = ContentProcessor.generateAnalysisSummary([]);
      expect(summary.totalAnalyses).toBe(0);
      expect(summary.averageLength).toBe(0);
      expect(summary.commonThemes).toEqual([]);
      expect(summary.modelUsage).toEqual({});
    });

    it('should limit common themes', () => {
      const summary = ContentProcessor.generateAnalysisSummary(results);
      expect(summary.commonThemes.length).toBeLessThanOrEqual(5);
    });
  });
});