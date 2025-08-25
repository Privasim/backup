'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useChatbox } from '@/components/chatbox/ChatboxProvider';
import ChatboxControls from '@/components/chatbox/ChatboxControls';
import { useArtifactGeneration } from './hooks/useArtifactGeneration';
import { PromptPanel } from './components/PromptPanel';
import { CodePanel } from './components/CodePanel';
import { ArtifactSandbox } from './components/ArtifactSandbox';
import { transpileTsxToJs } from './utils/transpile';

export default function ArtifactStudio() {
  const { config } = useChatbox();
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
  const [compiledJs, setCompiledJs] = useState('');
  const [runtimeErrors, setRuntimeErrors] = useState<string[]>([]);

  // Handle validation changes from ChatboxControls
  const handleValidationChange = useCallback((isValid: boolean) => {
    const apiValid = !!(config.apiKey && /^sk-or-v1-[a-f0-9]{32,}$/.test(config.apiKey));
    const modelValid = !!config.model;
    
    setValidation({
      apiValid,
      modelValid,
      message: !apiValid ? 'API key required' : !modelValid ? 'Model selection required' : ''
    });
  }, [config.apiKey, config.model]);

  // Update validation when config changes
  useEffect(() => {
    handleValidationChange(true);
  }, [handleValidationChange]);

  // Compile code when it changes and compilation is successful
  useEffect(() => {
    if (compile.ok && code) {
      transpileTsxToJs(code).then(result => {
        if (result.ok && result.js) {
          setCompiledJs(result.js);
        }
      });
    }
  }, [compile.ok, code]);

  const handleGenerate = useCallback(() => {
    generateFromPrompt(prompt, { streaming: true });
  }, [generateFromPrompt, prompt]);

  const handleRuntimeError = useCallback((error: { message: string; stack?: string }) => {
    setRuntimeErrors(prev => [...prev, error.message]);
  }, []);

  const handleSandboxReady = useCallback(() => {
    setRuntimeErrors([]);
  }, []);

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Three-pane layout */}
      <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
        {/* Left Panel: Prompt + API Config */}
        <div className="space-y-4 overflow-y-auto">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Artifact Studio</h2>
            <PromptPanel
              status={status}
              prompt={prompt}
              onChange={setPrompt}
              onGenerate={handleGenerate}
              onCancel={cancelGeneration}
              validation={validation}
            />
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">API Configuration</h3>
            <ChatboxControls
              mode="configOnly"
              visibleTabs={{ api: true }}
              onValidationChange={handleValidationChange}
              className="text-sm"
            />
          </div>
        </div>

        {/* Center Panel: Code */}
        <div className="overflow-y-auto">
          <CodePanel code={code} compile={compile} />
        </div>

        {/* Right Panel: Preview */}
        <div className="space-y-3 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Live Preview</h3>
            {status === 'compiled' && (
              <div className="text-xs text-green-600">✓ Ready</div>
            )}
          </div>
          
          <ArtifactSandbox
            js={compiledJs}
            className="w-full"
            height="400px"
            onRuntimeError={handleRuntimeError}
            onReady={handleSandboxReady}
          />

          {/* Runtime Errors */}
          {runtimeErrors.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-red-700">Runtime Errors</h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
                {runtimeErrors.map((error, index) => (
                  <div key={index} className="text-xs text-red-700 font-mono">
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
