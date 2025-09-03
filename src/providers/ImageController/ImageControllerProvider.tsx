'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { debugLog } from '@/components/debug/DebugConsole';
import { ImageService } from '@/services/image/ImageService';
import { ImageControllerContext, initialImageControllerState } from './context';
import { EditingParams, GenerationParams, ImageControllerState } from './types';

interface ImageControllerProviderProps {
  children: React.ReactNode;
  initialApiKey?: string;
}

/**
 * Provider component for the ImageController context
 * Manages state and operations for image generation and editing
 */
export function ImageControllerProvider({
  children,
  initialApiKey = ''
}: ImageControllerProviderProps) {
  // Initialize state with default values
  const [state, setState] = useState<ImageControllerState>({
    ...initialImageControllerState,
    apiKey: initialApiKey
  });
  
  // Create a ref for the ImageService to avoid recreating it on each render
  const serviceRef = useRef<ImageService>(new ImageService());
  
  // Create a ref for the abort controller to cancel operations
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Initialize the service with the API key
  useEffect(() => {
    if (state.apiKey) {
      serviceRef.current.setApiKey(state.apiKey);
      debugLog.info('ImageControllerProvider', 'Initialized with API key', {
        apiKeyLength: state.apiKey.length
      });
    }
  }, [state.apiKey]);
  
  /**
   * Set the API key
   */
  const setApiKey = useCallback((apiKey: string) => {
    setState(prev => ({ ...prev, apiKey }));
    serviceRef.current.setApiKey(apiKey);
    debugLog.info('ImageControllerProvider', 'API key updated');
  }, []);
  
  /**
   * Set the model
   */
  const setModel = useCallback((model: string) => {
    setState(prev => ({ ...prev, model }));
    debugLog.info('ImageControllerProvider', 'Model updated', { model });
  }, []);
  
  /**
   * Validate the API key
   */
  const validateApiKey = useCallback(async () => {
    if (!state.apiKey) {
      debugLog.warn('ImageControllerProvider', 'Cannot validate empty API key');
      return false;
    }
    
    setState(prev => ({ ...prev, status: 'loading' }));
    
    try {
      const isValid = await serviceRef.current.validateApiKey();
      
      setState(prev => ({
        ...prev,
        status: 'idle',
        error: isValid ? null : 'Invalid API key'
      }));
      
      return isValid;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'API key validation failed';
      
      setState(prev => ({
        ...prev,
        status: 'idle',
        error: errorMessage
      }));
      
      return false;
    }
  }, [state.apiKey]);
  
  /**
   * Generate an image from a text prompt
   */
  const generateImage = useCallback(async (params: GenerationParams) => {
    if (!state.apiKey) {
      setState(prev => ({
        ...prev,
        error: 'API key is required for image generation'
      }));
      return;
    }
    
    // Create a new abort controller for this operation
    abortControllerRef.current = new AbortController();
    
    setState(prev => ({
      ...prev,
      status: 'loading',
      operationType: 'generate',
      error: null,
      lastPrompt: params.prompt
    }));
    
    try {
      const result = await serviceRef.current.generateImage({
        model: params.model || state.model,
        prompt: params.prompt,
        signal: abortControllerRef.current.signal,
        temperature: params.temperature,
        maxTokens: params.maxTokens
      });
      
      setState(prev => ({
        ...prev,
        status: 'success',
        images: result.images,
        selectedImageIndex: result.images.length > 0 ? 0 : -1,
        lastOperation: 'generate',
        lastOperationTime: Date.now(),
        usage: result.usage || null
      }));
      
      debugLog.success('ImageControllerProvider', 'Image generation successful', {
        imageCount: result.images.length
      });
    } catch (error) {
      // Ignore aborted requests
      if (error instanceof DOMException && error.name === 'AbortError') {
        debugLog.info('ImageControllerProvider', 'Image generation aborted');
        setState(prev => ({
          ...prev,
          status: 'idle',
          operationType: 'none'
        }));
        return;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Image generation failed';
      
      setState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage
      }));
      
      debugLog.error('ImageControllerProvider', 'Image generation failed', error);
    } finally {
      abortControllerRef.current = null;
    }
  }, [state.apiKey, state.model]);
  
  /**
   * Edit an image using a text prompt and base image
   */
  const editImage = useCallback(async (params: EditingParams) => {
    if (!state.apiKey) {
      setState(prev => ({
        ...prev,
        error: 'API key is required for image editing'
      }));
      return;
    }
    
    if (!params.baseImageDataUrl) {
      setState(prev => ({
        ...prev,
        error: 'Base image is required for editing'
      }));
      return;
    }
    
    // Create a new abort controller for this operation
    abortControllerRef.current = new AbortController();
    
    setState(prev => ({
      ...prev,
      status: 'loading',
      operationType: 'edit',
      error: null,
      lastPrompt: params.prompt
    }));
    
    try {
      const result = await serviceRef.current.editImage({
        model: params.model || state.model,
        baseImageDataUrl: params.baseImageDataUrl,
        prompt: params.prompt,
        signal: abortControllerRef.current.signal,
        temperature: params.temperature,
        maxTokens: params.maxTokens
      });
      
      setState(prev => ({
        ...prev,
        status: 'success',
        images: result.images,
        selectedImageIndex: result.images.length > 0 ? 0 : -1,
        lastOperation: 'edit',
        lastOperationTime: Date.now(),
        usage: result.usage || null
      }));
      
      debugLog.success('ImageControllerProvider', 'Image editing successful', {
        imageCount: result.images.length
      });
    } catch (error) {
      // Ignore aborted requests
      if (error instanceof DOMException && error.name === 'AbortError') {
        debugLog.info('ImageControllerProvider', 'Image editing aborted');
        setState(prev => ({
          ...prev,
          status: 'idle',
          operationType: 'none'
        }));
        return;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Image editing failed';
      
      setState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage
      }));
      
      debugLog.error('ImageControllerProvider', 'Image editing failed', error);
    } finally {
      abortControllerRef.current = null;
    }
  }, [state.apiKey, state.model]);
  
  /**
   * Cancel the current operation
   */
  const cancelOperation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      
      setState(prev => ({
        ...prev,
        status: 'idle',
        operationType: 'none'
      }));
      
      debugLog.info('ImageControllerProvider', 'Operation cancelled');
    }
  }, []);
  
  /**
   * Select an image by index
   */
  const selectImage = useCallback((index: number) => {
    if (index >= 0 && index < state.images.length) {
      setState(prev => ({ ...prev, selectedImageIndex: index }));
    }
  }, [state.images.length]);
  
  /**
   * Clear all images
   */
  const clearImages = useCallback(() => {
    setState(prev => ({
      ...prev,
      images: [],
      selectedImageIndex: -1
    }));
  }, []);
  
  /**
   * Clear the error
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);
  
  // Combine state and actions for the context value
  const contextValue = {
    ...state,
    setApiKey,
    setModel,
    validateApiKey,
    generateImage,
    editImage,
    cancelOperation,
    selectImage,
    clearImages,
    clearError
  };
  
  return (
    <ImageControllerContext.Provider value={contextValue}>
      {children}
    </ImageControllerContext.Provider>
  );
}
