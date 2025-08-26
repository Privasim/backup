'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useChatbox } from '@/components/chatbox/ChatboxProvider';
import ChatboxControls from '@/components/chatbox/ChatboxControls';
import { useArtifactGeneration } from './hooks/useArtifactGeneration';
import { PromptPanel } from './components/PromptPanel';
import { ArtifactSubTabProvider } from './context/ArtifactSubTabContext';
import { ArtifactSubTabNavigation } from './components/ArtifactSubTabNavigation';
import { ArtifactSubTabContent } from './components/ArtifactSubTabContent';
import { validateSandboxCode } from './utils/sandbox-html';
import { useTab } from '@/app/businessidea/tabs/TabContext';
// Feature flag for Path A vs legacy transpile
import { FEATURE_FLAGS } from '@/config/feature-flags';

export default function ArtifactStudio() {
  const { config } = useChatbox();
  const { activeTab } = useTab();
  const {
    status,
    prompt,
    setPrompt,
    code,
    compile,
    runtime,
    generateFromPrompt,
    cancelGeneration
  } = useArtifactGeneration();

  const [validation, setValidation] = useState({
    apiValid: false,
    modelValid: false,
    message: ''
  });
  const [processedJs, setProcessedJs] = useState('');
  const [codeValidation, setCodeValidation] = useState<{ valid: boolean; errors: string[] }>({ valid: true, errors: [] });
  const [runtimeErrors, setRuntimeErrors] = useState<string[]>([]);

  // Performance optimization: skip heavy computations when not active
  const isActive = activeTab === 'artifact-studio';

  // Handle validation changes from ChatboxControls
  const handleValidationChange = useCallback((isValid: boolean) => {
    if (!isActive) return; // Skip when not active
    
    const apiValid = !!(config.apiKey && /^sk-or-v1-[a-f0-9]{32,}$/.test(config.apiKey));
    const modelValid = !!config.model;
    
    setValidation({
      apiValid,
      modelValid,
      message: !apiValid ? 'API key required' : !modelValid ? 'Model selection required' : ''
    });
  }, [config.apiKey, config.model, isActive]);

  // Update validation when config changes
  useEffect(() => {
    if (isActive) {
      handleValidationChange(true);
    }
  }, [handleValidationChange, isActive]);

  // Process code when it changes (active tab), regardless of compile.ok
  useEffect(() => {
    if (isActive && code) {
      // Path A: Direct JS validation without transpilation
      if (FEATURE_FLAGS.USE_PATH_A_SANDBOX) {
        const validation = validateSandboxCode(code);
        setCodeValidation(validation);

        if (validation.valid) {
          // Use the code directly without transpilation
          setProcessedJs(code);
          return;
        }

        // Fallback: attempt transpilation to CommonJS and auto-mount default export
        import('./utils/transpile').then(({ transpileTsxToJs }) => {
          transpileTsxToJs(code).then(result => {
            if (result.ok && result.js) {
              setProcessedJs(result.js);
              // Clear previous validation errors if transpile succeeded
              setRuntimeErrors([]);
            } else {
              setRuntimeErrors([
                ...validation.errors,
                ...(result.error ? [result.error] : [])
              ]);
            }
          });
        });
      } 
      // Legacy Path B: Transpile TSX to JS
      else {
        import('./utils/transpile').then(({ transpileTsxToJs }) => {
          transpileTsxToJs(code).then(result => {
            if (result.ok && result.js) {
              setProcessedJs(result.js);
            } else if (result.error) {
              setRuntimeErrors([result.error]);
            }
          });
        });
      }
    }
  }, [code, isActive]);

  const handleGenerate = useCallback(() => {
    if (isActive) {
      generateFromPrompt(prompt, { streaming: true });
    }
  }, [generateFromPrompt, prompt, isActive]);

  const handleRuntimeError = useCallback((error: { message: string; stack?: string }) => {
    if (isActive) {
      setRuntimeErrors(prev => [...prev, error.message]);
    }
  }, [isActive]);

  const handleSandboxReady = useCallback(() => {
    if (isActive) {
      setRuntimeErrors([]);
    }
  }, [isActive]);

  // Skip rendering heavy components when not active
  if (!isActive) {
    return <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>;
  }

  // Determine compile status for sub-tab navigation
  const compileStatus = 
    status === 'generating' || status === 'streaming' ? 'compiling' :
    compile.ok ? 'success' :
    compile.errors.length > 0 ? 'error' : 'idle';

  return (
    <ArtifactSubTabProvider>
      <div className="h-full flex flex-col">
        {/* Sub-Tab Navigation */}
        <ArtifactSubTabNavigation 
          compileStatus={compileStatus}
          runtimeErrors={runtimeErrors.length}
        />

        {/* Content Area */}
        <ArtifactSubTabContent
          code={code}
          compile={compile}
          processedJs={processedJs}
          codeValidation={codeValidation}
          onRuntimeError={handleRuntimeError}
          onSandboxReady={handleSandboxReady}
          runtimeErrors={runtimeErrors}
        />

        {/* Bottom Panel: Prompt + API Configuration */}
        <div className="bg-gray-50">
          <PromptPanel
            status={status}
            prompt={prompt}
            onChange={setPrompt}
            onGenerate={handleGenerate}
            onCancel={cancelGeneration}
            validation={validation}
          />
          
          {/* API Configuration - Compact */}
          <div className="px-4 pb-3">
            <details className="group">
              <summary className="cursor-pointer text-xs font-medium text-gray-700 hover:text-gray-900 list-none flex items-center justify-between">
                <span>API Configuration</span>
                <span className="text-xs text-gray-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="mt-2 border-t border-gray-200 pt-2">
                <ChatboxControls
                  mode="configOnly"
                  visibleTabs={{ api: true }}
                  onValidationChange={handleValidationChange}
                  className="text-xs"
                />
              </div>
            </details>
          </div>
        </div>
      </div>
    </ArtifactSubTabProvider>
  );
}
