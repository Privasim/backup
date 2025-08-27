'use client';

import { useState, useCallback, useRef } from 'react';
import { useChatbox } from '@/components/chatbox/ChatboxProvider';
import { OpenRouterClient } from '@/lib/openrouter';
import { transpileTsxToJs } from '../utils/transpile';
import { 
  validateWireframeInteractivity, 
  createInteractivityFollowupPrompt, 
  injectMinimalInteractivity,
  WireframeInteractivityResult 
} from '../utils/sandbox-html';

export interface ArtifactGenerationState {
  status: 'idle' | 'generating' | 'streaming' | 'compiled' | 'error' | 'validating' | 'retrying';
  prompt: string;
  rawStream: string;
  code: string;
  compile: { ok: boolean; errors: string[] };
  runtime: { errors: string[] };
  interactivity?: WireframeInteractivityResult;
  retryCount: number;
  cacheHit: boolean;
}

export interface ArtifactGenerationActions {
  setPrompt: (prompt: string) => void;
  generateFromPrompt: (prompt: string, options?: { streaming?: boolean }) => Promise<void>;
  cancelGeneration: () => void;
  regenerateWithEnhancements: () => Promise<void>;
  clearCache: () => void;
  getCacheStats: () => ReturnType<typeof getCacheStats>;
}

// Simple in-memory cache for successful wireframe results with metadata
interface CacheEntry {
  code: string;
  interactivity: WireframeInteractivityResult;
  timestamp: number;
  model: string;
  hitCount: number;
}

const wireframeCache = new Map<string, CacheEntry>();
const MAX_CACHE_SIZE = 50;

// Cache statistics for monitoring
export const getCacheStats = () => ({
  size: wireframeCache.size,
  maxSize: MAX_CACHE_SIZE,
  entries: Array.from(wireframeCache.entries()).map(([key, entry]) => ({
    key: key.substring(0, 50) + (key.length > 50 ? '...' : ''),
    timestamp: entry.timestamp,
    model: entry.model,
    hitCount: entry.hitCount,
    interactivityLevel: entry.interactivity.level
  }))
});

export const clearCache = () => {
  wireframeCache.clear();
};

export function useArtifactGeneration(): ArtifactGenerationState & ArtifactGenerationActions {
  const { config } = useChatbox();
  const [state, setState] = useState<ArtifactGenerationState>({
    status: 'idle',
    prompt: '',
    rawStream: '',
    code: '',
    compile: { ok: false, errors: [] },
    runtime: { errors: [] },
    retryCount: 0,
    cacheHit: false
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const compileTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cache management functions
  const getCacheKey = useCallback((prompt: string, model: string): string => {
    return `${model}:${prompt.trim().toLowerCase()}`;
  }, []);

  const getCachedResult = useCallback((prompt: string, model: string) => {
    const key = getCacheKey(prompt, model);
    const entry = wireframeCache.get(key);
    
    if (entry) {
      // Update hit count and move to end (LRU)
      entry.hitCount++;
      wireframeCache.delete(key);
      wireframeCache.set(key, entry);
      return entry;
    }
    
    return undefined;
  }, [getCacheKey]);

  const setCachedResult = useCallback((prompt: string, model: string, code: string, interactivity: WireframeInteractivityResult) => {
    const key = getCacheKey(prompt, model);
    
    // LRU eviction: remove oldest entries if cache is full
    if (wireframeCache.size >= MAX_CACHE_SIZE) {
      const firstKey = wireframeCache.keys().next().value;
      if (firstKey) {
        wireframeCache.delete(firstKey);
      }
    }
    
    const cacheEntry: CacheEntry = {
      code,
      interactivity,
      timestamp: Date.now(),
      model,
      hitCount: 0
    };
    
    wireframeCache.set(key, cacheEntry);
  }, [getCacheKey]);

  const setPrompt = useCallback((prompt: string) => {
    setState(prev => ({ ...prev, prompt }));
  }, []);

  const normalizeStream = useCallback((rawStream: string): string => {
    // Strip markdown code fences and backticks
    let normalized = rawStream
      .replace(/```javascript/g, '')
      .replace(/```js/g, '')
      .replace(/```tsx?/g, '')
      .replace(/```/g, '')
      .replace(/`/g, '')
      .trim();

    // For wireframes, we expect plain JavaScript with React UMD globals
    // No need to wrap in exports - the code should be self-contained
    return normalized;
  }, []);

  const validateAndProcessCode = useCallback(async (code: string, originalPrompt: string, retryCount: number) => {
    if (!code.trim()) return;

    setState(prev => ({ ...prev, status: 'validating' }));

    // Validate wireframe interactivity
    const interactivity = validateWireframeInteractivity(code);
    
    setState(prev => ({ ...prev, interactivity }));

    // If wireframe is not interactive enough and we haven't exceeded retry limit
    if (interactivity.level === 'static' && retryCount < 2) {
      setState(prev => ({ 
        ...prev, 
        status: 'retrying', 
        retryCount: retryCount + 1,
        compile: {
          ok: false,
          errors: [
            `Wireframe is not interactive enough (${interactivity.score}% interactivity)`,
            '',
            'Retrying with enhanced prompt to add:',
            ...interactivity.missingPatterns.map(pattern => `• ${pattern}`),
            '',
            `Retry attempt ${retryCount + 1} of 2...`
          ]
        }
      }));
      
      // Create follow-up prompt for retry
      const followupPrompt = createInteractivityFollowupPrompt(originalPrompt, interactivity);
      
      // Retry with enhanced prompt and exponential backoff
      const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 3000);
      setTimeout(() => {
        generateFromPromptInternal(followupPrompt, { streaming: true }, originalPrompt, retryCount + 1);
      }, retryDelay);
      return;
    }

    // If still not interactive after retries, apply auto-repair
    let finalCode = code;
    let finalInteractivity = interactivity;
    
    if (interactivity.level === 'static' && retryCount >= 2) {
      setState(prev => ({ 
        ...prev, 
        compile: {
          ok: false,
          errors: [
            'Retries exhausted. Applying auto-repair to inject minimal interactivity...',
            '',
            'Auto-repair will add:',
            '• Basic useState hooks for state management',
            '• Click handlers for buttons',
            '• Controlled inputs with onChange handlers',
            '• Visual feedback for user interactions'
          ]
        }
      }));
      
      finalCode = injectMinimalInteractivity(code);
      // Re-validate after auto-repair
      finalInteractivity = validateWireframeInteractivity(finalCode);
      
      setState(prev => ({ 
        ...prev, 
        interactivity: finalInteractivity,
        compile: {
          ok: false,
          errors: [
            `Auto-repair completed. Interactivity improved to ${finalInteractivity.level} (${finalInteractivity.score}%)`,
            '',
            finalInteractivity.level === 'static' 
              ? 'Note: Auto-repair had limited success. Consider manually adding more interactive elements.'
              : 'Auto-repair successful! The wireframe now includes basic interactivity.'
          ]
        }
      }));
    }

    // Try to compile the final code
    try {
      const result = await transpileTsxToJs(finalCode);
      setState(prev => ({
        ...prev,
        code: finalCode,
        compile: result.ok 
          ? { ok: true, errors: [] }
          : { ok: false, errors: result.error ? [result.error] : [] },
        status: result.ok ? 'compiled' : 'error'
      }));

      // Cache successful results
      if (result.ok && finalInteractivity.level !== 'static') {
        setCachedResult(originalPrompt, config.model, finalCode, finalInteractivity);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Compile error';
      const suggestions = [
        'The generated code has syntax errors',
        'Try regenerating with a simpler prompt',
        'Check if the AI model is appropriate for code generation'
      ];

      setState(prev => ({
        ...prev,
        compile: { 
          ok: false, 
          errors: [
            `Compilation failed: ${errorMessage}`,
            '',
            'Suggestions:',
            ...suggestions.map(s => `• ${s}`)
          ] 
        },
        status: 'error'
      }));
    }
  }, [setCachedResult, config.model]);

  const debouncedCompile = useCallback(async (code: string, originalPrompt?: string, retryCount?: number) => {
    if (compileTimeoutRef.current) {
      clearTimeout(compileTimeoutRef.current);
    }

    compileTimeoutRef.current = setTimeout(async () => {
      if (originalPrompt !== undefined && retryCount !== undefined) {
        await validateAndProcessCode(code, originalPrompt, retryCount);
      } else {
        // Fallback to original compile logic for backward compatibility
        if (!code.trim()) return;

        try {
          const result = await transpileTsxToJs(code);
          setState(prev => ({
            ...prev,
            compile: result.ok 
              ? { ok: true, errors: [] }
              : { ok: false, errors: result.error ? [result.error] : [] },
            status: result.ok ? 'compiled' : 'error'
          }));
        } catch (error) {
          setState(prev => ({
            ...prev,
            compile: { ok: false, errors: [error instanceof Error ? error.message : 'Compile error'] },
            status: 'error'
          }));
        }
      }
    }, 300);
  }, [validateAndProcessCode]);

  const generateFromPromptInternal = useCallback(async (
    prompt: string, 
    options?: { streaming?: boolean }, 
    originalPrompt?: string, 
    retryCount: number = 0
  ) => {
    if (!config.apiKey || !config.model) {
      setState(prev => ({
        ...prev,
        status: 'error',
        compile: { 
          ok: false, 
          errors: [
            'Configuration required: Please set your API key and select a model in the API Configuration section below.'
          ] 
        }
      }));
      return;
    }

    // Cancel any existing generation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    const actualOriginalPrompt = originalPrompt || prompt;
    
    setState(prev => ({
      ...prev,
      status: 'generating',
      prompt: actualOriginalPrompt,
      rawStream: '',
      code: '',
      compile: { ok: false, errors: [] },
      runtime: { errors: [] },
      retryCount,
      cacheHit: false,
      interactivity: undefined
    }));

    // Exponential backoff for retries
    if (retryCount > 0) {
      const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    try {
      const client = new OpenRouterClient(config.apiKey);
      
      const systemPrompt = `You are a wireframe generator that creates interactive React components. Generate plain JavaScript code that:

CRITICAL REQUIREMENTS:
1. Use React UMD globals (React, ReactDOM) - NO imports or exports
2. Create interactive wireframes with React.useState for state management
3. Include event handlers (onClick, onChange, onSubmit) that visibly update the UI
4. Use controlled inputs with state binding
5. End with ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(WireframeComponent))
6. Use only Tailwind CSS classes for styling
7. No external dependencies, DOM APIs, network APIs, or timers
8. No dangerouslySetInnerHTML

INTERACTIVITY PATTERNS REQUIRED:
- Forms with controlled inputs and submission handling
- Buttons that toggle states or trigger actions
- Counters, toggles, or dynamic content updates
- Visual feedback for user interactions
- State-driven UI changes

Output only plain JavaScript code with no markdown formatting, no code fences, no explanations.

Example format:
function WireframeComponent() {
  const [count, setCount] = React.useState(0);
  const [text, setText] = React.useState('');
  
  return React.createElement('div', { className: 'p-4 bg-blue-100 rounded-lg' },
    React.createElement('h1', { className: 'text-xl font-bold mb-4' }, 'Interactive Wireframe'),
    React.createElement('button', {
      className: 'bg-blue-500 text-white px-4 py-2 rounded mr-2',
      onClick: () => setCount(count + 1)
    }, 'Count: ' + count),
    React.createElement('input', {
      className: 'border p-2 rounded',
      value: text,
      onChange: (e) => setText(e.target.value),
      placeholder: 'Type something...'
    }),
    React.createElement('p', { className: 'mt-2' }, 'You typed: ' + text)
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(WireframeComponent));`;

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
            temperature: 0.3,
            max_tokens: 3000
          },
          {
            stream: true,
            signal: abortControllerRef.current.signal,
            onChunk: (chunk: string) => {
              setState(prev => {
                const newRawStream = prev.rawStream + chunk;
                const newCode = normalizeStream(newRawStream);
                
                // Debounced compile with validation
                debouncedCompile(newCode, actualOriginalPrompt, retryCount);
                
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
            temperature: 0.3,
            max_tokens: 3000
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

          // Compile immediately for non-streaming with validation
          await debouncedCompile(normalizedCode, actualOriginalPrompt, retryCount);
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setState(prev => ({ ...prev, status: 'idle' }));
      } else {
        // Enhanced error messages with actionable suggestions
        let errorMessage = 'Generation failed';
        let suggestions: string[] = [];

        if (error instanceof Error) {
          errorMessage = error.message;
          
          // Network-related errors
          if (error.message.includes('fetch') || error.message.includes('network')) {
            suggestions.push('Check your internet connection and try again');
            suggestions.push('The AI service might be temporarily unavailable');
          }
          
          // API key errors
          if (error.message.includes('401') || error.message.includes('unauthorized')) {
            suggestions.push('Verify your API key is correct and has sufficient credits');
            suggestions.push('Check if your API key has the required permissions');
          }
          
          // Rate limiting
          if (error.message.includes('429') || error.message.includes('rate limit')) {
            suggestions.push('You are being rate limited. Please wait a moment and try again');
            suggestions.push('Consider using a different model or reducing request frequency');
          }
          
          // Model errors
          if (error.message.includes('model') || error.message.includes('404')) {
            suggestions.push('The selected model might not be available. Try a different model');
            suggestions.push('Check if the model name is correct in your configuration');
          }
        }

        const errorMessages = [errorMessage];
        if (suggestions.length > 0) {
          errorMessages.push('', 'Suggestions:');
          errorMessages.push(...suggestions.map(s => `• ${s}`));
        }

        setState(prev => ({
          ...prev,
          status: 'error',
          compile: { 
            ok: false, 
            errors: errorMessages
          }
        }));
      }
    }
  }, [config.apiKey, config.model, normalizeStream, debouncedCompile]);

  const generateFromPrompt = useCallback(async (prompt: string, options?: { streaming?: boolean }) => {
    if (!config.apiKey || !config.model) {
      setState(prev => ({
        ...prev,
        status: 'error',
        compile: { ok: false, errors: ['API key and model are required'] }
      }));
      return;
    }

    // Check cache first
    const cachedResult = getCachedResult(prompt, config.model);
    if (cachedResult) {
      setState(prev => ({
        ...prev,
        status: 'compiled',
        prompt,
        rawStream: cachedResult.code,
        code: cachedResult.code,
        compile: { ok: true, errors: [] },
        runtime: { errors: [] },
        interactivity: cachedResult.interactivity,
        retryCount: 0,
        cacheHit: true
      }));
      return;
    }

    // Generate new wireframe
    await generateFromPromptInternal(prompt, options);
  }, [config.apiKey, config.model, getCachedResult, generateFromPromptInternal]);

  const regenerateWithEnhancements = useCallback(async () => {
    if (!state.prompt || !state.interactivity) return;
    
    // Create enhanced prompt based on current interactivity analysis
    const enhancedPrompt = createInteractivityFollowupPrompt(state.prompt, state.interactivity);
    
    // Clear cache for this prompt to force regeneration
    const cacheKey = getCacheKey(state.prompt, config.model);
    wireframeCache.delete(cacheKey);
    
    // Generate with enhanced prompt
    await generateFromPromptInternal(enhancedPrompt, { streaming: true }, state.prompt, 0);
  }, [state.prompt, state.interactivity, getCacheKey, config.model, generateFromPromptInternal]);

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

  const clearCacheAction = useCallback(() => {
    clearCache();
  }, []);

  const getCacheStatsAction = useCallback(() => {
    return getCacheStats();
  }, []);

  return {
    ...state,
    setPrompt,
    generateFromPrompt,
    cancelGeneration,
    regenerateWithEnhancements,
    clearCache: clearCacheAction,
    getCacheStats: getCacheStatsAction
  };
}
