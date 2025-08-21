'use client';

import React, { useEffect, useMemo } from 'react';
import { TabProvider, useTab } from '../tabs/TabContext';
import UserProfileTab from '../tabs/user-profile';
import JobRiskAnalysisTab from '../tabs/job-risk';
import BusinessPlanContent from '../tabs/BusinessPlanContent';
import { ImplementationPlanProvider } from '@/features/implementation-plan/ImplementationPlanProvider';
import { getProfileSettingsTab, setProfileSettingsTab, type ProfileSettingsTab } from '../tabs/utils/tab-state';

const localTabs = ['userprofile', 'jobrisk', 'businessplan'] as const;
type LocalTabId = typeof localTabs[number];

function LocalTabNav() {
  const { activeTab, setActiveTab } = useTab();
  const items: { id: LocalTabId; label: string }[] = [
    { id: 'userprofile', label: 'User Profile' },
    { id: 'jobrisk', label: 'Job Risk' },
    { id: 'businessplan', label: 'Business Plan' },
  ];

  return (
    <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <div className="flex items-center gap-2 h-12 px-2">
        {items.map(({ id, label }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={[
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100'
              ].join(' ')}
              aria-current={isActive ? 'page' : undefined}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LocalTabContent() {
  const { activeTab } = useTab();

  useEffect(() => {
    if (localTabs.includes(activeTab as LocalTabId)) {
      setProfileSettingsTab(activeTab as ProfileSettingsTab);
    }
  }, [activeTab]);

  if (activeTab === 'userprofile') {
    return (
      <div className="max-w-4xl mx-auto h-[500px] overflow-y-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-full">
          <UserProfileTab />
        </div>
      </div>
    );
  }

  if (activeTab === 'jobrisk') {
    return (
      <div className="max-w-4xl mx-auto h-[500px] overflow-y-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-full">
          <JobRiskAnalysisTab />
        </div>
      </div>
    );
  }

  // businessplan
  return (
    <div className="max-w-4xl mx-auto h-[500px] overflow-y-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-full">
        <ImplementationPlanProvider>
          <BusinessPlanContent />
        </ImplementationPlanProvider>
      </div>
    </div>
  );
}

export default function ProfileSettingsTabs() {
  const initialTab = useMemo(() => getProfileSettingsTab() || 'userprofile', []);

  return (
    <TabProvider initialTab={initialTab}>
      <div className="space-y-4">
        <LocalTabNav />
        <LocalTabContent />
      </div>
    </TabProvider>
  );
}
