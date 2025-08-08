"use client";

import { useCallback, useMemo, useRef } from 'react';
import { useImplementationPlanContext } from './ImplementationPlanProvider';
import { settingsHash } from './storage';
import { buildMessages } from './promptBuilder';
import { generatePlanStream } from './implementationPlanService';
import { parsePlanFromString } from './streamingParser';
import type { ImplementationPlan } from './types';
import { useChatbox } from '@/components/chatbox/ChatboxProvider';
import { OpenRouterClient } from '@/lib/openrouter';

export const useImplementationPlan = () => {
  const ctx = useImplementationPlanContext();
  const { config } = useChatbox();
  const abortRef = useRef<AbortController | null>(null);

  const currentSettingsKey = useMemo(() => settingsHash({
    systemPromptOverride: ctx.settings.systemPromptOverride || '',
    sources: Array.isArray(ctx.settings.sources) ? ctx.settings.sources : []
  }), [ctx.settings]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    ctx.setStatus('idle');
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
    } catch (e: any) {
      ctx.setError(e?.message || 'Generation failed');
      ctx.setStatus('error');
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
