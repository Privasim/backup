import * as Babel from '@babel/standalone';

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

export interface TranspileResult {
  ok: boolean;
  js?: string;
  errors?: string[];
}

export async function transpileTsxToJs(tsx: string): Promise<TranspileResult> {
  try {
    // Pre-pass: check for banned tokens
    const bannedFound = BANNED_TOKENS.filter(token => tsx.includes(token));
    if (bannedFound.length > 0) {
      return {
        ok: false,
        errors: [`Banned tokens detected: ${bannedFound.join(', ')}`]
      };
    }

    // Ensure there's a default export function
    if (!tsx.includes('export default function')) {
      return {
        ok: false,
        errors: ['Code must contain exactly one default export function']
      };
    }

    // Transpile with Babel
    const result = Babel.transform(tsx, {
      presets: [
        ['typescript', { isTSX: true, allExtensions: true }],
        ['react', { runtime: 'classic' }]
      ],
      filename: 'artifact.tsx'
    });

    if (!result.code) {
      return {
        ok: false,
        errors: ['Transpilation failed - no output generated']
      };
    }

    return {
      ok: true,
      js: result.code
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
      errors: [formattedError]
    };
  }
}
