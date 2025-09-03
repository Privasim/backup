'use client';

import React from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';

interface ResultGalleryProps {
  images: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export default function ResultGallery({
  images,
  selectedIndex,
  onSelect
}: ResultGalleryProps) {
  if (images.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-md p-4 flex flex-col items-center justify-center h-32">
        <PhotoIcon className="h-8 w-8 text-gray-400" />
        <p className="text-sm text-gray-500 mt-2">No images generated yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-md p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Generated Images</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((image, index) => (
          <div
            key={`image-${index}`}
            className={`relative aspect-square cursor-pointer rounded-md overflow-hidden border-2 ${
              selectedIndex === index ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-transparent'
            }`}
            onClick={() => onSelect(index)}
          >
            <img
              src={image}
              alt={`Generated image ${index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1.5 py-0.5 rounded">
              {index + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
