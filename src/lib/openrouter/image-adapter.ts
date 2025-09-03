import { debugLog } from '@/components/debug/DebugConsole';
import { OpenRouterClient } from './client';
import {
  EditImageParams,
  GenerateImageParams,
  ImageResult,
  OpenRouterImageItem,
  OpenRouterRequest,
  OpenRouterResponse
} from './types';

/**
 * Extracts image data URLs from an OpenRouter response
 */
export function extractImagesFromResponse(response: OpenRouterResponse): string[] {
  const images: string[] = [];
  
  // Check for images in the first choice's message
  const message = response?.choices?.[0]?.message;
  if (message?.images?.length) {
    images.push(...message.images.map(img => img.image_url.url).filter(Boolean));
  }
  
  return images;
}

/**
 * Adapter for OpenRouter image generation and editing operations
 */
export class OpenRouterImageAdapter {
  private client: OpenRouterClient;
  
  constructor(apiKey: string) {
    this.client = new OpenRouterClient(apiKey);
    debugLog.info('OpenRouterImageAdapter', 'Initialized with API key', {
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length || 0
    });
  }
  
  /**
   * Generate an image from a text prompt
   */
  async generateImage(params: GenerateImageParams): Promise<ImageResult> {
    const { model, prompt, stream = false, signal, temperature, maxTokens } = params;
    
    debugLog.info('OpenRouterImageAdapter', 'Generating image', {
      model,
      promptLength: prompt.length,
      streaming: stream
    });
    
    const request: OpenRouterRequest = {
      model,
      messages: [
        {
          role: 'user',
          content: [{ type: 'text', text: prompt }]
        }
      ],
      modalities: ['image', 'text'],
      temperature,
      max_tokens: maxTokens
    };
    
    if (stream) {
      const images: string[] = [];
      let lastResponse: OpenRouterResponse | undefined;
      
      await this.client.chat(request, {
        stream: true,
        signal,
        onChunk: (chunk: string, parsedChunk?: any) => {
          // Handle streaming image chunks if available
          if (parsedChunk?.choices?.[0]?.delta?.images) {
            const deltaImages = parsedChunk.choices[0].delta.images;
            for (const img of deltaImages) {
              if (img.image_url?.url) {
                images.push(img.image_url.url);
                debugLog.info('OpenRouterImageAdapter', 'Received streaming image');
              }
            }
          }
          
          // Store the last response for usage information
          if (parsedChunk) {
            lastResponse = parsedChunk;
          }
        }
      });
      
      return {
        images,
        model: lastResponse?.model,
        created: lastResponse?.created,
        usage: lastResponse?.usage
      };
    }
    
    try {
      const response = await this.client.chat(request, { stream: false, signal }) as OpenRouterResponse;
      
      const images = extractImagesFromResponse(response);
      
      debugLog.success('OpenRouterImageAdapter', 'Image generation complete', {
        imageCount: images.length,
        model: response.model
      });
      
      return {
        images,
        model: response.model,
        created: response.created,
        usage: response.usage
      };
    } catch (error) {
      debugLog.error('OpenRouterImageAdapter', 'Image generation failed', error);
      throw error;
    }
  }
  
  /**
   * Edit an image using a text prompt and base image
   */
  async editImage(params: EditImageParams): Promise<ImageResult> {
    const { model, baseImageDataUrl, prompt, stream = false, signal, temperature, maxTokens } = params;
    
    debugLog.info('OpenRouterImageAdapter', 'Editing image', {
      model,
      promptLength: prompt.length,
      hasBaseImage: !!baseImageDataUrl,
      baseImageLength: baseImageDataUrl?.length || 0,
      streaming: stream
    });
    
    const request: OpenRouterRequest = {
      model,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: baseImageDataUrl } }
          ]
        }
      ],
      modalities: ['image', 'text'],
      temperature,
      max_tokens: maxTokens
    };
    
    if (stream) {
      const images: string[] = [];
      let lastResponse: OpenRouterResponse | undefined;
      
      await this.client.chat(request, {
        stream: true,
        signal,
        onChunk: (chunk: string, parsedChunk?: any) => {
          // Handle streaming image chunks if available
          if (parsedChunk?.choices?.[0]?.delta?.images) {
            const deltaImages = parsedChunk.choices[0].delta.images;
            for (const img of deltaImages) {
              if (img.image_url?.url) {
                images.push(img.image_url.url);
                debugLog.info('OpenRouterImageAdapter', 'Received streaming edited image');
              }
            }
          }
          
          // Store the last response for usage information
          if (parsedChunk) {
            lastResponse = parsedChunk;
          }
        }
      });
      
      return {
        images,
        model: lastResponse?.model,
        created: lastResponse?.created,
        usage: lastResponse?.usage
      };
    }
    
    try {
      const response = await this.client.chat(request, { stream: false, signal }) as OpenRouterResponse;
      
      const images = extractImagesFromResponse(response);
      
      debugLog.success('OpenRouterImageAdapter', 'Image editing complete', {
        imageCount: images.length,
        model: response.model
      });
      
      return {
        images,
        model: response.model,
        created: response.created,
        usage: response.usage
      };
    } catch (error) {
      debugLog.error('OpenRouterImageAdapter', 'Image editing failed', error);
      throw error;
    }
  }
  
  /**
   * Validate if the API key can be used for image operations
   */
  async validateApiKeyForImageOperations(): Promise<boolean> {
    debugLog.info('OpenRouterImageAdapter', 'Validating API key for image operations');
    
    try {
      // Use a minimal request to check if the API key works with the image model
      const response = await this.client.chat({
        model: 'google/gemini-2.5-flash-image-preview:free',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5,
        modalities: ['text']
      }, { stream: false }) as OpenRouterResponse;
      
      const isValid = !!response && 'choices' in response && !!response.choices?.[0]?.message;
      
      if (isValid) {
        debugLog.success('OpenRouterImageAdapter', 'API key validation successful for image operations');
      } else {
        debugLog.error('OpenRouterImageAdapter', 'API key validation failed - invalid response format', response);
      }
      
      return isValid;
    } catch (error) {
      debugLog.error('OpenRouterImageAdapter', 'API key validation failed for image operations', error);
      return false;
    }
  }
}
