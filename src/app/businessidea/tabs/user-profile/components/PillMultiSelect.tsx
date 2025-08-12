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
      {label && (
        <div className="mb-1.5 text-xs font-medium text-gray-700 flex items-center justify-between">
          <span>{label}</span>
          {maxSelected && (
            <span className="text-xs text-gray-500 font-normal">
              <span className={value.length === maxSelected ? 'text-indigo-600 font-medium' : ''}>
                {value.length}
              </span>/{maxSelected}
            </span>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value.includes(opt);
          const disabled = !selected && maxSelected !== undefined && value.length >= maxSelected;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              disabled={disabled}
              className={`group px-3.5 py-1.5 rounded-full text-sm border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-[0.98] ${
                selected 
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-200 font-medium' 
                  : disabled 
                    ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed opacity-70' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
              aria-pressed={selected}
            >
              <span className="flex items-center">
                {selected && (
                  <svg className="w-3 h-3 mr-1.5 text-indigo-500" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.5 6L5 7.5L8.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {opt}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
