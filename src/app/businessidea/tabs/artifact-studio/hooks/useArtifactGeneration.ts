'use client';

import { useState, useCallback, useRef } from 'react';
import { useChatbox } from '@/components/chatbox/ChatboxProvider';
import { OpenRouterClient } from '@/lib/openrouter';
import { transpileTsxToJs } from '../utils/transpile';

export interface ArtifactGenerationState {
  status: 'idle' | 'generating' | 'streaming' | 'compiled' | 'error';
  prompt: string;
  rawStream: string;
  code: string;
  compile: { ok: boolean; errors: string[] };
  runtime: { errors: string[] };
}

export interface ArtifactGenerationActions {
  setPrompt: (prompt: string) => void;
  generateFromPrompt: (prompt: string, options?: { streaming?: boolean }) => Promise<void>;
  cancelGeneration: () => void;
}

export function useArtifactGeneration(): ArtifactGenerationState & ArtifactGenerationActions {
  const { config } = useChatbox();
  const [state, setState] = useState<ArtifactGenerationState>({
    status: 'idle',
    prompt: '',
    rawStream: '',
    code: '',
    compile: { ok: false, errors: [] },
    runtime: { errors: [] }
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const compileTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setPrompt = useCallback((prompt: string) => {
    setState(prev => ({ ...prev, prompt }));
  }, []);

  const normalizeStream = useCallback((rawStream: string): string => {
    // Strip markdown code fences and backticks
    let normalized = rawStream
      .replace(/```tsx?/g, '')
      .replace(/```/g, '')
      .replace(/`/g, '')
      .trim();

    // Ensure it has a default export function if content exists
    if (normalized && !normalized.includes('export default function')) {
      // Try to wrap in a default export if it looks like a component
      if (normalized.includes('return (') || normalized.includes('return<')) {
        normalized = `export default function Artifact() {\n${normalized}\n}`;
      }
    }

    return normalized;
  }, []);

  const debouncedCompile = useCallback(async (code: string) => {
    if (compileTimeoutRef.current) {
      clearTimeout(compileTimeoutRef.current);
    }

    compileTimeoutRef.current = setTimeout(async () => {
      if (!code.trim()) return;

      try {
        const result = await transpileTsxToJs(code);
        setState(prev => ({
          ...prev,
          compile: result.ok 
            ? { ok: true, errors: [] }
            : { ok: false, errors: result.errors || [] },
          status: result.ok ? 'compiled' : 'error'
        }));

        // If compile successful, we'll let the parent component handle posting to iframe
      } catch (error) {
        setState(prev => ({
          ...prev,
          compile: { ok: false, errors: [error instanceof Error ? error.message : 'Compile error'] },
          status: 'error'
        }));
      }
    }, 300);
  }, []);

  const generateFromPrompt = useCallback(async (prompt: string, options?: { streaming?: boolean }) => {
    if (!config.apiKey || !config.model) {
      setState(prev => ({
        ...prev,
        status: 'error',
        compile: { ok: false, errors: ['API key and model are required'] }
      }));
      return;
    }

    // Cancel any existing generation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    setState(prev => ({
      ...prev,
      status: 'generating',
      prompt,
      rawStream: '',
      code: '',
      compile: { ok: false, errors: [] },
      runtime: { errors: [] }
    }));

    try {
      const client = new OpenRouterClient(config.apiKey);
      
      const systemPrompt = `You are a React component generator. Generate a single TSX component that:

1. Has exactly one default export function named "Artifact"
2. Uses only Tailwind CSS classes for styling
3. Contains no imports, requires, or external dependencies
4. Does not use any DOM APIs (window, document, etc.)
5. Does not use network APIs (fetch, XMLHttpRequest, etc.)
6. Does not use timers (setTimeout, setInterval)
7. Does not use dangerouslySetInnerHTML
8. Returns valid JSX

Output only the TSX code with no markdown formatting, no code fences, no explanations.

Example format:
export default function Artifact() {
  return (
    <div className="p-4 bg-blue-100 rounded-lg">
      <h1 className="text-xl font-bold">Hello World</h1>
    </div>
  );
}`;

      const messages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: prompt }
      ];

      if (options?.streaming) {
        setState(prev => ({ ...prev, status: 'streaming' }));
        
        await client.chat(
          {
            model: config.model,
            messages,
            stream: true,
            temperature: 0.7,
            max_tokens: 2000
          },
          {
            stream: true,
            signal: abortControllerRef.current.signal,
            onChunk: (chunk: string) => {
              setState(prev => {
                const newRawStream = prev.rawStream + chunk;
                const newCode = normalizeStream(newRawStream);
                
                // Debounced compile
                debouncedCompile(newCode);
                
                return {
                  ...prev,
                  rawStream: newRawStream,
                  code: newCode
                };
              });
            }
          }
        );
      } else {
        const response = await client.chat(
          {
            model: config.model,
            messages,
            temperature: 0.7,
            max_tokens: 2000
          },
          {
            stream: false,
            signal: abortControllerRef.current.signal
          }
        );

        if (response && 'choices' in response && response.choices[0]?.message?.content) {
          const content = response.choices[0].message.content;
          const normalizedCode = normalizeStream(content);
          
          setState(prev => ({
            ...prev,
            rawStream: content,
            code: normalizedCode,
            status: 'compiled'
          }));

          // Compile immediately for non-streaming
          await debouncedCompile(normalizedCode);
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setState(prev => ({ ...prev, status: 'idle' }));
      } else {
        setState(prev => ({
          ...prev,
          status: 'error',
          compile: { 
            ok: false, 
            errors: [error instanceof Error ? error.message : 'Generation failed'] 
          }
        }));
      }
    }
  }, [config.apiKey, config.model, normalizeStream, debouncedCompile]);

  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    if (compileTimeoutRef.current) {
      clearTimeout(compileTimeoutRef.current);
      compileTimeoutRef.current = null;
    }
    
    setState(prev => ({ ...prev, status: 'idle' }));
  }, []);

  return {
    ...state,
    setPrompt,
    generateFromPrompt,
    cancelGeneration
  };
}
