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
  return (
    <label className="block text-sm text-gray-700">
      {label && <span className="mb-1 block text-[11px] uppercase tracking-wide text-gray-500">{label}</span>}
      <div className="relative">
        <select
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="w-full appearance-none pr-8 px-3 py-2 rounded-md border border-gray-200 bg-white text-sm text-gray-900 shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus:border-indigo-400 hover:bg-gray-50"
        >
          <option value="" disabled>{placeholder}</option>
          {normalized.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden>
          {/* Chevron */}
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </span>
      </div>
    </label>
  );
}
