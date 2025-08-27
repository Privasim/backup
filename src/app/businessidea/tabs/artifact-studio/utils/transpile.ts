/**
 * Mock transpile utility for testing
 */

export interface TranspileResult {
  ok: boolean;
  js?: string;
  error?: string;
  errors?: string[];
}

export async function transpileTsxToJs(code: string): Promise<TranspileResult> {
  // Simple mock implementation for testing
  if (!code || code.trim() === '') {
    return {
      ok: false,
      error: 'Empty code provided'
    };
  }

  // Check for basic syntax issues
  if (code.includes('import ') || code.includes('export ')) {
    return {
      ok: false,
      error: 'Code contains imports/exports which are not allowed in sandbox'
    };
  }

  // Mock successful transpilation
  return {
    ok: true,
    js: code // In real implementation, this would be transpiled
  };
}