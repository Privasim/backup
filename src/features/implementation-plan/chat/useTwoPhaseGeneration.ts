'use client';

import { useCallback, useRef } from 'react';
import { useChatbox } from '@/components/chatbox/ChatboxProvider';
import { BusinessSuggestion } from '@/components/chatbox/types';
import { useChatHistory } from './useChatHistory';
import { useStreamingMessage } from './useStreamingMessage';
import { SimpleStreamingProcessor } from './SimpleStreamingProcessor';
import { ensureThreePhases } from './phaseValidator';

export const useTwoPhaseGeneration = () => {
  const { generatePlanOutline, generateFullPlan } = useChatbox();
  const chatHistory = useChatHistory();
  const abortControllerRef = useRef<AbortController | null>(null);

  const streamingMessage = useStreamingMessage({
    onMessageUpdate: chatHistory.updateMessage,
    onComplete: (id, content) => {
      console.log('Streaming completed for message:', id);
    },
    onError: (id, error) => {
      console.error('Streaming error for message:', id, error);
      chatHistory.addErrorMessage(`Streaming failed: ${error}`);
    }
  });

  // Phase 1: Generate outline (target: 10 seconds)
  const generateOutline = useCallback(async (suggestion: BusinessSuggestion) => {
    try {
      // Reset state
      chatHistory.setError();
      chatHistory.setPhase('generating-outline');

      // Add initial system message
      chatHistory.addSystemMessage(
        `🚀 Starting implementation plan generation for "${suggestion.title}"`
      );

      // Add loading message
      const loadingId = chatHistory.addLoadingMessage('outline', {
        progress: 0
      });

      // Start timer for 10-second target
      const startTime = Date.now();
      
      try {
        // Generate outline using ChatboxControls
        const outline = await generatePlanOutline(suggestion);
        
        const duration = Date.now() - startTime;
        console.log(`Outline generation completed in ${duration}ms`);

        // Remove loading message
        chatHistory.updateMessage(loadingId, {
          type: 'assistant',
          content: formatOutlineMessage(outline),
          phase: 'outline',
          metadata: {
            isComplete: true,
            requiresApproval: true,
            approvalAction: 'generate-full-plan',
            generationTime: duration
          }
        });

        // Store outline
        chatHistory.setOutline(outline);
        chatHistory.setPhase('awaiting-approval');

        return outline;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        // Update loading message to error
        chatHistory.updateMessage(loadingId, {
          type: 'error',
          content: `Failed to generate outline: ${errorMessage}`,
          metadata: { error: true }
        });

        chatHistory.setError(errorMessage);
        throw error;
      }
    } catch (error) {
      console.error('Outline generation failed:', error);
      chatHistory.setPhase('error');
      throw error;
    }
  }, [generatePlanOutline, chatHistory]);

  // Phase 2: Generate full plan with streaming
  const generateFullPlanWithStreaming = useCallback(async (outline: any) => {
    try {
      // Reset error state
      chatHistory.setError();
      chatHistory.setPhase('generating-plan');

      // Add system message
      chatHistory.addSystemMessage(
        '📋 Generating detailed implementation plan...'
      );

      // Create streaming message
      const streamingId = chatHistory.addAssistantMessage(
        '',
        'full-plan',
        undefined,
        { isStreaming: true, isComplete: false }
      );

      // Start streaming
      streamingMessage.startStreaming(streamingId);

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      try {
        // Create a simple streaming processor
        const processor = new SimpleStreamingProcessor((content) => {
          // Update the streaming message with current content
          chatHistory.updateMessage(streamingId, {
            content: content,
            metadata: { 
              isStreaming: true, 
              isComplete: false,
              progress: processor.getEstimatedProgress()
            }
          });
        });

        // Generate full plan with streaming
        const plan = await generateFullPlan(outline, (chunk: string) => {
          // Process chunk through simple processor
          processor.processChunk(chunk);
        });

        // Complete streaming
        const finalContent = processor.complete(plan.formattedContent || plan.rawContent);
        // Validate/repair to ensure all three phases are present
        const { content: repairedContent, repaired } = ensureThreePhases(finalContent);
        streamingMessage.completeStreaming(streamingId, repairedContent);

        // Store plan with repaired content if applied
        const finalizedPlan = {
          ...plan,
          formattedContent: repairedContent,
          rawContent: plan.rawContent || repairedContent,
        };
        chatHistory.setPlan(finalizedPlan);

        if (repaired) {
          chatHistory.addSystemMessage(
            'ℹ️ Phase content auto-repaired to ensure all 3 phases are present. Consider regenerating if details look incomplete.'
          );
        }

        chatHistory.setPhase('completed');

        // Add completion message
        chatHistory.addSystemMessage(
          '✅ Implementation plan generated successfully! You can now export or modify the plan.'
        );

        return plan;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        // Error streaming
        streamingMessage.errorStreaming(streamingId, errorMessage);
        
        chatHistory.setError(errorMessage);
        throw error;
      }
    } catch (error) {
      console.error('Full plan generation failed:', error);
      chatHistory.setPhase('error');
      throw error;
    }
  }, [generateFullPlan, chatHistory, streamingMessage]);

  // Handle approval workflow
  const handleApproval = useCallback(async (action: string) => {
    if (action === 'approve' && chatHistory.outline) {
      await generateFullPlanWithStreaming(chatHistory.outline);
    } else if (action === 'regenerate') {
      // Clear current outline and restart
      chatHistory.setOutline(undefined);
      chatHistory.setPhase('idle');
      chatHistory.addSystemMessage('🔄 Regenerating outline...');
      // Note: The calling component should trigger generateOutline again
    }
  }, [chatHistory.outline, generateFullPlanWithStreaming, chatHistory]);

  // Cancel current generation
  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Cancel any streaming messages
    streamingMessage.cleanupAll();

    // Reset to idle state
    chatHistory.setPhase('idle');
    chatHistory.setStreaming(false);
    
    chatHistory.addSystemMessage('❌ Generation cancelled by user');
  }, [streamingMessage, chatHistory]);

  // Format outline message for display - simplified to show raw LLM output
  const formatOutlineMessage = (outline: any) => {
    // Instead of transforming, let's ask the LLM to generate user-friendly text directly
    return `🎯 **Plan Outline Generated**

${outline.title}

${outline.overview}

**Estimated Timeline:** ${outline.estimatedTimeline}

**Key Implementation Phases:**
${outline.keyPhases.map((phase: string, index: number) => `${index + 1}. ${phase}`).join('\n')}

**Major Milestones:**
${outline.majorMilestones.map((milestone: string) => `✅ ${milestone}`).join('\n')}

**Resource Requirements:**
${outline.resourceRequirements.map((resource: string) => `📋 ${resource}`).join('\n')}

---

This outline provides your implementation roadmap. Ready to generate the detailed plan?`;
  };

  // Format plan message - let LLM generate the final formatted text directly
  const formatPlanMessage = (plan: any) => {
    // For the full plan, we'll let the LLM generate markdown-formatted text directly
    // This avoids the complex transformation and potential truncation issues
    return plan.formattedContent || `# ${plan.meta?.title || 'Implementation Plan'}

Your detailed implementation plan has been generated successfully! 

${plan.rawContent || 'Plan content is being processed...'}

---

🚀 **Your implementation plan is ready!** You can now export or modify this plan as needed.`;
  };

  return {
    // State from chat history
    ...chatHistory,
    
    // Generation methods
    generateOutline,
    generateFullPlanWithStreaming,
    handleApproval,
    cancelGeneration,
    
    // Streaming utilities
    ...streamingMessage
  };
};

export default useTwoPhaseGeneration;