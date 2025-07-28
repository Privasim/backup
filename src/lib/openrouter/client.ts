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

export class OpenRouterClient {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async chat(request: OpenRouterRequest): Promise<OpenRouterResponse> {
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

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async chatWithWebSearch(
    messages: OpenRouterMessage[],
    model: string = 'perplexity/llama-3.1-sonar-small-128k-online'
  ): Promise<OpenRouterResponse> {
    return this.chat({
      model,
      messages,
      web_search: true,
      temperature: 0.7,
      max_tokens: 2000
    });
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const response = await this.chat({
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      });
      return !!response.choices?.[0]?.message?.content;
    } catch (error) {
      console.error('API key validation failed:', error);
      return false;
    }
  }
}

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  supportsWebSearch: boolean; // All models support web search
  isFree: boolean; // Whether the base model is free
  contextLength: number;
  provider: string;
}

const AVAILABLE_MODELS: ModelInfo[] = [
  // Perplexity Models (Optimized for Web Search)
  {
    id: 'perplexity/llama-3.1-sonar-small-128k-online',
    name: 'Perplexity Llama 3.1 Sonar Small',
    description: 'Optimized for web search with Llama 3.1 (8B params)',
    supportsWebSearch: true,
    isFree: false,
    contextLength: 128000,
    provider: 'Perplexity'
  },
  {
    id: 'perplexity/llama-3.1-sonar-large-128k-online',
    name: 'Perplexity Llama 3.1 Sonar Large',
    description: 'Advanced web search with Llama 3.1 (70B params)',
    supportsWebSearch: true,
    isFree: false,
    contextLength: 128000,
    provider: 'Perplexity'
  },
  
  // Free Models (All support web search with additional cost)
  {
    id: 'meta-llama/llama-3.2-3b-instruct:free',
    name: 'Llama 3.2 3B Instruct',
    description: 'Meta\'s efficient instruction-following model',
    supportsWebSearch: true,
    isFree: true,
    contextLength: 131072,
    provider: 'Meta'
  },
  {
    id: 'google/gemma-2-9b-it:free',
    name: 'Gemma 2 9B IT',
    description: 'Google\'s instruction-tuned model',
    supportsWebSearch: true,
    isFree: true,
    contextLength: 8192,
    provider: 'Google'
  },
  {
    id: 'microsoft/phi-3-mini-128k-instruct:free',
    name: 'Phi-3 Mini 128K',
    description: 'Microsoft\'s compact high-performance model',
    supportsWebSearch: true,
    isFree: true,
    contextLength: 128000,
    provider: 'Microsoft'
  },
  {
    id: 'qwen/qwen-2.5-coder-32b-instruct:free',
    name: 'Qwen 2.5 Coder 32B',
    description: 'Alibaba\'s coding-specialized model',
    supportsWebSearch: true,
    isFree: true,
    contextLength: 32768,
    provider: 'Alibaba'
  },
  {
    id: 'huggingface/zephyr-7b-beta:free',
    name: 'Zephyr 7B Beta',
    description: 'HuggingFace\'s fine-tuned Mistral model',
    supportsWebSearch: true,
    isFree: true,
    contextLength: 32768,
    provider: 'HuggingFace'
  },
  {
    id: 'openchat/openchat-7b:free',
    name: 'OpenChat 7B',
    description: 'Open-source conversational AI model',
    supportsWebSearch: true,
    isFree: true,
    contextLength: 8192,
    provider: 'OpenChat'
  }
];

export function getAvailableModels(): ModelInfo[] {
  return AVAILABLE_MODELS;
}

export function getWebSearchEnabledModels(): ModelInfo[] {
  return getAvailableModels().filter(model => model.supportsWebSearch);
}

export function getFreeModels(): ModelInfo[] {
  return getAvailableModels().filter(model => model.isFree);
}

export function getModelById(id: string): ModelInfo | undefined {
  return getAvailableModels().find(model => model.id === id);
}