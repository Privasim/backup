"use client";

import { useCallback, useMemo, useRef, useState } from 'react';
import { OpenRouterClient, getAvailableModels } from '@/lib/openrouter';
import { useChatboxSettings } from '@/components/chatbox/utils/settings-utils';
import { validateApiKey, validateModel, getErrorMessage } from '@/components/chatbox/utils/validation-utils';
import type { WireframeScreen, WireframeNode } from './types';
import { chatboxDebug } from '@/app/businessidea/utils/logStore';

export type UIGenerationStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseUIGenerationResult {
  status: UIGenerationStatus;
  error?: string;
  result?: WireframeScreen;
  streamText: string;
  metrics: { startedAt?: number; lastChunkAt?: number; tokenCount: number; bytes: number };
  generate: (prompt: string, opts?: { model?: string; temperature?: number; maxTokens?: number }) => Promise<void>;
  cancel: () => void;
}

const coercePadding = (p: any): 'none' | 'sm' | 'md' | 'lg' | undefined => {
  if (p === 'none' || p === 'sm' || p === 'md' || p === 'lg') return p;
  return undefined;
};

function isWireframeNode(node: any): node is WireframeNode {
  return node && typeof node === 'object' && typeof node.type === 'string';
}

function validateWireframe(screen: any): screen is WireframeScreen {
  if (!isWireframeNode(screen)) return false;
  if (screen.type !== 'Screen') return false;
  if (screen.props && screen.props.padding) {
    screen.props.padding = coercePadding(screen.props.padding);
  }
  if (screen.children && !Array.isArray(screen.children)) return false;
  if (Array.isArray(screen.children)) {
    for (const child of screen.children) {
      if (!isWireframeNode(child)) return false;
    }
  }
  return true;
}

export const useUIGeneration = (): UseUIGenerationResult => {
  const settings = useChatboxSettings();
  const [status, setStatus] = useState<UIGenerationStatus>('idle');
  const [error, setError] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<WireframeScreen | undefined>(undefined);
  const [streamText, setStreamText] = useState<string>('');
  const [metrics, setMetrics] = useState<{ startedAt?: number; lastChunkAt?: number; tokenCount: number; bytes: number }>({ tokenCount: 0, bytes: 0 });
  const abortRef = useRef<AbortController | null>(null);

  const availableModels = useMemo(() => getAvailableModels(), []);

  const resolveModel = useCallback(() => {
    const prefs = settings.getPreferences();
    let model = prefs?.defaultModel;
    if (!model) {
      // Legacy fallback
      try {
        const legacyModel = localStorage.getItem('openrouter-selected-model');
        if (legacyModel) model = legacyModel;
      } catch {}
    }
    // Ensure model is valid
    if (!model || !availableModels.includes(model)) {
      model = availableModels[0];
    }
    return model;
  }, [availableModels, settings]);

  const resolveApiKey = useCallback((model: string) => {
    let apiKey = settings.getApiKey(model);
    if (!apiKey) {
      // Legacy fallbacks
      try {
        const legacyHyphen = localStorage.getItem('openrouter-api-key') || '';
        const legacyUnderscore = localStorage.getItem('openrouter_api_key') || '';
        apiKey = legacyHyphen || legacyUnderscore || '';
      } catch {}
    }
    return apiKey || '';
  }, [settings]);

  const buildSystemPrompt = useCallback(() => {
    return [
      'You are a UI wireframe generator for a mobile app. Output strictly a single JSON object only.',
      'Do not include markdown or code fences. Use the exact schema with fields: type, props, children.',
      'Allowed node types: Screen, Header, Text, Button, List, Card, Form.',
      'Keep content concise and suitable for mobile; avoid long text. Limit to 1 screen.',
    ].join(' ');
  }, []);

  const extractBalancedJson = (text: string): string | null => {
    // Remove common code fences if present
    const sanitized = text.replace(/```[a-zA-Z]*\n?/g, '').replace(/```/g, '');
    let depth = 0;
    let start = -1;
    for (let i = 0; i < sanitized.length; i++) {
      const ch = sanitized[i];
      if (ch === '{') {
        if (depth === 0) start = i;
        depth++;
      } else if (ch === '}') {
        depth--;
        if (depth === 0 && start !== -1) {
          return sanitized.slice(start, i + 1);
        }
      }
    }
    return null;
  };

  const cancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      chatboxDebug.warn('ui-prompt', 'Generation aborted by user');
    }
  }, []);

  const generate = useCallback<UseUIGenerationResult['generate']>(async (prompt, opts) => {
    setStatus('loading');
    setError(undefined);
    setResult(undefined);
    setStreamText('');
    setMetrics({ startedAt: Date.now(), lastChunkAt: undefined, tokenCount: 0, bytes: 0 });

    try {
      const model = opts?.model || resolveModel();
      const apiKey = resolveApiKey(model);

      chatboxDebug.info('ui-prompt', 'Starting UI generation (streaming)', {
        model,
        promptLength: prompt?.length || 0,
        hasApiKey: !!apiKey
      });

      const keyValidation = validateApiKey(apiKey);
      if (!keyValidation.isValid) {
        const msg = keyValidation.error || 'Invalid API key';
        chatboxDebug.error('ui-prompt', 'API key validation failed', { model, reason: msg });
        throw new Error(msg);
      }

      const modelValidation = validateModel(model, availableModels);
      if (!modelValidation.isValid) {
        const msg = modelValidation.error || 'Invalid model';
        chatboxDebug.error('ui-prompt', 'Model validation failed', { model, reason: msg });
        throw new Error(msg);
      }

      if (!prompt || prompt.trim().length < 3) {
        const msg = 'Please enter a longer prompt';
        chatboxDebug.warn('ui-prompt', 'Prompt too short', { promptLength: prompt?.length || 0 });
        throw new Error(msg);
      }

      const client = new OpenRouterClient(apiKey);
      const controller = new AbortController();
      abortRef.current = controller;

      const onChunk = (chunk: string) => {
        setStreamText(prev => {
          const next = prev + chunk;
          // Progressive parse using latest buffer
          const candidate = extractBalancedJson(next);
          if (candidate) {
            try {
              const parsed = JSON.parse(candidate);
              if (validateWireframe(parsed)) {
                setResult(parsed);
              }
            } catch {
              // ignore partial JSON errors
            }
          }
          return next;
        });
        setMetrics(prev => ({
          ...prev,
          lastChunkAt: Date.now(),
          tokenCount: prev.tokenCount + 1,
          bytes: prev.bytes + chunk.length
        }));
      };

      await client.chat({
        model,
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user', content: `Prompt: ${prompt}. Output JSON only.` }
        ],
        temperature: opts?.temperature ?? 0.2,
        max_tokens: opts?.maxTokens ?? 800
      }, { stream: true, onChunk, signal: controller.signal });

      // Stream ended; final parse attempt
      const finalCandidate = extractBalancedJson(streamText);
      if (finalCandidate && !result) {
        try {
          const parsed = JSON.parse(finalCandidate);
          if (validateWireframe(parsed)) {
            setResult(parsed);
          }
        } catch {/* ignore */}
      }

      if (!result) {
        // Fallback: non-streaming single-shot
        chatboxDebug.warn('ui-prompt', 'Streaming did not yield valid JSON; attempting non-streaming fallback');
        const response = await client.chat({
          model,
          messages: [
            { role: 'system', content: buildSystemPrompt() },
            { role: 'user', content: `Prompt: ${prompt}. Output JSON only.` }
          ],
          temperature: opts?.temperature ?? 0.2,
          max_tokens: opts?.maxTokens ?? 800
        }, { stream: false });

        if (!response || !('choices' in response)) {
          throw new Error('Empty response from model');
        }
        const content = response.choices?.[0]?.message?.content || '';
        try {
          const parsed = JSON.parse(content);
          if (!validateWireframe(parsed)) {
            throw new Error('The generated structure is invalid or unsupported.');
          }
          setResult(parsed);
        } catch (e) {
          throw new Error('The model returned non-JSON content. Please try again with a simpler prompt.');
        }
      }

      setStatus('success');
      chatboxDebug.success('ui-prompt', 'UI generation successful', { model });
    } catch (e) {
      const msg = getErrorMessage(e);
      chatboxDebug.error('ui-prompt', 'UI generation failed', { error: msg });
      setError(msg);
      setStatus('error');
    } finally {
      abortRef.current = null;
    }
  }, [availableModels, buildSystemPrompt, resolveApiKey, resolveModel, result, streamText]);

  return { status, error, result, streamText, metrics, generate, cancel };
};
