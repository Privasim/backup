"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useUIGeneration } from './useUIGeneration';
import UIWireframeRenderer from './UIWireframeRenderer';
import { useChatboxSettings } from '@/components/chatbox/utils/settings-utils';
import { getAvailableModels } from '@/lib/openrouter';

export default function UIPromptBox() {
  const { status, error, result, streamText, metrics, generate, cancel } = useUIGeneration();
  const [prompt, setPrompt] = useState('');
  const settings = useChatboxSettings();
  const availableModels = useMemo(() => getAvailableModels(), []);
  const [selectedModel, setSelectedModel] = useState<string>('');

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

  const canSubmit = prompt.trim().length >= 3 && status !== 'loading';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    await generate(prompt, { model: selectedModel });
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
        <h3 className="text-base font-semibold text-gray-900">Prompt UI Generator</h3>
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
            {status === 'loading' ? 'Generating…' : 'Generate UI'}
          </button>
          {status === 'loading' && (
            <button
              type="button"
              onClick={cancel}
              className="rounded-md px-3 py-2 text-sm bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              Stop
            </button>
          )}
          <button
            type="button"
            onClick={onClear}
            disabled={status === 'loading' || prompt.length === 0}
            className={`rounded-md px-3 py-2 text-sm ${prompt.length ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            Clear
          </button>
        </div>
      </form>

      {/* Streaming console */}
      {(status === 'loading' || streamText.length > 0) && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-700">Live JSON</span>
            <span className="text-[10px] text-gray-500">
              {metrics.startedAt ? `${Math.max(0, (metrics.lastChunkAt || Date.now()) - metrics.startedAt)}ms` : ''}
              {` • ${metrics.tokenCount} chunks • ${metrics.bytes} bytes`}
            </span>
          </div>
          <pre
            className="max-h-48 overflow-auto rounded-md border border-gray-200 bg-gray-50 p-2 text-xs text-gray-800"
            aria-live="polite"
          >{streamText}</pre>
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4">
          <UIWireframeRenderer screen={result} />
        </div>
      )}
    </div>
  );
}
