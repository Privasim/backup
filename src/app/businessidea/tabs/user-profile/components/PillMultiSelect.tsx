"use client";

import React from "react";

type Props = {
  label?: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  maxSelected?: number;
};

export default function PillMultiSelect({ label, options, value, onChange, maxSelected }: Props) {
  const toggle = (opt: string) => {
    const exists = value.includes(opt);
    if (exists) {
      onChange(value.filter((v) => v !== opt));
    } else {
      if (maxSelected && value.length >= maxSelected) return;
      onChange([...value, opt]);
    }
  };

  return (
    <div>
      {label && <div className="mb-1 text-[11px] uppercase tracking-wide text-gray-500">{label}</div>}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:scale-[0.98] ${
                selected ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
              aria-pressed={selected}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {maxSelected && (
        <div className="mt-1 text-[11px] text-gray-500">{value.length}/{maxSelected} selected</div>
      )}
    </div>
  );
}
