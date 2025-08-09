'use client';

import { useCallback, useRef } from 'react';
import { ChatMessage } from './types';

interface StreamingMessageOptions {
  onMessageUpdate: (id: string, updates: Partial<ChatMessage>) => void;
  onComplete?: (id: string, finalContent: string) => void;
  onError?: (id: string, error: string) => void;
  debounceMs?: number;
}

export const useStreamingMessage = ({
  onMessageUpdate,
  onComplete,
  onError,
  debounceMs = 50
}: StreamingMessageOptions) => {
  const streamingRefs = useRef<Map<string, {
    content: string;
    timeoutId?: NodeJS.Timeout;
    isComplete: boolean;
  }>>(new Map());

  // Start streaming for a message
  const startStreaming = useCallback((messageId: string, initialContent: string = '') => {
    // Clear any existing stream for this message
    const existing = streamingRefs.current.get(messageId);
    if (existing?.timeoutId) {
      clearTimeout(existing.timeoutId);
    }

    // Initialize streaming state
    streamingRefs.current.set(messageId, {
      content: initialContent,
      isComplete: false
    });

    // Mark message as streaming
    onMessageUpdate(messageId, {
      content: initialContent,
      metadata: { isStreaming: true, isComplete: false }
    });

    return messageId;
  }, [onMessageUpdate]);

  // Add chunk to streaming message
  const addChunk = useCallback((messageId: string, chunk: string) => {
    const streamState = streamingRefs.current.get(messageId);
    if (!streamState || streamState.isComplete) {
      return;
    }

    // Update content
    const newContent = streamState.content + chunk;
    streamState.content = newContent;

    // Clear existing timeout
    if (streamState.timeoutId) {
      clearTimeout(streamState.timeoutId);
    }

    // Debounce updates to avoid too frequent re-renders
    streamState.timeoutId = setTimeout(() => {
      onMessageUpdate(messageId, {
        content: newContent,
        metadata: { isStreaming: true, isComplete: false }
      });
    }, debounceMs);
  }, [onMessageUpdate, debounceMs]);

  // Complete streaming for a message
  const completeStreaming = useCallback((messageId: string, finalContent?: string) => {
    const streamState = streamingRefs.current.get(messageId);
    if (!streamState) {
      return;
    }

    // Clear timeout
    if (streamState.timeoutId) {
      clearTimeout(streamState.timeoutId);
    }

    // Mark as complete
    streamState.isComplete = true;
    const content = finalContent || streamState.content;

    // Final update
    onMessageUpdate(messageId, {
      content,
      metadata: { isStreaming: false, isComplete: true }
    });

    // Call completion callback
    if (onComplete) {
      onComplete(messageId, content);
    }

    // Clean up
    streamingRefs.current.delete(messageId);
  }, [onMessageUpdate, onComplete]);

  // Handle streaming error
  const errorStreaming = useCallback((messageId: string, error: string) => {
    const streamState = streamingRefs.current.get(messageId);
    if (!streamState) {
      return;
    }

    // Clear timeout
    if (streamState.timeoutId) {
      clearTimeout(streamState.timeoutId);
    }

    // Mark as error
    streamState.isComplete = true;

    // Update message to error state
    onMessageUpdate(messageId, {
      type: 'error',
      content: `Streaming failed: ${error}`,
      metadata: { isStreaming: false, isComplete: true, error: true }
    });

    // Call error callback
    if (onError) {
      onError(messageId, error);
    }

    // Clean up
    streamingRefs.current.delete(messageId);
  }, [onMessageUpdate, onError]);

  // Cancel streaming for a message
  const cancelStreaming = useCallback((messageId: string) => {
    const streamState = streamingRefs.current.get(messageId);
    if (!streamState) {
      return;
    }

    // Clear timeout
    if (streamState.timeoutId) {
      clearTimeout(streamState.timeoutId);
    }

    // Mark as cancelled
    streamState.isComplete = true;

    // Update message
    onMessageUpdate(messageId, {
      content: streamState.content + '\n\n[Generation cancelled]',
      metadata: { isStreaming: false, isComplete: false, cancelled: true }
    });

    // Clean up
    streamingRefs.current.delete(messageId);
  }, [onMessageUpdate]);

  // Check if message is currently streaming
  const isStreaming = useCallback((messageId: string) => {
    const streamState = streamingRefs.current.get(messageId);
    return streamState && !streamState.isComplete;
  }, []);

  // Get current content for a streaming message
  const getCurrentContent = useCallback((messageId: string) => {
    const streamState = streamingRefs.current.get(messageId);
    return streamState?.content || '';
  }, []);

  // Clean up all streaming messages (useful for component unmount)
  const cleanupAll = useCallback(() => {
    streamingRefs.current.forEach((streamState, messageId) => {
      if (streamState.timeoutId) {
        clearTimeout(streamState.timeoutId);
      }
    });
    streamingRefs.current.clear();
  }, []);

  return {
    startStreaming,
    addChunk,
    completeStreaming,
    errorStreaming,
    cancelStreaming,
    isStreaming,
    getCurrentContent,
    cleanupAll
  };
};

export default useStreamingMessage;