"use client";

import React from 'react';
import styles from '../jobrisk-theme.module.css';
import { Emphasis, emphasisColor } from '../jobrisk-visual-spec';

export interface KpiMiniProps {
  title: string;
  value: number | string;
  caption?: string;
  emphasis?: Emphasis;
  className?: string;
}

export const KpiMini: React.FC<KpiMiniProps> = ({ title, value, caption, emphasis = 'primary', className }) => {
  const color = emphasisColor(emphasis);
  return (
    <div className={`${styles.kpi} ${className ?? ''}`} role="group" aria-label={`KPI ${title}`}>
      <div className={styles.kpiTitle}>{title}</div>
      <div className={styles.kpiValue} style={{ color }}>{value}</div>
      {caption && <div className={styles.kpiCaption}>{caption}</div>}
    </div>
  );
};
