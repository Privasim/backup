'use client';

import { TabProvider, useTab } from './TabContext';
import TabNavigation from './TabNavigation';
import BusinessPlanContent from './BusinessPlanContent';
import FinancialsContent from './FinancialsContent';
import GoToMarketContent from './GoToMarketContent';
import ToolsContent from './ToolsContent';
import VisualizationContent from './VisualizationContent';

const tabComponents = {
  businessplan: BusinessPlanContent,
  financials: FinancialsContent,
  gotomarket: GoToMarketContent,
  tools: ToolsContent,
  visualization: VisualizationContent,
} as const;

function TabContent() {
  const { activeTab } = useTab();
  const ActiveComponent = tabComponents[activeTab as keyof typeof tabComponents];

  return (
    <div className="max-w-4xl mx-auto h-[500px] overflow-y-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-full">
        <ActiveComponent />
      </div>
    </div>
  );
}

export default function TabContainer() {
  return (
    <TabProvider>
      <div className="space-y-4">
        <TabNavigation />
        <TabContent />
      </div>
    </TabProvider>
  );
}
