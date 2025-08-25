// Message contracts for parent <-> iframe communication
export interface ParentToIframe {
  type: 'load';
  js: string;
}

export interface IframeToParent {
  type: 'ready' | 'runtime-error' | 'runtime-log';
  message?: string;
  stack?: string;
  data?: unknown;
}

export function isValidParentMessage(m: unknown): m is ParentToIframe {
  if (!m || typeof m !== 'object') return false;
  const msg = m as Record<string, unknown>;
  
  if (msg.type === 'load') {
    return typeof msg.js === 'string';
  }
  
  return false;
}

export function isValidIframeMessage(m: unknown): m is IframeToParent {
  if (!m || typeof m !== 'object') return false;
  const msg = m as Record<string, unknown>;
  
  if (msg.type === 'ready') {
    return true;
  }
  
  if (msg.type === 'runtime-error') {
    return typeof msg.message === 'string';
  }
  
  if (msg.type === 'runtime-log') {
    return true;
  }
  
  return false;
}

export function isTrustedOrigin(origin: string, expectedOrigin: string): boolean {
  return origin === expectedOrigin;
}
