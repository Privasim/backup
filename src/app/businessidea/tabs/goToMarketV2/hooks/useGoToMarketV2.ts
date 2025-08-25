import { useState, useCallback, useRef } from 'react';
import { useChatbox } from '@/components/chatbox/ChatboxProvider';
import { GoToMarketTextService } from '../services/goToMarketTextService';
import { useImplementationContext } from './useImplementationContext';

export const useGoToMarketV2 = () => {
  const { config, businessSuggestions, activeConversationId } = useChatbox();
  const { context, isValid: isContextValid, status: contextStatus, error: contextError } = useImplementationContext();
  
  const [strategy, setStrategy] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isCancelled, setIsCancelled] = useState<boolean>(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Get ideaId from active conversation or business suggestions
  const getIdeaId = useCallback(() => {
    if (activeConversationId) {
      return activeConversationId;
    }
    if (businessSuggestions.suggestions.length > 0) {
      return businessSuggestions.suggestions[0].id;
    }
    return `idea-${Date.now()}`;
  }, [businessSuggestions, activeConversationId]);
  
  const generateStrategy = useCallback(async () => {
    console.log('GoToMarketV2: generateStrategy called');
    
    if (!config.apiKey) {
      const msg = 'API key is required';
      console.error('GoToMarketV2:', msg);
      setError(msg);
      return;
    }
    
    if (!config.model) {
      const msg = 'Model selection is required';
      console.error('GoToMarketV2:', msg);
      setError(msg);
      return;
    }
    
    if (!isContextValid) {
      const msg = 'Implementation context is not valid';
      console.error('GoToMarketV2:', msg, { context, contextStatus, contextError });
      setError(msg);
      return;
    }
    
    if (!context) {
      const msg = 'Implementation context is not available';
      console.error('GoToMarketV2:', msg);
      setError(msg);
      return;
    }
    
    console.log('GoToMarketV2: All prerequisites met, starting generation', {
      hasApiKey: !!config.apiKey,
      hasModel: !!config.model,
      isContextValid,
      contextTitle: context.title,
      contextPhases: context.phases.length,
      contextTasks: context.tasks.length
    });
    
    setIsLoading(true);
    setError(null);
    setProgress(0);
    setIsCancelled(false);
    setStrategy('');
    
    abortControllerRef.current = new AbortController();
    
    try {
      const service = new GoToMarketTextService(config.apiKey);
      const ideaId = getIdeaId();
      
      console.log('GoToMarketV2: Starting strategy generation', {
        ideaId,
        hasApiKey: !!config.apiKey,
        hasModel: !!config.model,
        isContextValid,
        contextTitle: context.title
      });
      
      const result = await service.generateStrategy(
        context,
        (chunk) => {
          if (abortControllerRef.current?.signal.aborted) {
            return;
          }
          
          setStrategy(prev => prev + chunk);
          setProgress(prev => Math.min(prev + 5, 95)); // Cap at 95% during streaming
        },
        ideaId
      );
      
      if (!abortControllerRef.current?.signal.aborted) {
        setStrategy(result);
        setProgress(100);
        console.log('GoToMarketV2: Strategy generation completed', {
          ideaId,
          contentLength: result.length
        });
      }
    } catch (err) {
      if (!abortControllerRef.current?.signal.aborted) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate strategy';
        setError(errorMessage);
        console.error('GoToMarketV2: Strategy generation failed', {
          ideaId: getIdeaId(),
          error: errorMessage
        });
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    }
  }, [config, context, isContextValid, getIdeaId, contextStatus, contextError]);
  
  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsCancelled(true);
      setIsLoading(false);
      setProgress(0);
      console.log('GoToMarketV2: Strategy generation cancelled', {
        ideaId: getIdeaId()
      });
    }
  }, [getIdeaId]);
  
  const retryGeneration = useCallback(() => {
    console.log('GoToMarketV2: Retrying strategy generation', {
      ideaId: getIdeaId()
    });
    generateStrategy();
  }, [generateStrategy, getIdeaId]);
  
  // Check if generation is possible
  const canGenerate = !!config.apiKey && !!config.model && isContextValid && !isLoading;
  
  console.log('GoToMarketV2: Hook state', {
    canGenerate,
    hasApiKey: !!config.apiKey,
    hasModel: !!config.model,
    isContextValid,
    isLoading,
    contextTitle: context?.title
  });
  
  return {
    strategyContent: strategy,
    isLoading,
    isError: !!error || !!contextError,
    progress,
    error: error || contextError,
    contextStatus,
    isContextValid,
    generateStrategy,
    resetGeneration: () => {
      setStrategy('');
      setError(null);
      setProgress(0);
    },
    cancelGeneration
  };
};
