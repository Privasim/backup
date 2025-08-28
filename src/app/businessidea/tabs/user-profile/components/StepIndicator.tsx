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
  "Review",
];

export default function StepIndicator({ currentStep, totalSteps = 5, labels = DEFAULT_LABELS, className = "" }: Props) {
  const percent = useMemo(() => Math.min(100, Math.max(0, ((currentStep - 1) / (totalSteps - 1)) * 100)), [currentStep, totalSteps]);
  return (
    <div className={`w-full ${className}`} role="progressbar" aria-label="Form progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percent)}>
      {/* Progress track */}
      <div className="relative h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      {/* Labels with numbered badges */}
      <div className="mt-3 grid gap-x-2" style={{ gridTemplateColumns: `repeat(${totalSteps}, minmax(0,1fr))` }}>
        {Array.from({ length: totalSteps }).map((_, i) => {
          const step = i + 1;
          const isActive = step === currentStep;
          const isDone = step < currentStep;
          return (
            <div key={step} className="min-w-0">
              <div className="flex flex-col items-center gap-1.5 min-w-0">
                <span
                  className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-all duration-300 ${
                    isDone ? 'bg-indigo-600 text-white shadow-sm' : 
                    isActive ? 'bg-white text-indigo-700 ring-2 ring-indigo-500 shadow-sm' : 
                    'bg-white text-gray-400 ring-1 ring-gray-200'
                  }`}
                >
                  {isDone ? (
                    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3.5 6L5 7.5L8.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : step}
                </span>
                <span className={`truncate text-xs font-medium text-center ${isActive ? 'text-indigo-700' : isDone ? 'text-gray-700' : 'text-gray-400'}`}>
                  {labels[i] || `Step ${step}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="sr-only">Step {currentStep} of {totalSteps}</div>
    </div>
  );
}
