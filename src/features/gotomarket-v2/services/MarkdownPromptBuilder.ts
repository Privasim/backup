import { ImplementationPlan } from '@/features/implementation-plan/types';
import { BusinessContext, GenerationOptions, ContentLength, CONTENT_LENGTH_CONFIG } from '../types';

export class MarkdownPromptBuilder {
  static buildMarkdownGoToMarketPrompt(
    implementationPlan: ImplementationPlan,
    options: GenerationOptions = {}
  ): string {
    const businessContext = this.extractBusinessContext(implementationPlan);
    const focusAreas = options.focusAreas || ['marketing', 'sales', 'pricing', 'distribution'];
    const contentLength = options.contentLength || 'standard';
    const lengthConfig = CONTENT_LENGTH_CONFIG[contentLength];
    
    const lengthGuidance = this.buildLengthGuidance(contentLength, lengthConfig);
    const sectionStructure = this.buildSectionStructure(focusAreas, lengthConfig);
    
    return `You are a go-to-market strategy expert. Based on the following business implementation plan, create a comprehensive go-to-market strategy in MARKDOWN format.

BUSINESS CONTEXT:
- Business Idea: ${businessContext.businessIdea}
- Target Market: ${businessContext.targetMarket}
- Value Proposition: ${businessContext.valueProposition}
- Goals: ${businessContext.goals.join(', ')}

IMPLEMENTATION PHASES:
${businessContext.implementationPhases.map(phase => 
  `- ${phase.name}: ${phase.objectives.join(', ')}`
).join('\n')}

FOCUS AREAS: ${focusAreas.join(', ')}
BUDGET RANGE: ${options.budgetRange || 'medium'}
TIMEFRAME: ${options.timeframe || 'short-term'}

${lengthGuidance}

${sectionStructure}

FORMATTING REQUIREMENTS:
- Use proper markdown headers (# ## ###)
- Use bullet points and numbered lists where appropriate
- Include tables for pricing and cost structures
- Use **bold** for emphasis on key points
- Use *italics* for secondary information
- Include clear section breaks

CONTENT REQUIREMENTS:
- All strategies must be specific to the business context
- Include actionable next steps for each strategy
- Provide realistic budget estimates based on the specified range
- Align recommendations with the implementation timeline
- Focus on practical, achievable solutions

${options.customPrompt ? `\nADDITIONAL REQUIREMENTS:\n${options.customPrompt}` : ''}

Please respond ONLY with the markdown content, no additional commentary.`;
  }

  static buildBriefMarkdownPrompt(
    implementationPlan: ImplementationPlan,
    options: GenerationOptions = {}
  ): string {
    const briefOptions = { ...options, contentLength: 'brief' as ContentLength };
    return this.buildMarkdownGoToMarketPrompt(implementationPlan, briefOptions);
  }

  static buildStandardMarkdownPrompt(
    implementationPlan: ImplementationPlan,
    options: GenerationOptions = {}
  ): string {
    const standardOptions = { ...options, contentLength: 'standard' as ContentLength };
    return this.buildMarkdownGoToMarketPrompt(implementationPlan, standardOptions);
  }

  static buildDetailedMarkdownPrompt(
    implementationPlan: ImplementationPlan,
    options: GenerationOptions = {}
  ): string {
    const detailedOptions = { ...options, contentLength: 'detailed' as ContentLength };
    return this.buildMarkdownGoToMarketPrompt(implementationPlan, detailedOptions);
  }

  private static buildLengthGuidance(contentLength: ContentLength, lengthConfig: any): string {
    const sentenceRange = lengthConfig.sentenceRange;
    const maxSections = lengthConfig.maxSections;
    
    let guidance = `CONTENT LENGTH: ${contentLength.toUpperCase()}\n`;
    guidance += `- Target ${sentenceRange[0]}-${sentenceRange[1]} sentences per section\n`;
    guidance += `- Maximum ${maxSections} main sections\n`;
    
    switch (contentLength) {
      case 'brief':
        guidance += `- Focus on essential information only\n`;
        guidance += `- Prioritize actionable insights over detailed explanations\n`;
        guidance += `- Use concise bullet points and short paragraphs\n`;
        break;
      case 'standard':
        guidance += `- Include relevant details and context\n`;
        guidance += `- Balance comprehensiveness with readability\n`;
        guidance += `- Provide sufficient detail for implementation\n`;
        break;
      case 'detailed':
        guidance += `- Provide comprehensive analysis and recommendations\n`;
        guidance += `- Include detailed explanations and rationale\n`;
        guidance += `- Cover edge cases and alternative approaches\n`;
        break;
    }
    
    return guidance;
  }

  private static buildSectionStructure(focusAreas: string[], lengthConfig: any): string {
    const maxSections = lengthConfig.maxSections;
    const prioritizedAreas = focusAreas.slice(0, maxSections);
    
    let structure = `REQUIRED SECTION STRUCTURE:\n\n`;
    
    // Always include overview
    structure += `# Go-to-Market Strategy\n\n`;
    structure += `## Executive Summary\n`;
    structure += `Brief overview of the strategy and key recommendations.\n\n`;
    
    // Add focus area sections based on priority and limits
    if (prioritizedAreas.includes('marketing')) {
      structure += `## Marketing Strategy\n`;
      structure += `Digital marketing, content strategy, and customer acquisition approaches.\n\n`;
    }
    
    if (prioritizedAreas.includes('sales')) {
      structure += `## Sales Channels\n`;
      structure += `Sales channel recommendations with implementation steps and cost structures.\n\n`;
    }
    
    if (prioritizedAreas.includes('pricing')) {
      structure += `## Pricing Strategy\n`;
      structure += `Pricing models, tiers, and competitive positioning.\n\n`;
    }
    
    if (prioritizedAreas.includes('distribution')) {
      structure += `## Distribution Plan\n`;
      structure += `Distribution channels and partnership strategies.\n\n`;
    }
    
    // Add implementation section if space allows
    if (prioritizedAreas.length < maxSections) {
      structure += `## Implementation Timeline\n`;
      structure += `Phased approach with milestones and key activities.\n\n`;
    }
    
    return structure;
  }

  private static extractBusinessContext(plan: ImplementationPlan): BusinessContext {
    return {
      businessIdea: plan.meta.title || 'Business Implementation Plan',
      targetMarket: this.extractTargetMarket(plan),
      valueProposition: this.extractValueProposition(plan),
      implementationPhases: plan.phases.map(phase => ({
        id: phase.id,
        name: phase.name,
        objectives: phase.objectives || [],
        duration: phase.duration
      })),
      goals: plan.overview.goals || [],
      constraints: this.extractConstraints(plan)
    };
  }

  private static extractTargetMarket(plan: ImplementationPlan): string {
    // Extract target market from plan content
    const textContent = plan.textContent || '';
    const marketKeywords = ['target market', 'audience', 'customers', 'users'];
    
    for (const keyword of marketKeywords) {
      const regex = new RegExp(`${keyword}[^.]*`, 'i');
      const match = textContent.match(regex);
      if (match) {
        return match[0].substring(0, 200);
      }
    }
    
    return 'General market';
  }

  private static extractValueProposition(plan: ImplementationPlan): string {
    // Extract value proposition from plan content
    const textContent = plan.textContent || '';
    const valueKeywords = ['value proposition', 'unique selling', 'benefits', 'solves'];
    
    for (const keyword of valueKeywords) {
      const regex = new RegExp(`${keyword}[^.]*`, 'i');
      const match = textContent.match(regex);
      if (match) {
        return match[0].substring(0, 200);
      }
    }
    
    return 'Innovative solution';
  }

  private static extractConstraints(plan: ImplementationPlan): string[] {
    // Extract constraints from plan content
    const constraints: string[] = [];
    const textContent = plan.textContent || '';
    
    if (textContent.includes('budget')) constraints.push('Budget limitations');
    if (textContent.includes('time')) constraints.push('Time constraints');
    if (textContent.includes('resource')) constraints.push('Resource limitations');
    
    return constraints;
  }
}