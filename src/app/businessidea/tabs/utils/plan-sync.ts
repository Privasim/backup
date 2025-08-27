import { useChatbox } from '@/components/chatbox/ChatboxProvider';
import { Conversation, ChatboxMessageData } from '@/components/chatbox/types';
import { useEffect, useState, useCallback } from 'react';
import { 
  getImplementationPlanTabState, 
  setImplementationPlanTabState, 
  updateLastViewedPlanConversation 
} from './tab-state';

export interface PlanSyncService {
  getActivePlanConversation(): Conversation | null;
  subscribeToPlanUpdates(callback: (content: string) => void): () => void;
  getCurrentPlanContent(): string | null;
  getPlanGenerationStatus(): 'idle' | 'generating' | 'completed' | 'error';
}

/**
 * Hook that provides synchronization with ChatboxProvider for implementation plan content
 */
export function usePlanSync() {
  const { conversations, activeConversationId, status } = useChatbox();
  const [currentPlanContent, setCurrentPlanContent] = useState<string | null>(null);
  const [planGenerationStatus, setPlanGenerationStatus] = useState<'idle' | 'generating' | 'completed' | 'error'>('idle');

  // Filter conversations to find implementation plan conversations
  // These are identified by titles ending with " Plan" or containing implementation-related keywords
  const getPlanConversations = useCallback(() => {
    console.log('usePlanSync: All conversations:', conversations.map(c => ({ id: c.id, title: c.title, messageCount: c.messages.length })));
    const planConversations = conversations.filter(conv => {
      const title = conv.title.toLowerCase();
      return (
        title.endsWith(' plan') || 
        title.includes('implementation') ||
        title.includes('business plan') ||
        title.startsWith('implementation plan') ||
        // Check if the conversation has messages with business plan content
        conv.messages.some(msg => 
          msg.type === 'assistant' && 
          msg.analysisType === 'business-suggestion' &&
          msg.content && 
          msg.content.length > 100 // Likely to be a plan if it's substantial content
        )
      );
    });
    console.log('usePlanSync: Plan conversations found:', planConversations.map(c => ({ id: c.id, title: c.title, messageCount: c.messages.length })));
    return planConversations;
  }, [conversations]);

  // Get the most recent plan conversation
  const getActivePlanConversation = useCallback((): Conversation | null => {
    const planConversations = getPlanConversations();
    if (planConversations.length === 0) return null;
    
    // If there's an active conversation that's a plan conversation, use it
    if (activeConversationId) {
      const activeConv = planConversations.find(conv => conv.id === activeConversationId);
      if (activeConv) return activeConv;
    }
    
    // Otherwise, return the most recent plan conversation
    return planConversations[planConversations.length - 1];
  }, [getPlanConversations, activeConversationId]);

  // Extract content from conversation messages
  const extractContentFromConversation = useCallback((conversation: Conversation): string => {
    if (!conversation || conversation.messages.length === 0) return '';
    
    // Find the assistant message with the plan content
    const assistantMessages = conversation.messages.filter(msg => msg.type === 'assistant');
    if (assistantMessages.length === 0) return '';
    
    // Get the last assistant message (most recent plan content)
    const lastMessage = assistantMessages[assistantMessages.length - 1];
    return lastMessage.content || '';
  }, []);

  // Get current plan content
  const getCurrentPlanContent = useCallback((): string | null => {
    const activeConv = getActivePlanConversation();
    if (!activeConv) return null;
    
    const content = extractContentFromConversation(activeConv);
    return content || null;
  }, [getActivePlanConversation, extractContentFromConversation]);

  // Subscribe to plan updates
  const subscribeToPlanUpdates = useCallback((callback: (content: string) => void) => {
    const activeConv = getActivePlanConversation();
    if (!activeConv) return () => {};

    // Set up an interval to check for content updates
    // This is a simple polling approach - in a real implementation,
    // you might want to use a more sophisticated observer pattern
    const intervalId = setInterval(() => {
      const currentContent = getCurrentPlanContent();
      if (currentContent) {
        callback(currentContent);
      }
    }, 500); // Check every 500ms

    return () => clearInterval(intervalId);
  }, [getActivePlanConversation, getCurrentPlanContent]);

  // Update plan content when conversations change
  useEffect(() => {
    const content = getCurrentPlanContent();
    console.log('usePlanSync: Current plan content:', content ? `${content.substring(0, 100)}...` : 'null');
    setCurrentPlanContent(content);
    
    // Update last viewed conversation if we have an active plan conversation
    const activeConv = getActivePlanConversation();
    if (activeConv) {
      console.log('usePlanSync: Active plan conversation:', { id: activeConv.id, title: activeConv.title, messageCount: activeConv.messages.length });
      updateLastViewedPlanConversation(activeConv.id);
    } else {
      console.log('usePlanSync: No active plan conversation found');
    }
  }, [conversations, getCurrentPlanContent, getActivePlanConversation]);

  // Also update content when activeConversationId changes
  useEffect(() => {
    if (activeConversationId) {
      const content = getCurrentPlanContent();
      console.log('usePlanSync: Active conversation changed, updating content:', { 
        activeConversationId, 
        hasContent: !!content,
        contentLength: content?.length || 0
      });
      setCurrentPlanContent(content);
    }
  }, [activeConversationId, getCurrentPlanContent]);

  // Update generation status based on chatbox status
  useEffect(() => {
    const activeConv = getActivePlanConversation();
    if (!activeConv) {
      setPlanGenerationStatus('idle');
      return;
    }

    // Map chatbox status to plan generation status
    switch (status) {
      case 'analyzing':
        setPlanGenerationStatus('generating');
        break;
      case 'completed':
        setPlanGenerationStatus('completed');
        break;
      case 'error':
        setPlanGenerationStatus('error');
        break;
      default:
        setPlanGenerationStatus('idle');
    }
  }, [status, getActivePlanConversation]);

  return {
    getActivePlanConversation,
    subscribeToPlanUpdates,
    getCurrentPlanContent,
    getPlanGenerationStatus: () => planGenerationStatus,
    currentPlanContent,
    planGenerationStatus,
    planConversations: getPlanConversations()
  };
}

/**
 * Utility function to check if a conversation is an implementation plan conversation
 */
export function isPlanConversation(conversation: Conversation): boolean {
  const title = conversation.title.toLowerCase();
  return (
    title.endsWith(' plan') || 
    title.includes('implementation') ||
    title.includes('business plan') ||
    title.startsWith('implementation plan') ||
    // Check if the conversation has messages with business plan content
    conversation.messages.some(msg => 
      msg.type === 'assistant' && 
      msg.analysisType === 'business-suggestion' &&
      msg.content && 
      msg.content.length > 100 // Likely to be a plan if it's substantial content
    )
  );
}

/**
 * Utility function to get the latest content from a plan conversation
 */
export function getLatestPlanContent(conversation: Conversation): string {
  if (!conversation || conversation.messages.length === 0) return '';
  
  const assistantMessages = conversation.messages.filter(msg => msg.type === 'assistant');
  if (assistantMessages.length === 0) return '';
  
  const lastMessage = assistantMessages[assistantMessages.length - 1];
  return lastMessage.content || '';
}