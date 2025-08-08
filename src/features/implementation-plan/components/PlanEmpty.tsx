"use client";

import React from 'react';

export const PlanEmpty: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <div className="p-3 bg-slate-50 rounded-full mb-3 ring-1 ring-slate-200">
      <span className="text-xl">🧭</span>
    </div>
    <h3 className="text-sm font-semibold text-slate-900 mb-1">No Implementation Plan Yet</h3>
    <p className="text-xs text-slate-600 max-w-sm">
      Select a business idea and click <span className="font-medium">Create Implementation Plan</span> to generate a streamlined, complete plan.
    </p>
  </div>
);

export default PlanEmpty;
