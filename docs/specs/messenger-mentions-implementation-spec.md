# Messenger @-Mentions Implementation Specification

## Overview

This specification details the implementation of an @-mention feature in the MessengerPanel component that allows users to reference and attach contextual data from various tabs (Implementation Plan, User Profile, Job Risk Analysis, etc.) to their AI conversations. When a user types "@" in the messenger input, an overlay panel appears allowing selection of available contexts, which are then attached to the message as system context for the AI.

## Requirements

### Functional Requirements
- **Trigger Detection**: Detect "@" typing in MessengerPanel textarea with proper word boundaries
- **Overlay Panel**: Display searchable list of available contexts anchored to textarea caret
- **Context Selection**: Allow keyboard navigation (↑/↓/Enter) and mouse selection
- **Data Attachment**: Fetch real contextual data from existing providers/sources (no mock data)
- **Prompt Assembly**: Attach context as system message preamble to LLM requests
- **UI Integration**: Display attachment chips, size warnings, and removal controls
- **Persistence**: Retain attachments in composer until send, optionally persist last-used

### Non-Functional Requirements
- **Performance**: Debounce searches, memoize snapshots, cap context size at 12KB
- **Security**: Sanitize attachments (remove images/links/secrets), size bounding
- **SSR Safety**: No window access in server-side rendering paths
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Error Handling**: Graceful degradation when data unavailable

### Constraints
- **No Mock Data**: All context must come from existing real data sources
- **Headless Design**: Separate UI from state management for testability
- **Independent Messenger**: Keep MessengerProvider decoupled from tab components
- **Size Limits**: Maximum 12,000 characters per attachment set

## Architecture

### Core Components
- **MentionsIndex**: Registry of mentionable entities with adapters
- **ContextAdapter**: Pure functions to fetch data from sources
- **useMentions**: Headless hook for overlay state management
- **MentionsPanel**: Presentational component for selection UI
- **PromptAssembler**: Builds LLM messages with attachments

### Data Flow
1. User types "@" → useMentions detects trigger → opens MentionsPanel
2. User selects entity → adapter fetches real data → creates Attachment
3. Attachment added to local state → displayed as chip
4. On send → PromptAssembler creates system preamble → LLM receives context

## Implementation Plan

### Phase 1: Core Infrastructure
1. Define types and entity registry
2. Implement ChatboxReader bridge for data access
3. Create basic adapter framework
4. Build headless useMentions hook

### Phase 2: Data Adapters
1. Implementation Plan adapter (highest priority)
2. User Profile adapter
3. Job Risk adapter (deferred if data not readily available)

### Phase 3: UI Integration
1. MentionsPanel component
2. MessengerPanel modifications
3. Attachment chips and controls

### Phase 4: Prompt Assembly
1. Attachment sanitization and size control
2. System message assembly
3. MessengerProvider integration

## Files to Create

### Core Infrastructure
- `src/features/messenger/mentions/entities.ts`
  - Types: MentionEntity, ContextAdapter, Attachment
  - Interface definitions for registry

- `src/features/messenger/mentions/index.ts`
  - MentionsIndex implementation
  - Entity registration and adapter wiring

- `src/features/messenger/mentions/tabsProvider.ts`
  - Tab entity definitions with labels and descriptions
  - Mapping from validTabs to adapters

### Data Adapters
- `src/features/messenger/mentions/adapters/implementationPlanAdapter.ts`
  - Fetches plan content via ChatboxReader
  - Parses markdown for Context and Phases sections

- `src/features/messenger/mentions/adapters/userProfileAdapter.ts`
  - Reads sessionStorage for profile data
  - SSR-safe implementation

- `src/features/messenger/mentions/adapters/jobRiskAdapter.ts`
  - Graceful adapter (returns null if data unavailable)
  - Plans for future cache integration

### UI Components
- `src/features/messenger/mentions/useMentions.ts`
  - Headless hook for overlay state
  - Keyboard navigation and positioning logic

- `src/features/messenger/mentions/MentionsPanel.tsx`
  - Presentational overlay component
  - Anchored positioning and accessibility

### Utilities
- `src/features/messenger/utils/chatbox-reader.ts`
  - Bridge to access ChatboxProvider state
  - Singleton registration pattern

- `src/features/messenger/utils/prompt-assembler.ts`
  - Attachment sanitization and size control
  - System message assembly

- `src/features/messenger/utils/plan-parser.ts`
  - Markdown parsing for Implementation Plan
  - Extracts Context and Phase sections

## Files to Modify

### Messenger Core
- `src/features/messenger/types.ts`
  - Add Attachment type to SendMessageOptions
  - Extend MessengerContextType if needed

- `src/features/messenger/contexts/MessengerProvider.tsx`
  - Accept attachments in sendMessage
  - Integrate prompt-assembler for LLM requests
  - Maintain existing streaming and error handling

- `src/features/messenger/components/MessengerPanel.tsx`
  - Add textarea ref for positioning
  - Integrate useMentions hook
  - Add attachment chips UI
  - Wire selection to attachment state
  - Pass attachments to sendMessage

### App Infrastructure
- `src/app/layout.tsx`
  - Mount ChatboxReaderBridge component
  - Register ChatboxReader for data access

## Data Contracts

### MentionEntity
```typescript
interface MentionEntity {
  id: string;
  kind: 'tab' | 'context';
  label: string;
  description?: string;
  source: 'tab-container' | 'profile-settings' | 'conversation-tabs';
  adapterId?: string;
}
```

### ContextAdapter
```typescript
interface ContextAdapter<TMeta = unknown> {
  id: string;
  getSnapshot: () => Promise<{ title: string; text: string; meta?: TMeta } | null>;
  supportsPartial?: boolean;
}
```

### Attachment
```typescript
type Attachment = {
  adapterId: string;
  title: string;
  text: string;
  meta?: unknown;
  createdAt: string;
};
```

### Prompt Assembly Result
```typescript
type AssembledPrompt = {
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  truncated: boolean;
  totalChars: number;
};
```

## Architecture Diagram

```mermaid
flowchart TD
  A[Textarea in MessengerPanel] -->|types '@'| B[useMentions state]
  B --> C[MentionsPanel UI]
  C -->|select entity| D[MentionsIndex]
  D -->|adapterId| E[ContextAdapter]
  E -->|getSnapshot()| F[Data Sources]
  F -->|ImplementationPlan| F1[ChatboxProvider.conversations]
  F1 -->|pure helpers| F2[plan-sync: isPlanConversation, getLatestPlanContent]
  F -->|UserProfile| F3[sessionStorage:user-profile-data]
  F -->|JobRisk future| F4[Research cache]
  E -->|snapshot| G[MessengerPanel attachments[]]
  G -->|send| H[MessengerProvider.sendMessage]
  H --> I[prompt-assembler: assemblePrompt]
  I --> J[OpenRouterClient.chat]
  J --> K[assistant stream]
  K --> L[Messenger messages UI]
```

## Security & Performance

### Security Measures
- **Content Sanitization**: Strip images, links, and potential secrets from attachments
- **Size Bounding**: Maximum 12,000 characters per attachment set
- **SSR Safety**: No window/sessionStorage access in server rendering
- **Input Validation**: Sanitize adapter IDs and entity selections

### Performance Optimizations
- **Debounced Filtering**: 150ms debounce on mention queries
- **Memoized Adapters**: Cache adapter instances and snapshots
- **Lazy Loading**: Only fetch data on explicit selection
- **Size Warnings**: UI feedback for large attachments
- **Pure Functions**: Adapters use pure data access patterns

## Testing Plan

### Unit Tests
- **useMentions**: Trigger detection, keyboard navigation, positioning
- **Adapters**: Data fetching, parsing, error handling
- **PromptAssembler**: Sanitization, truncation, message assembly
- **PlanParser**: Markdown extraction accuracy

### Integration Tests
- **MessengerPanel**: @-mention flow end-to-end
- **Data Flow**: Selection → adapter → attachment → send
- **Prompt Assembly**: System message inclusion in LLM requests

### E2E Tests
- **User Journey**: Type @, select context, attach, send, verify AI response
- **Edge Cases**: No data available, size limits, network errors
- **Accessibility**: Keyboard navigation, screen reader support

### Test Data Requirements
- **Real Data Only**: Use existing test fixtures from ChatboxProvider
- **Session Storage**: Mock for User Profile adapter tests
- **Conversations**: Use real conversation structures with plan content

## Implementation Checklist

### Pre-Implementation
- [ ] Review existing plan-sync utilities for reusability
- [ ] Confirm ChatboxReader bridge feasibility
- [ ] Validate sessionStorage access patterns
- [ ] Test markdown parsing on sample plan content

### Core Implementation
- [ ] Create entity types and registry
- [ ] Implement ChatboxReader bridge
- [ ] Build basic adapter framework
- [ ] Create useMentions hook
- [ ] Implement MentionsPanel component

### Adapter Development
- [ ] Implementation Plan adapter (parse Context + 3 Phases)
- [ ] User Profile adapter (sessionStorage read)
- [ ] Job Risk adapter (graceful null handling)

### Integration
- [ ] Modify MessengerPanel for mentions
- [ ] Update MessengerProvider for attachments
- [ ] Implement prompt assembly
- [ ] Add attachment UI controls

### Testing & Validation
- [ ] Unit test coverage for all adapters
- [ ] Integration tests for mention flow
- [ ] E2E tests for user journey
- [ ] Performance and security validation

## Success Criteria

- User can type "@implementation" and see Implementation Plan in overlay
- Selection fetches real plan content and displays as attachment chip
- AI receives context in system message and provides relevant responses
- No UI regressions in MessengerPanel or RightDock layout
- All tests pass with real data sources
- Performance remains acceptable with size limits

## Risk Mitigation

- **Data Availability**: Graceful fallbacks when contexts unavailable
- **Size Overflow**: Hard limits prevent prompt issues
- **UI Conflicts**: Test overlay positioning in RightDock
- **SSR Issues**: Comprehensive guards for browser-only features
- **Performance**: Monitor and optimize adapter fetch times

## Future Enhancements

- ContextHub centralized service for all app contexts
- Partial fetch for large contexts (summaries only)
- Persistent attachment history per conversation
- Advanced search and filtering in mentions panel
- Context preview on hover
- Multi-attachment support with priority ordering
