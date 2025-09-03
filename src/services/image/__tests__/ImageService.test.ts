import { ImageService } from '../ImageService';
import { OpenRouterImageAdapter } from '@/lib/openrouter/image-adapter';

// Mock the OpenRouterImageAdapter
jest.mock('@/lib/openrouter/image-adapter', () => {
  return {
    OpenRouterImageAdapter: jest.fn().mockImplementation(() => ({
      generateImage: jest.fn().mockResolvedValue({
        images: ['data:image/png;base64,mockImageData'],
        model: 'google/gemini-2.5-flash-image-preview:free',
        created: 1234567890,
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30
        }
      }),
      editImage: jest.fn().mockResolvedValue({
        images: ['data:image/png;base64,mockEditedImageData'],
        model: 'google/gemini-2.5-flash-image-preview:free',
        created: 1234567890,
        usage: {
          prompt_tokens: 15,
          completion_tokens: 25,
          total_tokens: 40
        }
      }),
      validateApiKeyForImageOperations: jest.fn().mockResolvedValue(true)
    }))
  };
});

// Mock the debugLog
jest.mock('@/components/debug/DebugConsole', () => ({
  debugLog: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
    debug: jest.fn()
  }
}));

describe('ImageService', () => {
  let service: ImageService;
  const mockApiKey = 'sk-or-mock-api-key';
  const mockModel = 'google/gemini-2.5-flash-image-preview:free';
  
  beforeEach(() => {
    jest.clearAllMocks();
    service = new ImageService();
  });
  
  describe('API key management', () => {
    it('should store and retrieve API key', () => {
      expect(service.hasApiKey()).toBe(false);
      
      service.setApiKey(mockApiKey);
      
      expect(service.hasApiKey()).toBe(true);
      expect(service.getApiKey()).toBe(mockApiKey);
    });
    
    it('should validate API key', async () => {
      service.setApiKey(mockApiKey);
      
      const isValid = await service.validateApiKey();
      
      expect(isValid).toBe(true);
      expect(OpenRouterImageAdapter).toHaveBeenCalledWith(mockApiKey);
    });
    
    it('should not validate when API key is not set', async () => {
      const isValid = await service.validateApiKey();
      
      expect(isValid).toBe(false);
    });
  });
  
  describe('Image generation', () => {
    beforeEach(() => {
      service.setApiKey(mockApiKey);
    });
    
    it('should generate an image successfully', async () => {
      const result = await service.generateImage({
        model: mockModel,
        prompt: 'A beautiful sunset'
      });
      
      expect(result.images).toHaveLength(1);
      expect(result.images[0]).toBe('data:image/png;base64,mockImageData');
      expect(result.model).toBe(mockModel);
      expect(result.usage).toEqual({
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30
      });
    });
    
    it('should throw an error when API key is not set', async () => {
      service.setApiKey('');
      
      await expect(service.generateImage({
        model: mockModel,
        prompt: 'A beautiful sunset'
      })).rejects.toThrow('No API key provided for image generation');
    });
  });
  
  describe('Image editing', () => {
    beforeEach(() => {
      service.setApiKey(mockApiKey);
    });
    
    it('should edit an image successfully', async () => {
      const result = await service.editImage({
        model: mockModel,
        baseImageDataUrl: 'data:image/png;base64,originalImageData',
        prompt: 'Add a rainbow'
      });
      
      expect(result.images).toHaveLength(1);
      expect(result.images[0]).toBe('data:image/png;base64,mockEditedImageData');
      expect(result.model).toBe(mockModel);
      expect(result.usage).toEqual({
        prompt_tokens: 15,
        completion_tokens: 25,
        total_tokens: 40
      });
    });
    
    it('should throw an error when API key is not set', async () => {
      service.setApiKey('');
      
      await expect(service.editImage({
        model: mockModel,
        baseImageDataUrl: 'data:image/png;base64,originalImageData',
        prompt: 'Add a rainbow'
      })).rejects.toThrow('No API key provided for image editing');
    });
  });
  
  describe('Model management', () => {
    it('should return available image models', () => {
      const models = service.getAvailableImageModels();
      
      expect(models).toContain('google/gemini-2.5-flash-image-preview:free');
      expect(models.length).toBeGreaterThan(0);
    });
    
    it('should return the default image model', () => {
      const defaultModel = service.getDefaultImageModel();
      
      expect(defaultModel).toBe('google/gemini-2.5-flash-image-preview:free');
    });
  });
});
