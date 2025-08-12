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
      {label && <span className="mb-1 block text-xs text-gray-600">{label}</span>}
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full appearance-none px-3 py-2 border border-gray-200 rounded-md bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      >
        <option value="" disabled>{placeholder}</option>
        {normalized.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}
