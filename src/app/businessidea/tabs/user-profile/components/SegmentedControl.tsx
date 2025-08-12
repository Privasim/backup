"use client";

import React from "react";

type Props = {
  label?: string;
  options: string[];
  value?: string;
  onChange: (value: string) => void;
};

export default function SegmentedControl({ label, options, value, onChange }: Props) {
  return (
    <div role="radiogroup" aria-label={label} className="w-full">
      {label && (
        <div className="mb-1.5 text-xs font-medium text-gray-700">{label}</div>
      )}
      <div className="inline-flex rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
        {options.map((opt, idx) => {
          const selected = value === opt;
          const divider = idx > 0 ? 'border-l border-gray-200' : '';
          return (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt)}
              className={`relative px-4 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:z-10 ${divider} ${
                selected 
                  ? 'bg-indigo-500 text-white font-medium shadow-inner' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="relative z-10">{opt}</span>
              {selected && (
                <span 
                  className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-indigo-600 opacity-100 transition-opacity duration-200"
                  aria-hidden="true"
                ></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
