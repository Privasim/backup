import { useState, useCallback, useRef, useMemo } from 'react';
import { useChatbox } from '@/components/chatbox/ChatboxProvider';
import { GoToMarketStrategies, GoToMarketStatus, GenerationOptions, StreamingState, MarketingStrategy, SalesChannel, PricingStrategy } from '../types';
import { GoToMarketV2Service } from '../services/GoToMarketV2Service';
import { useImplementationContext } from './useImplementationContext';

interface UseGoToMarketV2Return {
  // State
  strategies: GoToMarketStrategies | null;
  status: GoToMarketStatus;
  progress: number;
  error: string | null;
  streamingState: StreamingState;
  
  // Actions
  generateStrategies: (options?: GenerationOptions) => Promise<void>;
  regenerateStrategies: (options?: GenerationOptions) => Promise<void>;
  cancelGeneration: () => void;
  updateStrategy: (type: 'marketing' | 'sales' | 'pricing', id: string, updates: Partial<MarketingStrategy | SalesChannel | PricingStrategy>) => void;
  
  // Export/Import
  exportStrategies: (format: 'json' | 'markdown') => void;
  importStrategies: (data: string) => void;
  
  // Context
  implementationContext: ReturnType<typeof useImplementationContext>;
  hasValidContext: boolean;
  canGenerate: boolean;
}

export const useGoToMarketV2 = (): UseGoToMarketV2Return => {
  const { config } = useChatbox();
  const implementationContext = useImplementationContext();
  
  const [strategies, setStrategies] = useState<GoToMarketStrategies | null>(null);
  const [status, setStatus] = useState<GoToMarketStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [streamingState, setStreamingState] = useState<StreamingState>({
    rawContent: '',
    currentSection: '',
    progress: 0,
    isProcessing: false
  });

  const serviceRef = useRef<GoToMarketV2Service | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize service when config changes
  const initializeService = useCallback(() => {
    if (config.apiKey && config.model) {
      serviceRef.current = new GoToMarketV2Service(config.apiKey, config.model);
    }
  }, [config.apiKey, config.model]);

  // Calculate progress based on streaming content
  const progress = useMemo(() => {
    if (status === 'idle') return 0;
    if (status === 'success') return 100;
    if (status === 'error') return 0;
    
    // Estimate progress based on content length and expected sections
    const contentLength = streamingState.rawContent.length;
    const estimatedTotalLength = 8000; // Rough estimate for complete response
    return Math.min(90, Math.floor((contentLength / estimatedTotalLength) * 100));
  }, [status, streamingState.rawContent]);

  const hasValidContext = implementationContext.hasValidContext;
  const canGenerate = hasValidContext && config.apiKey && config.model && status !== 'generating' && status !== 'streaming';

  const generateStrategies = useCallback(async (options: GenerationOptions = {}) => {
    if (!canGenerate || !implementationContext.implementationPlan) {
      setError('Cannot generate strategies: missing requirements');
      return;
    }

    try {
      // Initialize service if needed
      initializeService();
      if (!serviceRef.current) {
        throw new Error('Service not initialized');
      }

      // Reset state
      setError(null);
      setStatus('generating');
      setStreamingState({
        rawContent: '',
        currentSection: 'Initializing...',
        progress: 0,
        isProcessing: true
      });

      // Create abort controller
      abortControllerRef.current = new AbortController();

      // Generate strategies with streaming
      const result = await serviceRef.current.generateStreamingStrategies(
        implementationContext.implementationPlan,
        (chunk: string) => {
          setStatus('streaming');
          setStreamingState(prev => ({
            ...prev,
            rawContent: prev.rawContent + chunk,
            currentSection: 'Generating strategies...',
            progress: Math.min(90, prev.progress + 1)
          }));
        },
        options
      );

      // Success
      setStrategies(result);
      setStatus('success');
      setStreamingState(prev => ({
        ...prev,
        currentSection: 'Complete',
        progress: 100,
        isProcessing: false
      }));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate strategies';
      setError(errorMessage);
      setStatus('error');
      setStreamingState(prev => ({
        ...prev,
        error: errorMessage,
        isProcessing: false
      }));
    }
  }, [canGenerate, implementationContext.implementationPlan, initializeService]);

  const regenerateStrategies = useCallback(async (options: GenerationOptions = {}) => {
    await generateStrategies(options);
  }, [generateStrategies]);

  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setStatus('idle');
    setStreamingState({
      rawContent: '',
      currentSection: '',
      progress: 0,
      isProcessing: false
    });
  }, []);

  const updateStrategy = useCallback((
    type: 'marketing' | 'sales' | 'pricing',
    id: string,
    updates: Partial<MarketingStrategy | SalesChannel | PricingStrategy>
  ) => {
    if (!strategies) return;

    setStrategies(prev => {
      if (!prev) return prev;

      const updated = { ...prev };

      switch (type) {
        case 'marketing':
          updated.marketingStrategies = updated.marketingStrategies.map(strategy =>
            strategy.id === id ? { ...strategy, ...updates } : strategy
          );
          break;
        case 'sales':
          updated.salesChannels = updated.salesChannels.map(channel =>
            channel.id === id ? { ...channel, ...updates } : channel
          );
          break;
        case 'pricing':
          updated.pricingStrategies = updated.pricingStrategies.map(strategy =>
            strategy.id === id ? { ...strategy, ...updates } : strategy
          );
          break;
      }

      return updated;
    });
  }, [strategies]);

  const exportStrategies = useCallback((format: 'json' | 'markdown') => {
    if (!strategies) return;

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'json') {
      content = JSON.stringify(strategies, null, 2);
      filename = `go-to-market-strategies-${Date.now()}.json`;
      mimeType = 'application/json';
    } else {
      content = generateMarkdownExport(strategies);
      filename = `go-to-market-strategies-${Date.now()}.md`;
      mimeType = 'text/markdown';
    }

    // Create and download file
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [strategies]);

  const importStrategies = useCallback((data: string) => {
    try {
      const imported = JSON.parse(data) as GoToMarketStrategies;
      setStrategies(imported);
      setStatus('success');
      setError(null);
    } catch (err) {
      setError('Failed to import strategies: Invalid format');
    }
  }, []);

  return {
    // State
    strategies,
    status,
    progress,
    error,
    streamingState,
    
    // Actions
    generateStrategies,
    regenerateStrategies,
    cancelGeneration,
    updateStrategy,
    
    // Export/Import
    exportStrategies,
    importStrategies,
    
    // Context
    implementationContext,
    hasValidContext,
    canGenerate
  };
};

// Helper function to generate markdown export
function generateMarkdownExport(strategies: GoToMarketStrategies): string {
  let markdown = `# Go-to-Market Strategy\n\n`;
  markdown += `Generated: ${new Date(strategies.generatedAt).toLocaleDateString()}\n\n`;

  // Business Context
  markdown += `## Business Context\n\n`;
  markdown += `- **Business Idea**: ${strategies.businessContext.businessIdea}\n`;
  markdown += `- **Target Market**: ${strategies.businessContext.targetMarket}\n`;
  markdown += `- **Value Proposition**: ${strategies.businessContext.valueProposition}\n\n`;

  // Marketing Strategies
  if (strategies.marketingStrategies.length > 0) {
    markdown += `## Marketing Strategies\n\n`;
    strategies.marketingStrategies.forEach((strategy, index) => {
      markdown += `### ${index + 1}. ${strategy.title}\n\n`;
      markdown += `- **Type**: ${strategy.type}\n`;
      markdown += `- **Description**: ${strategy.description}\n`;
      markdown += `- **Timeline**: ${strategy.timeline}\n`;
      markdown += `- **Expected ROI**: ${strategy.expectedROI}\n`;
      markdown += `- **Difficulty**: ${strategy.difficulty}\n\n`;
    });
  }

  // Sales Channels
  if (strategies.salesChannels.length > 0) {
    markdown += `## Sales Channels\n\n`;
    strategies.salesChannels.forEach((channel, index) => {
      markdown += `### ${index + 1}. ${channel.name}\n\n`;
      markdown += `- **Type**: ${channel.type}\n`;
      markdown += `- **Description**: ${channel.description}\n`;
      markdown += `- **Expected Reach**: ${channel.expectedReach}\n`;
      markdown += `- **Suitability Score**: ${channel.suitabilityScore}/100\n\n`;
    });
  }

  // Pricing Strategies
  if (strategies.pricingStrategies.length > 0) {
    markdown += `## Pricing Strategies\n\n`;
    strategies.pricingStrategies.forEach((pricing, index) => {
      markdown += `### ${index + 1}. ${pricing.title}\n\n`;
      markdown += `- **Model**: ${pricing.model}\n`;
      markdown += `- **Description**: ${pricing.description}\n`;
      markdown += `- **Market Fit**: ${pricing.marketFit}/100\n\n`;
    });
  }

  return markdown;
}