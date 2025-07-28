import { debugLogger } from '@/lib/debug/logger';
import { analyzeApiError, shouldRetry, getRetryDelay } from './error-handler';
import { SearchTracker } from './search-tracker';
import { getDomain } from './utils';

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  web_search?: boolean;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

interface WebSearchMetadata {
  status: 'queued' | 'active' | 'processing' | 'completed' | 'failed';
  visitedSources: {
    url: string;
    domain: string;
    title?: string;
    snippet?: string;
  }[];
  stats: {
    totalVisited: number;
    uniqueDomains: number;
    startedAt: Date;
    completedAt?: Date;
    durationMs?: number;
  };
}

interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  searchMetadata?: WebSearchMetadata;
}

export class DebugOpenRouterClient {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    debugLogger.info('api', 'DebugOpenRouterClient initialized', {
      baseUrl: this.baseUrl,
      hasApiKey: !!apiKey
    });
  }

  async chat(request: OpenRouterRequest): Promise<OpenRouterResponse> {
    const requestId = `request-${Date.now()}`;
    debugLogger.startTimer(requestId);
    
    debugLogger.info('api', 'Starting OpenRouter chat request', {
      model: request.model,
      messagesCount: request.messages.length,
      webSearch: request.web_search,
      temperature: request.temperature,
      maxTokens: request.max_tokens
    });

    // Log request details (sanitized)
    debugLogger.info('api', 'Request details', {
      url: `${this.baseUrl}/chat/completions`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'AI Career Risk Assessment',
        'Authorization': '***HIDDEN***'
      },
      body: {
        ...request,
        messages: request.messages.map(msg => ({
          role: msg.role,
          contentLength: msg.content.length,
          contentPreview: msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : '')
        }))
      }
    });

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'AI Career Risk Assessment'
        },
        body: JSON.stringify(request)
      });

      debugLogger.info('api', 'Received HTTP response', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        debugLogger.error('api', 'OpenRouter API error response', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText
        });
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const responseData: OpenRouterResponse = await response.json();
      
      debugLogger.endTimer(requestId, 'api', 'OpenRouter chat request completed successfully', {
        responseId: responseData.id,
        model: responseData.model,
        usage: responseData.usage,
        choicesCount: responseData.choices.length,
        finishReason: responseData.choices[0]?.finish_reason,
        contentLength: responseData.choices[0]?.message?.content?.length || 0
      });

      return responseData;

    } catch (error) {
      debugLogger.error('api', 'OpenRouter chat request failed', {
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error
      });
      throw error;
    }
  }

  async chatWithWebSearch(
    messages: OpenRouterMessage[],
    model: string = 'perplexity/llama-3.1-sonar-small-128k-online'
  ): Promise<OpenRouterResponse> {
    debugLogger.info('api', 'Starting web search enabled chat', {
      model,
      messagesCount: messages.length
    });

    // Create a search tracker for this request
    const searchId = `search-${Date.now()}`;
    const searchTracker = new SearchTracker(searchId);
    
    // Start tracking
    searchTracker.start();
    
    debugLogger.info('api', 'Web search tracking started', {
      searchId
    });

    // Make the API call
    const response = await this.chat({
      model,
      messages,
      web_search: true,
      temperature: 0.7,
      max_tokens: 2000
    });
    
    // In a real implementation, we would extract search metadata from the response
    // For now, we'll simulate some metadata
    // TODO: Extract actual search metadata from OpenRouter API response
    
    // Complete tracking
    searchTracker.complete();
    
    const metadata = searchTracker.getSearchMetadata();
    debugLogger.info('api', 'Web search completed', {
      sourceCount: metadata.stats.totalVisited,
      uniqueDomains: metadata.stats.uniqueDomains,
      status: metadata.status,
      sources: metadata.visitedSources.map(source => ({
        url: source.url,
        domain: source.domain
      }))
    });
    
    // Attach search metadata to response
    return {
      ...response,
      searchMetadata: metadata
    };
  }

  async validateApiKey(): Promise<boolean> {
    debugLogger.info('api', 'Starting API key validation');
    
    // List of models to try for validation (in order of preference)
    const validationModels = [
      'microsoft/phi-3-mini-128k-instruct:free',
      'google/gemma-2-9b-it:free', 
      'qwen/qwen-2.5-coder-32b-instruct:free',
      'huggingface/zephyr-7b-beta:free',
      'openchat/openchat-7b:free',
      'meta-llama/llama-3.2-3b-instruct:free'
    ];
    
    for (const model of validationModels) {
      try {
        debugLogger.info('api', `Trying API key validation with model: ${model}`);
        
        const response = await this.chat({
          model,
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 5
        });
        
        const isValid = !!response.choices?.[0]?.message?.content;
        if (isValid) {
          debugLogger.success('api', 'API key validation successful', {
            model,
            responseId: response.id,
            hasContent: true
          });
          return true;
        }
        
      } catch (error: any) {
        const errorMessage = error?.message || '';
        const is429Error = errorMessage.includes('429') || errorMessage.includes('rate-limited');
        const is401Error = errorMessage.includes('401') || errorMessage.includes('Unauthorized');
        
        debugLogger.warn('api', `Validation failed for model ${model}`, {
          model,
          error: errorMessage,
          is429: is429Error,
          is401: is401Error
        });
        
        // If it's a 401 error, the API key is definitely invalid
        if (is401Error) {
          debugLogger.error('api', 'API key is invalid (401 Unauthorized)');
          return false;
        }
        
        // If it's a 429 error, try next model
        if (is429Error) {
          debugLogger.info('api', `Model ${model} is rate-limited, trying next model`);
          continue;
        }
        
        // For other errors, try next model
        debugLogger.info('api', `Model ${model} failed with other error, trying next model`);
        continue;
      }
    }
    
    // If all models failed, check if we can make a simple request to validate the key format
    try {
      debugLogger.info('api', 'All models failed, attempting basic API key format validation');
      
      // Try a simple request that should fail gracefully if the key is valid but models are unavailable
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'AI Career Risk Assessment'
        }
      });
      
      debugLogger.info('api', 'Models endpoint response', {
        status: response.status,
        ok: response.ok
      });
      
      // If we get a 401, the key is invalid
      if (response.status === 401) {
        debugLogger.error('api', 'API key is invalid (401 from models endpoint)');
        return false;
      }
      
      // If we get 200 or other non-401 status, the key is likely valid
      if (response.status !== 401) {
        debugLogger.success('api', 'API key appears valid based on models endpoint response');
        return true;
      }
      
    } catch (error) {
      debugLogger.warn('api', 'Models endpoint validation failed', { error });
    }
    
    // As a last resort, assume the key might be valid but all models are temporarily unavailable
    debugLogger.warn('api', 'Could not definitively validate API key - all models may be temporarily unavailable');
    debugLogger.info('api', 'Proceeding with analysis - if key is invalid, the main request will fail with clearer error');
    
    return true; // Allow the main analysis to proceed and fail with a clearer error if needed
  }
}