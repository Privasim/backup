'use client';

import { useState } from 'react';
import MobileSettingsPanel from './mobile-settings-panel/MobileSettingsPanel';
import UIPromptBox from './ui-prompt/UIPromptBox';
import { PromptBox } from './PromptBox';

export default function MobileTab() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4">
      <div className="max-w-5xl mx-auto min-h-[100dvh] flex flex-col space-y-4">
        {/* System Prompt - kept at the top */}
        <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
            <h3 className="text-lg font-semibold text-slate-800">System Prompt</h3>
          </div>
          <PromptBox
            className="space-y-3"
            placeholder="Define AI behavior and response style..."
            maxLength={800}
            showLabel={false}
            showReset={true}
          />
        </div>

        {/* UI Generation Panel - full height section with mobile sticky prompt inside */}
        <div className="flex-1 min-h-0">
          <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-0 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4 p-5 sm:p-0">
              <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
              <h3 className="text-lg font-semibold text-slate-800">UI Generator</h3>
            </div>
            <div className="flex-1 min-h-0">
              <UIPromptBox />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Settings Button to preserve functionality without a fixed header */}
      <button
        onClick={() => setIsSettingsOpen(true)}
        className="fixed bottom-4 right-4 z-30 inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200/60 shadow-sm hover:shadow-md hover:bg-white transition-all duration-200"
        aria-label="Open settings"
      >
        <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      <MobileSettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
