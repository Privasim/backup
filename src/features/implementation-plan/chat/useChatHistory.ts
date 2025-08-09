'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ChatMessage, ChatState, ChatActions } from './types';

export const useChatHistory = () => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    currentPhase: 'idle',
    isStreaming: false,
    error: undefined,
    outline: undefined,
    plan: undefined
  });

  const messageIdCounter = useRef(0);

  // Generate unique message ID
  const generateMessageId = useCallback(() => {
    messageIdCounter.current += 1;
    return `msg-${Date.now()}-${messageIdCounter.current}`;
  }, []);

  // Add a new message
  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: generateMessageId(),
      timestamp: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));

    return newMessage.id;
  }, [generateMessageId]);

  // Update an existing message
  const updateMessage = useCallback((id: string, updates: Partial<ChatMessage>) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(msg => 
        msg.id === id ? { ...msg, ...updates } : msg
      )
    }));
  }, []);

  // Clear all messages
  const clearMessages = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [],
      currentPhase: 'idle',
      isStreaming: false,
      error: undefined
    }));
  }, []);

  // Set current phase
  const setPhase = useCallback((phase: ChatState['currentPhase']) => {
    setState(prev => ({
      ...prev,
      currentPhase: phase
    }));
  }, []);

  // Set streaming state
  const setStreaming = useCallback((isStreaming: boolean) => {
    setState(prev => ({
      ...prev,
      isStreaming
    }));
  }, []);

  // Set error state
  const setError = useCallback((error?: string) => {
    setState(prev => ({
      ...prev,
      error,
      currentPhase: error ? 'error' : prev.currentPhase
    }));
  }, []);

  // Set outline data
  const setOutline = useCallback((outline: any) => {
    setState(prev => ({
      ...prev,
      outline
    }));
  }, []);

  // Set plan data
  const setPlan = useCallback((plan: any) => {
    setState(prev => ({
      ...prev,
      plan
    }));
  }, []);

  // Add system message helper
  const addSystemMessage = useCallback((content: string, metadata?: ChatMessage['metadata']) => {
    return addMessage({
      type: 'system',
      content,
      metadata
    });
  }, [addMessage]);

  // Add assistant message helper
  const addAssistantMessage = useCallback((
    content: string, 
    phase?: ChatMessage['phase'],
    section?: ChatMessage['section'],
    metadata?: ChatMessage['metadata']
  ) => {
    return addMessage({
      type: 'assistant',
      content,
      phase,
      section,
      metadata
    });
  }, [addMessage]);

  // Add loading message helper
  const addLoadingMessage = useCallback((
    phase: ChatMessage['phase'],
    metadata?: ChatMessage['metadata']
  ) => {
    return addMessage({
      type: 'loading',
      content: '',
      phase,
      metadata
    });
  }, [addMessage]);

  // Add error message helper
  const addErrorMessage = useCallback((content: string, metadata?: ChatMessage['metadata']) => {
    return addMessage({
      type: 'error',
      content,
      metadata
    });
  }, [addMessage]);

  // Get the last message of a specific type
  const getLastMessage = useCallback((type?: ChatMessage['type']) => {
    if (!type) {
      return state.messages[state.messages.length - 1];
    }
    
    for (let i = state.messages.length - 1; i >= 0; i--) {
      if (state.messages[i].type === type) {
        return state.messages[i];
      }
    }
    
    return undefined;
  }, [state.messages]);

  // Get messages by phase
  const getMessagesByPhase = useCallback((phase: ChatMessage['phase']) => {
    return state.messages.filter(msg => msg.phase === phase);
  }, [state.messages]);

  // Check if currently generating
  const isGenerating = state.currentPhase === 'generating-outline' || 
                      state.currentPhase === 'generating-plan' || 
                      state.isStreaming;

  // Check if waiting for approval
  const isAwaitingApproval = state.currentPhase === 'awaiting-approval';

  // Check if completed
  const isCompleted = state.currentPhase === 'completed';

  // Check if has error
  const hasError = state.currentPhase === 'error' || !!state.error;

  const actions: ChatActions = {
    addMessage,
    updateMessage,
    clearMessages,
    setPhase,
    setStreaming,
    setError
  };

  return {
    // State
    ...state,
    
    // Actions
    ...actions,
    
    // Extended actions
    setOutline,
    setPlan,
    addSystemMessage,
    addAssistantMessage,
    addLoadingMessage,
    addErrorMessage,
    
    // Queries
    getLastMessage,
    getMessagesByPhase,
    
    // Computed state
    isGenerating,
    isAwaitingApproval,
    isCompleted,
    hasError
  };
};

export default useChatHistory;