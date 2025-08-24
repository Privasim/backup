# Go-to-Market V2 Feature

A comprehensive AI-powered go-to-market strategy generator that integrates with implementation plans to create actionable marketing, sales, and pricing strategies.

## Features

- **AI-Powered Generation**: Uses OpenRouter integration to generate comprehensive strategies
- **Context-Aware**: Leverages implementation plan data for relevant strategy creation
- **Interactive Management**: Mark strategies as complete, export/import data
- **Real-time Streaming**: Live progress updates during strategy generation
- **Comprehensive Coverage**: Marketing, sales, pricing, distribution, and timeline strategies
- **Export/Import**: JSON and Markdown export with clipboard support

## Architecture

### Core Components

- **GoToMarketV2Generator**: Main generation interface with options
- **StrategyDisplay**: Tabbed interface for viewing generated strategies
- **Strategy Cards**: Interactive cards for marketing, sales, and pricing strategies
- **ProgressIndicator**: Real-time generation progress display
- **ExportControls**: Export/import functionality

### Services

- **GoToMarketV2Service**: AI integration and strategy generation
- **PromptBuilder**: Constructs AI prompts from implementation context
- **StrategyProcessor**: Processes and validates AI responses

### Hooks

- **useGoToMarketV2**: Main hook for strategy management
- **useImplementationContext**: Integration with implementation plans
- **useStrategyPersistence**: Local storage and caching

## Usage

```tsx
import { GoToMarketV2Generator, StrategyDisplay } from '@/features/gotomarket-v2';

function MyComponent() {
  const { strategies, status, updateStrategy } = useGoToMarketV2();

  return (
    <div>
      <GoToMarketV2Generator />
      {strategies && (
        <StrategyDisplay 
          strategies={strategies} 
          onUpdateStrategy={updateStrategy} 
        />
      )}
    </div>
  );
}
```

## Configuration

The feature requires:
1. Valid OpenRouter API key
2. Selected AI model
3. Implementation plan context

## Data Flow

1. User configures generation options
2. System validates implementation plan context
3. AI service generates strategies using OpenRouter
4. Strategies are processed and validated
5. Results are cached locally and displayed
6. User can interact with and export strategies

## Error Handling

- Comprehensive error boundaries
- Graceful fallbacks for missing context
- User-friendly error messages
- Retry mechanisms for failed generations

## Testing

Run tests with:
```bash
npm test src/features/gotomarket-v2
```

## Performance

- React.memo for component optimization
- Lazy loading of strategy components
- Efficient re-rendering with proper dependencies
- Local caching for generated strategies