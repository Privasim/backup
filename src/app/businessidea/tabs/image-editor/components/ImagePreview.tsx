'use client';

import React, { useState } from 'react';
import { ArrowDownTrayIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';

interface ImagePreviewProps {
  imageSrc: string | null;
  onDownload: () => void;
  onCopy: () => Promise<boolean>;
}

export default function ImagePreview({
  imageSrc,
  onDownload,
  onCopy
}: ImagePreviewProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    const success = await onCopy();
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (!imageSrc) {
    return (
      <div className="bg-white border border-gray-200 rounded-md p-4 flex flex-col items-center justify-center h-64">
        <div className="text-center">
          <p className="text-sm text-gray-500">No image selected</p>
          <p className="text-xs text-gray-400 mt-1">Generate an image to preview it here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-md p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-700">Image Preview</h3>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            aria-label="Copy image to clipboard"
          >
            {isCopied ? (
              <>
                <CheckIcon className="h-4 w-4 mr-1 text-green-500" />
                <span className="text-green-500">Copied</span>
              </>
            ) : (
              <>
                <ClipboardDocumentIcon className="h-4 w-4 mr-1" />
                <span>Copy</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            aria-label="Download image"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
            <span>Download</span>
          </button>
        </div>
      </div>
      <div className="flex justify-center">
        <div className="relative max-w-full max-h-[500px] overflow-hidden rounded-md">
          <img
            src={imageSrc}
            alt="Generated image preview"
            className="max-w-full max-h-[500px] object-contain"
          />
        </div>
      </div>
    </div>
  );
}
