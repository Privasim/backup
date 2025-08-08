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
    <div className="rounded-lg border border-gray-200 p-4 bg-white">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-gray-900">Spec-Driven UI Generator</h3>
        <div className="flex items-center gap-2">
          <label htmlFor="ui-model" className="text-xs text-gray-600">Model</label>
          <select
            id="ui-model"
            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedModel}
            onChange={onModelChange}
          >
            {availableModels.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stepper */}
      <div className="mb-3 flex items-center gap-3 text-xs">
        <div className={`flex items-center gap-2 ${stage === 'spec' ? 'text-blue-700' : 'text-gray-600'}`}>
          <div className={`h-5 w-5 rounded-full text-white text-[10px] flex items-center justify-center ${stage === 'spec' ? 'bg-blue-600' : 'bg-gray-400'}`}>1</div>
          <span>Design Spec</span>
        </div>
        <div className="h-px flex-1 bg-gray-200" />
        <div className={`flex items-center gap-2 ${stage === 'code' ? 'text-blue-700' : 'text-gray-600'}`}>
          <div className={`h-5 w-5 rounded-full text-white text-[10px] flex items-center justify-center ${stage === 'code' ? 'bg-blue-600' : 'bg-gray-400'}`}>2</div>
          <span>Code Generation</span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <label htmlFor="ui-prompt" className="block text-xs text-gray-600">Describe the mobile screen you want to generate</label>
        <textarea
          id="ui-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A login screen with email and password fields, primary continue button, and a small forgot password link"
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!canSubmit}
            className={`rounded-md px-4 py-2 text-sm text-white ${canSubmit ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
            aria-disabled={!canSubmit}
          >
            {specStatus === 'loading' ? 'Generating Spec…' : (codeStatus === 'loading' ? 'Generating Code…' : 'Generate Spec')}
          </button>
          {(specStatus === 'loading' || codeStatus === 'loading') && (
            <button
              type="button"
              onClick={() => (stage === 'spec' ? cancelSpec() : cancelCode())}
              className="rounded-md px-3 py-2 text-sm bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              Stop
            </button>
          )}
          <button
            type="button"
            onClick={onClear}
            disabled={specStatus === 'loading' || codeStatus === 'loading' || prompt.length === 0}
            className={`rounded-md px-3 py-2 text-sm ${prompt.length ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            Clear
          </button>
        </div>
      </form>

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
    </div>
  );
}
