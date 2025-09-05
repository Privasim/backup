"use client";

import React, { PropsWithChildren } from 'react';
import styles from '../jobrisk-theme.module.css';

export interface CardShellProps {
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  headerRight?: React.ReactNode;
  className?: string;
}

export function CardShell({ title, subtitle, footer, headerRight, className, children }: PropsWithChildren<CardShellProps>) {
  return (
    <section className={`${styles.card} ${className ?? ''}`} role="region" aria-label={title ?? 'Card'}>
      {(title || headerRight) && (
        <header className={styles.header}>
          <div>
            {title && <h3 className={styles.title}>{title}</h3>}
            {subtitle && <div className={styles.muted}>{subtitle}</div>}
          </div>
          {headerRight}
        </header>
      )}
      <div className={styles.body}>
        {children}
      </div>
      {footer && (
        <footer className={styles.footer}>
          {footer}
        </footer>
      )}
    </section>
  );
}
