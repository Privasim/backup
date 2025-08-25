'use client';

import React from 'react';
import { useArtifactSubTab, type ArtifactSubTabId } from '../context/ArtifactSubTabContext';
import { CodeBracketIcon, EyeIcon } from '@heroicons/react/24/outline';
import { CodeBracketIcon as SolidCodeBracketIcon, EyeIcon as SolidEyeIcon } from '@heroicons/react/24/solid';

interface ArtifactSubTabNavigationProps {
  compileStatus?: 'idle' | 'compiling' | 'success' | 'error';
  runtimeErrors?: number;
}

const subTabConfig = {
  code: {
    id: 'code' as ArtifactSubTabId,
    label: 'Code',
    icon: CodeBracketIcon,
    solidIcon: SolidCodeBracketIcon,
  },
  preview: {
    id: 'preview' as ArtifactSubTabId,
    label: 'Preview',
    icon: EyeIcon,
    solidIcon: SolidEyeIcon,
  },
} as const;

export function ArtifactSubTabNavigation({ 
  compileStatus = 'idle',
  runtimeErrors = 0 
}: ArtifactSubTabNavigationProps) {
  const { activeSubTab, setActiveSubTab } = useArtifactSubTab();

  const getStatusIndicator = (tabId: ArtifactSubTabId) => {
    if (tabId === 'code') {
      // Code tab status based on compilation
      if (compileStatus === 'compiling') {
        return <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />;
      }
      if (compileStatus === 'success') {
        return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      }
      if (compileStatus === 'error') {
        return <div className="w-2 h-2 bg-red-500 rounded-full" />;
      }
      return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
    }

    if (tabId === 'preview') {
      // Preview tab status based on runtime errors
      if (runtimeErrors > 0) {
        return <div className="w-2 h-2 bg-red-500 rounded-full" />;
      }
      if (compileStatus === 'success') {
        return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      }
      return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
    }

    return null;
  };

  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="flex h-12 px-4">
        {Object.values(subTabConfig).map((tab) => {
          const isActive = activeSubTab === tab.id;
          const Icon = isActive ? tab.solidIcon : tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${
                isActive
                  ? 'text-blue-600 border-blue-500 bg-white'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-100'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {getStatusIndicator(tab.id)}
            </button>
          );
        })}
      </div>
    </div>
  );
}