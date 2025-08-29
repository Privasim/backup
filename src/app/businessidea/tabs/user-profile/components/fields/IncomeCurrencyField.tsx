"use client";

import React from "react";
import CompactSelect from "../CompactSelect";
import SegmentedControl from "../SegmentedControl";

interface IncomeCurrencyData {
  range?: string;
  currency?: string;
  type?: string;
}

interface IncomeCurrencyFieldProps {
  value: IncomeCurrencyData;
  onChange: (value: IncomeCurrencyData) => void;
  rangeOptions: string[];
  currencyOptions?: string[];
  typeOptions?: string[];
  label?: string;
  required?: boolean;
  className?: string;
}

export default function IncomeCurrencyField({
  value,
  onChange,
  rangeOptions,
  currencyOptions = ["USD"],
  typeOptions,
  label = "Income",
  required = false,
  className = ""
}: IncomeCurrencyFieldProps) {
  const handleRangeChange = (range: string) => {
    onChange({ ...value, range });
  };

  const handleCurrencyChange = (currency: string) => {
    onChange({ ...value, currency });
  };

  const handleTypeChange = (type: string) => {
    onChange({ ...value, type });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="space-y-0.5">
        <span className="text-xs font-medium text-gray-700">{label}</span>
        {required && <span className="text-red-500 text-xs">*</span>}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <CompactSelect
          label="Range"
          value={value.range}
          onChange={handleRangeChange}
          options={rangeOptions}
          required={required}
          placeholder="Select range..."
        />
        <CompactSelect
          label="Currency"
          value={value.currency}
          onChange={handleCurrencyChange}
          options={currencyOptions}
          required={required}
          placeholder="Currency"
        />
      </div>

      {typeOptions && (
        <SegmentedControl
          label="Type"
          options={typeOptions}
          value={value.type}
          onChange={handleTypeChange}
        />
      )}
    </div>
  );
}