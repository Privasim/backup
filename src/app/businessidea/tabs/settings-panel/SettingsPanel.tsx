"use client";

import React from 'react';
import styles from './settings-panel.module.css';
import { useEffect, useMemo, useState } from 'react';
import { useImplementationPlan } from '@/features/implementation-plan/useImplementationPlan';

type SettingsPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  if (!isOpen) return null;

  const { settings, setSettings } = useImplementationPlan();
  const [prompt, setPrompt] = useState(settings.systemPromptOverride || '');
  const [sourcesText, setSourcesText] = useState('');
  const [usePlaceholder, setUsePlaceholder] = useState(settings.usePlaceholder || false);
  const [simulateStreaming, setSimulateStreaming] = useState(settings.simulateStreaming !== false); // default to true
  const [compactMode, setCompactMode] = useState(settings.compactMode || false);

  useEffect(() => {
    if (isOpen) {
      setPrompt(settings.systemPromptOverride || '');
      setSourcesText((settings.sources || []).join('\n'));
      setUsePlaceholder(settings.usePlaceholder || false);
      setSimulateStreaming(settings.simulateStreaming !== false);
      setCompactMode(settings.compactMode || false);
    }
  }, [isOpen, settings.systemPromptOverride, settings.sources, settings.usePlaceholder, settings.simulateStreaming]);

  const parsedSources = useMemo(() => {
    return sourcesText
      .split(/\n|,/)
      .map(s => s.trim())
      .filter(Boolean);
  }, [sourcesText]);

  const onSave = () => {
    setSettings({ 
      systemPromptOverride: prompt, 
      sources: parsedSources,
      usePlaceholder,
      simulateStreaming,
      compactMode
    });
    onClose();
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.panel} role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <div className={styles.handle} aria-hidden="true" />
        <div className={styles.header}>
          <div className={styles.title} id="settings-title">Settings</div>
        </div>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close settings">
          &times;
        </button>
        <div className={styles.section}>
          <h3 className={styles.heading}>System Prompt</h3>
          <p className={styles.description}>
            Override the base system prompt for implementation plan generation.
          </p>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={6}
            className="mt-2 w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
            placeholder="Provide instructions specific to implementation plans..."
            aria-label="System prompt override"
          />
        </div>
        <div className={styles.section}>
          <h3 className={styles.heading}>Sources</h3>
          <p className={styles.description}>
            One per line (or comma-separated). Example: https://example.com/guide
          </p>
          <textarea
            value={sourcesText}
            onChange={(e) => setSourcesText(e.target.value)}
            rows={5}
            className="mt-2 w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
            placeholder="https://...\nhttps://..."
            aria-label="Sources list"
          />
          {parsedSources.length > 0 && (
            <p className="mt-1 text-xs text-slate-500">{parsedSources.length} source(s) configured</p>
          )}
        </div>
        <div className={styles.section}>
          <h3 className={styles.heading}>Placeholder Settings</h3>
          <div className="flex flex-col gap-2">
            <label className="flex items-center justify-between">
              <span className="text-sm text-slate-800">Use placeholder</span>
              <span className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={usePlaceholder}
                  onChange={(e) => setUsePlaceholder(e.target.checked)}
                  aria-label="Toggle use placeholder"
                />
                <span className="relative h-6 w-11 rounded-full bg-slate-300 transition-colors peer-checked:bg-indigo-600">
                  <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                </span>
              </span>
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-slate-800">Simulate streaming</span>
              <span className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={simulateStreaming}
                  onChange={(e) => setSimulateStreaming(e.target.checked)}
                  aria-label="Toggle simulate streaming"
                />
                <span className="relative h-6 w-11 rounded-full bg-slate-300 transition-colors peer-checked:bg-indigo-600">
                  <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                </span>
              </span>
            </label>
          </div>
        </div>
        <div className={styles.section}>
          <h3 className={styles.heading}>Output Settings</h3>
          <label className="flex items-center justify-between">
            <span className="text-sm text-slate-800">Compact output (limit cards and concise prompt)</span>
            <span className="inline-flex items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={compactMode}
                onChange={(e) => setCompactMode(e.target.checked)}
                aria-label="Toggle compact output"
              />
              <span className="relative h-6 w-11 rounded-full bg-slate-300 transition-colors peer-checked:bg-indigo-600">
                <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
              </span>
            </span>
          </label>
        </div>
        <div className={`${styles.actions} flex items-center justify-end gap-2`}>
          <button onClick={onClose} className="px-3 py-2 text-sm rounded-md border border-slate-200 hover:bg-slate-50">Cancel</button>
          <button onClick={onSave} className="px-3 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700">Save</button>
        </div>
      </div>
    </>
  );
}
