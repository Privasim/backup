// File: src/app/businessidea/tabs/user-profile/components/FieldRenderer.tsx
"use client";
import React from "react";
import CompactSelect from "./CompactSelect";
import SegmentedControl from "./SegmentedControl";
import PillMultiSelect from "./PillMultiSelect";

export type ValueMap = Record<string, unknown>;
export interface FieldRendererDef {
  id: string;
  label: string;
  type: "select" | "multi" | "segmented" | "range";
  options?: string[];
  required?: boolean;
  group: string;
}

interface Props {
  field: FieldRendererDef;
  values: ValueMap;
  onChange: (id: string, value: unknown) => void;
}

export default function FieldRenderer({ field, values, onChange }: Props) {
  const value = values[field.id] as string | string[] | undefined;

  if (field.type === "multi") {
    return (
      <PillMultiSelect
        label={field.label}
        options={field.options ?? []}
        value={Array.isArray(value) ? (value as string[]) : []}
        onChange={(v) => onChange(field.id, v)}
        initialVisibleCount={4}
        showSearch
      />
    );
  }

  if (field.type === "segmented") {
    return (
      <SegmentedControl
        label={field.label}
        options={field.options ?? []}
        value={(value as string) ?? ""}
        onChange={(v) => onChange(field.id, v)}
      />
    );
  }

  // For 'select' and 'range', render with CompactSelect
  return (
    <CompactSelect
      label={field.label}
      value={(value as string) ?? ""}
      onChange={(v) => onChange(field.id, v)}
      options={field.options ?? []}
      required={field.required}
    />
  );
}
