'use client';

import { useState } from 'react';
import { useTab } from './TabContext';
import { 
  DocumentTextIcon, // For Business Plan
  CurrencyDollarIcon, // For Financials
  RocketLaunchIcon, // For Go-to-Market
  WrenchScrewdriverIcon, // For Tools
  ChartBarIcon, // For Visualization
} from '@heroicons/react/24/outline';
import { 
  DocumentTextIcon as SolidDocumentTextIcon,
  CurrencyDollarIcon as SolidCurrencyDollarIcon,
  RocketLaunchIcon as SolidRocketLaunchIcon,
  WrenchScrewdriverIcon as SolidWrenchScrewdriverIcon,
  ChartBarIcon as SolidChartBarIcon,
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
} as const;

export default function TabNavigation() {
  const { activeTab, setActiveTab } = useTab();
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  return (
    <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-md mx-auto px-2">
        <div className="flex justify-between items-center h-14 px-1">
          {Object.entries(TabIcons).map(([tabId, { outline: Icon, solid: SolidIcon, label }]) => {
            const isActive = activeTab === tabId;
            const isHovered = hoveredTab === tabId;
            const IconComponent = isActive ? SolidIcon : Icon;
            
            return (
              <button
                key={tabId}
                onClick={() => setActiveTab(tabId)}
                onMouseEnter={() => setHoveredTab(tabId)}
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
