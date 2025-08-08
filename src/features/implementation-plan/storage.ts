const SETTINGS_KEY = 'implPlan:settings:v1';
const CACHE_PREFIX = 'implPlan:cache:v1:';

export interface StoredSettings {
  systemPromptOverride: string;
  sources: string[];
}

export const loadSettings = (): StoredSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { systemPromptOverride: '', sources: [] };
    const parsed = JSON.parse(raw);
    return {
      systemPromptOverride: parsed.systemPromptOverride || '',
      sources: Array.isArray(parsed.sources) ? parsed.sources : []
    };
  } catch {
    return { systemPromptOverride: '', sources: [] };
  }
};

export const saveSettings = (settings: StoredSettings) => {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch {}
};

export const settingsHash = (settings: StoredSettings) => {
  try {
    const data = JSON.stringify(settings);
    let hash = 0;
    for (let i = 0; i < data.length; i++) hash = ((hash << 5) - hash) + data.charCodeAt(i) | 0;
    return String(hash);
  } catch {
    return '0';
  }
};

export function saveCachedPlan(ideaId: string, settingsKey: string, plan: any) {
  const k = `${CACHE_PREFIX}${ideaId}:${settingsKey}`;
  try { localStorage.setItem(k, JSON.stringify(plan)); } catch {}
}

export function loadCachedPlan(ideaId: string, settingsKey: string): any | undefined {
  const k = `${CACHE_PREFIX}${ideaId}:${settingsKey}`;
  try {
    const raw = localStorage.getItem(k);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}
