'use client';

import { useState } from 'react';
import { useTab, TabId } from './TabContext';
import { 
  DocumentTextIcon, // For Business Plan
  CurrencyDollarIcon, // For Financials
  RocketLaunchIcon, // For Go-to-Market
  WrenchScrewdriverIcon, // For Tools
  ChartBarIcon, // For Visualization
  ListBulletIcon, // For List
  DevicePhoneMobileIcon, // For Mobile
} from '@heroicons/react/24/outline';
import { 
  DocumentTextIcon as SolidDocumentTextIcon,
  CurrencyDollarIcon as SolidCurrencyDollarIcon,
  RocketLaunchIcon as SolidRocketLaunchIcon,
  WrenchScrewdriverIcon as SolidWrenchScrewdriverIcon,
  ChartBarIcon as SolidChartBarIcon,
  ListBulletIcon as SolidListBulletIcon,
  DevicePhoneMobileIcon as SolidDevicePhoneMobileIcon,
} from '@heroicons/react/24/solid';

const TabIcons = {
  businessplan: {
    outline: DocumentTextIcon,
    solid: SolidDocumentTextIcon,
    label: 'Business Plan'
  },
  financials: {
    outline: CurrencyDollarIcon,
    solid: SolidCurrencyDollarIcon,
    label: 'Financials'
  },
  gotomarket: {
    outline: RocketLaunchIcon,
    solid: SolidRocketLaunchIcon,
    label: 'Go-to-Market'
  },
  tools: {
    outline: WrenchScrewdriverIcon,
    solid: SolidWrenchScrewdriverIcon,
    label: 'Tools'
  },
  visualization: {
    outline: ChartBarIcon,
    solid: SolidChartBarIcon,
    label: 'Visualization'
  },
  list: {
    outline: ListBulletIcon,
    solid: SolidListBulletIcon,
    label: 'List'
  },
  mobile: {
    outline: DevicePhoneMobileIcon,
    solid: SolidDevicePhoneMobileIcon,
    label: 'Mobile'
  },
} as const;

export default function TabNavigation() {
  const { activeTab, setActiveTab } = useTab();
  const [hoveredTab, setHoveredTab] = useState<TabId | null>(null);

  return (
    <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100 overflow-x-auto">
      <div className="max-w-3xl mx-auto px-2">
        <div className="flex items-center h-14 px-1 min-w-max">
          {Object.entries(TabIcons).map(([tabId, { outline: Icon, solid: SolidIcon, label }]) => {
            // Type assertion to ensure tabId is a valid TabId
            const typedTabId = tabId as TabId;
            const isActive = activeTab === typedTabId;
            const isHovered = hoveredTab === typedTabId;
            const IconComponent = isActive ? SolidIcon : Icon;
            
            return (
              <button
                key={typedTabId}
                onClick={() => setActiveTab(typedTabId)}
                onMouseEnter={() => setHoveredTab(typedTabId)}
                onMouseLeave={() => setHoveredTab(null)}
                className={`relative flex flex-col items-center justify-center w-full h-12 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'text-indigo-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                aria-label={label}
              >
                <div className={`p-1.5 rounded-lg transition-transform duration-200 ${
                  isActive ? 'scale-110' : isHovered ? 'scale-105' : 'scale-100'
                }`}>
                  <IconComponent className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`} />
                </div>
                <span className={`text-[10px] font-medium mt-1 transition-all duration-200 ${
                  isActive ? 'opacity-100' : 'opacity-0 absolute'
                }`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
