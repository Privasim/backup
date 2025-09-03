'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { OpenRouterClient } from '@/lib/openrouter/client';
import { getAvailableModels } from '@/lib/openrouter/client';
import { debugLog } from '@/components/debug/DebugConsole';
import { MessengerConfig, MessengerContextType, MessengerMessage, MessengerStatus, SendMessageOptions } from '../types';
import { ChatboxSettingsManager } from '@/components/chatbox/utils/settings-utils';

// Default configuration
const defaultConfig: MessengerConfig = {
  model: '',
  apiKey: '',
  temperature: 0.7,
  maxTokens: 800
};

// Create context
const MessengerContext = createContext<MessengerContextType | undefined>(undefined);

/**
 * Provider component for the Messenger feature
 * Completely independent from ChatboxProvider
 */
export const MessengerProvider = ({ children }: { children: ReactNode }) => {
  // Core state
  const [config, setConfig] = useState<MessengerConfig>(defaultConfig);
  const [status, setStatus] = useState<MessengerStatus>('idle');
  const [messages, setMessages] = useState<MessengerMessage[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);
  
  // For cancellation
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Initialize configuration from persisted Chatbox settings on mount
  useEffect(() => {
    try {
      const prefs = ChatboxSettingsManager.getPreferences();
      const model = prefs.defaultModel || '';
      const apiKey = model ? (ChatboxSettingsManager.getApiKey(model) || '') : '';

      if (model || apiKey) {
        const initial: Partial<MessengerConfig> = {
          model,
          apiKey,
          temperature: defaultConfig.temperature,
          maxTokens: defaultConfig.maxTokens,
        };

        setConfig(prev => ({ ...prev, ...initial }));
        debugLog.info('Messenger', 'Initialized config from storage', { model, hasApiKey: !!apiKey });
      }
    } catch (e) {
      debugLog.warn('Messenger', 'Failed to initialize config from storage', { error: (e as Error).message });
    }
  }, []);

  // Update configuration
  const updateConfig = useCallback((partialConfig: Partial<MessengerConfig>) => {
    debugLog.info('Messenger', 'Updating configuration', { 
      previous: config,
      changes: partialConfig 
    });
    
    setConfig(prev => {
      const next = { ...prev, ...partialConfig } as MessengerConfig;

      // Persist updates to preferences and API key storage
      try {
        if (next.model) {
          ChatboxSettingsManager.savePreferences({ defaultModel: next.model });
        }
        if (next.model && next.apiKey) {
          ChatboxSettingsManager.saveApiKey(next.model, next.apiKey);
        }
      } catch (e) {
        debugLog.warn('Messenger', 'Failed to persist updated configuration', { error: (e as Error).message });
      }

      return next;
    });
    
    // Clear error when config changes
    if (error) {
      setError(undefined);
    }
  }, [config, error]);

  // When model changes and apiKey is missing, auto-load saved key for that model
  useEffect(() => {
    if (config.model && !config.apiKey) {
      try {
        const savedKey = ChatboxSettingsManager.getApiKey(config.model);
        if (savedKey) {
          setConfig(prev => ({ ...prev, apiKey: savedKey }));
          debugLog.info('Messenger', 'Loaded API key for selected model from storage', { model: config.model });
        }
      } catch (e) {
        debugLog.warn('Messenger', 'Failed to load API key for model', { model: config.model, error: (e as Error).message });
      }
    }
  }, [config.model, config.apiKey]);

  // Add a new message
  const addMessage = useCallback((message: Omit<MessengerMessage, 'id' | 'timestamp'>) => {
    const newMessage: MessengerMessage = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      ...message
    };
    
    debugLog.debug('Messenger', `Adding ${message.role} message`, { 
      contentLength: message.content.length,
      messageId: newMessage.id 
    });
    
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  }, []);

  // Append content to an existing message
  const appendToMessage = useCallback((messageId: string, content: string) => {
    setMessages(prev => 
      prev.map(message => 
        message.id === messageId 
          ? { ...message, content: message.content + content } 
          : message
      )
    );
  }, []);

  // Stop any ongoing streaming
  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      debugLog.info('Messenger', 'Stopping message streaming');
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setStatus('idle');
  }, []);

  // Clear all messages
  const clear = useCallback(() => {
    debugLog.info('Messenger', 'Clearing all messages');
    stop();
    setMessages([]);
    setError(undefined);
  }, [stop]);

  // Send a message to the AI
  const sendMessage = useCallback(async ({ content, stream = true }: SendMessageOptions) => {
    debugLog.info('Messenger', 'Sending message', { 
      contentLength: content.length,
      streaming: stream,
      hasApiKey: !!config.apiKey,
      hasModel: !!config.model,
      model: config.model || 'not set',
      temperature: config.temperature,
      maxTokens: config.maxTokens
    });
    
    // Validate configuration
    if (!config.apiKey || !config.model) {
      const errorMsg = 'API key and model are required';
      debugLog.error('Messenger', errorMsg);
      setError(errorMsg);
      return;
    }
    
    // Validate API key format
    const apiKeyRegex = /^sk-or-v1-[a-f0-9]{32,}$/;
    if (!apiKeyRegex.test(config.apiKey)) {
      const errorMsg = 'Invalid API key format';
      debugLog.error('Messenger', errorMsg, { keyLength: config.apiKey.length });
      setError(errorMsg);
      return;
    }

    try {
      // Stop any ongoing streaming
      stop();
      
      // Add user message
      addMessage({
        role: 'user',
        content
      });

      // Create placeholder for assistant response
      const assistantMessageId = addMessage({
        role: 'assistant',
        content: ''
      });

      // Set status to streaming
      setStatus('streaming');
      
      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      // Create OpenRouter client
      debugLog.debug('Messenger', 'Creating OpenRouter client');
      const client = new OpenRouterClient(config.apiKey);

      // Prepare messages for API
      const apiMessages = messages
        .filter(msg => msg.role !== 'assistant' || msg.content.trim() !== '')
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      // Add the current user message
      apiMessages.push({ role: 'user', content });
      
      debugLog.debug('Messenger', 'Prepared API messages', { 
        messageCount: apiMessages.length,
        totalTokenEstimate: apiMessages.reduce((acc, msg) => acc + msg.content.length / 4, 0)
      });

      // Prepare request object
      const request = {
        model: config.model,
        messages: apiMessages,
        temperature: config.temperature,
        max_tokens: config.maxTokens
      };

      if (stream) {
        // Streaming response
        debugLog.info('Messenger', 'Starting streaming response');
        let chunkCount = 0;
        let totalChars = 0;
        const startTime = Date.now();
        
        try {
          await client.chat(
            request,
            {
              stream: true,
              onChunk: (chunk: string) => {
                chunkCount++;
                totalChars += chunk.length;
                appendToMessage(assistantMessageId, chunk);
                
                if (chunkCount % 10 === 0) {
                  debugLog.debug('Messenger', 'Streaming progress', { 
                    chunkCount, 
                    totalChars,
                    elapsedMs: Date.now() - startTime 
                  });
                }
              },
              signal
            }
          );
          
          const elapsedTime = Date.now() - startTime;
          debugLog.success('Messenger', 'Streaming completed', { 
            chunkCount, 
            totalChars, 
            elapsedMs: elapsedTime,
            charsPerSecond: Math.round((totalChars / elapsedTime) * 1000) 
          });
        } catch (err) {
          if ((err as Error).name !== 'AbortError') {
            throw err;
          } else {
            debugLog.warn('Messenger', 'Streaming aborted by user', { 
              chunkCount, 
              totalChars,
              elapsedMs: Date.now() - startTime 
            });
          }
        }
      } else {
        // Non-streaming response
        debugLog.info('Messenger', 'Starting non-streaming response');
        const startTime = Date.now();
        
        const response = await client.chat(request, { stream: false, signal });
        if (response && 'choices' in response && response.choices && response.choices[0]?.message?.content) {
          const content = response.choices[0].message.content;
          appendToMessage(assistantMessageId, content);
          
          const elapsedTime = Date.now() - startTime;
          debugLog.success('Messenger', 'Non-streaming response completed', { 
            contentLength: content.length,
            elapsedMs: elapsedTime,
            charsPerSecond: Math.round((content.length / elapsedTime) * 1000),
            usage: response.usage
          });
        } else {
          debugLog.error('Messenger', 'Invalid response format', { response });
          throw new Error('Invalid response format from API');
        }
      }

      // Reset status when complete
      if (status === 'streaming') {
        setStatus('idle');
      }
    } catch (err) {
      // Handle errors, but ignore AbortError from manual cancellation
      if ((err as Error).name !== 'AbortError') {
        const errorMessage = (err as Error).message || 'Unknown error';
        debugLog.error(
          'Messenger', 
          `Error in sendMessage: ${errorMessage}`, 
          err, 
          (err as Error).stack
        );
        
        // Provide a user-friendly error message
        let userErrorMessage = `Error: ${errorMessage}`;
        
        // Handle common error scenarios
        if (errorMessage.includes('rate limit')) {
          userErrorMessage = 'Rate limit exceeded. Please try again in a moment.';
        } else if (errorMessage.includes('authentication')) {
          userErrorMessage = 'Authentication failed. Please check your API key.';
        } else if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
          userErrorMessage = 'Request timed out. Please try again.';
        } else if (errorMessage.includes('network')) {
          userErrorMessage = 'Network error. Please check your connection.';
        }
        
        setError(userErrorMessage);
        setStatus('error');
      } else {
        setStatus('idle');
      }
    } finally {
      abortControllerRef.current = null;
      debugLog.info('Messenger', `Message handling completed with status: ${status}`);
    }
  }, [config, messages, status, stop, addMessage, appendToMessage]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Context value
  const contextValue: MessengerContextType = {
    config,
    status,
    messages,
    error,
    updateConfig,
    sendMessage,
    stop,
    clear
  };

  return (
    <MessengerContext.Provider value={contextValue}>
      {children}
    </MessengerContext.Provider>
  );
};

/**
 * Hook to use the Messenger context
 * Will throw if used outside of MessengerProvider
 */
export const useMessenger = () => {
  const context = useContext(MessengerContext);
  if (context === undefined) {
    throw new Error('useMessenger must be used within a MessengerProvider');
  }
  return context;
};
