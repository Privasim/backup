"use client";

import { useCallback, useMemo, useState } from 'react';
import { OpenRouterClient, getAvailableModels } from '@/lib/openrouter';
import { useChatboxSettings } from '@/components/chatbox/utils/settings-utils';
import { validateApiKey, validateModel, getErrorMessage } from '@/components/chatbox/utils/validation-utils';
import type { WireframeScreen, WireframeNode } from './types';

export type UIGenerationStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseUIGenerationResult {
  status: UIGenerationStatus;
  error?: string;
  result?: WireframeScreen;
  generate: (prompt: string, opts?: { model?: string; temperature?: number; maxTokens?: number }) => Promise<void>;
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
      // Legacy fallback
      try {
        const legacyKey = localStorage.getItem('openrouter-api-key') || '';
        if (legacyKey) apiKey = legacyKey;
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

  const generate = useCallback<UseUIGenerationResult['generate']>(async (prompt, opts) => {
    setStatus('loading');
    setError(undefined);
    setResult(undefined);

    try {
      const model = opts?.model || resolveModel();
      const apiKey = resolveApiKey(model);

      const keyValidation = validateApiKey(apiKey);
      if (!keyValidation.isValid) {
        throw new Error(keyValidation.error || 'Invalid API key');
      }

      const modelValidation = validateModel(model, availableModels);
      if (!modelValidation.isValid) {
        throw new Error(modelValidation.error || 'Invalid model');
      }

      if (!prompt || prompt.trim().length < 3) {
        throw new Error('Please enter a longer prompt');
      }

      const client = new OpenRouterClient(apiKey);

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
      let parsed: any;
      try {
        parsed = JSON.parse(content);
      } catch (e) {
        throw new Error('The model returned non-JSON content. Please try again with a simpler prompt.');
      }

      if (!validateWireframe(parsed)) {
        throw new Error('The generated structure is invalid or unsupported.');
      }

      setResult(parsed);
      setStatus('success');
    } catch (e) {
      setError(getErrorMessage(e));
      setStatus('error');
    }
  }, [availableModels, buildSystemPrompt, resolveApiKey, resolveModel]);

  return { status, error, result, generate };
};
