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
      {label && <div className="mb-1 text-xs text-gray-600">{label}</div>}
      <div className="inline-flex rounded-md border border-gray-200 bg-white overflow-hidden">
        {options.map((opt) => {
          const selected = value === opt;
          return (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt)}
              className={`px-3 py-1.5 text-sm transition-colors ${
                selected ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
