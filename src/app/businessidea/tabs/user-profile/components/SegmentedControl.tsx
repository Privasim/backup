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
      {label && <div className="mb-1 text-[11px] uppercase tracking-wide text-gray-500">{label}</div>}
      <div className="inline-flex rounded-md border border-gray-200 bg-white overflow-hidden shadow-xs">
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
              className={`px-3 py-1.5 text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:scale-[0.98] ${divider} ${
                selected ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
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
