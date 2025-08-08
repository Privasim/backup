"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useDesignSpec } from './useDesignSpec';
import { useCodeGeneration } from './useCodeGeneration';
import DesignSpecPanel from './DesignSpecPanel';
import CodePreviewPanel from './CodePreviewPanel';
import { useChatboxSettings } from '@/components/chatbox/utils/settings-utils';
import { getAvailableModels } from '@/lib/openrouter';

export default function UIPromptBox() {
  // Stage A: Design Spec
  const {
    status: specStatus,
    error: specError,
    spec,
    streamText: specStream,
    metrics: specMetrics,
    generate: generateSpec,
    cancel: cancelSpec,
  } = useDesignSpec();

  // Stage B: Code Bundle
  const {
    status: codeStatus,
    error: codeError,
    bundle,
    streamText: codeStream,
    metrics: codeMetrics,
    generate: generateCode,
    cancel: cancelCode,
  } = useCodeGeneration();

  const [prompt, setPrompt] = useState('');
  const settings = useChatboxSettings();
  const availableModels = useMemo(() => getAvailableModels(), []);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [stage, setStage] = useState<'spec' | 'code'>('spec');

  // Initialize local model selection: prefer persisted UI-prompt selection,
  // else Chatbox default model, else first available.
  useEffect(() => {
    let initial = '';
    try {
      const persisted = localStorage.getItem('ui-prompt:selected-model') || '';
      if (persisted && availableModels.includes(persisted)) initial = persisted;
    } catch {}
    if (!initial) {
      const chatboxDefault = settings.getPreferences()?.defaultModel;
      if (chatboxDefault && availableModels.includes(chatboxDefault)) initial = chatboxDefault;
    }
    if (!initial) initial = availableModels[0];
    setSelectedModel(initial);
  }, [availableModels, settings]);

  const canSubmit = prompt.trim().length >= 3 && specStatus !== 'loading' && codeStatus !== 'loading';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    // Always start at Stage A
    setStage('spec');
    await generateSpec(prompt, { model: selectedModel });
  };

  const onClear = () => {
    setPrompt('');
  };

  const onModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedModel(value);
    try {
      localStorage.setItem('ui-prompt:selected-model', value);
    } catch {}
  };

  return (
    <div className="flex flex-col h-full">
      {/* Main Display Area - Takes most of the space */}
      <div className="flex-1 p-5">
        {/* Stage A Panel */}
        {stage === 'spec' && (
          <DesignSpecPanel
            status={specStatus}
            error={specError}
            spec={spec}
            streamText={specStream}
            metrics={specMetrics}
            onApprove={async () => {
              if (!spec) return;
              setStage('code');
              await generateCode(spec, { model: selectedModel });
            }}
            onRegenerate={async () => {
              await generateSpec(prompt, { model: selectedModel });
            }}
            onCancel={specStatus === 'loading' ? () => cancelSpec() : undefined}
          />
        )}

        {/* Stage B Panel */}
        {stage === 'code' && (
          <CodePreviewPanel
            status={codeStatus}
            error={codeError}
            bundle={bundle}
            streamText={codeStream}
            metrics={codeMetrics}
            onBack={() => setStage('spec')}
          />
        )}

        {/* Empty State */}
        {stage === 'spec' && !spec && !specStream && specStatus === 'idle' && (
          <div className="flex items-center justify-center h-full min-h-[40vh]">
            <div className="text-center">
              <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Mobile Studio</h3>
              <p className="text-sm text-slate-500 max-w-md">
                Describe your mobile interface below and watch it come to life with AI-powered design and code generation.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Compact Bottom Controls */}
      <div className="border-t border-slate-200/60 bg-slate-50/50 backdrop-blur-sm p-4">
        {/* Compact Header with Stepper and Model */}
        <div className="flex items-center justify-between mb-3">
          {/* Compact Stepper */}
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 ${stage === 'spec' ? 'text-blue-600' : 'text-slate-400'}`}>
              <div className={`w-5 h-5 rounded-full text-white text-xs font-medium flex items-center justify-center transition-all duration-200 ${
                stage === 'spec' ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm' : 'bg-slate-300'
              }`}>1</div>
              <span className="text-xs font-medium">Spec</span>
            </div>
            <div className="w-6 h-px bg-slate-200" />
            <div className={`flex items-center gap-1.5 ${stage === 'code' ? 'text-emerald-600' : 'text-slate-400'}`}>
              <div className={`w-5 h-5 rounded-full text-white text-xs font-medium flex items-center justify-center transition-all duration-200 ${
                stage === 'code' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-sm' : 'bg-slate-300'
              }`}>2</div>
              <span className="text-xs font-medium">Code</span>
            </div>
          </div>

          {/* Compact Model Selection */}
          <div className="flex items-center gap-2">
            <label htmlFor="ui-model" className="text-xs font-medium text-slate-600">Model</label>
            <select
              id="ui-model"
              className="rounded-lg border border-slate-200/60 bg-white/80 backdrop-blur-sm px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-400/60 transition-all duration-200"
              value={selectedModel}
              onChange={onModelChange}
            >
              {availableModels.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Compact Form */}
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="relative">
            <textarea
              id="ui-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your mobile interface (e.g., modern login screen with email/password fields...)"
              rows={2}
              className="w-full rounded-lg border border-slate-200/60 bg-white/80 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-400/60 focus:bg-white/90 resize-none transition-all duration-200"
            />
            <div className="absolute bottom-2 right-2 text-xs text-slate-400">
              {prompt.length}/500
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={!canSubmit}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                canSubmit 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm hover:shadow-md' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
              aria-disabled={!canSubmit}
            >
              {specStatus === 'loading' || codeStatus === 'loading' ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {specStatus === 'loading' ? 'Generating...' : 'Coding...'}
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate
                </>
              )}
            </button>

            {(specStatus === 'loading' || codeStatus === 'loading') && (
              <button
                type="button"
                onClick={() => (stage === 'spec' ? cancelSpec() : cancelCode())}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all duration-200"
              >
                Stop
              </button>
            )}

            <button
              type="button"
              onClick={onClear}
              disabled={specStatus === 'loading' || codeStatus === 'loading' || prompt.length === 0}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                prompt.length && specStatus !== 'loading' && codeStatus !== 'loading'
                  ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                  : 'bg-slate-50 text-slate-300 cursor-not-allowed'
              }`}
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
