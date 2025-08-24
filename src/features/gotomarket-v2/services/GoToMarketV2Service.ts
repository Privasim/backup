import { OpenRouterClient } from '@/lib/openrouter/client';
import { ImplementationPlan } from '@/features/implementation-plan/types';
import { GoToMarketStrategies, GenerationOptions } from '../types';
import { PromptBuilder } from './PromptBuilder';
import { StrategyProcessor } from './StrategyProcessor';
import { MarkdownPromptBuilder } from './MarkdownPromptBuilder';
import { MarkdownStrategyProcessor } from './MarkdownStrategyProcessor';

export class GoToMarketV2Service {
  private client: OpenRouterClient;
  private model: string;
  private useMarkdownFormat: boolean;

  constructor(apiKey: string, model: string = 'qwen/qwen3-coder:free', useMarkdownFormat: boolean = true) {
    this.client = new OpenRouterClient(apiKey);
    this.model = model;
    this.useMarkdownFormat = useMarkdownFormat;
  }

  async generateStrategies(
    implementationContext: ImplementationPlan,
    options: GenerationOptions = {}
  ): Promise<GoToMarketStrategies> {
    try {
      if (this.useMarkdownFormat) {
        return this.generateMarkdownStrategies(implementationContext, options);
      } else {
        return this.generateLegacyStrategies(implementationContext, options);
      }
    } catch (error) {
      console.error('Error generating strategies:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to generate strategies');
    }
  }

  private async generateMarkdownStrategies(
    implementationContext: ImplementationPlan,
    options: GenerationOptions = {}
  ): Promise<GoToMarketStrategies> {
    const prompt = MarkdownPromptBuilder.buildMarkdownGoToMarketPrompt(implementationContext, options);
    
    const response = await this.client.chat({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are a go-to-market strategy expert. Provide detailed, actionable strategies in well-structured Markdown format. Focus on clarity, actionability, and proper formatting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    if (!response || !('choices' in response) || !response.choices[0]?.message?.content) {
      throw new Error('Invalid response from AI service');
    }

    const rawMarkdown = response.choices[0].message.content;
    
    // Validate markdown content
    const validation = MarkdownStrategyProcessor.validateMarkdownContent(rawMarkdown);
    if (!validation.isValid) {
      throw new Error(`Invalid markdown content: ${validation.errors.join(', ')}`);
    }

    const businessContext = this.extractBusinessContext(implementationContext);
    const strategies = MarkdownStrategyProcessor.processMarkdownResponse(rawMarkdown, businessContext);
    
    return strategies;
  }

  private async generateLegacyStrategies(
    implementationContext: ImplementationPlan,
    options: GenerationOptions = {}
  ): Promise<GoToMarketStrategies> {
    const prompt = PromptBuilder.buildGoToMarketPrompt(implementationContext, options);
    
    const response = await this.client.chat({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are a go-to-market strategy expert. Provide detailed, actionable strategies in valid JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    if (!response || !('choices' in response) || !response.choices[0]?.message?.content) {
      throw new Error('Invalid response from AI service');
    }

    const rawContent = response.choices[0].message.content;
    const strategies = StrategyProcessor.processAIResponse(rawContent);
    
    // Validate the processed strategies
    const validation = StrategyProcessor.validateStrategies(strategies);
    if (!validation.isValid) {
      throw new Error(`Invalid strategies generated: ${validation.errors.join(', ')}`);
    }

    return strategies;
  }

  async generateStreamingStrategies(
    implementationContext: ImplementationPlan,
    onChunk: (chunk: string) => void,
    options: GenerationOptions = {}
  ): Promise<GoToMarketStrategies> {
    try {
      if (this.useMarkdownFormat) {
        return this.generateStreamingMarkdownStrategies(implementationContext, onChunk, options);
      } else {
        return this.generateStreamingLegacyStrategies(implementationContext, onChunk, options);
      }
    } catch (error) {
      console.error('Error generating streaming strategies:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to generate strategies');
    }
  }

  private async generateStreamingMarkdownStrategies(
    implementationContext: ImplementationPlan,
    onChunk: (chunk: string) => void,
    options: GenerationOptions = {}
  ): Promise<GoToMarketStrategies> {
    const prompt = MarkdownPromptBuilder.buildMarkdownGoToMarketPrompt(implementationContext, options);
    let fullResponse = '';
    let processedChunks = '';

    await this.client.chat({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are a go-to-market strategy expert. Provide detailed, actionable strategies in well-structured Markdown format. Focus on clarity, actionability, and proper formatting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      stream: true
    }, {
      stream: true,
      onChunk: (chunk: string) => {
        fullResponse += chunk;
        processedChunks += chunk;
        
        // Process markdown progressively for better UX
        const processedChunk = this.processMarkdownChunk(processedChunks, chunk);
        onChunk(processedChunk);
      }
    });

    if (!fullResponse.trim()) {
      throw new Error('No response received from AI service');
    }

    // Validate markdown content
    const validation = MarkdownStrategyProcessor.validateMarkdownContent(fullResponse);
    if (!validation.isValid) {
      console.warn('Markdown validation warnings:', validation.warnings);
    }

    const businessContext = this.extractBusinessContext(implementationContext);
    const strategies = MarkdownStrategyProcessor.processMarkdownResponse(fullResponse, businessContext);
    
    return strategies;
  }

  private async generateStreamingLegacyStrategies(
    implementationContext: ImplementationPlan,
    onChunk: (chunk: string) => void,
    options: GenerationOptions = {}
  ): Promise<GoToMarketStrategies> {
    const prompt = PromptBuilder.buildGoToMarketPrompt(implementationContext, options);
    let fullResponse = '';

    await this.client.chat({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are a go-to-market strategy expert. Provide detailed, actionable strategies in valid JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      stream: true
    }, {
      stream: true,
      onChunk: (chunk: string) => {
        fullResponse += chunk;
        onChunk(chunk);
      }
    });

    if (!fullResponse.trim()) {
      throw new Error('No response received from AI service');
    }

    const strategies = StrategyProcessor.processAIResponse(fullResponse);
    
    // Validate the processed strategies
    const validation = StrategyProcessor.validateStrategies(strategies);
    if (!validation.isValid) {
      throw new Error(`Invalid strategies generated: ${validation.errors.join(', ')}`);
    }

    return strategies;
  }

  private processMarkdownChunk(fullContent: string, newChunk: string): string {
    // Process markdown chunk for progressive display
    // This could include syntax highlighting, section detection, etc.
    return newChunk;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.chat({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: 'Hello, can you help with go-to-market strategies?'
          }
        ],
        max_tokens: 50
      });

      return !!(response && 'choices' in response && response.choices[0]?.message?.content);
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  updateModel(model: string): void {
    this.model = model;
  }

  updateApiKey(apiKey: string): void {
    this.client = new OpenRouterClient(apiKey);
  }

  setMarkdownFormat(useMarkdown: boolean): void {
    this.useMarkdownFormat = useMarkdown;
  }

  isUsingMarkdownFormat(): boolean {
    return this.useMarkdownFormat;
  }

  private extractBusinessContext(plan: ImplementationPlan): any {
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

  private extractTargetMarket(plan: ImplementationPlan): string {
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

  private extractValueProposition(plan: ImplementationPlan): string {
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

  private extractConstraints(plan: ImplementationPlan): string[] {
    const constraints: string[] = [];
    const textContent = plan.textContent || '';
    
    if (textContent.includes('budget')) constraints.push('Budget limitations');
    if (textContent.includes('time')) constraints.push('Time constraints');
    if (textContent.includes('resource')) constraints.push('Resource limitations');
    
    return constraints;
  }

  // Error handling for malformed markdown content
  async handleMarkdownError(error: Error, fallbackToLegacy: boolean = true): Promise<GoToMarketStrategies | null> {
    console.error('Markdown processing error:', error);
    
    if (fallbackToLegacy && this.useMarkdownFormat) {
      console.log('Falling back to legacy JSON format');
      this.useMarkdownFormat = false;
      return null; // Caller should retry with legacy format
    }
    
    throw error;
  }

  // Graceful degradation for partial markdown content
  processPartialMarkdown(partialContent: string): Partial<GoToMarketStrategies> | null {
    try {
      if (partialContent.length < 100) {
        return null; // Too little content to process
      }

      // Try to extract what we can from partial content
      const validation = MarkdownStrategyProcessor.validateMarkdownContent(partialContent);
      if (validation.isValid) {
        return MarkdownStrategyProcessor.processMarkdownResponse(partialContent);
      }
      
      return null;
    } catch (error) {
      console.warn('Could not process partial markdown:', error);
      return null;
    }
  }
}