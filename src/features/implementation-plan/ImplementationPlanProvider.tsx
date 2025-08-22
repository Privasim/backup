"use client";

import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import type { ImplementationPlan, PlanSettings, PlanState, PlanStatus } from './types';
import type { StreamingState, ProcessedSection, GenerationPhase } from './streaming/types';
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
  // Streaming state
  streamingState: StreamingState;
  setStreamingState: (state: Partial<StreamingState>) => void;
  updateStreamingProgress: (sections: ProcessedSection[], currentPhase: GenerationPhase, progress: number) => void;
  // External streaming state
  external: {
    source: 'chatbox' | null;
    sourceId: string | null;
    isActive: boolean;
  };
  // External ingestion methods
  ingestExternalStart: (sourceId: string, suggestion: any) => void;
  ingestExternalChunk: (sourceId: string, chunk: string) => void;
  ingestExternalComplete: (sourceId: string, finalRaw: string) => void;
  ingestExternalError: (sourceId: string, message: string) => void;
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

  const [streamingState, setStreamingStateInternal] = useState<StreamingState>({
    rawContent: '',
    processedSections: [],
    currentPhase: 'initializing',
    progress: 0,
    error: null,
    isProcessing: false,
  });

  const [external, setExternal] = useState<{
    source: 'chatbox' | null;
    sourceId: string | null;
    isActive: boolean;
  }>({
    source: null,
    sourceId: null,
    isActive: false,
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

  const setStreamingState = useCallback((updates: Partial<StreamingState>) => {
    setStreamingStateInternal(prev => ({ ...prev, ...updates }));
  }, []);

  const updateStreamingProgress = useCallback((sections: ProcessedSection[], currentPhase: GenerationPhase, progress: number) => {
    setStreamingStateInternal(prev => ({
      ...prev,
      processedSections: sections,
      currentPhase,
      progress,
      isProcessing: true
    }));
  }, []);

  // External ingestion methods
  const ingestExternalStart = useCallback((sourceId: string, suggestion: any) => {
    // Reset state for new external stream
    setState(prev => ({
      ...prev,
      status: 'generating',
      error: undefined,
      rawStream: '',
      plan: undefined,
      selectedSuggestion: suggestion
    }));
    
    setStreamingStateInternal({
      rawContent: '',
      processedSections: [],
      currentPhase: 'initializing',
      progress: 0,
      error: null,
      isProcessing: false
    });
    
    setExternal({
      source: 'chatbox',
      sourceId,
      isActive: true
    });
  }, []);

  const ingestExternalChunk = useCallback((sourceId: string, chunk: string) => {
    // Validate sourceId matches active stream
    if (!external.isActive || external.sourceId !== sourceId) {
      return;
    }
    
    // Append chunk to raw stream
    setState(prev => ({
      ...prev,
      rawStream: (prev.rawStream || '') + chunk
    }));
    
    // Update streaming state with new content
    setStreamingStateInternal(prev => ({
      ...prev,
      rawContent: (prev.rawContent || '') + chunk,
      isProcessing: true
    }));
  }, [external.isActive, external.sourceId]);

  const ingestExternalComplete = useCallback((sourceId: string, finalRaw: string) => {
    // Validate sourceId matches active stream
    if (!external.isActive || external.sourceId !== sourceId) {
      return;
    }
    
    // Update state to completed
    setState(prev => ({
      ...prev,
      status: 'success',
      rawStream: finalRaw
    }));
    
    setStreamingStateInternal(prev => ({
      ...prev,
      rawContent: finalRaw,
      isProcessing: false
    }));
    
    setExternal(prev => ({
      ...prev,
      isActive: false
    }));
  }, [external.isActive, external.sourceId]);

  const ingestExternalError = useCallback((sourceId: string, message: string) => {
    // Update state to error
    setState(prev => ({
      ...prev,
      status: 'error',
      error: message
    }));
    
    setStreamingStateInternal(prev => ({
      ...prev,
      error: message,
      isProcessing: false
    }));
    
    setExternal(prev => ({
      ...prev,
      isActive: false
    }));
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
    streamingState,
    setStreamingState,
    updateStreamingProgress,
    // External streaming
    external,
    ingestExternalStart,
    ingestExternalChunk,
    ingestExternalComplete,
    ingestExternalError,
  }), [state, setStatus, setError, setPlan, setSelectedSuggestion, appendRaw, clearRaw, saveSettings, cachePlan, getCachedPlan, streamingState, setStreamingState, updateStreamingProgress, external, ingestExternalStart, ingestExternalChunk, ingestExternalComplete, ingestExternalError]);

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
