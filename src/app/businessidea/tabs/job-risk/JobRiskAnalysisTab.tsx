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
      <div className="space-y-6 pb-12">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-red-700">Job Risk Analysis</h2>
          <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
            AI Threat Assessment
          </span>
        </div>
      <div className="grid grid-cols-1 gap-4">
        {/* Stacked visualizations */}
        <div className="space-y-6">
          {/* Velocity Cuts Chart */}
          <div className="rounded-xl border border-red-200 bg-white p-4 shadow-sm hover:shadow-md hover:shadow-red-100 transition-shadow">
            <h3 className="text-sm font-semibold text-red-700 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              Velocity Cuts
            </h3>
            {loading ? (
              <div className="h-[220px] rounded-lg bg-slate-100" />
            ) : (
              <D3VelocityCutsChart data={velocity.data} highlightWindowMonths={3} height={220} />
            )}
          </div>

          {/* Skill Automation Chart */}
          <div className="rounded-xl border border-red-200 bg-white p-4 shadow-sm hover:shadow-md hover:shadow-red-100 transition-shadow">
            <h3 className="text-sm font-semibold text-red-700 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10.339 2.237a.532.532 0 00-.678 0 11.947 11.947 0 01-7.078 2.75.5.5 0 00-.479.425A12.11 12.11 0 002 7c0 5.163 3.26 9.564 7.834 11.257a.48.48 0 00.332 0C14.74 16.564 18 12.163 18 7.001c0-.54-.035-1.07-.104-1.59a.5.5 0 00-.48-.425 11.947 11.947 0 01-7.077-2.75zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              Skill Automation
            </h3>
            {loading ? (
              <div className="h-[260px] rounded-lg bg-slate-100" />
            ) : (
              <D3SkillAutomation impacts={skills.impacts} matrix={skills.matrix} mode="radial" height={260} showLegend={false} />
            )}
          </div>

          {/* Forecast Fan */}
          <div className="rounded-xl border border-red-200 bg-white p-4 shadow-sm hover:shadow-md hover:shadow-red-100 transition-shadow">
            <h3 className="text-sm font-semibold text-red-700 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M15.98 1.804a1 1 0 00-1.96 0l-.24 1.192a1 1 0 01-.784.785l-1.192.238a1 1 0 000 1.962l1.192.238a1 1 0 01.785.785l.238 1.192a1 1 0 001.962 0l.238-1.192a1 1 0 01.785-.785l1.192-.238a1 1 0 000-1.962l-1.192-.238a1 1 0 01-.785-.785l-.238-1.192zM6.949 5.684a1 1 0 00-1.898 0l-.683 2.051a1 1 0 01-.633.633l-2.051.683a1 1 0 000 1.898l2.051.684a1 1 0 01.633.632l.683 2.051a1 1 0 001.898 0l.683-2.051a1 1 0 01.633-.633l2.051-.683a1 1 0 000-1.898l-2.051-.683a1 1 0 01-.633-.633L6.95 5.684z" />
              </svg>
              Forecast Fan
            </h3>
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
    </div>
  );
}
