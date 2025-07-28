import { debugLogger } from '@/lib/debug/logger';

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

    return this.chat({
      model,
      messages,
      web_search: true,
      temperature: 0.7,
      max_tokens: 2000
    });
  }

  async validateApiKey(): Promise<boolean> {
    debugLogger.info('api', 'Starting API key validation');
    
    try {
      const response = await this.chat({
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      });
      
      const isValid = !!response.choices?.[0]?.message?.content;
      debugLogger.info('api', 'API key validation completed', {
        isValid,
        responseId: response.id,
        hasContent: !!response.choices?.[0]?.message?.content
      });
      
      return isValid;
    } catch (error) {
      debugLogger.error('api', 'API key validation failed', { error });
      return false;
    }
  }
}