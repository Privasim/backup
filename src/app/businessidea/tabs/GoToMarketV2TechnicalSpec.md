# Go-to-Market V2 Technical Specification

## Overview

This document provides the technical specification for implementing the Go-to-Market V2 feature, which transforms the placeholder `GoToMarketV2Content.tsx` into a fully functional AI-powered strategy generator. The implementation follows existing patterns from the implementation-plan and chatbox features, ensuring consistency and maintainability.

## Architecture Overview

### High-Level Flow
```
ListTab Implementation Plan → Context Extraction → AI Generation → Markdown Processing → Strategy Display
```

### Key Components
- **Context Integration**: Extract business context from ListTab implementation plan
- **AI Generation**: Use ChatboxControls API configuration with OpenRouter
- **Markdown Processing**: Generate and process markdown content (not JSON)
- **Strategy Display**: Render strategies with ReactMarkdown
- **Local Persistence**: Cache generated strategies for future access

## Implementation Structure

### Feature Organization
```
src/features/gotomarket-v2/
├── components/
│   ├── GoToMarketV2Generator.tsx      # Main generator component
│   ├── StrategyDisplay.tsx            # Markdown strategy display
│   ├── ProgressIndicator.tsx          # Streaming progress
│   └── ExportControls.tsx             # Export/download utilities
├── hooks/
│   ├── useGoToMarketV2.ts             # Main generation hook
│   ├── useImplementationContext.ts    # ListTab context integration
│   └── useStrategyPersistence.ts      # Local storage management
├── services/
│   ├── GoToMarketTextService.ts       # AI generation service
│   └── PromptBuilder.ts               # Prompt construction
├── utils/
│   ├── content-processor.ts           # Markdown processing
│   ├── export-utils.ts                # Export functionality
│   └── validation.ts                  # Input validation
└── types.ts                           # TypeScript definitions
```

## Core Types and Interfaces

### Primary Types
```typescript
interface GoToMarketStrategy {
  id: string;
  businessContext: BusinessContext;
  textContent: string;           // Raw markdown content
  formattedContent: string;      // Processed markdown
  sections: StrategySection[];   // Extracted sections
  generatedAt: string;
  version: string;
}

interface BusinessContext {
  businessIdea: string;
  implementationPlan: string;    // From ListTab
  targetMarket?: string;
  valueProposition?: string;
  goals: string[];
  constraints: string[];
}

interface StrategySection {
  type: 'marketing' | 'sales' | 'pricing' | 'distribution' | 'timeline' | 'other';
  title: string;
  content: string;
  level: number;
}

interface GenerationState {
  status: 'idle' | 'generating' | 'success' | 'error';
  progress: number;
  error: string | null;
  strategy: GoToMarketStrategy | null;
}
```

## Service Layer Implementation

### GoToMarketTextService
Following the `TextGenerationService` pattern from implementation-plan:

```typescript
export class GoToMarketTextService {
  private client: OpenRouterClient;

  constructor(apiKey: string) {
    this.client = new OpenRouterClient(apiKey);
  }

  async generateStrategy(
    businessContext: BusinessContext,
    settings: GenerationSettings,
    onChunk?: (chunk: string) => void
  ): Promise<GoToMarketStrategy> {
    const { systemPrompt, userPrompt } = this.buildPrompts(businessContext, settings);
    
    let textContent = '';
    
    if (onChunk) {
      // Streaming generation
      await this.client.chat({
        model: settings.model || 'qwen/qwen3-coder:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      }, {
        stream: true,
        onChunk: (chunk: string) => {
          textContent += chunk;
          onChunk(chunk);
        }
      });
    } else {
      // Non-streaming generation
      const response = await this.client.chat({...});
      textContent = response?.choices?.[0]?.message?.content || '';
    }
    
    return this.createStrategyFromText(textContent, businessContext);
  }

  private buildPrompts(context: BusinessContext, settings: GenerationSettings) {
    const systemPrompt = `You are a go-to-market strategy expert. Generate comprehensive, actionable go-to-market strategies in markdown format.

Focus on:
- Marketing strategies and tactics
- Sales channels and approaches  
- Pricing models and strategies
- Distribution and launch plans
- Implementation timelines

Format your response as well-structured markdown with clear sections and actionable insights.`;

    const userPrompt = `Create a comprehensive go-to-market strategy for this business:

Business Idea: ${context.businessIdea}

Implementation Plan Context:
${context.implementationPlan}

${context.targetMarket ? `Target Market: ${context.targetMarket}` : ''}
${context.valueProposition ? `Value Proposition: ${context.valueProposition}` : ''}

Goals: ${context.goals.join(', ')}
${context.constraints.length > 0 ? `Constraints: ${context.constraints.join(', ')}` : ''}

Generate a detailed go-to-market strategy with specific, actionable recommendations.`;

    return { systemPrompt, userPrompt };
  }

  private createStrategyFromText(textContent: string, context: BusinessContext): GoToMarketStrategy {
    const sections = this.extractSections(textContent);
    
    return {
      id: `strategy-${Date.now()}`,
      businessContext: context,
      textContent,
      formattedContent: this.formatContent(textContent),
      sections,
      generatedAt: new Date().toISOString(),
      version: 'v1'
    };
  }

  private extractSections(text: string): StrategySection[] {
    // Similar to TextGenerationService.extractSections()
    // Extract markdown sections and categorize them
  }
}
```

## Hook Implementation

### useGoToMarketV2
Main hook following existing patterns:

```typescript
export function useGoToMarketV2() {
  const [state, setState] = useState<GenerationState>({
    status: 'idle',
    progress: 0,
    error: null,
    strategy: null
  });

  const { implementationPlan, hasValidContext } = useImplementationContext();
  const { saveStrategy, loadStrategy } = useStrategyPersistence();
  
  // Get API configuration from ChatboxControls pattern
  const { config } = useChatbox();

  const generateStrategy = useCallback(async () => {
    if (!hasValidContext || !config.apiKey) {
      setState(prev => ({ ...prev, status: 'error', error: 'Missing context or API key' }));
      return;
    }

    setState(prev => ({ ...prev, status: 'generating', progress: 0, error: null }));

    try {
      const service = new GoToMarketTextService(config.apiKey);
      const businessContext = extractBusinessContext(implementationPlan);
      
      const strategy = await service.generateStrategy(
        businessContext,
        { model: config.model },
        (chunk) => {
          // Update progress during streaming
          setState(prev => ({ 
            ...prev, 
            progress: Math.min(prev.progress + 1, 95) 
          }));
        }
      );

      await saveStrategy(strategy);
      setState(prev => ({ 
        ...prev, 
        status: 'success', 
        progress: 100, 
        strategy 
      }));

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Generation failed' 
      }));
    }
  }, [hasValidContext, config, implementationPlan, saveStrategy]);

  return {
    ...state,
    generateStrategy,
    hasValidContext,
    implementationPlan
  };
}
```

### useImplementationContext
Context integration hook:

```typescript
export function useImplementationContext() {
  const { plan } = useImplementationPlan();
  
  const hasValidContext = useMemo(() => {
    return !!(plan?.textContent && plan.meta.title);
  }, [plan]);

  const businessContext = useMemo(() => {
    if (!plan) return null;

    return {
      businessIdea: plan.meta.title || '',
      implementationPlan: plan.textContent || '',
      goals: plan.overview?.goals || [],
      constraints: []
    };
  }, [plan]);

  return {
    implementationPlan: plan,
    businessContext,
    hasValidContext
  };
}
```

## Component Implementation

### GoToMarketV2Generator
Main component replacing the placeholder:

```typescript
export default function GoToMarketV2Generator() {
  const { 
    status, 
    progress, 
    error, 
    strategy, 
    generateStrategy, 
    hasValidContext 
  } = useGoToMarketV2();

  if (!hasValidContext) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-blue-50 rounded-lg border border-blue-100 p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <InformationCircleIcon className="h-6 w-6 text-blue-500" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-blue-800">Implementation Plan Required</h3>
              <div className="mt-2 text-blue-700">
                <p>To generate your go-to-market strategy, please first create an implementation plan in the List tab.</p>
                <p className="mt-2">The go-to-market generator will use your implementation plan as context to create targeted marketing, sales, and distribution strategies.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Go-to-Market Strategy</h1>
        <p className="text-gray-600">AI-powered go-to-market strategy generation based on your implementation plan.</p>
      </div>

      {/* Generation Controls */}
      <div className="mb-6">
        <button
          onClick={generateStrategy}
          disabled={status === 'generating'}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            status === 'generating'
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]'
          }`}
        >
          {status === 'generating' ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating Strategy... ({progress}%)
            </>
          ) : (
            'Generate Go-to-Market Strategy'
          )}
        </button>
      </div>

      {/* Progress Indicator */}
      {status === 'generating' && (
        <ProgressIndicator progress={progress} />
      )}

      {/* Error Display */}
      {status === 'error' && error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={generateStrategy}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Strategy Display */}
      {status === 'success' && strategy && (
        <StrategyDisplay strategy={strategy} />
      )}
    </div>
  );
}
```

### StrategyDisplay
Strategy rendering component:

```typescript
interface StrategyDisplayProps {
  strategy: GoToMarketStrategy;
}

export function StrategyDisplay({ strategy }: StrategyDisplayProps) {
  const [displayMode, setDisplayMode] = useState<'text' | 'sections'>('text');

  const copyText = async () => {
    await navigator.clipboard.writeText(strategy.textContent);
  };

  const downloadMarkdown = () => {
    const blob = new Blob([strategy.textContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'go-to-market-strategy.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setDisplayMode('text')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              displayMode === 'text' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            📄 Full Strategy
          </button>
          <button 
            onClick={() => setDisplayMode('sections')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              displayMode === 'sections' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            📊 By Section
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={copyText}
            className="text-xs px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50"
          >
            Copy
          </button>
          <button 
            onClick={downloadMarkdown}
            className="text-xs px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50"
          >
            Download
          </button>
        </div>
      </div>

      {/* Content Display */}
      {displayMode === 'text' ? (
        <div className="prose max-w-none bg-white border border-gray-200 rounded-lg p-6">
          <ReactMarkdown>{strategy.formattedContent || strategy.textContent}</ReactMarkdown>
        </div>
      ) : (
        <div className="space-y-4">
          {strategy.sections.map((section, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{section.title}</h3>
              <div className="prose max-w-none">
                <ReactMarkdown>{section.content}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Metadata */}
      <div className="text-xs text-gray-500 border-t pt-4">
        Generated on {new Date(strategy.generatedAt).toLocaleString()} • Version {strategy.version}
      </div>
    </div>
  );
}
```

## Integration Points

### ChatboxControls Integration
- Use existing `useChatbox()` hook for API configuration
- Follow the same API key validation patterns
- Integrate with existing model selection and settings

### ListTab Context Integration
- Access implementation plan via `useImplementationPlan()` hook
- Extract business context from plan textContent and metadata
- Validate context availability before generation

### Local Storage Integration
- Follow existing storage patterns from implementation-plan
- Cache generated strategies with context-based keys
- Implement cache invalidation when context changes

## Error Handling Strategy

### Error Categories
1. **Context Errors**: Missing or invalid implementation plan
2. **API Errors**: OpenRouter connection, authentication, rate limits
3. **Generation Errors**: AI response parsing, incomplete generation
4. **Storage Errors**: Local storage failures, data corruption

### Error Recovery
- Automatic retry with exponential backoff for transient failures
- Clear user messaging with actionable recovery steps
- Graceful degradation with cached data when available
- Fallback UI states for all error scenarios

## Performance Considerations

### Optimization Strategies
- Stream generation for real-time user feedback
- Efficient markdown processing with memoization
- Lazy loading of heavy components
- Debounced user interactions to prevent excessive API calls

### Caching Strategy
- Local storage for generated strategies
- Context-based cache keys for invalidation
- Compressed storage for large strategy documents
- TTL-based cache expiration

## Testing Strategy

### Unit Tests
- Service layer with mocked OpenRouter responses
- Hook state management and error handling
- Utility functions for content processing
- Component rendering with various states

### Integration Tests
- End-to-end generation flow
- Context integration with ListTab
- Export/import functionality
- Error scenarios and recovery

## Future Enhancements

### Planned Features
- Custom strategy templates and prompts
- Strategy comparison and versioning
- Integration with external marketing tools
- Advanced analytics and performance tracking
- Multi-language support

### Architecture Extensibility
- Plugin-based strategy types
- Configurable AI models and providers
- Custom prompt templates
- Third-party service integrations

## Migration and Deployment

### Deployment Steps
1. Create feature directory structure
2. Implement core services and hooks
3. Build UI components
4. Replace placeholder in GoToMarketV2Content.tsx
5. Add comprehensive error handling
6. Implement testing suite
7. Deploy with feature flags for gradual rollout

### Rollback Plan
- Feature flags for instant disable
- Fallback to placeholder component
- Preserved user data in local storage
- Clear error messaging during rollback

This technical specification provides a comprehensive guide for implementing the Go-to-Market V2 feature with optimal architecture, following existing patterns, and ensuring maintainability and extensibility.