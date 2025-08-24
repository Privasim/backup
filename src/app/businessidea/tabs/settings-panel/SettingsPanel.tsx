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
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <svg className={styles.titleIcon} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.929 1.115l1.598-.54a1 1 0 011.186.447l1.18 2.044a1 1 0 01-.205 1.251l-1.267 1.113a7.047 7.047 0 010 2.228l1.267 1.113a1 1 0 01.205 1.251l-1.18 2.044a1 1 0 01-1.186.447l-1.598-.54a6.993 6.993 0 01-1.929 1.115l-.33 1.652a1 1 0 01-.98.804H8.82a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.929-1.115l-1.598.54a1 1 0 01-1.186-.447l-1.18-2.044a1 1 0 01.205-1.251l1.267-1.114a7.05 7.05 0 010-2.227L1.821 7.773a1 1 0 01-.205-1.251l1.18-2.044a1 1 0 011.186-.447l1.598.54A6.993 6.993 0 017.51 3.456l.33-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              <h2 className={styles.title} id="settings-title">Settings</h2>
            </div>
            <button className={styles.closeButton} onClick={onClose} aria-label="Close settings">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <svg className={styles.sectionIcon} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className={styles.heading}>System Prompt</h3>
                <p className={styles.description}>
                  Override the base system prompt for implementation plan generation
                </p>
              </div>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className={styles.textarea}
              placeholder="Provide instructions specific to implementation plans..."
              aria-label="System prompt override"
            />
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <svg className={styles.sectionIcon} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className={styles.heading}>Sources</h3>
                <p className={styles.description}>
                  One per line or comma-separated URLs
                </p>
              </div>
            </div>
            <textarea
              value={sourcesText}
              onChange={(e) => setSourcesText(e.target.value)}
              rows={3}
              className={styles.textarea}
              placeholder="https://example.com/guide&#10;https://docs.example.com"
              aria-label="Sources list"
            />
            {parsedSources.length > 0 && (
              <div className={styles.sourcesCount}>
                <svg className={styles.countIcon} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {parsedSources.length} source{parsedSources.length !== 1 ? 's' : ''} configured
              </div>
            )}
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <svg className={styles.sectionIcon} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className={styles.heading}>Development Options</h3>
                <p className={styles.description}>
                  Configure development and testing features
                </p>
              </div>
            </div>
            <div className={styles.toggleGroup}>
              <label className={styles.toggleItem}>
                <div className={styles.toggleLabel}>
                  <span className={styles.toggleTitle}>Use placeholder</span>
                  <span className={styles.toggleDesc}>Show placeholder content during development</span>
                </div>
                <div className={styles.toggle}>
                  <input
                    type="checkbox"
                    className={styles.toggleInput}
                    checked={usePlaceholder}
                    onChange={(e) => setUsePlaceholder(e.target.checked)}
                    aria-label="Toggle use placeholder"
                  />
                  <span className={styles.toggleSlider}>
                    <span className={styles.toggleThumb} />
                  </span>
                </div>
              </label>
              
              <label className={styles.toggleItem}>
                <div className={styles.toggleLabel}>
                  <span className={styles.toggleTitle}>Simulate streaming</span>
                  <span className={styles.toggleDesc}>Enable streaming simulation for testing</span>
                </div>
                <div className={styles.toggle}>
                  <input
                    type="checkbox"
                    className={styles.toggleInput}
                    checked={simulateStreaming}
                    onChange={(e) => setSimulateStreaming(e.target.checked)}
                    aria-label="Toggle simulate streaming"
                  />
                  <span className={styles.toggleSlider}>
                    <span className={styles.toggleThumb} />
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <svg className={styles.sectionIcon} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className={styles.heading}>Output Settings</h3>
                <p className={styles.description}>
                  Control how results are displayed
                </p>
              </div>
            </div>
            <label className={styles.toggleItem}>
              <div className={styles.toggleLabel}>
                <span className={styles.toggleTitle}>Compact output</span>
                <span className={styles.toggleDesc}>Limit cards and use concise prompts</span>
              </div>
              <div className={styles.toggle}>
                <input
                  type="checkbox"
                  className={styles.toggleInput}
                  checked={compactMode}
                  onChange={(e) => setCompactMode(e.target.checked)}
                  aria-label="Toggle compact output"
                />
                <span className={styles.toggleSlider}>
                  <span className={styles.toggleThumb} />
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className={styles.actions}>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={onSave} className={styles.saveButton}>
            <svg className={styles.buttonIcon} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}
