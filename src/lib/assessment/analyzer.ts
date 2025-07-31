import { OpenRouterClient } from '@/lib/openrouter/client';
import { buildJobRiskAssessmentPrompt, validatePromptData } from './prompt-builder';
import { ResultProcessor } from './result-processor';
import { AssessmentRequest, AssessmentResult, AssessmentError, AssessmentProgress, ProcessedResponse } from './types';

export class JobRiskAnalyzer {
  private client: OpenRouterClient;
  private onProgress?: (progress: AssessmentProgress) => void;

  constructor(apiKey: string, onProgress?: (progress: AssessmentProgress) => void) {
    this.client = new OpenRouterClient(apiKey);
    this.onProgress = onProgress;
  }

  async analyzeJobRisk(request: AssessmentRequest): Promise<ProcessedResponse> {
    try {
      // Validate input data
      this.updateProgress('initializing', 'Validating input data...', 10);
      const validationErrors = validatePromptData(request);
      if (validationErrors.length > 0) {
        return {
          success: false,
          error: {
            type: 'validation',
            message: 'Invalid input data',
            details: validationErrors
          }
        };
      }

      // Validate API key
      this.updateProgress('initializing', 'Validating API key...', 20);
      const isValidKey = await this.client.validateApiKey();
      if (!isValidKey) {
        return {
          success: false,
          error: {
            type: 'api',
            message: 'Invalid API key or API connection failed'
          }
        };
      }

      // Build prompts
      this.updateProgress('analyzing', 'Preparing AI analysis...', 30);
      const { systemPrompt, userPrompt } = buildJobRiskAssessmentPrompt(request);

      // Use streaming for real-time progress updates
      this.updateProgress('analyzing', 'Analyzing job market risks with AI...', 50);
      
      let fullResponse = '';
      const model = request.model || 'qwen/qwen3-coder:free';
      
      await this.client.chat(
        {
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 2000
        },
        {
          stream: true,
          onChunk: (chunk: string) => {
            fullResponse += chunk;
            const progress = Math.min(50 + (fullResponse.length / 1000) * 30, 80);
            this.updateProgress('analyzing', 'Processing AI insights...', Math.round(progress));
          }
        }
      );

      // Process response
      this.updateProgress('processing', 'Finalizing analysis results...', 90);
      const processedResult = ResultProcessor.processLLMResponse(fullResponse);

      if (processedResult.success) {
        this.updateProgress('complete', 'Analysis complete!', 100);
      } else {
        this.updateProgress('error', 'Failed to process results', 100);
      }

      return processedResult;

    } catch (error) {
      this.updateProgress('error', 'Analysis failed', 100);
      
      return {
        success: false,
        error: {
          type: 'network',
          message: 'Failed to complete analysis',
          details: error
        }
      };
    }
  }

  private updateProgress(stage: AssessmentProgress['stage'], message: string, progress: number) {
    if (this.onProgress) {
      this.onProgress({ stage, message, progress });
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      return await this.client.validateApiKey();
    } catch {
      return false;
    }
  }
}

// Utility function to create analyzer instance
export const createJobRiskAnalyzer = (
  apiKey: string, 
  onProgress?: (progress: AssessmentProgress) => void
): JobRiskAnalyzer => {
  return new JobRiskAnalyzer(apiKey, onProgress);
};