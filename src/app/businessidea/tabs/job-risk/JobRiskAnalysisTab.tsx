"use client";

import React from "react";
import InsightsPanel from "./components/InsightsPanel";
import { useJobRiskData } from "./hooks/useJobRiskData";

export default function JobRiskAnalysisTab() {
  const { insights, loading } = useJobRiskData();

  return (
    <div className="w-full h-full">
      <div className="space-y-6 pb-12">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-red-700">Job Risk Analysis</h2>
          <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
            AI Threat Assessment
          </span>
        </div>
        <div className="mt-4">
          <InsightsPanel insights={insights} loading={loading} />
        </div>
    </div>
    </div>
  );
}
