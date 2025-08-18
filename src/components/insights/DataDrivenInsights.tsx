import React from 'react';
import { Skeleton } from '../ui/skeleton';
import { AlertCircle, ExternalLink, TrendingDown, TrendingUp, Shield, Zap } from 'lucide-react';
import type { DataDrivenInsightsModel, AutomationExposureItem, SkillImpactItem, MitigationItem, InsightSource } from './types';

interface DataDrivenInsightsProps {
  insights?: DataDrivenInsightsModel;
  loading?: boolean;
  errors?: string[];
  slots?: {
    headerRight?: React.ReactNode;
    footer?: React.ReactNode;
  };
}

export function DataDrivenInsights({ 
  insights, 
  loading = false, 
  errors = [], 
  slots 
}: DataDrivenInsightsProps) {
  if (loading) {
    return (
      <div
        aria-busy="true"
        className="rounded-xl border border-gray-200 bg-white shadow-sm p-3 sm:p-4"
      >
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-base font-semibold tracking-tight">Job Risk Insights</h2>
          {slots?.headerRight}
        </div>
        <p className="text-sm text-gray-500 mb-2">Analyzing job risk data...</p>
        <div className="space-y-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  if (errors.length > 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-3 sm:p-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <h3 className="text-sm font-medium text-red-700">Analysis Error</h3>
        </div>
        <ul className="mt-2 text-sm text-red-600">
          {errors.map((error: string, index: number) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-3 sm:p-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Zap className="h-4 w-4" />
          <span className="text-sm">No insights available</span>
        </div>
        <p className="mt-1 text-xs text-gray-500">Generate insights to see your job risk analysis</p>
      </div>
    );
  }

  const { 
    summary, 
    riskScore, 
    threatDrivers, 
    automationExposure, 
    skillImpacts, 
    mitigation, 
    sources 
  } = insights;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-3 sm:p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-base font-semibold tracking-tight">Job Risk Insights</h2>
        {slots?.headerRight}
      </div>
      <div className="mt-2 space-y-4">

      {/* Summary Section */}
      {summary && (
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="h-5 w-5 text-gray-700" />
            <h3 className="text-sm font-medium text-gray-900">Executive Summary</h3>
          </div>
          <p className="text-sm text-gray-700">{summary}</p>
          {riskScore !== undefined && (
            <div className="mt-2 flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <span className="text-2xl font-bold text-red-600">{riskScore}</span>
                <span className="text-sm text-red-600">/100</span>
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2" role="progressbar" aria-label="Overall risk score" aria-valuenow={riskScore} aria-valuemin={0} aria-valuemax={100}>
                <div 
                  className="bg-red-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${riskScore}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Threat Drivers */}
      {threatDrivers && threatDrivers.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Threat Drivers</h3>
          <div className="space-y-2" role="list">
            {threatDrivers.map((driver: string, index: number) => (
              <div key={index} role="listitem" className="flex items-center space-x-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="text-sm text-gray-700">{driver}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Automation Exposure */}
      {automationExposure && automationExposure.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Automation Exposure</h3>
          <div className="space-y-2" role="list">
            {automationExposure.map((item: AutomationExposureItem, index: number) => (
              <div key={index} role="listitem" className="flex justify-between items-center">
                <span className="text-sm text-gray-700">{item.task}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        item.exposure > 70 ? 'bg-red-600' : 
                        item.exposure > 40 ? 'bg-yellow-600' : 'bg-green-600'
                      }`}
                      style={{ width: `${item.exposure}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-8 text-right tabular-nums">{item.exposure}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skill Impacts */}
      {skillImpacts && skillImpacts.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Skill Impacts</h3>
          <div className="space-y-2" role="list">
            {skillImpacts.map((item: SkillImpactItem, index: number) => (
              <div key={index} role="listitem" className="p-3 rounded-lg border bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{item.skill}</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                    item.impact === 'high' ? 'bg-red-100 text-red-800' :
                    item.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {item.impact.charAt(0).toUpperCase() + item.impact.slice(1)}
                  </span>
                </div>
                {item.rationale && (
                  <p className="text-xs text-gray-600">{item.rationale}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mitigation Strategies */}
      {mitigation && mitigation.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Mitigation Strategies</h3>
          <div className="space-y-2" role="list">
            {mitigation.map((item: MitigationItem, index: number) => (
              <div key={index} role="listitem" className="p-3 rounded-lg border bg-blue-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">{item.action}</span>
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                    item.priority === 'high' ? 'bg-red-100 text-red-800' :
                    item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sources */}
      {sources && sources.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Sources</h3>
          <div className="space-y-2" role="list">
            {sources.map((source: InsightSource, index: number) => (
              <div key={index} role="listitem" className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4 text-gray-400" />
                {source.url ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                  >
                    {source.title}
                  </a>
                ) : (
                  <span className="text-sm text-gray-700">{source.title}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {slots?.footer && (
        <div className="border-t border-gray-100 pt-2 mt-2">
          {slots.footer}
        </div>
      )}
      </div>
    </div>
  );
}
