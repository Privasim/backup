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
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (errors.length > 0) {
    return (
      <div className="p-4 rounded-lg border border-red-200 bg-red-50">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <h3 className="text-sm font-medium text-red-800">Analysis Error</h3>
        </div>
        <ul className="mt-2 text-sm text-red-700">
          {errors.map((error: string, index: number) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="p-8 text-center text-gray-500">
        <Zap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium mb-2">No insights available</h3>
        <p className="text-sm">Generate insights to see your job risk analysis</p>
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
    <div className="space-y-6">
      {slots?.headerRight && (
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Job Risk Insights</h2>
          {slots.headerRight}
        </div>
      )}

      {/* Summary Section */}
      {summary && (
        <div className="p-4 rounded-lg border bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
          <div className="flex items-center space-x-2 mb-3">
            <Shield className="h-5 w-5 text-red-600" />
            <h3 className="text-sm font-medium text-red-800">Executive Summary</h3>
          </div>
          <p className="text-sm text-red-700">{summary}</p>
          {riskScore !== undefined && (
            <div className="mt-3 flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <span className="text-2xl font-bold text-red-600">{riskScore}</span>
                <span className="text-sm text-red-600">/100</span>
              </div>
              <div className="flex-1 bg-red-200 rounded-full h-2">
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
          <h3 className="text-sm font-medium mb-3">Key Threat Drivers</h3>
          <div className="space-y-2">
            {threatDrivers.map((driver: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
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
          <h3 className="text-sm font-medium mb-3">Automation Exposure</h3>
          <div className="space-y-3">
            {automationExposure.map((item: AutomationExposureItem, index: number) => (
              <div key={index} className="flex justify-between items-center">
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
                  <span className="text-xs text-gray-600 w-8 text-right">{item.exposure}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skill Impacts */}
      {skillImpacts && skillImpacts.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3">Skill Impact Analysis</h3>
          <div className="space-y-3">
            {skillImpacts.map((item: SkillImpactItem, index: number) => (
              <div key={index} className="p-3 rounded-lg border bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{item.skill}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.impact === 'high' ? 'bg-red-100 text-red-800' :
                    item.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {item.impact.toUpperCase()}
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
          <h3 className="text-sm font-medium mb-3">Mitigation Strategies</h3>
          <div className="space-y-3">
            {mitigation.map((item: MitigationItem, index: number) => (
              <div key={index} className="p-3 rounded-lg border bg-blue-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">{item.action}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.priority === 'high' ? 'bg-red-100 text-red-800' :
                    item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {item.priority.toUpperCase()}
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
          <h3 className="text-sm font-medium mb-3">Sources</h3>
          <div className="space-y-2">
            {sources.map((source: InsightSource, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4 text-gray-400" />
                <a 
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {source.title}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {slots?.footer && (
        <div className="border-t pt-4">
          {slots.footer}
        </div>
      )}
    </div>
  );
}
