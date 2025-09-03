'use client';

import React, { useState, useCallback } from 'react';
import { 
  PhotoIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  PaintBrushIcon
} from '@heroicons/react/24/outline';
import { useImageController } from '@/providers/ImageController';
import { ApiKeyStorage } from '@/services/image/ApiKeyStorage';
import ConfigPanel from './image-editor/components/ConfigPanel';
import StatusBar from './image-editor/components/StatusBar';

interface ImageEditorTabProps {
  className?: string;
}

export default function ImageEditorTab({ className = '' }: ImageEditorTabProps) {
  // Use the ImageController context
  const {
    apiKey,
    model,
    availableModels,
    status,
    error,
    images,
    selectedImageIndex,
    usage,
    setApiKey,
    setModel,
    validateApiKey,
    cancelOperation,
    clearError
  } = useImageController();
  
  // Local state for UI
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const isLoading = status === 'loading';

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // API key management handlers
  const handleApiKeyChange = useCallback((newApiKey: string) => {
    setApiKey(newApiKey);
    clearError();
  }, [setApiKey, clearError]);
  
  const handleValidateKey = useCallback(async () => {
    return await validateApiKey();
  }, [validateApiKey]);
  
  const handlePersistToggle = useCallback((enabled: boolean) => {
    if (enabled && apiKey) {
      ApiKeyStorage.storeApiKey(model, apiKey);
    } else {
      ApiKeyStorage.removeApiKey(model);
    }
  }, [apiKey, model]);
  
  const handleRemoveKey = useCallback(() => {
    setApiKey('');
    ApiKeyStorage.removeApiKey(model);
    clearError();
  }, [setApiKey, model, clearError]);
  
  const handleModelChange = useCallback((newModel: string) => {
    setModel(newModel);
    // Check if we have a stored API key for this model
    const storedApiKey = ApiKeyStorage.getApiKey(newModel);
    if (storedApiKey && storedApiKey !== apiKey) {
      setApiKey(storedApiKey);
    }
  }, [setModel, setApiKey, apiKey]);

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="rounded-full bg-blue-50 p-3 mb-3">
        <PhotoIcon className="h-6 w-6 text-blue-500" />
      </div>
      <h3 className="text-sm font-medium text-gray-900 mb-2">No Image Selected</h3>
      <p className="text-xs text-gray-600 mb-4 max-w-md">
        Upload an image to start editing. Supported formats: JPG, PNG, SVG, GIF.
      </p>
      <label 
        htmlFor="image-upload" 
        className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
      >
        Upload Image
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </label>
    </div>
  );

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="animate-pulse">
        <div className="h-48 w-48 bg-slate-200 rounded-lg mb-4"></div>
        <div className="h-4 bg-slate-200 rounded w-32 mx-auto"></div>
      </div>
      <p className="text-xs text-slate-600 mt-4">
        Loading image...
      </p>
    </div>
  );

  const renderEditor = () => (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-900">Image Editor</h2>
        <div className="flex space-x-2">
          <button
            className="p-1 rounded-md hover:bg-gray-100"
            title="Undo"
          >
            <ArrowUturnLeftIcon className="h-4 w-4 text-gray-600" />
          </button>
          <button
            className="p-1 rounded-md hover:bg-gray-100"
            title="Redo"
          >
            <ArrowUturnRightIcon className="h-4 w-4 text-gray-600" />
          </button>
          <button
            className="p-1 rounded-md hover:bg-gray-100"
            title="Zoom In"
          >
            <ArrowsPointingOutIcon className="h-4 w-4 text-gray-600" />
          </button>
          <button
            className="p-1 rounded-md hover:bg-gray-100"
            title="Zoom Out"
          >
            <ArrowsPointingInIcon className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="w-3/4 bg-gray-50 border border-gray-200 rounded-md flex items-center justify-center overflow-hidden">
          <img 
            src={selectedImage || ''} 
            alt="Editing canvas" 
            className="max-w-full max-h-full object-contain"
          />
        </div>
        <div className="w-1/4 pl-4">
          <div className="bg-white border border-gray-200 rounded-md p-3">
            <h3 className="text-xs font-medium text-gray-700 mb-2">Tools</h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="flex flex-col items-center justify-center p-2 hover:bg-gray-50 rounded-md">
                <PaintBrushIcon className="h-4 w-4 text-gray-600" />
                <span className="text-[10px] mt-1">Brush</span>
              </button>
              <button className="flex flex-col items-center justify-center p-2 hover:bg-gray-50 rounded-md">
                <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                </svg>
                <span className="text-[10px] mt-1">Crop</span>
              </button>
              <button className="flex flex-col items-center justify-center p-2 hover:bg-gray-50 rounded-md">
                <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                <span className="text-[10px] mt-1">Color</span>
              </button>
              <button className="flex flex-col items-center justify-center p-2 hover:bg-gray-50 rounded-md">
                <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                </svg>
                <span className="text-[10px] mt-1">Resize</span>
              </button>
            </div>
          </div>
          
          <div className="mt-4 bg-white border border-gray-200 rounded-md p-3">
            <h3 className="text-xs font-medium text-gray-700 mb-2">Adjustments</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-gray-600 block mb-1">Brightness</label>
                <input type="range" className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
              </div>
              <div>
                <label className="text-[10px] text-gray-600 block mb-1">Contrast</label>
                <input type="range" className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
              </div>
              <div>
                <label className="text-[10px] text-gray-600 block mb-1">Saturation</label>
                <input type="range" className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <button className="w-full bg-indigo-600 text-white text-xs font-medium py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Save Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return renderLoadingState();
    }

    if (!selectedImage) {
      return renderEmptyState();
    }

    return renderEditor();
  };

  return (
    <div className={`h-full ${className}`}>
      {/* API Key Configuration Panel */}
      <ConfigPanel
        apiKey={apiKey}
        model={model}
        availableModels={availableModels}
        isValidating={status === 'loading' && !selectedImage}
        validationError={error}
        onApiKeyChange={handleApiKeyChange}
        onValidateKey={handleValidateKey}
        onPersistToggle={handlePersistToggle}
        onRemoveKey={handleRemoveKey}
        onModelChange={handleModelChange}
      />
      
      {renderContent()}
      
      {/* Status Bar */}
      <StatusBar
        status={status}
        error={error}
        usage={usage}
        onCancel={cancelOperation}
      />
    </div>
  );
}
