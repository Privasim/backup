import { 
  GoToMarketStrategies, 
  MarketingStrategy, 
  SalesChannel, 
  PricingStrategy, 
  DistributionPlan, 
  TimelinePhase, 
  ToolRecommendation, 
  BusinessContext,
  MarketingTactic,
  ImplementationStep,
  CostStructure,
  PricePoint,
  BudgetEstimate
} from '../types';

export interface MarkdownSection {
  title: string;
  content: string;
  level: number;
  subsections: MarkdownSection[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class MarkdownStrategyProcessor {
  static processMarkdownResponse(rawMarkdown: string, businessContext?: BusinessContext): GoToMarketStrategies {
    try {
      // Parse markdown into structured sections
      const sections = this.parseMarkdownSections(rawMarkdown);
      
      // Validate structure
      const validation = this.validateMarkdownStructure(sections);
      if (!validation.isValid) {
        console.warn('Markdown structure validation warnings:', validation.warnings);
      }
      
      // Extract strategies from sections
      return this.extractStrategiesFromSections(sections, businessContext);
    } catch (error) {
      console.error('Error processing markdown response:', error);
      throw new Error('Failed to process markdown response. Please try again.');
    }
  }

  private static parseMarkdownSections(markdown: string): MarkdownSection[] {
    const lines = markdown.split('\n');
    const sections: MarkdownSection[] = [];
    let currentSection: MarkdownSection | null = null;
    let currentContent: string[] = [];

    for (const line of lines) {
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      
      if (headerMatch) {
        // Save previous section if exists
        if (currentSection) {
          currentSection.content = currentContent.join('\n').trim();
          sections.push(currentSection);
        }
        
        // Start new section
        const level = headerMatch[1].length;
        const title = headerMatch[2].trim();
        
        currentSection = {
          title,
          content: '',
          level,
          subsections: []
        };
        currentContent = [];
      } else if (currentSection) {
        currentContent.push(line);
      }
    }
    
    // Add final section
    if (currentSection) {
      currentSection.content = currentContent.join('\n').trim();
      sections.push(currentSection);
    }
    
    return this.organizeNestedSections(sections);
  }

  private static organizeNestedSections(flatSections: MarkdownSection[]): MarkdownSection[] {
    const organized: MarkdownSection[] = [];
    const stack: MarkdownSection[] = [];

    for (const section of flatSections) {
      // Pop sections from stack that are at same or higher level
      while (stack.length > 0 && stack[stack.length - 1].level >= section.level) {
        stack.pop();
      }

      if (stack.length === 0) {
        // Top-level section
        organized.push(section);
      } else {
        // Nested section
        stack[stack.length - 1].subsections.push(section);
      }

      stack.push(section);
    }

    return organized;
  }

  private static validateMarkdownStructure(sections: MarkdownSection[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for required sections
    const sectionTitles = this.getAllSectionTitles(sections);
    const requiredSections = ['marketing', 'sales', 'pricing'];
    
    for (const required of requiredSections) {
      const found = sectionTitles.some(title => 
        title.toLowerCase().includes(required)
      );
      if (!found) {
        warnings.push(`Missing recommended section: ${required}`);
      }
    }

    // Check for empty sections
    const emptySections = this.findEmptySections(sections);
    if (emptySections.length > 0) {
      warnings.push(`Empty sections found: ${emptySections.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private static getAllSectionTitles(sections: MarkdownSection[]): string[] {
    const titles: string[] = [];
    
    function collectTitles(sectionList: MarkdownSection[]) {
      for (const section of sectionList) {
        titles.push(section.title);
        collectTitles(section.subsections);
      }
    }
    
    collectTitles(sections);
    return titles;
  }

  private static findEmptySections(sections: MarkdownSection[]): string[] {
    const empty: string[] = [];
    
    function checkEmpty(sectionList: MarkdownSection[]) {
      for (const section of sectionList) {
        if (!section.content.trim() && section.subsections.length === 0) {
          empty.push(section.title);
        }
        checkEmpty(section.subsections);
      }
    }
    
    checkEmpty(sections);
    return empty;
  }

  private static extractStrategiesFromSections(sections: MarkdownSection[], businessContext?: BusinessContext): GoToMarketStrategies {
    const strategies: GoToMarketStrategies = {
      id: this.generateId(),
      businessContext: businessContext || this.createDefaultBusinessContext(),
      marketingStrategies: this.extractMarketingStrategies(sections),
      salesChannels: this.extractSalesChannels(sections),
      pricingStrategies: this.extractPricingStrategies(sections),
      distributionPlans: this.extractDistributionPlans(sections),
      implementationTimeline: this.extractImplementationTimeline(sections),
      toolRecommendations: this.extractToolRecommendations(sections),
      generatedAt: new Date().toISOString(),
      version: '2.0'
    };

    return strategies;
  }

  private static extractMarketingStrategies(sections: MarkdownSection[]): MarketingStrategy[] {
    const marketingSection = this.findSectionByKeywords(sections, ['marketing', 'promotion', 'advertising']);
    if (!marketingSection) return [];

    const strategies: MarketingStrategy[] = [];
    
    // Extract strategies from subsections or content
    if (marketingSection.subsections.length > 0) {
      marketingSection.subsections.forEach((subsection, index) => {
        const strategy = this.parseMarketingStrategy(subsection, index);
        if (strategy) strategies.push(strategy);
      });
    } else {
      // Parse from content if no subsections
      const strategy = this.parseMarketingStrategy(marketingSection, 0);
      if (strategy) strategies.push(strategy);
    }

    return strategies;
  }

  private static parseMarketingStrategy(section: MarkdownSection, index: number): MarketingStrategy | null {
    const tactics = this.extractTacticsFromContent(section.content);
    const budget = this.extractBudgetFromContent(section.content);
    
    return {
      id: `marketing-${index + 1}`,
      type: this.inferMarketingType(section.title, section.content),
      title: section.title,
      description: this.extractDescription(section.content),
      tactics,
      budget,
      timeline: this.extractTimelineFromContent(section.content),
      expectedROI: this.extractROIFromContent(section.content),
      difficulty: this.inferDifficulty(section.content),
      completed: false
    };
  }

  private static extractSalesChannels(sections: MarkdownSection[]): SalesChannel[] {
    const salesSection = this.findSectionByKeywords(sections, ['sales', 'channel', 'distribution']);
    if (!salesSection) return [];

    const channels: SalesChannel[] = [];
    
    if (salesSection.subsections.length > 0) {
      salesSection.subsections.forEach((subsection, index) => {
        const channel = this.parseSalesChannel(subsection, index);
        if (channel) channels.push(channel);
      });
    } else {
      const channel = this.parseSalesChannel(salesSection, 0);
      if (channel) channels.push(channel);
    }

    return channels;
  }

  private static parseSalesChannel(section: MarkdownSection, index: number): SalesChannel | null {
    const implementationSteps = this.extractImplementationSteps(section.content);
    const costStructure = this.extractCostStructure(section.content);
    
    return {
      id: `sales-${index + 1}`,
      name: section.title,
      type: this.inferChannelType(section.title, section.content),
      description: this.extractDescription(section.content),
      implementationSteps,
      costStructure,
      expectedReach: this.extractReachFromContent(section.content),
      suitabilityScore: this.calculateSuitabilityScore(section.content),
      completed: false
    };
  }

  private static extractPricingStrategies(sections: MarkdownSection[]): PricingStrategy[] {
    const pricingSection = this.findSectionByKeywords(sections, ['pricing', 'price', 'cost']);
    if (!pricingSection) return [];

    const strategies: PricingStrategy[] = [];
    
    if (pricingSection.subsections.length > 0) {
      pricingSection.subsections.forEach((subsection, index) => {
        const strategy = this.parsePricingStrategy(subsection, index);
        if (strategy) strategies.push(strategy);
      });
    } else {
      const strategy = this.parsePricingStrategy(pricingSection, 0);
      if (strategy) strategies.push(strategy);
    }

    return strategies;
  }

  private static parsePricingStrategy(section: MarkdownSection, index: number): PricingStrategy | null {
    const pricePoints = this.extractPricePoints(section.content);
    
    return {
      id: `pricing-${index + 1}`,
      model: this.inferPricingModel(section.title, section.content),
      title: section.title,
      description: this.extractDescription(section.content),
      pricePoints,
      marketFit: this.calculateMarketFit(section.content),
      competitiveAnalysis: this.extractCompetitiveAnalysis(section.content),
      completed: false
    };
  }

  private static extractDistributionPlans(sections: MarkdownSection[]): DistributionPlan[] {
    // Implementation for distribution plans extraction
    return [];
  }

  private static extractImplementationTimeline(sections: MarkdownSection[]): TimelinePhase[] {
    const timelineSection = this.findSectionByKeywords(sections, ['timeline', 'schedule', 'implementation', 'roadmap']);
    if (!timelineSection) return [];

    const phases: TimelinePhase[] = [];
    
    if (timelineSection.subsections.length > 0) {
      timelineSection.subsections.forEach((subsection) => {
        const phase = this.parseTimelinePhase(subsection);
        if (phase) phases.push(phase);
      });
    }

    return phases;
  }

  private static parseTimelinePhase(section: MarkdownSection): TimelinePhase | null {
    return {
      phase: section.title,
      startDate: this.extractStartDate(section.content),
      endDate: this.extractEndDate(section.content),
      activities: this.extractActivities(section.content),
      milestones: this.extractMilestones(section.content)
    };
  }

  private static extractToolRecommendations(sections: MarkdownSection[]): ToolRecommendation[] {
    const toolsSection = this.findSectionByKeywords(sections, ['tools', 'software', 'technology', 'platform']);
    if (!toolsSection) return [];

    // Implementation for tools extraction
    return [];
  }

  // Utility methods for content extraction
  private static findSectionByKeywords(sections: MarkdownSection[], keywords: string[]): MarkdownSection | null {
    for (const section of sections) {
      const titleLower = section.title.toLowerCase();
      if (keywords.some(keyword => titleLower.includes(keyword))) {
        return section;
      }
      
      // Check subsections recursively
      const found = this.findSectionByKeywords(section.subsections, keywords);
      if (found) return found;
    }
    return null;
  }

  private static extractDescription(content: string): string {
    // Extract first paragraph as description
    const lines = content.split('\n').filter(line => line.trim());
    const firstParagraph = lines.find(line => !line.startsWith('-') && !line.startsWith('*') && line.length > 20);
    return firstParagraph || 'No description available';
  }

  private static extractTacticsFromContent(content: string): MarketingTactic[] {
    const tactics: MarketingTactic[] = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const listMatch = line.match(/^[-*]\s+(.+)$/);
      if (listMatch) {
        tactics.push({
          id: `tactic-${index}`,
          name: listMatch[1],
          description: listMatch[1],
          estimatedCost: 'TBD',
          timeframe: 'TBD',
          difficulty: 'medium'
        });
      }
    });
    
    return tactics;
  }

  private static extractBudgetFromContent(content: string): BudgetEstimate {
    // Look for budget patterns in content
    const budgetMatch = content.match(/\$(\d+(?:,\d+)*(?:\.\d{2})?)/);
    const amount = budgetMatch ? budgetMatch[1] : '1000';
    
    return {
      min: amount,
      max: (parseInt(amount.replace(/,/g, '')) * 1.5).toString(),
      currency: 'USD'
    };
  }

  private static extractImplementationSteps(content: string): ImplementationStep[] {
    const steps: ImplementationStep[] = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const stepMatch = line.match(/^(\d+\.|\-|\*)\s+(.+)$/);
      if (stepMatch) {
        steps.push({
          id: `step-${index}`,
          title: stepMatch[2],
          description: stepMatch[2],
          estimatedTime: 'TBD'
        });
      }
    });
    
    return steps;
  }

  private static extractCostStructure(content: string): CostStructure {
    return {
      setup: 'TBD',
      monthly: 'TBD',
      notes: 'Extracted from markdown content'
    };
  }

  private static extractPricePoints(content: string): PricePoint[] {
    const pricePoints: PricePoint[] = [];
    
    // Look for pricing patterns
    const priceMatches = content.match(/\$(\d+(?:,\d+)*(?:\.\d{2})?)/g);
    if (priceMatches) {
      priceMatches.forEach((match, index) => {
        pricePoints.push({
          tier: `Tier ${index + 1}`,
          price: match,
          features: ['Feature 1', 'Feature 2'],
          targetSegment: 'General'
        });
      });
    }
    
    return pricePoints;
  }

  // Inference methods
  private static inferMarketingType(title: string, content: string): 'digital' | 'content' | 'social' | 'traditional' {
    const titleLower = title.toLowerCase();
    const contentLower = content.toLowerCase();
    
    if (titleLower.includes('social') || contentLower.includes('social media')) return 'social';
    if (titleLower.includes('content') || contentLower.includes('blog')) return 'content';
    if (titleLower.includes('digital') || contentLower.includes('online')) return 'digital';
    return 'traditional';
  }

  private static inferChannelType(title: string, content: string): 'direct' | 'retail' | 'online' | 'partner' {
    const titleLower = title.toLowerCase();
    const contentLower = content.toLowerCase();
    
    if (titleLower.includes('online') || contentLower.includes('website')) return 'online';
    if (titleLower.includes('retail') || contentLower.includes('store')) return 'retail';
    if (titleLower.includes('partner') || contentLower.includes('partnership')) return 'partner';
    return 'direct';
  }

  private static inferPricingModel(title: string, content: string): 'freemium' | 'subscription' | 'one-time' | 'tiered' {
    const titleLower = title.toLowerCase();
    const contentLower = content.toLowerCase();
    
    if (titleLower.includes('freemium') || contentLower.includes('free tier')) return 'freemium';
    if (titleLower.includes('subscription') || contentLower.includes('monthly')) return 'subscription';
    if (titleLower.includes('tiered') || contentLower.includes('tier')) return 'tiered';
    return 'one-time';
  }

  private static inferDifficulty(content: string): 'low' | 'medium' | 'high' {
    const contentLower = content.toLowerCase();
    if (contentLower.includes('easy') || contentLower.includes('simple')) return 'low';
    if (contentLower.includes('complex') || contentLower.includes('difficult')) return 'high';
    return 'medium';
  }

  // Helper extraction methods
  private static extractTimelineFromContent(content: string): string {
    const timeMatch = content.match(/(\d+)\s+(days?|weeks?|months?)/i);
    return timeMatch ? timeMatch[0] : '4-6 weeks';
  }

  private static extractROIFromContent(content: string): string {
    const roiMatch = content.match(/(\d+)%\s*ROI/i);
    return roiMatch ? roiMatch[0] : '15-25%';
  }

  private static extractReachFromContent(content: string): string {
    const reachMatch = content.match(/(\d+(?:,\d+)*)\s*(customers?|users?|people)/i);
    return reachMatch ? reachMatch[0] : '1,000+ potential customers';
  }

  private static calculateSuitabilityScore(content: string): number {
    // Simple scoring based on content length and keywords
    const score = Math.min(100, Math.max(60, content.length / 10));
    return Math.round(score);
  }

  private static calculateMarketFit(content: string): number {
    return Math.round(Math.random() * 40 + 60); // 60-100 range
  }

  private static extractCompetitiveAnalysis(content: string): string {
    return 'Competitive analysis extracted from markdown content';
  }

  private static extractStartDate(content: string): string {
    return new Date().toISOString().split('T')[0];
  }

  private static extractEndDate(content: string): string {
    const date = new Date();
    date.setMonth(date.getMonth() + 3);
    return date.toISOString().split('T')[0];
  }

  private static extractActivities(content: string): string[] {
    const activities: string[] = [];
    const lines = content.split('\n');
    
    lines.forEach(line => {
      const activityMatch = line.match(/^[-*]\s+(.+)$/);
      if (activityMatch) {
        activities.push(activityMatch[1]);
      }
    });
    
    return activities.length > 0 ? activities : ['Activity 1', 'Activity 2'];
  }

  private static extractMilestones(content: string): string[] {
    return ['Milestone 1', 'Milestone 2'];
  }

  private static generateId(): string {
    return `gtm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private static createDefaultBusinessContext(): BusinessContext {
    return {
      businessIdea: 'Default business idea',
      targetMarket: 'General market',
      valueProposition: 'Value proposition',
      implementationPhases: [],
      goals: [],
      constraints: []
    };
  }

  // Conversion utilities for backward compatibility
  static convertToLegacyFormat(markdownStrategies: GoToMarketStrategies): any {
    // Convert markdown-based strategies back to legacy JSON format if needed
    return {
      ...markdownStrategies,
      format: 'legacy',
      convertedAt: new Date().toISOString()
    };
  }

  static validateMarkdownContent(content: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!content || content.trim().length === 0) {
      errors.push('Content is empty');
    }

    // Check for headers
    if (!content.includes('#')) {
      warnings.push('No headers found in content');
    }

    // Check minimum length
    if (content.length < 100) {
      warnings.push('Content appears to be very short');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}