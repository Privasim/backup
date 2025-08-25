import { OpenRouterClient } from '@/lib/openrouter/client';
import { ImplementationContext, StrategySection } from '../types';
import { loadCachedStrategy, saveCachedStrategy, saveError } from '../storage';

export class GoToMarketTextService {
  private client: OpenRouterClient;

  constructor(apiKey: string) {
    console.log('GoToMarketTextService: Initializing with API key', { hasApiKey: !!apiKey });
    this.client = new OpenRouterClient(apiKey);
  }

  /**
   * Generate a go-to-market strategy based on implementation context
   * @param context The implementation context extracted from the plan
   * @param onChunk Optional callback for streaming chunks
   * @param ideaId Optional idea ID for caching
   * @returns The complete strategy content
   */
  async generateStrategy(
    context: ImplementationContext, 
    onChunk?: (chunk: string) => void,
    ideaId?: string
  ): Promise<string> {
    console.log('GoToMarketTextService: generateStrategy called', { 
      ideaId, 
      contextTitle: context.title,
      hasOnChunk: !!onChunk,
      hasContext: !!context
    });
    
    // Try to load from cache first
    if (ideaId) {
      const cached = loadCachedStrategy(ideaId, context);
      if (cached) {
        console.log('GoToMarketTextService: Using cached strategy', { ideaId, contentLength: cached.length });
        // If we have a chunk callback, simulate streaming from cache
        if (onChunk) {
          // Split cached content into chunks for streaming effect
          const chunks = this.splitIntoChunks(cached, 100);
          for (const chunk of chunks) {
            onChunk(chunk);
            // Small delay to simulate streaming
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        }
        return cached;
      }
    }
    
    const prompt = this.constructPrompt(context);
    console.log('GoToMarketTextService: Constructed prompt', { 
      ideaId, 
      promptLength: prompt.length,
      contextTitle: context.title 
    });
    
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
          { role: 'user', content: prompt }
        ],
        stream: !!onChunk
      }, {
        onChunk: onChunk
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
      
      return content;
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
   * Construct a detailed prompt based on implementation context
   * @param context The implementation context
   * @returns A formatted prompt string
   */
  private constructPrompt(context: ImplementationContext): string {
    console.log('GoToMarketTextService: Constructing prompt from context', { 
      contextTitle: context.title,
      phasesCount: context.phases.length,
      tasksCount: context.tasks.length,
      kpisCount: context.kpis?.length || 0
    });
    
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
      
      Please provide a detailed go-to-market strategy in markdown format with the following sections:
      
      1. Executive Summary
      2. Target Market Analysis
      3. Value Proposition
      4. Competitive Analysis
      5. Marketing Strategy
      6. Sales Strategy
      7. Pricing Strategy
      8. Distribution Channels
      9. Launch Timeline
      10. Budget and Resources
      11. Success Metrics
      12. Risk Assessment
      
      Ensure each section is detailed and actionable. Use markdown formatting for headers, lists, and emphasis.
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
