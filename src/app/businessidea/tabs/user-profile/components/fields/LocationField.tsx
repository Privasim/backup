"use client";

import React from "react";
import CompactSelect from "../CompactSelect";

interface LocationFieldProps {
  value?: string;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
  className?: string;
}

export default function LocationField({
  value,
  onChange,
  options,
  required = false,
  className = ""
}: LocationFieldProps) {
  return (
    <div className={className}>
      <CompactSelect
        label="Location"
        value={value}
        onChange={onChange}
        options={options}
        required={required}
        placeholder="Select location..."
      />
    </div>
  );
}