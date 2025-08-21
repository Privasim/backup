'use client';

import React, { useMemo } from 'react';
import TabContainer from './TabContainer';
import { useChatbox } from '@/components/chatbox/ChatboxProvider';
import { getConversationTabState, setConversationTabState } from './utils/tab-state';
import type { TabId } from './TabContext';

export default function ConversationTabs() {
  const { activeConversationId } = useChatbox();

  const { initialTab, key } = useMemo(() => {
    const convId = activeConversationId || 'global';
    const saved = getConversationTabState(convId);
    const init = (saved?.globalActiveTab as TabId) || 'businessplan';
    return { initialTab: init, key: `conv-tabs:${convId}` };
  }, [activeConversationId]);

  function handleTabChange(tab: TabId) {
    const convId = activeConversationId || 'global';
    setConversationTabState(convId, { globalActiveTab: tab });
  }

  return (
    <TabContainer key={key} initialTab={initialTab} onTabChange={handleTabChange} />
  );
}
