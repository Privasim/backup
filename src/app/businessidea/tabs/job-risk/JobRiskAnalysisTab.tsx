"use client";

import React, { useState } from "react";
import { DataDrivenInsights } from '@/components/insights/DataDrivenInsights';
import { AutomationExposureCard } from '@/components/visualizations/automation-exposure-card';
import { CostComparisonCard } from '@/components/visualizations/cost-comparison-card';
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
import { ConfirmDialog, VisualizationOption } from '@/components/ui/ConfirmDialog';
import QuickActionBar from '@/components/chatbox/QuickActionBar';
import ProfileAnalysisTrigger from '@/components/chatbox/ProfileAnalysisTrigger';
import { KpiTile } from '@/components/insights/infographic/kpi-tile';
import { RingProgress } from '@/components/insights/infographic/ring-progress';

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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [lastResearchData, setLastResearchData] = useState<ResearchData | null>(null);
  const [visualizationSelections, setVisualizationSelections] = useState<VisualizationSelections>({});
  const [visualizationLoadStates, setVisualizationLoadStates] = useState<VisualizationLoadState>({});
  const [visualizationErrors, setVisualizationErrors] = useState<Record<string, string>>({});
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

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
    // Reset visualization states for heavy visuals
    setVisualizationLoadStates({});
    setVisualizationErrors({});

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
      
      // Show confirmation modal for visualizations
      setShowConfirmModal(true);
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Failed to generate insights']);
      chatboxDebug.error('backend-analysis', 'Failed to generate insights', {
        message: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setGenerating(false);
    }
  };
  
  const handleVisualizationConfirm = (selections: Record<string, boolean>) => {
    setVisualizationSelections(selections);
    
    // Start loading selected visualizations for heavy visuals only
    loadSelectedVisualizations(selections);
  };
  
  const loadSelectedVisualizations = async (selections: Record<string, boolean>) => {
    // Only proceed if we have research data
    if (!lastResearchData) {
      chatboxDebug.error('visualization-loading', 'No research data available');
      return;
    }
    
    // Get only the heavy visual keys that are selected
    const selectedHeavyVisuals = Object.keys(selections).filter(key => selections[key]);
    if (selectedHeavyVisuals.length === 0) {
      return;
    }
    
    // Update load states for selected heavy visualizations using immutable updates
    setVisualizationLoadStates(prev => {
      const newStates = { ...prev };
      selectedHeavyVisuals.forEach(key => {
        newStates[key] = 'loading';
      });
      return newStates;
    });
    
    // Start backend analysis if not already started
    if (!analysisStarted) {
      try {
        chatboxDebug.info('backend-analysis', 'Starting backend analysis for visualizations');
        await startAnalysis(true, lastResearchData);
        chatboxDebug.success('backend-analysis', 'Backend analysis started');
        setAnalysisStarted(true);
      } catch (error) {
        chatboxDebug.error('backend-analysis', 'Failed to start backend analysis', {
          message: error instanceof Error ? error.message : String(error)
        });
        
        // Set errors for all selected heavy visualizations using immutable updates
        setVisualizationLoadStates(prev => {
          const newStates = { ...prev };
          selectedHeavyVisuals.forEach(key => {
            newStates[key] = 'error';
          });
          return newStates;
        });
        
        setVisualizationErrors(prev => {
          const newErrors = { ...prev };
          selectedHeavyVisuals.forEach(key => {
            newErrors[key] = 'Failed to start analysis';
          });
          return newErrors;
        });
        return;
      }
    }
    
    // Process each heavy visualization with proper error handling and immutable updates
    for (const key of selectedHeavyVisuals) {
      try {
        // Simulate API call with timeout for heavy visuals
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setVisualizationLoadStates(prev => ({
          ...prev,
          [key]: 'success'
        }));
      } catch (error) {
        chatboxDebug.error('visualization-loading', `Failed to load visualization: ${key}`, {
          message: error instanceof Error ? error.message : String(error)
        });
        
        setVisualizationLoadStates(prev => ({
          ...prev,
          [key]: 'error'
        }));
        
        setVisualizationErrors(prev => ({
          ...prev,
          [key]: `Failed to load ${key} data`
        }));
      }
    }
  };
  
  const handleResumeAnalysis = () => {
    setShowConfirmModal(true);
  };

  // Define visualization options for the confirmation modal (heavy visuals only)
  const visualizationOptions: VisualizationOption[] = [
    // Add heavy visual options here when available
    // Example:
    // {
    //   id: 'marketTrends',
    //   label: 'Market Trends Analysis',
    //   description: 'Deep analysis of market trends and future projections',
    //   selected: visualizationSelections.marketTrends || false
    // }
  ];

  return (
    <>
      <PromptSettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <ConfirmDialog
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleVisualizationConfirm}
        title="Generate Advanced Visualizations"
        description="Select which visualizations you'd like to generate. This will perform additional analysis and may take a moment."
        confirmLabel="Generate Selected"
        cancelLabel="Skip for Now"
        visualizationOptions={visualizationOptions}
      />
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
                    Profile completion: {Math.round(profileReadiness.completionLevel)}% -
                    {profileReadiness.missing.length > 0 && ` Missing: ${profileReadiness.missing.join(', ')}`}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {insights && (
                  <div className="lg:col-span-2">
                    {/* KPI header: infographic-style */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Risk Score Ring */}
                      <div className="card-elevated p-3 sm:p-4 flex items-center justify-center">
                        <RingProgress
                          value={typeof insights?.riskScore === 'number' ? Math.max(0, Math.min(100, Math.round(insights.riskScore))) : 0}
                          label="Risk Score"
                        />
                      </div>
                      {/* Tasks Assessed */}
                      <KpiTile
                        title="Tasks Assessed"
                        value={Array.isArray(insights?.automationExposure) ? insights.automationExposure.length : 0}
                        emphasis="neutral"
                      />
                      {/* High-risk tasks (>= 70%) */}
                      <KpiTile
                        title="High-risk Tasks"
                        value={Array.isArray(insights?.automationExposure) ? insights.automationExposure.filter((i: any) => typeof i?.exposure === 'number' && i.exposure >= 70).length : 0}
                        caption=">= 70% exposure"
                        emphasis="error"
                      />
                      {/* Average Exposure */}
                      <KpiTile
                        title="Avg Exposure"
                        value={`${(() => {
                          const items = Array.isArray(insights?.automationExposure) ? insights.automationExposure : [];
                          const valid = items.filter((i: any) => typeof i?.exposure === 'number');
                          if (valid.length === 0) return 0;
                          const total = valid.reduce((sum: number, i: any) => sum + i.exposure, 0);
                          return Math.round(total / valid.length);
                        })()}%`}
                        emphasis="warning"
                      />
                    </div>
                  </div>
                )}
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
                      ),
                      footer: insights && !analysisStarted ? (
                        <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                          <p className="text-sm text-gray-700">Want to see more detailed visualizations?</p>
                          <button
                            onClick={handleResumeAnalysis}
                            className="mt-2 px-4 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-all"
                          >
                            Generate Visualizations
                          </button>
                        </div>
                      ) : null
                    }}
                  />
                </div>
                
                {insights && (
                  <div className="lg:col-span-2">
                    <CostComparisonCard 
                      insights={insights}
                      profileLocation={profileData?.profile?.location}
                      title="Human vs AI Cost Comparison"
                      loading={false}
                      error={undefined}
                    />
                  </div>
                )}

                {insights && (
                  <div className="lg:col-span-2">
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
