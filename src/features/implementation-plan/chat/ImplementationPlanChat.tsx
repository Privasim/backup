'use client';

import React, { useCallback, useEffect } from 'react';
import { BusinessSuggestion } from '@/components/chatbox/types';
import { ChatLayout } from './ChatLayout';
import { useTwoPhaseGeneration } from './useTwoPhaseGeneration';
import { ChatStreamingProcessor } from './ChatStreamingProcessor';

interface ImplementationPlanChatProps {
  selectedSuggestion?: BusinessSuggestion;
  onPlanGenerated?: (plan: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

export const ImplementationPlanChat: React.FC<ImplementationPlanChatProps> = ({
  selectedSuggestion,
  onPlanGenerated,
  onError,
  className = ''
}) => {
  const twoPhaseGeneration = useTwoPhaseGeneration();

  // Handle approval actions
  const handleApproval = useCallback(async (action: string) => {
    try {
      await twoPhaseGeneration.handleApproval(action);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [twoPhaseGeneration, onError]);

  // Start generation when suggestion is selected
  useEffect(() => {
    if (selectedSuggestion && twoPhaseGeneration.currentPhase === 'idle') {
      twoPhaseGeneration.generateOutline(selectedSuggestion).catch(error => {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        if (onError) {
          onError(errorMessage);
        }
      });
    }
  }, [selectedSuggestion, twoPhaseGeneration, onError]);

  // Notify when plan is generated
  useEffect(() => {
    if (twoPhaseGeneration.plan && onPlanGenerated) {
      onPlanGenerated(twoPhaseGeneration.plan);
    }
  }, [twoPhaseGeneration.plan, onPlanGenerated]);

  // Create chat state object
  // Note: twoPhaseGeneration spreads streaming controls which include an isStreaming(messageId) function.
  // We need a boolean here per ChatState, so derive from the chat history state flags.
  const isStreamingBool =
    typeof (twoPhaseGeneration as any).isStreaming === 'boolean'
      ? ((twoPhaseGeneration as any).isStreaming as boolean)
      : (twoPhaseGeneration as any).isGenerating || false;

  const chatState = {
    messages: twoPhaseGeneration.messages,
    currentPhase: twoPhaseGeneration.currentPhase,
    isStreaming: isStreamingBool,
    error: twoPhaseGeneration.error,
    outline: twoPhaseGeneration.outline,
    plan: twoPhaseGeneration.plan
  };

  return (
    <div className={`h-full ${className}`}>
      <ChatLayout
        chatState={chatState}
        onApproval={handleApproval}
      />
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs max-w-xs">
          <div>Phase: {twoPhaseGeneration.currentPhase}</div>
          <div>Messages: {twoPhaseGeneration.messages.length}</div>
          <div>Streaming: {twoPhaseGeneration.isStreaming ? 'Yes' : 'No'}</div>
          <div>Has Outline: {twoPhaseGeneration.outline ? 'Yes' : 'No'}</div>
          <div>Has Plan: {twoPhaseGeneration.plan ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
};

export default ImplementationPlanChat;