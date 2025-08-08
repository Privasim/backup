'use client';

import { useState } from 'react';
import MobileSettingsPanel from './mobile-settings-panel/MobileSettingsPanel';
import UIPromptBox from './ui-prompt/UIPromptBox';
import { PromptBox } from './PromptBox';

export default function MobileTab() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Mobile Studio
            </h1>
            <p className="text-sm text-slate-600">Design and generate mobile interfaces with AI</p>
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl hover:bg-white/90 hover:border-slate-300/60 transition-all duration-200 shadow-sm hover:shadow-md group"
          >
            <svg className="w-4 h-4 text-slate-600 group-hover:text-slate-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm font-medium text-slate-700">Settings</span>
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* System Prompt Panel */}
          <div className="lg:col-span-1">
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
          </div>

          {/* UI Generation Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-slate-800">UI Generator</h3>
              </div>
              <UIPromptBox />
            </div>
          </div>
        </div>
      </div>

      <MobileSettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
