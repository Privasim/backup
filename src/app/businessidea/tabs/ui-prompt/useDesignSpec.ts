"use client";

import { useCallback, useMemo, useRef, useState } from 'react';
import { OpenRouterClient, getAvailableModels } from '@/lib/openrouter';
import { useChatboxSettings } from '@/components/chatbox/utils/settings-utils';
import { validateApiKey, validateModel, getErrorMessage } from '@/components/chatbox/utils/validation-utils';
import { chatboxDebug } from '@/app/businessidea/utils/logStore';
import type { DesignSpec } from './types.design';

export type DesignSpecStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseDesignSpecResult {
  status: DesignSpecStatus;
  error?: string;
  spec?: DesignSpec;
  streamText: string;
  metrics: { startedAt?: number; lastChunkAt?: number; tokenCount: number; bytes: number };
  generate: (prompt: string, opts?: { model?: string; temperature?: number; maxTokens?: number }) => Promise<void>;
  cancel: () => void;
}

// Basic runtime validator to avoid introducing new deps.
function isObject(v: any) { return v && typeof v === 'object' && !Array.isArray(v); }
function isString(v: any) { return typeof v === 'string'; }
function isArray(v: any) { return Array.isArray(v); }

function validateDesignSpec(payload: any): payload is DesignSpec {
  if (!isObject(payload)) return false;
  if (!isString(payload.title)) return false;
  if (!isString(payload.description)) return false;
  if (!isArray(payload.tasks) || payload.tasks.length < 8) return false; // 8–12+ tasks
  for (const t of payload.tasks) {
    if (!isObject(t) || !isString(t.id) || !isString(t.title) || !isString(t.rationale) || !isArray(t.acceptanceCriteria)) return false;
  }
  const dt = payload.designTokens;
  if (!isObject(dt)) return false;
  if (!isObject(dt.colors)) return false;
  const cs = dt.colors;
  for (const k of ['background','surface','border','text','mutedText','primary']) {
    if (!isString(cs[k])) return false;
  }
  if (!(dt.spacing === 'compact' || dt.spacing === 'cozy')) return false;
  if (!isObject(dt.typography) || !isString(dt.typography.fontFamily) || typeof dt.typography.baseSize !== 'number') return false;
  if (!(dt.typography.scale === 1.125 || dt.typography.scale === 1.2)) return false;

  if (!isArray(payload.components)) return false;
  for (const c of payload.components) {
    if (!isObject(c) || !isString(c.name)) return false;
  }

  if (!isObject(payload.layout) || !isArray(payload.layout.sections)) return false;
  for (const s of payload.layout.sections) {
    if (!isObject(s) || !isString(s.id) || (s.title && !isString(s.title)) || !isArray(s.components)) return false;
  }

  if (!isArray(payload.interactions)) return false;
  for (const i of payload.interactions) {
    if (!isObject(i) || !isString(i.component) || !isString(i.event) || !isString(i.behavior)) return false;
    if (i.accessibility && !isString(i.accessibility)) return false;
  }

  if (!isObject(payload.libraries) || payload.libraries.primary !== 'tailwind') return false;
  if (payload.libraries.optional) {
    if (!isArray(payload.libraries.optional)) return false;
  }

  if (!isArray(payload.constraints)) return false;
  return true;
}

export const useDesignSpec = (): UseDesignSpecResult => {
  const settings = useChatboxSettings();
  const [status, setStatus] = useState<DesignSpecStatus>('idle');
  const [error, setError] = useState<string | undefined>(undefined);
  const [spec, setSpec] = useState<DesignSpec | undefined>(undefined);
  const [streamText, setStreamText] = useState<string>('');
  const [metrics, setMetrics] = useState<{ startedAt?: number; lastChunkAt?: number; tokenCount: number; bytes: number }>({ tokenCount: 0, bytes: 0 });
  const abortRef = useRef<AbortController | null>(null);

  const availableModels = useMemo(() => getAvailableModels(), []);

  const resolveModel = useCallback(() => {
    const prefs = settings.getPreferences();
    let model = prefs?.defaultModel;
    try {
      const persisted = localStorage.getItem('ui-prompt:selected-model') || '';
      if (persisted && availableModels.includes(persisted)) model = persisted;
    } catch {}
    if (!model || !availableModels.includes(model)) model = availableModels[0];
    return model;
  }, [availableModels, settings]);

  const resolveApiKey = useCallback((model: string) => {
    let apiKey = settings.getApiKey(model);
    try {
      const legacyHyphen = localStorage.getItem('openrouter-api-key') || '';
      const legacyUnderscore = localStorage.getItem('openrouter_api_key') || '';
      if (!apiKey) apiKey = legacyHyphen || legacyUnderscore || '';
    } catch {}
    return apiKey || '';
  }, [settings]);

  const buildSystemPrompt = useCallback(() => {
    return [
      'You are a senior product/UI designer. Output strictly one JSON object that matches the DesignSpec schema.',
      'No markdown or code fences. Provide 9–12 tasks in tasks[].',
      'Align to a premium minimalist aesthetic: neutral slate palette, compact spacing, subtle shadows/rings, clean typography.',
      'Fields: title, description, tasks[{id,title,rationale,acceptanceCriteria[]}], designTokens{colors,spacing,typography},',
      'components[{name,props?,states?,variants?}], layout{sections[{id,title?,components[]}]}, interactions[],',
      'libraries{primary:"tailwind", optional?}, constraints[].'
    ].join(' ');
  }, []);

  const extractBalancedJson = (text: string): string | null => {
    let depth = 0;
    let start = -1;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === '{') { if (depth === 0) start = i; depth++; }
      else if (ch === '}') { depth--; if (depth === 0 && start !== -1) return text.slice(start, i + 1); }
    }
    return null;
  };

  const cancel = useCallback(() => {
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
    setStatus('idle');
  }, []);

  const generate = useCallback(async (userPrompt: string, opts?: { model?: string; temperature?: number; maxTokens?: number }) => {
    setStatus('loading');
    setError(undefined);
    setSpec(undefined);
    setStreamText('');
    setMetrics({ startedAt: Date.now(), lastChunkAt: undefined, tokenCount: 0, bytes: 0 });

    try {
      const model = opts?.model || resolveModel();
      const apiKey = resolveApiKey(model);

      const keyValidation = validateApiKey(apiKey);
      if (!keyValidation.isValid) throw new Error(keyValidation.error || 'Invalid API key');
      const modelValidation = validateModel(model, availableModels);
      if (!modelValidation.isValid) throw new Error(modelValidation.error || 'Invalid model');
      if (!userPrompt || userPrompt.trim().length < 3) throw new Error('Please enter a longer prompt');

      const client = new OpenRouterClient(apiKey);
      const controller = new AbortController();
      abortRef.current = controller;

      const onChunk = (chunk: string) => {
        setStreamText(prev => {
          const next = prev + chunk;
          const candidate = extractBalancedJson(next);
          if (candidate) {
            try {
              const parsed = JSON.parse(candidate);
              if (validateDesignSpec(parsed)) setSpec(parsed);
            } catch {}
          }
          return next;
        });
        setMetrics(prev => ({ ...prev, lastChunkAt: Date.now(), tokenCount: prev.tokenCount + 1, bytes: prev.bytes + chunk.length }));
      };

      await client.chat({
        model,
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user', content: `Prompt: ${userPrompt}. Output JSON only.` }
        ],
        temperature: opts?.temperature ?? 0.2,
        max_tokens: opts?.maxTokens ?? 900
      }, { stream: true, onChunk, signal: controller.signal });

      const finalCandidate = extractBalancedJson(streamText);
      if (finalCandidate && !spec) {
        try { const parsed = JSON.parse(finalCandidate); if (validateDesignSpec(parsed)) setSpec(parsed); } catch {}
      }

      if (!spec) {
        const response = await client.chat({
          model,
          messages: [
            { role: 'system', content: buildSystemPrompt() },
            { role: 'user', content: `Prompt: ${userPrompt}. Output JSON only.` }
          ],
          temperature: opts?.temperature ?? 0.2,
          max_tokens: opts?.maxTokens ?? 900
        }, { stream: false });

        const content = (response as any)?.choices?.[0]?.message?.content || '';
        try { const parsed = JSON.parse(content); if (!validateDesignSpec(parsed)) throw new Error('Invalid DesignSpec'); setSpec(parsed); }
        catch { throw new Error('The model returned non-JSON or invalid content.'); }
      }

      setStatus('success');
      chatboxDebug.success('ui-prompt', 'DesignSpec generation successful', { model });
    } catch (e) {
      const msg = getErrorMessage(e);
      chatboxDebug.error('ui-prompt', 'DesignSpec generation failed', { error: msg });
      setError(msg);
      setStatus('error');
    } finally {
      abortRef.current = null;
    }
  }, [availableModels, buildSystemPrompt, resolveApiKey, resolveModel, spec, streamText]);

  return { status, error, spec, streamText, metrics, generate, cancel };
};
