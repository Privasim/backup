/*
  Persistence adapter for tab state (local-first, optional Supabase-ready)
  - Conversation tab state per conversationId
  - Profile settings local tab state
*/

export type ProfileSettingsTab = 'userprofile' | 'jobrisk' | 'businessplan';

export interface ConversationTabState {
  globalActiveTab?: string;
  profileActiveTab?: ProfileSettingsTab;
  lastViewedPlanConversationId?: string;
}

const CONV_KEY_PREFIX = 'tabstate:conversation:';
const PROFILE_SETTINGS_KEY = 'tabstate:profile-settings';

function hasWindow(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function safeRead<T>(key: string): T | undefined {
  if (!hasWindow()) return undefined;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return undefined;
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

function safeWrite<T>(key: string, value: T): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function getConversationTabState(conversationId: string): ConversationTabState | undefined {
  const key = `${CONV_KEY_PREFIX}${conversationId}`;
  return safeRead<ConversationTabState>(key);
}

export function setConversationTabState(conversationId: string, patch: Partial<ConversationTabState>): void {
  const key = `${CONV_KEY_PREFIX}${conversationId}`;
  const current = getConversationTabState(conversationId) || {};
  const next = { ...current, ...patch } as ConversationTabState;
  safeWrite(key, next);
}

export function getProfileSettingsTab(): ProfileSettingsTab | undefined {
  const data = safeRead<{ tab?: ProfileSettingsTab }>(PROFILE_SETTINGS_KEY);
  return data?.tab;
}

export function setProfileSettingsTab(tab: ProfileSettingsTab): void {
  safeWrite(PROFILE_SETTINGS_KEY, { tab });
}
// Implementation Plan specific state management
export interface ImplementationPlanTabState {
  lastViewedConversationId?: string;
  autoSwitchEnabled: boolean;
  preferredDisplayMode: 'markdown' | 'formatted';
}

const IMPL_PLAN_KEY = 'tabstate:implementation-plan';

export function getImplementationPlanTabState(): ImplementationPlanTabState | undefined {
  return safeRead<ImplementationPlanTabState>(IMPL_PLAN_KEY);
}

export function setImplementationPlanTabState(patch: Partial<ImplementationPlanTabState>): void {
  const current = getImplementationPlanTabState() || {
    autoSwitchEnabled: true,
    preferredDisplayMode: 'markdown'
  };
  const next = { ...current, ...patch } as ImplementationPlanTabState;
  safeWrite(IMPL_PLAN_KEY, next);
}

export function updateLastViewedPlanConversation(conversationId: string): void {
  setImplementationPlanTabState({ lastViewedConversationId: conversationId });
}