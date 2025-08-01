import { OpenRouterClient } from '@/lib/openrouter/client';
import { buildJobRiskAssessmentPrompt, validatePromptData } from './prompt-builder';
import { ResultProcessor } from './result-processor';
import { AssessmentRequest, AssessmentResult, AssessmentError, AssessmentProgress, ProcessedResponse } from './types';
import { debugLog } from '@/components/debug/DebugConsole';

export class JobRiskAnalyzer {
  private client: OpenRouterClient;
  private onProgress?: (progress: AssessmentProgress) => void;

  constructor(apiKey: string, onProgress?: (progress: AssessmentProgress) => void) {
    debugLog.info('Analyzer', 'Initializing JobRiskAnalyzer', { 
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
      hasProgressCallback: !!onProgress
    });
    this.client = new OpenRouterClient(apiKey);
    this.onProgress = onProgress;
    debugLog.success('Analyzer', 'JobRiskAnalyzer initialized successfully');
  }

  async analyzeJobRisk(request: AssessmentRequest): Promise<ProcessedResponse> {
    debugLog.info('Analyzer', 'Starting job risk analysis', request);
    
    try {
      // Validate input data
      debugLog.info('Analyzer', 'Validating input data...');
      this.updateProgress('initializing', 'Validating input data...', 10);
      const validationErrors = validatePromptData(request);
      
      if (validationErrors.length > 0) {
        debugLog.error('Analyzer', 'Input validation failed', validationErrors);
        return {
          success: false,
          error: {
            type: 'validation',
            message: 'Invalid input data',
            details: validationErrors
          }
        };
      }
      debugLog.success('Analyzer', 'Input data validation passed');

      // Validate API key
      debugLog.info('Analyzer', 'Validating API key...');
      this.updateProgress('initializing', 'Validating API key...', 20);
      const isValidKey = await this.client.validateApiKey();
      
      if (!isValidKey) {
        debugLog.error('Analyzer', 'API key validation failed');
        return {
          success: false,
          error: {
            type: 'api',
            message: 'Invalid API key or API connection failed'
          }
        };
      }
      debugLog.success('Analyzer', 'API key validation passed');

      // Build prompts
      debugLog.info('Analyzer', 'Building AI prompts...');
      this.updateProgress('analyzing', 'Preparing AI analysis...', 30);
      const { systemPrompt, userPrompt } = buildJobRiskAssessmentPrompt(request);
      
      debugLog.debug('Analyzer', 'Generated prompts', {
        systemPromptLength: systemPrompt.length,
        userPromptLength: userPrompt.length
      });
      debugLog.success('Analyzer', 'AI prompts built successfully');

      // Use streaming for real-time progress updates
      debugLog.info('Analyzer', 'Starting AI analysis with streaming...');
      this.updateProgress('analyzing', 'Analyzing job market risks with AI...', 50);
      
      let fullResponse = '';
      const model = request.model || 'qwen/qwen3-coder:free';
      
      debugLog.info('Analyzer', `Using AI model: ${model}`);
      
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
            debugLog.debug('Analyzer', `Received chunk (${chunk.length} chars), total: ${fullResponse.length}`);
            this.updateProgress('analyzing', 'Processing AI insights...', Math.round(progress));
          }
        }
      );

      debugLog.success('Analyzer', `AI analysis completed, received ${fullResponse.length} characters`);
      debugLog.debug('Analyzer', 'Full AI response', { response: fullResponse });

      // Process response
      debugLog.info('Analyzer', 'Processing AI response...');
      this.updateProgress('processing', 'Finalizing analysis results...', 90);
      const processedResult = ResultProcessor.processLLMResponse(fullResponse);

      debugLog.debug('Analyzer', 'Response processing result', {
        success: processedResult.success,
        hasData: !!processedResult.data,
        hasError: !!processedResult.error
      });

      if (processedResult.success) {
        debugLog.success('Analyzer', 'Analysis completed successfully!', processedResult.data);
        this.updateProgress('complete', 'Analysis complete!', 100);
      } else {
        debugLog.error('Analyzer', 'Failed to process AI response', processedResult.error);
        this.updateProgress('error', 'Failed to process results', 100);
      }

      return processedResult;

    } catch (error) {
      debugLog.error('Analyzer', 'Critical error during analysis', error, error instanceof Error ? error.stack : undefined);
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
    debugLog.info('Progress', `${stage}: ${message} (${progress}%)`);
    if (this.onProgress) {
      this.onProgress({ stage, message, progress });
    }
  }

  async testConnection(): Promise<boolean> {
    debugLog.info('Analyzer', 'Testing API connection...');
    try {
      const result = await this.client.validateApiKey();
      debugLog.success('Analyzer', `Connection test ${result ? 'passed' : 'failed'}`);
      return result;
    } catch (error) {
      debugLog.error('Analyzer', 'Connection test failed', error);
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