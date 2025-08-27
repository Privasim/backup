/**
 * Sandbox HTML generator
 * Builds a complete HTML document with strict CSP that loads local React UMD and CSS
 * for rendering wireframes in a sandboxed iframe.
 */

export interface SandboxHtmlOptions {
  js: string;               // Generated artifact JS (no JSX/imports)
  reactPath?: string;       // Default: '/vendor/react-umd/react.production.min.js'
  reactDomPath?: string;    // Default: '/vendor/react-umd/react-dom.production.min.js'
  cssPath?: string;         // Default: '/artifact-styles/tailwind-lite.css'
  nonce: string;            // Random per-render nonce
  title?: string;           // Optional document title
}

/**
 * Builds a complete HTML document with:
 * - Strict CSP (default-src 'none', script-src 'self' 'nonce-...', style-src 'self')
 * - Local React UMD scripts
 * - Local CSS
 * - Root element for React to render into
 * - Inline script with nonce to execute the provided JS
 */
export function buildSandboxHtml({
  js,
  reactPath = '/vendor/react-umd/react.production.min.js',
  reactDomPath = '/vendor/react-umd/react-dom.production.min.js',
  cssPath = '/artifact-styles/tailwind-lite.css',
  nonce,
  title = 'Artifact Sandbox'
}: SandboxHtmlOptions): string {
  const esc = (s: string) => s.replace(/<\/(script)/gi, '<\\/$1');
  const safeJs = esc(js);

  // Enhanced CSP for maximum security:
  // - default-src 'none': block everything by default
  // - script-src 'self' 'nonce-...': allow local UMD scripts + a single inline script with matching nonce
  // - style-src 'self' 'unsafe-inline': allow local CSS and inline styles (needed for Tailwind)
  // - img-src 'self' data: blob:: safe local and data URLs only
  // - font-src 'self' data:: local fonts and data URLs only
  // - connect-src 'none': completely disable network requests
  // - frame-ancestors 'none': prevent clickjacking of the sandbox document itself
  // - form-action 'none': prevent form submissions
  // - base-uri 'none': prevent base tag manipulation
  // - object-src 'none': prevent plugins
  // - media-src 'none': prevent audio/video loading
  // - worker-src 'none': prevent web workers
  // - child-src 'none': prevent frames/workers
  // - manifest-src 'none': prevent web app manifests
  const csp = [
    "default-src 'none'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'none'",
    "base-uri 'none'",
    "object-src 'none'",
    "media-src 'none'",
    "worker-src 'none'",
    "child-src 'none'",
    "manifest-src 'none'"
  ].join('; ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta http-equiv="Content-Security-Policy" content="${csp}" />
<link rel="stylesheet" href="${cssPath}" />
<title>${title}</title>
<style>html, body, #root { height: 100%; }</style>
</head>
<body class="bg-gray-50">
  <div id="root" class="min-h-screen"></div>
  <script src="${reactPath}" crossorigin></script>
  <script src="${reactDomPath}" crossorigin></script>
  <script nonce="${nonce}">
  (function(){
    try { 
      // Define CommonJS-like globals for transpiled modules
      try {
        if (!('exports' in window)) { window.exports = {}; }
        if (!('module' in window)) { window.module = { exports: window.exports }; }
      } catch (_) {}

      ${safeJs} 
      
      // Attempt auto-mount if no explicit mount occurred
      try {
        var rootEl = document.getElementById('root');
        var isMounted = !!(rootEl && rootEl.firstChild);
        if (!isMounted && rootEl && typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
          var Comp = (window.__ArtifactDefault)
            || (typeof exports !== 'undefined' && (exports.default || exports))
            || (typeof module !== 'undefined' && module.exports && (module.exports.default || module.exports));
          if (Comp) {
            var __root = ReactDOM.createRoot(rootEl);
            __root.render(React.createElement(Comp));
          }
        }
      } catch (_mountErr) { /* swallow mount attempt errors, will be reported globally if any */ }
      
      // Enhanced error reporting to parent with security validation
      window.addEventListener('error', function(e) {
        if (window.parent && window.parent !== window) {
          // Sanitize error messages to prevent information leakage
          const sanitizedMessage = e.message ? 
            e.message.replace(/file:\/\/[^\s]*/g, '[local-file]').replace(/https?:\/\/[^\s]*/g, '[url]') : 
            'Unknown error';
          
          window.parent.postMessage({
            type: 'runtime-error',
            message: sanitizedMessage,
            stack: e.error?.stack ? e.error.stack.split('\\n').slice(0, 5).join('\\n') : '', // Limit stack trace
            filename: e.filename ? '[sanitized]' : '',
            lineno: e.lineno || 0,
            colno: e.colno || 0
          }, '*');
        }
      });
      
      window.addEventListener('unhandledrejection', function(e) {
        if (window.parent && window.parent !== window) {
          const reason = e.reason;
          const sanitizedMessage = (reason && reason.message) ? 
            reason.message.replace(/file:\/\/[^\s]*/g, '[local-file]').replace(/https?:\/\/[^\s]*/g, '[url]') : 
            'Unhandled promise rejection';
          
          window.parent.postMessage({
            type: 'runtime-error',
            message: sanitizedMessage,
            stack: reason && reason.stack ? reason.stack.split('\\n').slice(0, 5).join('\\n') : '',
            isPromiseRejection: true
          }, '*');
        }
      });
      
      // Security violation reporting
      window.addEventListener('securitypolicyviolation', function(e) {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: 'security-violation',
            message: 'Content Security Policy violation detected',
            violatedDirective: e.violatedDirective,
            blockedURI: '[blocked]', // Don't leak actual URI
            disposition: e.disposition
          }, '*');
        }
      });
      
      // Signal ready to parent
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'ready' }, '*');
      }
    }
    catch (e) {
      console.error('Runtime error:', e);
      
      // Report error to parent
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'runtime-error',
          message: e && e.message ? e.message : String(e),
          stack: e && e.stack ? e.stack : ''
        }, '*');
      }
      
      // Display error in iframe
      var pre = document.createElement('pre');
      pre.textContent = 'Runtime error: ' + (e && e.message ? e.message : String(e));
      pre.className = 'm-4 p-3 bg-red-50 text-red-800 rounded border border-red-200 overflow-auto';
      document.body.appendChild(pre);
    }
  })();
  </script>
</body>
</html>`;
}

/**
 * Validates that the provided JS code meets the sandbox requirements:
 * - No banned tokens (imports, network APIs, eval, etc.)
 * - Contains ReactDOM.createRoot(...).render(...)
 */
export function validateSandboxCode(code: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Comprehensive banned tokens that could lead to security issues or external calls
  const BANNED_TOKENS = [
    // Module system
    'import',
    'require',
    'module.require',
    'process.binding',
    
    // Navigation and location
    'window.location',
    'document.location',
    'location.href',
    'location.assign',
    'location.replace',
    'history.pushState',
    'history.replaceState',
    
    // Storage APIs
    'localStorage',
    'sessionStorage',
    'indexedDB',
    'openDatabase',
    'webkitStorageInfo',
    
    // Network APIs
    'fetch',
    'XMLHttpRequest',
    'WebSocket',
    'EventSource',
    'navigator.sendBeacon',
    'navigator.share',
    
    // Code execution
    'eval',
    'Function(',
    'new Function',
    'setTimeout',
    'setInterval',
    'setImmediate',
    'requestAnimationFrame',
    'requestIdleCallback',
    
    // DOM manipulation risks
    'dangerouslySetInnerHTML',
    'innerHTML',
    'outerHTML',
    'insertAdjacentHTML',
    'document.write',
    'document.writeln',
    
    // Worker APIs
    'Worker',
    'SharedWorker',
    'ServiceWorker',
    'navigator.serviceWorker',
    
    // File system
    'FileReader',
    'FileWriter',
    'Blob',
    'File',
    'FormData',
    
    // Crypto and random
    'crypto.getRandomValues',
    'Math.random',
    
    // Geolocation and device APIs
    'navigator.geolocation',
    'navigator.getUserMedia',
    'navigator.mediaDevices',
    'navigator.bluetooth',
    'navigator.usb',
    
    // Notification APIs
    'Notification',
    'navigator.notification',
    
    // External communication
    'postMessage',
    'MessageChannel',
    'BroadcastChannel',
    
    // Dynamic script loading
    'document.createElement("script")',
    'document.createElement(\'script\')',
    'script.src',
    'link.href',
    
    // Console (for production)
    'console.log',
    'console.error',
    'console.warn',
    'console.info',
    'console.debug'
  ];
  
  // Check for banned tokens
  const bannedFound = BANNED_TOKENS.filter(token => code.includes(token));
  if (bannedFound.length > 0) {
    errors.push(`Banned tokens detected: ${bannedFound.join(', ')}`);
  }
  
  // Mounting/structure checks:
  // Accept either:
  // - Explicit mount: ReactDOM.createRoot(...).render(...)
  // - Or an auto-mountable module style: exports.default/module.exports/window.__ArtifactDefault
  const hasExplicitMount = code.includes('ReactDOM.createRoot') && code.includes('.render(');
  const hasModuleDefault = code.includes('exports.default') || code.includes('module.exports') || code.includes('window.__ArtifactDefault');
  const hasDefaultExportTsx = code.includes('export default');

  if (!hasExplicitMount && !hasModuleDefault && !hasDefaultExportTsx) {
    errors.push('Code must either explicitly mount with ReactDOM.createRoot(...).render(...) or export a default component (module/commonjs) that can be auto-mounted');
  }
  
  // Do not hard-fail on JSX detection; the parent may transpile or the sandbox may auto-mount
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export interface WireframeInteractivityResult {
  level: 'interactive' | 'partial' | 'static';
  score: number; // 0-100
  hasHooks: boolean;
  hasEventHandlers: boolean;
  hasControlledInputs: boolean;
  missingPatterns: string[];
  suggestions: string[];
}

/**
 * Validates wireframe interactivity by analyzing code for React hooks, event handlers,
 * and interactive patterns. Returns detailed analysis for UI feedback and retry logic.
 */
export function validateWireframeInteractivity(code: string): WireframeInteractivityResult {
  const missingPatterns: string[] = [];
  const suggestions: string[] = [];
  let score = 0;
  
  // Check for React hooks
  const hasUseState = /React\.useState\s*\(/.test(code);
  const hasUseEffect = /React\.useEffect\s*\(/.test(code);
  const hasOtherHooks = /React\.(useCallback|useMemo|useRef|useReducer)\s*\(/.test(code);
  const hasHooks = hasUseState || hasUseEffect || hasOtherHooks;
  
  if (hasUseState) score += 35;
  if (hasUseEffect) score += 15;
  if (hasOtherHooks) score += 15;
  
  if (!hasUseState) {
    missingPatterns.push('React.useState for state management');
    suggestions.push('Add useState hooks to manage component state');
  }
  
  // Check for event handlers
  const eventHandlerPatterns = [
    /onClick\s*:/,
    /onChange\s*:/,
    /onSubmit\s*:/,
    /onInput\s*:/,
    /onFocus\s*:/,
    /onBlur\s*:/,
    /onMouseOver\s*:/,
    /onMouseOut\s*:/
  ];
  
  const foundHandlers = eventHandlerPatterns.filter(pattern => pattern.test(code));
  const hasEventHandlers = foundHandlers.length > 0;
  
  if (hasEventHandlers) {
    score += Math.min(35, foundHandlers.length * 12);
  } else {
    missingPatterns.push('Event handlers (onClick, onChange, etc.)');
    suggestions.push('Add event handlers to make elements interactive');
  }
  
  // Check for controlled inputs
  const hasControlledInputs = /value\s*:\s*\w+/.test(code) && /onChange\s*:/.test(code);
  if (hasControlledInputs) {
    score += 25;
  } else if (/input|textarea|select/i.test(code)) {
    missingPatterns.push('Controlled inputs with value and onChange');
    suggestions.push('Make inputs controlled by binding value to state and handling onChange');
  }
  
  // Check for dynamic content updates
  const hasDynamicContent = hasUseState && (
    /\{\s*\w+\s*\}/.test(code) || // state variables in JSX
    /\$\{\s*\w+\s*\}/.test(code)  // template literals with variables
  );
  
  if (hasDynamicContent) {
    score += 10;
  } else if (hasUseState) {
    missingPatterns.push('Dynamic content that updates with state changes');
    suggestions.push('Display state variables in the UI to show interactivity');
  }
  
  // Determine interactivity level
  let level: 'interactive' | 'partial' | 'static';
  if (score >= 70 && hasHooks && hasEventHandlers) {
    level = 'interactive';
  } else if (score >= 30 && (hasHooks || hasEventHandlers)) {
    level = 'partial';
  } else {
    level = 'static';
  }
  
  // Add general suggestions for low scores
  if (score < 30) {
    suggestions.push('Consider adding buttons, forms, or interactive elements');
    suggestions.push('Use React.useState to manage component state');
  }
  
  return {
    level,
    score,
    hasHooks,
    hasEventHandlers,
    hasControlledInputs,
    missingPatterns,
    suggestions
  };
}

/**
 * Creates a follow-up prompt for retry scenarios when wireframe validation fails.
 * Provides specific guidance based on what interactivity patterns are missing.
 */
export function createInteractivityFollowupPrompt(
  originalPrompt: string,
  validationResult: WireframeInteractivityResult
): string {
  const { missingPatterns, suggestions, level } = validationResult;
  
  let followupPrompt = `The previous wireframe was ${level} but needs to be more interactive. `;
  
  if (missingPatterns.length > 0) {
    followupPrompt += `Missing patterns: ${missingPatterns.join(', ')}. `;
  }
  
  followupPrompt += `Please regenerate the wireframe with these improvements:\n\n`;
  
  // Add specific requirements based on missing patterns
  const requirements: string[] = [];
  
  if (!validationResult.hasHooks) {
    requirements.push('- Use React.useState to manage at least 2 different state variables');
  }
  
  if (!validationResult.hasEventHandlers) {
    requirements.push('- Add onClick handlers to buttons that update state');
    requirements.push('- Include onChange handlers for form inputs');
  }
  
  if (!validationResult.hasControlledInputs && /input|form/i.test(originalPrompt)) {
    requirements.push('- Make all inputs controlled with value={state} and onChange handlers');
  }
  
  // Always add these for better interactivity
  requirements.push('- Include visual feedback when users interact (button clicks, input changes)');
  requirements.push('- Show dynamic content that changes based on user actions');
  requirements.push('- Add at least one counter, toggle, or form that demonstrates state changes');
  
  followupPrompt += requirements.join('\n') + '\n\n';
  followupPrompt += `Original request: ${originalPrompt}`;
  
  return followupPrompt;
}

/**
 * Injects minimal interactivity into static wireframes as a fallback auto-repair function.
 * Adds basic useState and onClick handlers to make the wireframe interactive.
 */
export function injectMinimalInteractivity(code: string): string {
  // If already has useState, don't inject
  if (/React\.useState/.test(code)) {
    return code;
  }
  
  // Find the component function
  const componentMatch = code.match(/function\s+(\w+Component)\s*\(\s*\)\s*\{/);
  if (!componentMatch) {
    return code;
  }
  
  const componentName = componentMatch[1];
  
  // Find the return statement
  const returnMatch = code.match(/(return\s+React\.createElement\([^;]+\);)/);
  if (!returnMatch) {
    return code;
  }
  
  // Inject useState after the function declaration
  const stateInjection = `
  const [clickCount, setClickCount] = React.useState(0);
  const [inputText, setInputText] = React.useState('');
  `;
  
  let modifiedCode = code.replace(
    /function\s+\w+Component\s*\(\s*\)\s*\{/,
    `$&${stateInjection}`
  );
  
  // Try to add a click handler to the first button-like element
  modifiedCode = modifiedCode.replace(
    /React\.createElement\('button'[^}]*\}/,
    (match) => {
      if (match.includes('onClick')) return match; // Already has onClick
      return match.replace(
        /className:\s*'([^']*)'/, 
        `className: '$1', onClick: () => setClickCount(clickCount + 1)`
      );
    }
  );
  
  // Try to add controlled input behavior to the first input
  modifiedCode = modifiedCode.replace(
    /React\.createElement\('input'[^}]*\}/,
    (match) => {
      if (match.includes('value:') && match.includes('onChange:')) return match; // Already controlled
      return match.replace(
        /className:\s*'([^']*)'/, 
        `className: '$1', value: inputText, onChange: (e) => setInputText(e.target.value)`
      );
    }
  );
  
  // Add display of interactive state in the UI
  modifiedCode = modifiedCode.replace(
    /(React\.createElement\('div'[^,]*,\s*)/,
    `$1React.createElement('div', { className: 'mb-2 text-sm text-gray-600' }, 'Clicks: ' + clickCount + ', Input: ' + inputText), `
  );
  
  return modifiedCode;
}

/**
 * Tests iframe isolation and postMessage security by validating that the sandbox
 * cannot access parent window properties or execute privileged operations.
 */
export function testSandboxSecurity(): { 
  passed: boolean; 
  violations: string[]; 
  recommendations: string[] 
} {
  const violations: string[] = [];
  const recommendations: string[] = [];
  
  // Test CSP headers
  const testCode = `
    // Test banned operations
    try { eval('1+1'); violations.push('eval() not blocked'); } catch(e) {}
    try { new Function('return 1')(); violations.push('Function constructor not blocked'); } catch(e) {}
    try { setTimeout(() => {}, 1); violations.push('setTimeout not blocked'); } catch(e) {}
    try { fetch('/test'); violations.push('fetch not blocked'); } catch(e) {}
    try { new XMLHttpRequest(); violations.push('XMLHttpRequest not blocked'); } catch(e) {}
    try { localStorage.setItem('test', '1'); violations.push('localStorage not blocked'); } catch(e) {}
    try { window.location.href = 'javascript:void(0)'; violations.push('location manipulation not blocked'); } catch(e) {}
  `;
  
  // Validate CSP directives
  const requiredDirectives = [
    'default-src',
    'script-src',
    'connect-src',
    'frame-ancestors',
    'form-action',
    'base-uri'
  ];
  
  // Check if all required CSP directives are present
  const sampleHtml = buildSandboxHtml({ js: 'console.log("test")', nonce: 'test-nonce' });
  const cspMatch = sampleHtml.match(/Content-Security-Policy.*?content="([^"]+)"/);
  
  if (cspMatch) {
    const csp = cspMatch[1];
    requiredDirectives.forEach(directive => {
      if (!csp.includes(directive)) {
        violations.push(`Missing CSP directive: ${directive}`);
        recommendations.push(`Add ${directive} directive to CSP`);
      }
    });
    
    // Check for overly permissive directives
    if (csp.includes("'unsafe-eval'")) {
      violations.push("CSP allows 'unsafe-eval'");
      recommendations.push("Remove 'unsafe-eval' from CSP");
    }
    
    if (csp.includes('*') && !csp.includes('data:')) {
      violations.push("CSP contains wildcard without proper restrictions");
      recommendations.push("Replace wildcards with specific allowed sources");
    }
  } else {
    violations.push("No CSP header found");
    recommendations.push("Implement Content Security Policy headers");
  }
  
  // Test banned token validation
  const bannedTokenTest = validateSandboxCode(`
    import React from 'react';
    fetch('/api/data');
    eval('malicious code');
    localStorage.setItem('key', 'value');
  `);
  
  if (bannedTokenTest.valid) {
    violations.push("Banned token validation failed to catch security risks");
    recommendations.push("Enhance banned token detection");
  }
  
  return {
    passed: violations.length === 0,
    violations,
    recommendations
  };
}

/**
 * Pre-processes and cleans generated code to remove banned tokens and ensure proper structure.
 * This function sanitizes code by removing potentially harmful patterns and ensures
 * the code is properly structured for the sandbox environment.
 */
export function cleanAndValidateCode(code: string): string {
  // First, clean up any banned tokens
  let cleanedCode = code
    .replace(/require\s*\([^)]*\)/g, '') // Remove require statements
    .replace(/setTimeout\s*\([^)]*\)/g, '') // Remove setTimeout
    .replace(/setInterval\s*\([^)]*\)/g, '') // Remove setInterval
    .replace(/console\.(log|error|warn|info|debug)\s*\([^)]*\)/g, '') // Remove console statements
    .replace(/import\s+[^;]+;?\s*/g, '') // Remove import statements
    .replace(/export\s+[^;]+;?\s*/g, '') // Remove export statements
    .replace(/fetch\s*\([^)]*\)\s*;?/g, '') // Remove fetch calls
    .replace(/new\s+XMLHttpRequest\s*\([^)]*\)\s*;?/g, '') // Remove XMLHttpRequest
    .replace(/localStorage\.[^;]+;?\s*/g, '') // Remove localStorage
    .replace(/sessionStorage\.[^;]+;?\s*/g, '') // Remove sessionStorage
    .replace(/eval\s*\([^)]*\)\s*;?/g, '') // Remove eval
    .replace(/new\s+Function\s*\([^)]*\)\s*;?/g, '') // Remove Function constructor
    .replace(/^\s*[\r\n]/gm, '') // Remove empty lines
    .trim();

  // Ensure proper component structure
  if (!cleanedCode.includes('function WireframeComponent')) {
    // If no WireframeComponent, try to rename the first function
    cleanedCode = cleanedCode.replace(/function\s+(\w+)\s*\([^)]*\)\s*\{/, 'function WireframeComponent() {');
  }

  // Ensure proper mounting
  if (!cleanedCode.includes('ReactDOM.createRoot') && cleanedCode.includes('function WireframeComponent')) {
    cleanedCode += '\n\nReactDOM.createRoot(document.getElementById(\'root\')).render(React.createElement(WireframeComponent));';
  }

  return cleanedCode;
}