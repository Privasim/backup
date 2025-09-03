import { createContext } from 'react';
import { ImageControllerContextType, ImageControllerState } from './types';

// Initial state for the ImageController
export const initialImageControllerState: ImageControllerState = {
  // API and model configuration
  apiKey: '',
  model: 'google/gemini-2.5-flash-image-preview:free',
  availableModels: [
    'google/gemini-2.5-flash-image-preview:free',
    'anthropic/claude-3-opus:vision',
    'anthropic/claude-3-sonnet:vision',
    'openai/gpt-4o:vision'
  ],
  
  // Operation state
  status: 'idle',
  operationType: 'none',
  error: null,
  
  // Results
  images: [],
  selectedImageIndex: -1, // -1 indicates no image is selected (empty array)
  
  // Operation metadata
  lastPrompt: '',
  lastOperation: 'none',
  lastOperationTime: null,
  
  // Usage statistics
  usage: null
};

// Create the context with a default value
// The default value is only used when a component does not have a matching Provider above it
export const ImageControllerContext = createContext<ImageControllerContextType>({
  ...initialImageControllerState,
  
  // Default no-op implementations for actions
  setApiKey: () => {},
  setModel: () => {},
  validateApiKey: async () => false,
  
  generateImage: async () => {},
  editImage: async () => {},
  cancelOperation: () => {},
  
  selectImage: () => {},
  clearImages: () => {},
  
  clearError: () => {}
});
