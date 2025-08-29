import { debugLog } from '@/components/debug/DebugConsole';

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
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

export class OpenRouterClient {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor(apiKey: string) {
    debugLog.info('OpenRouter', 'Initializing OpenRouter client', {
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
      baseUrl: this.baseUrl
    });
    this.apiKey = apiKey;
  }

  async chat(
    request: OpenRouterRequest,
    options?: { stream?: boolean; onChunk?: (chunk: string) => void; signal?: AbortSignal }
  ): Promise<OpenRouterResponse | void> {
    const isStreaming = options?.stream === true;
    
    debugLog.info('OpenRouter', 'Starting chat request', {
      model: request.model,
      messageCount: request.messages.length,
      streaming: isStreaming,
      temperature: request.temperature,
      maxTokens: request.max_tokens
    });

    const body = {
      ...request,
      stream: isStreaming
    };

    debugLog.debug('OpenRouter', 'Request body prepared', body);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'AI Career Risk Assessment'
        },
        body: JSON.stringify(body),
        signal: options?.signal
      });

      debugLog.info('OpenRouter', `API response received`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const error = await response.text();
        debugLog.error('OpenRouter', 'API request failed', {
          status: response.status,
          statusText: response.statusText,
          error
        });
        throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
      }

      if (isStreaming && options?.onChunk) {
        debugLog.info('OpenRouter', 'Starting streaming response processing...');
        const reader = response.body?.getReader();
        if (!reader) {
          debugLog.error('OpenRouter', 'Streaming not supported by response');
          throw new Error('Streaming not supported');
        }

        const decoder = new TextDecoder();
        let buffer = '';
        let totalChunks = 0;
        let totalContent = '';

        try {
          while (true) {
            if (options?.signal?.aborted) {
              debugLog.warn('OpenRouter', 'Abort signal received during streaming; stopping read loop');
              break;
            }
            const { done, value } = await reader.read();
            if (done) {
              debugLog.success('OpenRouter', `Streaming completed. Processed ${totalChunks} chunks, ${totalContent.length} characters total`);
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  debugLog.info('OpenRouter', 'Received [DONE] signal');
                  continue;
                }
                
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    totalChunks++;
                    totalContent += content;
                    debugLog.debug('OpenRouter', `Chunk ${totalChunks}: ${content.length} chars`);
                    options.onChunk(content);
                  }
                } catch (e) {
                  debugLog.warn('OpenRouter', 'Error parsing streaming chunk', { error: e, data });
                  console.error('Error parsing streaming response:', e);
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      } else {
        debugLog.info('OpenRouter', 'Processing non-streaming response...');
        const result = await response.json();
        debugLog.success('OpenRouter', 'Non-streaming response processed', {
          hasChoices: !!result.choices,
          choiceCount: result.choices?.length || 0,
          usage: result.usage
        });
        return result;
      }
    } catch (error) {
      debugLog.error('OpenRouter', 'Chat request failed', error, error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async validateApiKey(): Promise<boolean> {
    debugLog.info('OpenRouter', 'Validating API key...');
    try {
      const response = await this.chat({
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      }, { stream: false });
      
      const isValid = !!response && 'choices' in response && !!response.choices?.[0]?.message?.content;
      
      if (isValid) {
        debugLog.success('OpenRouter', 'API key validation successful');
      } else {
        debugLog.error('OpenRouter', 'API key validation failed - invalid response format', response);
      }
      
      return isValid;
    } catch (error) {
      debugLog.error('OpenRouter', 'API key validation failed', error, error instanceof Error ? error.stack : undefined);
      console.error('API key validation failed:', error);
      return false;
    }
  }
}

export const getAvailableModels = () => [
  'qwen/qwen3-coder:free',
  'z-ai/glm-4.5-air:free',
  'moonshotai/kimi-k2:free',
  'deepseek/deepseek-chat-v3.1:free',
  'openai/gpt-oss-120b:free',
  'mistralai/mistral-small-3.2-24b-instruct:free'
];