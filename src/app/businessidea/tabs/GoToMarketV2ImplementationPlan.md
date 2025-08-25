# Go-to-Market V2 Implementation Plan

## 1. Directory Structure Setup

```
src/
├── app/
│   └── businessidea/
│       └── tabs/
│           ├── GoToMarketV2Content.tsx (to be replaced)
│           ├── GoToMarketV2TechnicalSpec.md
│           ├── GoToMarketV2ImplementationSummary.md
│           └── goToMarketV2/
│               ├── index.ts
│               ├── types/
│               │   └── index.ts
│               ├── services/
│               │   └── goToMarketTextService.ts
│               ├── hooks/
│               │   ├── useGoToMarketV2.ts
│               │   └── useImplementationContext.ts
│               ├── components/
│               │   ├── GoToMarketV2Generator.tsx
│               │   └── StrategyDisplay.tsx
│               └── utils/
│                   └── index.ts
└── features/
    └── goToMarketV2/
        ├── index.ts
        └── context/
            └── ImplementationContext.tsx
```

## 2. Service Layer Implementation

### GoToMarketTextService

**File:** `src/app/businessidea/tabs/goToMarketV2/services/goToMarketTextService.ts`

**Dependencies:**
- OpenRouterClient from existing chatbox implementation
- Markdown processing utilities

**Key Methods:**
- `generateStrategy(context: ImplementationContext): ReadableStream`
  - Construct prompt from implementation context
  - Call OpenRouterClient with streaming enabled
  - Return raw markdown stream
- `extractSections(markdown: string): StrategySection[]`
  - Parse markdown headers to extract sections
  - Return structured sections with titles and content

**Implementation Details:**
1. Create prompt template focusing on go-to-market strategy
2. Integrate with OpenRouterClient using existing patterns
3. Implement streaming response handling
4. Add error handling and retry logic

## 3. Hook Implementation

### useGoToMarketV2 Hook

**File:** `src/app/businessidea/tabs/goToMarketV2/hooks/useGoToMarketV2.ts`

**Responsibilities:**
- Manage generation state (loading, error, progress)
- Handle streaming response from service
- Update strategy content as chunks arrive
- Provide generation controls (start, stop, retry)

**State Variables:**
- `strategyContent: string` - Accumulated markdown content
- `isLoading: boolean` - Generation in progress
- `isError: boolean` - Error occurred
- `progress: number` - Generation progress percentage
- `error: string | null` - Error message

**Methods:**
- `generateStrategy()` - Start generation process
- `resetGeneration()` - Clear current strategy

### useImplementationContext Hook

**File:** `src/app/businessidea/tabs/goToMarketV2/hooks/useImplementationContext.ts`

**Responsibilities:**
- Extract business context from ListTab implementation plan
- Validate context completeness
- Format context for strategy generation

**Implementation Details:**
1. Access ImplementationPlanContext
2. Extract relevant sections (overview, phases, KPIs)
3. Validate minimum required context
4. Format as structured data for prompt

## 4. Component Development

### GoToMarketV2Generator

**File:** `src/app/businessidea/tabs/goToMarketV2/components/GoToMarketV2Generator.tsx`

**Props:**
- None (uses hooks internally)

**Features:**
- Integration with ChatboxControls for API configuration
- Generation controls (generate, reset)
- Progress indicator during generation
- Error display with retry option
- Conditional rendering based on context availability

**UI Elements:**
1. Header with feature title and description
2. Context validation status
3. API configuration warning if needed
4. Generate button with loading state
5. Progress bar during generation
6. Error message display
7. StrategyDisplay component container

### StrategyDisplay

**File:** `src/app/businessidea/tabs/goToMarketV2/components/StrategyDisplay.tsx`

**Props:**
- `content: string` - Markdown content to display
- `isLoading: boolean` - Loading state

**Features:**
- ReactMarkdown rendering of strategy content
- Section-based navigation
- Copy to clipboard functionality
- Download as markdown file
- Responsive design

**UI Elements:**
1. Tabbed interface for sections
2. Table of contents navigation
3. Markdown content area
4. Action buttons (copy, download)
5. Loading skeleton during generation

## 5. Integration Points

### ChatboxControls Integration

**Requirements:**
- API key and model selection required
- Validation before generation
- Error handling for configuration issues

**Implementation:**
1. Use existing useChatbox hook for configuration
2. Validate API key and model before generation
3. Display configuration warnings

### ListTab Context Integration

**Requirements:**
- Extract implementation plan context
- Validate context completeness
- Format for strategy generation

**Implementation:**
1. Create ImplementationContext provider
2. Extract data from ImplementationPlanContext
3. Validate minimum required fields

### Caching Integration

**Requirements:**
- Cache generated strategies
- Invalidate cache on context changes
- Local storage persistence

**Implementation:**
1. Generate cache keys from context hash
2. Store strategies with expiration
3. Implement cache invalidation

## 6. Error Handling and Performance Optimization

### Error Handling

**Types of Errors:**
1. API configuration errors
2. Context validation errors
3. Generation errors
4. Parsing errors
5. Network errors

**Strategies:**
1. User-friendly error messages
2. Retry mechanisms
3. Graceful degradation
4. Detailed error logging

### Performance Optimization

**Techniques:**
1. Streaming for immediate feedback
2. Memoization of parsed sections
3. Lazy loading of components
4. Efficient markdown parsing
5. Cache warming for common contexts

## 7. Testing Approach

### Unit Tests

**Components:**
- GoToMarketV2Generator rendering
- StrategyDisplay markdown rendering
- Error states

**Hooks:**
- useGoToMarketV2 state management
- useImplementationContext data extraction

**Services:**
- GoToMarketTextService prompt construction
- Markdown section extraction

### Integration Tests

**Scenarios:**
- Full generation flow
- Error handling flows
- Caching behavior
- Context integration

### E2E Tests

**Flows:**
- Strategy generation from implementation plan
- UI interactions
- Download functionality

## 8. Deployment Considerations

### Feature Flag

**Implementation:**
- Use existing feature flag system
- Enable for specific user segments
- Gradual rollout

### Monitoring

**Metrics:**
- Generation success rate
- Average generation time
- Error rates
- User engagement

**Logging:**
- Generation requests
- Errors and retries
- Performance metrics

### Rollback Plan

**Steps:**
1. Disable feature flag
2. Remove UI components
3. Clean up cached data
4. Update documentation

## 9. Implementation Priority

### Phase 1: Core Infrastructure (High Priority)
1. Service layer implementation
2. Hook development
3. Context integration

### Phase 2: UI Components (High Priority)
1. GoToMarketV2Generator component
2. StrategyDisplay component
3. Basic styling

### Phase 3: Polish and Testing (Medium Priority)
1. Error handling
2. Performance optimization
3. Comprehensive testing
4. Documentation

## 10. Success Metrics

1. Strategy generation success rate > 95%
2. Average generation time < 10 seconds
3. User engagement with generated strategies
4. Error rate < 2%
5. Cache hit rate > 80%
