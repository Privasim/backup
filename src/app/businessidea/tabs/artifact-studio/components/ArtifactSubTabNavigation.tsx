'use client';

import React from 'react';
import { useArtifactSubTab, type ArtifactSubTabId } from '../context/ArtifactSubTabContext';
import { CodeBracketIcon, EyeIcon } from '@heroicons/react/24/outline';
import { CodeBracketIcon as SolidCodeBracketIcon, EyeIcon as SolidEyeIcon } from '@heroicons/react/24/solid';
import { WireframeInteractivityResult } from '../utils/sandbox-html';

interface ArtifactSubTabNavigationProps {
  compileStatus?: 'idle' | 'compiling' | 'success' | 'error';
  runtimeErrors?: number;
  interactivity?: WireframeInteractivityResult;
  retryCount?: number;
  cacheHit?: boolean;
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
  runtimeErrors = 0,
  interactivity,
  retryCount = 0,
  cacheHit = false
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

  const getInteractivityBadge = () => {
    if (!interactivity) return null;

    const badgeConfig = {
      interactive: { color: 'bg-green-100 text-green-800', label: 'Interactive' },
      partial: { color: 'bg-yellow-100 text-yellow-800', label: 'Partial' },
      static: { color: 'bg-gray-100 text-gray-800', label: 'Static' }
    };

    const config = badgeConfig[interactivity.level];
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
        {interactivity.score > 0 && (
          <span className="ml-1 text-xs opacity-75">
            {interactivity.score}%
          </span>
        )}
      </span>
    );
  };

  const getStatusBadges = () => {
    const badges = [];
    
    if (cacheHit) {
      badges.push(
        <span key="cache" className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Cached
        </span>
      );
    }
    
    if (retryCount > 0) {
      badges.push(
        <span key="retry" className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          Retry {retryCount}
        </span>
      );
    }
    
    return badges;
  };

  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="flex items-center justify-between h-8 px-2">
        <div className="flex">
          {Object.values(subTabConfig).map((tab) => {
            const isActive = activeSubTab === tab.id;
            const Icon = isActive ? tab.solidIcon : tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium transition-all duration-200 border-b-2 ${
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
        
        {/* Status badges */}
        <div className="flex items-center space-x-2">
          {getInteractivityBadge()}
          {getStatusBadges()}
        </div>
      </div>
    </div>
  );
}