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

  // Sync local form state with context when opened
  useEffect(() => {
    if (isOpen) {
      setPrompt(settings.systemPromptOverride || '');
      setSourcesText((settings.sources || []).join('\n'));
    }
  }, [isOpen, settings.systemPromptOverride, settings.sources]);

  const parsedSources = useMemo(() => {
    return sourcesText
      .split(/\n|,/)
      .map(s => s.trim())
      .filter(Boolean);
  }, [sourcesText]);

  const onSave = () => {
    setSettings({ systemPromptOverride: prompt, sources: parsedSources });
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
        <div className="flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 text-sm rounded-md border border-slate-200 hover:bg-slate-50">Cancel</button>
          <button onClick={onSave} className="px-3 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700">Save</button>
        </div>
      </div>
    </>
  );
}
