'use client';

import { useContext } from 'react';
import { ImageControllerContext } from './context';
import { ImageControllerContextType } from './types';

/**
 * Custom hook for accessing the ImageController context
 * Provides access to image generation and editing functionality
 * 
 * @returns The ImageController context value
 * @throws Error if used outside of an ImageControllerProvider
 */
export function useImageController(): ImageControllerContextType {
  const context = useContext(ImageControllerContext);
  
  if (context === undefined) {
    throw new Error('useImageController must be used within an ImageControllerProvider');
  }
  
  return context;
}
