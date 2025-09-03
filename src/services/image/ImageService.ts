import { debugLog } from '@/components/debug/DebugConsole';
import { OpenRouterImageAdapter } from '@/lib/openrouter/image-adapter';
import { EditImageParams, GenerateImageParams, ImageResult } from '@/lib/openrouter/types';

/**
 * Service for handling image generation and editing operations
 * Provides a clean business logic layer between the UI and the OpenRouter API
 */
export class ImageService {
  private adapter: OpenRouterImageAdapter | null = null;
  private apiKey: string = '';
  
  /**
   * Set or update the API key
   */
  setApiKey(apiKey: string): void {
    if (this.apiKey !== apiKey) {
      this.apiKey = apiKey;
      this.adapter = apiKey ? new OpenRouterImageAdapter(apiKey) : null;
      
      debugLog.info('ImageService', 'API key updated', {
        hasApiKey: !!apiKey,
        hasAdapter: !!this.adapter
      });
    }
  }
  
  /**
   * Get the current API key
   */
  getApiKey(): string {
    return this.apiKey;
  }
  
  /**
   * Check if the service has a valid API key
   */
  hasApiKey(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }
  
  /**
   * Validate the current API key for image operations
   */
  async validateApiKey(): Promise<boolean> {
    if (!this.adapter) {
      debugLog.warn('ImageService', 'Cannot validate API key - no adapter available');
      return false;
    }
    
    return await this.adapter.validateApiKeyForImageOperations();
  }
  
  /**
   * Generate an image from a text prompt
   */
  async generateImage(params: Omit<GenerateImageParams, 'apiKey'>): Promise<ImageResult> {
    if (!this.adapter) {
      const error = new Error('No API key provided for image generation');
      debugLog.error('ImageService', error.message);
      throw error;
    }
    
    try {
      debugLog.info('ImageService', 'Generating image', {
        model: params.model,
        promptLength: params.prompt.length
      });
      
      const result = await this.adapter.generateImage({
        ...params,
        apiKey: this.apiKey
      });
      
      debugLog.success('ImageService', 'Image generation successful', {
        imageCount: result.images.length
      });
      
      return result;
    } catch (error) {
      debugLog.error('ImageService', 'Image generation failed', error);
      throw error;
    }
  }
  
  /**
   * Edit an image using a text prompt and base image
   */
  async editImage(params: Omit<EditImageParams, 'apiKey'>): Promise<ImageResult> {
    if (!this.adapter) {
      const error = new Error('No API key provided for image editing');
      debugLog.error('ImageService', error.message);
      throw error;
    }
    
    try {
      debugLog.info('ImageService', 'Editing image', {
        model: params.model,
        promptLength: params.prompt.length,
        hasBaseImage: !!params.baseImageDataUrl
      });
      
      const result = await this.adapter.editImage({
        ...params,
        apiKey: this.apiKey
      });
      
      debugLog.success('ImageService', 'Image editing successful', {
        imageCount: result.images.length
      });
      
      return result;
    } catch (error) {
      debugLog.error('ImageService', 'Image editing failed', error);
      throw error;
    }
  }
  
  /**
   * Get available image models
   */
  getAvailableImageModels(): string[] {
    return [
      'google/gemini-2.5-flash-image-preview:free',
      'anthropic/claude-3-opus:vision',
      'anthropic/claude-3-sonnet:vision',
      'openai/gpt-4o:vision'
    ];
  }
  
  /**
   * Get the default image model
   */
  getDefaultImageModel(): string {
    return 'google/gemini-2.5-flash-image-preview:free';
  }
}
