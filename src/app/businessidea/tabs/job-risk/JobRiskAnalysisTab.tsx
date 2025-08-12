"use client";

import React from "react";
import D3VelocityCutsChart from "./components/D3VelocityCutsChart";
import D3SkillAutomation from "./components/D3SkillAutomation";
import D3ForecastFan from "./components/D3ForecastFan";
import InsightsPanel from "./components/InsightsPanel";
import { useJobRiskData } from "./hooks/useJobRiskData";

export default function JobRiskAnalysisTab() {
  const { velocity, skills, forecast, insights, loading } = useJobRiskData();

  return (
    <div className="w-full h-full">
      <div className="grid grid-cols-1 gap-4">
        {/* Stacked visualizations */}
        <div className="space-y-4">
          {/* Velocity Cuts */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Velocity Cuts</h3>
            {loading ? (
              <div className="h-[220px] rounded-lg bg-slate-100" />
            ) : (
              <D3VelocityCutsChart data={velocity.data} highlightWindowMonths={3} height={220} />
            )}
          </div>

          {/* Skill Automation */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Skill Automation</h3>
            {loading ? (
              <div className="h-[260px] rounded-lg bg-slate-100" />
            ) : (
              <D3SkillAutomation impacts={skills.impacts} matrix={skills.matrix} mode="radial" height={260} showLegend={false} />
            )}
          </div>

          {/* Forecast Fan */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Forecast</h3>
            {loading ? (
              <div className="h-[240px] rounded-lg bg-slate-100" />
            ) : (
              <D3ForecastFan history={forecast.history} forecast={forecast.forecast} height={240} showBand showThermalStrip />
            )}
          </div>
        </div>

        {/* Insights below charts */}
        <div>
          <InsightsPanel insights={insights} loading={loading} />
        </div>
      </div>
    </div>
  );
}
