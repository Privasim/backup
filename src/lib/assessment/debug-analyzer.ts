import { getModelById } from '@/lib/openrouter';
import { DebugOpenRouterClient } from '@/lib/openrouter/debug-client';
import { buildJobRiskAssessmentPrompt, validatePromptData } from './prompt-builder';
import { ResultProcessor } from './result-processor';
import { AssessmentRequest, AssessmentResult, AssessmentError, AssessmentProgress, ProcessedResponse } from './types';
import { debugLogger } from '@/lib/debug/logger';

export class DebugJobRiskAnalyzer {
  private client: DebugOpenRouterClient;
  private onProgress?: (progress: AssessmentProgress) => void;

  constructor(apiKey: string, onProgress?: (progress: AssessmentProgress) => void) {
    this.client = new DebugOpenRouterClient(apiKey);
    this.onProgress = onProgress;
    
    debugLogger.info('system', 'DebugJobRiskAnalyzer initialized', {
      hasApiKey: !!apiKey,
      hasProgressCallback: !!onProgress
    });
  }

  async analyzeJobRisk(request: AssessmentRequest): Promise<ProcessedResponse> {
    const analysisId = `analysis-${Date.now()}`;
    debugLogger.startTimer(analysisId);
    debugLogger.info('analysis', 'Starting job risk analysis', {
      jobDescription: request.jobDescription,
      selectedModel: request.selectedModel,
      hasSkills: request.skillSet.length > 0
    });

    try {
      // Validate input data
      this.updateProgress('initializing', 'Validating input data...', 10);
      debugLogger.info('validation', 'Validating prompt data');
      
      const validationErrors = validatePromptData(request);
      if (validationErrors.length > 0) {
        debugLogger.error('validation', 'Validation failed', { errors: validationErrors });
        return {
          success: false,
          error: {
            type: 'validation',
            message: 'Invalid input data',
            details: validationErrors
          }
        };
      }
      debugLogger.success('validation', 'Input data validation passed');

      // Validate API key
      this.updateProgress('initializing', 'Validating API key...', 20);
      debugLogger.info('api', 'Validating API key');
      
      const isValidKey = await this.client.validateApiKey();
      if (!isValidKey) {
        debugLogger.error('api', 'API key validation failed');
        return {
          success: false,
          error: {
            type: 'api',
            message: 'API key validation failed. This could be due to an invalid key or temporary rate limiting on free models. Please check your API key and try again.'
          }
        };
      }
      debugLogger.success('api', 'API key validation passed');

      // Get model information
      debugLogger.info('system', 'Getting model information', { modelId: request.selectedModel });
      const modelInfo = getModelById(request.selectedModel);
      if (!modelInfo) {
        debugLogger.error('validation', 'Invalid model selection', { modelId: request.selectedModel });
        return {
          success: false,
          error: {
            type: 'validation',
            message: 'Invalid model selection'
          }
        };
      }
      debugLogger.info('system', 'Model information retrieved', {
        modelName: modelInfo.name,
        provider: modelInfo.provider,
        supportsWebSearch: modelInfo.supportsWebSearch,
        contextLength: modelInfo.contextLength
      });

      // Build prompts
      this.updateProgress('searching', 'Preparing analysis prompts...', 30);
      debugLogger.info('analysis', 'Building assessment prompts');
      
      const { systemPrompt, userPrompt } = buildJobRiskAssessmentPrompt(request, modelInfo);
      debugLogger.info('analysis', 'Prompts generated', {
        systemPromptLength: systemPrompt.length,
        userPromptLength: userPrompt.length,
        totalTokensEstimate: Math.ceil((systemPrompt.length + userPrompt.length) / 4)
      });

      // Execute analysis with web search
      this.updateProgress('analyzing', 'Searching web for latest job market data...', 50);
      debugLogger.info('api', 'Starting OpenRouter API call', {
        model: request.selectedModel,
        webSearchEnabled: true,
        messagesCount: 2
      });

      const apiCallTimer = 'api-call';
      debugLogger.startTimer(apiCallTimer);

      let response;
      try {
        response = await this.client.chatWithWebSearch([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ], request.selectedModel);

        debugLogger.endTimer(apiCallTimer, 'api', 'OpenRouter API call completed', {
          responseId: response.id,
          model: response.model,
          usage: response.usage,
          finishReason: response.choices[0]?.finish_reason
        });
      } catch (apiError: any) {
        const errorMessage = apiError?.message || '';
        const is429Error = errorMessage.includes('429') || errorMessage.includes('rate-limited');
        
        debugLogger.error('api', 'Main API call failed', {
          error: apiError,
          is429: is429Error,
          model: request.selectedModel
        });

        if (is429Error) {
          return {
            success: false,
            error: {
              type: 'rate_limit',
              message: `The selected model (${modelInfo.name}) is temporarily rate-limited. Please try again in a few minutes or select a different model.`
            }
          };
        }

        throw apiError; // Re-throw non-rate-limit errors
      }

      // Log response details
      const responseContent = response.choices[0]?.message?.content || '';
      debugLogger.info('api', 'API response received', {
        contentLength: responseContent.length,
        hasContent: !!responseContent,
        usage: response.usage,
        finishReason: response.choices[0]?.finish_reason
      });

      // Process response
      this.updateProgress('processing', 'Processing analysis results...', 80);
      debugLogger.info('analysis', 'Processing LLM response');
      
      const processingTimer = 'response-processing';
      debugLogger.startTimer(processingTimer);

      const processedResult = ResultProcessor.processLLMResponse(responseContent);

      debugLogger.endTimer(processingTimer, 'analysis', 'Response processing completed', {
        success: processedResult.success,
        hasData: !!processedResult.data,
        hasError: !!processedResult.error
      });

      if (processedResult.success) {
        this.updateProgress('complete', 'Analysis complete!', 100);
        debugLogger.success('analysis', 'Job risk analysis completed successfully', {
          riskScore: processedResult.data?.riskScore,
          factorsCount: processedResult.data?.riskFactors?.length,
          skillsCount: processedResult.data?.skillsImpact?.length,
          timelineCount: processedResult.data?.timeline?.length
        });
      } else {
        this.updateProgress('error', 'Failed to process results', 100);
        debugLogger.error('analysis', 'Failed to process analysis results', {
          error: processedResult.error
        });
      }

      debugLogger.endTimer(analysisId, 'analysis', 'Complete analysis workflow finished');
      return processedResult;

    } catch (error) {
      this.updateProgress('error', 'Analysis failed', 100);
      debugLogger.error('analysis', 'Analysis workflow failed with exception', {
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error
      });
      
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
    debugLogger.info('progress', `Progress update: ${stage} - ${message}`, {
      stage,
      progress,
      message
    });

    if (this.onProgress) {
      this.onProgress({ stage, message, progress });
    }
  }

  async testConnection(): Promise<boolean> {
    debugLogger.info('api', 'Testing API connection');
    try {
      const result = await this.client.validateApiKey();
      debugLogger.info('api', 'Connection test result', { success: result });
      return result;
    } catch (error) {
      debugLogger.error('api', 'Connection test failed', { error });
      return false;
    }
  }
}

// Utility function to create debug analyzer instance
export const createDebugJobRiskAnalyzer = (
  apiKey: string, 
  onProgress?: (progress: AssessmentProgress) => void
): DebugJobRiskAnalyzer => {
  return new DebugJobRiskAnalyzer(apiKey, onProgress);
};