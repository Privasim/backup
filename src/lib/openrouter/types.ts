// Extended types for OpenRouter client with multimodal support

// Base content part types
export interface OpenRouterTextPart {
  type: 'text';
  text: string;
}

export interface OpenRouterImageUrlPart {
  type: 'image_url';
  image_url: { url: string }; // Can be a URL or data URL (base64)
}

export type OpenRouterContentPart = OpenRouterTextPart | OpenRouterImageUrlPart;

// Extended message type to support content arrays
export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | OpenRouterContentPart[];
}

// Extended request type with modalities
export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  modalities?: Array<'image' | 'text'>;
}

// Response types with image support
export interface OpenRouterImageItem {
  type: 'image_url';
  image_url: { url: string }; // Base64 data URL in responses
}

export interface OpenRouterChoiceMessage {
  role: string;
  content: string | null | undefined;
  images?: OpenRouterImageItem[];
}

export interface OpenRouterDelta {
  role?: string;
  content?: string;
  images?: OpenRouterImageItem[];
}

export interface OpenRouterChoice {
  index: number;
  message?: OpenRouterChoiceMessage;
  delta?: OpenRouterDelta;
  finish_reason: string | null;
}

export interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenRouterChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Image-specific types
export interface GenerateImageParams {
  apiKey: string;
  model: string;
  prompt: string;
  stream?: boolean;
  signal?: AbortSignal;
  temperature?: number;
  maxTokens?: number;
}

export interface EditImageParams extends Omit<GenerateImageParams, 'prompt'> {
  baseImageDataUrl: string;
  prompt: string;
}

export interface ImageResult {
  images: string[]; // Array of data URLs
  model?: string;
  created?: number;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
