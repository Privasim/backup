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
      <div className={styles.panel}>
        <button className={styles.closeButton} onClick={onClose}>
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
            className="mt-2 w-full rounded-md border border-slate-200 p-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
            placeholder="Provide instructions specific to implementation plans..."
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
            className="mt-2 w-full rounded-md border border-slate-200 p-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
            placeholder="https://...\nhttps://..."
          />
          {parsedSources.length > 0 && (
            <p className="mt-1 text-xs text-slate-500">{parsedSources.length} source(s) configured</p>
          )}
        </div>
        <div className={styles.section}>
          <h3 className={styles.heading}>Placeholder Settings</h3>
          <div className="flex items-center gap-2">
            <label>
              <input 
                type="checkbox" 
                checked={usePlaceholder} 
                onChange={(e) => setUsePlaceholder(e.target.checked)} 
              />
              Use placeholder
            </label>
            <label>
              <input 
                type="checkbox" 
                checked={simulateStreaming} 
                onChange={(e) => setSimulateStreaming(e.target.checked)} 
              />
              Simulate streaming
            </label>
          </div>
        </div>
        <div className={styles.section}>
          <h3 className={styles.heading}>Output Settings</h3>
          <div className="flex items-center gap-2">
            <label>
              <input 
                type="checkbox" 
                checked={compactMode} 
                onChange={(e) => setCompactMode(e.target.checked)} 
              />
              Compact output (limit cards and concise prompt)
            </label>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 text-sm rounded-md border border-slate-200 hover:bg-slate-50">Cancel</button>
          <button onClick={onSave} className="px-3 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700">Save</button>
        </div>
      </div>
    </>
  );
}
