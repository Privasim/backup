"use client";

import React from "react";

type Props = {
  onBack: () => void;
  onNext: () => void;
  canBack: boolean;
  canNext: boolean;
  currentStep: number;
  totalSteps?: number;
};

export default function StepFooter({ onBack, onNext, canBack, canNext, currentStep, totalSteps = 5 }: Props) {
  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={onBack}
        disabled={!canBack}
        className={`px-3 py-2 rounded-md text-sm border transition-colors ${
          canBack ? 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
        }`}
      >
        Back
      </button>
      <div className="text-xs text-gray-500">Step {currentStep} of {totalSteps}</div>
      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        className={`px-3 py-2 rounded-md text-sm transition-colors ${
          canNext ? 'text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        title={canNext ? '' : 'Please complete required selections to proceed'}
      >
        Next
      </button>
    </div>
  );
}
