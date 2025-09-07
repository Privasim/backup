'use client';

import { useState } from 'react';
import { useTab, TabId } from './TabContext';
import { 
  CurrencyDollarIcon, // For Financials
  RocketLaunchIcon, // For Go-to-Market
  WrenchScrewdriverIcon, // For Tools
  ChartBarIcon, // For Visualization
  DocumentTextIcon, // For List (changed from ListBulletIcon)
  CubeIcon, // For Artifact Studio
  ListBulletIcon, // For the new list icon
  ClipboardDocumentListIcon, // For Specs
  ClipboardDocumentCheckIcon, // For Implementation Plan
  PhotoIcon // For Image Editor
} from '@heroicons/react/24/outline';
import { 
  CurrencyDollarIcon as SolidCurrencyDollarIcon,
  RocketLaunchIcon as SolidRocketLaunchIcon,
  WrenchScrewdriverIcon as SolidWrenchScrewdriverIcon,
  ChartBarIcon as SolidChartBarIcon,
  DocumentTextIcon as SolidDocumentTextIcon,
  CubeIcon as SolidCubeIcon,
  ListBulletIcon as SolidListBulletIcon,
  ClipboardDocumentListIcon as SolidClipboardDocumentListIcon,
  ClipboardDocumentCheckIcon as SolidClipboardDocumentCheckIcon,
  PhotoIcon as SolidPhotoIcon,
} from '@heroicons/react/24/solid';

const TabIcons = {
  'image-editor': {
    outline: PhotoIcon,
    solid: SolidPhotoIcon,
    label: 'Images'
  },
  'implementation-plan': {
    outline: ClipboardDocumentCheckIcon,
    solid: SolidClipboardDocumentCheckIcon,
    label: 'Plan'
  },
  tools: {
    outline: WrenchScrewdriverIcon,
    solid: SolidWrenchScrewdriverIcon,
    label: 'Tools'
  },
  'gotomarket-v2': {
    outline: RocketLaunchIcon,
    solid: SolidRocketLaunchIcon,
    label: 'Go-to-Market'
  },
  'artifact-studio': {
    outline: CubeIcon,
    solid: SolidCubeIcon,
    label: 'Artifact'
  },
  specs: {
    outline: ClipboardDocumentListIcon,
    solid: SolidClipboardDocumentListIcon,
    label: 'Specs'
  },
} as const;

export default function TabNavigation() {
  const { activeTab, setActiveTab } = useTab();
  const [hoveredTab, setHoveredTab] = useState<TabId | null>(null);

  return (
    <div className="sticky top-0 z-1 w-full">
      <div className="w-full bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center h-12 px-4 w-full">
          {Object.entries(TabIcons).filter(([tabId]) => tabId !== 'artifact-studio' && tabId !== 'list').map(([tabId, { outline: Icon, solid: SolidIcon, label }]) => {
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
