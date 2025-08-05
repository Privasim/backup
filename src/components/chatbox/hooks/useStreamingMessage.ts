'use client';

import { useState, useCallback, useRef } from 'react';
import { ChatboxMessageData } from '../types';

interface StreamingMessageState {
  message: ChatboxMessageData | null;
  isStreaming: boolean;
  isComplete: boolean;
  error: string | null;
}

interface UseStreamingMessageOptions {
  onComplete?: (message: ChatboxMessageData) => void;
  onError?: (error: string) => void;
  onChunk?: (chunk: string, fullContent: string) => void;
}

/**
 * Hook for managing streaming message updates
 */
export const useStreamingMessage = (options: UseStreamingMessageOptions = {}) => {
  const [state, setState] = useState<StreamingMessageState>({
    message: null,
    isStreaming: false,
    isComplete: false,
    error: null
  });

  const contentRef = useRef<string>('');
  const messageIdRef = useRef<string>('');

  /**
   * Start a new streaming message
   */
  const startStreaming = useCallback((initialMessage: Omit<ChatboxMessage, 'content'>) => {
    const messageId = `stream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    messageIdRef.current = messageId;
    contentRef.current = '';

    const message: ChatboxMessage = {
      ...initialMessage,
      id: messageId,
      content: '',
      timestamp: new Date().toISOString()
    };

    setState({
      message,
      isStreaming: true,
      isComplete: false,
      error: null
    });

    return messageId;
  }, []);

  /**
   * Add a chunk of content to the streaming message
   */
  const addChunk = useCallback((chunk: string) => {
    if (!state.isStreaming || !state.message) {
      console.warn('Cannot add chunk: no active streaming message');
      return;
    }

    contentRef.current += chunk;
    
    setState(prev => ({
      ...prev,
      message: prev.message ? {
        ...prev.message,
        content: contentRef.current
      } : null
    }));

    // Call chunk callback
    options.onChunk?.(chunk, contentRef.current);
  }, [state.isStreaming, state.message, options]);

  /**
   * Complete the streaming message
   */
  const completeStreaming = useCallback((finalMetadata?: Record<string, any>) => {
    if (!state.isStreaming || !state.message) {
      console.warn('Cannot complete: no active streaming message');
      return;
    }

    const completedMessage: ChatboxMessage = {
      ...state.message,
      content: contentRef.current,
      metadata: {
        ...state.message.metadata,
        ...finalMetadata
      }
    };

    setState({
      message: completedMessage,
      isStreaming: false,
      isComplete: true,
      error: null
    });

    // Call completion callback
    options.onComplete?.(completedMessage);

    return completedMessage;
  }, [state.isStreaming, state.message, options]);

  /**
   * Handle streaming error
   */
  const handleError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      isStreaming: false,
      isComplete: false,
      error
    }));

    // Call error callback
    options.onError?.(error);
  }, [options]);

  /**
   * Reset the streaming state
   */
  const reset = useCallback(() => {
    contentRef.current = '';
    messageIdRef.current = '';
    setState({
      message: null,
      isStreaming: false,
      isComplete: false,
      error: null
    });
  }, []);

  /**
   * Get current streaming progress
   */
  const getProgress = useCallback(() => {
    return {
      messageId: messageIdRef.current,
      contentLength: contentRef.current.length,
      isActive: state.isStreaming,
      hasError: !!state.error
    };
  }, [state.isStreaming, state.error]);

  return {
    // State
    message: state.message,
    isStreaming: state.isStreaming,
    isComplete: state.isComplete,
    error: state.error,
    
    // Actions
    startStreaming,
    addChunk,
    completeStreaming,
    handleError,
    reset,
    getProgress
  };
};