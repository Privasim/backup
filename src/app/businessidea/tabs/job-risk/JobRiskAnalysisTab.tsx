"use client";

import React, { useState } from "react";
import { DataDrivenInsights } from '@/components/insights/DataDrivenInsights';
import { AutomationExposureCard } from '@/components/visualizations/automation-exposure-card';
import { CostComparisonCard } from '@/components/visualizations/cost-comparison-card';
import { useChatbox } from '@/components/chatbox/ChatboxProvider';
import { useProfileIntegration } from '@/components/chatbox/hooks/useProfileIntegration';
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
  costComparison: 'idle' | 'loading' | 'success' | 'error';
  automationExposure: 'idle' | 'loading' | 'success' | 'error';
}

interface VisualizationSelections {
  costComparison: boolean;
  automationExposure: boolean;
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
  const [visualizationSelections, setVisualizationSelections] = useState<VisualizationSelections>({
    costComparison: true,
    automationExposure: true
  });
  const [visualizationLoadStates, setVisualizationLoadStates] = useState<VisualizationLoadState>({
    costComparison: 'idle',
    automationExposure: 'idle'
  });
  const [visualizationErrors, setVisualizationErrors] = useState<Record<string, string>>({});
  const [analysisStarted, setAnalysisStarted] = useState(false);

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
    // Reset visualization states
    setVisualizationLoadStates({
      costComparison: 'idle',
      automationExposure: 'idle'
    });
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
    setVisualizationSelections({
      costComparison: !!selections.costComparison,
      automationExposure: !!selections.automationExposure
    });
    
    // Start loading selected visualizations
    loadSelectedVisualizations(selections);
  };
  
  const loadSelectedVisualizations = async (selections: Record<string, boolean>) => {
    // Only proceed if we have research data
    if (!lastResearchData) {
      chatboxDebug.error('visualization-loading', 'No research data available');
      return;
    }
    
    // Update load states for selected visualizations
    const newLoadStates = { ...visualizationLoadStates };
    if (selections.costComparison) {
      newLoadStates.costComparison = 'loading';
    }
    if (selections.automationExposure) {
      newLoadStates.automationExposure = 'loading';
    }
    setVisualizationLoadStates(newLoadStates);
    
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
        // Set errors for all selected visualizations
        const newErrors = { ...visualizationErrors };
        if (selections.costComparison) {
          newErrors.costComparison = 'Failed to start analysis';
          newLoadStates.costComparison = 'error';
        }
        if (selections.automationExposure) {
          newErrors.automationExposure = 'Failed to start analysis';
          newLoadStates.automationExposure = 'error';
        }
        setVisualizationErrors(newErrors);
        setVisualizationLoadStates(newLoadStates);
        return;
      }
    }
    
    // Load cost comparison data if selected
    if (selections.costComparison) {
      try {
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 1500));
        newLoadStates.costComparison = 'success';
      } catch (error) {
        chatboxDebug.error('visualization-loading', 'Failed to load cost comparison', {
          message: error instanceof Error ? error.message : String(error)
        });
        newLoadStates.costComparison = 'error';
        setVisualizationErrors(prev => ({
          ...prev,
          costComparison: 'Failed to load cost comparison data'
        }));
      }
    }
    
    // Load automation exposure data if selected
    if (selections.automationExposure) {
      try {
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 2000));
        newLoadStates.automationExposure = 'success';
      } catch (error) {
        chatboxDebug.error('visualization-loading', 'Failed to load automation exposure', {
          message: error instanceof Error ? error.message : String(error)
        });
        newLoadStates.automationExposure = 'error';
        setVisualizationErrors(prev => ({
          ...prev,
          automationExposure: 'Failed to load automation exposure data'
        }));
      }
    }
    
    setVisualizationLoadStates(newLoadStates);
  };
  
  const handleResumeAnalysis = () => {
    setShowConfirmModal(true);
  };

  // Define visualization options for the confirmation modal
  const visualizationOptions: VisualizationOption[] = [
    {
      id: 'costComparison',
      label: 'Human vs AI Cost Comparison',
      description: 'Compare the cost of human labor vs AI automation for your job role',
      selected: visualizationSelections.costComparison
    },
    {
      id: 'automationExposure',
      label: 'Automation Exposure Risk',
      description: 'Analyze which tasks in your job are most susceptible to automation',
      selected: visualizationSelections.automationExposure
    }
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
                
                {insights && visualizationSelections.costComparison && (
                  <div className="lg:col-span-2">
                    <CostComparisonCard 
                      insights={insights}
                      profileLocation={profileData?.profile?.location}
                      title="Human vs AI Cost Comparison"
                      loading={visualizationLoadStates.costComparison === 'loading'}
                      error={visualizationErrors.costComparison}
                    />
                  </div>
                )}

                {insights && visualizationSelections.automationExposure && (
                  <div className="lg:col-span-2">
                    <AutomationExposureCard 
                      insights={insights}
                      title="Automation Exposure Risk"
                      topN={8}
                      minExposure={10}
                      loading={visualizationLoadStates.automationExposure === 'loading'}
                      error={visualizationErrors.automationExposure}
                    />
                  </div>
                )}
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
