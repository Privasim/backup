import { ChatboxMessage, AnalysisResult } from '../types';

/**
 * Content sanitization options
 */
interface SanitizationOptions {
  allowHtml?: boolean;
  allowMarkdown?: boolean;
  maxLength?: number;
  removeUrls?: boolean;
  removeEmails?: boolean;
  removePhoneNumbers?: boolean;
}

/**
 * Content formatting options
 */
interface FormattingOptions {
  preserveWhitespace?: boolean;
  convertMarkdown?: boolean;
  highlightCode?: boolean;
  addLineNumbers?: boolean;
  wrapLongLines?: boolean;
  maxLineLength?: number;
}

/**
 * Export format options
 */
export type ExportFormat = 'text' | 'markdown' | 'html' | 'json' | 'pdf';

/**
 * Content processing utilities for chatbox messages and analysis results
 */
export class ContentProcessor {
  /**
   * Sanitize content to remove potentially harmful or unwanted elements
   */
  static sanitizeContent(content: string, options: SanitizationOptions = {}): string {
    const {
      allowHtml = false,
      allowMarkdown = true,
      maxLength = 50000,
      removeUrls = false,
      removeEmails = false,
      removePhoneNumbers = false
    } = options;

    let sanitized = content;

    // Truncate if too long
    if (maxLength && sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength) + '...';
    }

    // Remove HTML if not allowed
    if (!allowHtml) {
      sanitized = sanitized.replace(/<[^>]*?>/g, '');
    }

    // Remove URLs if requested
    if (removeUrls) {
      sanitized = sanitized.replace(/https?:\/\/[^\s]+/g, '[URL removed]');
    }

    // Remove emails if requested
    if (removeEmails) {
      sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[Email removed]');
    }

    // Remove phone numbers if requested
    if (removePhoneNumbers) {
      sanitized = sanitized.replace(/(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g, '[Phone removed]');
    }

    // Clean up excessive whitespace
    sanitized = sanitized.replace(/\n{3,}/g, '\n\n');
    sanitized = sanitized.replace(/[ \t]{2,}/g, ' ');

    return sanitized.trim();
  }

  /**
   * Format content with various styling options
   */
  static formatContent(content: string, options: FormattingOptions = {}): string {
    const {
      preserveWhitespace = false,
      convertMarkdown = false,
      highlightCode = false,
      addLineNumbers = false,
      wrapLongLines = false,
      maxLineLength = 80
    } = options;

    let formatted = content;

    // Preserve or normalize whitespace
    if (!preserveWhitespace) {
      formatted = formatted.replace(/\r\n/g, '\n');
      formatted = formatted.replace(/\r/g, '\n');
      formatted = formatted.replace(/\t/g, '  ');
    }

    // Wrap long lines if requested
    if (wrapLongLines && maxLineLength) {
      const lines = formatted.split('\n');
      const wrappedLines = lines.map(line => {
        if (line.length <= maxLineLength) return line;
        
        const words = line.split(' ');
        const wrappedLine: string[] = [];
        let currentLine = '';
        
        words.forEach(word => {
          if ((currentLine + ' ' + word).length <= maxLineLength) {
            currentLine += (currentLine ? ' ' : '') + word;
          } else {
            if (currentLine) wrappedLine.push(currentLine);
            currentLine = word;
          }
        });
        
        if (currentLine) wrappedLine.push(currentLine);
        return wrappedLine.join('\n');
      });
      
      formatted = wrappedLines.join('\n');
    }

    // Add line numbers if requested
    if (addLineNumbers) {
      const lines = formatted.split('\n');
      const maxDigits = lines.length.toString().length;
      formatted = lines
        .map((line, index) => {
          const lineNum = (index + 1).toString().padStart(maxDigits, ' ');
          return `${lineNum}: ${line}`;
        })
        .join('\n');
    }

    return formatted;
  }

  /**
   * Extract key insights from analysis content
   */
  static extractInsights(content: string): {
    summary: string;
    keyPoints: string[];
    recommendations: string[];
    warnings: string[];
  } {
    const insights = {
      summary: '',
      keyPoints: [] as string[],
      recommendations: [] as string[],
      warnings: [] as string[]
    };

    const lines = content.split('\n').map(line => line.trim()).filter(Boolean);

    // Extract summary (first paragraph or section)
    const summaryLines = [];
    for (const line of lines) {
      if (line.startsWith('#') || line.startsWith('##')) break;
      if (line.length > 20) summaryLines.push(line);
      if (summaryLines.length >= 3) break;
    }
    insights.summary = summaryLines.join(' ').substring(0, 300);

    // Extract key points (bullet points, numbered lists)
    lines.forEach(line => {
      if (line.match(/^[-*•]\s+/) || line.match(/^\d+\.\s+/)) {
        const point = line.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, '');
        if (point.length > 10) {
          insights.keyPoints.push(point);
        }
      }
    });

    // Extract recommendations (sentences containing recommendation keywords)
    const recommendationKeywords = ['recommend', 'suggest', 'should', 'consider', 'try', 'focus on'];
    const sentences = content.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase();
      if (recommendationKeywords.some(keyword => lowerSentence.includes(keyword))) {
        insights.recommendations.push(sentence);
      }
    });

    // Extract warnings (sentences containing warning keywords)
    const warningKeywords = ['warning', 'caution', 'risk', 'danger', 'avoid', 'careful', 'concern'];
    const warningSentences = content.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    warningSentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase();
      if (warningKeywords.some(keyword => lowerSentence.includes(keyword))) {
        insights.warnings.push(sentence);
      }
    });

    return insights;
  }

  /**
   * Convert content to different export formats
   */
  static exportContent(
    messages: ChatboxMessage[],
    format: ExportFormat,
    options: { includeMetadata?: boolean; title?: string } = {}
  ): string {
    const { includeMetadata = true, title = 'Chatbox Conversation' } = options;

    switch (format) {
      case 'text':
        return this.exportAsText(messages, includeMetadata);
      
      case 'markdown':
        return this.exportAsMarkdown(messages, includeMetadata, title);
      
      case 'html':
        return this.exportAsHtml(messages, includeMetadata, title);
      
      case 'json':
        return this.exportAsJson(messages, includeMetadata);
      
      default:
        return this.exportAsText(messages, includeMetadata);
    }
  }

  /**
   * Export as plain text
   */
  private static exportAsText(messages: ChatboxMessage[], includeMetadata: boolean): string {
    const lines: string[] = [];
    
    if (includeMetadata) {
      lines.push(`Chatbox Conversation Export`);
      lines.push(`Generated: ${new Date().toISOString()}`);
      lines.push(`Messages: ${messages.length}`);
      lines.push('');
      lines.push('=' .repeat(50));
      lines.push('');
    }

    messages.forEach((message, index) => {
      if (includeMetadata) {
        lines.push(`[${index + 1}] ${message.type.toUpperCase()}`);
        lines.push(`Time: ${new Date(message.timestamp).toLocaleString()}`);
        if (message.analysisType) {
          lines.push(`Analysis Type: ${message.analysisType}`);
        }
        lines.push('');
      }
      
      lines.push(message.content);
      lines.push('');
      
      if (includeMetadata && index < messages.length - 1) {
        lines.push('-'.repeat(30));
        lines.push('');
      }
    });

    return lines.join('\n');
  }

  /**
   * Export as Markdown
   */
  private static exportAsMarkdown(messages: ChatboxMessage[], includeMetadata: boolean, title: string): string {
    const lines: string[] = [];
    
    lines.push(`# ${title}`);
    lines.push('');
    
    if (includeMetadata) {
      lines.push(`**Generated:** ${new Date().toISOString()}`);
      lines.push(`**Messages:** ${messages.length}`);
      lines.push('');
    }

    messages.forEach((message, index) => {
      lines.push(`## Message ${index + 1}`);
      lines.push('');
      
      if (includeMetadata) {
        lines.push(`**Type:** ${message.type}`);
        lines.push(`**Time:** ${new Date(message.timestamp).toLocaleString()}`);
        if (message.analysisType) {
          lines.push(`**Analysis Type:** ${message.analysisType}`);
        }
        lines.push('');
      }
      
      lines.push(message.content);
      lines.push('');
    });

    return lines.join('\n');
  }

  /**
   * Export as HTML
   */
  private static exportAsHtml(messages: ChatboxMessage[], includeMetadata: boolean, title: string): string {
    const escapeHtml = (text: string) => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };

    const formatContent = (content: string) => {
      return escapeHtml(content)
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>');
    };

    let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        .message { margin-bottom: 30px; padding: 20px; border-radius: 8px; background: #f8f9fa; }
        .message-header { font-weight: bold; color: #495057; margin-bottom: 10px; }
        .message-meta { font-size: 0.9em; color: #6c757d; margin-bottom: 15px; }
        .message-content { color: #212529; }
        code { background: #e9ecef; padding: 2px 4px; border-radius: 3px; font-family: 'Monaco', 'Consolas', monospace; }
        .user { background: #e3f2fd; }
        .assistant { background: #f3e5f5; }
        .system { background: #fff3e0; }
        .error { background: #ffebee; }
    </style>
</head>
<body>
    <h1>${escapeHtml(title)}</h1>
`;

    if (includeMetadata) {
      html += `
    <div class="metadata">
        <p><strong>Generated:</strong> ${new Date().toISOString()}</p>
        <p><strong>Messages:</strong> ${messages.length}</p>
    </div>
`;
    }

    messages.forEach((message, index) => {
      html += `
    <div class="message ${message.type}">
        <div class="message-header">Message ${index + 1} (${message.type})</div>
`;
      
      if (includeMetadata) {
        html += `
        <div class="message-meta">
            <div>Time: ${new Date(message.timestamp).toLocaleString()}</div>
            ${message.analysisType ? `<div>Analysis Type: ${message.analysisType}</div>` : ''}
        </div>
`;
      }
      
      html += `
        <div class="message-content">${formatContent(message.content)}</div>
    </div>
`;
    });

    html += `
</body>
</html>`;

    return html;
  }

  /**
   * Export as JSON
   */
  private static exportAsJson(messages: ChatboxMessage[], includeMetadata: boolean): string {
    const exportData = {
      metadata: includeMetadata ? {
        generated: new Date().toISOString(),
        messageCount: messages.length,
        version: '1.0'
      } : undefined,
      messages: messages.map(message => ({
        id: message.id,
        type: message.type,
        content: message.content,
        timestamp: message.timestamp,
        analysisType: message.analysisType,
        metadata: message.metadata
      }))
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Compare two analysis results and highlight differences
   */
  static compareAnalysisResults(result1: AnalysisResult, result2: AnalysisResult): {
    similarities: string[];
    differences: string[];
    improvements: string[];
  } {
    const comparison = {
      similarities: [] as string[],
      differences: [] as string[],
      improvements: [] as string[]
    };

    // Compare content length
    const lengthDiff = result2.content.length - result1.content.length;
    if (Math.abs(lengthDiff) > 100) {
      if (lengthDiff > 0) {
        comparison.improvements.push(`Analysis is ${lengthDiff} characters more detailed`);
      } else {
        comparison.differences.push(`Analysis is ${Math.abs(lengthDiff)} characters shorter`);
      }
    } else {
      comparison.similarities.push('Similar analysis length');
    }

    // Compare models used
    if (result1.model === result2.model) {
      comparison.similarities.push(`Both use ${result1.model} model`);
    } else {
      comparison.differences.push(`Different models: ${result1.model} vs ${result2.model}`);
    }

    // Compare timestamps (recency)
    const timeDiff = new Date(result2.timestamp).getTime() - new Date(result1.timestamp).getTime();
    if (timeDiff > 0) {
      const hours = Math.round(timeDiff / (1000 * 60 * 60));
      comparison.improvements.push(`Analysis is ${hours} hours more recent`);
    }

    // Extract and compare key insights
    const insights1 = this.extractInsights(result1.content);
    const insights2 = this.extractInsights(result2.content);

    // Compare key points
    const commonPoints = insights1.keyPoints.filter(point1 =>
      insights2.keyPoints.some(point2 => 
        this.calculateSimilarity(point1, point2) > 0.7
      )
    );

    if (commonPoints.length > 0) {
      comparison.similarities.push(`${commonPoints.length} similar key points identified`);
    }

    const newPoints = insights2.keyPoints.filter(point2 =>
      !insights1.keyPoints.some(point1 => 
        this.calculateSimilarity(point1, point2) > 0.7
      )
    );

    if (newPoints.length > 0) {
      comparison.improvements.push(`${newPoints.length} new insights added`);
    }

    return comparison;
  }

  /**
   * Calculate similarity between two strings (simple implementation)
   */
  private static calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Generate a summary of multiple analysis results
   */
  static generateAnalysisSummary(results: AnalysisResult[]): {
    totalAnalyses: number;
    averageLength: number;
    commonThemes: string[];
    modelUsage: Record<string, number>;
    timeRange: { earliest: string; latest: string };
  } {
    if (results.length === 0) {
      return {
        totalAnalyses: 0,
        averageLength: 0,
        commonThemes: [],
        modelUsage: {},
        timeRange: { earliest: '', latest: '' }
      };
    }

    const totalLength = results.reduce((sum, result) => sum + result.content.length, 0);
    const averageLength = Math.round(totalLength / results.length);

    // Count model usage
    const modelUsage: Record<string, number> = {};
    results.forEach(result => {
      modelUsage[result.model] = (modelUsage[result.model] || 0) + 1;
    });

    // Find time range
    const timestamps = results.map(result => new Date(result.timestamp).getTime());
    const earliest = new Date(Math.min(...timestamps)).toISOString();
    const latest = new Date(Math.max(...timestamps)).toISOString();

    // Extract common themes (simplified)
    const allInsights = results.map(result => this.extractInsights(result.content));
    const allKeyPoints = allInsights.flatMap(insight => insight.keyPoints);
    
    // Find common themes by looking for similar key points
    const commonThemes: string[] = [];
    const themeGroups: string[][] = [];
    
    allKeyPoints.forEach(point => {
      let addedToGroup = false;
      for (const group of themeGroups) {
        if (group.some(existingPoint => this.calculateSimilarity(point, existingPoint) > 0.6)) {
          group.push(point);
          addedToGroup = true;
          break;
        }
      }
      if (!addedToGroup) {
        themeGroups.push([point]);
      }
    });

    // Extract themes that appear in multiple analyses
    themeGroups
      .filter(group => group.length >= Math.max(2, Math.ceil(results.length * 0.3)))
      .forEach(group => {
        // Use the shortest point as the theme representative
        const representative = group.reduce((shortest, current) => 
          current.length < shortest.length ? current : shortest
        );
        commonThemes.push(representative);
      });

    return {
      totalAnalyses: results.length,
      averageLength,
      commonThemes: commonThemes.slice(0, 5), // Limit to top 5 themes
      modelUsage,
      timeRange: { earliest, latest }
    };
  }
}