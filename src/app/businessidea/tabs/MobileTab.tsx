'use client';

import { useState } from 'react';

import MobileSettingsTrigger from './mobile-settings-panel/MobileSettingsTrigger';
import MobileSettingsPanel from './mobile-settings-panel/MobileSettingsPanel';
import UIPromptBox from './ui-prompt/UIPromptBox';


export default function MobileTab() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="p-6 max-w-4xl mx-auto relative">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Mobile App View</h2>
        <MobileSettingsTrigger onClick={() => setIsSettingsOpen(true)} />

        <div className="space-y-6">
          <UIPromptBox />
        </div>
      </div>
      <MobileSettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

    </div>
  );
}
