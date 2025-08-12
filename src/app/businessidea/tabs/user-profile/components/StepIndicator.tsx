"use client";

import React, { useMemo } from "react";

type Props = {
  currentStep: number;
  totalSteps?: number;
  labels?: string[];
  className?: string;
};

const DEFAULT_LABELS = [
  "Role",
  "Details",
  "Industry & Location",
  "Skills",
  "Review",
];

export default function StepIndicator({ currentStep, totalSteps = 5, labels = DEFAULT_LABELS, className = "" }: Props) {
  const percent = useMemo(() => Math.min(100, Math.max(0, ((currentStep - 1) / (totalSteps - 1)) * 100)), [currentStep, totalSteps]);
  return (
    <div className={`w-full ${className}`} role="progressbar" aria-label="Form progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percent)}>
      {/* Progress track */}
      <div className="relative h-2 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      {/* Labels with numbered badges */}
      <div className="mt-2 grid gap-2" style={{ gridTemplateColumns: `repeat(${totalSteps}, minmax(0,1fr))` }}>
        {Array.from({ length: totalSteps }).map((_, i) => {
          const step = i + 1;
          const isActive = step === currentStep;
          const isDone = step < currentStep;
          return (
            <div key={step} className="min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium transition-colors ${
                    isDone ? 'bg-indigo-600 text-white' : isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {step}
                </span>
                <span className={`truncate text-[11px] leading-4 ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>{labels[i] || `Step ${step}`}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="sr-only">Step {currentStep} of {totalSteps}</div>
    </div>
  );
}
