import { 
  GoToMarketStrategies, 
  MarkdownGoToMarketStrategies, 
  MarkdownSection, 
  MarkdownSubsection,
  ContentLength 
} from '../types';

export interface ConversionResult {
  success: boolean;
  data?: MarkdownGoToMarketStrategies;
  error?: string;
  warnings?: string[];
}

export interface ConversionOptions {
  preserveIds?: boolean;
  defaultContentLength?: ContentLength;
  includeMetadata?: boolean;
  validateOutput?: boolean;
}

export class LegacyStrategyConverter {
  /**
   * Converts JSON-based strategies to Markdown format with error handling
   */
  static convertJsonToMarkdown(
    jsonStrategies: GoToMarketStrategies, 
    options: ConversionOptions = {}
  ): ConversionResult {
    try {
      const {
        preserveIds = true,
        defaultContentLength = 'standard',
        includeMetadata = true,
        validateOutput = true
      } = options;

      // Validate input
      const inputValidation = this.validateJsonInput(jsonStrategies);
      if (!inputValidation.isValid) {
        return {
          success: false,
          error: `Invalid JSON input: ${inputValidation.errors.join(', ')}`,
          warnings: inputValidation.warnings
        };
      }

      const markdown = this.generateMarkdownFromJson(jsonStrategies);
      const sections = this.createSectionsFromJson(jsonStrategies);
      
      const converted: MarkdownGoToMarketStrategies = {
        id: preserveIds ? jsonStrategies.id : this.generateNewId(),
        businessContext: jsonStrategies.businessContext,
        rawMarkdown: markdown,
        sections,
        metadata: includeMetadata ? {
          contentLength: defaultContentLength,
          generatedAt: jsonStrategies.generatedAt,
          wordCount: this.countWords(markdown),
          estimatedReadTime: this.calculateReadTime(markdown)
        } : {
          contentLength: defaultContentLength,
          generatedAt: new Date().toISOString(),
          wordCount: this.countWords(markdown),
          estimatedReadTime: this.calculateReadTime(markdown)
        }
      };

      // Validate output if requested
      if (validateOutput) {
        const outputValidation = this.validateConversion(jsonStrategies, converted);
        if (!outputValidation) {
          return {
            success: false,
            error: 'Conversion validation failed',
            warnings: ['Generated markdown may be incomplete']
          };
        }
      }

      return {
        success: true,
        data: converted,
        warnings: inputValidation.warnings
      };

    } catch (error) {
      return {
        success: false,
        error: `Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        warnings: ['Consider manual conversion or data cleanup']
      };
    }
  }

  /**
   * Converts JSON-based strategies to Markdown format (legacy method for backward compatibility)
   */
  static convertJsonToMarkdownLegacy(jsonStrategies: GoToMarketStrategies): MarkdownGoToMarketStrategies {
    const result = this.convertJsonToMarkdown(jsonStrategies);
    if (!result.success) {
      throw new Error(result.error || 'Conversion failed');
    }
    return result.data!;
  }

  /**
   * Generates markdown string from JSON strategies
   */
  private static generateMarkdownFromJson(json: GoToMarketStrategies): string {
    const sections: string[] = [];

    // Marketing Strategies
    if (json.marketingStrategies.length > 0) {
      sections.push('# Marketing Strategy\n');
      json.marketingStrategies.forEach((strategy, index) => {
        sections.push(`## ${strategy.title}\n`);
        sections.push(`${strategy.description}\n`);
        
        if (strategy.tactics.length > 0) {
          sections.push('### Key Tactics:\n');
          strategy.tactics.forEach(tactic => {
            sections.push(`- **${tactic.name}**: ${tactic.description} (${tactic.timeframe}, ${tactic.estimatedCost})\n`);
          });
        }
        
        sections.push(`**Budget**: ${strategy.budget.min} - ${strategy.budget.max} ${strategy.budget.currency}\n`);
        sections.push(`**Timeline**: ${strategy.timeline}\n`);
        sections.push(`**Expected ROI**: ${strategy.expectedROI}\n\n`);
      });
    }

    // Sales Channels
    if (json.salesChannels.length > 0) {
      sections.push('# Sales Strategy\n');
      json.salesChannels.forEach((channel, index) => {
        sections.push(`## ${channel.name}\n`);
        sections.push(`${channel.description}\n`);
        
        if (channel.implementationSteps.length > 0) {
          sections.push('### Implementation Steps:\n');
          channel.implementationSteps.forEach(step => {
            sections.push(`- **${step.title}**: ${step.description} (${step.estimatedTime})\n`);
          });
        }
        
        sections.push(`**Setup Cost**: ${channel.costStructure.setup}\n`);
        sections.push(`**Monthly Cost**: ${channel.costStructure.monthly}\n`);
        sections.push(`**Expected Reach**: ${channel.expectedReach}\n\n`);
      });
    }

    // Pricing Strategies
    if (json.pricingStrategies.length > 0) {
      sections.push('# Pricing Strategy\n');
      json.pricingStrategies.forEach((pricing, index) => {
        sections.push(`## ${pricing.title}\n`);
        sections.push(`${pricing.description}\n`);
        
        if (pricing.pricePoints.length > 0) {
          sections.push('### Price Points:\n');
          pricing.pricePoints.forEach(point => {
            sections.push(`- **${point.tier}**: ${point.price} - ${point.targetSegment}\n`);
            point.features.forEach(feature => {
              sections.push(`  - ${feature}\n`);
            });
          });
        }
        
        sections.push(`**Market Fit Score**: ${pricing.marketFit}/10\n`);
        sections.push(`**Competitive Analysis**: ${pricing.competitiveAnalysis}\n\n`);
      });
    }

    // Distribution Plans
    if (json.distributionPlans.length > 0) {
      sections.push('# Distribution Strategy\n');
      json.distributionPlans.forEach((plan, index) => {
        sections.push(`## ${plan.channel}\n`);
        sections.push(`${plan.strategy}\n`);
        sections.push(`**Timeline**: ${plan.timeline}\n`);
        sections.push(`**Expected Outcome**: ${plan.expectedOutcome}\n`);
        
        if (plan.resources.length > 0) {
          sections.push('### Required Resources:\n');
          plan.resources.forEach(resource => {
            sections.push(`- ${resource}\n`);
          });
        }
        sections.push('\n');
      });
    }

    // Implementation Timeline
    if (json.implementationTimeline.length > 0) {
      sections.push('# Implementation Timeline\n');
      json.implementationTimeline.forEach((phase, index) => {
        sections.push(`## ${phase.phase}\n`);
        sections.push(`**Duration**: ${phase.startDate} - ${phase.endDate}\n`);
        
        if (phase.activities.length > 0) {
          sections.push('### Activities:\n');
          phase.activities.forEach(activity => {
            sections.push(`- ${activity}\n`);
          });
        }
        
        if (phase.milestones.length > 0) {
          sections.push('### Milestones:\n');
          phase.milestones.forEach(milestone => {
            sections.push(`- ${milestone}\n`);
          });
        }
        sections.push('\n');
      });
    }

    // Tool Recommendations
    if (json.toolRecommendations.length > 0) {
      sections.push('# Recommended Tools\n');
      json.toolRecommendations.forEach((tool, index) => {
        sections.push(`## ${tool.name}\n`);
        sections.push(`**Category**: ${tool.category}\n`);
        sections.push(`**Cost Estimate**: ${tool.costEstimate}\n`);
        sections.push(`**Implementation Priority**: ${tool.implementationPriority}\n`);
        sections.push(`**Integration Complexity**: ${tool.integrationComplexity}\n`);
        
        if (tool.recommendedFor.length > 0) {
          sections.push('### Recommended For:\n');
          tool.recommendedFor.forEach(use => {
            sections.push(`- ${use}\n`);
          });
        }
        sections.push('\n');
      });
    }

    return sections.join('');
  }

  /**
   * Creates structured sections from JSON strategies
   */
  private static createSectionsFromJson(json: GoToMarketStrategies): MarkdownSection[] {
    const sections: MarkdownSection[] = [];

    // Marketing Section
    if (json.marketingStrategies.length > 0) {
      const marketingSubsections: MarkdownSubsection[] = json.marketingStrategies.map((strategy, index) => ({
        id: `marketing-${index}`,
        heading: strategy.title,
        content: strategy.description,
        actionItems: strategy.tactics.map(tactic => tactic.name),
        keyMetrics: [strategy.expectedROI, `Budget: ${strategy.budget.min}-${strategy.budget.max}`]
      }));

      sections.push({
        id: 'marketing',
        type: 'marketing',
        title: 'Marketing Strategy',
        content: 'Comprehensive marketing approach to reach target customers.',
        subsections: marketingSubsections,
        completed: json.marketingStrategies.every(s => s.completed),
        editable: true
      });
    }

    // Sales Section
    if (json.salesChannels.length > 0) {
      const salesSubsections: MarkdownSubsection[] = json.salesChannels.map((channel, index) => ({
        id: `sales-${index}`,
        heading: channel.name,
        content: channel.description,
        actionItems: channel.implementationSteps.map(step => step.title),
        keyMetrics: [channel.expectedReach, `Suitability: ${channel.suitabilityScore}/10`]
      }));

      sections.push({
        id: 'sales',
        type: 'sales',
        title: 'Sales Strategy',
        content: 'Multi-channel sales approach to maximize revenue.',
        subsections: salesSubsections,
        completed: json.salesChannels.every(c => c.completed),
        editable: true
      });
    }

    // Pricing Section
    if (json.pricingStrategies.length > 0) {
      const pricingSubsections: MarkdownSubsection[] = json.pricingStrategies.map((pricing, index) => ({
        id: `pricing-${index}`,
        heading: pricing.title,
        content: pricing.description,
        actionItems: pricing.pricePoints.map(point => `${point.tier}: ${point.price}`),
        keyMetrics: [`Market Fit: ${pricing.marketFit}/10`]
      }));

      sections.push({
        id: 'pricing',
        type: 'pricing',
        title: 'Pricing Strategy',
        content: 'Strategic pricing approach to maximize value and adoption.',
        subsections: pricingSubsections,
        completed: json.pricingStrategies.every(p => p.completed),
        editable: true
      });
    }

    // Distribution Section
    if (json.distributionPlans.length > 0) {
      const distributionSubsections: MarkdownSubsection[] = json.distributionPlans.map((plan, index) => ({
        id: `distribution-${index}`,
        heading: plan.channel,
        content: plan.strategy,
        actionItems: plan.resources,
        keyMetrics: [plan.expectedOutcome]
      }));

      sections.push({
        id: 'distribution',
        type: 'distribution',
        title: 'Distribution Strategy',
        content: 'Efficient distribution channels to reach customers.',
        subsections: distributionSubsections,
        completed: true,
        editable: true
      });
    }

    // Timeline Section
    if (json.implementationTimeline.length > 0) {
      const timelineSubsections: MarkdownSubsection[] = json.implementationTimeline.map((phase, index) => ({
        id: `timeline-${index}`,
        heading: phase.phase,
        content: `${phase.startDate} - ${phase.endDate}`,
        actionItems: phase.activities,
        keyMetrics: phase.milestones
      }));

      sections.push({
        id: 'timeline',
        type: 'timeline',
        title: 'Implementation Timeline',
        content: 'Phased approach to implementation with clear milestones.',
        subsections: timelineSubsections,
        completed: true,
        editable: true
      });
    }

    // Tools Section
    if (json.toolRecommendations.length > 0) {
      const toolsSubsections: MarkdownSubsection[] = json.toolRecommendations.map((tool, index) => ({
        id: `tools-${index}`,
        heading: tool.name,
        content: `${tool.category} - ${tool.costEstimate}`,
        actionItems: tool.recommendedFor,
        keyMetrics: [`Priority: ${tool.implementationPriority}`, `Complexity: ${tool.integrationComplexity}`]
      }));

      sections.push({
        id: 'tools',
        type: 'tools',
        title: 'Recommended Tools',
        content: 'Essential tools and platforms for implementation.',
        subsections: toolsSubsections,
        completed: true,
        editable: true
      });
    }

    return sections;
  }

  /**
   * Counts words in markdown content
   */
  private static countWords(markdown: string): number {
    return markdown
      .replace(/[#*_`\[\]()]/g, '') // Remove markdown formatting
      .split(/\s+/)
      .filter(word => word.length > 0)
      .length;
  }

  /**
   * Calculates estimated read time (assuming 200 words per minute)
   */
  private static calculateReadTime(markdown: string): number {
    const wordCount = this.countWords(markdown);
    return Math.ceil(wordCount / 200); // minutes
  }

  /**
   * Validates JSON input before conversion
   */
  private static validateJsonInput(json: GoToMarketStrategies): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!json.id) errors.push('Missing strategy ID');
    if (!json.businessContext) errors.push('Missing business context');
    if (!json.generatedAt) errors.push('Missing generation timestamp');

    // Business context validation
    if (json.businessContext) {
      if (!json.businessContext.businessIdea) warnings.push('Missing business idea');
      if (!json.businessContext.targetMarket) warnings.push('Missing target market');
      if (!json.businessContext.valueProposition) warnings.push('Missing value proposition');
    }

    // Strategy content validation
    const hasContent = json.marketingStrategies.length > 0 || 
                      json.salesChannels.length > 0 || 
                      json.pricingStrategies.length > 0 || 
                      json.distributionPlans.length > 0;
    
    if (!hasContent) {
      warnings.push('No strategy content found - conversion will create placeholder sections');
    }

    // Check for empty or invalid strategies
    json.marketingStrategies.forEach((strategy, index) => {
      if (!strategy.title) warnings.push(`Marketing strategy ${index + 1} missing title`);
      if (!strategy.description) warnings.push(`Marketing strategy ${index + 1} missing description`);
    });

    json.salesChannels.forEach((channel, index) => {
      if (!channel.name) warnings.push(`Sales channel ${index + 1} missing name`);
      if (!channel.description) warnings.push(`Sales channel ${index + 1} missing description`);
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates conversion result
   */
  static validateConversion(original: GoToMarketStrategies, converted: MarkdownGoToMarketStrategies): boolean {
    try {
      // Check basic structure
      if (!converted.id || !converted.businessContext || !converted.rawMarkdown) {
        return false;
      }

      // Check that sections were created
      if (converted.sections.length === 0) {
        return false;
      }

      // Check metadata
      if (!converted.metadata.generatedAt || converted.metadata.wordCount <= 0) {
        return false;
      }

      // Verify markdown content is not empty
      if (converted.rawMarkdown.trim().length < 50) {
        return false;
      }

      // Check that essential sections exist
      const sectionTypes = converted.sections.map(s => s.type);
      const hasEssentialSections = sectionTypes.includes('marketing') || 
                                  sectionTypes.includes('sales') || 
                                  sectionTypes.includes('pricing');
      
      if (!hasEssentialSections) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Conversion validation failed:', error);
      return false;
    }
  }

  /**
   * Attempts to recover from conversion failures with partial data
   */
  static recoverFromFailure(
    jsonStrategies: GoToMarketStrategies, 
    error: string
  ): MarkdownGoToMarketStrategies {
    console.warn('Attempting recovery from conversion failure:', error);
    
    // Create minimal markdown structure
    const fallbackMarkdown = this.createFallbackMarkdown(jsonStrategies);
    const fallbackSections = this.createFallbackSections(jsonStrategies);

    return {
      id: jsonStrategies.id || this.generateNewId(),
      businessContext: jsonStrategies.businessContext || this.createFallbackBusinessContext(),
      rawMarkdown: fallbackMarkdown,
      sections: fallbackSections,
      metadata: {
        contentLength: 'standard' as ContentLength,
        generatedAt: jsonStrategies.generatedAt || new Date().toISOString(),
        wordCount: this.countWords(fallbackMarkdown),
        estimatedReadTime: this.calculateReadTime(fallbackMarkdown)
      }
    };
  }

  /**
   * Creates fallback markdown when conversion fails
   */
  private static createFallbackMarkdown(json: GoToMarketStrategies): string {
    const sections: string[] = [];
    
    sections.push('# Go-to-Market Strategy\n\n');
    sections.push('*This strategy was recovered from legacy data and may be incomplete.*\n\n');
    
    if (json.businessContext?.businessIdea) {
      sections.push(`**Business Idea**: ${json.businessContext.businessIdea}\n\n`);
    }
    
    if (json.businessContext?.targetMarket) {
      sections.push(`**Target Market**: ${json.businessContext.targetMarket}\n\n`);
    }

    // Add basic sections even if empty
    sections.push('## Marketing Strategy\n');
    sections.push('Marketing strategies will be developed based on your business context.\n\n');
    
    sections.push('## Sales Strategy\n');
    sections.push('Sales channels and approaches will be defined to reach your target market.\n\n');
    
    sections.push('## Pricing Strategy\n');
    sections.push('Pricing models will be established to maximize value and adoption.\n\n');

    return sections.join('');
  }

  /**
   * Creates fallback sections when conversion fails
   */
  private static createFallbackSections(json: GoToMarketStrategies): MarkdownSection[] {
    return [
      {
        id: 'marketing-fallback',
        type: 'marketing',
        title: 'Marketing Strategy',
        content: 'Marketing strategies will be developed based on your business context.',
        subsections: [],
        completed: false,
        editable: true
      },
      {
        id: 'sales-fallback',
        type: 'sales',
        title: 'Sales Strategy',
        content: 'Sales channels and approaches will be defined to reach your target market.',
        subsections: [],
        completed: false,
        editable: true
      },
      {
        id: 'pricing-fallback',
        type: 'pricing',
        title: 'Pricing Strategy',
        content: 'Pricing models will be established to maximize value and adoption.',
        subsections: [],
        completed: false,
        editable: true
      }
    ];
  }

  /**
   * Creates fallback business context
   */
  private static createFallbackBusinessContext() {
    return {
      businessIdea: 'Business idea not available',
      targetMarket: 'Target market to be defined',
      valueProposition: 'Value proposition to be developed',
      implementationPhases: [],
      goals: [],
      constraints: []
    };
  }

  /**
   * Generates a new ID for converted strategies
   */
  private static generateNewId(): string {
    return `converted-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Converts markdown back to JSON format (reverse conversion)
   */
  static convertMarkdownToJson(markdownStrategies: MarkdownGoToMarketStrategies): ConversionResult {
    try {
      // This is a complex conversion that would require parsing markdown
      // For now, we'll create a basic structure
      const jsonStrategies: GoToMarketStrategies = {
        id: markdownStrategies.id,
        businessContext: markdownStrategies.businessContext,
        marketingStrategies: [],
        salesChannels: [],
        pricingStrategies: [],
        distributionPlans: [],
        implementationTimeline: [],
        toolRecommendations: [],
        generatedAt: markdownStrategies.metadata.generatedAt,
        version: '2.0'
      };

      // Extract basic information from sections
      markdownStrategies.sections.forEach(section => {
        switch (section.type) {
          case 'marketing':
            section.subsections.forEach((subsection, index) => {
              jsonStrategies.marketingStrategies.push({
                id: subsection.id,
                type: 'digital',
                title: subsection.heading,
                description: subsection.content,
                tactics: subsection.actionItems.map(item => ({
                  id: `tactic-${index}`,
                  name: item,
                  description: item,
                  estimatedCost: 'TBD',
                  timeframe: 'TBD',
                  difficulty: 'medium' as const
                })),
                budget: { min: 'TBD', max: 'TBD', currency: 'USD' },
                timeline: 'TBD',
                expectedROI: subsection.keyMetrics[0] || 'TBD',
                difficulty: 'medium' as const,
                completed: section.completed
              });
            });
            break;
          // Add other section types as needed
        }
      });

      return {
        success: true,
        data: jsonStrategies as any, // Type assertion for compatibility
        warnings: ['Reverse conversion may lose some formatting and detail']
      };

    } catch (error) {
      return {
        success: false,
        error: `Reverse conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Detects the format of strategy data
   */
  static detectFormat(data: any): 'json' | 'markdown' | 'unknown' {
    if (data.rawMarkdown && data.sections && data.metadata) {
      return 'markdown';
    }
    
    if (data.marketingStrategies && data.salesChannels && data.pricingStrategies) {
      return 'json';
    }
    
    return 'unknown';
  }
}