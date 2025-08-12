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
    <div className="mt-6 flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={onBack}
        disabled={!canBack}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500 ${
          canBack
            ? 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98]'
            : 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
        }`}
        aria-disabled={!canBack}
      >
        <span className="flex items-center">
          <svg className="w-3.5 h-3.5 mr-1.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </span>
      </button>
      <div className="text-xs font-medium text-gray-500">Step {currentStep} of {totalSteps}</div>
      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500 ${
          canNext
            ? 'text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-sm hover:shadow active:scale-[0.98]'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
        title={canNext ? '' : 'Please complete required selections to proceed'}
        aria-disabled={!canNext}
      >
        <span className="flex items-center">
          Next
          <svg className="w-3.5 h-3.5 ml-1.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
    </div>
  );
}
