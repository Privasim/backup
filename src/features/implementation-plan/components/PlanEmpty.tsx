"use client";

import React from 'react';

export const PlanEmpty: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-gradient-to-b from-white to-slate-50 rounded-xl border border-slate-200/50">
    <div className="relative">
      <div className="absolute inset-0 bg-blue-100/20 rounded-full blur-xl" />
      <div className="relative p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full mb-4">
        <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
    </div>
    <h3 className="text-xl font-semibold text-slate-900 mb-2">No Implementation Plan</h3>
    <p className="text-base text-slate-600 max-w-md leading-relaxed">
      Transform your business idea into a comprehensive implementation plan. 
      Select any suggestion and click{' '}
      <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
        Create Implementation Plan
      </span>{' '}
      to get started.
    </p>
  </div>
);

export default PlanEmpty;
