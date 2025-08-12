"use client";

import React from "react";

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
  return (
    <div className={`w-full ${className}`} aria-label="Progress" aria-valuemin={1} aria-valuemax={totalSteps} aria-valuenow={currentStep}>
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const step = i + 1;
          const isActive = step === currentStep;
          const isDone = step < currentStep;
          return (
            <div key={step} className="flex-1">
              <div className={`h-1.5 rounded-full transition-colors duration-300 ${
                isDone ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : isActive ? 'bg-indigo-400' : 'bg-gray-200'
              }`} />
              <div className="mt-2 text-[11px] leading-4 text-gray-600 truncate" aria-hidden>
                {labels[i] || `Step ${step}`}
              </div>
            </div>
          );
        })}
      </div>
      <div className="sr-only">Step {currentStep} of {totalSteps}</div>
    </div>
  );
}
