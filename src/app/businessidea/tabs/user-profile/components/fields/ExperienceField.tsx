"use client";

import React from "react";
import CompactSelect from "../CompactSelect";

interface ExperienceData {
  type?: string;
  duration?: string;
  details?: string;
}

interface ExperienceFieldProps {
  value: ExperienceData;
  onChange: (value: ExperienceData) => void;
  typeOptions: string[];
  durationOptions: string[];
  label?: string;
  required?: boolean;
  className?: string;
}

export default function ExperienceField({
  value,
  onChange,
  typeOptions,
  durationOptions,
  label = "Experience",
  required = false,
  className = ""
}: ExperienceFieldProps) {
  const handleTypeChange = (type: string) => {
    onChange({ ...value, type });
  };

  const handleDurationChange = (duration: string) => {
    onChange({ ...value, duration });
  };

  const handleDetailsChange = (details: string) => {
    onChange({ ...value, details });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="space-y-0.5">
        <span className="text-xs font-medium text-gray-700">{label}</span>
        {required && <span className="text-red-500 text-xs">*</span>}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <CompactSelect
          label="Type"
          value={value.type}
          onChange={handleTypeChange}
          options={typeOptions}
          required={required}
          placeholder="Select type..."
        />
        <CompactSelect
          label="Duration"
          value={value.duration}
          onChange={handleDurationChange}
          options={durationOptions}
          required={required}
          placeholder="Select duration..."
        />
      </div>

      {value.type && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Details (optional)
          </label>
          <input
            type="text"
            value={value.details || ""}
            onChange={(e) => handleDetailsChange(e.target.value)}
            placeholder="Brief description..."
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      )}
    </div>
  );
}