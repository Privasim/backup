/**
 * Types for the ImageController context and provider
 */

// Image operation status
export type ImageOperationStatus = 'idle' | 'loading' | 'success' | 'error';

// Image operation type
export type ImageOperationType = 'generate' | 'edit' | 'none';

// Image dimensions
export interface ImageDimensions {
  width: number;
  height: number;
}

// Image generation parameters
export interface GenerationParams {
  prompt: string;
  model?: string;
  dimensions?: ImageDimensions;
  temperature?: number;
  maxTokens?: number;
}

// Image editing parameters
export interface EditingParams {
  baseImageDataUrl: string;
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

// Image controller state
export interface ImageControllerState {
  // API and model configuration
  apiKey: string;
  model: string;
  availableModels: string[];
  
  // Operation state
  status: ImageOperationStatus;
  operationType: ImageOperationType;
  error: string | null;
  
  // Results
  images: string[];
  selectedImageIndex: number;
  
  // Operation metadata
  lastPrompt: string;
  lastOperation: ImageOperationType;
  lastOperationTime: number | null;
  
  // Usage statistics
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  } | null;
}

// Image controller actions
export interface ImageControllerActions {
  // Configuration
  setApiKey: (apiKey: string) => void;
  setModel: (model: string) => void;
  validateApiKey: () => Promise<boolean>;
  
  // Image operations
  generateImage: (params: GenerationParams) => Promise<void>;
  editImage: (params: EditingParams) => Promise<void>;
  cancelOperation: () => void;
  
  // Result management
  selectImage: (index: number) => void;
  clearImages: () => void;
  
  // Error handling
  clearError: () => void;
}

// Combined context type
export type ImageControllerContextType = ImageControllerState & ImageControllerActions;
