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
      <div className="card-base p-2 flex flex-col items-center justify-center h-14">
        <PhotoIcon className="h-4 w-4 text-neutral-400" />
        <p className="text-[10px] text-secondary">No images yet</p>
      </div>
    );
  }

  return (
    <div className="card-base p-2">
      <h3 className="text-xs font-medium text-primary mb-1">Results</h3>
      <div className="grid grid-cols-6 sm:grid-cols-8 gap-1">
        {images.map((image, index) => (
          <div
            key={`image-${index}`}
            className={`relative aspect-square cursor-pointer rounded-sm overflow-hidden shadow-xs ${selectedIndex === index ? 'ring-1 ring-primary-500' : 'border border-neutral-200'}`}
            onClick={() => onSelect(index)}
          >
            <img
              src={image}
              alt={`Generated image ${index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute bottom-0.5 right-0.5 bg-black/80 text-white text-[8px] font-medium px-0.5 rounded-[2px]">
              {index + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
