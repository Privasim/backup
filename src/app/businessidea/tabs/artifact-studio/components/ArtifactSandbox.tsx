'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { isValidIframeMessage, type IframeToParent } from '../utils/sandbox-protocol';

interface ArtifactSandboxProps {
  js: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  onRuntimeError?: (err: { message: string; stack?: string }) => void;
  onReady?: () => void;
}

export function ArtifactSandbox({
  js,
  className = '',
  width = '100%',
  height = '100%',
  onRuntimeError,
  onReady
}: ArtifactSandboxProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastJsRef = useRef<string>('');

  const handleMessage = useCallback((event: MessageEvent) => {
    // Validate origin - in production, this should be more specific
    if (event.origin !== window.location.origin) {
      return;
    }

    if (!isValidIframeMessage(event.data)) {
      return;
    }

    const message = event.data as IframeToParent;

    switch (message.type) {
      case 'ready':
        onReady?.();
        // Send JS if we have it
        if (js && js !== lastJsRef.current) {
          const iframe = iframeRef.current;
          if (iframe?.contentWindow) {
            iframe.contentWindow.postMessage({ type: 'load', js }, window.location.origin);
            lastJsRef.current = js;
          }
        }
        break;
      
      case 'runtime-error':
        onRuntimeError?.({
          message: message.message || 'Unknown runtime error',
          stack: message.stack
        });
        break;
      
      case 'runtime-log':
        console.log('Artifact log:', message.data);
        break;
    }
  }, [js, onReady, onRuntimeError]);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  // Send updated JS when it changes
  useEffect(() => {
    if (js && js !== lastJsRef.current && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'load', js }, window.location.origin);
      lastJsRef.current = js;
    }
  }, [js]);

  const srcdoc = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src data: blob:; connect-src 'none';">
  <script src="/vendor/react-umd/react.production.min.js"></script>
  <script src="/vendor/react-umd/react-dom.production.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    }
    #root {
      width: 100%;
      height: 100vh;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    let root = null;
    
    window.addEventListener('error', function(event) {
      parent.postMessage({
        type: 'runtime-error',
        message: event.message,
        stack: event.error?.stack
      }, '*');
    });

    window.addEventListener('unhandledrejection', function(event) {
      parent.postMessage({
        type: 'runtime-error',
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack
      }, '*');
    });

    window.addEventListener('message', function(event) {
      if (event.data?.type === 'load' && event.data?.js) {
        try {
          // Create blob URL for the JS code
          const blob = new Blob([event.data.js], { type: 'application/javascript' });
          const blobUrl = URL.createObjectURL(blob);
          
          // Remove any existing script
          const existingScript = document.getElementById('artifact-script');
          if (existingScript) {
            existingScript.remove();
          }
          
          // Create and append new script
          const script = document.createElement('script');
          script.id = 'artifact-script';
          script.src = blobUrl;
          script.onload = function() {
            try {
              // Get the default export and render it
              if (window.exports && window.exports.default) {
                const Component = window.exports.default;
                const rootElement = document.getElementById('root');
                
                if (rootElement && React && ReactDOM) {
                  if (!root) {
                    root = ReactDOM.createRoot(rootElement);
                  }
                  root.render(React.createElement(Component));
                }
              }
              URL.revokeObjectURL(blobUrl);
            } catch (error) {
              parent.postMessage({
                type: 'runtime-error',
                message: error.message,
                stack: error.stack
              }, '*');
            }
          };
          script.onerror = function() {
            parent.postMessage({
              type: 'runtime-error',
              message: 'Failed to load artifact script'
            }, '*');
            URL.revokeObjectURL(blobUrl);
          };
          
          document.head.appendChild(script);
        } catch (error) {
          parent.postMessage({
            type: 'runtime-error',
            message: error.message,
            stack: error.stack
          }, '*');
        }
      }
    });

    // Signal ready
    parent.postMessage({ type: 'ready' }, '*');
  </script>
</body>
</html>`;

  return (
    <iframe
      ref={iframeRef}
      className={`border border-gray-200 rounded-lg ${className}`}
      style={{ width, height }}
      srcDoc={srcdoc}
      sandbox="allow-scripts"
      title="Artifact Preview"
    />
  );
}
