import React from 'react';
import { Skeleton } from '../ui/skeleton';
import { AlertCircle, ExternalLink, TrendingDown, TrendingUp, Shield, Zap, Info, ChevronRight, BarChart3 } from 'lucide-react';
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
        className="rounded-xl border border-gray-200 bg-white shadow-md p-4 sm:p-5 transition-all duration-300"
      >
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold tracking-tight text-gray-900">Job Risk Insights</h2>
          </div>
          {slots?.headerRight}
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg mb-4">
          <Info className="h-4 w-4 text-blue-600 animate-pulse" />
          <p className="text-sm text-blue-700 font-medium">Analyzing job risk data...</p>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-6 w-2/3 rounded-md" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-28 w-full rounded-md" />
          <Skeleton className="h-20 w-full rounded-md" />
        </div>
      </div>
    );
  }

  if (errors.length > 0) {
    return (
      <div className="rounded-xl border border-red-100 bg-white shadow-md p-4 sm:p-5 transition-all duration-300">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <h3 className="text-base font-medium text-red-700">Analysis Error</h3>
        </div>
        <div className="bg-red-50 rounded-lg p-3 border border-red-100">
          <ul className="space-y-1 text-sm text-red-600">
            {errors.map((error: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white shadow-md p-4 sm:p-5 transition-all duration-300">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="bg-gray-100 p-3 rounded-full mb-3">
            <Zap className="h-6 w-6 text-gray-500" />
          </div>
          <h3 className="text-base font-medium text-gray-700 mb-1">No insights available</h3>
          <p className="text-sm text-gray-500 max-w-sm">Generate insights to see your job risk analysis and recommendations</p>
        </div>
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
    sources,
    narratives
  } = insights;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-md p-4 sm:p-6 transition-all duration-300">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold tracking-tight text-gray-900">Job Risk Insights</h2>
        </div>
        {slots?.headerRight}
      </div>
      <div className="space-y-6">

      {/* Summary Section */}
      {(summary || narratives?.riskNarrative) && (
        <div className="bg-gradient-to-r from-blue-50 to-white p-4 rounded-xl border border-blue-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-base font-medium text-gray-900">Executive Summary</h3>
          </div>
          <p className="text-sm leading-relaxed text-gray-700 mb-4">{summary || narratives?.riskNarrative}</p>
          {riskScore !== undefined && (
            <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Risk Score</span>
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold text-red-600">{riskScore}</span>
                  <span className="text-sm text-red-600">/100</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5" role="progressbar" aria-label="Overall risk score" aria-valuenow={riskScore} aria-valuemin={0} aria-valuemax={100}>
                <div 
                  className="bg-red-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${riskScore}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>Low Risk</span>
                <span>High Risk</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Threat Drivers */}
      {(threatDrivers && threatDrivers.length > 0) || narratives?.threatNarrative ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-red-100 p-2 rounded-full">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-base font-medium text-gray-900">Threat Drivers</h3>
          </div>
          {narratives?.threatNarrative ? (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <p className="text-sm leading-relaxed text-gray-700">{narratives.threatNarrative}</p>
            </div>
          ) : threatDrivers && threatDrivers.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2" role="list">
              {threatDrivers.map((driver: string, index: number) => (
                <div 
                  key={index} 
                  role="listitem" 
                  className="flex items-center gap-2 p-2 rounded-lg border border-red-50 bg-red-50 hover:bg-red-100 transition-colors duration-200"
                >
                  <div className="bg-white p-1 rounded-full">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  </div>
                  <span className="text-sm text-gray-800">{driver}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Automation Exposure */}
      {(automationExposure && automationExposure.length > 0) || narratives?.automationNarrative ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-purple-100 p-2 rounded-full">
              <Zap className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-base font-medium text-gray-900">Automation Exposure</h3>
          </div>
          {narratives?.automationNarrative ? (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 mb-3">
              <p className="text-sm leading-relaxed text-gray-700">{narratives.automationNarrative}</p>
            </div>
          ) : null}
          
          {automationExposure && automationExposure.length > 0 ? (
            <div className="space-y-3 mt-3" role="list">
              {automationExposure.map((item: AutomationExposureItem, index: number) => (
                <div 
                  key={index} 
                  role="listitem" 
                  className="p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-800">{item.task}</span>
                    <span 
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        item.exposure > 70 ? 'bg-red-100 text-red-800' : 
                        item.exposure > 40 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {item.exposure}% Exposure
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        item.exposure > 70 ? 'bg-red-600' : 
                        item.exposure > 40 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${item.exposure}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Skill Impacts */}
      {(skillImpacts && skillImpacts.length > 0) || narratives?.skillsNarrative ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-base font-medium text-gray-900">Skill Impacts</h3>
          </div>
          
          {narratives?.skillsNarrative ? (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 mb-3">
              <p className="text-sm leading-relaxed text-gray-700">{narratives.skillsNarrative}</p>
            </div>
          ) : null}
          
          {skillImpacts && skillImpacts.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 mt-3" role="list">
              {skillImpacts.map((item: SkillImpactItem, index: number) => (
                <div 
                  key={index} 
                  role="listitem" 
                  className="p-4 rounded-lg border shadow-sm bg-gradient-to-br from-white to-gray-50 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-900">{item.skill}</span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      item.impact === 'high' ? 'bg-red-100 text-red-800' :
                      item.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {item.impact.charAt(0).toUpperCase() + item.impact.slice(1)} Impact
                    </span>
                  </div>
                  {item.rationale && (
                    <div className="bg-white p-2 rounded border border-gray-100">
                      <p className="text-xs leading-relaxed text-gray-700">{item.rationale}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Mitigation Strategies */}
      {(mitigation && mitigation.length > 0) || narratives?.mitigationNarrative ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-100 p-2 rounded-full">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-base font-medium text-gray-900">Mitigation Strategies</h3>
          </div>
          
          {narratives?.mitigationNarrative ? (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 mb-3">
              <p className="text-sm leading-relaxed text-gray-700">{narratives.mitigationNarrative}</p>
            </div>
          ) : null}
          
          {mitigation && mitigation.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 mt-3" role="list">
              {mitigation.map((item: MitigationItem, index: number) => (
                <div 
                  key={index} 
                  role="listitem" 
                  className="p-4 rounded-lg border shadow-sm bg-gradient-to-br from-green-50 to-white hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-white p-1 rounded-full border border-green-100">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{item.action}</span>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      item.priority === 'high' ? 'bg-red-100 text-red-800' :
                      item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Sources */}
      {sources && sources.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-gray-100 p-2 rounded-full">
              <ExternalLink className="h-5 w-5 text-gray-600" />
            </div>
            <h3 className="text-base font-medium text-gray-900">Sources</h3>
          </div>
          
          <div className="grid gap-2 sm:grid-cols-2" role="list">
            {sources.map((source: InsightSource, index: number) => (
              <div 
                key={index} 
                role="listitem" 
                className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="bg-white p-1 rounded-full">
                  <ExternalLink className="h-4 w-4 text-blue-500" />
                </div>
                {source.url ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded transition-colors duration-200"
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
        <div className="border-t border-gray-100 pt-4 mt-4">
          {slots.footer}
        </div>
      )}
      </div>
    </div>
  );
}
