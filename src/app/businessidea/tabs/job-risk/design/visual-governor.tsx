"use client";

import React, { PropsWithChildren } from 'react';
import styles from './jobrisk-theme.module.css';
import { getDesignSpec, emphasisColor, formatters } from './jobrisk-visual-spec';

export { getDesignSpec, emphasisColor, formatters };

export function JobRiskVisualScope({ children, className }: PropsWithChildren<{ className?: string }>) {
  // Scope container to isolate CSS variables to JobRisk visuals only
  return (
    <div className={`${styles.scope} ${className ?? ''}`}>
      {children}
    </div>
  );
}
