import { OpenRouterClient } from '@/lib/openrouter/client';
import { ImplementationPlan } from '@/features/implementation-plan/types';
import { GoToMarketStrategies, GenerationOptions } from '../types';
import { PromptBuilder } from './PromptBuilder';
import { StrategyProcessor } from './StrategyProcessor';

export class GoToMarketV2Service {
  private client: OpenRouterClient;
  private model: string;

  constructor(apiKey: string, model: string = 'qwen/qwen3-coder:free') {
    this.client = new OpenRouterClient(apiKey);
    this.model = model;
  }

  async generateStrategies(
    implementationContext: ImplementationPlan,
    options: GenerationOptions = {}
  ): Promise<GoToMarketStrategies> {
    try {
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
    } catch (error) {
      console.error('Error generating strategies:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to generate strategies');
    }
  }

  async generateStreamingStrategies(
    implementationContext: ImplementationPlan,
    onChunk: (chunk: string) => void,
    options: GenerationOptions = {}
  ): Promise<GoToMarketStrategies> {
    try {
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
    } catch (error) {
      console.error('Error generating streaming strategies:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to generate strategies');
    }
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
}