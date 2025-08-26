import React, { useEffect, useMemo, useRef, useState } from 'react';
import { buildSandboxHtml, validateSandboxCode } from '../utils/sandbox-html';
import { isValidIframeMessage, isTrustedOrigin, IframeToParent } from '../utils/sandbox-protocol';

export interface SandboxFrameProps {
  code: string;                  // Generated JS artifact
  expectedOrigin?: string;       // window.location.origin of the parent (defaults to window.location.origin)
  onRuntimeError?: (error: { message: string; stack?: string }) => void;
  onReady?: () => void;
  onRuntimeLog?: (data: unknown) => void;
  className?: string;
}

/**
 * Generates a cryptographically secure random nonce for CSP
 * @returns A 32-character hex string (128-bit) nonce
 */
function randomNonce(): string {
  // 128-bit nonce
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * SandboxFrame component that renders a sandboxed iframe with the provided code
 * - Uses about:blank + document.write to create a same-origin iframe
 * - Applies strict CSP with nonce for inline script
 * - Loads local React UMD and CSS
 * - Validates and renders the provided code
 * - Handles messaging between parent and iframe
 */
export function SandboxFrame({ 
  code, 
  expectedOrigin, 
  onRuntimeError, 
  onReady, 
  onRuntimeLog,
  className = 'w-full h-full'
}: SandboxFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Generate a new nonce for each code change
  const nonce = useMemo(() => randomNonce(), [code]);
  
  // Default to current origin if not provided
  const origin = expectedOrigin || (typeof window !== 'undefined' ? window.location.origin : '');

  // Validate code before rendering
  const validation = useMemo(() => validateSandboxCode(code), [code]);
  
  // Write HTML to iframe when code or nonce changes
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    
    // Clear any previous error
    setError(null);
    
    // If code is invalid, don't render and set error
    if (!validation.valid) {
      setError(validation.errors.join('; '));
      return;
    }

    // Create same-origin about:blank document
    iframe.src = 'about:blank';
    const doc = iframe.contentDocument;
    if (!doc) {
      setError('Could not access iframe document');
      return;
    }

    // Build HTML with CSP and write to iframe
    const html = buildSandboxHtml({ js: code, nonce });
    doc.open();
    doc.write(html);
    doc.close();
  }, [code, nonce, validation]);

  // Set up message listener for iframe communication
  useEffect(() => {
    if (!origin) return;
    
    const handler = (ev: MessageEvent) => {
      // Validate origin and message format
      if (!isTrustedOrigin(ev.origin, origin)) return;
      if (!isValidIframeMessage(ev.data)) return;
      
      const message = ev.data as IframeToParent;
      
      // Handle different message types
      switch (message.type) {
        case 'ready':
          onReady?.();
          break;
        case 'runtime-error':
          setError(message.message || 'Unknown error');
          onRuntimeError?.({ 
            message: message.message || 'Unknown error', 
            stack: message.stack 
          });
          break;
        case 'runtime-log':
          onRuntimeLog?.(message.data);
          break;
      }
    };
    
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [origin, onReady, onRuntimeError, onRuntimeLog]);

  return (
    <div className="relative w-full h-full">
      <iframe
        ref={iframeRef}
        title="Artifact Sandbox"
        className={className}
        sandbox="allow-scripts allow-same-origin"
      />
      
      {error && (
        <div className="absolute inset-0 bg-white bg-opacity-95 p-4 overflow-auto">
          <div className="bg-red-50 border border-red-200 rounded p-3 text-red-800">
            <h3 className="font-semibold mb-1">Sandbox Error</h3>
            <pre className="whitespace-pre-wrap text-sm">{error}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
