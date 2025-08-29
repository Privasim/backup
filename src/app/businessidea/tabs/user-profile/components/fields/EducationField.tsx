"use client";

import React from "react";
import CompactSelect from "../CompactSelect";

interface EducationData {
  level?: string;
  field?: string;
  completion?: string;
}

interface EducationFieldProps {
  value: EducationData;
  onChange: (value: EducationData) => void;
  levelOptions: string[];
  fieldOptions: string[];
  completionOptions?: string[];
  required?: boolean;
  className?: string;
}

export default function EducationField({
  value,
  onChange,
  levelOptions,
  fieldOptions,
  completionOptions,
  required = false,
  className = ""
}: EducationFieldProps) {
  const handleLevelChange = (level: string) => {
    // Clear field if it's not valid for the new level
    const newValue = { ...value, level };
    if (value.field && !fieldOptions.includes(value.field)) {
      newValue.field = undefined;
    }
    onChange(newValue);
  };

  const handleFieldChange = (field: string) => {
    onChange({ ...value, field });
  };

  const handleCompletionChange = (completion: string) => {
    onChange({ ...value, completion });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="space-y-0.5">
        <span className="text-xs font-medium text-gray-700">Education</span>
        {required && <span className="text-red-500 text-xs">*</span>}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <CompactSelect
          label="Level"
          value={value.level}
          onChange={handleLevelChange}
          options={levelOptions}
          required={required}
          placeholder="Select level..."
        />
        <CompactSelect
          label="Field"
          value={value.field}
          onChange={handleFieldChange}
          options={fieldOptions}
          required={required}
          placeholder={value.level ? "Select field..." : "Select level first"}
          disabled={!value.level}
        />
      </div>

      {completionOptions && (
        <CompactSelect
          label="Completion"
          value={value.completion}
          onChange={handleCompletionChange}
          options={completionOptions}
          placeholder="Select completion..."
        />
      )}
    </div>
  );
}