import React from 'react';
import styles from './settings-panel.module.css';

type SettingsPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  if (!isOpen) return null;

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
            Configuration for the AI assistant's behavior
          </p>
        </div>
        <div className={styles.section}>
          <h3 className={styles.heading}>Sources</h3>
          <p className={styles.description}>
            References and data sources used
          </p>
        </div>
      </div>
    </>
  );
}
