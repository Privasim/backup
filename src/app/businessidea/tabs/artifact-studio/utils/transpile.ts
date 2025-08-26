import * as Babel from '@babel/standalone';
import { FEATURE_FLAGS } from '@/config/feature-flags';

const BANNED_TOKENS = [
  'import',
  'require',
  'window',
  'document',
  'localStorage',
  'sessionStorage',
  'fetch',
  'XMLHttpRequest',
  'WebSocket',
  'eval',
  'Function',
  'setTimeout',
  'setInterval',
  'dangerouslySetInnerHTML'
];

/**
 * @deprecated Use Path A sandbox implementation instead which eliminates runtime transpilation
 * This will be removed in a future release. See Path A implementation in sandbox-html.ts
 * 
 * Transpiles TSX to JS using Babel
 * @param code TSX code to transpile
 * @returns Transpiled JS or error
 */
export async function transpileTsxToJs(code: string): Promise<{ ok: boolean; js?: string; error?: string }> {
  // Check if Path A is enabled and warn about deprecation
  if (FEATURE_FLAGS.USE_PATH_A_SANDBOX) {
    console.warn(
      'transpileTsxToJs is deprecated and will be removed in a future release. ' +
      'The Path A sandbox implementation is now active which eliminates runtime transpilation.'
    );
  }

  try {
    // Pre-pass: check for banned tokens
    const bannedFound = BANNED_TOKENS.filter(token => code.includes(token));
    if (bannedFound.length > 0) {
      return {
        ok: false,
        error: `Banned tokens detected: ${bannedFound.join(', ')}`
      };
    }

    // Ensure there's a default export function
    if (!code.includes('export default function')) {
      return {
        ok: false,
        error: 'Code must contain exactly one default export function'
      };
    }

    // Transpile with Babel
    const result = Babel.transform(code, {
      presets: [
        ['env', { modules: 'commonjs' }],
        ['typescript', { isTSX: true, allExtensions: true }],
        ['react', { runtime: 'classic' }]
      ],
      filename: 'artifact.tsx'
    });

    if (!result.code) {
      return {
        ok: false,
        error: 'Transpilation failed - no output generated'
      };
    }

    // Expose default export on window.__ArtifactDefault for auto-mount
    const expose = `\n;(function(){try{\n  if (typeof window !== 'undefined') {\n    // Prefer exports.default (Babel commonjs output) or module.exports.default\n    var d = (typeof exports !== 'undefined' && (exports.default || exports.Artifact || exports))\n         || (typeof module !== 'undefined' && module.exports && (module.exports.default || module.exports));\n    if (d && !window.__ArtifactDefault) window.__ArtifactDefault = d;\n  }\n}catch(_){}})();\n`;

    return {
      ok: true,
      js: result.code + expose
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown transpilation error';
    
    // Try to extract line/column info from Babel errors
    let formattedError = errorMessage;
    if (error && typeof error === 'object' && 'loc' in error) {
      const loc = (error as any).loc;
      if (loc && typeof loc.line === 'number') {
        formattedError = `Line ${loc.line}: ${errorMessage}`;
      }
    }

    return {
      ok: false,
      error: formattedError
    };
  }
}
