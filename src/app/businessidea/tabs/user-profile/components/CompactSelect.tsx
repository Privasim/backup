"use client";

import React from "react";

type Option = { label: string; value: string } | string;

type Props = {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  required?: boolean;
};

export default function CompactSelect({ label, value, onChange, options, placeholder = 'Select...', required }: Props) {
  const normalized = options.map((o) => (typeof o === 'string' ? { label: o, value: o } : o));
  const hasValue = value !== undefined && value !== '';
  
  return (
    <label className="block text-sm">
      {label && (
        <span className="mb-1.5 block text-xs font-medium text-gray-700">
          {label}
          {required && <span className="ml-1 text-indigo-500">*</span>}
        </span>
      )}
      <div className="relative">
        <select
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className={`w-full appearance-none pr-9 pl-3.5 py-2.5 rounded-lg border bg-white text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${hasValue 
            ? 'border-gray-300 text-gray-800 font-medium' 
            : 'border-gray-200 text-gray-500'} hover:border-gray-300`}
        >
          <option value="" disabled>{placeholder}</option>
          {normalized.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span 
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform duration-200" 
          aria-hidden
          style={{ transform: 'translateY(-50%) rotate(0deg)' }}
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </span>
      </div>
    </label>
  );
}
