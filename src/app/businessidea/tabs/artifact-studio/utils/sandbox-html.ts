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

  // CSP:
  // - default-src 'none': block everything by default
  // - script-src 'self' 'nonce-...': allow local UMD scripts + a single inline script with matching nonce
  // - style-src 'self': allow local CSS only
  // - img-src 'self' data:; font-src 'self': safe local assets
  // - connect-src 'none': disable network
  // - frame-ancestors 'none': prevent clickjacking of the sandbox document itself
  const csp = [
    "default-src 'none'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'none'",
    "frame-ancestors 'none'"
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
      
      // Setup messaging to parent
      window.addEventListener('error', function(e) {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: 'runtime-error',
            message: e.message || 'Unknown error',
            stack: e.error?.stack || ''
          }, '*');
        }
      });
      
      window.addEventListener('unhandledrejection', function(e) {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: 'runtime-error',
            message: (e.reason && e.reason.message) ? e.reason.message : 'Unhandled promise rejection',
            stack: e.reason && e.reason.stack ? e.reason.stack : ''
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
  
  // Banned tokens that could lead to security issues or external calls
  const BANNED_TOKENS = [
    'import',
    'require',
    'window.location',
    'document.location',
    'localStorage',
    'sessionStorage',
    'fetch',
    'XMLHttpRequest',
    'WebSocket',
    'eval',
    'Function(',
    'new Function',
    'setTimeout',
    'setInterval',
    'dangerouslySetInnerHTML'
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
