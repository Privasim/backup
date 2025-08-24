const SETTINGS_KEY = 'implPlan:settings:v1';
const CACHE_PREFIX = 'implPlan:cache:v1:';

export interface PlanSettings {
  systemPromptOverride: string;
  sources: string[];
  usePlaceholder?: boolean;
  simulateStreaming?: boolean;
  compactMode?: boolean;
  compactMaxPhaseCards?: number;
  lengthPreset?: 'brief' | 'standard' | 'long';
}

export interface StoredSettings extends PlanSettings {
  // Same as PlanSettings but all fields are optional for storage
}

export const DEFAULT_SETTINGS: PlanSettings = {
  systemPromptOverride: '',
  sources: [],
  usePlaceholder: false,
  simulateStreaming: false,
  compactMode: false,
  compactMaxPhaseCards: 4,
  lengthPreset: 'long'
};

export function loadSettings(): PlanSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load implementation plan settings, using defaults', error);
  }
  return DEFAULT_SETTINGS;
}

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
