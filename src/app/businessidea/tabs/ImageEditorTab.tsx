'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { PhotoIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { Dialog } from '@headlessui/react';
import PromptPanel from './image-editor/components/PromptPanel';
import ResultGallery from './image-editor/components/ResultGallery';
import ImagePreview from './image-editor/components/ImagePreview';
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
    operationType,
    setApiKey,
    setModel,
    validateApiKey,
    generateImage,
    editImage,
    selectImage,
    cancelOperation,
    clearError
  } = useImageController();
  
  // Local state for UI
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const isLoading = status === 'loading';
  const isGenerating = isLoading && operationType === 'generate';

  // Prefill prompt from sessionStorage when navigating from SuggestionCard
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('imageEditorPrompt');
      if (stored && typeof stored === 'string') {
        setPrompt(stored);
        sessionStorage.removeItem('imageEditorPrompt');
      }
    } catch {
      // no-op: storage may be unavailable; keep prompt as-is
    }
  }, []);

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

  // Image generation handlers
  const handlePromptChange = useCallback((newPrompt: string) => {
    setPrompt(newPrompt);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || !apiKey) return;
    
    try {
      await generateImage({
        prompt: prompt.trim(),
        model
      });
    } catch (err) {
      console.error('Error generating image:', err);
    }
  }, [prompt, apiKey, model, generateImage]);

  const handleSelectImage = useCallback((index: number) => {
    selectImage(index);
  }, [selectImage]);

  // Image download and copy handlers
  const handleDownloadImage = useCallback(() => {
    if (!images.length || selectedImageIndex < 0) return;
    
    const link = document.createElement('a');
    link.href = images[selectedImageIndex];
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [images, selectedImageIndex]);

  const handleCopyImage = useCallback(async () => {
    if (!images.length || selectedImageIndex < 0) return false;
    
    try {
      // Try to copy as image if browser supports it
      const response = await fetch(images[selectedImageIndex]);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      return true;
    } catch (err) {
      console.error('Error copying image to clipboard:', err);
      
      // Fallback: try to copy as URL
      try {
        await navigator.clipboard.writeText(images[selectedImageIndex]);
        return true;
      } catch (fallbackErr) {
        console.error('Error copying image URL to clipboard:', fallbackErr);
        return false;
      }
    }
  }, [images, selectedImageIndex]);

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-fade-in">
      <div className="rounded-full bg-primary-100 p-4 mb-4">
        <PhotoIcon className="h-8 w-8 text-primary-600" />
      </div>
      <h3 className="text-heading mb-2">No Image Selected</h3>
      <p className="text-body text-secondary mb-6 max-w-md">
        Upload an image to start editing. Supported formats: JPG, PNG, SVG, GIF.
      </p>
      <label 
        htmlFor="image-upload" 
        className="btn-primary focus-ring cursor-pointer"
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
        <div className="h-48 w-48 bg-neutral-200 rounded-lg mb-4"></div>
        <div className="h-4 bg-neutral-200 rounded w-32 mx-auto"></div>
      </div>
      <p className="text-body-sm text-secondary mt-4">
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
    // Show the image generation UI
    return (
      <div className="flex flex-col space-y-4">
        {/* Image preview and results */}
        <div className="space-y-4">
          {/* Main preview area */}
          <div className="animate-slide-up">
            <ImagePreview
              imageSrc={images.length > 0 && selectedImageIndex >= 0 ? images[selectedImageIndex] : null}
              onDownload={handleDownloadImage}
              onCopy={handleCopyImage}
            />
          </div>
          
          {/* Results gallery */}
          <div className="animate-slide-up" style={{animationDelay: '0.1s'}}>
            <ResultGallery
              images={images}
              selectedIndex={selectedImageIndex}
              onSelect={handleSelectImage}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Main Content Area - Image Editor */}
      <div className="flex-1 overflow-auto mb-4">
        {renderContent()}
      </div>
      
      {/* Combined Controls Panel */}
      <div className="card-base mb-4">
        <div className="relative">
          {/* Prompt Panel */}
          <div className="animate-fade-in px-4 pb-10">
            <PromptPanel
              prompt={prompt}
              isGenerating={isGenerating}
              onPromptChange={handlePromptChange}
              onGenerate={handleGenerate}
              disabled={false}
            />
          </div>
          
          {/* Settings Button - Bottom Left */}
          <button
            type="button"
            onClick={() => setIsConfigOpen(true)}
            className="absolute left-4 bottom-2 p-1.5 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            title="Settings"
          >
            <Cog6ToothIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Config Panel Modal */}
      <Dialog
        open={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        className="relative z-50"
      >
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        {/* Modal Panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
              API Configuration
            </Dialog.Title>
            
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
            
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setIsConfigOpen(false)}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
      
      {/* Status Bar */}
      <div className="mt-2">
        <StatusBar
          status={status}
          error={error}
          usage={usage}
          onCancel={cancelOperation}
        />
      </div>
    </div>
  );
}
