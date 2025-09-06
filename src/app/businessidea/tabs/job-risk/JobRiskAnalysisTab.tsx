"use client";

import React, { useState } from "react";
import { AutomationExposureCard } from '@/components/visualizations/automation-exposure-card';
import { CostComparisonCard } from '@/components/visualizations/cost-comparison-card';
import { CareerRiskSummaryCard } from '@/components/visualizations/career-risk-summary-card';
import { useChatbox } from '@/components/chatbox/ChatboxProvider';
import { useProfileIntegration } from '@/components/chatbox/hooks/useProfileIntegration';
import { adaptFormDataToUserProfile } from '@/components/chatbox/utils/profile-transformation';
import { useRealOccupationRisk } from '@/hooks/useRealOccupationRisk';
import { useRealTaskAutomationData } from '@/hooks/useRealTaskAutomationData';
import { ResearchServiceProvider } from '@/lib/research/ResearchServiceProvider';
import { adaptJobRiskToInsightsVM } from './utils/adaptJobRiskToInsightsVM';
import { chatboxDebug } from '@/app/businessidea/utils/logStore';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { InsightsPromptProvider, useInsightsPrompt } from '@/components/insights/prompt/prompt-settings-context';
import { PromptSettingsDialog } from '@/components/insights/prompt/prompt-settings-dialog';
import { generateNarratives } from '@/components/insights/prompt/narrative-service';
import { MitigationItem } from '@/components/insights/types';
import QuickActionBar from '@/components/chatbox/QuickActionBar';
import ProfileAnalysisTrigger from '@/components/chatbox/ProfileAnalysisTrigger';
import { KpiTile } from '@/components/insights/infographic/kpi-tile';
import { RingProgress } from '@/components/insights/infographic/ring-progress';
import { JobRiskVisualScope } from './design/visual-governor';
import { useTimedProgress } from './hooks/useTimedProgress';
import { useStaggeredReveal } from './hooks/useStaggeredReveal';
import { AnalysisProgressBar } from './components/AnalysisProgressBar';
import { PROGRESS_MESSAGES } from './progress-messages';

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

interface VisualizationLoadState {
  // Only track heavy visuals that need backend analysis
  [key: string]: 'idle' | 'loading' | 'success' | 'error';
}

interface VisualizationSelections {
  // Only track heavy visuals that need backend analysis
  [key: string]: boolean;
}

interface Insights {
  // Add properties for insights
}

const JobRiskAnalysisContent = () => {
  const { profileData, startAnalysis, config } = useChatbox();
  const { getAnalysisReadiness } = useProfileIntegration();
  const { data: occupationRisk, loading: occupationLoading } = useRealOccupationRisk();
  const { data: taskAutomation, loading: taskLoading } = useRealTaskAutomationData();
  const { settings: promptSettings } = useInsightsPrompt();
  const [insights, setInsights] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lastResearchData, setLastResearchData] = useState<ResearchData | null>(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // Timed progress and staggered reveal state
  const { running, progress, elapsedSeconds, start: startProgress, reset: resetProgress } = useTimedProgress();
  const { revealedCount, focusedItem, begin: beginReveal, reset: resetReveal } = useStaggeredReveal(1000);

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
    // Reset progress and reveal
    resetProgress();
    resetReveal();
    // Start 10s progress immediately; when done, reveal visualization sections (5):
    // 1) Career risk summary, 2) Cost projection, 3) Industry radar, 4) Cost treemap, 5) Automation exposure
    startProgress(10000, () => {
      const totalSections = 5;
      beginReveal(totalSections);
    });

    try {
      // Combine research data from hooks
      const researchData: ResearchData = {
        riskScore: occupationRisk?.riskScore,
        threatDrivers: occupationRisk?.threatDrivers,
        automationExposure: taskAutomation?.automationExposure,
        skillImpacts: occupationRisk?.skillImpacts,
        mitigation: (occupationRisk?.mitigation || []).map((action: string) => ({ action, priority: 'medium' as const })),
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
      
      // Adapt the results to insights view model, including AI data if available
      const adaptedInsights = adaptJobRiskToInsightsVM(researchData, aiData);
      setInsights(adaptedInsights);
      
      // Store research data for later use in visualizations
      setLastResearchData(researchData);
      
      // Cards will be revealed after the progress completes via onComplete callback
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
      <JobRiskVisualScope>
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
                <div className="flex justify-end mb-2">
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
                    Profile completion: {Math.round(profileReadiness.completionLevel)}% -
                    {profileReadiness.missing.length > 0 && ` Missing: ${profileReadiness.missing.join(', ')}`}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {insights && revealedCount >= 1 && (
                  <div 
                    id="reveal-section-1"
                    className={`lg:col-span-2 transition-all duration-500 ease-out transform animate-fade-in motion-reduce:animate-none ${focusedItem === 1 ? 'ring-4 ring-blue-400 shadow-lg rounded-lg' : ''}`}
                  >
                    <CareerRiskSummaryCard
                      insights={insights}
                      title="Career Risk Summary"
                      loading={false}
                      error={undefined}
                    />
                  </div>
                )}

                {insights && revealedCount >= 2 && (
                  <div 
                    id="reveal-section-2"
                    className={`lg:col-span-2 transition-all duration-500 ease-out transform animate-fade-in motion-reduce:animate-none ${focusedItem === 2 ? 'ring-4 ring-blue-400 shadow-lg rounded-lg' : ''}`}
                  >
                    <CostComparisonCard 
                      insights={insights}
                      profileLocation={profileData?.profile?.location}
                      title="Human vs AI Cost Comparison"
                      loading={false}
                      error={undefined}
                      revealBaseIndex={2}
                      currentReveal={revealedCount}
                    />
                  </div>
                )}

                {insights && revealedCount >= 5 && (
                  <div 
                    id="reveal-section-5"
                    className={`lg:col-span-2 transition-all duration-500 ease-out transform animate-fade-in motion-reduce:animate-none ${focusedItem === 5 ? 'ring-4 ring-blue-400 shadow-lg rounded-lg' : ''}`}
                  >
                    <AutomationExposureCard 
                      insights={insights}
                      title="Automation Exposure Risk"
                      topN={8}
                      minExposure={10}
                      loading={false}
                      error={undefined}
                    />
                  </div>
                )}
              </div>
              {/* Analysis trigger integrated with quick actions */}
              <div className="space-y-2">
                {profileData && (
                  <ProfileAnalysisTrigger 
                    profileData={adaptFormDataToUserProfile(profileData)!}
                    variant="button"
                    size="md"
                    className={`w-full transition-all duration-300 ${analysisComplete ? 'opacity-60' : ''}`}
                    contextText={{
                      idle: 'Analyze Job Risk',
                      analyzing: 'Analyzing Industry Trends...',
                      complete: 'Explore Business Ideas'
                    }}
                    onAnalysisComplete={() => setAnalysisComplete(true)}
                  />
                )}
                <div className={`transition-all duration-500 ${analysisComplete ? 'border-t border-gray-200 pt-4' : ''}`}>
                  <QuickActionBar 
                    className={`${analysisComplete ? 'animate-fade-in' : ''}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
        {/* Bottom progress bar */}
        <AnalysisProgressBar
          running={running}
          progress={progress}
          elapsedSeconds={elapsedSeconds}
          totalSeconds={10}
          messages={PROGRESS_MESSAGES}
        />
      </JobRiskVisualScope>
    </>
  );
};

export default function JobRiskAnalysisTab() {
  return (
    <ResearchServiceProvider>
      <InsightsPromptProvider>
        <JobRiskAnalysisContent />
      </InsightsPromptProvider>
    </ResearchServiceProvider>
  );
}
