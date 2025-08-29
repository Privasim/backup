"use client";

import React from "react";
import CompactSelect from "../CompactSelect";

interface IndustryFieldProps {
  value?: string;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
  className?: string;
}

export default function IndustryField({
  value,
  onChange,
  options,
  required = false,
  className = ""
}: IndustryFieldProps) {
  return (
    <div className={className}>
      <CompactSelect
        label="Industry"
        value={value}
        onChange={onChange}
        options={options}
        required={required}
        placeholder="Select industry..."
      />
    </div>
  );
}