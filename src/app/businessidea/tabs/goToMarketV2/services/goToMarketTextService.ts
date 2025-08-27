import { OpenRouterClient } from '@/lib/openrouter/client';
import { 
  ImplementationContext, 
  GoToMarketStrategy, 
  StrategySection, 
  GoToMarketSettings,
  DEFAULT_SETTINGS
} from '../types';
import { loadCachedStrategy, saveCachedStrategy, saveError } from '../storage';

export class GoToMarketTextService {
  private client: OpenRouterClient;

  constructor(apiKey: string) {
    console.log('GoToMarketTextService: Initializing with API key', { hasApiKey: !!apiKey });
    this.client = new OpenRouterClient(apiKey);
  }

  /**
   * Generate a go-to-market strategy based on implementation context
   * @param context The implementation context
   * @param model The model to use for generation
   * @param settings The settings for strategy generation
   * @param ideaId Optional idea ID for caching
   * @param abortController Optional abort controller for cancellation
   * @param onProgress Optional progress callback
   * @returns The generated strategy
   */
  async generateStrategy(
    context: ImplementationContext,
    model: string,
    settings: GoToMarketSettings = DEFAULT_SETTINGS,
    ideaId?: string,
    abortController?: AbortController,
    onProgress?: (progress: number) => void
  ): Promise<GoToMarketStrategy> {
    console.log('GoToMarketTextService: generateStrategy called', { 
      ideaId, 
      contextTitle: context.title,
      hasContext: !!context
    });
    
    // Try to load from cache first
    if (ideaId) {
      const cached = loadCachedStrategy(ideaId, context);
      if (cached) {
        console.log('GoToMarketTextService: Using cached strategy', { ideaId, contentLength: cached.length });
        // If we have a progress callback, simulate streaming from cache
        if (onProgress) {
          // Split cached content into chunks for streaming effect
          const chunks = this.splitIntoChunks(cached, 100);
          for (const chunk of chunks) {
            onProgress(chunk.length / cached.length);
            // Small delay to simulate streaming
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        }
        // Parse cached content into GoToMarketStrategy object
      const sections = this.extractSections(cached);
      return {
        content: cached,
        sections,
        generatedAt: new Date().toISOString()
      };
      }
    }
    
    
    try {
      console.log('GoToMarketTextService: Calling OpenRouter API', { 
        ideaId, 
        model: 'openai/gpt-4o-mini',
        hasApiKey: !!this.client
      });
      
      const response = await this.client.chat({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert business strategist specializing in go-to-market strategies.' },
          { role: 'user', content: prompt as string }
        ],
        stream: !!onProgress
      }, {
        onChunk: (chunk) => {
          if (onProgress) {
            onProgress(0.5); // Approximate progress during streaming
          }
        }
      });
      
      if (!response) {
        throw new Error('Failed to generate go-to-market strategy');
      }
      
      const content = response.choices[0].message.content || '';
      console.log('GoToMarketTextService: Received response from OpenRouter API', { 
        ideaId, 
        contentLength: content.length 
      });
      
      // Cache the result if ideaId is provided
      if (ideaId) {
        saveCachedStrategy(ideaId, context, content);
      }
      
      // Convert content to GoToMarketStrategy object
      const sections = this.extractSections(content);
      return {
        content,
        sections,
        generatedAt: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('GoToMarketTextService: Error generating strategy', { 
        ideaId, 
        error: error?.message || 'Unknown error' 
      });
      
      // Save error for debugging if ideaId is provided
      if (ideaId) {
        saveError(ideaId, context, error?.message || 'Unknown error');
      }
      
      throw error;
    }
  }

  /**
   * Split content into chunks for streaming simulation
   * @param content The content to split
   * @param chunkSize The size of each chunk
   * @returns Array of content chunks
   */
  private splitIntoChunks(content: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < content.length; i += chunkSize) {
      chunks.push(content.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Construct a detailed prompt based on implementation context and settings
   * @param context The implementation context
   * @param settings The go-to-market settings
   * @returns A formatted prompt string
   */
  private constructPrompt(context: ImplementationContext, settings: GoToMarketSettings = DEFAULT_SETTINGS): string {
    console.log('GoToMarketTextService: Constructing prompt from context', { 
      contextTitle: context.title,
      phasesCount: context.phases.length,
      tasksCount: context.tasks.length,
      kpisCount: context.kpis?.length || 0
    });
    
    console.log('GoToMarketTextService: Using settings', settings);
    
    const detailLevelInstructions = [
      'Keep the strategy very concise and high-level, focusing only on the most critical elements.',
      'Provide a brief overview with some key details for each section.',
      'Include moderate detail in each section with specific examples where appropriate.',
      'Provide comprehensive details in each section with specific examples and implementation guidance.',
      'Create an extremely detailed strategy with in-depth analysis, specific examples, implementation steps, and contingency plans.'
    ][settings.detailLevel - 1];
    
    const selectedChannels = Object.entries(settings.distributionChannels)
      .filter(([_, isSelected]) => isSelected)
      .map(([channel]) => channel)
      .join(', ');
    
    const distributionChannelsInstruction = selectedChannels.length > 0 ?
      `Focus on the following distribution channels: ${selectedChannels}.` :
      'Consider all relevant distribution channels.';
    
    const pricingModelInstruction = `Emphasize a ${settings.pricingModel} pricing model in your strategy.`;
    
    const salesApproachInstruction = `Design the sales strategy around a ${settings.salesApproach} sales approach.`;
    
    const timelineInstruction = settings.includeTimeline ?
      'Include a detailed timeline with specific milestones and dates.' :
      'Focus on strategy rather than specific timeline details.';
    
    const sections = [
      '1. Executive Summary',
      '2. Target Market Analysis',
      '3. Value Proposition',
      '4. Marketing Strategy',
      '5. Sales Strategy',
      '6. Pricing Strategy',
      '7. Distribution Channels',
      '8. Launch Plan',
    ];
    
    if (settings.includeTimeline) {
      sections.push('9. Timeline and Milestones');
      sections.push('10. Budget and Resources');
      sections.push('11. Success Metrics');
      sections.push('12. Risk Assessment');
    } else {
      sections.push('9. Budget and Resources');
      sections.push('10. Success Metrics');
      sections.push('11. Risk Assessment');
    }
    
    return `
      Generate a comprehensive go-to-market strategy for the following business idea:
      
      Business Title: ${context.title}
      
      Overview:
      ${context.overview}
      
      Implementation Phases:
      ${context.phases.map(phase => `
      - ${phase.name}: ${phase.objectives} (${phase.duration})`).join('')}
      
      Key Tasks:
      ${context.tasks.map(task => `
      - ${task.title}: ${task.description}`).join('')}
      
      KPIs to Track:
      ${context.kpis?.map(kpi => `
      - ${kpi.metric}: ${kpi.target}`).join('') || 'Not specified'}
      
      STRATEGY REQUIREMENTS:
      - ${detailLevelInstructions}
      - ${distributionChannelsInstruction}
      - ${pricingModelInstruction}
      - ${salesApproachInstruction}
      - ${timelineInstruction}
      
      Please provide a detailed go-to-market strategy in markdown format with the following sections:
      
      ${sections.join('\n      ')}
      
      Ensure the strategy is practical, actionable, and aligned with the implementation plan provided.
    `;
  }

  /**
   * Extract sections from markdown content
   * @param content The markdown content
   * @returns Array of section objects
   */
  extractSections(content: string): StrategySection[] {
    if (!content) return [];
    
    const lines = content.split('\n');
    const sections: StrategySection[] = [];
    let currentSection: StrategySection | null = null;
    
    for (const line of lines) {
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      
      if (headerMatch) {
        // Save previous section if exists
        if (currentSection) {
          sections.push(currentSection);
        }
        
        // Start new section
        currentSection = {
          title: headerMatch[2].trim(),
          content: '',
          level: headerMatch[1].length
        };
      } else if (currentSection) {
        // Add content to current section
        currentSection.content += line + '\n';
      }
    }
    
    // Add last section
    if (currentSection) {
      sections.push(currentSection);
    }
    
    // Clean up content whitespace
    return sections.map(section => ({
      ...section,
      content: section.content.trim()
    }));
  }
}
