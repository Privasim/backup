import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { ImageControllerProvider } from '../ImageControllerProvider';
import { useImageController } from '../useImageController';
import { ImageService } from '@/services/image/ImageService';

// Mock the ImageService
jest.mock('@/services/image/ImageService', () => {
  return {
    ImageService: jest.fn().mockImplementation(() => ({
      setApiKey: jest.fn(),
      getApiKey: jest.fn().mockReturnValue('mock-api-key'),
      hasApiKey: jest.fn().mockReturnValue(true),
      validateApiKey: jest.fn().mockResolvedValue(true),
      generateImage: jest.fn().mockResolvedValue({
        images: ['data:image/png;base64,mockImageData'],
        model: 'google/gemini-2.5-flash-image-preview:free',
        usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 }
      }),
      editImage: jest.fn().mockResolvedValue({
        images: ['data:image/png;base64,mockEditedImageData'],
        model: 'google/gemini-2.5-flash-image-preview:free',
        usage: { prompt_tokens: 15, completion_tokens: 25, total_tokens: 40 }
      }),
      getAvailableImageModels: jest.fn().mockReturnValue([
        'google/gemini-2.5-flash-image-preview:free',
        'anthropic/claude-3-opus:vision'
      ]),
      getDefaultImageModel: jest.fn().mockReturnValue('google/gemini-2.5-flash-image-preview:free')
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

// Test component that uses the ImageController context
const TestComponent = () => {
  const {
    apiKey,
    model,
    status,
    error,
    images,
    setApiKey,
    setModel,
    generateImage,
    editImage,
    cancelOperation
  } = useImageController();
  
  return (
    <div>
      <div data-testid="status">{status}</div>
      <div data-testid="api-key">{apiKey}</div>
      <div data-testid="model">{model}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <div data-testid="image-count">{images.length}</div>
      <button 
        data-testid="set-api-key" 
        onClick={() => setApiKey('new-api-key')}
      >
        Set API Key
      </button>
      <button 
        data-testid="set-model" 
        onClick={() => setModel('new-model')}
      >
        Set Model
      </button>
      <button 
        data-testid="generate-image" 
        onClick={() => generateImage({ prompt: 'test prompt' })}
      >
        Generate Image
      </button>
      <button 
        data-testid="edit-image" 
        onClick={() => editImage({ 
          baseImageDataUrl: 'data:image/png;base64,test', 
          prompt: 'test edit' 
        })}
      >
        Edit Image
      </button>
      <button 
        data-testid="cancel" 
        onClick={() => cancelOperation()}
      >
        Cancel
      </button>
    </div>
  );
};

describe('ImageControllerProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should provide initial state', () => {
    render(
      <ImageControllerProvider>
        <TestComponent />
      </ImageControllerProvider>
    );
    
    expect(screen.getByTestId('status')).toHaveTextContent('idle');
    expect(screen.getByTestId('api-key')).toHaveTextContent('');
    expect(screen.getByTestId('model')).toHaveTextContent('google/gemini-2.5-flash-image-preview:free');
    expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    expect(screen.getByTestId('image-count')).toHaveTextContent('0');
  });
  
  it('should update API key', () => {
    render(
      <ImageControllerProvider>
        <TestComponent />
      </ImageControllerProvider>
    );
    
    act(() => {
      screen.getByTestId('set-api-key').click();
    });
    
    expect(screen.getByTestId('api-key')).toHaveTextContent('new-api-key');
  });
  
  it('should update model', () => {
    render(
      <ImageControllerProvider>
        <TestComponent />
      </ImageControllerProvider>
    );
    
    act(() => {
      screen.getByTestId('set-model').click();
    });
    
    expect(screen.getByTestId('model')).toHaveTextContent('new-model');
  });
  
  it('should generate an image', async () => {
    render(
      <ImageControllerProvider initialApiKey="test-api-key">
        <TestComponent />
      </ImageControllerProvider>
    );
    
    act(() => {
      screen.getByTestId('generate-image').click();
    });
    
    // Should be in loading state
    expect(screen.getByTestId('status')).toHaveTextContent('loading');
    
    // Wait for the operation to complete
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('success');
    });
    
    expect(screen.getByTestId('image-count')).toHaveTextContent('1');
  });
  
  it('should edit an image', async () => {
    render(
      <ImageControllerProvider initialApiKey="test-api-key">
        <TestComponent />
      </ImageControllerProvider>
    );
    
    act(() => {
      screen.getByTestId('edit-image').click();
    });
    
    // Should be in loading state
    expect(screen.getByTestId('status')).toHaveTextContent('loading');
    
    // Wait for the operation to complete
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('success');
    });
    
    expect(screen.getByTestId('image-count')).toHaveTextContent('1');
  });
  
  it('should handle errors when API key is not provided', async () => {
    // Mock the ImageService to throw an error
    (ImageService as jest.Mock).mockImplementationOnce(() => ({
      setApiKey: jest.fn(),
      getApiKey: jest.fn().mockReturnValue(''),
      hasApiKey: jest.fn().mockReturnValue(false),
      validateApiKey: jest.fn().mockResolvedValue(false),
      generateImage: jest.fn().mockRejectedValue(new Error('API key is required')),
      editImage: jest.fn().mockRejectedValue(new Error('API key is required')),
      getAvailableImageModels: jest.fn().mockReturnValue([]),
      getDefaultImageModel: jest.fn().mockReturnValue('')
    }));
    
    render(
      <ImageControllerProvider>
        <TestComponent />
      </ImageControllerProvider>
    );
    
    act(() => {
      screen.getByTestId('generate-image').click();
    });
    
    // Wait for the error to be set
    await waitFor(() => {
      expect(screen.getByTestId('error')).not.toHaveTextContent('no-error');
    });
  });
});
