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
      <div className="card-base p-6 flex flex-col items-center justify-center h-40">
        <PhotoIcon className="h-10 w-10 text-neutral-400" />
        <p className="text-body text-secondary mt-3">No images generated yet</p>
      </div>
    );
  }

  return (
    <div className="card-base p-6">
      <h3 className="text-subheading text-primary mb-4">Generated Images</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div
            key={`image-${index}`}
            className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md ${selectedIndex === index ? 'ring-2 ring-primary-500 transform scale-[1.02]' : 'border border-neutral-200'}`}
            onClick={() => onSelect(index)}
          >
            <img
              src={image}
              alt={`Generated image ${index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs font-medium px-2 py-1 rounded-full">
              {index + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
