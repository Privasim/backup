"use client";

import React, { useState, useEffect } from "react";
import InsightsPanel from "./components/InsightsPanel";
import { useJobRiskData } from './hooks/useJobRiskData';
import { DataDrivenInsights } from '@/components/insights/DataDrivenInsights';
import { useChatbox } from '@/components/chatbox/ChatboxProvider';
import { useProfileIntegration } from '@/components/chatbox/hooks/useProfileIntegration';
import { useOccupationRisk } from '@/hooks/useOccupationRisk';
import { useTaskAutomationData } from '@/hooks/useTaskAutomationData';
import { adaptJobRiskToInsightsVM } from './utils/adaptJobRiskToInsightsVM';

interface ProfileReadiness {
  ready: boolean;
  completionLevel: number;
  missing: string[];
  requirements: {
    minCompletion: number;
    autoTrigger: boolean;
  };
}

interface ResearchData {
  riskScore: number;
  threatDrivers: string[];
  automationExposure: { task: string; exposure: number }[];
  skillImpacts: { skill: string; impact: string; rationale: string }[];
  mitigation: { action: string; priority: string }[];
  sources: { title: string }[];
}

interface Insights {
  // Add properties for insights
}

export default function JobRiskAnalysisTab() {
  const { data: jobRiskData, loading: jobRiskLoading, error: jobRiskError } = useJobRiskData();
  const { profileData, startAnalysis } = useChatbox();
  const { getAnalysisReadiness } = useProfileIntegration();
  const { data: occupationRisk, loading: occupationLoading } = useOccupationRisk();
  const { data: taskAutomation, loading: taskLoading } = useTaskAutomationData();
  const [insights, setInsights] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const profileReadiness = profileData ? getAnalysisReadiness(profileData) : { ready: false, completionLevel: 0, missing: [], requirements: { minCompletion: 0.8, autoTrigger: false } };

  const handleGenerateInsights = async () => {
    if (!profileReadiness.ready) {
      setErrors(['Please complete your profile before generating insights']);
      return;
    }

    setGenerating(true);
    setErrors([]);

    try {
      // Combine research data from hooks
      const researchData = {
        ...occupationRisk,
        ...taskAutomation,
        riskScore: occupationRisk?.riskScore || 0,
        threatDrivers: occupationRisk?.threatDrivers || [],
        automationExposure: taskAutomation?.automationExposure || [],
        skillImpacts: occupationRisk?.skillImpacts || [],
        mitigation: occupationRisk?.mitigation || [],
        sources: [...(occupationRisk?.sources || []), ...(taskAutomation?.sources || [])]
      };

      // Use chatbox to trigger AI analysis
      await startAnalysis(true, researchData);
      
      // Adapt the results to insights view model
      const adaptedInsights = adaptJobRiskToInsightsVM(researchData);
      setInsights(adaptedInsights);
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Failed to generate insights']);
    } finally {
      setGenerating(false);
    }
  };

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
          <div className="p-6">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Risk Analysis</h2>
                  <p className="text-gray-600">Analyze your job risk based on your profile and current market trends</p>
                </div>
                
                <button
                  onClick={handleGenerateInsights}
                  disabled={!profileReadiness.ready || generating}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  title={!profileReadiness.ready ? 'Complete your profile to enable insights' : 'Generate AI-powered job risk insights'}
                >
                  {generating ? 'Generating...' : 'Generate Insights'}
                </button>
              </div>
              
              {!profileReadiness.ready && (
                <div className="text-sm text-amber-600 mb-4">
                  Profile completion: {Math.round(profileReadiness.completionLevel * 100)}% - 
                  {profileReadiness.missing.length > 0 && ` Missing: ${profileReadiness.missing.join(', ')}`}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <DataDrivenInsights 
                  insights={insights}
                  loading={generating}
                  errors={errors}
                  slots={{
                    headerRight: (
                      <div className="text-sm text-gray-500">
                        {profileReadiness.ready ? 'Ready for analysis' : 'Complete profile to unlock'}
                      </div>
                    )
                  }}
                />
              </div>
            </div>

            {/* Legacy component for backward compatibility */}
            <div className="mt-6">
              <InsightsPanel insights={insights} loading={generating} error={errors} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
