/**
 * Types for the independent Messenger feature
 */

export interface MessengerMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface MessengerConfig {
  model: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
}

export type MessengerStatus = 'idle' | 'streaming' | 'error';

export interface SendMessageOptions {
  content: string;
  stream?: boolean;
}

export interface MessengerContextType {
  // State
  config: MessengerConfig;
  status: MessengerStatus;
  messages: MessengerMessage[];
  error?: string;
  
  // Actions
  updateConfig: (config: Partial<MessengerConfig>) => void;
  sendMessage: (options: SendMessageOptions) => Promise<void>;
  stop: () => void;
  clear: () => void;
}
