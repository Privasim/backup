'use client';

import { useEffect } from 'react';
import { TabProvider, useTab, type TabId } from './TabContext';
import TabNavigation from './TabNavigation';
import BusinessPlanContent from './BusinessPlanContent';
import FinancialsContent from './FinancialsContent';
import GoToMarketContent from './GoToMarketContent';
import ToolsContent from './ToolsContent';
import VisualizationContent from './VisualizationContent';
import ListTab from './ListTab';
import MobileTab from './MobileTab';
import { ImplementationPlanProvider, useImplementationPlanContext } from '@/features/implementation-plan/ImplementationPlanProvider';
import { useChatbox } from '@/components/chatbox/ChatboxProvider';
import { getPlanStreamBridge } from '@/features/implementation-plan/bridge/PlanStreamBridge';
import BridgeConnector from './BridgeConnector';
import UserProfileTab from './user-profile';
import JobRiskAnalysisTab from './job-risk';

const tabComponents = {
  businessplan: BusinessPlanContent,
  userprofile: UserProfileTab,
  financials: FinancialsContent,
  gotomarket: GoToMarketContent,
  tools: ToolsContent,
  visualization: VisualizationContent,
  jobrisk: JobRiskAnalysisTab,
  list: ListTab,
  mobile: MobileTab,
} as const;

function TabContent({ onTabChange }: { onTabChange?: (tab: TabId) => void }) {
  const { activeTab } = useTab();
  const ActiveComponent = tabComponents[activeTab as keyof typeof tabComponents];

  useEffect(() => {
    if (onTabChange) onTabChange(activeTab);
  }, [activeTab, onTabChange]);

  return (
    <div className="max-w-4xl mx-auto h-[500px] overflow-y-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-full">
        <ActiveComponent />
      </div>
    </div>
  );
}

function TabContainerContent({ onTabChange }: { onTabChange?: (tab: TabId) => void }) {
  return (
    <ImplementationPlanProvider>
      <BridgeConnector />
      <div className="space-y-4">
        <TabNavigation />
        <TabContent onTabChange={onTabChange} />
      </div>
    </ImplementationPlanProvider>
  );
}

export default function TabContainer({ initialTab, onTabChange }: { initialTab?: string; onTabChange?: (tab: TabId) => void }) {
  return (
    <TabProvider initialTab={initialTab}>
      <TabContainerContent onTabChange={onTabChange} />
    </TabProvider>
  );
}
