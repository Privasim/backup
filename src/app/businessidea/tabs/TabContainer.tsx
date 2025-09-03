'use client';

import { useEffect } from 'react';
import { TabProvider, useTab, type TabId } from './TabContext';
import TabNavigation from './TabNavigation';
import BusinessPlanContent from './BusinessPlanContent';
import FinancialsContent from './FinancialsContent';
import ToolsContent from './ToolsContent';
import VisualizationContent from './VisualizationContent';
import ListTab from './ListTab';
import MobileTab from './MobileTab';
import { SpecsContent } from './SpecsContent';
import ImplementationPlanTab from './ImplementationPlanTab';
import { ImplementationPlanProvider, useImplementationPlanContext } from '@/features/implementation-plan/ImplementationPlanProvider';
import { SpecsGeneratorProvider } from '@/features/specs-generator/SpecsGeneratorProvider';
import { useChatbox } from '@/components/chatbox/ChatboxProvider';
import { getPlanStreamBridge } from '@/features/implementation-plan/bridge/PlanStreamBridge';
import BridgeConnector from './BridgeConnector';
import UserProfileTab from './user-profile';
import JobRiskAnalysisTab from './job-risk';
import GoToMarketV2Content from './GoToMarketV2Content';
import ArtifactStudio from './artifact-studio';
import ImageEditor from './image-editor';

const tabComponents = {
  businessplan: BusinessPlanContent,
  userprofile: UserProfileTab,
  tools: ToolsContent,
  jobrisk: JobRiskAnalysisTab,
  list: ListTab,
  mobile: MobileTab,
  'gotomarket-v2': GoToMarketV2Content,
  'artifact-studio': ArtifactStudio,
  specs: SpecsContent,
  'implementation-plan': ImplementationPlanTab,
  'image-editor': ImageEditor,
} as const;

function TabContent({ onTabChange }: { onTabChange?: (tab: TabId) => void }) {
  const { activeTab } = useTab();
  const ActiveComponent = tabComponents[activeTab as keyof typeof tabComponents] || tabComponents.businessplan;

  useEffect(() => {
    if (onTabChange) onTabChange(activeTab);
  }, [activeTab, onTabChange]);

  return (
    <div className="max-w-4xl mx-auto h-[625px] overflow-y-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-full">
        <ActiveComponent />
      </div>
    </div>
  );
}

function TabContainerContent({ onTabChange }: { onTabChange?: (tab: TabId) => void }) {
  return (
    <ImplementationPlanProvider>
      <SpecsGeneratorProvider>
        <BridgeConnector />
        <div className="space-y-1">
          <TabNavigation />
          <TabContent onTabChange={onTabChange} />
        </div>
      </SpecsGeneratorProvider>
    </ImplementationPlanProvider>
  );
}

export default function TabContainer({ initialTab, onTabChange }: { initialTab?: string; onTabChange?: (tab: TabId) => void }) {
  const safeInitialTab = initialTab === 'financials' || initialTab === 'visualization' ? 'businessplan' : initialTab;
  return (
    <TabProvider initialTab={safeInitialTab}>
      <TabContainerContent onTabChange={onTabChange} />
    </TabProvider>
  );
}
