'use client';

import React, { useEffect, useState } from 'react';
import ImageEditorTab from '../ImageEditorTab';
import { ImageControllerProvider } from '@/providers/ImageController';
import { ApiKeyStorage } from '@/services/image/ApiKeyStorage';

export default function ImageEditor() {
  const [initialApiKey, setInitialApiKey] = useState<string>('');
  
  // Load the API key from storage on mount
  useEffect(() => {
    // Use the default model as the modelId for storage
    const modelId = 'google/gemini-2.5-flash-image-preview:free';
    const storedApiKey = ApiKeyStorage.getApiKey(modelId);
    
    if (storedApiKey) {
      setInitialApiKey(storedApiKey);
    }
  }, []);

  return (
    <ImageControllerProvider initialApiKey={initialApiKey}>
      <ImageEditorTab />
    </ImageControllerProvider>
  );
}
