"use client";

import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import type { ImplementationPlan, PlanSettings, PlanState, PlanStatus } from './types';
import { loadSettings, saveSettings as persistSettings, loadCachedPlan, saveCachedPlan } from './storage';

interface ImplementationPlanContextValue extends PlanState {
  setStatus: (s: PlanStatus) => void;
  setError: (e?: string) => void;
  setPlan: (p?: ImplementationPlan) => void;
  setSelectedSuggestion: (s?: any) => void;
  appendRaw: (chunk: string) => void;
  clearRaw: () => void;
  saveSettings: (settings: Partial<PlanSettings>) => void;
  cachePlan: (ideaId: string, settingsKey: string, plan: ImplementationPlan) => void;
  getCachedPlan: (ideaId: string, settingsKey: string) => ImplementationPlan | undefined;
}

const ImplementationPlanContext = createContext<ImplementationPlanContextValue | null>(null);

export const ImplementationPlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PlanState>({
    status: 'idle',
    error: undefined,
    rawStream: '',
    plan: undefined,
    selectedSuggestion: undefined,
    settings: loadSettings(),
  });

  const setStatus = useCallback((s: PlanStatus) => setState(prev => ({ ...prev, status: s })), []);
  const setError = useCallback((e?: string) => setState(prev => ({ ...prev, error: e })), []);
  const setPlan = useCallback((p?: ImplementationPlan) => setState(prev => ({ ...prev, plan: p })), []);
  const setSelectedSuggestion = useCallback((s?: any) => setState(prev => ({ ...prev, selectedSuggestion: s })), []);

  const appendRaw = useCallback((chunk: string) => setState(prev => ({ ...prev, rawStream: (prev.rawStream || '') + chunk })), []);
  const clearRaw = useCallback(() => setState(prev => ({ ...prev, rawStream: '' })), []);

  const saveSettings = useCallback((settings: Partial<PlanSettings>) => {
    setState(prev => {
      const next = { ...prev, settings: { ...prev.settings, ...settings } };
      persistSettings(next.settings);
      return next;
    });
  }, []);

  const cachePlan = useCallback((ideaId: string, settingsKey: string, plan: ImplementationPlan) => {
    saveCachedPlan(ideaId, settingsKey, plan);
  }, []);

  const getCachedPlan = useCallback((ideaId: string, settingsKey: string) => {
    return loadCachedPlan(ideaId, settingsKey);
  }, []);

  const value = useMemo<ImplementationPlanContextValue>(() => ({
    ...state,
    setStatus,
    setError,
    setPlan,
    setSelectedSuggestion,
    appendRaw,
    clearRaw,
    saveSettings,
    cachePlan,
    getCachedPlan,
  }), [state, setStatus, setError, setPlan, setSelectedSuggestion, appendRaw, clearRaw, saveSettings, cachePlan, getCachedPlan]);

  return (
    <ImplementationPlanContext.Provider value={value}>
      {children}
    </ImplementationPlanContext.Provider>
  );
};

export const useImplementationPlanContext = () => {
  const ctx = useContext(ImplementationPlanContext);
  if (!ctx) throw new Error('useImplementationPlanContext must be used within ImplementationPlanProvider');
  return ctx;
};
