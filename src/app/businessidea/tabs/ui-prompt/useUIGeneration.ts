"use client";

import { useCallback, useMemo, useState } from 'react';
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

      chatboxDebug.info('ui-prompt', 'Starting UI generation', {
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

      chatboxDebug.debug('ui-prompt', 'Sending request to OpenRouter', {
        model,
        temperature: opts?.temperature ?? 0.2,
        maxTokens: opts?.maxTokens ?? 800
      });

      let contentSnippet: string | undefined;
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
        chatboxDebug.error('ui-prompt', 'Empty response from model', { model });
        throw new Error('Empty response from model');
      }

      const content = response.choices?.[0]?.message?.content || '';
      contentSnippet = content?.slice(0, 800);

      chatboxDebug.debug('ui-prompt', 'Received response from OpenRouter', {
        model,
        choiceCount: response.choices?.length || 0,
        contentPreview: contentSnippet
      });
      let parsed: any;
      try {
        parsed = JSON.parse(content);
      } catch (e) {
        chatboxDebug.error('ui-prompt', 'Non-JSON content received', {
          model,
          error: getErrorMessage(e),
          contentPreview: contentSnippet
        });
        throw new Error('The model returned non-JSON content. Please try again with a simpler prompt.');
      }

      if (!validateWireframe(parsed)) {
        chatboxDebug.error('ui-prompt', 'Wireframe validation failed', { model, parsedPreview: JSON.stringify(parsed).slice(0, 800) });
        throw new Error('The generated structure is invalid or unsupported.');
      }

      setResult(parsed);
      setStatus('success');
      chatboxDebug.success('ui-prompt', 'UI generation successful', { model });
    } catch (e) {
      const msg = getErrorMessage(e);
      chatboxDebug.error('ui-prompt', 'UI generation failed', { error: msg });
      setError(msg);
      setStatus('error');
    }
  }, [availableModels, buildSystemPrompt, resolveApiKey, resolveModel]);

  return { status, error, result, generate };
};
