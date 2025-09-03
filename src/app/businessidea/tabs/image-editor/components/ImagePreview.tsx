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
      <div className="card-base p-6 flex flex-col items-center justify-center h-80">
        <div className="text-center">
          <p className="text-body text-primary">No image selected</p>
          <p className="text-body-sm text-secondary mt-2">Generate an image to preview it here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-base p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-subheading text-primary">Image Preview</h3>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleCopy}
            className="btn-secondary focus-ring"
            aria-label="Copy image to clipboard"
          >
            {isCopied ? (
              <>
                <CheckIcon className="h-4 w-4 mr-1.5 text-success-500" />
                <span className="text-success-500">Copied</span>
              </>
            ) : (
              <>
                <ClipboardDocumentIcon className="h-4 w-4 mr-1.5" />
                <span>Copy</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="btn-secondary focus-ring"
            aria-label="Download image"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-1.5" />
            <span>Download</span>
          </button>
        </div>
      </div>
      <div className="flex justify-center">
        <div className="relative max-w-full max-h-[500px] overflow-hidden rounded-lg shadow-md">
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
