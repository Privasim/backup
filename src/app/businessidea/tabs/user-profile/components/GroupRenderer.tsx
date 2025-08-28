// File: src/app/businessidea/tabs/user-profile/components/GroupRenderer.tsx
"use client";
import React from "react";
import FieldRenderer from "./FieldRenderer";
import type { ResolvedField } from "../hooks/useRoleFieldConfig";

interface Props {
  title: string;
  hint?: string;
  fields: ResolvedField[];
  values: Record<string, unknown>;
  onChange: (id: string, value: unknown) => void;
  columns?: 1 | 2 | 3;
}

export default function GroupRenderer({
  title,
  hint = "optional",
  fields,
  values,
  onChange,
  columns = 2,
}: Props) {
  if (!fields.length) return null;
  const gridCols = columns === 3 ? "grid-cols-3" : columns === 1 ? "grid-cols-1" : "grid-cols-2";

  return (
    <div className="mt-1 pt-1 border-t border-gray-100">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-700">{title}</span>
        <span className="text-[10px] text-gray-400 px-1.5 py-0.5 bg-gray-50 rounded">{hint}</span>
      </div>
      <div className={`grid ${gridCols} gap-2`}>
        {fields.map((f) => (
          <FieldRenderer key={f.id} field={f} values={values} onChange={(id, v) => onChange(id, v)} />
        ))}
      </div>
    </div>
  );
}
