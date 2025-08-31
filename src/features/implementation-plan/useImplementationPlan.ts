"use client";

import { useCallback, useMemo, useRef } from 'react';
import { useImplementationPlanContext } from './ImplementationPlanProvider';
import { settingsHash } from './storage';
// Legacy import kept for potential backward compatibility
import { TextGenerationService } from './textGenerationService';
import type { ImplementationPlan } from './types';
import { useChatbox } from '@/components/chatbox/ChatboxProvider';

export const useImplementationPlan = () => {
  const ctx = useImplementationPlanContext();
  const { config } = useChatbox();
  const abortRef = useRef<AbortController | null>(null);

  const currentSettingsKey = useMemo(() => settingsHash({
    systemPromptOverride: ctx.settings.systemPromptOverride || '',
    sources: Array.isArray(ctx.settings.sources) ? ctx.settings.sources : [],
    compactMode: ctx.settings.compactMode || false,
    compactMaxPhaseCards: ctx.settings.compactMaxPhaseCards || 4,
    lengthPreset: ctx.settings.lengthPreset || 'long'
  }), [ctx.settings]);

  // Check if externally driven
  const isExternallyDriven = useMemo(() => {
    return ctx.external?.isActive && ctx.external?.source === 'chatbox';
  }, [ctx.external]);

  const cancel = useCallback(() => {
    // If externally driven, don't cancel internal generation
    if (isExternallyDriven) {
      return;
    }
    
    abortRef.current?.abort();
    ctx.setStatus('idle');
    ctx.setStreamingState({
      isProcessing: false,
      currentPhase: 'initializing',
      progress: 0
    });
  }, [ctx, isExternallyDriven]);

  const generate = useCallback(async (suggestion: any, visualizationType?: string) => {
    // If externally driven, don't start internal generation
    if (isExternallyDriven) {
      return;
    }
    
    ctx.setSelectedSuggestion(suggestion);

    // Try cache first
    const ideaId = suggestion?.id || suggestion?.title || 'idea';
    const cached = ctx.getCachedPlan(ideaId, currentSettingsKey);
    if (cached) {
      ctx.setPlan(cached as ImplementationPlan);
      ctx.setStatus('success');
      return;
    }

    // Reset streaming state
    ctx.setStreamingState({
      rawContent: '',
      processedSections: [],
      currentPhase: 'initializing',
      progress: 0,
      error: null,
      isProcessing: true
    });

    // Prepare API credentials
    const apiKey = config.apiKey || '';
    const model = config.model || 'qwen/qwen3-coder:free';
    if (!apiKey) {
      ctx.setError('Missing OpenRouter API key. Please configure it in Chatbox controls.');
      ctx.setStatus('error');
      ctx.setStreamingState({ error: 'Missing API key', isProcessing: false });
      return;
    }

    // Abort controller
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    ctx.setError(undefined);
    ctx.clearRaw();
    ctx.setPlan(undefined);
    ctx.setStatus('generating');

    try {
      // Use new text generation service
      const textService = new TextGenerationService(apiKey);
      
      const planSettings = {
        ...ctx.settings,
        model,
        apiKey,
        visualizationType: visualizationType || ctx.settings.visualizationType
      };
      
      const plan = await textService.generatePlan(
        suggestion,
        planSettings,
        (chunk: string) => {
          ctx.appendRaw(chunk);
          if (ctx.status !== 'streaming') ctx.setStatus('streaming');
        }
      );
      
      if (!plan) throw new Error('Failed to generate implementation plan.');

      ctx.setPlan(plan);
      ctx.cachePlan(ideaId, currentSettingsKey, plan);
      ctx.setStatus('success');
      
      // Mark streaming as complete
      ctx.setStreamingState({
        currentPhase: 'complete',
        progress: 100,
        isProcessing: false
      });
      
    } catch (e: any) {
      ctx.setError(e?.message || 'Generation failed');
      ctx.setStatus('error');
      ctx.setStreamingState({
        error: e?.message || 'Generation failed',
        isProcessing: false
      });
    }
  }, [ctx, config, currentSettingsKey, isExternallyDriven]);

  const regenerate = useCallback(async () => {
    // If externally driven, don't regenerate internal generation
    if (isExternallyDriven) {
      return;
    }
    
    if (!ctx.selectedSuggestion) return;
    // Invalidate cache by modifying override slightly? Keep simple: just rerun.
    await generate(ctx.selectedSuggestion);
  }, [ctx.selectedSuggestion, generate, isExternallyDriven]);

  const setSettings = useCallback((s: Partial<typeof ctx.settings>) => {
    ctx.saveSettings(s);
  }, [ctx]);

  return {
    ...ctx,
    currentSettingsKey,
    generate,
    cancel,
    regenerate,
    setSettings,
    isExternallyDriven,
    applyPlaceholderPlan: ctx.applyPlaceholderPlan,
    clearPlaceholderPlan: ctx.clearPlaceholderPlan,
  };
};
