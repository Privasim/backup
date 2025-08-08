"use client";

import { useCallback, useMemo, useRef, useState } from 'react';
import { OpenRouterClient, getAvailableModels } from '@/lib/openrouter';
import { useChatboxSettings } from '@/components/chatbox/utils/settings-utils';
import { validateApiKey, validateModel, getErrorMessage } from '@/components/chatbox/utils/validation-utils';
import { chatboxDebug } from '@/app/businessidea/utils/logStore';
import type { DesignSpec } from './types.design';
import type { CodeBundle } from './types.codegen';
import type { WireframeScreen, WireframeNode } from './types';

export type CodeGenStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseCodeGenerationResult {
  status: CodeGenStatus;
  error?: string;
  bundle?: CodeBundle;
  streamText: string;
  metrics: { startedAt?: number; lastChunkAt?: number; tokenCount: number; bytes: number };
  generate: (spec: DesignSpec, opts?: { model?: string; temperature?: number; maxTokens?: number }) => Promise<void>;
  cancel: () => void;
}

function isObject(v: any) { return v && typeof v === 'object' && !Array.isArray(v); }
function isString(v: any) { return typeof v === 'string'; }
function isArray(v: any) { return Array.isArray(v); }

function isWireframeNode(node: any): node is WireframeNode {
  return node && typeof node === 'object' && typeof node.type === 'string';
}

function validatePreviewDsl(screen: any): screen is WireframeScreen {
  if (!isWireframeNode(screen)) return false;
  if (screen.type !== 'Screen') return false;
  if (screen.children && !Array.isArray(screen.children)) return false;
  if (Array.isArray(screen.children)) {
    for (const child of screen.children) if (!isWireframeNode(child)) return false;
  }
  return true;
}

function validateCodeBundle(payload: any): payload is CodeBundle {
  if (!isObject(payload)) return false;
  if (!isArray(payload.files)) return false;
  for (const f of payload.files) {
    if (!isObject(f) || !isString(f.path) || !isString(f.language) || !isString(f.content)) return false;
  }
  if (!isArray(payload.suggestedDependencies)) return false;
  for (const d of payload.suggestedDependencies) {
    if (!isObject(d) || !isString(d.name) || !isString(d.reason)) return false;
    if (d.version && !isString(d.version)) return false;
  }
  if (payload.readme && !isString(payload.readme)) return false;
  if (payload.previewDsl && !validatePreviewDsl(payload.previewDsl)) return false;
  return true;
}

export const useCodeGeneration = (): UseCodeGenerationResult => {
  const settings = useChatboxSettings();
  const [status, setStatus] = useState<CodeGenStatus>('idle');
  const [error, setError] = useState<string | undefined>(undefined);
  const [bundle, setBundle] = useState<CodeBundle | undefined>(undefined);
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
      'You are a senior React engineer. Output strictly one JSON object that matches the CodeBundle schema.',
      'No markdown or code fences. Framework: Next.js App Router + React + TypeScript + Tailwind.',
      'Include: files[{path,language,content}], suggestedDependencies[{name,version?,reason}], readme?, previewDsl?',
      'Respect design tokens; produce accessible, minimalist UI. If spec.libraries.optional includes shadcn, use proper imports.',
      'Also include previewDsl (safe DSL matching WireframeScreen) for in-app preview.'
    ].join(' ');
  }, []);

  const extractBalancedJson = (text: string): string | null => {
    let depth = 0, start = -1;
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

  const generate = useCallback(async (spec: DesignSpec, opts?: { model?: string; temperature?: number; maxTokens?: number }) => {
    setStatus('loading');
    setError(undefined);
    setBundle(undefined);
    setStreamText('');
    setMetrics({ startedAt: Date.now(), lastChunkAt: undefined, tokenCount: 0, bytes: 0 });

    try {
      const model = opts?.model || resolveModel();
      const apiKey = resolveApiKey(model);

      const keyValidation = validateApiKey(apiKey);
      if (!keyValidation.isValid) throw new Error(keyValidation.error || 'Invalid API key');
      const modelValidation = validateModel(model, availableModels);
      if (!modelValidation.isValid) throw new Error(modelValidation.error || 'Invalid model');

      const client = new OpenRouterClient(apiKey);
      const controller = new AbortController();
      abortRef.current = controller;

      const onChunk = (chunk: string) => {
        setStreamText(prev => {
          const next = prev + chunk;
          const candidate = extractBalancedJson(next);
          if (candidate) {
            try { const parsed = JSON.parse(candidate); if (validateCodeBundle(parsed)) setBundle(parsed); } catch {}
          }
          return next;
        });
        setMetrics(prev => ({ ...prev, lastChunkAt: Date.now(), tokenCount: prev.tokenCount + 1, bytes: prev.bytes + chunk.length }));
      };

      await client.chat({
        model,
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user', content: `DesignSpec JSON: ${JSON.stringify(spec)}. Output JSON only.` }
        ],
        temperature: opts?.temperature ?? 0.2,
        max_tokens: opts?.maxTokens ?? 1800
      }, { stream: true, onChunk, signal: controller.signal });

      const finalCandidate = extractBalancedJson(streamText);
      if (finalCandidate && !bundle) {
        try { const parsed = JSON.parse(finalCandidate); if (validateCodeBundle(parsed)) setBundle(parsed); } catch {}
      }

      if (!bundle) {
        const response = await client.chat({
          model,
          messages: [
            { role: 'system', content: buildSystemPrompt() },
            { role: 'user', content: `DesignSpec JSON: ${JSON.stringify(spec)}. Output JSON only.` }
          ],
          temperature: opts?.temperature ?? 0.2,
          max_tokens: opts?.maxTokens ?? 1800
        }, { stream: false });
        const content = (response as any)?.choices?.[0]?.message?.content || '';
        try { const parsed = JSON.parse(content); if (!validateCodeBundle(parsed)) throw new Error('Invalid CodeBundle'); setBundle(parsed); }
        catch { throw new Error('The model returned non-JSON or invalid content.'); }
      }

      setStatus('success');
      chatboxDebug.success('ui-prompt', 'Code generation successful', { model });
    } catch (e) {
      const msg = getErrorMessage(e);
      chatboxDebug.error('ui-prompt', 'Code generation failed', { error: msg });
      setError(msg);
      setStatus('error');
    } finally {
      abortRef.current = null;
    }
  }, [availableModels, buildSystemPrompt, resolveApiKey, resolveModel, bundle, streamText]);

  return { status, error, bundle, streamText, metrics, generate, cancel };
};
