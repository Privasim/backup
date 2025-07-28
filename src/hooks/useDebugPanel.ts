'use client';

import { useState, useEffect } from 'react';
import { debugLogger } from '@/lib/debug/logger';

export const useDebugPanel = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);

  useEffect(() => {
    const unsubscribe = debugLogger.subscribe((logs) => {
      const errorCount = logs.filter(log => log.level === 'error').length;
      setHasErrors(errorCount > 0);
    });

    return unsubscribe;
  }, []);

  const togglePanel = () => {
    setIsVisible(!isVisible);
  };

  const showPanel = () => {
    setIsVisible(true);
  };

  const hidePanel = () => {
    setIsVisible(false);
  };

  return {
    isVisible,
    hasErrors,
    togglePanel,
    showPanel,
    hidePanel
  };
};