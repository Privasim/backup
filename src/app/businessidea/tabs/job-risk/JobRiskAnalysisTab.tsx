"use client";

import React, { useState } from "react";
import { DataDrivenInsights } from '@/components/insights/DataDrivenInsights';
import { useChatbox } from '@/components/chatbox/ChatboxProvider';
import { useProfileIntegration } from '@/components/chatbox/hooks/useProfileIntegration';
import { useOccupationRisk } from '@/hooks/useOccupationRisk';
import { useTaskAutomationData } from '@/hooks/useTaskAutomationData';
import { adaptJobRiskToInsightsVM } from './utils/adaptJobRiskToInsightsVM';
import { chatboxDebug } from '@/app/businessidea/utils/logStore';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { InsightsPromptProvider, useInsightsPrompt } from '@/components/insights/prompt/prompt-settings-context';
import { PromptSettingsDialog } from '@/components/insights/prompt/prompt-settings-dialog';
import { generateNarratives } from '@/components/insights/prompt/narrative-service';
import { MitigationItem } from '@/components/insights/types';

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
  riskScore?: number;
  threatDrivers?: string[];
  automationExposure?: { task: string; exposure: number }[];
  skillImpacts?: { skill: string; impact: 'high' | 'medium' | 'low'; rationale?: string }[];
  mitigation?: { action: string; priority: 'high' | 'medium' | 'low' }[];
  sources?: { title: string; url?: string }[];
}

interface Insights {
  // Add properties for insights
}

const JobRiskAnalysisContent = () => {
  const { profileData, startAnalysis, config } = useChatbox();
  const { getAnalysisReadiness } = useProfileIntegration();
  const { data: occupationRisk, loading: occupationLoading } = useOccupationRisk();
  const { data: taskAutomation, loading: taskLoading } = useTaskAutomationData();
  const { settings: promptSettings } = useInsightsPrompt();
  const [insights, setInsights] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const profileReadiness = profileData ? getAnalysisReadiness(profileData) : { ready: false, completionLevel: 0, missing: [], requirements: { minCompletion: 0.8, autoTrigger: false } };

  const handleGenerateInsights = async () => {
    chatboxDebug.info('backend-analysis', 'Generate Insights clicked');
    if (!profileReadiness.ready) {
      setErrors(['Please complete your profile before generating insights']);
      chatboxDebug.warn('backend-analysis', 'Profile not ready for analysis', {
        completionLevel: profileReadiness.completionLevel,
        missing: profileReadiness.missing
      });
      return;
    }

    setGenerating(true);
    setErrors([]);

    try {
      // Combine research data from hooks
      const researchData: ResearchData = {
        riskScore: occupationRisk?.riskScore,
        threatDrivers: occupationRisk?.threatDrivers,
        automationExposure: taskAutomation?.automationExposure,
        skillImpacts: occupationRisk?.skillImpacts,
        mitigation: occupationRisk?.mitigation,
        sources: [
          ...(occupationRisk?.sources || []), 
          ...(taskAutomation?.sources || [])
        ]
      };

      chatboxDebug.debug('backend-analysis', 'Prepared research data', {
        riskScore: researchData.riskScore,
        threatDrivers: researchData.threatDrivers?.length || 0,
        automationExposure: researchData.automationExposure?.length || 0,
        skillImpacts: researchData.skillImpacts?.length || 0,
        mitigation: researchData.mitigation?.length || 0,
        sources: researchData.sources?.length || 0
      });

      // Generate narratives using the new service
      let aiData: { summary?: string; mitigation?: MitigationItem[]; narratives?: any } | undefined = undefined;
      if (config.model && config.apiKey) {
        chatboxDebug.info('backend-analysis', 'Generating narratives with LLM', {
          model: config.model,
          settings: promptSettings
        });
        
        const narrativeResult = await generateNarratives({
          researchData,
          settings: promptSettings,
          model: config.model,
          apiKey: config.apiKey
        });
        
        if (narrativeResult.data) {
          aiData = {
            summary: narrativeResult.data.narratives?.riskNarrative || narrativeResult.data.summary,
            mitigation: narrativeResult.data.mitigation,
            narratives: narrativeResult.data.narratives
          };
          chatboxDebug.success('backend-analysis', 'Narratives generated successfully');
        } else {
          chatboxDebug.warn('backend-analysis', 'Failed to generate narratives', {
            error: narrativeResult.error
          });
        }
      } else {
        chatboxDebug.warn('backend-analysis', 'No model or API key available for narrative generation');
      }

      // Use chatbox to trigger AI analysis
      chatboxDebug.info('backend-analysis', 'Starting backend analysis');
      await startAnalysis(true, researchData);
      chatboxDebug.success('backend-analysis', 'Backend analysis started');
      
      // Adapt the results to insights view model, including AI data if available
      const adaptedInsights = adaptJobRiskToInsightsVM(researchData, aiData);
      setInsights(adaptedInsights);
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Failed to generate insights']);
      chatboxDebug.error('backend-analysis', 'Failed to generate insights', {
        message: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <PromptSettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
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
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsSettingsOpen(true)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                      title="Configure narrative settings"
                    >
                      <Cog6ToothIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleGenerateInsights}
                      disabled={!profileReadiness.ready || generating}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      title={!profileReadiness.ready ? 'Complete your profile to enable insights' : 'Generate AI-powered job risk insights'}
                    >
                      {generating ? 'Generating...' : 'Generate Insights'}
                    </button>
                  </div>
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
                          {profileReadiness.ready ? `Preset: ${promptSettings.name}` : 'Complete profile to unlock'}
                        </div>
                      )
                    }}
                  />
                </div>
              </div>

              {/* Legacy component for backward compatibility */}
              {/* Legacy InsightsPanel removed to prevent duplicate rendering */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default function JobRiskAnalysisTab() {
  return (
    <InsightsPromptProvider>
      <JobRiskAnalysisContent />
    </InsightsPromptProvider>
  );
}
