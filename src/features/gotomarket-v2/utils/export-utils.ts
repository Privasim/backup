import { GoToMarketStrategies, MarkdownGoToMarketStrategies, ContentLength } from '../types';
import { LegacyStrategyConverter } from './legacy-converter';

// Enhanced export functions for markdown-first approach

export interface ExportOptions {
  format: 'markdown' | 'json' | 'both';
  includeMetadata?: boolean;
  contentLength?: ContentLength;
  customFilename?: string;
}

export interface ExportResult {
  success: boolean;
  filename?: string;
  error?: string;
}

/**
 * Primary export function - prioritizes markdown format
 */
export const exportStrategies = (
  strategies: GoToMarketStrategies | MarkdownGoToMarketStrategies, 
  options: ExportOptions = { format: 'markdown' }
): ExportResult => {
  try {
    const baseFilename = options.customFilename || 
      `go-to-market-${strategies.businessContext.businessIdea.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`;

    switch (options.format) {
      case 'markdown':
        return exportToMarkdownEnhanced(strategies, baseFilename, options);
      case 'json':
        return exportToJSONEnhanced(strategies, baseFilename, options);
      case 'both':
        const markdownResult = exportToMarkdownEnhanced(strategies, baseFilename, options);
        const jsonResult = exportToJSONEnhanced(strategies, baseFilename, options);
        return {
          success: markdownResult.success && jsonResult.success,
          filename: `${baseFilename}.md & ${baseFilename}.json`,
          error: markdownResult.error || jsonResult.error
        };
      default:
        return { success: false, error: 'Invalid export format' };
    }
  } catch (error) {
    return {
      success: false,
      error: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

/**
 * Enhanced markdown export with metadata
 */
export const exportToMarkdownEnhanced = (
  strategies: GoToMarketStrategies | MarkdownGoToMarketStrategies,
  baseFilename: string,
  options: ExportOptions
): ExportResult => {
  try {
    let content: string;
    let metadata: any = {};

    if (isMarkdownStrategies(strategies)) {
      // Already in markdown format - use raw markdown
      content = strategies.rawMarkdown;
      metadata = strategies.metadata;
    } else {
      // Convert from JSON to markdown
      const conversionResult = LegacyStrategyConverter.convertJsonToMarkdown(strategies);
      if (!conversionResult.success || !conversionResult.data) {
        return { success: false, error: conversionResult.error || 'Conversion failed' };
      }
      content = conversionResult.data.rawMarkdown;
      metadata = conversionResult.data.metadata;
    }

    // Add metadata header if requested
    if (options.includeMetadata) {
      const metadataHeader = generateMetadataHeader(metadata, strategies);
      content = metadataHeader + '\n\n' + content;
    }

    const filename = `${baseFilename}.md`;
    downloadFile(content, filename, 'text/markdown');
    
    return { success: true, filename };
  } catch (error) {
    return {
      success: false,
      error: `Markdown export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

/**
 * Enhanced JSON export - converts from markdown if needed
 */
export const exportToJSONEnhanced = (
  strategies: GoToMarketStrategies | MarkdownGoToMarketStrategies,
  baseFilename: string,
  options: ExportOptions
): ExportResult => {
  try {
    let jsonData: GoToMarketStrategies;

    if (isMarkdownStrategies(strategies)) {
      // Convert from markdown to JSON
      const conversionResult = LegacyStrategyConverter.convertMarkdownToJson(strategies);
      if (!conversionResult.success || !conversionResult.data) {
        return { success: false, error: conversionResult.error || 'Conversion failed' };
      }
      jsonData = conversionResult.data;
    } else {
      // Already in JSON format
      jsonData = strategies;
    }

    // Add export metadata if requested
    if (options.includeMetadata) {
      (jsonData as any).exportMetadata = {
        exportedAt: new Date().toISOString(),
        exportFormat: 'json',
        contentLength: options.contentLength,
        version: '2.0'
      };
    }

    const content = JSON.stringify(jsonData, null, 2);
    const filename = `${baseFilename}.json`;
    downloadFile(content, filename, 'application/json');
    
    return { success: true, filename };
  } catch (error) {
    return {
      success: false,
      error: `JSON export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

// Legacy functions for backward compatibility
export const exportToJSON = (strategies: GoToMarketStrategies): void => {
  exportToJSONEnhanced(strategies, 
    `go-to-market-${strategies.businessContext.businessIdea.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
    { format: 'json' }
  );
};

export const exportToMarkdown = (strategies: GoToMarketStrategies): void => {
  exportToMarkdownEnhanced(strategies,
    `go-to-market-${strategies.businessContext.businessIdea.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
    { format: 'markdown' }
  );
};

/**
 * Enhanced clipboard functionality with markdown priority
 */
export const copyToClipboard = async (
  strategies: GoToMarketStrategies | MarkdownGoToMarketStrategies, 
  format: 'json' | 'markdown' = 'markdown',
  includeMetadata: boolean = false
): Promise<{ success: boolean; error?: string }> => {
  try {
    let content: string;

    if (format === 'markdown') {
      if (isMarkdownStrategies(strategies)) {
        content = strategies.rawMarkdown;
        if (includeMetadata) {
          const metadataHeader = generateMetadataHeader(strategies.metadata, strategies);
          content = metadataHeader + '\n\n' + content;
        }
      } else {
        const conversionResult = LegacyStrategyConverter.convertJsonToMarkdown(strategies);
        if (!conversionResult.success || !conversionResult.data) {
          return { success: false, error: conversionResult.error || 'Conversion failed' };
        }
        content = conversionResult.data.rawMarkdown;
      }
    } else {
      // JSON format
      let jsonData: GoToMarketStrategies;
      
      if (isMarkdownStrategies(strategies)) {
        const conversionResult = LegacyStrategyConverter.convertMarkdownToJson(strategies);
        if (!conversionResult.success || !conversionResult.data) {
          return { success: false, error: conversionResult.error || 'Conversion failed' };
        }
        jsonData = conversionResult.data;
      } else {
        jsonData = strategies;
      }
      
      content = JSON.stringify(jsonData, null, 2);
    }

    await navigator.clipboard.writeText(content);
    return { success: true };
  } catch (error) {
    // Fallback for browsers that don't support clipboard API
    try {
      const textArea = document.createElement('textarea');
      textArea.value = content!;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        return { success: true };
      } else {
        return { 
          success: false, 
          error: 'Clipboard operation failed: execCommand returned false' 
        };
      }
    } catch (fallbackError) {
      return { 
        success: false, 
        error: `Clipboard operation failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
};

/**
 * Enhanced import functionality with format detection
 */
export interface ImportResult {
  success: boolean;
  data?: GoToMarketStrategies | MarkdownGoToMarketStrategies;
  format?: 'json' | 'markdown';
  error?: string;
  warnings?: string[];
}

export const importStrategies = (content: string): ImportResult => {
  try {
    // Try to detect format
    const format = detectContentFormat(content);
    
    switch (format) {
      case 'json':
        return importFromJSONEnhanced(content);
      case 'markdown':
        return importFromMarkdown(content);
      default:
        return {
          success: false,
          error: 'Unable to detect content format. Please ensure the content is valid JSON or Markdown.'
        };
    }
  } catch (error) {
    return {
      success: false,
      error: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

export const importFromJSONEnhanced = (jsonString: string): ImportResult => {
  try {
    const parsed = JSON.parse(jsonString);
    
    // Detect if it's already markdown format
    if (parsed.rawMarkdown && parsed.sections && parsed.metadata) {
      // It's a MarkdownGoToMarketStrategies
      return {
        success: true,
        data: parsed as MarkdownGoToMarketStrategies,
        format: 'markdown'
      };
    }
    
    // Validate JSON strategy format
    if (!parsed.id || !parsed.businessContext) {
      return {
        success: false,
        error: 'Invalid strategy format: missing required fields (id, businessContext)'
      };
    }
    
    // Check if it has strategy arrays (even if empty)
    const hasStrategyStructure = 
      Array.isArray(parsed.marketingStrategies) ||
      Array.isArray(parsed.salesChannels) ||
      Array.isArray(parsed.pricingStrategies);
    
    if (!hasStrategyStructure) {
      return {
        success: false,
        error: 'Invalid strategy format: missing strategy arrays'
      };
    }
    
    return {
      success: true,
      data: parsed as GoToMarketStrategies,
      format: 'json'
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse JSON: ${error instanceof Error ? error.message : 'Invalid JSON'}`
    };
  }
};

export const importFromMarkdown = (markdownContent: string): ImportResult => {
  try {
    // Create a basic MarkdownGoToMarketStrategies structure
    const markdownStrategies: MarkdownGoToMarketStrategies = {
      id: `imported-${Date.now()}`,
      businessContext: extractBusinessContextFromMarkdown(markdownContent),
      rawMarkdown: markdownContent,
      sections: [], // Would need proper parsing to extract sections
      metadata: {
        contentLength: 'standard' as ContentLength,
        generatedAt: new Date().toISOString(),
        wordCount: countWords(markdownContent),
        estimatedReadTime: Math.ceil(countWords(markdownContent) / 200)
      }
    };
    
    return {
      success: true,
      data: markdownStrategies,
      format: 'markdown',
      warnings: ['Markdown import is basic - section structure may need manual review']
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to import markdown: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

// Legacy function for backward compatibility
export const importFromJSON = (jsonString: string): GoToMarketStrategies => {
  const result = importFromJSONEnhanced(jsonString);
  if (!result.success) {
    throw new Error(result.error || 'Import failed');
  }
  
  if (result.format === 'markdown') {
    // Convert to JSON format for legacy compatibility
    const conversionResult = LegacyStrategyConverter.convertMarkdownToJson(result.data as MarkdownGoToMarketStrategies);
    if (!conversionResult.success || !conversionResult.data) {
      throw new Error(conversionResult.error || 'Conversion failed');
    }
    return conversionResult.data;
  }
  
  return result.data as GoToMarketStrategies;
};

// Helper functions

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

function isMarkdownStrategies(strategies: any): strategies is MarkdownGoToMarketStrategies {
  return strategies && 
         typeof strategies.rawMarkdown === 'string' && 
         Array.isArray(strategies.sections) && 
         strategies.metadata;
}

function generateMetadataHeader(metadata: any, strategies: GoToMarketStrategies | MarkdownGoToMarketStrategies): string {
  const lines = [
    '---',
    `title: "Go-to-Market Strategy: ${strategies.businessContext.businessIdea}"`,
    `generated: "${metadata.generatedAt || new Date().toISOString()}"`,
    `content_length: "${metadata.contentLength || 'standard'}"`,
    `word_count: ${metadata.wordCount || 0}`,
    `estimated_read_time: "${metadata.estimatedReadTime || 0} minutes"`,
    `version: "2.0"`,
    '---'
  ];
  
  return lines.join('\n');
}

function detectContentFormat(content: string): 'json' | 'markdown' | 'unknown' {
  const trimmed = content.trim();
  
  // Check if it starts with JSON
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      // Not valid JSON
    }
  }
  
  // Check for markdown patterns
  if (trimmed.includes('#') || trimmed.includes('##') || trimmed.includes('**')) {
    return 'markdown';
  }
  
  return 'unknown';
}

function extractBusinessContextFromMarkdown(markdown: string): any {
  // Basic extraction - could be enhanced with more sophisticated parsing
  const lines = markdown.split('\n');
  const context = {
    businessIdea: 'Imported Strategy',
    targetMarket: 'To be defined',
    valueProposition: 'To be defined',
    implementationPhases: [],
    goals: [],
    constraints: []
  };
  
  // Try to extract title
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    context.businessIdea = titleMatch[1].replace(/Go-to-Market Strategy:\s*/, '');
  }
  
  return context;
}

function countWords(text: string): number {
  return text
    .replace(/[#*_`\[\]()]/g, '') // Remove markdown formatting
    .split(/\s+/)
    .filter(word => word.length > 0)
    .length;
}

function generateMarkdownContent(strategies: GoToMarketStrategies): string {
  const { businessContext, marketingStrategies, salesChannels, pricingStrategies, distributionPlans, implementationTimeline, toolRecommendations } = strategies;
  
  let markdown = `# Go-to-Market Strategy: ${businessContext.businessIdea}\n\n`;
  markdown += `*Generated on ${new Date(strategies.generatedAt).toLocaleDateString()}*\n\n`;
  
  // Executive Summary
  markdown += `## Executive Summary\n\n`;
  markdown += `**Business Idea:** ${businessContext.businessIdea}\n\n`;
  markdown += `**Target Market:** ${businessContext.targetMarket}\n\n`;
  markdown += `**Value Proposition:** ${businessContext.valueProposition}\n\n`;
  
  if (businessContext.goals.length > 0) {
    markdown += `**Key Goals:**\n`;
    businessContext.goals.forEach(goal => {
      markdown += `- ${goal}\n`;
    });
    markdown += `\n`;
  }
  
  // Marketing Strategies
  if (marketingStrategies.length > 0) {
    markdown += `## Marketing Strategies\n\n`;
    marketingStrategies.forEach((strategy, index) => {
      markdown += `### ${index + 1}. ${strategy.title}\n\n`;
      markdown += `**Type:** ${strategy.type.charAt(0).toUpperCase() + strategy.type.slice(1)}\n\n`;
      markdown += `**Description:** ${strategy.description}\n\n`;
      markdown += `**Timeline:** ${strategy.timeline}\n\n`;
      markdown += `**Budget:** ${strategy.budget.min} - ${strategy.budget.max} ${strategy.budget.currency}\n\n`;
      markdown += `**Expected ROI:** ${strategy.expectedROI}\n\n`;
      markdown += `**Difficulty:** ${strategy.difficulty.charAt(0).toUpperCase() + strategy.difficulty.slice(1)}\n\n`;
      
      if (strategy.tactics.length > 0) {
        markdown += `**Tactics:**\n`;
        strategy.tactics.forEach(tactic => {
          markdown += `- **${tactic.name}** (${tactic.timeframe}, ${tactic.estimatedCost}): ${tactic.description}\n`;
        });
        markdown += `\n`;
      }
      
      markdown += `---\n\n`;
    });
  }
  
  // Sales Channels
  if (salesChannels.length > 0) {
    markdown += `## Sales Channels\n\n`;
    salesChannels.forEach((channel, index) => {
      markdown += `### ${index + 1}. ${channel.name}\n\n`;
      markdown += `**Type:** ${channel.type.charAt(0).toUpperCase() + channel.type.slice(1)}\n\n`;
      markdown += `**Description:** ${channel.description}\n\n`;
      markdown += `**Expected Reach:** ${channel.expectedReach}\n\n`;
      markdown += `**Suitability Score:** ${channel.suitabilityScore}/100\n\n`;
      
      markdown += `**Cost Structure:**\n`;
      markdown += `- Setup: ${channel.costStructure.setup}\n`;
      markdown += `- Monthly: ${channel.costStructure.monthly}\n`;
      if (channel.costStructure.commission) {
        markdown += `- Commission: ${channel.costStructure.commission}\n`;
      }
      markdown += `\n`;
      
      if (channel.implementationSteps.length > 0) {
        markdown += `**Implementation Steps:**\n`;
        channel.implementationSteps.forEach((step, stepIndex) => {
          markdown += `${stepIndex + 1}. **${step.title}** (${step.estimatedTime}): ${step.description}\n`;
        });
        markdown += `\n`;
      }
      
      markdown += `---\n\n`;
    });
  }
  
  // Pricing Strategies
  if (pricingStrategies.length > 0) {
    markdown += `## Pricing Strategies\n\n`;
    pricingStrategies.forEach((pricing, index) => {
      markdown += `### ${index + 1}. ${pricing.title}\n\n`;
      markdown += `**Model:** ${pricing.model.charAt(0).toUpperCase() + pricing.model.slice(1)}\n\n`;
      markdown += `**Description:** ${pricing.description}\n\n`;
      markdown += `**Market Fit Score:** ${pricing.marketFit}/100\n\n`;
      
      if (pricing.pricePoints.length > 0) {
        markdown += `**Price Points:**\n\n`;
        pricing.pricePoints.forEach(point => {
          markdown += `- **${point.tier}** - ${point.price}\n`;
          markdown += `  - Target: ${point.targetSegment}\n`;
          if (point.features.length > 0) {
            markdown += `  - Features: ${point.features.join(', ')}\n`;
          }
          markdown += `\n`;
        });
      }
      
      markdown += `**Competitive Analysis:** ${pricing.competitiveAnalysis}\n\n`;
      markdown += `---\n\n`;
    });
  }
  
  // Distribution Plans
  if (distributionPlans.length > 0) {
    markdown += `## Distribution Plans\n\n`;
    distributionPlans.forEach((plan, index) => {
      markdown += `### ${index + 1}. ${plan.channel}\n\n`;
      markdown += `**Strategy:** ${plan.strategy}\n\n`;
      markdown += `**Timeline:** ${plan.timeline}\n\n`;
      markdown += `**Expected Outcome:** ${plan.expectedOutcome}\n\n`;
      
      if (plan.resources.length > 0) {
        markdown += `**Required Resources:**\n`;
        plan.resources.forEach(resource => {
          markdown += `- ${resource}\n`;
        });
        markdown += `\n`;
      }
      
      markdown += `---\n\n`;
    });
  }
  
  // Implementation Timeline
  if (implementationTimeline.length > 0) {
    markdown += `## Implementation Timeline\n\n`;
    implementationTimeline.forEach(phase => {
      markdown += `### ${phase.phase} (${phase.startDate} - ${phase.endDate})\n\n`;
      
      if (phase.activities.length > 0) {
        markdown += `**Activities:**\n`;
        phase.activities.forEach(activity => {
          markdown += `- ${activity}\n`;
        });
        markdown += `\n`;
      }
      
      if (phase.milestones.length > 0) {
        markdown += `**Milestones:**\n`;
        phase.milestones.forEach(milestone => {
          markdown += `- ${milestone}\n`;
        });
        markdown += `\n`;
      }
    });
  }
  
  // Tool Recommendations
  if (toolRecommendations.length > 0) {
    markdown += `## Recommended Tools\n\n`;
    toolRecommendations.forEach(tool => {
      markdown += `### ${tool.name}\n\n`;
      markdown += `**Category:** ${tool.category}\n\n`;
      markdown += `**Cost:** ${tool.costEstimate}\n\n`;
      markdown += `**Priority:** ${tool.implementationPriority.charAt(0).toUpperCase() + tool.implementationPriority.slice(1)}\n\n`;
      markdown += `**Complexity:** ${tool.integrationComplexity.charAt(0).toUpperCase() + tool.integrationComplexity.slice(1)}\n\n`;
      markdown += `**Relevance Score:** ${tool.relevanceScore}/100\n\n`;
      
      if (tool.recommendedFor.length > 0) {
        markdown += `**Recommended For:**\n`;
        tool.recommendedFor.forEach(use => {
          markdown += `- ${use}\n`;
        });
        markdown += `\n`;
      }
      
      markdown += `---\n\n`;
    });
  }
  
  return markdown;
}