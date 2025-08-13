"use client";

import React, { useMemo, useState } from "react";

type Props = {
  label?: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  maxSelected?: number;
  // UX enhancements
  recommended?: string[]; // will be shown first if provided
  initialVisibleCount?: number; // collapsed view count
  showSearch?: boolean; // renders a small search input to filter options
  showSelectedCount?: boolean; // show selected count in header even without maxSelected
  onSelectAllRecommended?: () => void; // quick action to select recommended
};

export default function PillMultiSelect({ label, options, value, onChange, maxSelected, recommended, initialVisibleCount = 8, showSearch = false, showSelectedCount = true, onSelectAllRecommended }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");

  const toggle = (opt: string) => {
    const exists = value.includes(opt);
    if (exists) {
      onChange(value.filter((v) => v !== opt));
    } else {
      if (maxSelected && value.length >= maxSelected) return;
      onChange([...value, opt]);
    }
  };

  // Order options: recommended first (deduped), then remaining
  const orderedOptions = useMemo(() => {
    const rec = (recommended || []).filter((r) => options.includes(r));
    const recSet = new Set(rec);
    const rest = options.filter((o) => !recSet.has(o));
    return [...rec, ...rest];
  }, [options, recommended]);

  const filtered = useMemo(() => {
    if (!query.trim()) return orderedOptions;
    const q = query.toLowerCase();
    return orderedOptions.filter((o) => o.toLowerCase().includes(q));
  }, [orderedOptions, query]);

  const visible = useMemo(() => {
    if (expanded) return filtered;
    return filtered.slice(0, initialVisibleCount);
  }, [filtered, expanded, initialVisibleCount]);

  const hiddenCount = Math.max(filtered.length - visible.length, 0);

  return (
    <div>
      {label && (
        <div className="mb-1.5 text-xs font-medium text-gray-700 flex items-center justify-between">
          <span>
            {label}
            {showSelectedCount && (
              <span className="ml-1 text-[11px] font-normal text-gray-500">({value.length} selected)</span>
            )}
          </span>
          <div className="flex items-center gap-2">
            {onSelectAllRecommended && (recommended && recommended.length > 0) && (
              <button
                type="button"
                onClick={onSelectAllRecommended}
                className="text-[11px] px-2 py-0.5 rounded border border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
              >
                Select recommended
              </button>
            )}
            {maxSelected && (
              <span className="text-xs text-gray-500 font-normal">
                <span className={value.length === maxSelected ? 'text-indigo-600 font-medium' : ''}>
                  {value.length}
                </span>/{maxSelected}
              </span>
            )}
          </div>
        </div>
      )}

      {showSearch && (
        <div className="mb-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="w-full px-3 py-1.5 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Filter options"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {visible.map((opt) => {
          const selected = value.includes(opt);
          const disabled = !selected && maxSelected !== undefined && value.length >= maxSelected;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              disabled={disabled}
              className={`group px-3.5 py-1.5 rounded-full text-sm border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-[0.98] ${
                selected 
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-200 font-medium' 
                  : disabled 
                    ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed opacity-70' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
              aria-pressed={selected}
            >
              <span className="flex items-center">
                {selected && (
                  <svg className="w-3 h-3 mr-1.5 text-indigo-500" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.5 6L5 7.5L8.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {opt}
              </span>
            </button>
          );
        })}
      </div>

      {hiddenCount > 0 && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="text-[12px] text-indigo-600 hover:text-indigo-700"
            aria-expanded={expanded}
          >
            Show {hiddenCount} more
          </button>
        </div>
      )}
    </div>
  );
}
