"use client";

import { useCallback, useMemo, useRef } from 'react';
import { useImplementationPlanContext } from './ImplementationPlanProvider';
import { settingsHash } from './storage';
import { buildMessages } from './promptBuilder';
import { generatePlanStream } from './implementationPlanService';
import { parsePlanFromString } from './streamingParser';
import { StreamingContentProcessor } from './streaming/StreamingContentProcessor';
import { throttle } from './streaming/utils';
import type { ImplementationPlan } from './types';
import { useChatbox } from '@/components/chatbox/ChatboxProvider';
import { OpenRouterClient } from '@/lib/openrouter';

export const useImplementationPlan = () => {
  const ctx = useImplementationPlanContext();
  const { config } = useChatbox();
  const abortRef = useRef<AbortController | null>(null);
  const streamingProcessorRef = useRef<StreamingContentProcessor | null>(null);
  
  // Throttled update function to prevent excessive re-renders
  const throttledUpdate = useRef(
    throttle((sections: any[], currentPhase: any, progress: number, rawContent: string) => {
      ctx.updateStreamingProgress(sections, currentPhase, progress);
      ctx.setStreamingState({ rawContent });
    }, 100) // Update max every 100ms
  );

  const currentSettingsKey = useMemo(() => settingsHash({
    systemPromptOverride: ctx.settings.systemPromptOverride || '',
    sources: Array.isArray(ctx.settings.sources) ? ctx.settings.sources : []
  }), [ctx.settings]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    ctx.setStatus('idle');
    ctx.setStreamingState({
      isProcessing: false,
      currentPhase: 'initializing',
      progress: 0
    });
    streamingProcessorRef.current?.reset();
  }, [ctx]);

  const generate = useCallback(async (suggestion: any) => {
    ctx.setSelectedSuggestion(suggestion);

    // Try cache first
    const ideaId = suggestion?.id || suggestion?.title || 'idea';
    const cached = ctx.getCachedPlan(ideaId, currentSettingsKey);
    if (cached) {
      ctx.setPlan(cached as ImplementationPlan);
      ctx.setStatus('success');
      return;
    }

    // Initialize streaming processor
    if (!streamingProcessorRef.current) {
      streamingProcessorRef.current = new StreamingContentProcessor();
    }
    streamingProcessorRef.current.reset();

    // Reset streaming state
    ctx.setStreamingState({
      rawContent: '',
      processedSections: [],
      currentPhase: 'initializing',
      progress: 0,
      error: null,
      isProcessing: true
    });

    // Build messages
    const sysPrompt = config.customPrompt || '';
    const { systemMessage, userMessage } = buildMessages({
      baseSystemPrompt: sysPrompt,
      systemPromptOverride: ctx.settings.systemPromptOverride,
      sources: ctx.settings.sources,
      suggestion,
    });

    // Prepare client
    const apiKey = config.apiKey || '';
    const model = config.model || 'qwen/qwen3-coder:free';
    if (!apiKey) {
      ctx.setError('Missing OpenRouter API key. Please configure it in Chatbox controls.');
      ctx.setStatus('error');
      ctx.setStreamingState({ error: 'Missing API key', isProcessing: false });
      return;
    }
    const client = new OpenRouterClient(apiKey);

    // Abort controller
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    ctx.setError(undefined);
    ctx.clearRaw();
    ctx.setPlan(undefined);
    ctx.setStatus('generating');

    try {
      let localRaw = '';
      await generatePlanStream({
        client,
        model,
        messages: [systemMessage, userMessage],
        onChunk: (chunk: string) => {
          localRaw += chunk;
          ctx.appendRaw(chunk);
          
          // Process chunk with streaming processor
          if (streamingProcessorRef.current) {
            const result = streamingProcessorRef.current.processChunk(chunk);
            
            // Use throttled update to prevent excessive re-renders
            throttledUpdate.current(
              result.sections,
              result.progress.currentPhase,
              result.progress.progress,
              streamingProcessorRef.current.getRawContent()
            );
          }
          
          if (ctx.status !== 'streaming') ctx.setStatus('streaming');
        },
        signal: abortRef.current.signal
      });

      // Parse accumulated output
      const plan = parsePlanFromString(localRaw || ctx.rawStream || '', suggestion);
      if (!plan) throw new Error('Failed to parse implementation plan.');

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
  }, [ctx, config, currentSettingsKey]);

  const regenerate = useCallback(async () => {
    if (!ctx.selectedSuggestion) return;
    // Invalidate cache by modifying override slightly? Keep simple: just rerun.
    await generate(ctx.selectedSuggestion);
  }, [ctx.selectedSuggestion, generate]);

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
  };
};
